import { useState, useEffect, useCallback } from 'react'
import { getStudentById, getStudentWithDetails } from '../../api/crm/students/core'
import type { Student, StudentWithDetails } from '../../api/crm/students/types/models'
import { AxiosError } from 'axios'

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
 * Fetches only student basic info and details on initial load
 * Reduces initial API calls from 6 to 2
 */
export function useStudentCore(studentId: number | null): UseStudentCoreReturn {
  const [student, setStudent] = useState<Student | null>(null)
  const [details, setDetails] = useState<StudentWithDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!studentId) return

    setLoading(true)
    setError(null)

    try {
      // Fetch only 2 essential endpoints for Overview
      const [studentData, detailsData] = await Promise.all([
        getStudentById(studentId),
        getStudentWithDetails(studentId)
      ])

      setStudent(studentData)
      setDetails(detailsData)
    } catch (err) {
      const axiosErr = err as AxiosError<{ detail?: string }>
      setError(axiosErr.response?.data?.detail || 'Failed to load student data')
      console.error('Failed to load student core data:', err)
    } finally {
      setLoading(false)
    }
  }, [studentId])

  // Initial load
  useEffect(() => {
    if (studentId) {
      refresh()
    }
  }, [studentId, refresh])

  return {
    student,
    details,
    loading,
    error,
    refresh
  }
}
