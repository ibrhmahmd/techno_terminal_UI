// Student API Utilities and Helpers

import type { Student, StudentStatus, StudentBalanceSummary } from './types/models'

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

// Format student name with age
export function formatStudentDisplay(student: Student): string {
  const age = student.age || calculateAge(student.date_of_birth)
  return `${student.full_name} (${age})`
}

// Check if student has outstanding balance
export function hasOutstandingBalance(balance?: StudentBalanceSummary): boolean {
  if (!balance) return false
  return balance.net_balance < 0
}

// Get balance display amount (positive = credit, negative = debt)
export function getBalanceDisplay(balance?: StudentBalanceSummary): string {
  if (!balance) return '0'
  const amount = Math.abs(balance.net_balance)
  const prefix = balance.net_balance > 0 ? '+' : balance.net_balance < 0 ? '-' : ''
  return `${prefix}${amount.toFixed(2)}`
}

// Get status color/class helper
export function getStatusColorClass(status: StudentStatus): string {
  const colors: Record<StudentStatus, string> = {
    active: 'text-green-600 bg-green-50',
    waiting: 'text-amber-600 bg-amber-50',
    inactive: 'text-slate-600 bg-slate-50'
  }
  return colors[status] || colors.inactive
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
