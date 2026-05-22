// Student Status Operations
// Endpoints: update status, set waiting priority, status summary

import { client } from '../../client'
import type { ApiResponse } from '../../../types/api'
import type { StudentStatusSummary, StudentStatus } from './types/models'
import type { UpdateStudentStatusDTO, SetWaitingPriorityDTO } from './types/inputs'

// Update Student Status
export async function updateStudentStatus(
  studentId: number,
  data: UpdateStudentStatusDTO
): Promise<void> {
  await client.patch(`/students/${studentId}/status`, data)
}

// Set Waiting Priority
export async function setWaitingPriority(
  studentId: number,
  data: SetWaitingPriorityDTO
): Promise<void> {
  await client.post(`/students/${studentId}/waiting-priority`, data)
}

// Get Student Status Summary
export async function getStudentStatusSummary(): Promise<StudentStatusSummary> {
  const response = await client.get<ApiResponse<StudentStatusSummary>>('/students/status-summary')
  return response.data.data
}

// Get Students by Status (filtered list)
import type { PaginationParams, PaginationResult } from '../../../types/pagination'
import type { PaginatedApiResponse } from '../../../types/api'
import type { Student } from './types/models'

export async function getStudentsByStatus(
  status: StudentStatus,
  params: PaginationParams = {}
): Promise<PaginationResult<Student>> {
  const { skip = 0, limit = 15 } = params
  const response = await client.get<PaginatedApiResponse<Student>>(
    '/crm/students',
    { params: { skip, limit, status } }
  )
  
  const items = response.data.data || []
  const total = response.data.total || 0
  
  return {
    items,
    total,
    hasMore: total > skip + items.length
  }
}

