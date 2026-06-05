import { client } from '../../client'
import type { ApiResponse } from '../../../types/api'
import type { CourseRecord, CompetitionRecord, TeamRecord } from './types/models'

export interface StudentCompetitionDTO {
  membership: {
    id: number
    team_id: number
    student_id: number
    amount_due: number
    amount_paid: number
  }
  team: {
    id: number
    competition_id: number
    category: string
    subcategory?: string | null
    group_id?: number | null
    team_name: string
    coach_id?: number | null
    project_name?: string | null
    project_description?: string | null
    placement_rank?: number | null
    placement_label?: string | null
    notes?: string | null
    created_at?: string | null
  }
  category: string
  subcategory?: string | null
  competition?: {
    id: number
    name: string
    date?: string | null
    description?: string | null
  } | null
}

export interface StudentCompetitionsResponse {
  student_id: number
  competitions: StudentCompetitionDTO[]
}

/**
 * TODO: Backend endpoint GET /crm/students/{student_id}/courses
 * Returns student's course history with progress and grades
 */
export async function getStudentCourses(studentId: number): Promise<CourseRecord[]> {
  console.warn(`API not implemented: getStudentCourses(${studentId}) - TODO: Backend endpoint GET /crm/students/{student_id}/courses`)
  return []
}

/**
 * Returns student's competition registrations by fetching from /students/{student_id}/competitions
 */
export async function getStudentCompetitions(studentId: number): Promise<CompetitionRecord[]> {
  const response = await client.get<ApiResponse<StudentCompetitionsResponse>>(`/students/${studentId}/competitions`)
  const competitionsList = response.data.data?.competitions || []
  return competitionsList.map(c => ({
    id: c.competition?.id || c.team.id,
    competition_name: c.competition?.name || 'Unknown Competition',
    date: c.competition?.date || null,
    result: c.team.placement_label || (c.team.placement_rank ? `${c.team.placement_rank} Place` : null),
    achievement: c.team.placement_label || null,
    notes: c.team.project_name ? `Project: ${c.team.project_name}` : null
  }))
}

/**
 * Returns student's team memberships by fetching from /students/{student_id}/competitions
 */
export async function getStudentTeams(studentId: number): Promise<TeamRecord[]> {
  const response = await client.get<ApiResponse<StudentCompetitionsResponse>>(`/students/${studentId}/competitions`)
  const competitionsList = response.data.data?.competitions || []
  return competitionsList.map(c => ({
    id: c.team.id,
    team_name: c.team.team_name,
    role: 'Member',
    start_date: c.team.created_at ? new Date(c.team.created_at).toLocaleDateString() : null,
    end_date: null,
    status: 'active'
  }))
}
