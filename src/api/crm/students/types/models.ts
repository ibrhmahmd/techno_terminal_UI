// Student Entity Models - Core data structures from API

export type StudentStatus = 'active' | 'waiting' | 'inactive'

export interface Student {
  id: number
  full_name: string
  phone?: string
  email?: string
  gender?: 'male' | 'female' | 'other'
  date_of_birth: string
  age?: number
  school?: string
  grade?: string
  status: StudentStatus
  priority?: number
  notes?: string
  parent_id?: number
  parent_name?: string
  created_at: string
  updated_at: string
}

export interface StudentWithDetails extends Student {
  parent?: Parent
  enrollments?: EnrollmentInfo[]
  siblings?: SiblingInfo[]
  balance?: StudentBalanceSummary
}

export interface Parent {
  id: number
  full_name: string
  phone?: string
  phone_primary?: string
  phone_secondary?: string
  email?: string
  whatsapp?: string
  address?: string
  relation?: string
}

export interface EnrollmentInfo {
  id: number
  group_id: number
  group_name: string
  course_name: string
  level_number: number
  status: string
  enrolled_at: string
}

export interface StudentBalanceSummary {
  total_amount_due: number
  total_discounts: number
  total_paid: number
  net_balance: number
}

export interface SiblingInfo {
  student_id: number
  full_name: string
  age: number
  parent_id: number
  parent_name: string
}

// Status Summary
export interface StudentStatusSummary {
  total: number
  active: number
  waiting: number
  inactive: number
}
