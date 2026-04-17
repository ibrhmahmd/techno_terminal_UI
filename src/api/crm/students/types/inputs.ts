// Input DTOs for Student API - Create/Update payloads

export interface CreateStudentDTO {
  full_name: string
  date_of_birth?: string | null
  gender?: 'male' | 'female' | null
  phone?: string | null
  parent_id?: number | null
  notes?: string | null
}

export interface UpdateStudentDTO {
  full_name?: string
  date_of_birth?: string | null
  gender?: 'male' | 'female' | null
  phone?: string | null
  notes?: string | null
}

export interface UpdateStudentStatusDTO {
  status: StudentStatus
  notes?: string
}

export interface SetWaitingPriorityDTO {
  priority: number
  notes?: string
}

export interface LinkSiblingDTO {
  sibling_student_id: number
  relationship?: string
  notes?: string
}

export interface BalanceAdjustmentDTO {
  adjustment_amount: number
  reason: string
  adjustment_type: 'correction' | 'refund' | 'discount' | 'other'
}

// Parent DTOs
export interface ParentCreate {
  full_name: string
  phone_primary: string
  phone_secondary?: string | null
  email?: string | null
  relation?: string | null
  notes?: string | null
}

export interface ParentUpdate {
  full_name?: string
  phone_primary?: string
  phone_secondary?: string | null
  email?: string | null
  relation?: string | null
  notes?: string | null
}

// Re-export status type for use in DTOs
import type { StudentStatus } from './models'
export type { StudentStatus }
