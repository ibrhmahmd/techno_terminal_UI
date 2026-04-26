import { useState, useEffect, useCallback } from 'react'
import { getDailyCollections, getDailyReceipts } from '../../../api/finance'
import type { DailyCollectionItem, DailyReceiptItem } from '../../../api/finance/types'
import { getTodayISO } from '../../../utils/formatting'

interface UseDailyCollectionsResult {
  collections: DailyCollectionItem[]
  receipts: DailyReceiptItem[]
  date: string
  setDate: (date: string) => void
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

export function useDailyCollections(): UseDailyCollectionsResult {
  const [collections, setCollections] = useState<DailyCollectionItem[]>([])
  const [receipts, setReceipts] = useState<DailyReceiptItem[]>([])
  const [date, setDate] = useState<string>(getTodayISO())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async (targetDate: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const [collectionsData, receiptsData] = await Promise.all([
        getDailyCollections(targetDate),
        getDailyReceipts(targetDate)
      ])
      setCollections(collectionsData)
      setReceipts(receiptsData)
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to fetch daily collections')
      setError(errorObj)
      setCollections([])
      setReceipts([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData(date)
  }, [date, fetchData])

  const refetch = useCallback(() => {
    fetchData(date)
  }, [date, fetchData])

  return {
    collections,
    receipts,
    date,
    setDate,
    isLoading,
    error,
    refetch
  }
}
