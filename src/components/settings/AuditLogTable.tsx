import { useTranslation } from 'react-i18next'
import { formatDate } from '../../utils/formatting'
import type { AuditLogEntry } from '../../api/auth/types'
import { EVENT_LABELS } from '../../constants/auditLabels'
import { LoadingSpinner } from '../common/LoadingSpinner'

interface AuditLogTableProps {
  data: AuditLogEntry[]
  total: number
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  isLoading: boolean
  error: boolean
}

export function AuditLogTable({ data, total, page, pageSize, onPageChange, isLoading, error }: AuditLogTableProps) {
  const { t } = useTranslation('common')
  const totalPages = Math.ceil(total / pageSize)

  if (isLoading) {
    return <div className="bg-white rounded-[6px] shadow-sm p-8 text-center font-body"><LoadingSpinner /></div>
  }

  if (error) {
    return <div className="bg-white rounded-[6px] shadow-sm p-8 text-center font-body"><p className="text-red-600">{t('settings_users.failed_load_audit')}</p></div>
  }

  if (data.length === 0) {
    return <div className="bg-white rounded-[6px] shadow-sm p-8 text-center font-body" role="status"><p className="text-slate-500">{t('settings_users.no_records')}</p></div>
  }

  return (
    <div className="bg-white rounded-[6px] shadow-sm p-6 font-body">
      <div className="overflow-x-auto">
        <table className="w-full text-start text-sm font-body">
          <thead className="bg-slate-50/50">
            <tr>
              <th scope="col" className="py-2.5 px-3 text-slate-500 font-semibold text-xs uppercase tracking-wider">{t('settings_sessions.event')}</th>
              <th scope="col" className="py-2.5 px-3 text-slate-500 font-semibold text-xs uppercase tracking-wider">{t('settings_users.user_id')}</th>
              <th scope="col" className="py-2.5 px-3 text-slate-500 font-semibold text-xs uppercase tracking-wider">{t('settings_sessions.ip_address')}</th>
              <th scope="col" className="py-2.5 px-3 text-slate-500 font-semibold text-xs uppercase tracking-wider">{t('settings_sessions.date')}</th>
            </tr>
          </thead>
          <tbody>
            {data.map((entry) => (
              <tr key={entry.id} className="odd:bg-white even:bg-slate-50/30 hover:bg-slate-50/50 transition-colors">
                <td className="py-2 px-3">
                  <span className="text-on-surface font-medium">{EVENT_LABELS[entry.event_type] || entry.event_type}</span>
                </td>
                <td className="py-2 px-3 text-slate-500 font-mono">{entry.user_id ?? '\u2014'}</td>
                <td className="py-2 px-3 text-slate-500 font-mono">{entry.ip_address || '\u2014'}</td>
                <td className="py-2 px-3 text-slate-500">{formatDate(entry.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 mt-4">
          <p className="text-xs text-slate-500 font-body">
            Showing {page * pageSize + 1}&#8211;{Math.min((page + 1) * pageSize, total)} of {total}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(Math.max(0, page - 1))}
              disabled={page === 0}
              className="px-3 py-1.5 text-xs bg-slate-100 text-slate-700 rounded-[6px] hover:bg-slate-200 transition-colors duration-120 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {t('common:pagination.previous')}
            </button>
            <button
              onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className="px-3 py-1.5 text-xs bg-slate-100 text-slate-700 rounded-[6px] hover:bg-slate-200 transition-colors duration-120 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {t('common:pagination.next')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

interface AuditDateFilterProps {
  from: string
  to: string
  onFromChange: (val: string) => void
  onToChange: (val: string) => void
}

export function AuditDateFilter({ from, to, onFromChange, onToChange }: AuditDateFilterProps) {
  const { t } = useTranslation('common')
  return (
    <div className="flex gap-3 items-end font-body">
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{t('settings_audit.from')}</label>
        <input
          type="date"
          value={from}
          onChange={(e) => onFromChange(e.target.value)}
          className="bg-transparent border-0 border-b border-slate-300 focus:border-secondary focus:ring-0 px-1 py-1 text-sm rounded-none outline-none transition-colors"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{t('settings_audit.to')}</label>
        <input
          type="date"
          value={to}
          onChange={(e) => onToChange(e.target.value)}
          className="bg-transparent border-0 border-b border-slate-300 focus:border-secondary focus:ring-0 px-1 py-1 text-sm rounded-none outline-none transition-colors"
        />
      </div>
    </div>
  )
}


