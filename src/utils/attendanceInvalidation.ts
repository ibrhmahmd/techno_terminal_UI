import type { QueryClient } from '@tanstack/react-query'
import { queryKeys } from '../hooks/queryKeys'

export interface InvalidateSessionCachesOptions {
  groupId: number
  level?: number | null
  selectedDate?: string
}

/**
 * Invalidate every cache that depends on a session/attendance change.
 *
 * - groupLevels(groupId): always
 * - groupAttendance(groupId, level): when a level is known
 * - dashboard.overview(selectedDate): when editing from the dashboard surface
 *
 * Centralized here so no surface can ever forget groupAttendance and leave the
 * group-detail grid stale after a session lifecycle mutation.
 */
export function invalidateSessionCaches(
  qc: QueryClient,
  opts: InvalidateSessionCachesOptions,
): Promise<unknown> {
  const { groupId, level, selectedDate } = opts
  return Promise.all([
    selectedDate
      ? qc.invalidateQueries({ queryKey: queryKeys.dashboard.overview(selectedDate) })
      : Promise.resolve(),
    level != null
      ? qc.invalidateQueries({ queryKey: queryKeys.groupAttendance(groupId, level) })
      : Promise.resolve(),
    qc.invalidateQueries({ queryKey: queryKeys.groupLevels(groupId) }),
  ])
}
