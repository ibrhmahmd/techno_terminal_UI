export interface CompetitionParticipationDTO {
  participation_id: number;
  competition_id: number;
  competition_name: string;
  category_id?: number;
  category_name?: string;
  team_id: number;
  team_name: string;
  entered_at: string;
  left_at?: string | null;
  is_active: boolean;
  final_placement?: number | null;
  notes?: string;
}

export interface TeamPublic {
  id: number;
  team_name: string;
  group_id: number;
  coach_id?: number;
  created_at: string;
  is_deleted: boolean;
}

export interface GroupCompetitionHistoryResponseDTO {
  group_id: number;
  group_name: string;
  participations: CompetitionParticipationDTO[];
  total_participations: number;
  active_participations: number;
  completed_participations: number;
}

export interface LinkTeamResponse {
  team_id: number;
  team_name: string;
  group_id: number;
}

export interface CompetitionRegistrationResponse {
  participation_id: number;
  group_id: number;
  team_id: number;
  competition_id: number;
  category_id: number | null;
  entered_at: string;
  is_active: boolean;
  message: string;
}

export interface CompleteParticipationResponse {
  participation_id: number;
  is_active: boolean;
  left_at: string;
  final_placement?: number;
  message: string;
}

export interface WithdrawParticipationResponse {
  participation_id: number;
  status: 'withdrawn';
  withdrawn_at: string;
  message: string;
}
