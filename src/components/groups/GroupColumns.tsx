import { useTranslation } from 'react-i18next'
import type { DataTableColumn } from '../common/datatable'
import type { EnrichedGroupPublic } from '../../api/academics'
import { formatTimeDisplay } from '../../utils/formatting'
import { translateDay } from '../../utils/dayTranslation'

export function useGroupColumns(): DataTableColumn<EnrichedGroupPublic>[] {
  const { t } = useTranslation('groups')
  const { t: tCommon } = useTranslation('common')

  return [
    {
      key: 'name',
      header: t('columns.group_name'),
      sortable: true,
      cell: (group) => <span className="font-semibold text-slate-900">{group.name}</span>
    },
    {
      key: 'course_name',
      header: t('columns.course'),
      sortable: true,
      cell: (group) => (
        <span className="text-sm text-slate-600 bg-slate-100/50 px-2.5 py-1 rounded-md border border-slate-200">
          {group.course_name}
        </span>
      )
    },
    {
      key: 'instructor_name',
      header: t('columns.instructor'),
      sortable: true,
      cell: (group) => (
        <span className="text-sm text-slate-600 font-medium">
          {group.instructor_name || <span className="text-slate-400 italic">{t('columns.unassigned')}</span>}
        </span>
      )
    },
    {
      key: 'schedule',
      header: t('columns.schedule'),
      cell: (group) => (
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-semibold text-slate-900">{group.schedule?.day ? translateDay(group.schedule.day, t) : '--'}</span>
          <span className="text-[10px] text-slate-500">
            {formatTimeDisplay(group.schedule?.start_time)} - {formatTimeDisplay(group.schedule?.end_time)}
          </span>
        </div>
      )
    },
    {
      key: 'capacity',
      header: t('columns.capacity'),
      sortable: true,
      align: 'center',
      cell: (group) => (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-700">
          <span className="material-symbols-outlined text-xs" aria-hidden="true">group</span>
          {group.capacity}
        </span>
      )
    },
    {
      key: 'status',
      header: t('columns.status'),
      cell: (group) => {
        const statusConfig: Record<string, { label: string; className: string }> = {
          active: { label: tCommon('status.active'), className: 'bg-green-100 text-green-700' },
          inactive: { label: tCommon('status.inactive'), className: 'bg-slate-100 text-slate-600' },
          archived: { label: tCommon('status.archived'), className: 'bg-amber-100 text-amber-700' },
          completed: { label: tCommon('status.completed'), className: 'bg-blue-100 text-blue-700' },
        }
        const config = statusConfig[group.status] ?? { label: tCommon('status.unknown'), className: 'bg-gray-100 text-gray-600' }
        return (
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${config.className}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current" aria-hidden="true"></span>
            {config.label}
          </span>
        )
      }
    }
  ]
}
