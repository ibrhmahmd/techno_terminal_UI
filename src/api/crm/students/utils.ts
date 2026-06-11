// Student API Utilities and Helpers

import type { Student, StudentListItem, StudentFilterItem, StudentStatus } from './types/models'

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

// Type guard: narrow StudentListItem | StudentFilterItem union to StudentListItem
export function isStudentListItem(item: StudentListItem | StudentFilterItem): item is StudentListItem {
  return !('age' in item)
}

// Mapper: convert StudentFilterItem to StudentListItem for edit flows
export function toStudentListItem(filter: StudentFilterItem): StudentListItem {
  return {
    id: filter.id,
    full_name: filter.full_name,
    phone: filter.phone,
    status: filter.status,
    date_of_birth: filter.date_of_birth,
    gender: filter.gender === 'unknown' ? null : filter.gender,
    grade: filter.grade,
    has_unpaid_balance: filter.has_unpaid_balance,
    current_group_name: filter.current_group_name,
  }
}
