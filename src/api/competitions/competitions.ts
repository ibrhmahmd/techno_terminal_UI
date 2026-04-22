import client from '../client'
import type { 
  Competition, CreateCompetitionInput, UpdateCompetitionInput,
  CompetitionCategory, CreateCategoryInput, RegisterTeamInput,
  TeamRegistration, PaginatedCompetitionsResponse, CompetitionStatus,
  CompetitionSummaryResponse
} from './types'

export interface GetCompetitionsParams {
  status?: CompetitionStatus
  skip?: number
  limit?: number
  search?: string
}

export async function getCompetitions(
  params?: GetCompetitionsParams
): Promise<PaginatedCompetitionsResponse> {
  const response = await client.get<PaginatedCompetitionsResponse>('/competitions', { params })
  return {
    data: response.data.data || [],
    total: response.data.total || 0,
    skip: response.data.skip || 0,
    limit: response.data.limit || 50,
  }
}

export async function getCompetition(id: number): Promise<Competition> {
  const response = await client.get<{ data: Competition }>(`/competitions/${id}`)
  return response.data.data
}

export async function createCompetition(data: CreateCompetitionInput): Promise<Competition> {
  console.log('[API] createCompetition - Request payload:', JSON.stringify(data, null, 2))
  try {
    const response = await client.post<{ data: Competition }>('/competitions', data)
    console.log('[API] createCompetition - Response:', response.status, response.data)
    return response.data.data
  } catch (error: any) {
    console.error('[API] createCompetition - Error:', {
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data,
      message: error?.message,
      requestPayload: data
    })
    throw error
  }
}

export async function updateCompetition(id: number, data: UpdateCompetitionInput): Promise<Competition> {
  const response = await client.patch<{ data: Competition }>(`/competitions/${id}`, data)
  return response.data.data
}

export async function deleteCompetition(id: number): Promise<void> {
  await client.delete(`/competitions/${id}`)
}

export async function getCompetitionCategories(competitionId: number): Promise<CompetitionCategory[]> {
  const response = await client.get<{ data: CompetitionCategory[] }>(`/competitions/${competitionId}/categories`)
  return response.data.data || []
}

// NOTE: Categories are auto-generated from team registrations
// POST /competitions/{id}/categories returns 405 - no separate categories table
// Categories are derived from existing teams (3-table schema)
// See API docs: docs/api/competitions/competitions.md line 118-122

// export async function addCompetitionCategory(competitionId: number, data: CreateCategoryInput): Promise<CompetitionCategory> {
//   const response = await client.post<{ data: CompetitionCategory }>(`/competitions/${competitionId}/categories`, data)
//   return response.data.data
// }

// export async function deleteCategory(competitionId: number, categoryId: string): Promise<void> {
//   await client.delete(`/competitions/${competitionId}/categories/${categoryId}`)
// }

export async function registerTeam(data: RegisterTeamInput): Promise<TeamRegistration> {
  const response = await client.post<{ data: TeamRegistration }>('/competitions/register-team', data)
  return response.data.data
}

export async function getCategoryTeams(competitionId: number, categoryId: string): Promise<TeamRegistration[]> {
  const response = await client.get<{ data: TeamRegistration[] }>(`/competitions/${competitionId}/categories/${categoryId}/teams`)
  return response.data.data || []
}

export async function markCompetitionFeePaid(teamMemberId: string): Promise<void> {
  await client.post(`/competitions/team-members/${teamMemberId}/mark-paid`)
}

export async function getCompetitionStats(competitionId: number): Promise<{
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

// Soft-delete operations
export async function restoreCompetition(id: number): Promise<boolean> {
  const response = await client.post<{ data: boolean }>(`/competitions/${id}/restore`)
  return response.data.data
}

export async function getDeletedCompetitions(): Promise<Competition[]> {
  console.log('[API] getDeletedCompetitions - Fetching from /competitions/deleted')
  try {
    const response = await client.get<{ data: Competition[] }>('/competitions/deleted')
    console.log('[API] getDeletedCompetitions - Response:', response.status, response.data)
    return response.data.data || []
  } catch (error: any) {
    console.error('[API] getDeletedCompetitions - Error:', {
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data,
      message: error?.message
    })
    throw error
  }
}

// Competition summary/dashboard
export async function getCompetitionSummary(id: number): Promise<CompetitionSummaryResponse> {
  const response = await client.get<{ data: CompetitionSummaryResponse }>(`/competitions/${id}/summary`)
  return response.data.data
}

// Re-export types for convenience
export type { Competition, CompetitionStatus, PaymentStatus } from './types'
