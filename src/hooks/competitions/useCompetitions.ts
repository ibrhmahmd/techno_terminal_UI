import { useState, useEffect, useCallback, useMemo } from 'react'
import { 
  getCompetitions, 
  type Competition, 
  type CompetitionStatus,
  type GetCompetitionsParams 
} from '../../api/competitions'

interface UseCompetitionsReturn {
  competitions: Competition[]
  totalCount: number
  isLoading: boolean
  error: string | null
  filters: GetCompetitionsParams
  currentPage: number
  totalPages: number
  pageSize: number
  setStatusFilter: (status: CompetitionStatus | undefined) => void
  setSearchTerm: (search: string) => void
  setPage: (page: number) => void
  refresh: () => Promise<void>
}

const PAGE_SIZE = 20

export function useCompetitions(): UseCompetitionsReturn {
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<GetCompetitionsParams>({
    skip: 0,
    limit: PAGE_SIZE,
  })

  const fetchCompetitions = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await getCompetitions(filters)
      setCompetitions(response.data)
      setTotalCount(response.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load competitions')
      setCompetitions([])
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchCompetitions()
  }, [fetchCompetitions])

  const setStatusFilter = useCallback((status: CompetitionStatus | undefined) => {
    setFilters(prev => ({ ...prev, status, skip: 0 }))
  }, [])

  const setSearchTerm = useCallback((search: string) => {
    setFilters(prev => ({ ...prev, search, skip: 0 }))
  }, [])

  const setPage = useCallback((page: number) => {
    setFilters(prev => ({ ...prev, skip: page * PAGE_SIZE }))
  }, [])

  const currentPage = useMemo(() => 
    Math.floor((filters.skip || 0) / PAGE_SIZE), 
    [filters.skip]
  )

  const totalPages = useMemo(() => 
    Math.ceil(totalCount / PAGE_SIZE), 
    [totalCount]
  )

  return {
    competitions,
    totalCount,
    isLoading,
    error,
    filters,
    currentPage,
    totalPages,
    pageSize: PAGE_SIZE,
    setStatusFilter,
    setSearchTerm,
    setPage,
    refresh: fetchCompetitions,
  }
}
