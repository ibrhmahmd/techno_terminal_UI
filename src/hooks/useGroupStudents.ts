import { useState, useEffect, useCallback } from 'react'
import {
  getStudentEnrollmentsSummary,
  deleteEnrollment,
  transferEnrollment,
  type StudentEnrollmentSummary,
  type Enrollment,
} from '../api/enrollments'

interface UseGroupStudentsReturn {
  students: StudentEnrollmentSummary[]
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
  dropStudent: (enrollmentId: number) => Promise<void>
  transferStudent: (enrollmentId: number, toGroupId: number) => Promise<Enrollment>
}

export function useGroupStudents(groupId: number, level?: number): UseGroupStudentsReturn {
  const [students, setStudents] = useState<StudentEnrollmentSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!groupId) return
    
    setIsLoading(true)
    setError(null)
    try {
      const data = await getStudentEnrollmentsSummary(groupId, level ? { level } : undefined)
      console.log('API Response:', data)
      console.log('Type:', typeof data, 'Is Array:', Array.isArray(data))
      // Ensure we always have an array
      setStudents(Array.isArray(data) ? data : [])
    } catch (err: any) {
      console.error('API Error:', err)
      setError(err.message || 'Failed to load students')
    } finally {
      setIsLoading(false)
    }
  }, [groupId, level])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const dropStudent = useCallback(async (enrollmentId: number): Promise<void> => {
    await deleteEnrollment(enrollmentId)
    // Refresh the list after dropping
    await fetchData()
  }, [fetchData])

  const transferStudent = useCallback(async (enrollmentId: number, toGroupId: number): Promise<Enrollment> => {
    const student = students.find(s => s.enrollment_id === enrollmentId)
    if (!student) throw new Error('Student not found')
    
    const result = await transferEnrollment({
      student_id: student.student_id,
      from_group_id: groupId,
      to_group_id: toGroupId,
    })
    // Refresh the list after transfer
    await fetchData()
    return result
  }, [groupId, students, fetchData])

  return {
    students,
    isLoading,
    error,
    refresh: fetchData,
    dropStudent,
    transferStudent,
  }
}
