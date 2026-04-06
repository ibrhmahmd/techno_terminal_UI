import client from '../client'
import type { 
  Enrollment, CreateEnrollmentRequest, CreateEnrollmentResponse,
  TransferEnrollmentRequest, TransferEnrollmentResponse, DeleteEnrollmentResponse
} from './types'

export async function getEnrollments(): Promise<Enrollment[]> {
  const response = await client.get<{ data: Enrollment[] }>('/enrollments')
  return response.data.data || []
}

export async function getStudentEnrollments(studentId: number): Promise<Enrollment[]> {
  const response = await client.get<{ data: Enrollment[] }>(`/enrollments/student/${studentId}`)
  return response.data.data || []
}

export async function createEnrollment(request: CreateEnrollmentRequest): Promise<number> {
  const response = await client.post<CreateEnrollmentResponse>('/enrollments', request)
  return response.data.data.id
}

export async function transferEnrollment(request: TransferEnrollmentRequest): Promise<void> {
  await client.post<TransferEnrollmentResponse>('/enrollments/transfer', request)
}

export async function deleteEnrollment(enrollmentId: number): Promise<void> {
  await client.delete<DeleteEnrollmentResponse>(`/enrollments/${enrollmentId}`)
}
