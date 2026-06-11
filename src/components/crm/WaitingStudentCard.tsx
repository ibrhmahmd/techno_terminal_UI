import { Phone, Calendar, User, ExternalLink, CheckCircle, Clock, XCircle } from 'lucide-react'
import type { StudentWithDetails } from '../../api/crm'
import { calculateAge } from '../../api/crm/students/utils'

interface WaitingStudentCardProps {
  student: StudentWithDetails
  onEnroll: (student: StudentWithDetails) => void
  onViewProfile: (studentId: number) => void
}

const PRIORITY_COLORS: Record<number, string> = {
  1: 'bg-gray-400',
  2: 'bg-blue-400',
  3: 'bg-yellow-400',
  4: 'bg-orange-400',
  5: 'bg-red-500',
}

const STATUS_ICONS: Record<string, typeof CheckCircle> = {
  active: CheckCircle,
  waiting: Clock,
  inactive: XCircle,
}

const STATUS_COLORS: Record<string, string> = {
  active: 'text-green-500',
  waiting: 'text-amber-500',
  inactive: 'text-gray-400',
}

function getPriorityColor(priority?: number): string {
  return PRIORITY_COLORS[priority ?? 3] || 'bg-yellow-400'
}

function getAge(student: StudentWithDetails): number | null {
  if (student.age != null) return student.age
  if (student.date_of_birth) return calculateAge(student.date_of_birth)
  return null
}

function formatWaitingTime(addedAt?: string): string {
  if (!addedAt) return 'Unknown'
  
  const added = new Date(addedAt)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - added.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months`
  return `${Math.floor(diffDays / 365)} years`
}

export function WaitingStudentCard({ student, onEnroll, onViewProfile }: WaitingStudentCardProps) {
  const priorityColor = getPriorityColor(student.waiting_priority ?? undefined)
  const waitingTime = formatWaitingTime(student.waiting_since ?? undefined)
  const age = getAge(student)
  const StatusIcon = STATUS_ICONS[student.status] || Clock
  const statusColor = STATUS_COLORS[student.status] || 'text-gray-400'
  
  return (
    <div className="bg-surface-container-low rounded-xl border border-outline-variant/30 overflow-hidden hover:shadow-md transition-shadow">
      {/* Header with name, status, and priority */}
      <div className="px-4 py-3 border-b border-outline-variant/20 flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full ${priorityColor}`} title={`Priority: ${student.waiting_priority ?? 3}`} />
        <h3 className="font-headline font-semibold text-on-surface flex-1 min-w-0">{student.full_name}</h3>
        <span title={student.status}>
          <StatusIcon className={`w-5 h-5 shrink-0 ${statusColor}`} aria-hidden="true" />
        </span>
      </div>
      
      {/* Student info */}
      <div className="p-4 space-y-2">
        {student.phone && (
          <div className="flex items-center gap-2 text-sm text-on-surface-variant">
            <Phone className="w-4 h-4" aria-hidden="true" />
            <span>{student.phone}</span>
          </div>
        )}
        
        <div className="flex items-center gap-2 text-sm text-on-surface-variant">
          <User className="w-4 h-4" aria-hidden="true" />
          <span>Age: {age ?? 'Unknown'}</span>
          {student.gender && (
            <span className="text-on-surface-variant/60">• {student.gender}</span>
          )}
        </div>
        
        <div className="flex items-center gap-2 text-sm text-on-surface-variant">
          <Calendar className="w-4 h-4" aria-hidden="true" />
          <span>Waiting: {waitingTime}</span>
        </div>
        
        {student.waiting_notes && (
          <p className="text-xs text-on-surface-variant/80 mt-2 line-clamp-2">
            {student.waiting_notes}
          </p>
        )}
      </div>
      
      {/* Actions */}
      <div className="px-4 py-3 border-t border-outline-variant/20 flex gap-2">
        <button
          onClick={() => onEnroll(student)}
          className="flex-1 bg-primary text-on-primary px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400/70"
        >
          Enroll
        </button>
        <button
          onClick={() => onViewProfile(student.id)}
          className="px-3 py-2 border border-outline-variant rounded-lg text-sm text-on-surface-variant hover:bg-surface-container-high transition-colors flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-cyan-400/70"
          title="View Profile"
        >
          <ExternalLink className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
