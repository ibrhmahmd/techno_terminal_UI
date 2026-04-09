/**
 * Enrollment types aligned with API documentation
 * docs/api/enrollments.md
 */

/** EnrollmentPublic - Response schema from API */
export interface Enrollment {
  id: number
  student_id: number
  group_id: number
  level_number: number
  status: 'active' | 'completed' | 'dropped'
  amount_due: number
  discount_applied: number
  notes?: string | null
  enrolled_at: string
  // Enriched fields (optional, populated by some endpoints)
  student_name?: string
  group_name?: string
  course_name?: string
}

/** Alias for consistency with API docs */
export type EnrollmentPublic = Enrollment

/** EnrollStudentInput - Request body for creating enrollment */
export interface CreateEnrollmentRequest {
  student_id: number
  group_id: number
  amount_due?: number
  discount?: number
  notes?: string
  created_by?: number
}

/** Response wrapper for create enrollment */
export interface CreateEnrollmentResponse {
  success: boolean
  data: Enrollment
}

/** TransferStudentInput - Request body for transferring */
export interface TransferEnrollmentRequest {
  from_enrollment_id: number
  to_group_id: number
  created_by?: number
}

export interface TransferEnrollmentResponse {
  success: boolean
  data: Enrollment
}

/** ApplyDiscountInput - Request body for applying discount */
export interface ApplyDiscountInput {
  discount_amount: number
}

export interface ApplyDiscountResponse {
  success: boolean
  data: Enrollment
}

/** Delete enrollment response */
export interface DeleteEnrollmentResponse {
  success: boolean
  data: Enrollment
}

/** Get group roster query params */
export interface GetGroupRosterParams {
  level?: number
}

/** Student enrollment summary for group students tab */
export interface StudentEnrollmentSummary {
  student_id: number
  student_name: string
  enrollment_id: number
  level_number: number
  status: 'active' | 'completed' | 'dropped'
  sessions_attended: number
  sessions_total: number
  payment_status: 'paid' | 'due' | 'partial'
  amount_due: number
  discount_applied: number
}

