import client from '../client'
import type { 
  Competition, CreateCompetitionInput, UpdateCompetitionInput,
  CompetitionCategory, CreateCategoryInput, RegisterTeamInput,
  TeamRegistration
} from './types'

export async function getCompetitions(): Promise<Competition[]> {
  const response = await client.get<{ data: Competition[] }>('/competitions')
  return response.data.data || []
}

export async function getCompetition(id: string): Promise<Competition> {
  const response = await client.get<{ data: Competition }>(`/competitions/${id}`)
  return response.data.data
}

export async function createCompetition(data: CreateCompetitionInput): Promise<Competition> {
  const response = await client.post<{ data: Competition }>('/competitions', data)
  return response.data.data
}

export async function updateCompetition(id: string, data: UpdateCompetitionInput): Promise<Competition> {
  const response = await client.patch<{ data: Competition }>(`/competitions/${id}`, data)
  return response.data.data
}

export async function deleteCompetition(id: string): Promise<void> {
  await client.delete(`/competitions/${id}`)
}

export async function getCompetitionCategories(competitionId: string): Promise<CompetitionCategory[]> {
  const response = await client.get<{ data: CompetitionCategory[] }>(`/competitions/${competitionId}/categories`)
  return response.data.data || []
}

export async function addCompetitionCategory(competitionId: string, data: CreateCategoryInput): Promise<CompetitionCategory> {
  const response = await client.post<{ data: CompetitionCategory }>(`/competitions/${competitionId}/categories`, data)
  return response.data.data
}

export async function deleteCategory(competitionId: string, categoryId: string): Promise<void> {
  await client.delete(`/competitions/${competitionId}/categories/${categoryId}`)
}

export async function registerTeam(data: RegisterTeamInput): Promise<TeamRegistration> {
  const response = await client.post<{ data: TeamRegistration }>('/competitions/register-team', data)
  return response.data.data
}

export async function getCategoryTeams(competitionId: string, categoryId: string): Promise<TeamRegistration[]> {
  const response = await client.get<{ data: TeamRegistration[] }>(`/competitions/${competitionId}/categories/${categoryId}/teams`)
  return response.data.data || []
}

export async function markCompetitionFeePaid(teamMemberId: string): Promise<void> {
  await client.post(`/competitions/team-members/${teamMemberId}/mark-paid`)
}

export async function getCompetitionStats(competitionId: string): Promise<{
  total_teams: number
  total_participants: number
  total_revenue: number
  paid_count: number
  pending_count: number
}> {
  const response = await client.get<{ data: {
    total_teams: number
    total_participants: number
    total_revenue: number
    paid_count: number
    pending_count: number
  } }>(`/competitions/${competitionId}/stats`)
  return response.data.data
}
