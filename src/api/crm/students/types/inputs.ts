// Input DTOs for Student API - Create/Update payloads

export interface CreateStudentDTO {
  full_name: string
  date_of_birth: string
  parent_id?: number
  school?: string
  grade?: string
  notes?: string
}

export interface UpdateStudentDTO {
  full_name?: string
  date_of_birth?: string
  school?: string
  grade?: string
  notes?: string
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

// Re-export status type for use in DTOs
import type { StudentStatus } from './models'
export type { StudentStatus }
