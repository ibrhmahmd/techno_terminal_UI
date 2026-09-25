import { useState, useEffect, useCallback } from 'react'

interface UseSearchOptions {
  debounceMs?: number
  minLength?: number
  onSearch?: (query: string) => void
}

interface UseSearchReturn {
  searchTerm: string
  setSearchTerm: (term: string) => void
  debouncedSearch: string
  isSearching: boolean
  clearSearch: () => void
  handleSearch: (term: string) => void
}

export function useSearch(options: UseSearchOptions = {}): UseSearchReturn {
  const { debounceMs = 300, minLength = 0, onSearch } = options

  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [settledTerm, setSettledTerm] = useState<string | null>(null)
  const isSearching = searchTerm !== settledTerm

  useEffect(() => {
    const timer = setTimeout(() => {
      setSettledTerm(searchTerm)

      if (searchTerm.length >= minLength || searchTerm === '') {
        setDebouncedSearch(searchTerm)
        onSearch?.(searchTerm)
      }
    }, debounceMs)

    return () => {
      clearTimeout(timer)
    }
  }, [searchTerm, debounceMs, minLength, onSearch])

  const clearSearch = useCallback(() => {
    setSearchTerm('')
    setDebouncedSearch('')
  }, [])

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term)
  }, [])

  return {
    searchTerm,
    setSearchTerm,
    debouncedSearch,
    isSearching,
    clearSearch,
    handleSearch
  }
}


