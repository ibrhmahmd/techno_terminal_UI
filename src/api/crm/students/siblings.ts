// Student Sibling Operations
// Endpoints: get siblings, link sibling, unlink sibling

import client from '../../client'
import type { ApiResponse } from '../../../types/api'
import type { SiblingInfo } from './types/models'
import type { LinkSiblingDTO } from './types/inputs'

// Get Student Siblings
export async function getStudentSiblings(studentId: number): Promise<SiblingInfo[]> {
  const response = await client.get<ApiResponse<SiblingInfo[]>>(`/students/${studentId}/siblings`)
  return response.data.data || []
}

// Link Sibling
export async function linkSibling(
  studentId: number,
  data: LinkSiblingDTO
): Promise<void> {
  await client.post(`/students/${studentId}/siblings`, data)
}

// Unlink Sibling
export async function unlinkSibling(
  studentId: number,
  siblingStudentId: number
): Promise<void> {
  await client.delete(`/students/${studentId}/siblings/${siblingStudentId}`)
}
