import { useQueries } from '@tanstack/react-query'
import { getStudentById, getStudentWithDetails } from '../../api/crm/students/core'
import type { Student, StudentWithDetails } from '../../api/crm/students/types/models'
import { queryKeys } from '../queryKeys'

interface UseStudentCoreReturn {
  // Core data (loaded immediately)
  student: Student | null
  details: StudentWithDetails | null

  // Loading state
  loading: boolean

  // Error state
  error: string | null

  // Actions
  refresh: () => Promise<void>
}

/**
 * Hook for loading core student data (Overview tab)
 * Uses React Query for caching and automatic background updates
 * Fetches student basic info and details in parallel
 */
export function useStudentCore(studentId: number | null): UseStudentCoreReturn {
  const queries = useQueries({
    queries: [
      {
        queryKey: studentId ? queryKeys.student(studentId) : ['student', 'null'],
        queryFn: async () => {
          if (!studentId) return null
          return getStudentById(studentId)
        },
        enabled: !!studentId,
        staleTime: 5 * 60 * 1000, // 5 minutes
      },
      {
        queryKey: studentId ? queryKeys.studentDetails(studentId) : ['student', 'details', 'null'],
        queryFn: async () => {
          if (!studentId) return null
          return getStudentWithDetails(studentId)
        },
        enabled: !!studentId,
        staleTime: 5 * 60 * 1000, // 5 minutes
      }
    ]
  })

  const [studentQuery, detailsQuery] = queries
  
  const student = studentQuery.data || null
  const details = detailsQuery.data || null
  const loading = studentQuery.isLoading || detailsQuery.isLoading
  
  // Combine errors from both queries
  const error = studentQuery.error || detailsQuery.error
    ? (studentQuery.error instanceof Error ? studentQuery.error.message : 
       detailsQuery.error instanceof Error ? detailsQuery.error.message : 
       'Failed to load student data')
    : null

  const refresh = async () => {
    await Promise.all([
      studentQuery.refetch(),
      detailsQuery.refetch()
    ])
  }

  return {
    student,
    details,
    loading,
    error,
    refresh
  }
}
