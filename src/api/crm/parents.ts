import client from '../client'
import type { PaginationParams, PaginationResult } from '../../types/pagination'
import type { PaginatedApiResponse, ApiResponse } from '../../types/api'
import type { Parent, ParentListItem } from './students/types/models'
import type { ParentCreate, ParentUpdate } from './students/types/inputs'

export async function getParentsPaginated(
  params: PaginationParams = {}
): Promise<PaginationResult<Parent>> {
  const { skip = 0, limit = 15 } = params
  const response = await client.get<PaginatedApiResponse<ParentListItem>>(
    '/crm/parents',
    { params: { skip, limit } }
  )
  
  const paginatedData = response.data
  const items = paginatedData.data || []
  const total = paginatedData.total || 0
  
  return {
    items: items,
    total: total,
    hasMore: total > (skip + items.length)
  }
}

export async function searchParents(query: string): Promise<ParentListItem[]> {
  const response = await client.get<PaginatedApiResponse<ParentListItem>>('/crm/parents', {
    params: { q: query, skip: 0, limit: 50 }
  })
  return response.data.data || []
}

export async function getParent(id: number): Promise<Parent> {
  const response = await client.get<ApiResponse<Parent>>(`/crm/parents/${id}`)
  return response.data.data
}

export async function createParent(data: ParentCreate): Promise<Parent> {
  const response = await client.post<ApiResponse<Parent>>('/crm/parents', data)
  return response.data.data
}

export async function updateParent(id: number, data: ParentUpdate): Promise<Parent> {
  const response = await client.patch<ApiResponse<Parent>>(`/crm/parents/${id}`, data)
  return response.data.data
}

export async function deleteParent(id: number): Promise<void> {
  await client.delete(`/crm/parents/${id}`)
}

export async function linkParentToStudent(
  studentId: number,
  parentId: number
): Promise<void> {
  const response = await client.post<ApiResponse<void>>(`/crm/students/${studentId}/parents/${parentId}`)
  
  if (response.status !== 200) {
    throw new Error(`Failed to link parent to student: ${response.statusText}`)
  }
}

export async function unlinkParentFromStudent(
  studentId: number,
  parentId: number
): Promise<void> {
  const response = await client.delete<ApiResponse<void>>(`/crm/students/${studentId}/parents/${parentId}`)
  
  if (response.status !== 200) {
    throw new Error(`Failed to unlink parent from student: ${response.statusText}`)
  }
}