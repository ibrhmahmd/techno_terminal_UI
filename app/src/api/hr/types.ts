export interface Employee {
  id: number
  full_name: string
  email: string
  phone?: string
  national_id?: string
  address?: string
  date_of_birth?: string
  hire_date: string
  job_title: string
  employment_type: 'full_time' | 'part_time' | 'contract'
  salary: number
  status: 'active' | 'on_leave' | 'terminated' | 'suspended'
  is_active?: boolean
  notes?: string
  created_at: string
  updated_at: string
}

export interface EmployeeListItem {
  id: number
  full_name: string
  job_title: string
  employment_type: 'full_time' | 'part_time' | 'contract'
  is_active: boolean
  email?: string
  status?: 'active' | 'on_leave' | 'terminated' | 'suspended'
}

export interface CreateEmployeeInput {
  full_name: string
  phone: string
  email?: string
  national_id: string
  university?: string
  major?: string
  is_graduate?: boolean
  job_title?: string
  employment_type: 'full_time' | 'part_time' | 'contract'
  monthly_salary?: number
  contract_percentage?: number
  is_active?: boolean
  notes?: string
  hire_date?: string
}

export interface UpdateEmployeeInput extends CreateEmployeeInput {
  status?: 'active' | 'on_leave' | 'terminated' | 'suspended'
}

export interface AttendanceRecord {
  id: number
  employee_id: number
  employee_name: string
  date: string
  check_in?: string
  check_out?: string
  status: 'present' | 'absent' | 'late' | 'on_leave' | 'half_day' | 'early_departure'
  notes?: string
  recorded_by?: string
}

export interface LogAttendanceInput {
  employee_id: number
  status: 'present' | 'absent' | 'late' | 'early_departure'
  check_in?: string
  check_out?: string
  notes?: string
}

export interface PayrollRecord {
  id: number
  employee_id: number
  employee_name: string
  month: string
  year: number
  base_salary: number
  bonus: number
  deductions: number
  net_salary: number
  payment_status: 'pending' | 'processed' | 'paid'
  payment_date?: string
  notes?: string
}
