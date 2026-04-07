import { useState, useEffect, useMemo, useCallback } from 'react'
import { getCoursesPaginated, type Course } from '../api/academics'

export type SortField = 'name' | 'category' | 'price_per_level' | 'sessions_per_level'
export type SortDirection = 'asc' | 'desc'

/**
 * Custom hook for courses logic to reduce component complexity.
 * Currently implements local pagination/sorting/filtering.
 */
export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  const loadCourses = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await getCoursesPaginated({ skip: 0, limit: 50 })
      console.log('[DEBUG] Courses loaded from API:', result)
      setCourses(result.items || [])
    } catch (err: any) {
      console.error('[useCourses] loadCourses failed:', err)
      setError('Failed to load courses. Please check your connection.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCourses()
  }, [loadCourses])

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
    setCourses,
    totalCourses: courses.length,
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
    processedCourses,
    paginatedCourses,
    totalPages,
    refresh: loadCourses
  }
}
