import client from '../client'
import type { ApiResponse } from '../../types/api'
import type { 
  Competition, CreateCompetitionInput, UpdateCompetitionInput,
  CategoryResponse, CompetitionSummaryResponse
} from './types'

export async function getCompetitions(): Promise<Competition[]> {
  const response = await client.get<ApiResponse<Competition[]>>('/competitions')
  return response.data.data || []
}

export async function getCompetition(id: number): Promise<Competition> {
  const response = await client.get<ApiResponse<Competition>>(`/competitions/${id}`)
  if (!response.data.data) throw new Error('Competition not found')
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

export async function deleteCompetition(id: number): Promise<boolean> {
  const response = await client.delete<ApiResponse<boolean>>(`/competitions/${id}`)
  return response.data.data
}

export async function getCompetitionCategories(competitionId: number): Promise<CategoryResponse[]> {
  const response = await client.get<ApiResponse<CategoryResponse[]>>(`/competitions/${competitionId}/categories`)
  return response.data.data || []
}

export async function getCompetitionSummary(id: number): Promise<CompetitionSummaryResponse> {
  const response = await client.get<ApiResponse<CompetitionSummaryResponse>>(`/competitions/${id}/summary`)
  if (!response.data.data) throw new Error('Competition summary not found')
  return response.data.data
}
