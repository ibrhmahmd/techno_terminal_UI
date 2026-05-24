// Student Enrollment Data API - Per-enrollment lazy-loaded data
// TODO: Backend endpoints to be implemented

import type { CourseRecord, CompetitionRecord, TeamRecord } from './types/models'

/**
 * TODO: Backend endpoint GET /crm/students/{student_id}/courses
 * Returns student's course history with progress and grades
 */
export async function getStudentCourses(studentId: number): Promise<CourseRecord[]> {
  console.warn(`API not implemented: getStudentCourses(${studentId}) - TODO: Backend endpoint GET /crm/students/{student_id}/courses`)
  return []
}

/**
 * TODO: Backend endpoint GET /students/{student_id}/competitions
 * Documented at docs/api/competitions/teams.md
 * Returns StudentCompetitionsResponse { student_id, competitions: StudentCompetitionDTO[] }
 * StudentCompetitionDTO: { membership: TeamMemberDTO, team: TeamDTO, category: CompetitionCategoryDTO, competition: CompetitionDTO }
 * Note: Full-team endpoint, not per-group scoped
 */
export async function getStudentCompetitions(studentId: number): Promise<CompetitionRecord[]> {
  console.warn(`API not implemented: getStudentCompetitions(${studentId}) - TODO: Backend endpoint GET /crm/students/{student_id}/competitions`)
  return []
}

/**
 * TODO: Backend endpoint GET /crm/students/{student_id}/teams
 * Returns student's team memberships
 */
export async function getStudentTeams(studentId: number): Promise<TeamRecord[]> {
  console.warn(`API not implemented: getStudentTeams(${studentId}) - TODO: Backend endpoint GET /crm/students/{student_id}/teams`)
  return []
}
