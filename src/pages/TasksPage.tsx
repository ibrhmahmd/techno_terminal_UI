import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { TopNavbar } from '../components/dashboard/TopNavbar'
import { TaskListTable } from '../components/tasks/TaskListTable'
import { TaskDetailDrawer } from '../components/tasks/TaskDetailDrawer'
import { CreateTaskModal } from '../components/tasks/CreateTaskModal'
import { useTaskList, useTaskDetail } from '../hooks/useTasks'
import { useAuthStore } from '../store/authStore'
import type { TaskReadDTO, TaskFilters } from '../api/tasks'
import { TASK_STATUSES, TASK_PRIORITIES } from '../api/tasks'
import { useEmployees } from '../hooks/useEmployees'

const EMPTY_TASKS: TaskReadDTO[] = []

export function TasksPage() {
  const { t } = useTranslation('tasks')
  const { t: tCommon } = useTranslation('common')
  const user = useAuthStore((s) => s.user)
  const isAdmin = user?.role === 'admin' || user?.role === 'system_admin'

  // Filters
  const [filters, setFilters] = useState<TaskFilters>({})
  const [createOpen, setCreateOpen] = useState(false)

  // Data
  const { data: tasks, isLoading, error, refetch } = useTaskList(filters)

  // Detail drawer
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const { data: detailTask } = useTaskDetail(selectedTaskId)

  // Employees for filter dropdown
  const { employees } = useEmployees()

  const handleRowClick = useCallback((task: TaskReadDTO) => {
    setSelectedTaskId(task.id)
  }, [])

  return (
    <div className="min-h-screen bg-surface">
      <TopNavbar activePage={t('page_title')} />

      {/* Page header */}
      <div className="px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold font-headline text-slate-900">{t('page_title')}</h1>
            <p className="text-sm text-slate-500 mt-1">{t('subtitle')}</p>
          </div>
          {isAdmin && (
            <button
              onClick={() => setCreateOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined text-base" aria-hidden="true">add</span>
              {t('actions.new_task')}
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <select
            value={filters.status ?? ''}
            onChange={(e) => setFilters((f) => ({ ...f, status: (e.target.value || null) as TaskFilters['status'] }))}
            aria-label={t('filters.by_status')}
            className="text-sm px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          >
            <option value="">{t('filters.all_statuses')}</option>
            {TASK_STATUSES.map((s) => (
              <option key={s} value={s}>{s.replace('_', ' ')}</option>
            ))}
          </select>

          <select
            value={filters.priority ?? ''}
            onChange={(e) => setFilters((f) => ({ ...f, priority: (e.target.value || null) as TaskFilters['priority'] }))}
            aria-label={t('filters.by_priority')}
            className="text-sm px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          >
            <option value="">{t('filters.all_priorities')}</option>
            {TASK_PRIORITIES.map((p) => (
              <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
            ))}
          </select>

          <select
            value={filters.assigned_to ?? ''}
            onChange={(e) => setFilters((f) => ({ ...f, assigned_to: e.target.value ? parseInt(e.target.value) : null }))}
            aria-label={t('filters.by_assignee')}
            className="text-sm px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          >
            <option value="">{t('filters.all_assignees')}</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>{emp.full_name}</option>
            ))}
          </select>

          <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.is_recurring === true}
              onChange={(e) => setFilters((f) => ({ ...f, is_recurring: e.target.checked ? true : null }))}
              className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
            />
            {t('filters.recurring_only')}
          </label>

          {(filters.status || filters.priority || filters.assigned_to || filters.is_recurring) && (
            <button
              onClick={() => setFilters({})}
              className="text-xs text-slate-500 hover:text-slate-700 underline"
            >
              {t('filters.clear')}
            </button>
          )}
        </div>

        {/* Content */}
        {error ? (
          <div className="text-center py-12">
            <p className="text-sm text-red-600 mb-2">{t('toast.load_failed')}</p>
            <button onClick={() => refetch()} className="text-sm text-teal-600 hover:underline">{tCommon('buttons.retry')}</button>
          </div>
        ) : isLoading ? (
          <div role="status" className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <span className="sr-only">{t('loading')}</span>
            <div className="divide-y divide-slate-100">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-4 py-3">
                  <div className="h-4 bg-slate-100 rounded animate-pulse flex-1 max-w-[280px]" />
                  <div className="h-5 w-14 bg-slate-100 rounded animate-pulse" />
                  <div className="h-5 w-16 bg-slate-100 rounded animate-pulse" />
                  <div className="h-4 w-24 bg-slate-100 rounded animate-pulse hidden md:block" />
                  <div className="h-4 w-20 bg-slate-100 rounded animate-pulse hidden lg:block" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <TaskListTable tasks={tasks ?? EMPTY_TASKS} onRowClick={handleRowClick} />
          </div>
        )}
      </div>

      {/* Detail Drawer */}
      <TaskDetailDrawer
        task={detailTask ?? null}
        isOpen={!!selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
        currentUserId={user?.id ?? 0}
        isAdmin={isAdmin}
      />

      {/* Create Modal */}
      <CreateTaskModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
      />
    </div>
  )
}
