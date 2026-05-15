import { useState, useCallback } from 'react'
import type { StudentFilterParams } from '../../api/crm'

export interface FilterState {
  ageMin: number | ''
  ageMax: number | ''
  status: ('active' | 'waiting' | 'inactive')[]
  gender: ('male' | 'female' | 'unknown')[]
  courseIds: number[]
  groupDays: string[]
  instructorName: string
  hasUnpaidBalance: boolean | null
  enrollmentCountMin: number | ''
  enrollmentCountMax: number | ''
  enrollmentDateFrom: string
  enrollmentDateTo: string
}

const DAY_NAME_MAP: Record<string, string> = {
  'Mon': 'monday',
  'Tue': 'tuesday',
  'Wed': 'wednesday',
  'Thu': 'thursday',
  'Fri': 'friday',
  'Sat': 'saturday',
  'Sun': 'sunday',
}

const initialFilters: FilterState = {
  ageMin: '',
  ageMax: '',
  status: [],
  gender: [],
  courseIds: [],
  groupDays: [],
  instructorName: '',
  hasUnpaidBalance: null,
  enrollmentCountMin: '',
  enrollmentCountMax: '',
  enrollmentDateFrom: '',
  enrollmentDateTo: '',
}

interface UseAdvancedSearchReturn {
  filters: FilterState
  setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void
  resetFilters: () => void
  hasActiveFilters: boolean
  convertToApiParams: () => StudentFilterParams
  getActiveFiltersArray: () => { id: string; label: string; value: string }[]
}

export function useAdvancedSearch(): UseAdvancedSearchReturn {
  const [filters, setFilters] = useState<FilterState>(initialFilters)

  const setFilter = useCallback(<K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }, [])

  const resetFilters = useCallback(() => {
    setFilters(initialFilters)
  }, [])

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (key === 'ageMin' || key === 'ageMax') return value !== ''
    if (key === 'enrollmentCountMin' || key === 'enrollmentCountMax') return value !== ''
    if (key === 'hasUnpaidBalance') return value === true
    if (Array.isArray(value)) return value.length > 0
    if (typeof value === 'string') return value !== ''
    return false
  })

  const convertToApiParams = useCallback((): StudentFilterParams => {
    const params: StudentFilterParams = {}

    if (filters.ageMin !== '') params.min_age = Number(filters.ageMin)
    if (filters.ageMax !== '') params.max_age = Number(filters.ageMax)
    if (filters.status.length > 0) params.status = filters.status
    if (filters.gender.length > 0) params.gender = filters.gender
    if (filters.courseIds.length > 0) params.course_ids = filters.courseIds
    if (filters.groupDays.length > 0) {
      // Map abbreviated day names to full lowercase names for backend
      params.group_default_day = filters.groupDays.map(day => DAY_NAME_MAP[day] || day)
    }
    if (filters.instructorName.trim()) params.instructor_name = filters.instructorName.trim()
    if (filters.hasUnpaidBalance !== null) params.has_unpaid_balance = filters.hasUnpaidBalance
    if (filters.enrollmentCountMin !== '') params.min_enrollments = Number(filters.enrollmentCountMin)
    if (filters.enrollmentCountMax !== '') params.max_enrollments = Number(filters.enrollmentCountMax)
    if (filters.enrollmentDateFrom) params.enrollment_date_from = filters.enrollmentDateFrom
    if (filters.enrollmentDateTo) params.enrollment_date_to = filters.enrollmentDateTo

    return params
  }, [filters])

  const getActiveFiltersArray = useCallback((): { id: string; label: string; value: string }[] => {
    const active: { id: string; label: string; value: string }[] = []

    if (filters.ageMin !== '' || filters.ageMax !== '') {
      active.push({
        id: 'age',
        label: 'Age',
        value: filters.ageMin !== '' && filters.ageMax !== ''
          ? `${filters.ageMin}-${filters.ageMax}y`
          : filters.ageMin !== ''
            ? `${filters.ageMin}+y`
            : `<${filters.ageMax}y`,
      })
    }

    if (filters.status.length > 0) {
      active.push({
        id: 'status',
        label: 'Status',
        value: filters.status.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', '),
      })
    }

    if (filters.gender.length > 0) {
      active.push({
        id: 'gender',
        label: 'Gender',
        value: filters.gender.map(g => g.charAt(0).toUpperCase() + g.slice(1)).join(', '),
      })
    }

    if (filters.groupDays.length > 0) {
      active.push({
        id: 'days',
        label: 'Days',
        value: filters.groupDays.join(', '),
      })
    }

    if (filters.instructorName.trim()) {
      active.push({
        id: 'instructor',
        label: 'Instructor',
        value: filters.instructorName.trim(),
      })
    }

    if (filters.hasUnpaidBalance === true) {
      active.push({
        id: 'balance',
        label: 'Balance',
        value: 'Has unpaid',
      })
    }

    if (filters.enrollmentCountMin !== '' || filters.enrollmentCountMax !== '') {
      active.push({
        id: 'enrollments',
        label: 'Enrollments',
        value: filters.enrollmentCountMin !== '' && filters.enrollmentCountMax !== ''
          ? `${filters.enrollmentCountMin}-${filters.enrollmentCountMax}`
          : filters.enrollmentCountMin !== ''
            ? `${filters.enrollmentCountMin}+`
            : `<${filters.enrollmentCountMax}`,
      })
    }

    if (filters.enrollmentDateFrom || filters.enrollmentDateTo) {
      active.push({
        id: 'dates',
        label: 'Enrolled',
        value: filters.enrollmentDateFrom && filters.enrollmentDateTo
          ? `${filters.enrollmentDateFrom} to ${filters.enrollmentDateTo}`
          : filters.enrollmentDateFrom
            ? `From ${filters.enrollmentDateFrom}`
            : `Until ${filters.enrollmentDateTo}`,
      })
    }

    return active
  }, [filters])

  return {
    filters,
    setFilter,
    resetFilters,
    hasActiveFilters,
    convertToApiParams,
    getActiveFiltersArray,
  }
}
