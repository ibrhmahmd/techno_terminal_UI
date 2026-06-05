// Team DTOs and types for the standalone Teams API

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

export interface UpdateTeamInput {
  team_name?: string
  category?: string
  subcategory?: string
  project_name?: string
  project_description?: string
  group_id?: number
  coach_id?: number
  notes?: string
}

export interface TeamMemberRosterDTO {
  team_member_id: number
  team_id: number
  team_name: string
  student_id: number
  student_name: string
  amount_due: number
  amount_paid: number
}

export interface AddTeamMemberInput {
  student_id: number
  amount_due?: number
}

export interface AddTeamMemberResultDTO {
  team_member_id: number
  student_id: number
  student_name: string
}

export interface PlacementUpdateInput {
  placement_rank: number
  placement_label?: string
}

export interface PayCompetitionFeeInput {
  amount: number
  parent_id?: number
}

export interface PayCompetitionFeeResponseDTO {
  receipt_number: string
  payment_id: number
  amount: number
  amount_paid: number
  amount_due: number
}

export interface RefundCompetitionFeeInput {
  amount: number
}

export interface TeamListFilters {
  competition_id: number
  category?: string
  subcategory?: string
  include_members?: boolean
}

// RegisterTeamInput from doc: POST /teams
export interface RegisterTeamInput {
  competition_id: number
  team_name: string
  category: string
  subcategory?: string
  project_name?: string
  project_description?: string
  student_ids: number[]
  student_fees?: Record<string, number>
  coach_id?: number
  group_id?: number
  notes?: string
}

export interface TeamRegistrationResultDTO {
  team: TeamDTO
  members_added: number
}

export interface TeamMemberListResponse {
  team_id: number
  team_name: string
  members: TeamMemberRosterDTO[]
}

export interface TeamWithMembersDTO {
  team: TeamDTO
  members: TeamMemberDTO[]
}

export type TeamGroupByField = 'instructor' | 'category' | 'subcategory' | 'payment_status' | 'placement' | 'alphabetical'

export interface TeamCardData {
  id: number
  team_name: string
  category: string
  subcategory: string | null
  project_name: string | null
  coach_id: number | null
  placement_rank: number | null
  placement_label: string | null
  members: TeamMemberDTO[]
  memberCount: number
  paidCount: number
}

export interface TeamGroup {
  key: string
  label: string
  count: number
  teams: TeamCardData[]
  subgroups?: TeamGroup[]
}

export interface TeamMemberDTO {
  id: number
  team_id: number
  student_id: number
  amount_due: number
  amount_paid: number
}
