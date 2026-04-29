import { useState, useEffect, useCallback } from 'react'
import {
  getGroupPayments,
  type GroupPaymentsResponse,
  type LevelPaymentsDTO,
} from '../api/academics'
import { extractErrorMessage } from '../utils/apiErrors'

interface UseGroupPaymentsReturn {
  // Data
  summary: GroupPaymentsResponse['summary'] | null
  paymentsByLevel: LevelPaymentsDTO[]
  totalExpected: number
  totalCollected: number
  totalDue: number
  collectionRate: number

  // Loading
  isLoading: boolean
  error: string | null

  // Actions
  refresh: () => Promise<void>
}

export function useGroupPayments(groupId: number): UseGroupPaymentsReturn {
  const [data, setData] = useState<GroupPaymentsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!groupId) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const response = await getGroupPayments(groupId)
      setData(response)
    } catch (err) {
      const userMessage = extractErrorMessage(err)
      console.error('[useGroupPayments] Failed:', { error: err, userMessage })
      setError(userMessage)
    } finally {
      setIsLoading(false)
    }
  }, [groupId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const summary = data?.summary ?? null
  const paymentsByLevel = data?.by_level ?? []

  return {
    summary,
    paymentsByLevel,
    totalExpected: summary?.total_expected_all_levels ?? 0,
    totalCollected: summary?.total_collected_all_levels ?? 0,
    totalDue: summary?.total_due_all_levels ?? 0,
    collectionRate: summary?.collection_rate ?? 0,
    isLoading,
    error,
    refresh: fetchData,
  }
}
