import { useState, useEffect, useRef, useCallback } from 'react'
import type { TaskDetailDTO } from '../../api/tasks'
import { TaskStatusBadge } from './TaskStatusBadge'
import { TaskPriorityBadge } from './TaskPriorityBadge'
import { SubtaskChecklist } from './SubtaskChecklist'
import { CommentsFeed } from './CommentsFeed'
import { TimeLogPanel } from './TimeLogPanel'
import { useUpdateTask } from '../../hooks/useTasks'
import { formatDate } from '../../utils/formatting'
import type { TaskStatus } from '../../api/tasks'

interface TaskDetailDrawerProps {
  task: TaskDetailDTO | null
  isOpen: boolean
  onClose: () => void
  currentUserId: number
  isAdmin: boolean
}

type Tab = 'overview' | 'subtasks' | 'activity'

const TAB_DEFINITIONS: { key: Tab; label: string; id: string; panelId: string }[] = [
  { key: 'overview', label: 'Overview', id: 'tab-overview', panelId: 'tabpanel-overview' },
  { key: 'subtasks', label: 'Subtasks', id: 'tab-subtasks', panelId: 'tabpanel-subtasks' },
  { key: 'activity', label: 'Activity', id: 'tab-activity', panelId: 'tabpanel-activity' },
]

export function TaskDetailDrawer({ task, isOpen, onClose, currentUserId, isAdmin }: TaskDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const updateMutation = useUpdateTask()
  const drawerRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement
      drawerRef.current?.focus()
    } else {
      previousFocusRef.current?.focus()
    }
  }, [isOpen])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
      return
    }
    if (e.key === 'Tab' && drawerRef.current) {
      const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
  }, [onClose])

  if (!isOpen || !task) return null

  const isAssigned = task.assigned_to === currentUserId
  const canEdit = isAdmin || isAssigned

  const handleStatusChange = (status: TaskStatus) => {
    updateMutation.mutate({ id: task.id, data: { status } })
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40 lg:bg-black/20"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Task: ${task.title}`}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className="fixed right-0 top-0 h-full w-full max-w-lg bg-white z-50 shadow-2xl flex flex-col outline-none"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-start justify-between">
          <div className="flex-1 min-w-0 pr-4">
            <h2 className="text-lg font-semibold text-slate-900 font-headline truncate">{task.title}</h2>
            <div className="flex items-center gap-2 mt-2">
              <TaskStatusBadge status={task.status} />
              <TaskPriorityBadge priority={task.priority} />
              {task.is_recurring && (
                <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                  <span className="material-symbols-outlined text-xs">repeat</span>
                  {task.recurrence_pattern}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close task detail"
            className="text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0"
          >
            <span className="material-symbols-outlined" aria-hidden="true">close</span>
          </button>
        </div>

        {/* Tabs */}
        <div role="tablist" className="flex border-b border-slate-200 px-6">
          {TAB_DEFINITIONS.map((tab) => (
            <button
              key={tab.key}
              role="tab"
              id={tab.id}
              aria-selected={activeTab === tab.key}
              aria-controls={tab.panelId}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.key === 'overview' && 'Overview'}
              {tab.key === 'subtasks' && `Subtasks (${task.subtasks.length})`}
              {tab.key === 'activity' && `Activity (${task.comments.length + task.time_logs.length})`}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {activeTab === 'overview' && (
            <div role="tabpanel" id="tabpanel-overview" aria-labelledby="tab-overview" className="space-y-6">
              {/* Status actions */}
              {canEdit && (
                <div className="flex gap-2">
                  {(['todo', 'in_progress', 'done', 'cancelled'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      disabled={task.status === status}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                        task.status === status
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {status.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              )}

              {/* Description */}
              {task.description && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Description</h4>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{task.description}</p>
                </div>
              )}

              {/* Meta */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Assigned To</h4>
                  <p className="text-sm text-slate-700">{task.assigned_to_name ?? '—'}</p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Assigned By</h4>
                  <p className="text-sm text-slate-700">{task.assigned_by_name ?? '—'}</p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Due Date</h4>
                  <p className={`text-sm ${task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done' && task.status !== 'cancelled' ? 'text-red-600 font-medium' : 'text-slate-700'}`}>
                    {task.due_date ? formatDate(task.due_date) : '—'}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Est. Hours</h4>
                  <p className="text-sm text-slate-700">{task.estimated_hours ?? '—'}</p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Created</h4>
                  <p className="text-sm text-slate-700">{formatDate(task.created_at)}</p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Updated</h4>
                  <p className="text-sm text-slate-700">{formatDate(task.updated_at)}</p>
                </div>
              </div>

              {/* Tags */}
              {task.tags.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Tags</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {task.tags.map((tag) => (
                      <span key={tag} className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'subtasks' && (
            <div role="tabpanel" id="tabpanel-subtasks" aria-labelledby="tab-subtasks">
              <SubtaskChecklist subtasks={task.subtasks} taskId={task.id} isAdmin={isAdmin} />
            </div>
          )}

          {activeTab === 'activity' && (
            <div role="tabpanel" id="tabpanel-activity" aria-labelledby="tab-activity" className="space-y-6">
              <CommentsFeed
                comments={task.comments}
                taskId={task.id}
                currentUserId={currentUserId}
                isAdmin={isAdmin}
              />
              <TimeLogPanel
                timeLogs={task.time_logs}
                taskId={task.id}
                isAssigned={isAssigned}
              />
            </div>
          )}
        </div>
      </div>
    </>
  )
}
