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
): Promise<TeamPublic[]> {
  const response = await client.get<ApiResponse<TeamPublic[]>>(
    `/academics/groups/${groupId}/teams`,
  );
  return response.data.data || [];
}
