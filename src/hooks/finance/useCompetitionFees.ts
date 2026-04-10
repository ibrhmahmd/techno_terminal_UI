import { useState, useCallback } from 'react'
import {
  getUnpaidCompetitionFees,
  type UnpaidCompFeeItem,
} from '../../api/finance'

export interface UseCompetitionFeesResult {
  // Data
  unpaidFees: UnpaidCompFeeItem[]

  // Loading states
  isLoading: boolean

  // Errors
  error: Error | null

  // Actions
  fetchUnpaidFees: (studentId: number) => Promise<UnpaidCompFeeItem[]>

  // Utils
  clearError: () => void
  clearUnpaidFees: () => void
}

export function useCompetitionFees(): UseCompetitionFeesResult {
  // Data state
  const [unpaidFees, setUnpaidFees] = useState<UnpaidCompFeeItem[]>([])

  // Loading state
  const [isLoading, setIsLoading] = useState(false)

  // Error state
  const [error, setError] = useState<Error | null>(null)

  const fetchUnpaidFees = useCallback(async (studentId: number) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getUnpaidCompetitionFees(studentId)
      setUnpaidFees(data)
      return data
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch unpaid competition fees')
      setError(error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const clearUnpaidFees = useCallback(() => {
    setUnpaidFees([])
  }, [])

  return {
    // Data
    unpaidFees,

    // Loading states
    isLoading,

    // Errors
    error,

    // Actions
    fetchUnpaidFees,

    // Utils
    clearError,
    clearUnpaidFees,
  }
}
