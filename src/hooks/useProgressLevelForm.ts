import { useState, useMemo, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getCoursesPaginated } from '../api/academics'
import { getEmployees } from '../api/hr'
import { queryKeys } from './queryKeys'
import type { ProgressGroupLevelRequest } from '../api/academics'
import type { Course } from '../api/academics/types/courses'
import type { EmployeePublic } from '../api/hr/types'

export interface ProgressLevelFormData {
  target_level: number
  instructor_id: number | null
  course_id: number | null
  group_name: string
  session_start_date: string
  price_override: number | null
  auto_migrate_enrollments: boolean
  complete_current_level: boolean
}

export interface UseProgressLevelFormReturn {
  // Form state
  formData: ProgressLevelFormData
  setTargetLevel: (level: number) => void
  setInstructorId: (id: number | null) => void
  setCourseId: (id: number | null) => void
  setGroupName: (name: string) => void
  setSessionStartDate: (date: string) => void
  setPriceOverride: (price: number | null) => void
  setAutoMigrateEnrollments: (value: boolean) => void
  setCompleteCurrentLevel: (value: boolean) => void
  resetForm: (defaults?: Partial<ProgressLevelFormData>) => void

  // Data for selectors
  courses: Course[]
  employees: EmployeePublic[]
  isLoadingCourses: boolean
  isLoadingEmployees: boolean

  // Computed
  isValid: boolean
  toApiRequest: () => ProgressGroupLevelRequest
}

export function useProgressLevelForm(
  _groupId: number,
  initialData?: Partial<ProgressLevelFormData>
): UseProgressLevelFormReturn {
  // Fetch courses for selector
  const { data: coursesData, isLoading: isLoadingCourses } = useQuery({
    queryKey: queryKeys.courses,
    queryFn: async () => {
      const result = await getCoursesPaginated({ skip: 0, limit: 100 })
      return result.items || []
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Fetch employees (instructors) for selector
  const { data: employeesData, isLoading: isLoadingEmployees } = useQuery({
    queryKey: queryKeys.employeesAll,
    queryFn: async () => {
      const result = await getEmployees({ page: 1, page_size: 100 })
      return (result.data || []) as EmployeePublic[]
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  const courses = coursesData || []
  const employees = employeesData || []

  // Calculate default start date (next week from today)
  const defaultStartDate = useMemo(() => {
    const date = new Date()
    date.setDate(date.getDate() + 7)
    return date.toISOString().split('T')[0]
  }, [])

  const [formData, setFormData] = useState<ProgressLevelFormData>({
    target_level: initialData?.target_level || 1,
    instructor_id: initialData?.instructor_id ?? null,
    course_id: initialData?.course_id ?? null,
    group_name: initialData?.group_name || '',
    session_start_date: initialData?.session_start_date || defaultStartDate,
    price_override: initialData?.price_override ?? null,
    auto_migrate_enrollments: initialData?.auto_migrate_enrollments ?? false, // User chooses - default to false
    complete_current_level: initialData?.complete_current_level ?? false, // User chooses - default to false
  })

  const setTargetLevel = useCallback((level: number) => {
    setFormData(prev => ({ ...prev, target_level: level }))
  }, [])

  const setInstructorId = useCallback((id: number | null) => {
    setFormData(prev => ({ ...prev, instructor_id: id }))
  }, [])

  const setCourseId = useCallback((id: number | null) => {
    setFormData(prev => ({ ...prev, course_id: id }))
  }, [])

  const setGroupName = useCallback((name: string) => {
    setFormData(prev => ({ ...prev, group_name: name }))
  }, [])

  const setSessionStartDate = useCallback((date: string) => {
    setFormData(prev => ({ ...prev, session_start_date: date }))
  }, [])

  const setPriceOverride = useCallback((price: number | null) => {
    setFormData(prev => ({ ...prev, price_override: price }))
  }, [])

  const setAutoMigrateEnrollments = useCallback((value: boolean) => {
    setFormData(prev => ({ ...prev, auto_migrate_enrollments: value }))
  }, [])

  const setCompleteCurrentLevel = useCallback((value: boolean) => {
    setFormData(prev => ({ ...prev, complete_current_level: value }))
  }, [])

  const resetForm = useCallback((defaults?: Partial<ProgressLevelFormData>) => {
    setFormData({
      target_level: defaults?.target_level || 1,
      instructor_id: defaults?.instructor_id ?? null,
      course_id: defaults?.course_id ?? null,
      group_name: defaults?.group_name || '',
      session_start_date: defaults?.session_start_date || defaultStartDate,
      price_override: defaults?.price_override ?? null,
      auto_migrate_enrollments: defaults?.auto_migrate_enrollments ?? false,
      complete_current_level: defaults?.complete_current_level ?? false,
    })
  }, [defaultStartDate])

  // Validation - target_level is required and must be > 0
  const isValid = formData.target_level > 0

  // Convert form data to API request format
  const toApiRequest = (): ProgressGroupLevelRequest => {
    const request: ProgressGroupLevelRequest = {
      target_level: formData.target_level,
      auto_migrate_enrollments: formData.auto_migrate_enrollments,
      complete_current_level: formData.complete_current_level,
    }

    // Only include optional fields if they have values
    if (formData.instructor_id !== null) {
      request.instructor_id = formData.instructor_id
    }
    if (formData.course_id !== null) {
      request.course_id = formData.course_id
    }
    if (formData.group_name.trim()) {
      request.group_name = formData.group_name.trim()
    }
    if (formData.session_start_date) {
      request.session_start_date = formData.session_start_date
    }
    if (formData.price_override !== null && formData.price_override > 0) {
      request.price_override = formData.price_override
    }

    return request
  }

  return {
    formData,
    setTargetLevel,
    setInstructorId,
    setCourseId,
    setGroupName,
    setSessionStartDate,
    setPriceOverride,
    setAutoMigrateEnrollments,
    setCompleteCurrentLevel,
    resetForm,
    courses,
    employees,
    isLoadingCourses,
    isLoadingEmployees,
    isValid,
    toApiRequest,
  }
}
