import { useState, useCallback } from 'react'
import { queryClient } from '../../lib/queryClient'
import {
  getStudentBalance,
  getEnrollmentBalance,
  getUnpaidEnrollments,
  adjustStudentBalance,
} from '../../api/finance'
import type {
  StudentBalance,
  EnrollmentBalance,
  UnpaidEnrollment,
  BalanceAdjustmentResult,
} from '../../api/crm/students/types/finance'
import type { BalanceAdjustmentDTO } from '../../api/crm/students/types/inputs'
import type { PaginationParams, PaginationResult } from '../../types/pagination'

export interface UseBalanceResult {
  // Data
  balance: StudentBalance | null
  enrollmentBalance: EnrollmentBalance | null
  unpaidEnrollments: PaginationResult<UnpaidEnrollment> | null
  adjustmentResult: BalanceAdjustmentResult | null

  // Loading states
  isLoadingBalance: boolean
  isLoadingEnrollmentBalance: boolean
  isLoadingUnpaidEnrollments: boolean
  isAdjusting: boolean

  // Errors
  balanceError: Error | null
  enrollmentBalanceError: Error | null
  unpaidEnrollmentsError: Error | null
  adjustError: Error | null

  // Actions
  fetchBalance: (studentId: number, useMaterialized?: boolean) => Promise<StudentBalance>
  fetchEnrollmentBalance: (studentId: number, enrollmentId: number) => Promise<EnrollmentBalance>
  fetchUnpaidEnrollments: (params?: PaginationParams & { group_id?: number }) => Promise<PaginationResult<UnpaidEnrollment>>
  adjustBalance: (studentId: number, data: BalanceAdjustmentDTO) => Promise<BalanceAdjustmentResult>

  // Utils
  clearErrors: () => void
  clearAdjustmentResult: () => void
}

export function useBalance(): UseBalanceResult {
  // Data states
  const [balance, setBalance] = useState<StudentBalance | null>(null)
  const [enrollmentBalance, setEnrollmentBalance] = useState<EnrollmentBalance | null>(null)
  const [unpaidEnrollments, setUnpaidEnrollments] = useState<PaginationResult<UnpaidEnrollment> | null>(null)
  const [adjustmentResult, setAdjustmentResult] = useState<BalanceAdjustmentResult | null>(null)

  // Loading states
  const [isLoadingBalance, setIsLoadingBalance] = useState(false)
  const [isLoadingEnrollmentBalance, setIsLoadingEnrollmentBalance] = useState(false)
  const [isLoadingUnpaidEnrollments, setIsLoadingUnpaidEnrollments] = useState(false)
  const [isAdjusting, setIsAdjusting] = useState(false)

  // Error states
  const [balanceError, setBalanceError] = useState<Error | null>(null)
  const [enrollmentBalanceError, setEnrollmentBalanceError] = useState<Error | null>(null)
  const [unpaidEnrollmentsError, setUnpaidEnrollmentsError] = useState<Error | null>(null)
  const [adjustError, setAdjustError] = useState<Error | null>(null)

  const fetchBalance = useCallback(async (studentId: number, useMaterialized: boolean = true) => {
    setIsLoadingBalance(true)
    setBalanceError(null)
    try {
      const data = await getStudentBalance(studentId, useMaterialized)
      setBalance(data)
      return data
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Failed to fetch balance')
      setBalanceError(error)
      throw error
    } finally {
      setIsLoadingBalance(false)
    }
  }, [])

  const fetchEnrollmentBalance = useCallback(async (studentId: number, enrollmentId: number) => {
    setIsLoadingEnrollmentBalance(true)
    setEnrollmentBalanceError(null)
    try {
      const data = await getEnrollmentBalance(studentId, enrollmentId)
      setEnrollmentBalance(data)
      return data
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Failed to fetch enrollment balance')
      setEnrollmentBalanceError(error)
      throw error
    } finally {
      setIsLoadingEnrollmentBalance(false)
    }
  }, [])

  const fetchUnpaidEnrollments = useCallback(async (params: PaginationParams & { group_id?: number } = {}) => {
    setIsLoadingUnpaidEnrollments(true)
    setUnpaidEnrollmentsError(null)
    try {
      const data = await getUnpaidEnrollments(params)
      setUnpaidEnrollments(data)
      return data
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Failed to fetch unpaid enrollments')
      setUnpaidEnrollmentsError(error)
      throw error
    } finally {
      setIsLoadingUnpaidEnrollments(false)
    }
  }, [])

  const adjustBalance = useCallback(async (studentId: number, data: BalanceAdjustmentDTO) => {
    setIsAdjusting(true)
    setAdjustError(null)
    try {
      const result = await adjustStudentBalance(studentId, data)
      setAdjustmentResult(result)
      queryClient.invalidateQueries({ queryKey: ['finance', 'metrics'] })
      return result
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Failed to adjust balance')
      setAdjustError(error)
      throw error
    } finally {
      setIsAdjusting(false)
    }
  }, [])

  const clearErrors = useCallback(() => {
    setBalanceError(null)
    setEnrollmentBalanceError(null)
    setUnpaidEnrollmentsError(null)
    setAdjustError(null)
  }, [])

  const clearAdjustmentResult = useCallback(() => {
    setAdjustmentResult(null)
  }, [])

  return {
    // Data
    balance,
    enrollmentBalance,
    unpaidEnrollments,
    adjustmentResult,

    // Loading states
    isLoadingBalance,
    isLoadingEnrollmentBalance,
    isLoadingUnpaidEnrollments,
    isAdjusting,

    // Errors
    balanceError,
    enrollmentBalanceError,
    unpaidEnrollmentsError,
    adjustError,

    // Actions
    fetchBalance,
    fetchEnrollmentBalance,
    fetchUnpaidEnrollments,
    adjustBalance,

    // Utils
    clearErrors,
    clearAdjustmentResult,
  }
}
