import client from '../client'
import type { ApiResponse } from '../../types/api'
import type { 
  Competition, CreateCompetitionInput, UpdateCompetitionInput,
  CategoryResponse, CompetitionSummaryResponse
} from './types'

export async function getCompetitions(
  includeDeleted?: boolean
): Promise<Competition[]> {
  const params = includeDeleted ? { include_deleted: true } : undefined
  const response = await client.get<ApiResponse<Competition[]>>('/competitions', { params })
  return response.data.data || []
}

export async function getCompetition(id: number): Promise<Competition> {
  const response = await client.get<ApiResponse<Competition>>(`/competitions/${id}`)
  return response.data.data
}

export async function createCompetition(data: CreateCompetitionInput): Promise<Competition> {
  const response = await client.post<ApiResponse<Competition>>('/competitions', data)
  return response.data.data
}

export async function updateCompetition(id: number, data: UpdateCompetitionInput): Promise<Competition> {
  const response = await client.patch<ApiResponse<Competition>>(`/competitions/${id}`, data)
  return response.data.data
}

export async function deleteCompetition(id: number): Promise<void> {
  await client.delete(`/competitions/${id}`)
}

export async function getCompetitionCategories(competitionId: number): Promise<CategoryResponse[]> {
  const response = await client.get<ApiResponse<CategoryResponse[]>>(`/competitions/${competitionId}/categories`)
  return response.data.data || []
}

export async function restoreCompetition(id: number): Promise<boolean> {
  const response = await client.post<ApiResponse<boolean>>(`/competitions/${id}/restore`)
  return response.data.data
}

export async function getDeletedCompetitions(): Promise<Competition[]> {
  const response = await client.get<ApiResponse<Competition[]>>('/competitions/deleted')
  return response.data.data || []
}

export async function getCompetitionSummary(id: number): Promise<CompetitionSummaryResponse> {
  const response = await client.get<ApiResponse<CompetitionSummaryResponse>>(`/competitions/${id}/summary`)
  return response.data.data
}
