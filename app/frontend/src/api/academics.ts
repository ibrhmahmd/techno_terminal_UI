import client from './client'

export interface Group {
  id: number
  name: string
  course_name: string
  instructor_name: string
  student_count: number
}

export interface Session {
  id: number
  group_id: number
  date: string
  start_time: string
  end_time: string
  instructor_name: string
  status: 'scheduled' | 'completed' | 'cancelled'
  attendance_marked: boolean
}

export interface DailySchedule {
  date: string
  sessions: Session[]
  groups: Group[]
}

export async function getDailySchedule(date?: string): Promise<DailySchedule> {
  const params = date ? { params: { date } } : {}
  const response = await client.get<DailySchedule>('/academics/sessions/daily-schedule', params)
  return response.data
}

export async function getGroupSessions(groupId: number): Promise<Session[]> {
  const response = await client.get<Session[]>(`/academics/groups/${groupId}/sessions`)
  return response.data
}
