// Student Status Operations
// Endpoints: update status, set waiting priority, status summary

import { client } from '../../client'
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
