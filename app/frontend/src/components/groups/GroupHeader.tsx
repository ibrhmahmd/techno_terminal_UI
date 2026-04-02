import { useNavigate } from 'react-router-dom'

interface GroupHeaderProps {
  name: string
  scheduleTime: string
  level: number
  instructor: string
  enrollmentCount: number
  maxEnrollment: number
}

export function GroupHeader({ 
  name, 
  scheduleTime, 
  level, 
  instructor, 
  enrollmentCount, 
  maxEnrollment 
}: GroupHeaderProps) {
  const navigate = useNavigate()

  return (
    <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-outline-variant/10">
      {/* Left: Title and Meta */}
      <div>
        <h1 className="font-headline text-3xl font-bold text-on-surface tracking-tight">
          {name} <span className="text-outline-variant font-light px-2">/</span>{' '}
          <span className="font-normal text-on-surface-variant">{scheduleTime}</span>
        </h1>
        <div className="mt-2 flex items-center space-x-6 text-xs font-medium uppercase tracking-wider text-outline">
          <span className="flex items-center">
            <span className="material-symbols-outlined text-sm mr-1.5">bookmark</span>
            Level {level}
          </span>
          <span className="flex items-center">
            <span className="material-symbols-outlined text-sm mr-1.5">account_circle</span>
            {instructor.split(' ').map(n => n[0]).join('')}
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
          onClick={() => navigate(`/groups/${name.toLowerCase().replace(/\s+/g, '-')}/edit`)}
          className="px-4 py-2 border border-outline-variant/30 text-on-surface text-xs font-bold uppercase tracking-widest hover:bg-surface-container transition-colors rounded"
        >
          Edit
        </button>
        <button 
          className="px-4 py-2 bg-primary-container text-white text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-all rounded"
        >
          Add Session
        </button>
      </div>
    </section>
  )
}
