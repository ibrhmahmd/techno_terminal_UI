import { useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getStudentEnrollments } from '../../api/enrollments/enrollments'
import { queryKeys } from '../queryKeys'
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
  enrollments: StudentEnrollmentInfo[]
  studentBalance: StudentBalance | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

function mapEnrollments(enrollmentsData: Enrollment[]): StudentEnrollmentInfo[] {
  return enrollmentsData.map((e: Enrollment) => ({
    enrollment_id: e.id,
    group_id: e.group_id,
    group_name: e.group_name || `Group #${e.group_id}`,
    level_number: e.level_number,
    amount_due: e.amount_due,
    discount_applied: e.discount_applied,
    amount_paid: 0,
    remaining_balance: e.amount_remaining !== undefined
      ? e.amount_remaining
      : e.amount_due - e.discount_applied,
  }))
}

export function useStudentEnrollments(studentId: number | null): UseStudentEnrollmentsReturn {
  const query = useQuery({
    queryKey: queryKeys.finance.studentEnrollments(studentId ?? 0),
    queryFn: () => getStudentEnrollments(studentId!),
    enabled: !!studentId,
    staleTime: 2 * 60 * 1000,
  })

  const enrollments = query.data ? mapEnrollments(query.data) : []
  const error = query.error instanceof Error ? query.error.message : null

  const refresh = useCallback(async () => {
    await query.refetch()
  }, [query])

  return {
    enrollments,
    studentBalance: null,
    loading: query.isLoading,
    error,
    refresh,
  }
}
