import { useState, useMemo } from 'react'
import { useGroupsFlat, useGroupsGrouped } from './useGroupQueries'
import {
  type EnrichedGroupPublic,
  type GroupByField,
} from '../api/academics'

export type SortField = 'name' | 'course_name' | 'instructor_name' | 'current_student_count'
export type SortDirection = 'asc' | 'desc'

const STORAGE_KEY = 'tt:groups:groupBy'

/**
 * Custom hook for groups logic to reduce component complexity.
 * Implements local pagination/sorting/filtering, localStorage persistence,
 * and global module-level caching cache invalidation support.
 */
export function useGroups() {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  // Read last choice from localStorage on first mount
  const [groupBy, setGroupBy] = useState<GroupByField | undefined>(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === null) return undefined // Key doesn't exist, user never made a choice
    
    if (stored === 'null') return null // User specifically chose 'All'
    
    const valid: Array<GroupByField> = ['day', 'course', 'instructor', 'status', null]
    if (valid.includes(stored as GroupByField)) {
        return stored as GroupByField
    }
    return undefined
  })
  
  // React Query hooks handle fetching, caching, and loading states automatically
  const isAllView = groupBy === null
  const isGroupedView = groupBy !== undefined && groupBy !== null

  // Flat query runs if we chose "All"
  const flatQuery = useGroupsFlat(groupBy !== undefined && isAllView)
  
  // Grouped query runs if we chose a grouping option
  const groupedQuery = useGroupsGrouped(
    groupBy as Exclude<GroupByField, null>, 
    groupBy !== undefined && isGroupedView
  )

  const groups = flatQuery.data ?? []
  const groupedData = groupedQuery.data ?? []
  const isLoading = flatQuery.isLoading || groupedQuery.isLoading
  const error = flatQuery.error?.message || groupedQuery.error?.message || null

  const refresh = () => {
    if (isAllView) flatQuery.refetch()
    else if (isGroupedView) groupedQuery.refetch()
  }

  const processedGroups = useMemo(() => {
    const filtered = groups.filter((group) =>
      (group.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (group.course_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (group.instructor_name || '').toLowerCase().includes(searchTerm.toLowerCase())
    )

    return [...filtered].sort((a, b) => {
      const aRaw = a[sortField as keyof EnrichedGroupPublic]
      const bRaw = b[sortField as keyof EnrichedGroupPublic]
      
      const aValue = sortField === 'current_student_count' ? Number(aRaw) : aRaw
      const bValue = sortField === 'current_student_count' ? Number(bRaw) : bRaw
      
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

  const validSortFields: SortField[] = ['name', 'course_name', 'instructor_name', 'current_student_count']

  const handleSort = (field: string) => {
    const typedField = validSortFields.includes(field as SortField) ? field as SortField : 'name'
    if (sortField === typedField) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(typedField)
      setSortDirection('asc')
    }
    setCurrentPage(1)
  }

  return {
    groups,
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
    groupBy,
    setGroupBy,
    groupedData,
    isGroupedView,
    refresh,
  }
}
