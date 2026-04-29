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
  GroupLevelPublic,
  EnrollmentHistoryDTO,
  InstructorAssignmentDTO,
  CompleteLevelResponse,
  CancelLevelResponse,
  GroupEnrollmentAnalyticsDTO,
  AnalyticsFilters,
  GenerateLevelSessionsRequest,
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

// Get specific level details
export async function getGroupLevel(
  groupId: number,
  levelNumber: number,
): Promise<GroupLevelPublic> {
  const response = await client.get<ApiResponse<GroupLevelPublic>>(
    `/academics/groups/${groupId}/levels/${levelNumber}`,
  );
  return response.data.data;
}

// Complete a level and progress to next
export async function completeGroupLevel(
  groupId: number,
  levelNumber: number,
): Promise<CompleteLevelResponse> {
  const response = await client.post<ApiResponse<CompleteLevelResponse>>(
    `/academics/groups/${groupId}/levels/${levelNumber}/complete`,
  );
  return response.data.data;
}

// Cancel a level
export async function cancelGroupLevel(
  groupId: number,
  levelNumber: number,
  reason?: string,
): Promise<CancelLevelResponse> {
  const response = await client.post<ApiResponse<CancelLevelResponse>>(
    `/academics/groups/${groupId}/levels/${levelNumber}/cancel`,
    { reason },
  );
  return response.data.data;
}

// Get enrollment analytics
export async function getGroupEnrollmentAnalytics(
  groupId: number,
  filters?: AnalyticsFilters,
): Promise<GroupEnrollmentAnalyticsDTO> {
  const response = await client.get<ApiResponse<GroupEnrollmentAnalyticsDTO>>(
    `/academics/groups/${groupId}/enrollments/analytics`,
    { params: filters },
  );
  return response.data.data;
}
