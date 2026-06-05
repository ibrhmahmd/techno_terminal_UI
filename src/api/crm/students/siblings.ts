// Student Sibling Operations
// Endpoints: get siblings, link sibling, unlink sibling

import { client } from '../../client'
import type { ApiResponse } from '../../../types/api'
import type { SiblingInfo } from './types/models'

// Get Student Siblings
export async function getStudentSiblings(studentId: number): Promise<SiblingInfo[]> {
  const response = await client.get<ApiResponse<SiblingInfo[]>>(`/students/${studentId}/siblings`)
  return response.data.data || []
}

