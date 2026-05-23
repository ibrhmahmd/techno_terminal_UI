import { useQuery } from '@tanstack/react-query'
import { getDashboardOverview } from '../../api/dashboard'
import type { DashboardDailyOverviewDTO } from '../../api/dashboard'

export const dashboardKeys = {
  overview: (date: string) => ['dashboard', 'overview', date] as const,
  schedule: (date: string) => ['dashboard', 'schedule', date] as const,
  sessions: (groupId: number) => ['dashboard', 'sessions', groupId] as const,
}

/**
 * Get consolidated dashboard data
 * Uses the new optimized endpoint that returns groups, instructors, 
 * sessions, and attendance in a single request
 * 
 * @param selectedDate - Date in YYYY-MM-DD format
 * @see docs/api/dashboard-api.md
 */
export function useDashboard(selectedDate: string) {
  const { data, isLoading, error } = useQuery<DashboardDailyOverviewDTO>({
    queryKey: dashboardKeys.overview(selectedDate),
    queryFn: async () => {
      const result = await getDashboardOverview({ date: selectedDate, include_attendance: true })
      if (import.meta.env.DEV) {
        console.log('[DEBUG Dashboard] Raw API response:', {
          date: selectedDate,
          scheduledGroups: result.scheduled_groups?.map(sg => ({
            groupId: sg.group_id,
            level: sg.current_level?.level_number,
            sessions: sg.current_level?.sessions?.map(s => ({
              sessionId: s.session_id,
              attendanceCount: s.attendance?.length || 0,
              presentCount: s.attendance?.filter(a => a.status === 'present').length || 0,
              absentCount: s.attendance?.filter(a => a.status === 'absent').length || 0,
              cancelledCount: s.attendance?.filter(a => a.status === 'cancelled').length || 0,
            }))
          }))
        })
      }
      return result
    },
    staleTime: 5 * 60 * 1000, // 5 minutes, matching API cache_ttl
    enabled: !!selectedDate,
  })

  return {
    // Raw data from API
    data,
    isLoading,
    error: error ? 'Failed to load dashboard data.' : null,
    
    // Convenience accessors for backward compatibility
    scheduleItems: data?.scheduled_groups ?? [],
    groups: data?.groups ?? {},
    instructors: data?.instructors ?? {},
    summary: data?.summary,
  }
}
