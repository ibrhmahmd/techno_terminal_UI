import client from '../client'
import type {
  TeamDTO,
  UpdateTeamInput,
  TeamMemberRosterDTO,
  AddTeamMemberInput,
  AddTeamMemberResultDTO,
  RemoveTeamMemberResultDTO,
  PlacementUpdateInput,
  PayCompetitionFeeInput,
  PayCompetitionFeeResponseDTO,
  TeamListFilters,
} from './types'

const TEAMS_BASE = '/teams'

export async function getTeams(filters?: TeamListFilters): Promise<TeamDTO[]> {
  const params = new URLSearchParams()
  if (filters?.competition_id) params.append('competition_id', filters.competition_id.toString())
  if (filters?.category) params.append('category', filters.category)
  if (filters?.include_deleted) params.append('include_deleted', 'true')
  
  const query = params.toString()
  const url = query ? `${TEAMS_BASE}?${query}` : TEAMS_BASE
  
  const response = await client.get<TeamDTO[]>(url)
  return response.data
}

export async function getTeam(id: number): Promise<TeamDTO> {
  const response = await client.get<TeamDTO>(`${TEAMS_BASE}/${id}`)
  return response.data
}

export async function updateTeam(id: number, data: UpdateTeamInput): Promise<TeamDTO> {
  const response = await client.patch<TeamDTO>(`${TEAMS_BASE}/${id}`, data)
  return response.data
}

export async function deleteTeam(id: number): Promise<boolean> {
  await client.delete(`${TEAMS_BASE}/${id}`)
  return true
}

export async function restoreTeam(id: number): Promise<TeamDTO> {
  const response = await client.post<TeamDTO>(`${TEAMS_BASE}/${id}/restore`)
  return response.data
}

export async function getDeletedTeams(competitionId?: number): Promise<TeamDTO[]> {
  const params = competitionId ? `?competition_id=${competitionId}` : ''
  const response = await client.get<TeamDTO[]>(`${TEAMS_BASE}/deleted${params}`)
  return response.data
}

export async function getTeamMembers(teamId: number): Promise<TeamMemberRosterDTO[]> {
  const response = await client.get<TeamMemberRosterDTO[]>(`${TEAMS_BASE}/${teamId}/members`)
  return response.data
}

export async function addTeamMember(teamId: number, data: AddTeamMemberInput): Promise<AddTeamMemberResultDTO> {
  const response = await client.post<AddTeamMemberResultDTO>(`${TEAMS_BASE}/${teamId}/members`, data)
  return response.data
}

export async function removeTeamMember(teamId: number, studentId: number): Promise<RemoveTeamMemberResultDTO> {
  const response = await client.delete<RemoveTeamMemberResultDTO>(`${TEAMS_BASE}/${teamId}/members/${studentId}`)
  return response.data
}

export async function payCompetitionFee(
  teamId: number, 
  data: PayCompetitionFeeInput
): Promise<PayCompetitionFeeResponseDTO> {
  const response = await client.post<PayCompetitionFeeResponseDTO>(`${TEAMS_BASE}/${teamId}/pay`, data)
  return response.data
}

export async function updatePlacement(teamId: number, data: PlacementUpdateInput): Promise<TeamDTO> {
  const response = await client.patch<TeamDTO>(`${TEAMS_BASE}/${teamId}/placement`, data)
  return response.data
}

export function isTeamDeleted(team: TeamDTO): boolean {
  return !!team.deleted_at
}
