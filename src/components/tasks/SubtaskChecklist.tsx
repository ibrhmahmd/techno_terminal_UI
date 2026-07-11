import { useState } from 'react'
import type { TaskSubtaskReadDTO } from '../../api/tasks'
import { useToggleSubtask, useAddSubtask, useDeleteSubtask } from '../../hooks/useTasks'

interface SubtaskChecklistProps {
  subtasks: TaskSubtaskReadDTO[]
  taskId: string
  isAdmin: boolean
}

export function SubtaskChecklist({ subtasks, taskId, isAdmin }: SubtaskChecklistProps) {
  const [newTitle, setNewTitle] = useState('')
  const toggleMutation = useToggleSubtask()
  const addMutation = useAddSubtask()
  const deleteMutation = useDeleteSubtask()

  const handleToggle = (subtask: TaskSubtaskReadDTO) => {
    toggleMutation.mutate({ subtaskId: subtask.id, is_done: !subtask.is_done, taskId })
  }

  const handleAdd = () => {
    if (!newTitle.trim()) return
    addMutation.mutate({ taskId, title: newTitle.trim() }, {
      onSuccess: () => setNewTitle(''),
    })
  }

  const handleDelete = (subtaskId: string) => {
    deleteMutation.mutate({ subtaskId, taskId })
  }

  const doneCount = subtasks.filter((s) => s.is_done).length
  const progress = subtasks.length > 0 ? Math.round((doneCount / subtasks.length) * 100) : 0

  return (
    <div className="space-y-3">
      {subtasks.length > 0 && (
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-slate-500 font-medium">{doneCount}/{subtasks.length}</span>
        </div>
      )}

      <div className="space-y-1">
        {subtasks.map((subtask) => (
          <div key={subtask.id} className="flex items-center gap-2 py-1.5 group">
            <button
              onClick={() => handleToggle(subtask)}
              className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                subtask.is_done
                  ? 'bg-emerald-500 border-emerald-500 text-white'
                  : 'border-slate-300 hover:border-slate-400'
              }`}
            >
              {subtask.is_done && (
                <span className="material-symbols-outlined text-xs">check</span>
              )}
            </button>
            <span className={`flex-1 text-sm ${subtask.is_done ? 'line-through text-slate-400' : 'text-slate-700'}`}>
              {subtask.title}
            </span>
            {isAdmin && (
              <button
                onClick={() => handleDelete(subtask.id)}
                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            )}
          </div>
        ))}
      </div>

      {isAdmin && (
        <div className="flex gap-2 pt-1">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="Add subtask..."
            className="flex-1 text-sm px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          />
          <button
            onClick={handleAdd}
            disabled={!newTitle.trim() || addMutation.isPending}
            className="px-3 py-1.5 text-sm font-medium text-teal-600 hover:bg-teal-50 rounded-lg transition-colors disabled:opacity-50"
          >
            Add
          </button>
        </div>
      )}
    </div>
  )
}
