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
