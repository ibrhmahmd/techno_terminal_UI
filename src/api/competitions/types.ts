// Competition DTO from API docs
export interface Competition {
  id: number
  name: string
  edition?: string | null
  edition_year?: number | null
  competition_date?: string | null
  location: string
  notes?: string | null
  fee_per_student: number
  created_at: string
  deleted_at?: string | null
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
  subcategories?: string[]
}

// Competition Summary Response (doc schema: competition, categories[], total_teams, total_participants)
export interface CompetitionSummaryResponse {
  competition: Competition
  categories: CompetitionSummaryCategory[]
  total_teams: number
  total_participants: number
}

export interface CompetitionSummaryCategory {
  category: string
  category_id: string
  category_name: string
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
  subcategory?: string
  group_id?: number
  coach_id?: number
  fee: number
  placement_rank?: number
  placement_label?: string
  notes?: string
  created_at: string
}

export interface TeamMemberDTO {
  id: number
  team_id: number
  student_id: number
  member_share: number
  fee_paid: boolean
  payment_id?: number
}

// Helper type for checking if competition is soft-deleted
export function isCompetitionDeleted(competition: Competition): boolean {
  return !!competition.deleted_at
}
