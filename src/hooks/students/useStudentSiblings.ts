import { useState, useEffect, useCallback } from 'react'
import { getStudentSiblings } from '../../api/crm/students/siblings'
import type { SiblingInfo } from '../../api/crm/students/types'
import { AxiosError } from 'axios'

interface UseStudentSiblingsReturn {
  // Data
  siblings: SiblingInfo[]

  // Loading state
  loading: boolean

  // Error state
  error: string | null

  // Actions
  refresh: () => Promise<void>
}

/**
 * Hook for lazy-loading student siblings data
 * Only fetches when enabled=true (e.g., siblings section expanded)
 * Used in Overview tab for siblings section
 */
export function useStudentSiblings(
  studentId: number | null,
  enabled: boolean
): UseStudentSiblingsReturn {
  const [siblings, setSiblings] = useState<SiblingInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasFetched, setHasFetched] = useState(false)

  const refresh = useCallback(async () => {
    if (!studentId) return

    setLoading(true)
    setError(null)

    try {
      const data = await getStudentSiblings(studentId)
      setSiblings(data)
      setHasFetched(true)
    } catch (err) {
      const axiosErr = err as AxiosError<{ detail?: string }>
      setError(axiosErr.response?.data?.detail || 'Failed to load siblings')
      console.error('Failed to load student siblings:', err)
    } finally {
      setLoading(false)
    }
  }, [studentId])

  // Auto-fetch when enabled becomes true
  useEffect(() => {
    if (enabled && studentId && !hasFetched) {
      refresh()
    }
  }, [enabled, studentId, hasFetched, refresh])

  // Refetch when explicitly enabled again
  useEffect(() => {
    if (enabled && studentId && hasFetched) {
      refresh()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled])

  return {
    siblings,
    loading,
    error,
    refresh
  }
}
