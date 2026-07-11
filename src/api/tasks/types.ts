export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'cancelled'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'
export type TaskRecurrencePattern = 'daily' | 'weekly' | 'monthly' | 'custom_interval'

export interface TaskReadDTO {
  id: string
  title: string
  description: string | null
  due_date: string | null
  priority: TaskPriority
  status: TaskStatus
  assigned_to: number | null
  assigned_to_name: string | null
  assigned_by: number | null
  assigned_by_name: string | null
  estimated_hours: number | null
  tags: string[]
  is_recurring: boolean
  recurrence_pattern: TaskRecurrencePattern | null
  parent_task_id: string | null
  created_at: string
  updated_at: string
}

export interface TaskSubtaskReadDTO {
  id: string
  task_id: string
  title: string
  is_done: boolean
  created_at: string
  updated_at: string
}

export interface TaskCommentReadDTO {
  id: string
  task_id: string
  author_id: number
  author_name: string | null
  content: string
  created_at: string
  updated_at: string
}

export interface TaskTimeLogReadDTO {
  id: string
  task_id: string
  employee_id: number
  employee_name: string | null
  hours: number
  note: string | null
  logged_at: string
  created_at: string
}

export interface TaskDetailDTO extends TaskReadDTO {
  subtasks: TaskSubtaskReadDTO[]
  comments: TaskCommentReadDTO[]
  time_logs: TaskTimeLogReadDTO[]
}

export interface CreateTaskInput {
  title: string
  description?: string | null
  due_date?: string | null
  priority?: TaskPriority
  status?: TaskStatus
  assigned_to?: number | null
  estimated_hours?: number | null
  tags?: string[]
  is_recurring?: boolean
  recurrence_pattern?: TaskRecurrencePattern | null
  recurrence_interval_days?: number | null
  recurrence_day_of_week?: number | null
  recurrence_day_of_month?: number | null
}

export interface UpdateTaskInput {
  title?: string | null
  description?: string | null
  due_date?: string | null
  priority?: TaskPriority | null
  status?: TaskStatus | null
  assigned_to?: number | null
  estimated_hours?: number | null
  tags?: string[] | null
  is_recurring?: boolean | null
  recurrence_pattern?: TaskRecurrencePattern | null
  recurrence_interval_days?: number | null
  recurrence_day_of_week?: number | null
  recurrence_day_of_month?: number | null
}

export interface TaskFilters {
  status?: TaskStatus | null
  priority?: TaskPriority | null
  assigned_to?: number | null
  is_recurring?: boolean | null
}

export const TASK_STATUSES: TaskStatus[] = ['todo', 'in_progress', 'done', 'cancelled']
export const TASK_PRIORITIES: TaskPriority[] = ['low', 'medium', 'high', 'urgent']
export const TASK_RECURRENCE_PATTERNS: TaskRecurrencePattern[] = ['daily', 'weekly', 'monthly', 'custom_interval']

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  done: 'Done',
  cancelled: 'Cancelled',
}

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
}
