import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getEnrichedGroups,
  getGroupsGrouped,
  searchGroups,
  getArchivedGroups,
  getGroupsByCourse,
  createGroup,
  updateGroup,
  deleteGroup,
  type GroupByField,
  type ScheduleGroupInput,
} from '../api/academics'
import { getUpcomingDates } from '../utils/date'
import { dashboardKeys } from './dashboard/useDashboard'

// ── Query Keys ──────────────────────────────────────────

export const groupKeys = {
  all:    ['groups'] as const,
  flat:   ['groups', 'flat'] as const,
  grouped: (by: GroupByField) => ['groups', 'grouped', by] as const,
  archived: ['groups', 'archived'] as const,
  byCourse: (courseId: number) => ['groups', 'by-course', courseId] as const,
  search: (query: string, status?: string) => ['groups', 'search', query, status] as const,
}

// ── Queries ───────────────────────────────────────────────────────────────────

/** Flat all-groups list (used when groupBy === null / ALL) */
export function useGroupsFlat(enabled: boolean) {
  return useQuery({
    queryKey: groupKeys.flat,
    queryFn: getEnrichedGroups,
    staleTime: 10 * 60 * 1000,
    enabled,
  })
}

/** Grouped view (used when groupBy is day | course | instructor | status) */
export function useGroupsGrouped(groupBy: Exclude<GroupByField, null>, enabled: boolean) {
  return useQuery({
    queryKey: groupKeys.grouped(groupBy),
    queryFn: async () => {
      const result = await getGroupsGrouped(groupBy, { skip: 0, limit: 50 })
      return result.groups
    },
    staleTime: 5 * 60 * 1000,
    enabled,
  })
}

/** Search groups by name (server-side) */
export function useSearchGroups(query: string, status?: 'active' | 'inactive' | 'completed', enabled: boolean = true) {
  return useQuery({
    queryKey: groupKeys.search(query, status),
    queryFn: () => searchGroups(query, status),
    enabled: enabled && query.length > 0,
    staleTime: 1 * 60 * 1000,
  })
}

/** Get archived (completed) groups */
export function useArchivedGroups(enabled: boolean = true) {
  return useQuery({
    queryKey: groupKeys.archived,
    queryFn: () => getArchivedGroups({ skip: 0, limit: 100 }),
    enabled,
    staleTime: 5 * 60 * 1000,
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
    qc.invalidateQueries({ queryKey: groupKeys.archived })
  }
}

export function useCreateGroup() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createGroup,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: groupKeys.all })
      qc.invalidateQueries({ queryKey: groupKeys.archived })
      const upcomingDates = getUpcomingDates(7)
      upcomingDates.forEach(date => {
        qc.invalidateQueries({ queryKey: dashboardKeys.overview(date) })
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
