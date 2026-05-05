// Type definitions
export type {
  // Employee types (aligned with backend API)
  EmployeePublic,
  EmployeeListItem,
  EmployeeCreateInput,

  // Staff account types
  StaffAccountPublic,
  CreateEmployeeAccountRequest,
  EmployeeAccountResponse,

  // Attendance types
  AttendanceLogInput,
  AttendanceLogOutput,
} from './types'

// API functions
export * from './employees'
export * from './attendance'
export * from './staff-accounts'
