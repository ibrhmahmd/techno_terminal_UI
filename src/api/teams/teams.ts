import client from '../client'
import type { ApiResponse } from '../../types/api'
import type {
  TeamDTO,
  UpdateTeamInput,
  AddTeamMemberInput,
  AddTeamMemberResultDTO,
  PlacementUpdateInput,
  PayCompetitionFeeInput,
  PayCompetitionFeeResponseDTO,
  TeamListFilters,
  RegisterTeamInput,
  TeamRegistrationResultDTO,
  TeamMemberListResponse,
  TeamWithMembersDTO,
} from './types'

const TEAMS_BASE = '/teams'

export async function getTeams(filters: TeamListFilters): Promise<TeamDTO[]> {
  const params = new URLSearchParams()
  params.append('competition_id', filters.competition_id.toString())
  if (filters.category) params.append('category', filters.category)
  if (filters.subcategory) params.append('subcategory', filters.subcategory)
  if (filters.include_members !== undefined) params.append('include_members', filters.include_members.toString())

  const query = params.toString()
  const url = `${TEAMS_BASE}?${query}`

  const response = await client.get<ApiResponse<TeamDTO[]>>(url)
  return response.data.data || []
}

export async function getTeamsWithMembers(filters: TeamListFilters): Promise<TeamWithMembersDTO[]> {
  const params = new URLSearchParams()
  params.append('competition_id', filters.competition_id.toString())
  if (filters.category) params.append('category', filters.category)
  if (filters.subcategory) params.append('subcategory', filters.subcategory)
  params.append('include_members', 'true')

  const query = params.toString()
  const url = `${TEAMS_BASE}?${query}`

  const response = await client.get<ApiResponse<TeamWithMembersDTO[]>>(url)
  return response.data.data || []
}

export async function registerTeam(data: RegisterTeamInput): Promise<TeamRegistrationResultDTO> {
  const response = await client.post<ApiResponse<TeamRegistrationResultDTO>>(TEAMS_BASE, data)
  return response.data.data
}

export async function getTeam(id: number): Promise<TeamDTO> {
  const response = await client.get<ApiResponse<TeamDTO>>(`${TEAMS_BASE}/${id}`)
  if (!response.data.data) throw new Error('Team not found')
  return response.data.data
}

export async function updateTeam(id: number, data: UpdateTeamInput): Promise<TeamDTO> {
  const response = await client.patch<ApiResponse<TeamDTO>>(`${TEAMS_BASE}/${id}`, data)
  if (!response.data.data) throw new Error('Team not found')
  return response.data.data
}

export async function deleteTeam(id: number): Promise<boolean> {
  const response = await client.delete<ApiResponse<boolean>>(`${TEAMS_BASE}/${id}`)
  return response.data.data
}

export async function getTeamMembers(teamId: number): Promise<TeamMemberListResponse> {
  const response = await client.get<ApiResponse<TeamMemberListResponse>>(`${TEAMS_BASE}/${teamId}/members`)
  if (!response.data.data) throw new Error('Team members not found')
  return response.data.data
}

export async function addTeamMember(teamId: number, data: AddTeamMemberInput): Promise<AddTeamMemberResultDTO> {
  const response = await client.post<ApiResponse<AddTeamMemberResultDTO>>(`${TEAMS_BASE}/${teamId}/members`, data)
  if (!response.data.data) throw new Error('Failed to add team member')
  return response.data.data
}

export async function removeTeamMember(teamId: number, studentId: number): Promise<boolean> {
  const response = await client.delete<ApiResponse<boolean>>(`${TEAMS_BASE}/${teamId}/members/${studentId}`)
  return response.data.data
}

export async function payCompetitionFee(
  teamId: number,
  studentId: number,
  data: PayCompetitionFeeInput,
): Promise<PayCompetitionFeeResponseDTO> {
  const response = await client.post<ApiResponse<PayCompetitionFeeResponseDTO>>(
    `${TEAMS_BASE}/${teamId}/members/${studentId}/pay`,
    data,
  )
  return response.data.data
}

export async function updatePlacement(teamId: number, data: PlacementUpdateInput): Promise<TeamDTO> {
  const response = await client.patch<ApiResponse<TeamDTO>>(`${TEAMS_BASE}/${teamId}/placement`, data)
  return response.data.data
}
