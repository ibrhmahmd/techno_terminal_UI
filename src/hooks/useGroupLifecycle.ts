import { useState, useEffect, useCallback } from 'react'
import {
  getGroupEnrollmentHistory,
  getGroupInstructorHistory,
  getGroupLifecycleHistory,
  getGroupCourseHistory,
  getGroupEnrollmentTransitions,
  getGroupLevelAnalytics,
  getGroupEnrollmentAnalytics,
  completeGroupLevel,
  cancelGroupLevel,
  type EnrollmentHistoryDTO,
  type EnrollmentHistoryFilters,
  type InstructorAssignmentDTO,
  type GroupLifecycleHistoryDTO,
  type CourseAssignmentDTO,
  type EnrollmentTransitionDTO,
  type GroupLevelAnalyticsDTO,
  type GroupEnrollmentAnalyticsDTO,
  type CompleteLevelResponse,
  type CancelLevelResponse,
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

interface UseGroupLifecycleReturn {
  // History data
  enrollmentHistory: EnrollmentHistoryDTO[]
  instructorHistory: InstructorAssignmentDTO[]
  lifecycleHistory: GroupLifecycleHistoryDTO | null
  courseHistory: CourseAssignmentDTO[]
  enrollmentTransitions: EnrollmentTransitionDTO[]

  // Analytics data
  levelAnalytics: GroupLevelAnalyticsDTO[]
  enrollmentAnalytics: GroupEnrollmentAnalyticsDTO | null

  // Loading states
  isLoadingHistory: boolean
  isLoadingAnalytics: boolean
  error: string | null

  // Pagination
  pagination: {
    enrollment: PaginationState
  }

  // Filters
  filters: HistoryFilters
  setFilters: (filters: HistoryFilters) => void
  setEnrollmentPage: (skip: number) => void

  // Actions
  completeLevel: (levelNumber: number) => Promise<CompleteLevelResponse>
  cancelLevel: (levelNumber: number, reason?: string) => Promise<CancelLevelResponse>

  // Refresh
  refresh: () => Promise<void>
  refreshAnalytics: () => Promise<void>
}

export function useGroupLifecycle(groupId: number): UseGroupLifecycleReturn {
  // History states
  const [enrollmentHistory, setEnrollmentHistory] = useState<EnrollmentHistoryDTO[]>([])
  const [instructorHistory, setInstructorHistory] = useState<InstructorAssignmentDTO[]>([])
  const [lifecycleHistory, setLifecycleHistory] = useState<GroupLifecycleHistoryDTO | null>(null)
  const [courseHistory, setCourseHistory] = useState<CourseAssignmentDTO[]>([])
  const [enrollmentTransitions, setEnrollmentTransitions] = useState<EnrollmentTransitionDTO[]>([])

  // Analytics states
  const [levelAnalytics, setLevelAnalytics] = useState<GroupLevelAnalyticsDTO[]>([])
  const [enrollmentAnalytics, setEnrollmentAnalytics] = useState<GroupEnrollmentAnalyticsDTO | null>(null)

  // Loading states
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [filters, setFilters] = useState<HistoryFilters>({})
  const [enrollmentPagination, setEnrollmentPagination] = useState<PaginationState>({
    skip: 0,
    limit: 20,
    total: 0,
  })

  // Fetch history data
  const fetchHistory = useCallback(async () => {
    setIsLoadingHistory(true)
    setError(null)
    try {
      const enrollmentFilters: EnrollmentHistoryFilters = {
        skip: enrollmentPagination.skip,
        limit: enrollmentPagination.limit,
        ...(filters.enrollmentAction && { action: filters.enrollmentAction }),
        ...(filters.level && { level: filters.level }),
      }

      const [enrollmentData, instructorData, lifecycleData, courseData, transitionsData] = await Promise.all([
        getGroupEnrollmentHistory(groupId, enrollmentFilters),
        getGroupInstructorHistory(groupId),
        getGroupLifecycleHistory(groupId),
        getGroupCourseHistory(groupId),
        getGroupEnrollmentTransitions(groupId),
      ])

      setEnrollmentHistory(enrollmentData.items)
      setEnrollmentPagination(prev => ({ ...prev, total: enrollmentData.total }))
      setInstructorHistory(Array.isArray(instructorData) ? instructorData : [])
      setLifecycleHistory(lifecycleData)
      setCourseHistory(Array.isArray(courseData) ? courseData : [])
      setEnrollmentTransitions(Array.isArray(transitionsData) ? transitionsData : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load history data')
    } finally {
      setIsLoadingHistory(false)
    }
  }, [groupId, filters, enrollmentPagination.skip, enrollmentPagination.limit])

  // Fetch analytics data
  const fetchAnalytics = useCallback(async () => {
    console.log(`[useGroupLifecycle] fetchAnalytics starting for groupId: ${groupId}`)
    
    if (!groupId || groupId <= 0) {
      console.error(`[useGroupLifecycle] Invalid groupId: ${groupId}, skipping analytics fetch`)
      setIsLoadingAnalytics(false)
      return
    }
    
    setIsLoadingAnalytics(true)
    try {
      console.log(`[useGroupLifecycle] Calling getGroupLevelAnalytics and getGroupEnrollmentAnalytics`)
      const [levelData, enrollmentData] = await Promise.all([
        getGroupLevelAnalytics(groupId),
        getGroupEnrollmentAnalytics(groupId, { limit: 100 }),
      ])

      console.log(`[useGroupLifecycle] Analytics fetched successfully:`, {
        levelDataCount: Array.isArray(levelData) ? levelData.length : 0,
        enrollmentData: enrollmentData ? 'present' : 'null',
      })
      
      setLevelAnalytics(Array.isArray(levelData) ? levelData : [])
      setEnrollmentAnalytics(enrollmentData)
    } catch (err) {
      console.error('[useGroupLifecycle] Failed to load analytics:', {
        error: err,
        message: err instanceof Error ? err.message : 'Unknown error',
        groupId,
      })
    } finally {
      setIsLoadingAnalytics(false)
    }
  }, [groupId])

  // Initial load
  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  useEffect(() => {
    fetchAnalytics()
  }, [fetchAnalytics])

  const setEnrollmentPage = useCallback((skip: number) => {
    setEnrollmentPagination(prev => ({ ...prev, skip }))
  }, [])

  const completeLevel = useCallback(async (levelNumber: number): Promise<CompleteLevelResponse> => {
    const result = await completeGroupLevel(groupId, levelNumber)
    await fetchHistory()
    await fetchAnalytics()
    return result
  }, [groupId, fetchHistory, fetchAnalytics])

  const cancelLevel = useCallback(async (levelNumber: number, reason?: string): Promise<CancelLevelResponse> => {
    const result = await cancelGroupLevel(groupId, levelNumber, reason)
    await fetchHistory()
    await fetchAnalytics()
    return result
  }, [groupId, fetchHistory, fetchAnalytics])

  return {
    enrollmentHistory,
    instructorHistory,
    lifecycleHistory,
    courseHistory,
    enrollmentTransitions,
    levelAnalytics,
    enrollmentAnalytics,
    isLoadingHistory,
    isLoadingAnalytics,
    error,
    pagination: {
      enrollment: enrollmentPagination,
    },
    filters,
    setFilters,
    setEnrollmentPage,
    completeLevel,
    cancelLevel,
    refresh: fetchHistory,
    refreshAnalytics: fetchAnalytics,
  }
}
