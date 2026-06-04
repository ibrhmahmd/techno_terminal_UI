// Student Activity History Hook
// Provides access to activity logs, enrollment history, competition history, and activity summary
// @see docs/api/crm/student_history.md

import { useQuery, useMutation, useQueryClient, type UseQueryResult } from '@tanstack/react-query'
import {
  getStudentActivityHistory,
  getActivitySummary,
  getEnrollmentHistory,
  logActivity,
  updateActivity,
  deleteActivity,
  type ActivityLogRequest,
  type ActivityLogUpdateRequest,
} from '../api/crm'
import type { PaginatedEnrollmentHistory } from '../api/crm'

export const activityKeys = {
  all: ['student-activity'] as const,
  history: (studentId: number, filters?: Record<string, unknown>) => ['student-activity', 'history', studentId, filters] as const,
  summary: (studentId: number, params?: Record<string, unknown>) => ['student-activity', 'summary', studentId, params] as const,
  enrollments: (studentId: number, params?: Record<string, unknown>) => ['student-activity', 'enrollments', studentId, params] as const,
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

// Get enrollment history with pagination
export function useEnrollmentHistory(
  studentId: number,
  params?: { skip?: number; limit?: number },
  enabled: boolean = true
): UseQueryResult<PaginatedEnrollmentHistory> {
  return useQuery<PaginatedEnrollmentHistory>({
    queryKey: activityKeys.enrollments(studentId, params),
    queryFn: () => getEnrollmentHistory(studentId, params),
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
        queryKey: ['student-activity', 'history', variables.studentId],
      })
      queryClient.invalidateQueries({
        queryKey: ['student-activity', 'summary', variables.studentId],
      })
    },
  })
}

// Update manual activity
export function useUpdateActivity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      studentId,
      activityId,
      data,
    }: {
      studentId: number
      activityId: number
      data: ActivityLogUpdateRequest
    }) => updateActivity(studentId, activityId, data),
    onSuccess: (_data, variables) => {
      // Invalidate activity queries for this student
      queryClient.invalidateQueries({
        queryKey: activityKeys.all,
      })
      queryClient.invalidateQueries({
        queryKey: ['student-activity', 'history', variables.studentId],
      })
      queryClient.invalidateQueries({
        queryKey: ['student-activity', 'summary', variables.studentId],
      })
    },
  })
}

// Delete manual activity
export function useDeleteActivity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      studentId,
      activityId,
    }: {
      studentId: number
      activityId: number
    }) => deleteActivity(studentId, activityId),
    onSuccess: (_data, variables) => {
      // Invalidate activity queries for this student
      queryClient.invalidateQueries({
        queryKey: activityKeys.all,
      })
      queryClient.invalidateQueries({
        queryKey: ['student-activity', 'history', variables.studentId],
      })
      queryClient.invalidateQueries({
        queryKey: ['student-activity', 'summary', variables.studentId],
      })
    },
  })
}
