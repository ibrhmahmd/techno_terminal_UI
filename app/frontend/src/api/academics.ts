import client from './client'

export interface Group {
  id: number
  name: string
  course_name: string
  instructor_name: string
  student_count: number
  level?: number
  schedule_time?: string
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
  notes?: string
}

export interface DailySchedule {
  date: string
  sessions: Session[]
  groups: Group[]
}

export interface ProgressLevel {
  current_module: string
  description: string
  group_score: number
  target_score: number
  is_completed: boolean
  ready_for_next_level: boolean
}

export interface StudentAttendance {
  student_id: number
  student_name: string
  billing_status: 'paid' | 'due'
  attendance: (boolean | null)[]  // true=present, false=absent, null=unmarked
  notes?: string
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

export async function getGroupDetails(groupId: number): Promise<Group> {
  const response = await client.get<Group>(`/academics/groups/${groupId}`)
  return response.data
}

export async function getGroupProgress(groupId: number): Promise<ProgressLevel> {
  const response = await client.get<ProgressLevel>(`/academics/groups/${groupId}/progress-level`)
  return response.data
}
