// Centralized React Query keys for consistent cache management
// Follows pattern: ['resource', id?, 'nested?']

export const queryKeys = {
  // Groups
  groups: ['groups'] as const,
  group: (id: number) => ['groups', id] as const,
  groupHistory: (id: number) => ['groups', id, 'history'] as const,
  groupStudents: (id: number) => ['groups', id, 'students'] as const,
  
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
  competitionDeleted: ['competitions', 'deleted'] as const,
  competitionSummary: (id: number) => ['competitions', id, 'summary'] as const,
  competitionCategories: (id: number) => ['competitions', id, 'categories'] as const,

  // Teams
  teams: ['teams'] as const,
  team: (id: number) => ['teams', id] as const,
  teamDeleted: ['teams', 'deleted'] as const,
  teamMembers: (id: number) => ['teams', id, 'members'] as const,
  teamPayments: (id: number) => ['teams', id, 'payments'] as const,

  // Finance
  receipts: ['finance', 'receipts'] as const,
  refunds: ['finance', 'refunds'] as const,
  
  // Dashboard
  dashboard: ['dashboard'] as const,
  stats: ['dashboard', 'stats'] as const,
  attendance: ['dashboard', 'attendance'] as const,
} as const
