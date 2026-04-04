import { useState, useEffect, useCallback, useRef } from 'react'

interface UseDirectorySearchOptions {
  minSearchLength?: number
  debounceMs?: number
  maxResults?: number
}

interface UseDirectorySearchReturn<T> {
  query: string
  results: T[]
  isLoading: boolean
  error: string | null
  setQuery: (query: string) => void
  clearSearch: () => void
  refresh: () => void
}

/**
 * Custom hook for debounced search functionality in directory components.
 * Optimizes API calls by debouncing search input and caching results.
 * 
 * @param searchFn - Function to perform the search (should return a Promise)
 * @param options - Configuration options for the hook
 * @returns Search state and control functions
 * 
 * @example
 * const { query, results, isLoading, setQuery } = useDirectorySearch(
 *   (q) => searchStudents(q),
 *   { minSearchLength: 2, debounceMs: 300 }
 * )
 */
export function useDirectorySearch<T>(
  searchFn: (query: string) => Promise<T[]>,
  options: UseDirectorySearchOptions = {}
): UseDirectorySearchReturn<T> {
  const {
    minSearchLength = 2,
    debounceMs = 300,
    maxResults = 50
  } = options

  const [query, setQueryState] = useState('')
  const [results, setResults] = useState<T[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const lastQueryRef = useRef('')

  const performSearch = useCallback(async (searchQuery: string) => {
    // Don't search if query is too short
    if (searchQuery.length > 0 && searchQuery.length < minSearchLength) {
      setResults([])
      return
    }

    // Skip if same query
    if (searchQuery === lastQueryRef.current && searchQuery !== '') {
      return
    }

    setIsLoading(true)
    setError(null)
    lastQueryRef.current = searchQuery

    try {
      const data = await searchFn(searchQuery)
      setResults(maxResults ? data.slice(0, maxResults) : data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed')
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [searchFn, minSearchLength, maxResults])

  const setQuery = useCallback((newQuery: string) => {
    setQueryState(newQuery)

    // Clear existing debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    // Clear results if query is empty
    if (!newQuery.trim()) {
      setResults([])
      setError(null)
      lastQueryRef.current = ''
      return
    }

    // Debounce the search
    debounceRef.current = setTimeout(() => {
      performSearch(newQuery.trim())
    }, debounceMs)
  }, [debounceMs, performSearch])

  const clearSearch = useCallback(() => {
    setQueryState('')
    setResults([])
    setError(null)
    lastQueryRef.current = ''
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
  }, [])

  const refresh = useCallback(() => {
    if (query) {
      performSearch(query)
    }
  }, [query, performSearch])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  return {
    query,
    results,
    isLoading,
    error,
    setQuery,
    clearSearch,
    refresh
  }
}
