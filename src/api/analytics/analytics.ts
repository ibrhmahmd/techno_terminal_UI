import client from '../client'
import type {
  DashboardSummaryPublic,
  UnpaidAttendeeDTO,
  GroupRosterRowDTO,
  AttendanceHeatmapRowDTO,
  EnrollmentTrendDTO,
  InstructorPerformanceDTO
} from './types'

export async function getDashboardSummary(): Promise<DashboardSummaryPublic> {
  const response = await client.get<{ data: DashboardSummaryPublic }>('/analytics/dashboard/summary')
  return response.data.data
}

export async function getUnpaidAttendees(targetDate?: string): Promise<UnpaidAttendeeDTO[]> {
  const params = targetDate ? { params: { target_date: targetDate } } : {}
  const response = await client.get<{ data: UnpaidAttendeeDTO[] }>('/analytics/academics/unpaid-attendees', params)
  return response.data.data || []
}

export async function getGroupRoster(groupId: number, levelNumber: number): Promise<GroupRosterRowDTO[]> {
  const response = await client.get<{ data: GroupRosterRowDTO[] }>(`/analytics/academics/groups/${groupId}/roster`, {
    params: { level_number: levelNumber }
  })
  return response.data.data || []
}

export async function getAttendanceHeatmap(groupId: number, levelNumber: number): Promise<AttendanceHeatmapRowDTO[]> {
  const response = await client.get<{ data: AttendanceHeatmapRowDTO[] }>(`/analytics/academics/groups/${groupId}/heatmap`, {
    params: { level_number: levelNumber }
  })
  return response.data.data || []
}

export async function getEnrollmentTrends(): Promise<EnrollmentTrendDTO[]> {
  const response = await client.get<{ data: EnrollmentTrendDTO[] }>('/analytics/bi/enrollment-trend')
  return response.data.data || []
}

export async function getInstructorPerformance(): Promise<InstructorPerformanceDTO[]> {
  const response = await client.get<{ data: InstructorPerformanceDTO[] }>('/analytics/bi/instructor-performance')
  return response.data.data || []
}
