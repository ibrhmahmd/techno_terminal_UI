/**
 * Groups API - Core Router Functions
 * Main Groups Router: groups-api.md
 * 
 * Endpoints:
 * - GET /academics/groups - List all active groups
 * - GET /academics/groups/{group_id} - Get group by ID
 * - GET /academics/groups/enriched - Get enriched groups
 * - GET /academics/groups/{group_id}/enriched - Get enriched group by ID
 * - POST /academics/groups - Create new group
 * - PATCH /academics/groups/{group_id} - Update group
 * - DELETE /academics/groups/{group_id} - Delete group
 * - POST /academics/groups/{group_id}/progress-level - Level up group
 * - GET /academics/groups/grouped - Get grouped groups
 * - GET /academics/groups/{group_id}/sessions - List sessions for group
 * - GET /academics/groups/search - Search groups by name
 * - GET /academics/groups/archived - List archived (completed) groups
 * - GET /academics/groups/by-course/{course_id} - Groups for a course
 * - GET /academics/groups/by-type/{group_type} - Groups by type
 */

import client from "../../client";
import type { PaginationParams, PaginationResult } from "../../../types/pagination";
import type { ApiResponse, PaginatedApiResponse } from "../../../types/api";
import type {
  Group,
  EnrichedGroupPublic,
  RawEnrichedGroupPublic,
  ScheduleGroupInput,
  UpdateGroupDTO,
  GroupByField,
  GroupedGroupsResponse,
  ProgressGroupLevelRequest,
  ProgressGroupLevelResult,
} from "../types/groups";
import type { Session } from "../types/sessions";

// get group details by ID
export async function getGroupDetails(groupId: number): Promise<Group> {
  const response = await client.get<ApiResponse<Group>>(
    `/academics/groups/${groupId}`,
  );
  return response.data.data;
}

// getGroups
export async function getGroups() {
  const response = await client.get<ApiResponse<Group[]>>('/academics/groups');
  return response.data.data;
}

// get groups paginated
export async function getGroupsPaginated(
  params: PaginationParams = {},
): Promise<PaginationResult<Group>> {
  const { skip = 0, limit = 50 } = params;
  const cappedLimit = Math.min(limit, 100);
  const response = await client.get<PaginatedApiResponse<Group>>(
    '/academics/groups',
    { params: { skip, limit: cappedLimit } },
  );
  const paginatedData = response.data;
  const items = paginatedData.data || [];
  const total = paginatedData.total || 0;
  return {
    items,
    total,
    hasMore: total > skip + items.length,
  };
}

// get enriched groups
export async function getEnrichedGroups(): Promise<EnrichedGroupPublic[]> {
  const response = await client.get<ApiResponse<EnrichedGroupPublic[]>>(
    '/academics/groups/enriched',
  );
  const data = response.data.data || [];
  return data.map(normalizeEnrichedGroup);
}

// get enriched group by ID
export async function getEnrichedGroup(
  groupId: number,
): Promise<EnrichedGroupPublic> {
  const response = await client.get<ApiResponse<EnrichedGroupPublic>>(
    `/academics/groups/${groupId}/enriched`,
  );
  return normalizeEnrichedGroup(response.data.data);
}

/** Normalize enriched group data for backward compatibility with old API field names */
function normalizeEnrichedGroup(raw: RawEnrichedGroupPublic): EnrichedGroupPublic {
  return {
    ...raw,
    name: raw.name || raw.group_name || '',
    capacity: raw.capacity ?? raw.max_capacity ?? 0,
    schedule: raw.schedule ?? (
      raw.default_day
        ? {
            day: raw.default_day,
            start_time: raw.default_time_start ?? '',
            end_time: raw.default_time_end ?? '',
          }
        : undefined
    ),
    current_level: raw.current_level ?? raw.level_number ?? 0,
    current_student_count: raw.current_student_count,
  };
}

// create group
export async function createGroup(data: ScheduleGroupInput): Promise<Group> {
  const response = await client.post<ApiResponse<Group>>(
    '/academics/groups',
    data,
  );
  return response.data.data;
}

// update group
export async function updateGroup(
  groupId: number,
  data: UpdateGroupDTO,
): Promise<Group> {
  const response = await client.patch<ApiResponse<Group>>(
    `/academics/groups/${groupId}`,
    data,
  );
  return response.data.data;
}

// delete group
export async function deleteGroup(groupId: number): Promise<void> {
  await client.delete(`/academics/groups/${groupId}`);
}

// archive group
export async function archiveGroup(groupId: number): Promise<Group> {
  const response = await client.patch<ApiResponse<Group>>(
    `/academics/groups/${groupId}/archive`,
  );
  return response.data.data;
}

// progress group to next/target level with optional overrides
export async function progressGroupLevel(
  groupId: number,
  data?: ProgressGroupLevelRequest,
): Promise<ProgressGroupLevelResult> {
  const response = await client.post<ApiResponse<ProgressGroupLevelResult>>(
    `/academics/groups/${groupId}/progress-level`,
    data ?? {},
  );
  return response.data.data;
}

// list sessions for a group
export async function listSessionsForGroup(
  groupId: number,
  level?: number,
): Promise<Session[]> {
  const params = level !== undefined ? { level } : undefined;
  const response = await client.get<ApiResponse<Session[]>>(
    `/academics/groups/${groupId}/sessions`,
    { params },
  );
  return response.data.data || [];
}

// Get groups with server-side grouping
export async function getGroupsGrouped(
  groupBy: GroupByField,
  params: PaginationParams = {},
): Promise<GroupedGroupsResponse> {
  const { skip = 0, limit = 50 } = params;
  const response = await client.get<ApiResponse<GroupedGroupsResponse>>(
    '/academics/groups/grouped',
    { params: { group_by: groupBy, skip, limit } },
  );
  const raw = response.data.data || { groups: [], total: 0, groupBy };
  return {
    ...raw,
    groups: raw.groups.map(g => ({
      ...g,
      groups: g.groups.map(normalizeEnrichedGroup),
    })),
  };
}

// Search groups by name
export async function searchGroups(
  query: string,
  status?: 'active' | 'inactive' | 'completed',
): Promise<EnrichedGroupPublic[]> {
  const params: Record<string, string> = { query };
  if (status) {
    params.status = status;
  }
  const response = await client.get<ApiResponse<EnrichedGroupPublic[]>>(
    '/academics/groups/search',
    { params },
  );
  return (response.data.data || []).map(normalizeEnrichedGroup);
}

// Get archived (completed) groups
export async function getArchivedGroups(
  params: PaginationParams = {},
): Promise<PaginationResult<EnrichedGroupPublic>> {
  const { skip = 0, limit = 50 } = params;
  const cappedLimit = Math.min(limit, 100);
  const response = await client.get<PaginatedApiResponse<EnrichedGroupPublic>>(
    '/academics/groups/archived',
    { params: { skip, limit: cappedLimit } },
  );
  const paginatedData = response.data;
  const items = (paginatedData.data || []).map(normalizeEnrichedGroup);
  const total = paginatedData.total || 0;
  return {
    items,
    total,
    hasMore: total > skip + items.length,
  };
}

// Get groups for a specific course
export async function getGroupsByCourse(
  courseId: number,
): Promise<EnrichedGroupPublic[]> {
  const response = await client.get<ApiResponse<EnrichedGroupPublic[]>>(
    `/academics/groups/by-course/${courseId}`,
  );
  return (response.data.data || []).map(normalizeEnrichedGroup);
}

// Get groups by type
export async function getGroupsByType(
  groupType: string,
): Promise<EnrichedGroupPublic[]> {
  const response = await client.get<ApiResponse<EnrichedGroupPublic[]>>(
    `/academics/groups/by-type/${groupType}`,
  );
  return (response.data.data || []).map(normalizeEnrichedGroup);
}
