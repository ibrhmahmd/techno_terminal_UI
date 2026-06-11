// Waiting List Management Hook
// Provides data and operations for waiting list students

import { useQuery } from '@tanstack/react-query'
import { getWaitingList, type StudentWithDetails } from '../api/crm'
import { queryKeys } from './queryKeys'
import type { PaginationParams } from '../types/pagination'

interface UseWaitingListReturn {
  students: StudentWithDetails[]
  total: number
  hasMore: boolean
  isLoading: boolean
  isError: boolean
  error: Error | null
}

// Get waiting list students
export function useWaitingList(
  params: PaginationParams = { skip: 0, limit: 50 },
  enabled = true
): UseWaitingListReturn {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.directory.waitingList.list(params),
    queryFn: async () => {
      const students = await getWaitingList(params)
      // Returns StudentWithDetails[] directly from dedicated waiting-list endpoint
      return {
        items: students,
        total: students.length,
        hasMore: false,
      }
    },
    staleTime: 3 * 60 * 1000, // 3 minutes
    enabled,
  })

  return {
    students: data?.items || [],
    total: data?.total || 0,
    hasMore: data?.hasMore || false,
    isLoading,
    isError,
    error: error ?? null,
  }
}


