/**
 * Groups API - Lifecycle Router Functions
 * Group Lifecycle Router: docs/api/academics/group_lifecycle.md
 * 
 * Endpoints:
 * - GET /academics/groups/{group_id}/history - Get lifecycle history
 * - GET /academics/groups/{group_id}/levels - Get level progression history
 * - GET /academics/groups/{group_id}/enrollment-history - Get enrollment history
 * - POST /academics/groups/{group_id}/generate-sessions - Generate level sessions
 * - GET /academics/groups/{group_id}/instructor-history - Get instructor history
 */

import client from "../../client";
import type { ApiResponse } from "../../../types/api";
import type { EnrollmentHistoryFilters } from "../types/common";
import type {
  GroupLevelHistoryDTO,
  EnrollmentHistoryDTO,
  InstructorAssignmentDTO,
} from "../types/groups";

// generate level sessions manually
export async function generateLevelSessions(groupId: number): Promise<void> {
  await client.post(`/academics/groups/${groupId}/generate-sessions`);
}

// get level progression history for a group
export async function getGroupLevels(
  groupId: number,
): Promise<GroupLevelHistoryDTO[]> {
  const response = await client.get<ApiResponse<GroupLevelHistoryDTO[]>>(
    `/academics/groups/${groupId}/levels`,
  );
  return response.data.data || [];
}

// get enrollment history for a group
export async function getGroupEnrollmentHistory(
  groupId: number,
  filters?: EnrollmentHistoryFilters,
): Promise<{ items: EnrollmentHistoryDTO[]; total: number }> {
  const response = await client.get<
    ApiResponse<{ items: EnrollmentHistoryDTO[]; total: number }>
  >(`/academics/groups/${groupId}/enrollment-history`, {
    params: filters,
  });
  return (
    response.data.data || {
      items: [],
      total: 0,
    }
  );
}

// get instructor assignment history for a group
export async function getGroupInstructorHistory(
  groupId: number,
): Promise<InstructorAssignmentDTO[]> {
  const response = await client.get<ApiResponse<InstructorAssignmentDTO[]>>(
    `/academics/groups/${groupId}/instructor-history`,
  );
  return response.data.data || [];
}
