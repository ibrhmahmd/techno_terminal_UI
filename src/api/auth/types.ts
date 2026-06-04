export interface User {
  id: number
  employee_id: number | null
  username: string
  email: string
  role: string
  is_active: boolean
  last_login: string | null
  created_at: string | null
}

export interface Session {
  id: string
  created_at: string
  last_active_at: string
  ip: string
  user_agent: string
}

export interface AuditLogEntry {
  id: number
  user_id: number | null
  event_type: string
  ip_address: string | null
  user_agent: string | null
  details: object | null
  created_at: string
}

export interface MfaStatus {
  enrolled: boolean
  method: string | null
}

