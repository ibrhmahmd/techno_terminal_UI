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
  deleted_at?: string | null
}

export interface StudentListItem {
  id: number
  full_name: string
  phone?: string | null
  status: StudentStatus
  date_of_birth?: string | null
  gender?: 'male' | 'female'  | null
  grade?: string | null
  has_unpaid_balance?: boolean
  current_group_name?: string | null
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
  enrollment_attendance: StudentEnrollmentAttendanceItem[]  // Sorted by enrollment date (newest first)
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
  student_count?: number
}

export interface EnrollmentInfo {
  enrollment_id: number
  group_id: number
  group_name: string
  course_id: number
  course_name: string
  level_number: number
  status: string
  enrolled_at: string
  dropped_at?: string | null
}

export interface StudentBalanceSummary {
  total_due: number
  total_discount?: number
  total_discounts?: number
  total_paid: number
  net_balance: number
}

export interface AttendanceStatsDTO {
  attended: number
  absent: number
  late: number
}

// Individual session attendance record
export interface SessionAttendanceItem {
  session_date: string  // YYYY-MM-DD
  status: 'present' | 'absent' | 'late' | 'cancelled' | null
}

// Per-enrollment attendance summary with session history
export interface StudentEnrollmentAttendanceItem {
  enrollment_id: number
  group_id: number
  group_name: string
  course_name: string
  level_number: number
  present_count: number   // Includes both 'present' and 'late'
  absent_count: number
  sessions: SessionAttendanceItem[]  // Sorted by session_date (oldest first)
}

// Future API types - for GET /crm/students/{id}/courses endpoint (TODO: Backend)
export interface CourseRecord {
  id: number
  course_name: string
  start_date?: string | null
  end_date?: string | null
  status: 'in_progress' | 'completed' | 'dropped'
  level?: number | null
  final_grade?: string | null
  instructor_name?: string | null
}

// Future API types - for GET /crm/students/{id}/competitions endpoint (TODO: Backend)
export interface CompetitionRecord {
  id: number
  competition_name: string
  date?: string | null
  result?: string | null
  achievement?: string | null
  notes?: string | null
}

// Future API types - for GET /crm/students/{id}/teams endpoint (TODO: Backend)
export interface TeamRecord {
  id: number
  team_name: string
  role?: string | null
  start_date?: string | null
  end_date?: string | null
  status: 'active' | 'former'
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

// Filter result item (matches StudentFilterItemDTO from backend docs)
export interface StudentFilterItem {
  id: number
  full_name: string
  age: number | null
  status: StudentStatus
  gender: 'male' | 'female' | 'unknown' | null
  phone: string | null
  grade?: string | null
  date_of_birth?: string | null
  current_group_id: number | null
  current_group_name: string | null
  group_default_day: string | null
  instructor_id: number | null
  instructor_name: string | null
  current_enrollment_count?: number
  enrolled_courses: number[]
  has_unpaid_balance?: boolean
}

// Filter result wrapper (matches StudentFilterResultDTO from backend docs)
export interface StudentFilterResult {
  students: StudentFilterItem[]
  total: number
  skip: number
  limit: number
}
