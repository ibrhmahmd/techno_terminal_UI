import type { Enrollment } from '../enrollments'

export interface Student {
  id: number
  full_name: string
  date_of_birth?: string | null
  gender?: string | null
  phone?: string | null
  is_active: boolean
  notes?: string | null
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
}
