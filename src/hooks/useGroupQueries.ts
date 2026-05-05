import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getEnrichedGroups,
  getGroupsGrouped,
  getGroupsWithCompetitions,
  createGroup,
  updateGroup,
  deleteGroup,
  type GroupByField,
} from '../api/academics'
import { getUpcomingDates } from '../utils/date'
import { dashboardKeys } from './dashboard/useDashboard'

// ── Query Keys ──────────────────────────────────────────

export const groupKeys = {
  all:    ['groups'] as const,
  flat:   ['groups', 'flat'] as const,
  grouped: (by: GroupByField) => ['groups', 'grouped', by] as const,
}

// ── Queries ───────────────────────────────────────────────────────────────────

/** Flat all-groups list (used when groupBy === null / ALL) */
export function useGroupsFlat(enabled: boolean) {
  return useQuery({
    queryKey: groupKeys.flat,
    queryFn: getEnrichedGroups,
    staleTime: 10 * 60 * 1000,   // Groups rarely change — 10 min
    enabled,
  })
}

/** Grouped view (used when groupBy is day | course | instructor | status | competition) */
export function useGroupsGrouped(groupBy: Exclude<GroupByField, null>, enabled: boolean) {
  return useQuery({
    queryKey: groupKeys.grouped(groupBy),
    queryFn: async () => {
      if (groupBy === 'competition') {
        const groups = await getGroupsWithCompetitions()
        const inComp = groups.filter(g => g.is_in_competition)
        const notIn  = groups.filter(g => !g.is_in_competition)
        return [
          { key: 'in_competition',     label: 'In Competition',     count: inComp.length, groups: inComp },
          { key: 'not_in_competition', label: 'Not in Competition', count: notIn.length,  groups: notIn },
        ]
      }
      const result = await getGroupsGrouped(groupBy, { skip: 0, limit: 50 })
      return result.groups
    },
    staleTime: 5 * 60 * 1000,
    enabled,
  })
}

// ── Mutations ─────────────────────────────────────────────────────────────────

/** Invalidate all group caches after any mutation */
function useGroupInvalidator() {
  const qc = useQueryClient()
  return () => qc.invalidateQueries({ queryKey: groupKeys.all })
}

export function useCreateGroup() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createGroup,
    onSuccess: () => {
      // Invalidate groups list
      qc.invalidateQueries({ queryKey: groupKeys.all })
      
      // ALSO invalidate dashboard cache for upcoming dates
      const upcomingDates = getUpcomingDates(7)
      upcomingDates.forEach(date => {
        qc.invalidateQueries({ queryKey: dashboardKeys.overview(date) })
      })
      
      console.log('[useCreateGroup] Invalidated dashboard cache for dates:', upcomingDates)
    },
  })
}

export function useUpdateGroup() {
  const invalidate = useGroupInvalidator()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateGroup(id, data),
    onSuccess: invalidate,
  })
}

export function useDeleteGroup() {
  const invalidate = useGroupInvalidator()
  return useMutation({ mutationFn: deleteGroup, onSuccess: invalidate })
}
