// Activity History Types - CRM Student Activity Tracking
// @see docs/api/crm/student_history.md

export type ActivityType =
  | 'registration'
  | 'status_change'
  | 'enrollment'
  | 'enrollment_change'
  | 'payment'
  | 'note_added'
  | 'competition'
  | 'deletion'

export type ReferenceType =
  | 'student'
  | 'enrollment'
  | 'payment'
  | 'group'
  | 'course'
  | 'competition'

export interface ActivityLogResponseDTO {
  id: number
  student_id: number
  activity_type: ActivityType
  activity_subtype?: string | null
  description?: string | null
  reference_type?: ReferenceType | null
  reference_id?: number | null
  performed_by_user_id: number
  performed_by_name?: string | null
  created_at: string
  metadata?: Record<string, unknown> | null
}

export interface ActivitySummaryItem {
  activity_type: ActivityType
  count: number
}

/**
 * Enrollment lifecycle history entry - aligned with API documentation
 * @see docs/api/crm/student_history.md#EnrollmentHistoryEntry
 */
export interface EnrollmentHistoryEntry {
  enrollment_id: number
  group_id: number
  group_name: string
  course_id: number
  course_name: string
  level_number: number
  enrollment_status: string
  action: 'enrolled' | 'transferred' | 'dropped'
  action_date: string
  previous_group_id?: number | null
  previous_level_number?: number | null
  amount_due?: number | null
  discount_applied?: number | null
  transfer_reason?: string | null
  performed_by?: number | null
  performed_by_name?: string | null
  notes?: string | null
}

/**
 * Competition participation history entry - aligned with API documentation
 * @see docs/api/crm/student_history.md#CompetitionHistoryEntry
 */
export interface CompetitionHistoryEntry {
  id: number
  student_id: number
  competition_id: number
  competition_name?: string | null
  team_id?: number | null
  team_name?: string | null
  participation_type: 'individual' | 'team'
  registration_date?: string | null
  subscription_amount?: number | null
  subscription_paid?: boolean | null
}

export interface ActivityLogRequest {
  activity_type: ActivityType
  activity_subtype?: string | null
  description?: string | null
  reference_type?: ReferenceType | null
  reference_id?: number | null
}

export interface ManualActivityResponseDTO {
  id: number
  student_id: number
  activity_type: ActivityType
  description?: string | null
  created_at: string
  performed_by: number
}

export interface RecentActivityItemDTO {
  id: number
  student_id: number
  student_name: string
  activity_type: ActivityType
  description?: string | null
  created_at: string
  performed_by_name?: string | null
}

export interface ActivitySearchParams {
  search_term?: string
  activity_types?: ActivityType[]
  date_from?: string
  date_to?: string
  performed_by?: number
  student_id?: number
  limit?: number
}

export interface ActivitySearchResultItemDTO {
  id: number
  student_id: number
  student_name: string
  activity_type: ActivityType
  description?: string | null
  created_at: string
  performed_by_name?: string | null
}
