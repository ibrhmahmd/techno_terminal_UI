// Centralized React Query keys for consistent cache management
// Follows pattern: ['resource', id?, 'nested?']

import type { GroupFilterOptions, GroupByField } from '../api/academics'

export const queryKeys = {
  // Groups
  groups: ['groups'] as const,
  group: (id: number) => ['groups', id] as const,
  groupLevels: (id: number) => ['groups', id, 'levels'] as const,
  groupSessions: (id: number) => ['groups', id, 'sessions'] as const,
  groupPayments: (id: number) => ['groups', id, 'payments'] as const,
  groupEnrollments: (id: number) => ['groups', id, 'enrollments'] as const,
  groupEnrollmentHistory: (id: number) => ['groups', id, 'enrollment-history'] as const,
  groupInstructorHistory: (id: number) => ['groups', id, 'instructor-history'] as const,
  groupAttendance: (id: number, levelNumber: number) => ['groups', id, 'attendance', levelNumber] as const,
  groupFlat: (filters?: GroupFilterOptions) => ['groups', 'flat', filters] as const,
  groupGrouped: (by: GroupByField) => ['groups', 'grouped', by] as const,
  groupByCourse: (courseId: number) => ['groups', 'by-course', courseId] as const,
  
  // Students
  studentDetails: (id: number) => ['students', id, 'details'] as const,
  studentsGroupedAll: ['students', 'grouped'] as const,
  studentsGroupedByParams: (groupBy: string, skip: number, limit: number, tab: string, ageBucketsKey: string) => ['students', 'grouped', groupBy, skip, limit, tab, ageBucketsKey] as const,
  
  // Courses
  courses: ['courses'] as const,
  
  // Competitions
  competitions: ['competitions'] as const,
  competition: (id: number) => ['competitions', id] as const,
  competitionSummary: (id: number) => ['competitions', id, 'summary'] as const,
  competitionCategories: (id: number) => ['competitions', id, 'categories'] as const,
  studentCompetitions: (studentId: number) => ['students', studentId, 'competitions'] as const,

  // Teams
  teams: ['teams'] as const,
  team: (id: number) => ['teams', id] as const,
  teamMembers: (id: number) => ['teams', id, 'members'] as const,
  teamsByCompetition: (competitionId: number, filters?: { category?: string; subcategory?: string }) => ['teams', 'by-competition', competitionId, filters] as const,

  // Reports
  reports: {
    summary: (today: string) => ['reports', 'summary', today] as const,
    revenue: (months?: number) => ['reports', 'revenue', months] as const,
    studentProgress: ['reports', 'student-progress'] as const,
    dailyCollections: (date: string) => ['reports', 'daily-collections', date] as const,
    dailyReceipts: (date: string) => ['reports', 'daily-receipts', date] as const,
    dailyReport: {
      data: (date: string) => ['reports', 'daily-report', 'data', date] as const,
    },
  },

  // Finance
  finance: {
    metrics: (date: string) => ['finance', 'metrics', date] as const,
    dailyReceipts: (date: string) => ['finance', 'daily-receipts', date] as const,
    receipts: {
      search: (params: Record<string, unknown>) => ['finance', 'receipts', 'search', params] as const,
      detail: (id: number) => ['finance', 'receipts', id] as const,
    },
    studentEnrollments: (studentId: number) => ['finance', 'student-enrollments', studentId] as const,
  },

  // Employees
  employeesAll: ['employees', 'all'] as const,

  // Auth
  auth: {
    all: ['auth'] as const,
    sessions: ['auth', 'sessions'] as const,
    activity: ['auth', 'activity'] as const,
    users: ['auth', 'admin', 'users'] as const,
    auditLogins: ['auth', 'admin', 'audit', 'logins'] as const,
    auditPasswordChanges: ['auth', 'admin', 'audit', 'password-changes'] as const,
    auditFailedAttempts: ['auth', 'admin', 'audit', 'failed-attempts'] as const,
    mfa: ['auth', 'mfa'] as const,
  },
} as const
