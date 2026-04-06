import client from "../client";
import type {
  PaginationParams,
  PaginationResult,
} from "../../types/pagination";
import type { ApiResponse, PaginatedApiResponse } from "../../types/api";
import type {
  Group,
  EnrichedGroupPublic,
  ScheduleGroupInput,
  UpdateGroupDTO,
  Session,
  GroupLevelHistoryDTO,
  EnrollmentHistoryDTO,
  EnrollmentHistoryFilters,
  CompetitionParticipationDTO,
  InstructorAssignmentDTO,
} from "./types";


// get group details by ID
export async function getGroupDetails(groupId: number): Promise<Group> {
  const response = await client.get<ApiResponse<Group>>(
    `/academics/groups/${groupId}`,
  );
  return response.data.data;
}


// getGroups
export async function getGroups() {
  const response =  await client.get<ApiResponse<Group[]>>("/academics/groups");
  return response.data.data;
}

// get groups paginated
export async function getGroupsPaginated(
  params: PaginationParams = {},
): Promise<PaginationResult<Group>> {
  const { skip = 0, limit = 100 } = params;
  const response = await client.get<PaginatedApiResponse<Group>>(
    "/academics/groups",
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
    "/academics/groups/enriched",
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
    "/academics/groups",
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

// level up group
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


//  generate level sessions manually
export async function generateLevelSessions(groupId: number): Promise<void> {
  await client.post(`/academics/groups/${groupId}/generate-sessions`);
}

// NEW API functions for Group Details Page

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

// get competition participation records for a group
export async function getGroupCompetitions(
  groupId: number,
): Promise<CompetitionParticipationDTO[]> {
  const response = await client.get<ApiResponse<CompetitionParticipationDTO[]>>(
    `/academics/groups/${groupId}/competitions`,
  );
  return response.data.data || [];
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
