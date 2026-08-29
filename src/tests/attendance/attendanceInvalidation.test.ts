import { describe, expect, it, vi } from 'vitest'
import { QueryClient } from '@tanstack/react-query'
import { invalidateSessionCaches } from '../../utils/attendanceInvalidation'

function makeClient() {
  const qc = new QueryClient()
  const spy = vi
    .spyOn(qc, 'invalidateQueries')
    .mockResolvedValue(undefined as never)
  return { qc, spy }
}

describe('invalidateSessionCaches', () => {
  it('invalidates groupAttendance + groupLevels for a group-detail (no selectedDate) mutation', async () => {
    const { qc, spy } = makeClient()

    await invalidateSessionCaches(qc, { groupId: 5, level: 2 })

    const keys = spy.mock.calls.map((c) => c[0].queryKey)
    expect(keys).toContainEqual(['groups', 5, 'attendance', 2])
    expect(keys).toContainEqual(['groups', 5, 'levels'])
  })

  it('invalidates dashboard.overview when selectedDate is set', async () => {
    const { qc, spy } = makeClient()

    await invalidateSessionCaches(qc, { groupId: 5, level: 2, selectedDate: '2026-08-29' })

    const keys = spy.mock.calls.map((c) => c[0].queryKey)
    expect(keys).toContainEqual(['dashboard', 'overview', '2026-08-29'])
  })

  it('skips groupAttendance when level is null/undefined', async () => {
    const { qc, spy } = makeClient()

    await invalidateSessionCaches(qc, { groupId: 5, level: null })

    const keys = spy.mock.calls.map((c) => c[0].queryKey)
    expect(keys).not.toContainEqual(expect.arrayContaining(['groups', 5, 'attendance']))
  })

  it('always invalidates groupLevels', async () => {
    const { qc, spy } = makeClient()

    await invalidateSessionCaches(qc, { groupId: 5 })

    const keys = spy.mock.calls.map((c) => c[0].queryKey)
    expect(keys).toContainEqual(['groups', 5, 'levels'])
  })
})
