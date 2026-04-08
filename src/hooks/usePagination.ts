import { useState, useCallback, useRef } from 'react'
import type { PaginationParams, PaginationResult } from '../types/pagination'

type FetchFunction<T> = (params: PaginationParams) => Promise<PaginationResult<T>>

interface UsePaginationOptions {
  initialLimit?: number
  initialSkip?: number
}

interface UsePaginationReturn<T> {
  items: T[]
  total: number
  isLoading: boolean
  hasMore: boolean
  error: string | null
  currentPage: number
  loadMore: () => Promise<void>
  refresh: () => Promise<void>
  reset: () => void
  setPage: (page: number) => Promise<void>
}

export function usePagination<T>(
  fetchFn: FetchFunction<T>,
  options: UsePaginationOptions = {}
): UsePaginationReturn<T> {
  const { initialLimit = 20, initialSkip = 0 } = options
  
  const [items, setItems] = useState<T[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  
  const skipRef = useRef(initialSkip)
  const limitRef = useRef(initialLimit)

  const loadMore = useCallback(async (reset = false) => {
    if (isLoading) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const skip = reset ? initialSkip : skipRef.current
      const result = await fetchFn({ skip, limit: initialLimit })
      
      setItems(prev => reset ? result.items : [...prev, ...result.items])
      setTotal(result.total)
      setHasMore(result.hasMore)
      skipRef.current = skip + result.items.length
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }, [fetchFn, initialLimit, initialSkip, isLoading])

  const refresh = useCallback(async () => {
    skipRef.current = initialSkip
    await loadMore(true)
  }, [loadMore, initialSkip])

  const reset = useCallback(() => {
    setItems([])
    setTotal(0)
    setHasMore(true)
    setError(null)
    skipRef.current = initialSkip
  }, [initialSkip])

  const setPage = useCallback(async (page: number) => {
    if (isLoading) return
    const skip = page * limitRef.current
    skipRef.current = skip
    setCurrentPage(page)
    await loadMore(true)
  }, [isLoading, loadMore])

  return {
    items,
    total,
    isLoading,
    hasMore,
    error,
    currentPage,
    loadMore: () => loadMore(false),
    refresh,
    reset,
    setPage
  }
}
