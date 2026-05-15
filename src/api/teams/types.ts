// Team DTOs and types for the standalone Teams API

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
  deleted_at?: string | null
}

export interface UpdateTeamInput {
  team_name?: string
  category?: string
  subcategory?: string
  group_id?: number
  coach_id?: number
  fee?: number
  notes?: string
}

export interface TeamMemberRosterDTO {
  team_member_id: number
  student_id: number
  student_name: string
  member_share: number
  fee_paid: boolean
  payment_id?: number
}

export interface AddTeamMemberInput {
  student_id: number
}

export interface AddTeamMemberResultDTO {
  team_member_id: number
  student_id: number
  student_name: string
}

export interface RemoveTeamMemberResultDTO {
  success: boolean
  team_member_id: number
}

export interface PlacementUpdateInput {
  placement_rank: number
  placement_label?: string
}

export interface PayCompetitionFeeInput {
  student_id: number
  parent_id?: number
}

export interface PayCompetitionFeeResponseDTO {
  receipt_number: string
  payment_id: number
  amount: number
}

export interface TeamListFilters {
  competition_id?: number
  category?: string
  subcategory?: string
  include_members?: boolean
  include_deleted?: boolean
}

// RegisterTeamInput from doc: POST /teams
export interface RegisterTeamInput {
  competition_id: number
  team_name: string
  category: string
  subcategory?: string
  student_ids: number[]
  coach_id?: number
  group_id?: number
  fee?: number
  notes?: string
}

export interface TeamRegistrationResultDTO {
  team: TeamDTO
  members_added: number
}
