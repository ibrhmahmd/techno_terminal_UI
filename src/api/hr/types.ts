/**
 * Employee data as returned by backend API (EmployeePublic schema)
 */
export interface EmployeePublic {
  id: number
  full_name: string
  phone: string
  email: string
  national_id?: string  
  job_title: string
  employment_type: 'full_time' | 'part_time' | 'contract'
  is_active: boolean
  hired_at: string
  university?: string
  major?: string
  is_graduate?: boolean
  monthly_salary?: number
  contract_percentage?: number
}

/**
 * Employee list item - simplified view for lists
 */
export interface EmployeeListItem {
  id: number
  full_name: string
  job_title: string
  employment_type: 'full_time' | 'part_time' | 'contract'
  is_active: boolean
  phone?: string
  email?: string
}

/**
 * Input for creating or updating an employee (EmployeeCreateInput schema)
 * Note: Backend uses the same schema for both create and update (PUT with partial updates)
 * 
 * For CREATE: national_id is required
 * For UPDATE: All fields are optional (partial update)
 */
export interface EmployeeCreateInput {
  full_name: string
  phone: string
  email?: string
  national_id?: string  
  university?: string
  major?: string
  is_graduate?: boolean
  job_title?: string
  employment_type: 'full_time' | 'part_time' | 'contract'
  monthly_salary?: number
  contract_percentage?: number
  is_active?: boolean
}

/**
 * Input for logging attendance (AttendanceLogInput schema)
 */
export interface AttendanceLogInput {
  employee_id: number
  status: 'present' | 'absent' | 'late' | 'early_departure'
  check_in?: string  // ISO 8601 datetime
  check_out?: string  // ISO 8601 datetime
  notes?: string
}

/**
 * Output from attendance logging (AttendanceLogOutput schema)
 */
export interface AttendanceLogOutput {
  employee_id: number
  status: string
  logged_at: string
  message: string
}

/**
 * Staff account information (StaffAccountPublic schema)
 */
export interface StaffAccountPublic {
  id: number
  username: string
  email: string
  employee_id: number
  employee_name: string
  job_title: string
  is_active: boolean
  created_at: string
}

/**
 * Request to create a user account for an employee
 */
export interface CreateEmployeeAccountRequest {
  email: string
  password: string
  role: 'admin' | 'system_admin'
}

/**
 * Response after creating an employee account
 */
export interface EmployeeAccountResponse {
  employee_id: number
  user_id: number
  email: string
  role: string
  created_at: string
}
