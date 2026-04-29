// Type definitions
export type {
  // Employee types (aligned with backend API)
  EmployeePublic,
  EmployeeListItem,
  EmployeeCreateInput,
  
  // Backward compatibility aliases
  EmployeePublic as Employee,
  EmployeeCreateInput as CreateEmployeeInput,
  EmployeeCreateInput as UpdateEmployeeInput,
  
  // Staff account types
  StaffAccountPublic,
  CreateEmployeeAccountRequest,
  EmployeeAccountResponse,
  
  // Attendance types
  AttendanceLogInput,
  AttendanceLogOutput,
  AttendanceLogInput as LogAttendanceInput,
} from './types'

// API functions
export * from './employees'
export * from './attendance'
export * from './staff-accounts'

// Deprecated - payroll not in backend API
export * from './payroll'
