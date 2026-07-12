import { memo } from 'react'
import type { TaskStatus } from '../../api/tasks'
import { STATUS_LABELS } from '../../api/tasks'

const STATUS_STYLES: Record<TaskStatus, string> = {
  todo: 'bg-slate-100 text-slate-700',
  in_progress: 'bg-blue-100 text-blue-700',
  done: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-600',
}

interface TaskStatusBadgeProps {
  status: TaskStatus
  className?: string
}

export const TaskStatusBadge = memo(function TaskStatusBadge({ status, className = '' }: TaskStatusBadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[status]} ${className}`}>
      {STATUS_LABELS[status]}
    </span>
  )
})
