import { useQuery } from '@tanstack/react-query'
import { getDailyCollections, getDailyReceipts } from '../../../api/finance'
import type { DailyCollectionItem, DailyReceiptItem } from '../../../api/finance/types'
import { getTodayISO } from '../../../utils/formatting'
import { queryKeys } from '../../../hooks/queryKeys'
import { useState } from 'react'

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
  const [date, setDate] = useState<string>(getTodayISO())

  const collectionsQuery = useQuery<DailyCollectionItem[]>({
    queryKey: queryKeys.reports.dailyCollections(date),
    queryFn: () => getDailyCollections(date),
    staleTime: 1 * 60 * 1000,
  })

  const receiptsQuery = useQuery<DailyReceiptItem[]>({
    queryKey: queryKeys.reports.dailyReceipts(date),
    queryFn: () => getDailyReceipts(date),
    staleTime: 1 * 60 * 1000,
  })

  return {
    collections: collectionsQuery.data ?? [],
    receipts: receiptsQuery.data ?? [],
    date,
    setDate,
    isLoading: collectionsQuery.isLoading || receiptsQuery.isLoading,
    error: collectionsQuery.error && receiptsQuery.error
      ? new Error(`Collections: ${collectionsQuery.error.message}; Receipts: ${receiptsQuery.error.message}`)
      : collectionsQuery.error instanceof Error
        ? collectionsQuery.error
        : receiptsQuery.error instanceof Error
          ? receiptsQuery.error
          : null,
    refetch: () => {
      collectionsQuery.refetch()
      receiptsQuery.refetch()
    },
  }
}
