// Notifications API Types
// DTOs and interfaces for Admin Settings, Templates, Logs, and Bulk Messaging

// ============================================================================
// Core Enums and Types
// ============================================================================

export type NotificationType =
  | 'enrollment_created'
  | 'enrollment_completed'
  | 'enrollment_dropped'
  | 'enrollment_transferred'
  | 'level_progression'
  | 'payment_received'
  | 'payment_reminder'
  | 'daily_report'
  | 'weekly_report'
  | 'monthly_report'
  | 'competition_team_registration'
  | 'competition_fee_payment'
  | 'competition_placement'
  | 'admin_login_alert'

export type NotificationChannel = 'EMAIL'

// ============================================================================
// Admin Settings Types
// ============================================================================

export interface AdminNotificationSettingDTO {
  notification_type: NotificationType
  is_enabled: boolean
  channel: NotificationChannel
  description: string
}

export interface AdditionalRecipientDTO {
  id: number
  email: string
  label: string | null
  notification_types: NotificationType[] | null
  is_active: boolean
}

export interface AdminSettingsResponse {
  admin_id: number
  settings: AdminNotificationSettingDTO[]
  additional_recipients: AdditionalRecipientDTO[]
}

export interface UpdateAdminSettingsRequest {
  settings: Record<string, boolean>
}

export interface ToggleNotificationRequest {
  is_enabled: boolean
}

export interface AddRecipientRequest {
  email: string
  label?: string
  notification_types?: NotificationType[]
}

export interface UpdateRecipientRequest {
  email?: string
  label?: string
  notification_types?: NotificationType[]
  is_active?: boolean
}

// ============================================================================
// Log Types
// ============================================================================

export interface LogRecipientDTO {
  id: number
  recipient_email: string
  recipient_type: 'admin' | 'additional' | 'student' | 'parent'
  status: 'pending' | 'sent' | 'failed'
  error_message?: string
  sent_at?: string
}

export interface TemplateSummaryDTO {
  id: number
  template_key: string
  name: string
  subject: string
}

export interface NotificationLogDTO {
  id: number
  template_id?: number
  channel: 'EMAIL' | 'WHATSAPP' | string
  recipient_type: 'PARENT' | 'EMPLOYEE' | string
  recipient_id: number
  recipient_contact: string
  subject: string | null
  body: string
  status: 'PENDING' | 'SENT' | 'FAILED' | string
  error_message?: string
  sent_at?: string
  created_at: string
}

export interface NotificationLogDetailDTO extends NotificationLogDTO {
  recipients?: LogRecipientDTO[]
  template?: TemplateSummaryDTO
}

export interface NotificationLogFilters {
  status?: string
  channel?: string
  search?: string
  recipient_type?: string
  start_date?: string
  end_date?: string
  template_id?: number
  sort_by?: string
  sort_order?: string
  limit?: number
  offset?: number
}


