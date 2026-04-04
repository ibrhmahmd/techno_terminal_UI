export interface Enrollment {
  id: number
  student_id: number
  group_id: number
  student_name?: string
  group_name?: string
  course_name?: string
  level: number
  status: 'active' | 'completed' | 'dropped'
  amount_due: number
  discount: number
  enrolled_on: string
  notes?: string | null
}

export interface CreateEnrollmentRequest {
  student_id: number
  group_id: number
  level: number
  amount_due: number
  discount?: number
  notes?: string
}

export interface CreateEnrollmentResponse {
  success: boolean
  data: {
    id: number
  }
}

export interface TransferEnrollmentRequest {
  student_id: number
  from_group_id: number
  to_group_id: number
  transfer_date?: string
  notes?: string
}

export interface TransferEnrollmentResponse {
  success: boolean
}

export interface DeleteEnrollmentResponse {
  success: boolean
}
