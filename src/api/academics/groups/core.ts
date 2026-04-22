/**
 * Groups API - Core Router Functions
 * Main Groups Router: docs/api/academics/groups.md
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
 */

import client from "../../client";
import type { PaginationParams, PaginationResult } from "../../../types/pagination";
import type { ApiResponse, PaginatedApiResponse } from "../../../types/api";
import type {
  Group,
  EnrichedGroupPublic,
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
  const response = await client.get<PaginatedApiResponse<Group>>(
    '/academics/groups',
    { params: { skip, limit } },
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
  return response.data.data || [];
}

// get enriched group by ID
export async function getEnrichedGroup(
  groupId: number,
): Promise<EnrichedGroupPublic> {
  const response = await client.get<ApiResponse<EnrichedGroupPublic>>(
    `/academics/groups/${groupId}/enriched`,
  );
  return response.data.data;
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

/**
 * @deprecated Use progressGroupLevel instead.
 * Simple level up without overrides - maintained for backward compatibility.
 */
export async function levelUpGroup(groupId: number): Promise<Group> {
  const response = await client.post<ApiResponse<Group>>(
    `/academics/groups/${groupId}/progress-level`,
  );
  return response.data.data;
}

// list sessions for a group
export async function listSessionsForGroup(groupId: number): Promise<Session[]> {
  const response = await client.get<ApiResponse<Session[]>>(
    `/academics/groups/${groupId}/sessions`,
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
  return response.data.data || { groups: [], total: 0, groupBy };
}
