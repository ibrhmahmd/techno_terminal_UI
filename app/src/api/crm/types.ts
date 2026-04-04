import type { Enrollment } from '../enrollments'

export interface Student {
  id: number
  full_name: string
  date_of_birth?: string | null
  gender?: string | null
  phone?: string | null
  is_active: boolean
  notes?: string | null
  current_group_id?: number | null
  current_group_name?: string | null
}

export interface Parent {
  id: number
  full_name: string
  phone_primary?: string | null
  phone_secondary?: string | null
  email?: string | null
  relation?: string | null
  notes?: string | null
  address?: string | null
  is_active: boolean
}

export interface StudentWithDetails extends Student {
  parents: Parent[]
  enrollments: Enrollment[]
  balance: number
  enrollment_history?: EnrollmentHistory[]
  courses?: CourseRecord[]
  competitions?: CompetitionRecord[]
  teams?: TeamRecord[]
  payments?: PaymentRecord[]
}

export interface EnrollmentHistory {
  id: number
  group_id: number
  group_name: string
  start_date: string
  end_date?: string | null
  status: 'active' | 'completed' | 'dropped'
}

export interface CourseRecord {
  id: number
  course_id: number
  course_name: string
  level?: string | null
  start_date: string
  end_date?: string | null
  status: 'in_progress' | 'completed' | 'dropped'
  final_grade?: string | null
}

export interface CompetitionRecord {
  id: number
  competition_id: number
  competition_name: string
  date: string
  result?: string | null
  achievement?: string | null
}

export interface TeamRecord {
  id: number
  team_id: number
  team_name: string
  role?: string | null
  start_date: string
  end_date?: string | null
  status: 'active' | 'former'
}

export interface PaymentRecord {
  id: number
  amount: number
  payment_date: string
  payment_method?: string | null
  description?: string | null
  status: 'pending' | 'completed' | 'failed' | 'refunded'
}
