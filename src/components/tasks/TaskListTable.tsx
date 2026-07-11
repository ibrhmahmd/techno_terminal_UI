import type { TaskReadDTO } from '../../api/tasks'
import { TaskStatusBadge } from './TaskStatusBadge'
import { TaskPriorityBadge } from './TaskPriorityBadge'
import { formatDate } from '../../utils/formatting'

interface TaskListTableProps {
  tasks: TaskReadDTO[]
  onRowClick: (task: TaskReadDTO) => void
}

export function TaskListTable({ tasks, onRowClick }: TaskListTableProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <span className="material-symbols-outlined text-4xl text-slate-300 mb-3 block">task_alt</span>
        <p className="text-sm text-slate-500">No tasks found</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-left py-3 px-4 font-medium text-slate-500">Title</th>
            <th className="text-left py-3 px-4 font-medium text-slate-500">Priority</th>
            <th className="text-left py-3 px-4 font-medium text-slate-500">Status</th>
            <th className="text-left py-3 px-4 font-medium text-slate-500 hidden md:table-cell">Assigned To</th>
            <th className="text-left py-3 px-4 font-medium text-slate-500 hidden lg:table-cell">Due Date</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr
              key={task.id}
              onClick={() => onRowClick(task)}
              className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
            >
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-900 truncate max-w-[280px]">{task.title}</span>
                  {task.is_recurring && (
                    <span className="material-symbols-outlined text-xs text-slate-400" title="Recurring">repeat</span>
                  )}
                </div>
                {task.tags.length > 0 && (
                  <div className="flex gap-1 mt-1">
                    {task.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded">
                        {tag}
                      </span>
                    ))}
                    {task.tags.length > 3 && (
                      <span className="text-[10px] text-slate-400">+{task.tags.length - 3}</span>
                    )}
                  </div>
                )}
              </td>
              <td className="py-3 px-4">
                <TaskPriorityBadge priority={task.priority} />
              </td>
              <td className="py-3 px-4">
                <TaskStatusBadge status={task.status} />
              </td>
              <td className="py-3 px-4 hidden md:table-cell">
                <span className="text-slate-600">{task.assigned_to_name ?? '—'}</span>
              </td>
              <td className="py-3 px-4 hidden lg:table-cell">
                <span className={`text-slate-600 ${task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done' && task.status !== 'cancelled' ? 'text-red-600 font-medium' : ''}`}>
                  {task.due_date ? formatDate(task.due_date) : '—'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
