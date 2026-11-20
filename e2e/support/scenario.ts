import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import type { Page } from '@playwright/test'
import { instructorName, type InstructorRole } from './env'
import { archiveGroup, createCourse, createGroup, createStudent, deleteCourse, enroll, hardDeleteStudent, NotE2eRecordError } from './ui'

export interface Student {
  id: number
  name: string
}
export interface Group {
  id: number
  name: string
  instructor: string
  students: Student[]
}
export interface Scenario {
  tag: string
  course: { id: number; name: string }
  groups: Record<InstructorRole, Group>
}

/** Ids of everything a worker created, so a crashed run can be swept later. */
interface Ledger {
  courseId?: number
  groupIds: number[]
  studentIds: number[]
}

const LEDGER_DIR = fileURLToPath(new URL('../.ledger/', import.meta.url))
const STUDENTS_PER_GROUP = 3

/** Today's weekday in Cairo, which is what the backend uses for "today". */
export function cairoWeekday(date = new Date()): string {
  return new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone: 'Africa/Cairo' }).format(date)
}

/** YYYY-MM-DD in Cairo, `offsetDays` from today. */
export function cairoDate(offsetDays = 0): string {
  const d = new Date(Date.now() + offsetDays * 86_400_000)
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Cairo' }).format(d)
}

/** Records an extra student (created outside the scenario) so an interrupted run's sweep removes it. */
export function trackStudent(tag: string, id: number): void {
  const file = `${LEDGER_DIR}${tag}.json`
  const ledger = JSON.parse(readFileSync(file, 'utf8')) as Ledger
  ledger.studentIds.push(id)
  writeFileSync(file, JSON.stringify(ledger))
}

/** Removes a student id from the worker ledger once it has been deleted. */
export function untrackStudent(tag: string, id: number): void {
  const file = `${LEDGER_DIR}${tag}.json`
  const ledger = JSON.parse(readFileSync(file, 'utf8')) as Ledger
  ledger.studentIds = ledger.studentIds.filter((x) => x !== id)
  writeFileSync(file, JSON.stringify(ledger))
}

export async function createScenario(page: Page, workerIndex: number): Promise<Scenario> {
  const tag = `e2e-${process.env.E2E_RUN_ID ?? 'local'}-w${workerIndex}`
  const ledgerFile = `${LEDGER_DIR}${tag}.json`
  const ledger: Ledger = { groupIds: [], studentIds: [] }
  const save = () => {
    mkdirSync(LEDGER_DIR, { recursive: true })
    writeFileSync(ledgerFile, JSON.stringify(ledger))
  }

  const course = await createCourse(page, `${tag}-course`)
  ledger.courseId = course.id
  save()

  // One-hour slot per worker inside the backend's 11:00-21:00 window.
  const startHour24 = 11 + (workerIndex % 9)
  const day = cairoWeekday()
  const groups = {} as Record<InstructorRole, Group>
  for (const role of ['instructor_a', 'instructor_b'] as const) {
    const instructor = instructorName(role)
    const group = await createGroup(page, { courseName: course.name, instructor, day, startHour24 })
    ledger.groupIds.push(group.id)
    save()
    const students: Student[] = []
    for (let i = 1; i <= STUDENTS_PER_GROUP; i++) {
      const student = await createStudent(page, `${tag}-${role.slice(-1)}${i}`)
      ledger.studentIds.push(student.id)
      save()
      await enroll(page, student.name, group.name)
      students.push(student)
    }
    groups[role] = { ...group, instructor, students }
  }
  return { tag, course, groups }
}

/**
 * Tries every step even if one fails, dropping ids from the ledger as they are
 * cleaned up, so a re-run only retries what is left. Returns the failures.
 */
async function destroyLedger(page: Page, ledgerFile: string): Promise<string[]> {
  const ledger = JSON.parse(readFileSync(ledgerFile, 'utf8')) as Ledger
  const save = () => writeFileSync(ledgerFile, JSON.stringify(ledger))
  const errors: string[] = []
  const attempt = async (label: string, fn: () => Promise<void>, done: () => void) => {
    try {
      await fn()
      done()
      save()
    } catch (err) {
      if (err instanceof NotE2eRecordError) {
        // Not ours (or already gone): never touch it, and stop retrying it.
        console.warn(`e2e teardown: skipping ${label}: ${err.message}`)
        done()
        save()
        return
      }
      errors.push(`${label}: ${err instanceof Error ? err.message.split('\n')[0] : String(err)}`)
    }
  }
  // Students first: their hard delete removes attendance, so nothing blocks later steps.
  for (const id of [...ledger.studentIds]) {
    await attempt(`student ${id}`, () => hardDeleteStudent(page, id), () => {
      ledger.studentIds = ledger.studentIds.filter((x) => x !== id)
    })
  }
  for (const id of [...ledger.groupIds]) {
    await attempt(`group ${id}`, () => archiveGroup(page, id), () => {
      ledger.groupIds = ledger.groupIds.filter((x) => x !== id)
    })
  }
  const courseId = ledger.courseId
  if (courseId) {
    await attempt(`course ${courseId}`, () => deleteCourse(page, courseId), () => {
      ledger.courseId = undefined
    })
  }
  if (errors.length === 0) rmSync(ledgerFile)
  return errors
}

export async function destroyScenario(page: Page, scenario: Scenario): Promise<void> {
  const errors = await destroyLedger(page, `${LEDGER_DIR}${scenario.tag}.json`)
  if (errors.length) throw new Error(`E2E teardown incomplete (run e2e:sweep):\n${errors.join('\n')}`)
}

/**
 * Cleans up whatever earlier, interrupted runs left behind. Ledgers that still
 * fail (e.g. a record already removed by hand) are reported and kept.
 */
export async function sweepLedgers(page: Page): Promise<{ swept: string[]; failed: string[] }> {
  let files: string[] = []
  try {
    files = readdirSync(LEDGER_DIR).filter((f) => f.endsWith('.json'))
  } catch {
    return { swept: [], failed: [] }
  }
  const failed: string[] = []
  for (const file of files) {
    const errors = await destroyLedger(page, `${LEDGER_DIR}${file}`)
    if (errors.length) failed.push(`${file}: ${errors.join('; ')}`)
  }
  return { swept: files, failed }
}
