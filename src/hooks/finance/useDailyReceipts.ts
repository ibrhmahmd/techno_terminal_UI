import { useQuery } from '@tanstack/react-query'
import { getDailyReceipts } from '../../api/finance'
import { queryKeys } from '../queryKeys'
import type { DailyReceiptItem } from '../../api/finance/types'

export interface UseDailyReceiptsResult {
  receipts: DailyReceiptItem[]
  isLoading: boolean
  error: Error | null
}

export function useDailyReceipts(date: string): UseDailyReceiptsResult {
  const query = useQuery({
    queryKey: queryKeys.finance.dailyReceipts(date),
    queryFn: () => getDailyReceipts(date),
    staleTime: 2 * 60 * 1000,
  })

  return {
    receipts: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error : null,
  }
}
