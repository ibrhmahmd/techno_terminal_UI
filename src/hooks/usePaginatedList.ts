import { useState, useMemo, useCallback } from 'react'

export type SortDirection = 'asc' | 'desc'

interface UsePaginatedListOptions<T> {
  items: T[]
  initialPageSize?: number
  initialSortField?: keyof T
  initialSortDirection?: SortDirection
  searchFields?: (keyof T)[]
}

interface UsePaginatedListReturn<T> {
  // Search
  searchTerm: string
  setSearchTerm: (term: string) => void
  
  // Pagination
  currentPage: number
  setCurrentPage: (page: number) => void
  pageSize: number
  setPageSize: (size: number) => void
  
  // Sorting
  sortField: keyof T
  sortDirection: SortDirection
  handleSort: (field: keyof T) => void
  
  // Data
  filteredItems: T[]
  paginatedItems: T[]
  totalItems: number
  totalPages: number
}

/**
 * Generic hook for paginated, sortable, searchable lists.
 * Consolidates common patterns from useCourses.ts, useCompetitions.ts, etc.
 * 
 * @example
 * const { paginatedItems, handleSort, searchTerm, setSearchTerm } = usePaginatedList({
 *   items: courses,
 *   searchFields: ['name', 'category', 'description'],
 *   initialSortField: 'name'
 * })
 */
export function usePaginatedList<T extends Record<string, unknown>>(
  options: UsePaginatedListOptions<T>
): UsePaginatedListReturn<T> {
  const { 
    items, 
    initialPageSize = 20, 
    initialSortField = Object.keys(items[0] || {})[0] as keyof T,
    initialSortDirection = 'asc',
    searchFields = []
  } = options

  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(initialPageSize)
  const [sortField, setSortField] = useState<keyof T>(initialSortField)
  const [sortDirection, setSortDirection] = useState<SortDirection>(initialSortDirection)

  const filteredItems = useMemo(() => {
    if (!searchTerm) return items
    
    const term = searchTerm.toLowerCase()
    return items.filter(item => 
      searchFields.some(field => {
        const value = item[field]
        if (typeof value === 'string') {
          return value.toLowerCase().includes(term)
        }
        if (typeof value === 'number') {
          return value.toString().includes(term)
        }
        return false
      })
    )
  }, [items, searchTerm, searchFields])

  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]
      
      // Handle numeric fields
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
      }
      
      // Handle string fields
      const aStr = String(aValue || '').toLowerCase()
      const bStr = String(bValue || '').toLowerCase()
      const comparison = aStr.localeCompare(bStr)
      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [filteredItems, sortField, sortDirection])

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return sortedItems.slice(start, start + pageSize)
  }, [sortedItems, currentPage, pageSize])

  const totalPages = Math.ceil(filteredItems.length / pageSize)

  const handleSort = useCallback((field: keyof T) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
    setCurrentPage(1)
  }, [sortField])

  return {
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    sortField,
    sortDirection,
    handleSort,
    filteredItems,
    paginatedItems,
    totalItems: filteredItems.length,
    totalPages
  }
}
