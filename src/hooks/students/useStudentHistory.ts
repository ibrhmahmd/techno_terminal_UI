import { useState, useEffect, useCallback } from 'react'
import { getStatusHistory, getAttendanceHistory } from '../../api/crm/students/history'
import type { StatusHistoryRecord, AttendanceHistoryRecord } from '../../api/crm/students'
import type { PaginationResult } from '../../types/pagination'
import { AxiosError } from 'axios'

interface UseStudentHistoryReturn {
  // Data
  statusHistory: StatusHistoryRecord[]
  attendanceHistory: AttendanceHistoryRecord[]
  statusPagination: PaginationResult<StatusHistoryRecord> | null
  attendancePagination: PaginationResult<AttendanceHistoryRecord> | null
  
  // Loading states
  loadingStatus: boolean
  loadingAttendance: boolean
  isLoading: boolean
  
  // Error states
  error: string | null
  statusError: string | null
  attendanceError: string | null
  
  // Actions
  refreshStatus: () => Promise<void>
  refreshAttendance: () => Promise<void>
  refresh: () => Promise<void>
  loadMoreStatus: () => Promise<void>
  loadMoreAttendance: () => Promise<void>
}

interface UseStudentHistoryOptions {
  statusPageSize?: number
  attendancePageSize?: number
}

export function useStudentHistory(
  studentId: number | null,
  options: UseStudentHistoryOptions = {}
): UseStudentHistoryReturn {
  const { statusPageSize = 20, attendancePageSize = 50 } = options
  
  // Data
  const [statusHistory, setStatusHistory] = useState<StatusHistoryRecord[]>([])
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceHistoryRecord[]>([])
  const [statusPagination, setStatusPagination] = useState<PaginationResult<StatusHistoryRecord> | null>(null)
  const [attendancePagination, setAttendancePagination] = useState<PaginationResult<AttendanceHistoryRecord> | null>(null)
  
  // Loading states
  const [loadingStatus, setLoadingStatus] = useState(false)
  const [loadingAttendance, setLoadingAttendance] = useState(false)
  
  // Error states
  const [statusError, setStatusError] = useState<string | null>(null)
  const [attendanceError, setAttendanceError] = useState<string | null>(null)

  // Fetch status history
  const refreshStatus = useCallback(async () => {
    if (!studentId) return
    setLoadingStatus(true)
    setStatusError(null)
    try {
      const result = await getStatusHistory(studentId, { skip: 0, limit: statusPageSize })
      setStatusHistory(result.items)
      setStatusPagination(result)
    } catch (err) {
      const axiosErr = err as AxiosError<{ detail?: string }>
      setStatusError(axiosErr.response?.data?.detail || 'Failed to load status history')
    } finally {
      setLoadingStatus(false)
    }
  }, [studentId, statusPageSize])

  // Fetch attendance history
  const refreshAttendance = useCallback(async () => {
    if (!studentId) return
    setLoadingAttendance(true)
    setAttendanceError(null)
    try {
      const result = await getAttendanceHistory(studentId, { skip: 0, limit: attendancePageSize })
      setAttendanceHistory(result.items)
      setAttendancePagination(result)
    } catch (err) {
      const axiosErr = err as AxiosError<{ detail?: string }>
      setAttendanceError(axiosErr.response?.data?.detail || 'Failed to load attendance history')
    } finally {
      setLoadingAttendance(false)
    }
  }, [studentId, attendancePageSize])

  // Load more status history
  const loadMoreStatus = useCallback(async () => {
    if (!studentId || !statusPagination?.hasMore || loadingStatus) return
    setLoadingStatus(true)
    try {
      const currentSkip = statusHistory.length
      const result = await getStatusHistory(studentId, { skip: currentSkip, limit: statusPageSize })
      setStatusHistory(prev => [...prev, ...result.items])
      setStatusPagination(result)
    } catch (err) {
      const axiosErr = err as AxiosError<{ detail?: string }>
      setStatusError(axiosErr.response?.data?.detail || 'Failed to load more status history')
    } finally {
      setLoadingStatus(false)
    }
  }, [studentId, statusPagination, loadingStatus, statusHistory.length, statusPageSize])

  // Load more attendance history
  const loadMoreAttendance = useCallback(async () => {
    if (!studentId || !attendancePagination?.hasMore || loadingAttendance) return
    setLoadingAttendance(true)
    try {
      const currentSkip = attendanceHistory.length
      const result = await getAttendanceHistory(studentId, { skip: currentSkip, limit: attendancePageSize })
      setAttendanceHistory(prev => [...prev, ...result.items])
      setAttendancePagination(result)
    } catch (err) {
      const axiosErr = err as AxiosError<{ detail?: string }>
      setAttendanceError(axiosErr.response?.data?.detail || 'Failed to load more attendance history')
    } finally {
      setLoadingAttendance(false)
    }
  }, [studentId, attendancePagination, loadingAttendance, attendanceHistory.length, attendancePageSize])

  // Refresh all history
  const refresh = useCallback(async () => {
    await Promise.all([refreshStatus(), refreshAttendance()])
  }, [refreshStatus, refreshAttendance])

  // Initial load
  useEffect(() => {
    if (studentId) {
      refresh()
    }
  }, [studentId, refresh])

  // Combined states
  const isLoading = loadingStatus || loadingAttendance
  const error = statusError || attendanceError

  return {
    statusHistory,
    attendanceHistory,
    statusPagination,
    attendancePagination,
    loadingStatus,
    loadingAttendance,
    isLoading,
    error,
    statusError,
    attendanceError,
    refreshStatus,
    refreshAttendance,
    refresh,
    loadMoreStatus,
    loadMoreAttendance
  }
}
