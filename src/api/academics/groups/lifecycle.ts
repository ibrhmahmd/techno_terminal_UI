/**
 * Groups API - Lifecycle Router Functions
 * Group Lifecycle Router: docs/api/academics/group_lifecycle.md
 * 
 * Endpoints:
 * - POST /academics/groups/{group_id}/generate-sessions - Generate level sessions
 */

import client from "../../client";
import type { ApiResponse } from "../../../types/api";
import type { GenerateLevelSessionsRequest } from "../types/groups";
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
