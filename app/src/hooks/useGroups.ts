import { useState, useEffect, useMemo, useCallback } from 'react'
import { getEnrichedGroups, type EnrichedGroupPublic } from '../api/academics'

export type SortField = 'name' | 'course_name' | 'instructor_name' | 'max_capacity'
export type SortDirection = 'asc' | 'desc'

/**
 * Custom hook for groups logic to reduce component complexity.
 * Currently implements local pagination/sorting/filtering.
 */
export function useGroups() {
  const [groups, setGroups] = useState<EnrichedGroupPublic[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  const loadGroups = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await getEnrichedGroups()
      setGroups(result || [])
    } catch (err: any) {
      console.error('[useGroups] loadGroups failed:', err)
      setError('Failed to load groups. Please check your connection.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadGroups()
  }, [loadGroups])

  const processedGroups = useMemo(() => {
    let filtered = groups.filter((group) =>
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (group.course_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (group.instructor_name || '').toLowerCase().includes(searchTerm.toLowerCase())
    )

    return [...filtered].sort((a, b) => {
      const aRaw = a[sortField as keyof EnrichedGroupPublic]
      const bRaw = b[sortField as keyof EnrichedGroupPublic]
      
      const aValue = sortField === 'max_capacity' ? Number(aRaw) : aRaw
      const bValue = sortField === 'max_capacity' ? Number(bRaw) : bRaw
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        const diff = aValue - bValue
        return sortDirection === 'asc' ? diff : -diff
      }
      
      const aStr = String(aValue || '').toLowerCase()
      const bStr = String(bValue || '').toLowerCase()
      
      const cmp = aStr.localeCompare(bStr)
      return sortDirection === 'asc' ? cmp : -cmp
    })
  }, [groups, searchTerm, sortField, sortDirection])

  const paginatedGroups = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return processedGroups.slice(start, start + pageSize)
  }, [processedGroups, currentPage, pageSize])

  const totalPages = Math.ceil(processedGroups.length / pageSize)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
    setCurrentPage(1)
  }

  return {
    groups,
    setGroups,
    totalGroups: groups.length,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    sortField,
    sortDirection,
    handleSort,
    processedGroups,
    paginatedGroups,
    totalPages,
    refresh: loadGroups
  }
}
