import client from '../client'
import type { ApiResponse } from '../../types/api'
import type { 
  Enrollment, CreateEnrollmentRequest, CreateEnrollmentResponse,
  TransferEnrollmentRequest, TransferEnrollmentResponse, DeleteEnrollmentResponse,
  ApplyDiscountInput, ApplyDiscountResponse, CompleteEnrollmentResponse,
  StudentEnrollmentSummary
} from './types'

// get all enrollments
export async function getEnrollments(): Promise<Enrollment[]> {
  const response = await client.get<ApiResponse<Enrollment[]>>('/enrollments')
  return response.data.data || []
}

// get student enrollment history
export async function getStudentEnrollments(studentId: number): Promise<Enrollment[]> {
  const response = await client.get<ApiResponse<Enrollment[]>>(`/enrollments/student/${studentId}`)
  return response.data.data || []
}

// enroll a student in a group
export async function createEnrollment(request: CreateEnrollmentRequest): Promise<Enrollment> {
  const response = await client.post<CreateEnrollmentResponse>('/enrollments', request)
  return response.data.data
}

// transfer a student to a new group
export async function transferEnrollment(request: TransferEnrollmentRequest): Promise<Enrollment> {
  const response = await client.post<TransferEnrollmentResponse>('/enrollments/transfer', request)
  return response.data.data
}

// drop an enrollment (soft delete)
export async function deleteEnrollment(enrollmentId: number): Promise<Enrollment> {
  const response = await client.delete<DeleteEnrollmentResponse>(`/enrollments/${enrollmentId}`)
  return response.data.data
}

// apply sibling discount to enrollment
export async function applyDiscount(
  enrollmentId: number, 
  discountAmount: number
): Promise<Enrollment> {
  const response = await client.post<ApplyDiscountResponse>(
    `/enrollments/${enrollmentId}/discount`,
    { discount_amount: discountAmount } as ApplyDiscountInput
  )
  return response.data.data
}

// mark enrollment as completed
export async function completeEnrollment(enrollmentId: number): Promise<Enrollment> {
  const response = await client.post<CompleteEnrollmentResponse>(`/enrollments/${enrollmentId}/complete`)
  return response.data.data
}

// get student enrollments summary for group students tab
export async function getStudentEnrollmentsSummary(
  groupId: number,
  params?: { level?: number }
): Promise<StudentEnrollmentSummary[]> {
  const response = await client.get<ApiResponse<StudentEnrollmentSummary[]>>(
    `/enrollments/group/${groupId}/students-summary`,
    { params }
  )
  return response.data.data || []
}
