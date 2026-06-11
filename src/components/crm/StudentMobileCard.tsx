import { Link } from 'react-router-dom'
import type { StudentStatus } from '../../api/crm'

export interface StudentMobileCardProps {
  id: number
  name: string
  gender: string
  grade?: string | null
  status: StudentStatus
  billingStatus?: string
  current_group_name?: string | null
}

const STATUS_ICONS: Record<StudentStatus, string> = {
  active: 'check_circle',
  waiting: 'schedule',
  inactive: 'cancel',
}

const STATUS_COLORS: Record<StudentStatus, string> = {
  active: 'text-green-600',
  waiting: 'text-amber-600',
  inactive: 'text-slate-400',
}

const VALID_STATUSES: StudentStatus[] = ['active', 'waiting', 'inactive']

export function StudentMobileCard({
  id,
  name,
  gender,
  grade,
  status,
  billingStatus,
  current_group_name,
}: StudentMobileCardProps) {
  const validStatus: StudentStatus = VALID_STATUSES.includes(status as StudentStatus)
    ? (status as StudentStatus)
    : 'inactive'
  const iconName = STATUS_ICONS[validStatus]
  const iconColor = STATUS_COLORS[validStatus]

  return (
    <Link
      to={`/students/${id}`}
      className="w-full bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between text-left transition-colors hover:bg-slate-50 active:bg-slate-100"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
          gender === 'male' ? 'bg-blue-50 text-blue-500' : 'bg-pink-50 text-pink-500'
        }`}>
          <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
            {gender === 'male' ? 'face' : 'face_3'}
          </span>
        </div>
        
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={`${iconColor} shrink-0`} title={status}>
              <span aria-hidden="true" className="material-symbols-outlined text-lg">{iconName}</span>
            </span>
            <h3 className="font-headline font-semibold text-slate-900">{name}</h3>
            {billingStatus === 'due' && (
              <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0" title="Payment Due" />
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            {current_group_name && (
              <span className="flex items-center gap-1">
                <span aria-hidden="true" className="material-symbols-outlined text-[14px]">school</span>
                <span className="truncate max-w-[140px]">{current_group_name}</span>
              </span>
            )}
            {grade && (
              <span className="text-slate-500">{grade}</span>
            )}
          </div>
        </div>
      </div>
      
      <span className="material-symbols-outlined text-slate-400 shrink-0 ml-2" aria-hidden="true">chevron_right</span>
    </Link>
  )
}
