// Centralized React Query keys for consistent cache management
// Follows pattern: ['resource', id?, 'nested?']

export const queryKeys = {
  // Groups
  groups: ['groups'] as const,
  group: (id: number) => ['groups', id] as const,
  groupLevels: (id: number) => ['groups', id, 'levels'] as const,
  groupSessions: (id: number) => ['groups', id, 'sessions'] as const,
  groupHistory: (id: number) => ['groups', id, 'history'] as const,
  groupStudents: (id: number) => ['groups', id, 'students'] as const,
  groupPayments: (id: number) => ['groups', id, 'payments'] as const,
  groupEnrollments: (id: number) => ['groups', id, 'enrollments'] as const,
  groupAttendance: (id: number, levelNumber: number) => ['groups', id, 'attendance', levelNumber] as const,
  groupsArchived: ['groups', 'archived'] as const,
  groupsByCourse: (courseId: number) => ['groups', 'by-course', courseId] as const,
  groupsByType: (groupType: string) => ['groups', 'by-type', groupType] as const,
  groupSearch: (query: string, status?: string) => ['groups', 'search', query, status] as const,
  
  // Students
  students: ['students'] as const,
  student: (id: number) => ['students', id] as const,
  studentDetails: (id: number) => ['students', id, 'details'] as const,
  studentBalance: (id: number) => ['students', id, 'balance'] as const,
  studentSiblings: (id: number) => ['students', id, 'siblings'] as const,
  
  // Courses
  courses: ['courses'] as const,
  course: (id: number) => ['courses', id] as const,
  
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
  teamPayments: (id: number) => ['teams', id, 'payments'] as const,
  teamsByCompetition: (competitionId: number, filters?: { category?: string; subcategory?: string }) => ['teams', 'by-competition', competitionId, filters] as const,
  teamsWithMembers: (competitionId: number, filters?: { category?: string; subcategory?: string }) => ['teams', 'with-members', competitionId, filters] as const,

  // Finance
  receipts: ['finance', 'receipts'] as const,
  refunds: ['finance', 'refunds'] as const,
  competitionFees: (studentId: number) => ['finance', 'competition-fees', studentId] as const,
  
  // Dashboard
  dashboard: ['dashboard'] as const,
  stats: ['dashboard', 'stats'] as const,
  attendance: ['dashboard', 'attendance'] as const,
} as const
