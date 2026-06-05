// Student API Utilities and Helpers

import type { Student, StudentStatus } from './types/models'

// Calculate age from date of birth
export function calculateAge(dateOfBirth: string): number {
  const dob = new Date(dateOfBirth)
  const today = new Date()
  let age = today.getFullYear() - dob.getFullYear()
  const monthDiff = today.getMonth() - dob.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--
  }
  
  return age
}

// Get status label
export function getStatusLabel(status: StudentStatus): string {
  const labels: Record<StudentStatus, string> = {
    active: 'Active',
    waiting: 'Waiting List',
    inactive: 'Inactive'
  }
  return labels[status] || status
}

// Check if student is soft-deleted
export function isStudentDeleted(student: Student): boolean {
  return !!student.deleted_at
}
