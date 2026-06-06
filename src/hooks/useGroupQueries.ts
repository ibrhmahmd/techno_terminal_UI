import { useQuery } from '@tanstack/react-query'
import {
  getGroupsPaginated,
  getGroupsGrouped,
  getGroupsByCourse,
  type GroupByField,
  type GroupFilterOptions,
} from '../api/academics'
import { queryKeys } from './queryKeys'

// ── Query Keys ──────────────────────────────────────────

export const groupKeys = {
  all:     queryKeys.groups,
  flat:    queryKeys.groupFlat,
  grouped: queryKeys.groupGrouped,
  byCourse: queryKeys.groupByCourse,
}

// ── Queries ───────────────────────────────────────────────────────────────────

/** Flat all-groups list with server-side filters (used when groupBy === null / ALL) */
export function useGroupsFlat(filters: GroupFilterOptions | undefined, enabled: boolean) {
  return useQuery({
    queryKey: groupKeys.flat(filters),
    queryFn: () => getGroupsPaginated(filters),
    staleTime: 10 * 60 * 1000,
    enabled,
  })
}

/** Grouped view (used when groupBy is day | course | instructor | status) */
export function useGroupsGrouped(groupBy: Exclude<GroupByField, null>, enabled: boolean) {
  return useQuery({
    queryKey: groupKeys.grouped(groupBy),
    queryFn: async () => {
      const result = await getGroupsGrouped(groupBy, { skip: 0, limit: 200 })
      return result.groups
    },
    staleTime: 5 * 60 * 1000,
    enabled,
  })
}

/** Get groups by course ID */
export function useGroupsByCourse(courseId: number, enabled: boolean = true) {
  return useQuery({
    queryKey: groupKeys.byCourse(courseId),
    queryFn: () => getGroupsByCourse(courseId),
    enabled: enabled && courseId > 0,
    staleTime: 5 * 60 * 1000,
  })
}


