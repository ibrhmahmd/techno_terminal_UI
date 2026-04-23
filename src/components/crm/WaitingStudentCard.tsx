import { Phone, Calendar, User, ExternalLink } from 'lucide-react'
import type { StudentWithDetails } from '../../api/crm'

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

function getPriorityColor(priority?: number): string {
  return PRIORITY_COLORS[priority ?? 3] || 'bg-yellow-400'
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
  
  return (
    <div className="bg-surface-container-low rounded-xl border border-outline-variant/30 overflow-hidden hover:shadow-md transition-shadow">
      {/* Header with priority indicator */}
      <div className="px-4 py-3 border-b border-outline-variant/20 flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full ${priorityColor}`} title={`Priority: ${student.waiting_priority ?? 3}`} />
        <h3 className="font-semibold text-on-surface flex-1 truncate">{student.full_name}</h3>
      </div>
      
      {/* Student info */}
      <div className="p-4 space-y-2">
        <div className="flex items-center gap-2 text-sm text-on-surface-variant">
          <Phone className="w-4 h-4" />
          <span>{student.phone || 'No phone'}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-on-surface-variant">
          <User className="w-4 h-4" />
          <span>Age: {student.age ?? 'Unknown'}</span>
          {student.gender && (
            <span className="text-on-surface-variant/60">• {student.gender}</span>
          )}
        </div>
        
        <div className="flex items-center gap-2 text-sm text-on-surface-variant">
          <Calendar className="w-4 h-4" />
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
          className="flex-1 bg-primary text-on-primary px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Enroll
        </button>
        <button
          onClick={() => onViewProfile(student.id)}
          className="px-3 py-2 border border-outline-variant rounded-lg text-sm text-on-surface-variant hover:bg-surface-container-high transition-colors flex items-center gap-1"
          title="View Profile"
        >
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
