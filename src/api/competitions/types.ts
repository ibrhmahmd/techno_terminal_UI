export interface Competition {
  id: number
  name: string
  edition?: string | null
  competition_date?: string | null
  location: string
  notes?: string | null
  fee_per_student: number
  created_at: string
  // Keeping optional fields for extended API responses
  description?: string
  start_date?: string
  end_date?: string
  registration_deadline?: string
  status?: 'upcoming' | 'active' | 'completed' | 'cancelled'
  registered_teams?: number
  total_participants?: number
  fee_per_participant?: number
  categories?: CompetitionCategory[]
}

export interface CompetitionCategory {
  id: string
  competition_id: string
  name: string
  description?: string
  min_age?: number
  max_age?: number
  max_team_size: number
  registered_teams: number
}

export interface TeamRegistration {
  id: string
  category_id: string
  team_name: string
  members: TeamMember[]
  registration_date: string
  payment_status: 'pending' | 'paid' | 'waived'
  total_fee: number
}

export interface TeamMember {
  id: string
  student_id: string
  student_name: string
  role: 'leader' | 'member'
  fee_paid: boolean
}

export interface CreateCompetitionInput {
  name: string
  edition?: string
  competition_date?: string
  location: string
  notes?: string
  fee_per_student: number
  // Legacy fields for compatibility
  description?: string
  start_date?: string
  end_date?: string
  registration_deadline?: string
  max_teams?: number
  fee_per_participant?: number
}

export interface UpdateCompetitionInput {
  name?: string
  edition?: string
  competition_date?: string
  location?: string
  notes?: string
  fee_per_student?: number
  // Legacy fields for compatibility
  description?: string
  start_date?: string
  end_date?: string
  registration_deadline?: string
  status?: 'upcoming' | 'active' | 'completed' | 'cancelled'
  max_teams?: number
  fee_per_participant?: number
}

export interface CreateCategoryInput {
  name: string
  description?: string
  min_age?: number
  max_age?: number
  max_team_size: number
}

export interface RegisterTeamInput {
  competition_id: string
  category_id: string
  team_name: string
  members: { student_id: string; role: 'leader' | 'member' }[]
}

// API Response Types
export interface PaginatedCompetitionsResponse {
  data: Competition[]
  total: number
  skip: number
  limit: number
}

export interface CompetitionStatsResponse {
  total_teams: number
  total_participants: number
  total_revenue: number
  paid_count: number
  pending_count: number
}

// Re-export types for convenience
export type CompetitionStatus = 'upcoming' | 'active' | 'completed' | 'cancelled'
export type PaymentStatus = 'pending' | 'paid' | 'waived'
