/**
 * Groups API - Core Router Functions
 * Main Groups Router: groups-api.md
 *
 * Endpoints:
 * - GET /academics/groups/{group_id} - Get group by ID
 * - GET /academics/groups/{group_id}/enriched - Get enriched group by ID
 * - POST /academics/groups - Create new group
 * - PATCH /academics/groups/{group_id} - Update group
 * - DELETE /academics/groups/{group_id} - Delete group
 * - POST /academics/groups/{group_id}/progress-level - Level up group
 * - GET /academics/groups/grouped - Get grouped groups
 * - GET /academics/groups/{group_id}/sessions - List sessions for group
 * - GET /academics/groups/filter - Unified group filter (replaces all list endpoints)
 */

import { client } from "../../client";
import type { PaginationParams, PaginationResult } from "../../../types/pagination";
import type { ApiResponse } from "../../../types/api";
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

/** Response shape from GET /academics/groups/filter */
interface GroupFilterResult {
  groups: RawEnrichedGroupPublic[];
  total: number;
  skip: number;
  limit: number;
}

/** Normalize raw backend enriched group to the canonical frontend shape */
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
    current_student_count: raw.current_student_count ?? 0,
  };
}

// get group details by ID
export async function getGroupDetails(groupId: number): Promise<Group> {
  const response = await client.get<ApiResponse<Group>>(
    `/academics/groups/${groupId}`,
  );
  return response.data.data;
}

// get enriched group by ID
export async function getEnrichedGroup(
  groupId: number,
): Promise<EnrichedGroupPublic> {
  const response = await client.get<ApiResponse<RawEnrichedGroupPublic>>(
    `/academics/groups/${groupId}/enriched`,
  );
  return normalizeEnrichedGroup(response.data.data);
}

// get all active groups (flat list, no pagination)
export async function getGroups(): Promise<EnrichedGroupPublic[]> {
  const response = await client.get<ApiResponse<GroupFilterResult>>(
    '/academics/groups/filter',
    { params: { limit: 200 } },
  );
  return (response.data.data?.groups || []).map(normalizeEnrichedGroup);
}

// get groups paginated
export async function getGroupsPaginated(
  params: GroupFilterOptions = {},
): Promise<PaginationResult<EnrichedGroupPublic>> {
  const { skip = 0, limit = 50, ...rest } = params;
  const cappedLimit = Math.min(limit, 200);
  const response = await client.get<ApiResponse<GroupFilterResult>>(
    '/academics/groups/filter',
    { 
      params: { skip, limit: cappedLimit, ...rest },
      paramsSerializer: params => {
        const searchParams = new URLSearchParams();
        for (const key of Object.keys(params)) {
          const value = params[key];
          if (Array.isArray(value)) {
            value.forEach(v => searchParams.append(key, String(v)));
          } else if (value !== undefined && value !== null && value !== '') {
            searchParams.append(key, String(value));
          }
        }
        return searchParams.toString();
      }
    },
  );
  const result = response.data.data;
  const items = (result?.groups || []).map(normalizeEnrichedGroup);
  const total = result?.total || 0;
  return {
    items,
    total,
    hasMore: total > skip + items.length,
  };
}

export interface GroupFilterOptions {
  q?: string;
  course_ids?: number[];
  day?: string[];
  instructor_id?: number;
  level_number?: number;
  status?: string[];
  has_instructor?: boolean;
  include_inactive?: boolean;
  limit?: number;
  skip?: number;
}

// get all enriched groups (active only, no pagination unless specified)
export async function getEnrichedGroups(options?: GroupFilterOptions): Promise<EnrichedGroupPublic[]> {
  const params: Record<string, any> = { limit: 200, ...options };
  const response = await client.get<ApiResponse<GroupFilterResult>>(
    '/academics/groups/filter',
    { 
      params,
      paramsSerializer: params => {
        const searchParams = new URLSearchParams();
        for (const key of Object.keys(params)) {
          const value = params[key];
          if (Array.isArray(value)) {
            value.forEach(v => searchParams.append(key, String(v)));
          } else if (value !== undefined && value !== null && value !== '') {
            searchParams.append(key, String(value));
          }
        }
        return searchParams.toString();
      }
    },
  );
  return (response.data.data?.groups || []).map(normalizeEnrichedGroup);
}

// search groups by name across all statuses
export async function searchGroups(
  query: string,
  status?: 'active' | 'inactive' | 'completed',
): Promise<EnrichedGroupPublic[]> {
  const params: Record<string, string | boolean> = { q: query };
  if (status) {
    params.status = status;
  } else {
    // Without an explicit status filter, search across all statuses
    params.include_inactive = true;
  }
  const response = await client.get<ApiResponse<GroupFilterResult>>(
    '/academics/groups/filter',
    { params },
  );
  return (response.data.data?.groups || []).map(normalizeEnrichedGroup);
}

// get archived groups (paginated)
export async function getArchivedGroups(
  params: PaginationParams = {},
): Promise<PaginationResult<EnrichedGroupPublic>> {
  const { skip = 0, limit = 50 } = params;
  const cappedLimit = Math.min(limit, 100);
  const response = await client.get<ApiResponse<GroupFilterResult>>(
    '/academics/groups/filter',
    { params: { status: 'archived', skip, limit: cappedLimit } },
  );
  const result = response.data.data;
  const items = (result?.groups || []).map(normalizeEnrichedGroup);
  const total = result?.total || 0;
  return {
    items,
    total,
    hasMore: total > skip + items.length,
  };
}

// get groups for a specific course
export async function getGroupsByCourse(
  courseId: number,
): Promise<EnrichedGroupPublic[]> {
  const response = await client.get<ApiResponse<GroupFilterResult>>(
    '/academics/groups/filter',
    { params: { course_ids: courseId } },
  );
  return (response.data.data?.groups || []).map(normalizeEnrichedGroup);
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
