import { describe, expect, it } from 'vitest'
import type { AttendanceStatus } from '../../api/attendance'
import { ATTENDANCE_STATUSES, getNextStatus } from '../../utils/attendanceStatus'

describe('attendance status cycle', () => {
  it('contains the three attendance states in toggle order', () => {
    expect(ATTENDANCE_STATUSES).toEqual(['not_taken', 'present', 'absent'])
  })

  it('advances through the complete three-transition cycle', () => {
    expect(getNextStatus('not_taken')).toBe('present')
    expect(getNextStatus('present')).toBe('absent')
    expect(getNextStatus('absent')).toBe('not_taken')
  })

  it('falls back to not_taken for unexpected values', () => {
    const unexpectedValues: unknown[] = ['cancelled', '', 42, null, undefined]

    for (const value of unexpectedValues) {
      expect(getNextStatus(value as AttendanceStatus)).toBe('not_taken')
    }
  })
})
