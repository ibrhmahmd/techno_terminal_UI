

import { formatInitials } from '../../utils/formatting'

interface GroupHeaderProps {
  name: string
  scheduleTime: string
  level: number
  instructor: string
  enrollmentCount: number
  maxEnrollment: number
  onEdit: () => void
}

export function GroupHeader({ 
  name, 
  scheduleTime, 
  level, 
  instructor, 
  enrollmentCount, 
  maxEnrollment,
  onEdit
}: GroupHeaderProps) {

  return (
    <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-outline-variant/10">
      {/* Left: Title and Meta */}
      <div>
        <h1 className="font-headline text-3xl font-bold text-on-surface tracking-tight">
          {name} <span className="text-outline-variant font-light px-2">/</span>{' '}
          <span className="font-normal text-on-surface-variant">{scheduleTime || 'No schedule'}</span>
        </h1>
        <div className="mt-2 flex items-center space-x-6 text-xs font-medium uppercase tracking-wider text-outline">
          <span className="flex items-center">
            <span className="material-symbols-outlined text-sm mr-1.5">bookmark</span>
            Level {level}
          </span>
          <span className="flex items-center">
            <span className="material-symbols-outlined text-sm mr-1.5">account_circle</span>
            {formatInitials(instructor)}
          </span>
          <span className="flex items-center">
            <span className="material-symbols-outlined text-sm mr-1.5">group</span>
            {enrollmentCount}/{maxEnrollment}
          </span>
        </div>
      </div>

      {/* Right: Action Buttons */}
      <div className="flex space-x-2">
        <button 
          onClick={onEdit}
          className="px-4 py-2 border border-outline-variant/30 text-on-surface text-xs font-bold uppercase tracking-widest hover:bg-surface-container transition-colors rounded"
        >
          Edit
        </button>
      </div>
    </section>
  )
}
