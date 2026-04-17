// Student Entity Models - Core data structures from API

export type StudentStatus = 'active' | 'waiting' | 'inactive'

export interface Student {
  id: number
  full_name: string
  date_of_birth?: string | null
  gender?: 'male' | 'female'  | null
  phone?: string | null
  status: StudentStatus
  notes?: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface StudentListItem {
  id: number
  full_name: string
  phone?: string | null
  status: StudentStatus
  date_of_birth?: string | null
  gender?: 'male' | 'female'  | null
}

export interface StudentWithDetails extends Student {
  age?: number
  school_name?: string | null
  waiting_since?: string | null
  waiting_priority?: number | null
  waiting_notes?: string | null
  primary_parent?: ParentInfo | null
  current_enrollment?: CurrentEnrollmentInfo | null
  enrollments: EnrollmentInfo[]
  balance_summary: StudentBalanceSummary
  siblings: SiblingInfo[]
  sessions_attended_count: number
  sessions_absent_count: number
  last_session_attended?: string | null
  attendance_stats: AttendanceStatsDTO
}

export interface ParentInfo {
  id: number
  full_name: string
  phone?: string | null
  email?: string | null
  relationship?: string | null
}

export interface CurrentEnrollmentInfo {
  enrollment_id: number
  group_id: number
  group_name: string
  course_id: number
  course_name: string
  level_number: number
  instructor_name?: string | null
}

export interface Parent {
  id: number
  full_name: string
  phone_primary: string
  phone_secondary?: string | null
  email?: string | null
  relation?: string | null
  notes?: string | null
}

export interface ParentListItem {
  id: number
  full_name: string
  phone_primary: string
}

export interface EnrollmentInfo {
  enrollment_id: number
  group_id: number
  group_name: string
  course_name: string
  level_number: number
  status: string
  enrolled_at: string
  dropped_at?: string | null
}

export interface StudentBalanceSummary {
  total_due: number
  total_discount: number
  total_paid: number
  net_balance: number
}

export interface AttendanceStatsDTO {
  attended: number
  absent: number
  late: number
}

export interface SiblingInfo {
  id: number
  full_name: string
  date_of_birth?: string | null
  age?: number
  gender?: 'male' | 'female'  | null
  parent_name?: string | null
  enrollment_count: number
}

// Status Summary
export interface StudentStatusSummary {
  active: number
  waiting: number
  inactive: number
}
