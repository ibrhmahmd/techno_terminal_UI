import { useState, useEffect, useCallback } from 'react'
import {
  getGroupEnrollmentHistory,
  getGroupCompetitions,
  getGroupInstructorHistory,
  type EnrollmentHistoryDTO,
  type EnrollmentHistoryFilters,
  type CompetitionParticipationDTO,
  type InstructorAssignmentDTO,
} from '../api/academics'

interface PaginationState {
  skip: number
  limit: number
  total: number
}

interface HistoryFilters {
  enrollmentAction?: EnrollmentHistoryDTO['action']
  level?: number
}

interface UseGroupHistoryReturn {
  enrollmentHistory: EnrollmentHistoryDTO[]
  competitions: CompetitionParticipationDTO[]
  instructorHistory: InstructorAssignmentDTO[]
  isLoading: boolean
  error: string | null
  pagination: {
    enrollment: PaginationState
  }
  filters: HistoryFilters
  setFilters: (filters: HistoryFilters) => void
  setEnrollmentPage: (skip: number) => void
  refresh: () => Promise<void>
}

export function useGroupHistory(groupId: number): UseGroupHistoryReturn {
  const [enrollmentHistory, setEnrollmentHistory] = useState<EnrollmentHistoryDTO[]>([])
  const [competitions, setCompetitions] = useState<CompetitionParticipationDTO[]>([])
  const [instructorHistory, setInstructorHistory] = useState<InstructorAssignmentDTO[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<HistoryFilters>({})
  const [enrollmentPagination, setEnrollmentPagination] = useState<PaginationState>({
    skip: 0,
    limit: 20,
    total: 0,
  })

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const enrollmentFilters: EnrollmentHistoryFilters = {
        skip: enrollmentPagination.skip,
        limit: enrollmentPagination.limit,
        ...(filters.enrollmentAction && { action: filters.enrollmentAction }),
        ...(filters.level && { level: filters.level }),
      }

      const [enrollmentData, competitionsData, instructorData] = await Promise.all([
        getGroupEnrollmentHistory(groupId, enrollmentFilters),
        getGroupCompetitions(groupId),
        getGroupInstructorHistory(groupId),
      ])

      setEnrollmentHistory(enrollmentData.items)
      setEnrollmentPagination((prev) => ({ ...prev, total: enrollmentData.total }))
      setCompetitions(Array.isArray(competitionsData) ? competitionsData : [])
      setInstructorHistory(Array.isArray(instructorData) ? instructorData : [])
    } catch (err: any) {
      setError(err.message || 'Failed to load history data')
    } finally {
      setIsLoading(false)
    }
  }, [groupId, filters, enrollmentPagination.skip, enrollmentPagination.limit])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const setEnrollmentPage = useCallback((skip: number) => {
    setEnrollmentPagination((prev) => ({ ...prev, skip }))
  }, [])

  return {
    enrollmentHistory,
    competitions,
    instructorHistory,
    isLoading,
    error,
    pagination: {
      enrollment: enrollmentPagination,
    },
    filters,
    setFilters,
    setEnrollmentPage,
    refresh: fetchData,
  }
}
