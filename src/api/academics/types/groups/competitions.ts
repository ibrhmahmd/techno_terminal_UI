/**
 * Competition-related types for groups
 * Aligned with API documentation: docs/api/academics/group_competitions.md
 */

/**
 * Competition participation record for a group
 */
export interface CompetitionParticipationDTO {
  id: number;
  competition_id: number;
  competition_name: string;
  level_at_time: number;
  event_date: string;
  result?: 'winner' | 'runner_up' | 'participant' | 'disqualified';
  score?: number;
  notes?: string;
}

/**
 * Team public information
 */
export interface TeamPublic {
  id: number;
  name: string;
  group_id: number;
  group_name: string;
  competition_id: number;
  competition_name: string;
  created_at: string;
  members_count: number;
}

/**
 * Paginated team response
 */
export interface PaginatedTeamResponse {
  data: TeamPublic[];
  total: number;
  skip: number;
  limit: number;
}

/**
 * Team member information
 */
export interface TeamMemberPublic {
  id: number;
  team_id: number;
  student_id: number;
  student_name: string;
  role: 'leader' | 'member';
  joined_at: string;
}

/**
 * Group competition history response
 */
export interface GroupCompetitionHistoryResponseDTO {
  group_id: number;
  group_name: string;
  competitions: CompetitionParticipationDTO[];
  total_competitions: number;
  wins: number;
  runner_ups: number;
}

/**
 * Response from linking a team to a group
 * POST /academics/groups/{group_id}/teams/{team_id}/link
 */
export interface LinkTeamResponse {
  team_id: number;
  team_name: string;
  group_id: number;
}

/**
 * Response from registering for a competition
 * POST /academics/groups/{group_id}/competitions/{competition_id}/register
 */
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

/**
 * Response from completing competition participation
 * PATCH /academics/groups/{group_id}/competitions/{participation_id}/complete
 */
export interface CompleteParticipationResponse {
  participation_id: number;
  is_active: boolean;
  left_at: string;
  final_placement?: number;
  message: string;
}

/**
 * Response from withdrawing from competition
 * DELETE /academics/groups/{group_id}/competitions/{participation_id}
 */
export interface WithdrawParticipationResponse {
  participation_id: number;
  status: 'withdrawn';
  withdrawn_at: string;
  message: string;
}
