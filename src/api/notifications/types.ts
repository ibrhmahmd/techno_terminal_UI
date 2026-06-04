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
// Template Types
// ============================================================================

export interface TemplateVariable {
  name: string
  description: string
  required: boolean
  default_value?: string
}

export interface NotificationTemplateDTO {
  id: number
  template_key: string
  name: string
  subject: string
  body_html: string
  body_text: string | null
  variables: TemplateVariable[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateTemplateRequest {
  template_key: string
  name: string
  subject: string
  body_html: string
  body_text?: string
  variables?: TemplateVariable[]
}

export interface UpdateTemplateRequest {
  name?: string
  subject?: string
  body_html?: string
  body_text?: string
  variables?: TemplateVariable[]
  is_active?: boolean
}

export interface TemplateTestRequest {
  recipient_email: string
  variable_values?: Record<string, string>
}

// ============================================================================
// Log Types
// ============================================================================

export type LogStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'partial'

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
  limit?: number
  offset?: number
}

// ============================================================================
// Bulk Messaging Types
// ============================================================================

export type RecipientType = 'admins' | 'students' | 'parents' | 'enrolled_students' | 'active_students' | 'teams'

export interface RecipientFilter {
  recipient_types?: RecipientType[]
  group_ids?: number[]
  course_ids?: number[]
  specific_student_ids?: number[]
  specific_parent_ids?: number[]
  competition_team_ids?: number[]
}

export interface BulkMessagePreviewRecipient {
  email: string
  name: string
  type: RecipientType
}

export interface BulkMessagePreviewDTO {
  total_recipients: number
  recipients_sample: BulkMessagePreviewRecipient[]
  cost_estimate: number
  variables_required: string[]
}

export interface BulkMessageRequest {
  template_id: number
  notification_type: NotificationType
  recipient_filter: RecipientFilter
  variable_values?: Record<string, string>
  scheduled_at?: string
}

export interface BulkMessageResponseDTO {
  job_id: number
  status: 'queued' | 'processing' | 'completed' | 'failed'
  total_recipients: number
  estimated_completion: string
}

export interface BulkMessageJobDTO {
  id: number
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled'
  progress_percent: number
  total_recipients: number
  processed_count: number
  success_count: number
  failure_count: number
  created_at: string
  completed_at?: string
}
