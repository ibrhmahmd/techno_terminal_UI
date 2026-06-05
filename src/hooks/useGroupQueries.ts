import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getGroupsPaginated,
  getGroupsGrouped,
  getGroupsByCourse,
  createGroup,
  updateGroup,
  deleteGroup,
  type GroupByField,
  type ScheduleGroupInput,
  type GroupFilterOptions,
} from '../api/academics'
import { getUpcomingDates } from '../utils/date'
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

// ── Mutations ─────────────────────────────────────────────────────────────────

/** Invalidate all group caches after any mutation */
function useGroupInvalidator() {
  const qc = useQueryClient()
  return () => {
    qc.invalidateQueries({ queryKey: groupKeys.all })
  }
}

export function useCreateGroup() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createGroup,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: groupKeys.all })
      const upcomingDates = getUpcomingDates(7)
      upcomingDates.forEach(date => {
        qc.invalidateQueries({ queryKey: queryKeys.dashboard.overview(date) })
      })
    },
  })
}

export function useUpdateGroup() {
  const invalidate = useGroupInvalidator()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ScheduleGroupInput }) => updateGroup(id, data),
    onSuccess: invalidate,
  })
}

export function useDeleteGroup() {
  const invalidate = useGroupInvalidator()
  return useMutation({ mutationFn: deleteGroup, onSuccess: invalidate })
}
