import client from './client'

// Employee Types
export interface Employee {
  id: string
  full_name: string
  email: string
  phone?: string
  national_id?: string
  address?: string
  date_of_birth?: string
  hire_date: string
  job_title: string
  department: 'academics' | 'operations' | 'admin' | 'management'
  employment_type: 'full_time' | 'part_time' | 'contract'
  salary: number
  status: 'active' | 'on_leave' | 'terminated' | 'suspended'
  emergency_contact_name?: string
  emergency_contact_phone?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface CreateEmployeeInput {
  full_name: string
  email: string
  phone?: string
  national_id?: string
  address?: string
  date_of_birth?: string
  hire_date: string
  job_title: string
  department: 'academics' | 'operations' | 'admin' | 'management'
  employment_type: 'full_time' | 'part_time' | 'contract'
  salary: number
  emergency_contact_name?: string
  emergency_contact_phone?: string
  notes?: string
}

export interface UpdateEmployeeInput extends Partial<CreateEmployeeInput> {
  status?: 'active' | 'on_leave' | 'terminated' | 'suspended'
}

// Attendance Types
export interface AttendanceRecord {
  id: string
  employee_id: string
  employee_name: string
  date: string
  check_in?: string
  check_out?: string
  status: 'present' | 'absent' | 'late' | 'on_leave' | 'half_day'
  notes?: string
  recorded_by?: string
}

export interface LogAttendanceInput {
  employee_id: string
  date: string
  check_in?: string
  check_out?: string
  status: 'present' | 'absent' | 'late' | 'on_leave' | 'half_day'
  notes?: string
}

// Payroll Types
export interface PayrollRecord {
  id: string
  employee_id: string
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

// Employee API Functions
export async function getEmployees(): Promise<Employee[]> {
  const response = await client.get<{ data: Employee[] }>('/hr/employees')
  return response.data.data || []
}

export async function getEmployee(id: string): Promise<Employee> {
  const response = await client.get<{ data: Employee }>(`/hr/employees/${id}`)
  return response.data.data
}

export async function createEmployee(data: CreateEmployeeInput): Promise<Employee> {
  const response = await client.post<{ data: Employee }>('/hr/employees', data)
  return response.data.data
}

export async function updateEmployee(id: string, data: UpdateEmployeeInput): Promise<Employee> {
  const response = await client.patch<{ data: Employee }>(`/hr/employees/${id}`, data)
  return response.data.data
}

export async function deleteEmployee(id: string): Promise<void> {
  await client.delete(`/hr/employees/${id}`)
}

// Attendance API Functions
export async function getAttendance(date?: string, employeeId?: string): Promise<AttendanceRecord[]> {
  const params: Record<string, string> = {}
  if (date) params.date = date
  if (employeeId) params.employee_id = employeeId
  
  const response = await client.get<{ data: AttendanceRecord[] }>('/hr/attendance', {
    params: Object.keys(params).length > 0 ? params : undefined
  })
  return response.data.data || []
}

export async function logAttendance(data: LogAttendanceInput): Promise<AttendanceRecord> {
  const response = await client.post<{ data: AttendanceRecord }>('/hr/attendance', data)
  return response.data.data
}

export async function updateAttendance(id: string, data: Partial<LogAttendanceInput>): Promise<AttendanceRecord> {
  const response = await client.patch<{ data: AttendanceRecord }>(`/hr/attendance/${id}`, data)
  return response.data.data
}

// Payroll API Functions
export async function getPayroll(month: string, year: number): Promise<PayrollRecord[]> {
  const response = await client.get<{ data: PayrollRecord[] }>('/hr/payroll', {
    params: { month, year }
  })
  return response.data.data || []
}

export async function processPayroll(employeeId: string, month: string, year: number): Promise<PayrollRecord> {
  const response = await client.post<{ data: PayrollRecord }>('/hr/payroll/process', {
    employee_id: employeeId,
    month,
    year
  })
  return response.data.data
}

export async function markPayrollPaid(id: string): Promise<PayrollRecord> {
  const response = await client.patch<{ data: PayrollRecord }>(`/hr/payroll/${id}/mark-paid`)
  return response.data.data
}

// Dashboard Stats
export async function getHRStats(): Promise<{
  total_employees: number
  active_employees: number
  on_leave: number
  present_today: number
  late_today: number
  absent_today: number
  monthly_payroll_total: number
}> {
  const response = await client.get<{ data: {
    total_employees: number
    active_employees: number
    on_leave: number
    present_today: number
    late_today: number
    absent_today: number
    monthly_payroll_total: number
  } }>('/hr/stats')
  return response.data.data
}
