/**
 * Analytics API - Academic Module
 * Endpoints for academic metrics: enrollments, sessions, attendance, progress
 * 
 * @module analytics/academic
 * @see docs/api/analytics/academic.md
 */

import client from '../client'
import type { ApiResponse } from '../../types/api'
import type {
  UnpaidAttendeeDTO,
  GroupRosterRowDTO,
  AttendanceHeatmapRowDTO,
  StudentProgressDTO,
  CourseCompletionDTO,
} from './types'

/**
 * Get unpaid attendees for a specific date
 * @param targetDate - Optional date filter (YYYY-MM-DD), defaults to today
 * @see docs/api/analytics/academic.md#get-unpaid-attendees
 */
export async function getUnpaidAttendees(targetDate?: string): Promise<UnpaidAttendeeDTO[]> {
  const params = targetDate ? { params: { target_date: targetDate } } : {}
  const response = await client.get<ApiResponse<UnpaidAttendeeDTO[]>>('/analytics/academics/unpaid-attendees', params)
  return response.data.data || []
}

/**
 * Get detailed roster for a specific group and level
 * @param groupId - Group ID
 * @param levelNumber - Level number within the group
 * @see docs/api/analytics/academic.md#get-group-roster
 */
export async function getGroupRoster(groupId: number, levelNumber: number): Promise<GroupRosterRowDTO[]> {
  const response = await client.get<ApiResponse<GroupRosterRowDTO[]>>(`/analytics/academics/groups/${groupId}/roster`, {
    params: { level_number: levelNumber }
  })
  return response.data.data || []
}

/**
 * Get attendance heatmap for a group
 * @param groupId - Group ID
 * @param levelNumber - Level number within the group
 * @see docs/api/analytics/academic.md#get-attendance-heatmap
 */
export async function getAttendanceHeatmap(groupId: number, levelNumber: number): Promise<AttendanceHeatmapRowDTO[]> {
  const response = await client.get<ApiResponse<AttendanceHeatmapRowDTO[]>>(`/analytics/academics/groups/${groupId}/heatmap`, {
    params: { level_number: levelNumber }
  })
  return response.data.data || []
}

/**
 * Get student progress across all courses
 * 
 * @see docs/api/analytics/academic.md#get-student-progress
 */
export async function getStudentProgress(
  studentId?: number,  // ADD parameter
  groupId?: number  // ADD parameter
): Promise<StudentProgressDTO[]> {
  const params: Record<string, number> = {}
  if (studentId) params.student_id = studentId
  if (groupId) params.group_id = groupId

  const response = await client.get<ApiResponse<StudentProgressDTO[]>>(`/analytics/academics/student-progress`, {
    params: Object.keys(params).length > 0 ? params : undefined
  })
  return response.data.data || []
}


/**
 * Get course completion statistics
 * @see docs/api/analytics/academic.md#get-course-completion
 */
export async function getCourseCompletion(): Promise<CourseCompletionDTO[]> {
  const response = await client.get<ApiResponse<CourseCompletionDTO[]>>('/analytics/academics/course-completion')
  return response.data.data || []
}
