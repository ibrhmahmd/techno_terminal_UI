// Waiting List Management Hook
// Provides data and operations for waiting list students

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getStudentsByStatus,
  updateStudentStatus,
  setWaitingPriority,
  type StudentWithDetails,
  type UpdateStudentStatusDTO,
} from '../api/crm'
import type { PaginationParams } from '../types/pagination'

export const waitingListKeys = {
  all: ['waiting-list'] as const,
  list: (params: PaginationParams) => ['waiting-list', 'list', params] as const,
  student: (id: number) => ['waiting-list', 'student', id] as const,
}

interface UseWaitingListReturn {
  students: StudentWithDetails[]
  total: number
  hasMore: boolean
  isLoading: boolean
  isError: boolean
  error: Error | null
}

// Get waiting list students
export function useWaitingList(params: PaginationParams = { skip: 0, limit: 50 }): UseWaitingListReturn {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: waitingListKeys.list(params),
    queryFn: async () => {
      const result = await getStudentsByStatus('waiting', params)
      // Cast items to StudentWithDetails since waiting list students have extra fields
      return {
        ...result,
        items: result.items as StudentWithDetails[],
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  })

  return {
    students: data?.items || [],
    total: data?.total || 0,
    hasMore: data?.hasMore || false,
    isLoading,
    isError,
    error: error as Error | null,
  }
}

// Update student status (e.g., waiting -> active)
export function useUpdateStudentStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ studentId, data }: { studentId: number; data: UpdateStudentStatusDTO }) =>
      updateStudentStatus(studentId, data),
    onSuccess: () => {
      // Invalidate waiting list and student queries
      queryClient.invalidateQueries({ queryKey: waitingListKeys.all })
    },
  })
}

// Set waiting priority
export function useSetWaitingPriority() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ studentId, priority }: { studentId: number; priority: number }) =>
      setWaitingPriority(studentId, { priority }),
    onSuccess: (_data, variables) => {
      // Invalidate specific student and list
      queryClient.invalidateQueries({ queryKey: waitingListKeys.student(variables.studentId) })
      queryClient.invalidateQueries({ queryKey: waitingListKeys.all })
    },
  })
}

// Move student from waiting to active
export function useActivateStudent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ studentId, notes }: { studentId: number; notes?: string }) =>
      updateStudentStatus(studentId, { status: 'active', notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: waitingListKeys.all })
    },
  })
}
