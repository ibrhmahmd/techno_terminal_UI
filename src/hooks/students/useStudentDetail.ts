import { useState, useEffect, useCallback } from 'react'
import { getStudentById, getStudentWithDetails } from '../../api/crm/students/core'
import { getStudentBalance } from '../../api/crm/students/finance'
import { getStudentSiblings } from '../../api/crm/students/siblings'
import type { Student, StudentBalance, SiblingInfo, StudentWithDetails } from '../../api/crm/students'
import { AxiosError } from 'axios'

interface UseStudentDetailReturn {
  // Core data
  student: Student | null
  details: StudentWithDetails | null
  balance: StudentBalance | null
  siblings: SiblingInfo[]
  
  // Loading states (granular)
  loadingStudent: boolean
  loadingBalance: boolean
  loadingSiblings: boolean
  loadingDetails: boolean
  
  // Combined loading state
  isLoading: boolean
  
  // Error states
  error: string | null
  studentError: string | null
  balanceError: string | null
  siblingsError: string | null
  detailsError: string | null
  
  // Actions
  refresh: () => Promise<void>
  refreshStudent: () => Promise<void>
  refreshBalance: () => Promise<void>
  refreshSiblings: () => Promise<void>
  refreshDetails: () => Promise<void>
}

export function useStudentDetail(studentId: number | null): UseStudentDetailReturn {
  // Core data
  const [student, setStudent] = useState<Student | null>(null)
  const [details, setDetails] = useState<StudentWithDetails | null>(null)
  const [balance, setBalance] = useState<StudentBalance | null>(null)
  const [siblings, setSiblings] = useState<SiblingInfo[]>([])
  
  // Loading states
  const [loadingStudent, setLoadingStudent] = useState(false)
  const [loadingBalance, setLoadingBalance] = useState(false)
  const [loadingSiblings, setLoadingSiblings] = useState(false)
  const [loadingDetails, setLoadingDetails] = useState(false)
  
  // Error states
  const [studentError, setStudentError] = useState<string | null>(null)
  const [balanceError, setBalanceError] = useState<string | null>(null)
  const [siblingsError, setSiblingsError] = useState<string | null>(null)
  const [detailsError, setDetailsError] = useState<string | null>(null)

  // Fetch student basic info
  const refreshStudent = useCallback(async () => {
    if (!studentId) return
    setLoadingStudent(true)
    setStudentError(null)
    try {
      const data = await getStudentById(studentId)
      setStudent(data)
    } catch (err) {
      const axiosErr = err as AxiosError<{ detail?: string }>
      setStudentError(axiosErr.response?.data?.detail || 'Failed to load student')
    } finally {
      setLoadingStudent(false)
    }
  }, [studentId])

  // Fetch student details (includes parents, enrollments)
  const refreshDetails = useCallback(async () => {
    if (!studentId) return
    setLoadingDetails(true)
    setDetailsError(null)
    try {
      const data = await getStudentWithDetails(studentId)
      setDetails(data)
    } catch (err) {
      const axiosErr = err as AxiosError<{ detail?: string }>
      setDetailsError(axiosErr.response?.data?.detail || 'Failed to load student details')
    } finally {
      setLoadingDetails(false)
    }
  }, [studentId])

  // Fetch finance balance
  const refreshBalance = useCallback(async () => {
    if (!studentId) return
    setLoadingBalance(true)
    setBalanceError(null)
    try {
      const data = await getStudentBalance(studentId)
      setBalance(data)
    } catch (err) {
      const axiosErr = err as AxiosError<{ detail?: string }>
      setBalanceError(axiosErr.response?.data?.detail || 'Failed to load balance')
    } finally {
      setLoadingBalance(false)
    }
  }, [studentId])

  // Fetch siblings
  const refreshSiblings = useCallback(async () => {
    if (!studentId) return
    setLoadingSiblings(true)
    setSiblingsError(null)
    try {
      const data = await getStudentSiblings(studentId)
      setSiblings(data)
    } catch (err) {
      const axiosErr = err as AxiosError<{ detail?: string }>
      setSiblingsError(axiosErr.response?.data?.detail || 'Failed to load siblings')
    } finally {
      setLoadingSiblings(false)
    }
  }, [studentId])

  // Refresh all data
  const refresh = useCallback(async () => {
    await Promise.all([
      refreshStudent(),
      refreshDetails(),
      refreshBalance(),
      refreshSiblings()
    ])
  }, [refreshStudent, refreshDetails, refreshBalance, refreshSiblings])

  // Initial load
  useEffect(() => {
    if (studentId) {
      refresh()
    }
  }, [studentId, refresh])

  // Combined loading state
  const isLoading = loadingStudent || loadingBalance || loadingSiblings || loadingDetails
  
  // Combined error
  const error = studentError || balanceError || siblingsError || detailsError

  return {
    student,
    details,
    balance,
    siblings,
    loadingStudent,
    loadingBalance,
    loadingSiblings,
    loadingDetails,
    isLoading,
    error,
    studentError,
    balanceError,
    siblingsError,
    detailsError,
    refresh,
    refreshStudent,
    refreshBalance,
    refreshSiblings,
    refreshDetails
  }
}
