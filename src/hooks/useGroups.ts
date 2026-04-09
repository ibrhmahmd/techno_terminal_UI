import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  getEnrichedGroups,
  getGroupsGrouped,
  getGroupsWithCompetitions,
  type EnrichedGroupPublic,
  type GroupByField,
  type GroupGroup,
  type EnrichedGroupPublicWithCompetition,
} from '../api/academics'

export type SortField = 'name' | 'course_name' | 'instructor_name' | 'current_student_count'
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
  const [pageSize, setPageSize] = useState(50)
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [groupBy, setGroupBy] = useState<GroupByField>(null)
  const [groupedData, setGroupedData] = useState<GroupGroup[]>([])
  const [isGroupedView, setIsGroupedView] = useState(false)

  const loadGroups = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await getEnrichedGroups()
      console.log('[DEBUG] Groups loaded from API:', result)
      console.log('[DEBUG] First group sample:', result?.[0] ? { 
        id: result[0].id, 
        group_name: result[0].group_name 
      } : 'No groups')
      setGroups(result || [])
    } catch (err: any) {
      console.error('[useGroups] loadGroups failed:', err)
      setError('Failed to load groups. Please check your connection.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const loadGroupsGrouped = useCallback(async () => {
    if (!groupBy) return
    setIsLoading(true)
    setError(null)
    try {
      if (groupBy === 'competition') {
        // Special handling: fetch competition data client-side
        const groupsWithComp = await getGroupsWithCompetitions()
        const grouped = groupByCompetition(groupsWithComp)
        setGroupedData(grouped)
      } else {
        const result = await getGroupsGrouped(groupBy, { skip: 0, limit: 50 })
        setGroupedData(result.groups)
      }
      setIsGroupedView(true)
    } catch (err: any) {
      console.error('[useGroups] loadGroupsGrouped failed:', err)
      setError('Failed to load grouped groups. Please check your connection.')
    } finally {
      setIsLoading(false)
    }
  }, [groupBy])

  // Group by competition helper
  const groupByCompetition = (groups: EnrichedGroupPublicWithCompetition[]): GroupGroup[] => {
    const inComp = groups.filter((g) => g.is_in_competition)
    const notInComp = groups.filter((g) => !g.is_in_competition)
    return [
      { key: 'in_competition', label: 'In Competition', count: inComp.length, groups: inComp },
      { key: 'not_in_competition', label: 'Not in Competition', count: notInComp.length, groups: notInComp },
    ]
  }

  // Effect to load groups on initial mount
  useEffect(() => {
    loadGroups()
  }, [loadGroups])

  // Effect to load grouped data when groupBy changes
  useEffect(() => {
    if (groupBy) {
      loadGroupsGrouped()
    } else {
      setIsGroupedView(false)
      setGroupedData([])
    }
  }, [groupBy, loadGroupsGrouped])

  const processedGroups = useMemo(() => {
    const filtered = groups.filter((group) =>
      (group.group_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
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
    groupBy,
    setGroupBy,
    groupedData,
    isGroupedView,
    refresh: loadGroups,
  }
}
