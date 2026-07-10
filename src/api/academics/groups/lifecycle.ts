/**
 * Groups API - Lifecycle Router Functions
 * Group Lifecycle Router: docs/api/academics/group_lifecycle.md
 * 
 * Endpoints:
 * - POST /academics/groups/{group_id}/generate-sessions - Generate level sessions
 */

import { client } from "../../client";
import type { ApiResponse } from "../../../types/api";
import type { 
  GenerateLevelSessionsRequest,
  UpdateLevelInput,
  DeleteLevelResponse,
  CancelLevelResult,
  GroupLevelPublic,
} from "../types/groups";
import type { Session } from "../types/sessions";

// generate level sessions manually
export async function generateLevelSessions(
  groupId: number,
  data?: GenerateLevelSessionsRequest,
): Promise<Session[]> {
  const response = await client.post<ApiResponse<Session[]>>(
    `/academics/groups/${groupId}/generate-sessions`,
    data,
  );
  return response.data.data || [];
}

// delete a group level (undo progression)
export async function deleteGroupLevel(
  groupId: number,
  levelNumber: number,
): Promise<DeleteLevelResponse> {
  const response = await client.delete<ApiResponse<DeleteLevelResponse>>(
    `/academics/groups/${groupId}/levels/${levelNumber}`,
  );
  return response.data.data;
}

// update group level details (course, instructor, price override, notes)
export async function updateGroupLevel(
  groupId: number,
  levelNumber: number,
  data: UpdateLevelInput,
): Promise<GroupLevelPublic> {
  const response = await client.patch<ApiResponse<GroupLevelPublic>>(
    `/academics/groups/${groupId}/levels/${levelNumber}`,
    data,
  );
  return response.data.data;
}

// cancel group level with reason
export async function cancelGroupLevel(
  groupId: number,
  levelNumber: number,
  reason: string,
): Promise<CancelLevelResult> {
  const response = await client.post<ApiResponse<CancelLevelResult>>(
    `/academics/groups/${groupId}/levels/${levelNumber}/cancel`,
    { reason },
  );
  return response.data.data;
}

