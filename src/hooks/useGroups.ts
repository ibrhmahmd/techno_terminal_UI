import { useState, useMemo } from 'react'
import { useGroupsFlat, useGroupsGrouped } from './useGroupQueries'
import {
  type EnrichedGroupPublic,
  type GroupByField,
  type GroupFilterOptions,
} from '../api/academics'

export type SortField = 'name' | 'course_name' | 'instructor_name' | 'current_student_count'
export type SortDirection = 'asc' | 'desc'

const STORAGE_KEY = 'tt:groups:groupBy'

/**
 * Custom hook for groups logic to reduce component complexity.
 * Implements server-side pagination/filtering and local sorting,
 * localStorage persistence, and cache invalidation support.
 */
export function useGroups() {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  // Filter states
  const [selectedCourses, setSelectedCourses] = useState<number[]>([])
  const [selectedInstructors, setSelectedInstructors] = useState<number[]>([])
  const [selectedDays, setSelectedDays] = useState<string[]>([])
  const [selectedLevels, setSelectedLevels] = useState<number[]>([])
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(['active'])

  // Read last choice from localStorage on first mount
  const [groupBy, setGroupBy] = useState<GroupByField | undefined>(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === null) return undefined
    if (stored === 'null') return null
    const valid = new Set<GroupByField>(['day', 'course', 'instructor', 'status', null])
    return valid.has(stored as GroupByField) ? stored as GroupByField : undefined
  })
  
  const isAllView = groupBy === null
  const isGroupedView = groupBy !== undefined && groupBy !== null

  // Build filter options
  const filterOptions: GroupFilterOptions = useMemo(() => ({
    q: searchTerm || undefined,
    course_ids: selectedCourses.length > 0 ? selectedCourses : undefined,
    instructor_ids: selectedInstructors.length > 0 ? selectedInstructors : undefined,
    level_numbers: selectedLevels.length > 0 ? selectedLevels : undefined,
    day: selectedDays.length > 0 ? selectedDays : undefined,
    status: selectedStatuses.length > 0 ? selectedStatuses : undefined,
    skip: (currentPage - 1) * pageSize,
    limit: pageSize,
  }), [searchTerm, selectedCourses, selectedInstructors, selectedDays, selectedLevels, selectedStatuses, currentPage, pageSize])

  // Flat query runs if we chose "All"
  const flatQuery = useGroupsFlat(filterOptions, isAllView)
  
  // Grouped query runs if we chose a grouping option
  const groupedQuery = useGroupsGrouped(
    groupBy!,
    isGroupedView
  )

  const groups = flatQuery.data?.items ?? []
  const totalGroups = flatQuery.data?.total ?? 0
  const groupedData = groupedQuery.data ?? []
  const isLoading = flatQuery.isLoading || groupedQuery.isLoading
  const error = flatQuery.error?.message || groupedQuery.error?.message || null

  const refresh = () => {
    if (isAllView) flatQuery.refetch()
    else if (isGroupedView) groupedQuery.refetch()
  }

  const paginatedGroups = useMemo(() => {
    return [...groups].sort((a, b) => {
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
  }, [groups, sortField, sortDirection])
  const totalPages = Math.ceil(totalGroups / pageSize)

  const validSortFields: SortField[] = ['name', 'course_name', 'instructor_name', 'current_student_count']

  const handleSort = (field: string) => {
    const typedField = validSortFields.find(f => f === field) ?? 'name'
    if (sortField === typedField) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(typedField)
      setSortDirection('asc')
    }
    // We intentionally do NOT reset currentPage here so they stay on the same page while sorting
  }

  // Expose filter setters
  const filters = {
    selectedCourses, setSelectedCourses,
    selectedInstructors, setSelectedInstructors,
    selectedDays, setSelectedDays,
    selectedLevels, setSelectedLevels,
    selectedStatuses, setSelectedStatuses,
  }

  return {
    groups,
    totalGroups,
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
    paginatedGroups,
    totalPages,
    groupBy,
    setGroupBy,
    groupedData,
    isGroupedView,
    refresh,
    filters,
  }
}
