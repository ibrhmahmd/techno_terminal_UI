import client from './client'

export interface Group {
  id: string
  name: string
  course_name: string
  instructor_name: string
  student_count: number
  level?: number
  schedule_time?: string
}

export interface Session {
  id: string
  group_id: string
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
  student_id: string
  student_name: string
  billing_status: 'paid' | 'due'
  attendance: (boolean | null)[]
  notes?: string
}

export interface DailyScheduleItem {
  session_id: number
  group_id: number
  group_name: string
  course_name: string
  instructor_name: string
  scheduled_time: string
  end_time?: string
  session_notes?: string
  active_student_count: number
}

export async function getDailySchedule(date?: string): Promise<DailySchedule> {
  const params = date ? { params: { target_date: date } } : {}
  const response = await client.get<{ data: DailyScheduleItem[] }>('/academics/sessions/daily-schedule', params)
  
  const items = response.data.data || []
  
  const groups: Group[] = items.map(item => ({
    id: String(item.group_id),
    name: item.group_name,
    course_name: item.course_name,
    instructor_name: item.instructor_name,
    student_count: item.active_student_count,
    schedule_time: item.scheduled_time
  }))

  const sessions: Session[] = items.map(item => ({
    id: String(item.session_id),
    group_id: String(item.group_id),
    date: date || new Date().toISOString().split('T')[0],
    start_time: item.scheduled_time,
    end_time: item.end_time || '',
    instructor_name: item.instructor_name,
    status: 'scheduled',
    attendance_marked: false,
    notes: item.session_notes
  }))

  return {
    date: date || new Date().toISOString().split('T')[0],
    groups,
    sessions
  }
}

export async function getGroupSessions(groupId: string): Promise<Session[]> {
  const response = await client.get<{ data: Session[] }>(`/academics/groups/${groupId}/sessions`)
  return response.data.data || []
}

export async function getGroupDetails(groupId: string): Promise<Group> {
  const response = await client.get<{ data: Group }>(`/academics/groups/${groupId}`)
  return response.data.data
}

export async function getGroupProgress(groupId: string): Promise<ProgressLevel> {
  const response = await client.get<{ data: ProgressLevel }>(`/academics/groups/${groupId}/progress-level`)
  return response.data.data
}

export async function getGroups(): Promise<Group[]> {
  const response = await client.get<{ data: Group[] }>('/academics/groups')
  return response.data.data || []
}

export interface UpdateSessionInput {
  date?: string
  start_time?: string
  end_time?: string
  instructor_name?: string
  notes?: string | null
}

export interface CreateSessionInput {
  date: string
  start_time: string
  end_time: string
  instructor_name: string
  notes?: string | null
}

export async function updateSession(sessionId: string, data: UpdateSessionInput): Promise<Session> {
  const response = await client.patch<{ data: Session }>(`/academics/sessions/${sessionId}`, data)
  return response.data.data
}

export async function deleteSession(sessionId: string): Promise<void> {
  await client.delete(`/academics/sessions/${sessionId}`)
}

export async function cancelSession(sessionId: string): Promise<Session> {
  const response = await client.post<{ data: Session }>(`/academics/sessions/${sessionId}/cancel`)
  return response.data.data
}

export async function addExtraSession(groupId: string, data: CreateSessionInput): Promise<Session> {
  const response = await client.post<{ data: Session }>(`/academics/groups/${groupId}/sessions`, data)
  return response.data.data
}

// Group Management
export interface CreateGroupInput {
  name: string
  course_name: string
  instructor_name: string
  level?: number
  schedule_time?: string
}

export interface UpdateGroupInput {
  name?: string
  course_name?: string
  instructor_name?: string
  level?: number
  schedule_time?: string
}

export async function createGroup(data: CreateGroupInput): Promise<Group> {
  const response = await client.post<{ data: Group }>('/academics/groups', data)
  return response.data.data
}

export async function updateGroup(groupId: string, data: UpdateGroupInput): Promise<Group> {
  const response = await client.patch<{ data: Group }>(`/academics/groups/${groupId}`, data)
  return response.data.data
}

export async function deleteGroup(groupId: string): Promise<void> {
  await client.delete(`/academics/groups/${groupId}`)
}

export async function levelUpGroup(groupId: string): Promise<Group> {
  const response = await client.post<{ data: Group }>(`/academics/groups/${groupId}/level-up`)
  return response.data.data
}
