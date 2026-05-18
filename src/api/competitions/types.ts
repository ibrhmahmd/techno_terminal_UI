import type { TeamDTO, TeamMemberDTO, TeamWithMembersDTO } from '../teams/types'

// Competition DTO from API docs
export interface Competition {
  id: number
  name: string
  edition?: string | null
  edition_year?: number | null
  competition_date?: string | null
  location: string | null
  notes?: string | null
  fee_per_student: number
  created_at: string | null
}

// Input for creating a competition
// Doc schema: name(required), edition, competition_date, location, notes, fee_per_student
export interface CreateCompetitionInput {
  name: string
  edition?: string | null
  competition_date?: string | null
  location?: string
  notes?: string | null
  fee_per_student?: number
}

// Input for updating a competition (all optional, partial updates)
export interface UpdateCompetitionInput {
  name?: string
  edition?: string
  edition_year?: number
  competition_date?: string
  location?: string
  fee_per_student?: number
  notes?: string
}

// CategoryResponse from GET /competitions/{id}/categories
// Doc: categories are just string names + subcategories, auto-generated from team registrations
export interface CategoryResponse {
  category: string
  subcategories: string[]
}

export interface CompetitionRecord {
  id: number
  competition_name: string
  date?: string | null
  result?: string | null
  achievement?: string | null
  notes?: string | null
}

// Competition Summary Response (doc schema: competition, categories[], total_teams, total_participants)
export interface CompetitionSummaryResponse {
  competition: Competition
  categories: CategoryWithTeamsDTO[]
  total_teams: number
  total_participants: number
}

export interface CategoryWithTeamsDTO {
  category: string
  subcategory: string | null
  teams: TeamWithMembersDTO[]
}

// Input for creating a competition
// Doc schema: name(required), edition, competition_date, location, notes, fee_per_student
export interface CreateCompetitionInput {
  name: string
  edition?: string | null
  competition_date?: string | null
  location?: string
  notes?: string | null
  fee_per_student?: number
}

// Input for updating a competition (all optional, partial updates)
export interface UpdateCompetitionInput {
  name?: string
  edition?: string
  edition_year?: number
  competition_date?: string
  location?: string
  fee_per_student?: number
  notes?: string
}

// CategoryResponse from GET /competitions/{id}/categories
// Doc: categories are just string names + subcategories, auto-generated from team registrations
export interface CategoryResponse {
  category: string
  subcategories: string[]
}

export interface CompetitionRecord {
  id: number
  competition_name: string
  date?: string | null
  result?: string | null
  achievement?: string | null
  notes?: string | null
}

// Competition Summary Response (doc schema: competition, categories[], total_teams, total_participants)
export interface CompetitionSummaryResponse {
  competition: Competition
  categories: CategoryWithTeamsDTO[]
  total_teams: number
  total_participants: number
}

export interface CategoryWithTeamsDTO {
  category: string
  subcategory: string | null
  teams: TeamWithMembersDTO[]
}

export interface TeamWithMembersDTO {
  team: TeamDTO
  members: TeamMemberDTO[]
}

export interface TeamDTO {
  id: number
  competition_id: number
  team_name: string
  category: string
  subcategory?: string | null
  group_id?: number | null
  coach_id?: number | null
  project_name: string | null
  project_description: string | null
  placement_rank?: number | null
  placement_label?: string | null
  notes?: string | null
  created_at: string | null
}

export interface TeamMemberDTO {
  id: number
  team_id: number
  student_id: number
  amount_due: number
  amount_paid: number
}
