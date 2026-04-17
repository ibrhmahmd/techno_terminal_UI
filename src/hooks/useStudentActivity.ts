// Student Activity History Hook
// Provides access to activity logs, enrollment history, and activity summary

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getStudentActivityHistory,
  getActivitySummary,
  getEnrollmentHistory,
  logActivity,
  type ActivityLogRequest,
} from '../api/crm'

export const activityKeys = {
  all: ['student-activity'] as const,
  history: (studentId: number, filters?: object) => ['student-activity', 'history', studentId, filters] as const,
  summary: (studentId: number, params?: object) => ['student-activity', 'summary', studentId, params] as const,
  enrollments: (studentId: number) => ['student-activity', 'enrollments', studentId] as const,
}

interface UseActivityHistoryOptions {
  activity_types?: string
  date_from?: string
  date_to?: string
  limit?: number
  enabled?: boolean
}

// Get student activity history (timeline)
export function useActivityHistory(
  studentId: number,
  options: UseActivityHistoryOptions = {}
) {
  const { enabled = true, ...params } = options

  return useQuery({
    queryKey: activityKeys.history(studentId, params),
    queryFn: () => getStudentActivityHistory(studentId, params),
    staleTime: 2 * 60 * 1000,
    enabled: enabled && studentId > 0,
  })
}

// Get activity summary (grouped by type)
export function useActivitySummary(
  studentId: number,
  params?: { date_from?: string; date_to?: string },
  enabled: boolean = true
) {
  return useQuery({
    queryKey: activityKeys.summary(studentId, params),
    queryFn: () => getActivitySummary(studentId, params),
    staleTime: 5 * 60 * 1000,
    enabled: enabled && studentId > 0,
  })
}

// Get enrollment history
export function useEnrollmentHistory(
  studentId: number,
  limit: number = 20,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: activityKeys.enrollments(studentId),
    queryFn: () => getEnrollmentHistory(studentId, limit),
    staleTime: 3 * 60 * 1000,
    enabled: enabled && studentId > 0,
  })
}

// Log manual activity
export function useLogActivity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ studentId, data }: { studentId: number; data: ActivityLogRequest }) =>
      logActivity(studentId, data),
    onSuccess: (_data, variables) => {
      // Invalidate activity queries for this student
      queryClient.invalidateQueries({
        queryKey: activityKeys.all,
      })
      queryClient.invalidateQueries({
        queryKey: activityKeys.history(variables.studentId),
      })
      queryClient.invalidateQueries({
        queryKey: activityKeys.summary(variables.studentId),
      })
    },
  })
}
