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
  studentsAll: ['students'] as const,
  studentDetails: (id: number) => ['students', id, 'details'] as const,
  studentsGroupedAll: ['students', 'grouped'] as const,
  studentsGroupedByParams: (groupBy: string, skip: number, limit: number, tab: string, ageBucketsKey: string) => ['students', 'grouped', groupBy, skip, limit, tab, ageBucketsKey] as const,
  
  // Courses
  courses: ['courses'] as const,
  coursesListSimple: ['courses', 'list-simple'] as const,
  
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
    weeklyReport: {
      data: (date: string) => ['reports', 'weekly-report', 'data', date] as const,
    },
    monthlyReport: {
      data: (date: string) => ['reports', 'monthly-report', 'data', date] as const,
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
  employees: {
    all: ['employees', 'all'] as const,
    list: () => ['employees', 'list'] as const,
  },

  // Directory
  directory: {
    students: {
      all:        ['directory', 'students'] as const,
      list:       (page: number, size: number) => ['directory', 'students', 'list', page, size] as const,
      search:     (term: string)  => ['directory', 'students', 'search', term] as const,
      deleted:    (page: number, size: number) => ['directory', 'students', 'deleted', page, size] as const,
      filter:     (filters: import('../api/crm').StudentFilterParams) => ['directory', 'students', 'filter', filters] as const,
    },
    parents: {
      all:        ['directory', 'parents'] as const,
      list:       (page: number, size: number) => ['directory', 'parents', 'list', page, size] as const,
      search:     (term: string)  => ['directory', 'parents', 'search', term] as const,
    },
    waitingList: {
      all:      ['directory', 'waitingList'] as const,
      list:     (params: import('../types/pagination').PaginationParams) => ['directory', 'waitingList', 'list', params] as const,
      student:  (id: number) => ['directory', 'waitingList', 'student', id] as const,
    },
  },

  // Notifications
  notifications: {
    admin: {
      all: ['notifications', 'admin'] as const,
      settings: () => ['notifications', 'admin', 'settings'] as const,
      recipients: () => ['notifications', 'admin', 'recipients'] as const,
    },
    logs: {
      all: ['notifications', 'logs'] as const,
      list: (filters?: unknown) => ['notifications', 'logs', 'list', filters] as const,
      detail: (id: number) => ['notifications', 'logs', 'detail', id] as const,
    },
  },

  // Dashboard
  dashboard: {
    overview: (date: string) => ['dashboard', 'overview', date] as const,
    schedule: (date: string) => ['dashboard', 'schedule', date] as const,
    sessions: (groupId: number) => ['dashboard', 'sessions', groupId] as const,
  },

  // Tasks
  tasks: {
    all: ['tasks'] as const,
    list: (filters?: import('../api/tasks').TaskFilters) => ['tasks', 'list', filters] as const,
    detail: (id: string) => ['tasks', 'detail', id] as const,
  },

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
