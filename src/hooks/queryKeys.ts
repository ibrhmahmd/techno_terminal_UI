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
  competitionCategories: ['competitions', 'categories'] as const,
  competitionTeams: (id: number) => ['competitions', id, 'teams'] as const,
  
  // Finance
  receipts: ['finance', 'receipts'] as const,
  refunds: ['finance', 'refunds'] as const,
  
  // Dashboard
  dashboard: ['dashboard'] as const,
  stats: ['dashboard', 'stats'] as const,
  attendance: ['dashboard', 'attendance'] as const,
} as const
