import { useState, useCallback, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { 
  getCompetitions, 
  type Competition, 
  type CompetitionStatus,
  type GetCompetitionsParams 
} from '../../api/competitions'
import { queryKeys } from '../queryKeys'

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
  const [filters, setFilters] = useState<GetCompetitionsParams>({
    skip: 0,
    limit: PAGE_SIZE,
  })

  const { 
    data, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: [...queryKeys.competitions, filters],
    queryFn: async () => {
      const response = await getCompetitions(filters)
      return response
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const competitions = data?.data || []
  const totalCount = data?.total || 0

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
    error: error instanceof Error ? error.message : null,
    filters,
    currentPage,
    totalPages,
    pageSize: PAGE_SIZE,
    setStatusFilter,
    setSearchTerm,
    setPage,
    refresh: async () => { await refetch() },
  }
}
