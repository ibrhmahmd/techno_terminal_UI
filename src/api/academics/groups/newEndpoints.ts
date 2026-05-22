import { client } from '../../client'
import type { ApiResponse } from '../../../types/api'

// ============================================================================
// Types
// ============================================================================

export interface DeleteLevelResponse {
  level_id: number
  level_number: number
  group_id: number
  deleted_at: string
}

export interface CourseInfoDTO {
  course_id: number
  course_name: string
  description: string | null
}

export interface InstructorInfoDTO {
  instructor_id: number
  instructor_name: string
}

export interface LevelSessionDTO {
  session_id: number
  session_number: number
  date: string
  time_start: string
  time_end: string
  status: 'scheduled' | 'completed' | 'cancelled'
  is_extra_session: boolean
  actual_instructor_id: number | null
  is_substitute: boolean
}

export interface LevelPaymentSummaryDTO {
  total_expected: number
  total_collected: number
  total_due: number
  collection_rate: number
  unpaid_students_count: number
}

export interface LevelDetailDTO {
  level_number: number
  level_id: number
  course_id: number
  instructor_id: number
  status: 'active' | 'completed' | 'cancelled'
  start_date: string
  end_date: string | null
  sessions: LevelSessionDTO[]
  students_count: number
  students_completed: number
  students_dropped: number
  payment_summary: LevelPaymentSummaryDTO
}

export interface DetailedLevelsResponse {
  group_id: number
  generated_at: string
  cache_ttl: number
  courses: Record<string, CourseInfoDTO>
  instructors: Record<string, InstructorInfoDTO>
  levels: LevelDetailDTO[]
}

export interface AttendanceRosterDTO {
  student_id: number
  student_name: string
  enrollment_id: number
  billing_status: 'paid' | 'due' | 'partial'
  joined_at: string
}

export interface AttendanceSessionDTO {
  session_id: number
  session_number: number
  date: string
  time_start: string
  time_end: string
  status: 'scheduled' | 'completed' | 'cancelled'
  is_extra_session: boolean
  attendance: Record<string, 'present' | 'absent' | 'excused' | 'late' | null>
}

export interface AttendanceLevelResponse {
  group_id: number
  level_number: number
  generated_at: string
  cache_ttl: number
  roster: AttendanceRosterDTO[]
  sessions: AttendanceSessionDTO[]
}

export interface PaymentDetailDTO {
  payment_id: number
  student_id: number
  student_name: string
  amount: number
  discount_amount: number
  payment_date: string
  payment_method: 'cash' | 'card' | 'bank_transfer' | 'wallet'
  status: 'completed' | 'pending' | 'failed' | 'refunded'
  receipt_number: string | null
  transaction_type: 'payment' | 'refund' | 'adjustment'
}

export interface LevelPaymentsDTO {
  level_number: number
  level_status: string
  course_name: string
  expected: number
  collected: number
  due: number
  total_students: number
  paid_count: number
  unpaid_count: number
  payments: PaymentDetailDTO[]
}

export interface GroupPaymentsSummaryDTO {
  total_expected_all_levels: number
  total_collected_all_levels: number
  total_due_all_levels: number
  collection_rate: number
}

export interface GroupPaymentsResponse {
  group_id: number
  generated_at: string
  cache_ttl: number
  summary: GroupPaymentsSummaryDTO
  by_level: LevelPaymentsDTO[]
}

export interface EnrollmentStudentDTO {
  student_id: number
  student_name: string
  phone: string | null
  parent_name: string | null
}

export interface EnrollmentDetailDTO {
  enrollment_id: number
  student_id: number
  status: 'active' | 'completed' | 'dropped'
  enrolled_at: string
  dropped_at: string | null
  sessions_attended: number
  sessions_total: number
  payment_status: 'paid' | 'due' | 'partial'
  amount_due: number
  amount_paid: number
  discount_applied: number
  can_transfer: boolean
  can_drop: boolean
}

export interface EnrollmentSummaryDTO {
  total: number
  active: number
  completed: number
  dropped: number
  paid: number
  unpaid: number
}

export interface LevelEnrollmentGroupDTO {
  level_number: number
  level_status: string
  course_name: string
  enrollments: EnrollmentDetailDTO[]
  summary: EnrollmentSummaryDTO
}

export interface TransferOptionDTO {
  group_id: number
  group_name: string
  course_name: string
  available_slots: number
}

export interface GroupEnrollmentsAllResponse {
  group_id: number
  generated_at: string
  cache_ttl: number
  students: Record<string, EnrollmentStudentDTO>
  grouped_by_level: LevelEnrollmentGroupDTO[]
  transfer_options: TransferOptionDTO[]
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Get detailed levels with sessions for a group
 * Uses lookup table pattern for courses and instructors
 * Auth: require_any
 * 
 * @param groupId - The group ID
 * @param levelNumber - Optional. If provided, returns only that specific level via query param
 * 
 * Usage:
 *   - GET /academics/groups/{group_id}/levels/detailed - returns all levels
 *   - GET /academics/groups/{group_id}/levels/detailed?level_number=3 - returns specific level
 */
export async function getDetailedLevels(
  groupId: number,
  levelNumber?: number
): Promise<DetailedLevelsResponse> {
  const url = `/academics/groups/${groupId}/levels/detailed`
  const params = levelNumber ? { level_number: levelNumber } : undefined
  
  const response = await client.get<ApiResponse<DetailedLevelsResponse>>(
    url,
    params ? { params } : undefined
  )
  return response.data.data
}

/**
 * Get consolidated attendance data for a specific level
 * Returns roster and sessions with attendance map
 * Auth: require_any
 */
export async function getAttendanceForLevel(
  groupId: number,
  levelNumber: number
): Promise<AttendanceLevelResponse> {
  const response = await client.get<ApiResponse<AttendanceLevelResponse>>(
    `/academics/groups/${groupId}/attendance`,
    { params: { level_number: levelNumber } }
  )
  return response.data.data
}

/**
 * Get all payments for a group, grouped by level
 * Auth: require_any
 */
export async function getGroupPayments(
  groupId: number
): Promise<GroupPaymentsResponse> {
  const response = await client.get<ApiResponse<GroupPaymentsResponse>>(
    `/finance/groups/${groupId}/payments`
  )
  return response.data.data
}

/**
 * Get all enrollments for a group, grouped by level
 * Includes transfer options for active enrollments
 * Auth: require_any
 */
export async function getGroupEnrollmentsAll(
  groupId: number
): Promise<GroupEnrollmentsAllResponse> {
  const response = await client.get<ApiResponse<GroupEnrollmentsAllResponse>>(
    `/academics/groups/${groupId}/enrollments/all`
  )
  return response.data.data
}

