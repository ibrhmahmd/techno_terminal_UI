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
  GroupLevelPublic,
  EnrollmentHistoryDTO,
  InstructorAssignmentDTO,
  CreateNewLevelInput,
  GroupLifecycleHistoryDTO,
  CompleteLevelResponse,
  CancelLevelResponse,
  CourseAssignmentDTO,
  EnrollmentTransitionDTO,
  GroupLevelAnalyticsDTO,
  GroupEnrollmentAnalyticsDTO,
  AnalyticsFilters,
  GenerateLevelSessionsRequest,
  /** @deprecated */
  ScheduleGroupLevelInput,
  /** @deprecated */
  ScheduleGroupLevelResponse,
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

// get level progression history for a group
export async function getGroupLevels(
  groupId: number,
): Promise<GroupLevelHistoryDTO[]> {
  const response = await client.get<
    { data: GroupLevelHistoryDTO[]; total: number; skip: number; limit: number }
  >(`/academics/groups/${groupId}/levels`);
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

// create new level for a group
export async function createNewLevel(
  groupId: number,
  data: CreateNewLevelInput,
): Promise<GroupLevelHistoryDTO> {
  const response = await client.post<ApiResponse<GroupLevelHistoryDTO>>(
    `/academics/groups/${groupId}/levels`,
    data,
  );
  return response.data.data;
}

/**
 * @deprecated Use progressGroupLevel from './core' instead.
 * The schedule-level endpoint has been replaced by progress-level.
 */
export async function scheduleGroupLevel(
  groupId: number,
  data: ScheduleGroupLevelInput,
): Promise<ScheduleGroupLevelResponse> {
  const response = await client.post<ApiResponse<ScheduleGroupLevelResponse>>(
    `/academics/groups/${groupId}/schedule-level`,
    data,
  );
  return response.data.data;
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

// Get full lifecycle history with timeline
export async function getGroupLifecycleHistory(
  groupId: number,
): Promise<GroupLifecycleHistoryDTO> {
  const response = await client.get<ApiResponse<GroupLifecycleHistoryDTO>>(
    `/academics/groups/${groupId}/history`,
  );
  return response.data.data;
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

// Get course assignment history
export async function getGroupCourseHistory(
  groupId: number,
): Promise<CourseAssignmentDTO[]> {
  const response = await client.get<ApiResponse<CourseAssignmentDTO[]>>(
    `/academics/groups/${groupId}/courses/history`,
  );
  return response.data.data || [];
}

// Get enrollment transitions
export async function getGroupEnrollmentTransitions(
  groupId: number,
  studentId?: number,
): Promise<EnrollmentTransitionDTO[]> {
  const response = await client.get<ApiResponse<EnrollmentTransitionDTO[]>>(
    `/academics/groups/${groupId}/enrollments/history`,
    { params: studentId ? { student_id: studentId } : undefined },
  );
  return response.data.data || [];
}

// Get level analytics
export async function getGroupLevelAnalytics(
  groupId: number,
): Promise<GroupLevelAnalyticsDTO[]> {
  console.log(`[getGroupLevelAnalytics] Starting request for groupId: ${groupId}`);
  
  if (!groupId || groupId <= 0) {
    console.error(`[getGroupLevelAnalytics] Invalid groupId: ${groupId}`);
    throw new Error(`Invalid group ID: ${groupId}`);
  }
  
  try {
    const response = await client.get<ApiResponse<GroupLevelAnalyticsDTO[]>>(
      `/academics/groups/${groupId}/levels/analytics`,
    );
    console.log(`[getGroupLevelAnalytics] Success for groupId: ${groupId}, items: ${response.data.data?.length ?? 0}`);
    return response.data.data || [];
  } catch (error) {
    const axiosError = error as { response?: { status?: number; statusText?: string; data?: unknown } };
    const responseData = axiosError?.response?.data;
    console.error(`[getGroupLevelAnalytics] Failed for groupId: ${groupId}`, {
      error,
      status: axiosError?.response?.status,
      statusText: axiosError?.response?.statusText,
      responseData,
      responseDataStringified: responseData ? JSON.stringify(responseData, null, 2) : 'No data',
    });
    throw error;
  }
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
