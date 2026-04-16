import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getCoursesPaginated, type Course } from '../api/academics'
import { queryKeys } from './queryKeys'

export type SortField = 'name' | 'category' | 'price_per_level' | 'sessions_per_level'
export type SortDirection = 'asc' | 'desc'

/**
 * Custom hook for courses logic to reduce component complexity.
 * Currently implements local pagination/sorting/filtering.
 */
export function useCourses() {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  const { 
    data, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: queryKeys.courses,
    queryFn: async () => {
      const result = await getCoursesPaginated({ skip: 0, limit: 50 })
      return result.items || []
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const courses = data || []

  const processedCourses = useMemo(() => {
    const filtered = courses.filter((course) =>
      (course.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course.category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course.description || '').toLowerCase().includes(searchTerm.toLowerCase())
    )

    return [...filtered].sort((a, b) => {
      const aRaw = a[sortField as keyof Course]
      const bRaw = b[sortField as keyof Course]
      
      const aValue = sortField === 'price_per_level' || sortField === 'sessions_per_level' 
        ? Number(aRaw) 
        : aRaw
      const bValue = sortField === 'price_per_level' || sortField === 'sessions_per_level' 
        ? Number(bRaw) 
        : bRaw
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        const diff = aValue - bValue
        return sortDirection === 'asc' ? diff : -diff
      }
      
      const aStr = String(aValue || '').toLowerCase()
      const bStr = String(bValue || '').toLowerCase()
      
      const cmp = aStr.localeCompare(bStr)
      return sortDirection === 'asc' ? cmp : -cmp
    })
  }, [courses, searchTerm, sortField, sortDirection])

  const paginatedCourses = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return processedCourses.slice(start, start + pageSize)
  }, [processedCourses, currentPage, pageSize])

  const totalPages = Math.ceil(processedCourses.length / pageSize)

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
    courses,
    totalCourses: courses.length,
    isLoading,
    error: error instanceof Error ? error.message : null,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    sortField,
    sortDirection,
    handleSort,
    processedCourses,
    paginatedCourses,
    totalPages,
    refresh: async () => { await refetch() }
  }
}
