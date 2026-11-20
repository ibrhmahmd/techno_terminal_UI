import { expect, type Page, type Response } from '@playwright/test'

/** Waits for one API call made by the UI and returns its `data` payload. */
export async function captureApi<T>(page: Page, method: string, path: RegExp, action: () => Promise<void>): Promise<T> {
  const responsePromise = page.waitForResponse(
    (r: Response) => r.request().method() === method && path.test(new URL(r.url()).pathname),
  )
  await action()
  const response = await responsePromise
  const body = await response.json().catch(() => null)
  expect(response.ok(), `${method} ${response.url()} -> ${response.status()} ${JSON.stringify(body)}`).toBeTruthy()
  return (body?.data ?? body) as T
}

export function escapeRegExp(text: string): RegExp {
  return new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
}

// ---- create ---------------------------------------------------------------

export async function createCourse(page: Page, name: string): Promise<{ id: number; name: string }> {
  await page.goto('/courses')
  await page.getByRole('button', { name: 'Create Course' }).first().click()
  const dialog = page.getByRole('dialog')
  await dialog.locator('#name').fill(name)
  await dialog.locator('#price_per_level').fill('100')
  await dialog.locator('#sessions_per_level').fill('4')
  await dialog.locator('#max_levels').fill('1')
  const course = await captureApi<{ id: number }>(page, 'POST', /\/academics\/courses\/?$/, () =>
    dialog.getByRole('button', { name: 'Create Course' }).click(),
  )
  await expect(dialog).toBeHidden()
  return { id: course.id, name }
}

export interface GroupInput {
  courseName: string
  instructor: string
  day: string // English weekday, e.g. "Saturday"
  startHour24: number // 11..20, one-hour slot
}

function to12h(hour24: number): { hour: string; period: 'AM' | 'PM' } {
  return { hour: String(hour24 % 12 || 12), period: hour24 >= 12 ? 'PM' : 'AM' }
}

export async function createGroup(page: Page, input: GroupInput): Promise<{ id: number; name: string }> {
  await page.goto('/groups')
  await page.getByRole('button', { name: 'Create Group' }).first().click()
  const dialog = page.getByRole('dialog')
  // Required by the form, replaced by the backend with "<Course> - <Day> <time>".
  await dialog.locator('#name').fill(`${input.courseName} group`)
  await dialog.getByPlaceholder('Search courses...').fill(input.courseName)
  await dialog.getByRole('option').filter({ hasText: input.courseName }).first().click()
  await dialog.getByPlaceholder('Search instructors...').fill(input.instructor)
  await dialog.getByRole('option').filter({ hasText: input.instructor }).first().click()
  await dialog.locator('#default_day').selectOption({ label: input.day })
  const start = to12h(input.startHour24)
  const end = to12h(input.startHour24 + 1)
  await dialog.getByLabel('Start hour').selectOption(start.hour)
  await dialog.getByLabel('Start minute').selectOption('00')
  await dialog.getByLabel('Start period').selectOption(start.period)
  await dialog.getByLabel('End hour').selectOption(end.hour)
  await dialog.getByLabel('End minute').selectOption('00')
  await dialog.getByLabel('End period').selectOption(end.period)
  const group = await captureApi<{ id: number; name: string }>(page, 'POST', /\/academics\/groups\/?$/, () =>
    dialog.getByRole('button', { name: 'Create Group' }).click(),
  )
  await expect(dialog).toBeHidden()
  return { id: group.id, name: group.name }
}

export async function createStudent(page: Page, fullName: string): Promise<{ id: number; name: string }> {
  await page.goto('/directory')
  await page.getByRole('button', { name: 'Add Student' }).first().click()
  const dialog = page.getByRole('dialog')
  await fillStudentForm(dialog, fullName)
  const student = await captureApi<{ id: number }>(page, 'POST', /\/crm\/students\/?$/, () =>
    dialog.getByRole('button', { name: 'Create Student' }).click(),
  )
  await expect(dialog).toBeHidden()
  return { id: student.id, name: fullName }
}

export async function fillStudentForm(dialog: ReturnType<Page['getByRole']>, fullName: string) {
  await dialog.locator('#full_name').fill(fullName)
  await dialog.getByRole('radio', { name: 'Male' }).click()
}

export async function enroll(page: Page, studentName: string, groupName: string): Promise<void> {
  await page.goto('/enrollments?tab=create')
  await page.getByLabel('Search student').fill(studentName)
  await page.getByRole('listbox', { name: 'Student results' }).getByText(studentName).first().click()
  await page.getByLabel('Search group').fill(groupName)
  await page.getByRole('listbox', { name: 'Group results' }).getByText(groupName).first().click()
  await captureApi(page, 'POST', /\/enrollments\/?$/, () =>
    page.getByRole('button', { name: 'Enroll Student' }).click(),
  )
}

// ---- teardown -------------------------------------------------------------

/** Soft delete, then permanent delete (removes enrollments, attendance, payments). */
export async function hardDeleteStudent(page: Page, studentId: number): Promise<void> {
  await page.goto(`/students/${studentId}`)
  const deletePermanently = page.getByRole('button', { name: 'Delete Permanently' })
  const softDelete = page.getByRole('button', { name: 'Delete', exact: true })
  await expect(deletePermanently.or(softDelete).first()).toBeVisible()
  if (!(await deletePermanently.isVisible())) {
    await softDelete.click()
    const dialog = page.getByRole('dialog', { name: 'Delete Student' })
    await captureApi(page, 'DELETE', new RegExp(`/crm/students/${studentId}/soft$`), () =>
      dialog.getByRole('button', { name: 'Delete', exact: true }).click(),
    )
    await page.goto(`/students/${studentId}`)
  }
  await deletePermanently.click()
  const confirm = page.getByRole('dialog', { name: 'Permanently Delete Student' })
  await captureApi(page, 'DELETE', new RegExp(`/crm/students/${studentId}/hard$`), () =>
    confirm.getByRole('button', { name: 'Delete Permanently' }).click(),
  )
}

export async function archiveGroup(page: Page, groupId: number): Promise<void> {
  await page.goto(`/groups/${groupId}`)
  await page.getByRole('button', { name: 'Archive Group' }).click()
  await captureApi(page, 'PATCH', new RegExp(`/academics/groups/${groupId}/archive$`), () =>
    page.getByRole('alertdialog').getByRole('button', { name: 'Archive', exact: true }).click(),
  )
}

/** Archives the course (the backend's DELETE is a soft delete). */
export async function deleteCourse(page: Page, courseId: number): Promise<void> {
  await page.goto(`/courses/${courseId}`)
  await page.getByRole('button', { name: 'Delete', exact: true }).first().click()
  await captureApi(page, 'DELETE', new RegExp(`/academics/courses/${courseId}$`), () =>
    page.getByRole('alertdialog').getByRole('button', { name: 'Delete', exact: true }).click(),
  )
}
