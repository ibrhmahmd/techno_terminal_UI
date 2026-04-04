import client from '../client'
import type { PaginationParams, PaginationResult } from '../../types/pagination'
import type { PaginatedApiResponse, ApiResponse } from '../../types/api'
import type { Parent } from './types'

export async function getParentsPaginated(
  params: PaginationParams = {}
): Promise<PaginationResult<Parent>> {
  const { skip = 0, limit = 15 } = params
  const response = await client.get<PaginatedApiResponse<Parent>>(
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

export async function searchParents(name: string): Promise<Parent[]> {
  const response = await client.get<ApiResponse<Parent[]>>('/crm/parents', {
    params: { name }
  })
  return response.data.data || []
}

export async function getParent(id: number): Promise<Parent> {
  const response = await client.get<ApiResponse<Parent>>(`/crm/parents/${id}`)
  return response.data.data
}

export async function createParent(parent: Omit<Parent, 'id'>): Promise<Parent> {
  const compliantParent = {
    full_name: parent.full_name,
    phone_primary: parent.phone_primary || null,
    phone_secondary: parent.phone_secondary || null,
    email: parent.email || null,
    relation: parent.relation || null,
    notes: parent.notes || null,
    address: parent.address || null,
    is_active: parent.is_active ?? true
  }
  const response = await client.post<ApiResponse<Parent>>('/crm/parents', compliantParent)
  return response.data.data
}

export async function updateParent(id: number, parent: Partial<Omit<Parent, 'id'>>): Promise<Parent> {
  const compliantUpdate = {
    ...(parent.full_name && { full_name: parent.full_name }),
    ...(parent.phone_primary !== undefined && { phone_primary: parent.phone_primary }),
    ...(parent.phone_secondary !== undefined && { phone_secondary: parent.phone_secondary }),
    ...(parent.email !== undefined && { email: parent.email }),
    ...(parent.relation !== undefined && { relation: parent.relation }),
    ...(parent.notes !== undefined && { notes: parent.notes }),
    ...(parent.address !== undefined && { address: parent.address }),
    ...(parent.is_active !== undefined && { is_active: parent.is_active })
  }
  const response = await client.patch<ApiResponse<Parent>>(`/crm/parents/${id}`, compliantUpdate)
  return response.data.data
}

export async function deleteParent(id: number): Promise<void> {
  await client.delete(`/crm/parents/${id}`)
}

export async function getStudentParents(studentId: number): Promise<Parent[]> {
  const response = await client.get<ApiResponse<Parent[]>>(`/crm/students/${studentId}/parents`)
  return response.data.data || []
}
