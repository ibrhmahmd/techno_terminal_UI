import { useQuery } from '@tanstack/react-query'
import { getStudentWithDetails } from '../../api/crm/students/core'
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
 * Fetches details endpoint only (which includes all Student fields + extended data)
 * 
 * OPTIMIZED: Removed redundant getStudentById call since StudentWithDetails extends Student
 * Reduces API calls from 2 to 1 for initial load
 */
export function useStudentCore(studentId: number | null): UseStudentCoreReturn {
  const { 
    data: details, 
    isLoading, 
    error: queryError,
    refetch 
  } = useQuery({
    queryKey: studentId ? queryKeys.studentDetails(studentId) : ['student', 'details', 'null'],
    queryFn: async () => {
      if (!studentId) return null
      return getStudentWithDetails(studentId)
    },
    enabled: !!studentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Extract student fields from details (StudentWithDetails extends Student)
  const student: Student | null = details ? {
    id: details.id,
    full_name: details.full_name,
    date_of_birth: details.date_of_birth,
    gender: details.gender,
    phone: details.phone,
    status: details.status,
    notes: details.notes,
    is_active: details.is_active,
    created_at: details.created_at,
    updated_at: details.updated_at,
  } : null

  const loading = isLoading
  
  const error = queryError instanceof Error 
    ? queryError.message 
    : queryError 
      ? 'Failed to load student data'
      : null

  const refresh = async () => {
    await refetch()
  }

  return {
    student,
    details: details ?? null,
    loading,
    error,
    refresh
  }
}
