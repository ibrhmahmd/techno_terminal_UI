import client from './client'

export interface Enrollment {
  id: string
  student_id: string
  group_id: string
  level: number
  status: 'active' | 'completed' | 'dropped'
  amount_due: number
  discount: number
  notes?: string
  enrolled_on: string
  group_name?: string
  course_name?: string
  student_name?: string
}

export interface CreateEnrollmentRequest {
  student_id: string
  group_id: string
  level: number
  amount_due: number
  discount?: number
  notes?: string
}

export interface CreateEnrollmentResponse {
  success: boolean
  data: {
    id: string
  }
}

export interface TransferEnrollmentRequest {
  enrollment_id: string
  new_group_id: string
}

export interface TransferEnrollmentResponse {
  success: boolean
}

export interface DeleteEnrollmentResponse {
  success: boolean
}

// Get enrollments for a student
export async function getStudentEnrollments(studentId: string): Promise<Enrollment[]> {
  const response = await client.get<{ data: Enrollment[] }>(`/enrollments/student/${studentId}`)
  return response.data.data || []
}

// Create new enrollment
export async function createEnrollment(request: CreateEnrollmentRequest): Promise<string> {
  const response = await client.post<CreateEnrollmentResponse>('/enrollments', request)
  return response.data.data.id
}

// Transfer enrollment to new group
export async function transferEnrollment(request: TransferEnrollmentRequest): Promise<void> {
  await client.post<TransferEnrollmentResponse>('/enrollments/transfer', request)
}

// Drop/Delete enrollment
export async function deleteEnrollment(enrollmentId: string): Promise<void> {
  await client.delete<DeleteEnrollmentResponse>(`/enrollments/${enrollmentId}`)
}

// Get all active enrollments (for transfer dropdown)
export async function getActiveEnrollments(): Promise<Enrollment[]> {
  // This uses the students endpoint and filters - adjust based on actual API
  const response = await client.get<{ data: Enrollment[] }>('/enrollments', {
    params: { status: 'active' }
  })
  return response.data.data || []
}
