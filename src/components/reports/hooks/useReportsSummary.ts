import { useQuery } from '@tanstack/react-query'
import { getDashboardOverview, type DashboardDailyOverviewDTO } from '../../../api/dashboard'
import type { DashboardSummaryPublic } from '../../../api/analytics'
import { queryKeys } from '../../../hooks/queryKeys'

// Transform new dashboard data to legacy format for Reports page compatibility
function transformToLegacySummary(data: DashboardDailyOverviewDTO | undefined): DashboardSummaryPublic | null {
  if (!data) return null

  // Calculate total students across all scheduled groups
  const totalStudents = data.scheduled_groups.reduce((sum, group) => {
    return sum + (group.roster?.length || 0)
  }, 0)

  // Get today's sessions from scheduled groups
  const sessions = data.scheduled_groups
    .filter(sg => sg.today_session !== null)
    .map(sg => ({
      session_id: sg.today_session!.session_id,
      session_date: data.date,
      start_time: sg.today_session!.time_start,
      end_time: sg.today_session!.time_end,
      session_number: 0, // Not available in new API
      level_number: sg.current_level.level_number,
      group_id: sg.group_id,
      course_name: data.groups[sg.group_id]?.course_name || '',
      group_name: data.groups[sg.group_id]?.name || '',
      instructor_name: data.groups[sg.group_id]?.instructor_id
        ? data.instructors[data.groups[sg.group_id]!.instructor_id!]?.name || ''
        : '',
      present: 0, // Would need to calculate from attendance
      absent: 0,
      unmarked: 0,
      total_enrolled: sg.roster?.length || 0,
    }))

  return {
    active_enrollments: totalStudents,
    today_sessions_count: data.summary.total_groups_today,
    sessions,
  }
}

interface UseReportsSummaryResult {
  summary: DashboardSummaryPublic | null
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

/**
 * Hook for Reports page summary data
 * Uses the new consolidated dashboard endpoint and transforms data to legacy format
 * for backward compatibility with existing components
 */
export function useReportsSummary(): UseReportsSummaryResult {
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0]

  const { data, isLoading, error, refetch } = useQuery<DashboardDailyOverviewDTO>({
    queryKey: queryKeys.reports.summary(today),
    queryFn: () => getDashboardOverview({ date: today, include_attendance: false }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const summary = transformToLegacySummary(data)

  return {
    summary,
    isLoading,
    error: error instanceof Error ? error : error ? new Error(String(error)) : null,
    refetch,
  }
}
