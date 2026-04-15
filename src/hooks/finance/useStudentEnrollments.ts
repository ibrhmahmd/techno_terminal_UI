/**
 * Hook for fetching student enrollment information with balance
 * Used in Create Receipt to show available enrollments for payment
 */

import { useState, useEffect, useCallback } from 'react'
import { getStudentEnrollments } from '../../api/enrollments/enrollments'
import type { Enrollment } from '../../api/enrollments/types'
import type { StudentBalance } from '../../api/crm/students/types/finance'

export interface StudentEnrollmentInfo {
  enrollment_id: number
  group_id: number
  group_name: string
  level_number: number
  amount_due: number
  discount_applied: number
  amount_paid: number
  remaining_balance: number
}

export interface UseStudentEnrollmentsReturn {
  // Data
  enrollments: StudentEnrollmentInfo[]
  studentBalance: StudentBalance | null

  // Loading state
  loading: boolean

  // Error state
  error: string | null

  // Actions
  refresh: () => Promise<void>
}

/**
 * Hook for loading student enrollments with balance info
 * Used to populate enrollment selection dropdown in Create Receipt
 */
export function useStudentEnrollments(studentId: number | null): UseStudentEnrollmentsReturn {
  const [enrollments, setEnrollments] = useState<StudentEnrollmentInfo[]>([])
  const [studentBalance, setStudentBalance] = useState<StudentBalance | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!studentId) {
      setEnrollments([])
      setStudentBalance(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const data = await getStudentEnrollments(studentId)
      const enrollmentsData: Enrollment[] = data.data || []

      // Debug: Verify API response structure
      console.log('[useStudentEnrollments] API response:', {
        count: enrollmentsData.length,
        sample: enrollmentsData[0] ? {
          id: enrollmentsData[0].id,
          group_id: enrollmentsData[0].group_id,
          group_name: enrollmentsData[0].group_name,
          level_number: enrollmentsData[0].level_number,
          amount_due: enrollmentsData[0].amount_due,
        } : null
      })

      // Map Enrollment to our simplified format
      // Note: The enrollment endpoint doesn't include payment data,
      // so we calculate remaining_balance based on amount_due
      const enrollmentList = enrollmentsData.map((e: Enrollment) => ({
        enrollment_id: e.id,
        group_id: e.group_id,
        group_name: e.group_name || `Group #${e.group_id}`,
        level_number: e.level_number,
        amount_due: e.amount_due,
        discount_applied: e.discount_applied,
        amount_paid: 0, // Will be updated when we fetch balance separately if needed
        remaining_balance: e.amount_due - e.discount_applied // Simplified calculation
      }))

      setEnrollments(enrollmentList)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load enrollments'
      setError(errorMsg)
      setEnrollments([])
      setStudentBalance(null)
    } finally {
      setLoading(false)
    }
  }, [studentId])

  // Auto-fetch when studentId changes
  useEffect(() => {
    if (studentId) {
      refresh()
    } else {
      setEnrollments([])
      setStudentBalance(null)
      setError(null)
    }
  }, [studentId, refresh])

  return {
    enrollments,
    studentBalance,
    loading,
    error,
    refresh
  }
}
