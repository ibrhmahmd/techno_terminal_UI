import { useQuery, useQueries } from '@tanstack/react-query'
import { getDailySchedule, getEnrichedGroups, getGroupSessions, type Session } from '../../api/academics'

export const dashboardKeys = {
  schedule:      (date: string) => ['dashboard', 'schedule', date] as const,
  enrichedGroups: ['dashboard', 'enrichedGroups'] as const,
  sessions:      (groupId: number) => ['dashboard', 'sessions', groupId] as const,
}

export function useDashboard(selectedDate: string) {

  // 1. Daily schedule — cached per date (5 min stale)
  const scheduleQuery = useQuery({
    queryKey: dashboardKeys.schedule(selectedDate),
    queryFn: () => getDailySchedule(selectedDate),
    staleTime: 5 * 60 * 1000,
  })

  // 2. Enriched groups — cached globally (10 min stale, changes infrequently)
  const groupsQuery = useQuery({
    queryKey: dashboardKeys.enrichedGroups,
    queryFn: getEnrichedGroups,
    staleTime: 10 * 60 * 1000,
  })

  // 3. Sessions — parallel useQueries
  const scheduleItems = scheduleQuery.data ?? []
  const uniqueGroupIds = [...new Set(scheduleItems.map(item => item.group_id))]

  const sessionQueries = useQueries({
    queries: uniqueGroupIds.map(groupId => ({
      queryKey: dashboardKeys.sessions(groupId),
      queryFn: () => getGroupSessions(groupId),
      staleTime: 5 * 60 * 1000,
    })),
  })

  // Build sessions map from parallel results
  const groupSessions: Record<number, Session[]> = {}
  uniqueGroupIds.forEach((groupId, i) => {
    const sessions = sessionQueries[i]?.data ?? []
    groupSessions[groupId] = [...sessions]
      .sort((a, b) => new Date(a.session_date).getTime() - new Date(b.session_date).getTime())
      .slice(0, 5)
  })

  const isLoading = scheduleQuery.isLoading || groupsQuery.isLoading
  const isSessionsLoading = sessionQueries.some(q => q.isLoading)
  const error = scheduleQuery.error || groupsQuery.error

  return {
    scheduleItems,
    enrichedGroups: groupsQuery.data ?? [],
    groupSessions,
    isLoading,
    isSessionsLoading,
    error: error ? 'Failed to load dashboard data.' : null,
  }
}
