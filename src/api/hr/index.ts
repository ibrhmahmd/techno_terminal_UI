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
} from './types'

// API functions
export * from './employees'
export * from './staff-accounts'
