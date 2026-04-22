/**
 * Groups API - Competitions Router Functions
 * Group Competitions Router: docs/api/academics/group_competitions.md
 * 
 * Endpoints:
 * - GET /academics/groups/{group_id}/competitions - Get competition participation
 * - GET /academics/groups/{group_id}/teams - Get teams for group
 */

import client from "../../client";
import type { ApiResponse } from "../../../types/api";
import type {
  CompetitionParticipationDTO,
  TeamPublic,
  LinkTeamResponse,
  CompetitionRegistrationResponse,
  CompleteParticipationResponse,
  WithdrawParticipationResponse,
  GroupCompetitionHistoryResponseDTO,
} from "../types/groups";

// get competition participation records for a group
export async function getGroupCompetitions(
  groupId: number,
): Promise<CompetitionParticipationDTO[]> {
  const response = await client.get<ApiResponse<CompetitionParticipationDTO[]>>(
    `/academics/groups/${groupId}/competitions`,
  );
  return response.data.data || [];
}

// get teams for a group
export async function getGroupTeams(
  groupId: number,
  includeInactive?: boolean,
): Promise<TeamPublic[]> {
  const response = await client.get<ApiResponse<TeamPublic[]>>(
    `/academics/groups/${groupId}/teams`,
    { params: includeInactive ? { include_inactive: true } : undefined },
  );
  return response.data.data || [];
}

// link an existing team to a group
export async function linkTeamToGroup(
  groupId: number,
  teamId: number,
): Promise<LinkTeamResponse> {
  const response = await client.post<ApiResponse<LinkTeamResponse>>(
    `/academics/groups/${groupId}/teams/${teamId}/link`,
  );
  return response.data.data;
}

// register a team for a competition
export async function registerForCompetition(
  groupId: number,
  competitionId: number,
  teamId: number,
  categoryId?: number,
): Promise<CompetitionRegistrationResponse> {
  const response = await client.post<ApiResponse<CompetitionRegistrationResponse>>(
    `/academics/groups/${groupId}/competitions/${competitionId}/register`,
    null,
    { params: { team_id: teamId, ...(categoryId && { category_id: categoryId }) } },
  );
  return response.data.data;
}

// complete competition participation
export async function completeCompetitionParticipation(
  groupId: number,
  participationId: number,
  finalPlacement?: number,
): Promise<CompleteParticipationResponse> {
  const response = await client.patch<ApiResponse<CompleteParticipationResponse>>(
    `/academics/groups/${groupId}/competitions/${participationId}/complete`,
    null,
    { params: finalPlacement ? { final_placement: finalPlacement } : undefined },
  );
  return response.data.data;
}

// withdraw from competition
export async function withdrawFromCompetition(
  groupId: number,
  participationId: number,
  reason?: string,
): Promise<WithdrawParticipationResponse> {
  const response = await client.delete<ApiResponse<WithdrawParticipationResponse>>(
    `/academics/groups/${groupId}/competitions/${participationId}`,
    { params: reason ? { reason } : undefined },
  );
  return response.data.data;
}

// get competition analytics
export async function getGroupCompetitionAnalytics(
  groupId: number,
): Promise<GroupCompetitionHistoryResponseDTO> {
  const response = await client.get<ApiResponse<GroupCompetitionHistoryResponseDTO>>(
    `/academics/groups/${groupId}/competitions/analytics`,
  );
  return response.data.data;
}
