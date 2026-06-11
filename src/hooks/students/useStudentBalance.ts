import { useState, useEffect, useCallback } from 'react'
import { getStudentBalance } from '../../api/finance/balance'
import type { StudentBalance } from '../../api/crm/students/types'
import { AxiosError } from 'axios'

interface UseStudentBalanceReturn {
  // Data
  balance: StudentBalance | null

  // Loading state
  loading: boolean

  // Error state
  error: string | null

  // Actions
  refresh: () => Promise<void>
}

/**
 * Hook for lazy-loading student balance data (Payments tab)
 * Only fetches when enabled=true (tab is active)
 * Reduces initial page load time
 */
export function useStudentBalance(
  studentId: number | null,
  enabled: boolean
): UseStudentBalanceReturn {
  const [balance, setBalance] = useState<StudentBalance | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasFetched, setHasFetched] = useState(false)

  const refresh = useCallback(async () => {
    if (!studentId) return

    setLoading(true)
    setError(null)

    try {
      const data = await getStudentBalance(studentId)
      setBalance(data)
      setHasFetched(true)
    } catch (err) {
      const axiosErr = err as AxiosError<{ detail?: string }>
      setError(axiosErr.response?.data?.detail || 'Failed to load balance')
      console.error('Failed to load student balance:', err)
    } finally {
      setLoading(false)
    }
  }, [studentId])

  // Auto-fetch when enabled becomes true and hasn't fetched yet
  useEffect(() => {
    if (enabled && studentId && !hasFetched) {
      refresh()
    }
  }, [enabled, studentId, hasFetched, refresh])

  // Refetch when explicitly enabled again (tab revisited)
  useEffect(() => {
    if (enabled && studentId && hasFetched) {
      refresh()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled])

  return {
    balance,
    loading,
    error,
    refresh
  }
}
