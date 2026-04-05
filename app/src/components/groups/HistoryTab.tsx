import { useState } from 'react'
import { Calendar, CheckCircle2, XCircle, AlertCircle, UserPlus, UserMinus, Edit3 } from 'lucide-react'
import type { Session } from '../../api/academics'
import { EmptyState } from '../common/EmptyState'

interface HistoryEvent {
  id: number
  type: 'session_created' | 'session_completed' | 'session_cancelled' | 'student_enrolled' | 'student_removed' | 'group_updated'
  date: string
  description: string
  actor?: string
  metadata?: Record<string, string>
}

interface HistoryTabProps {
  sessions: Session[]
  events?: HistoryEvent[]
  isLoading?: boolean
}

export function HistoryTab({ sessions, events = [], isLoading }: HistoryTabProps) {
  const [filter, setFilter] = useState<string>('all')

  // Generate events from sessions if no events provided
  const sessionEvents: HistoryEvent[] = sessions.map(session => ({
    id: session.id,
    type: session.status === 'completed' ? 'session_completed' : 
          session.status === 'cancelled' ? 'session_cancelled' : 'session_created',
    date: session.session_date,
    description: `Session ${session.status}: ${session.start_time} - ${session.end_time}`,
    metadata: {
      instructor: session.instructor_name || 'Unknown instructor'
    }
  }))

  const allEvents = [...sessionEvents, ...events].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  const filteredEvents = filter === 'all' 
    ? allEvents 
    : allEvents.filter(e => e.type.includes(filter))

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'session_completed':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />
      case 'session_cancelled':
        return <XCircle className="w-5 h-5 text-red-600" />
      case 'session_created':
        return <Calendar className="w-5 h-5 text-blue-600" />
      case 'student_enrolled':
        return <UserPlus className="w-5 h-5 text-green-600" />
      case 'student_removed':
        return <UserMinus className="w-5 h-5 text-red-600" />
      case 'group_updated':
        return <Edit3 className="w-5 h-5 text-amber-600" />
      default:
        return <AlertCircle className="w-5 h-5 text-slate-500" />
    }
  }

  const getEventColor = (type: string) => {
    switch (type) {
      case 'session_completed':
        return 'bg-green-50 border-green-200'
      case 'session_cancelled':
        return 'bg-red-50 border-red-200'
      case 'session_created':
        return 'bg-blue-50 border-blue-200'
      case 'student_enrolled':
        return 'bg-green-50 border-green-200'
      case 'student_removed':
        return 'bg-red-50 border-red-200'
      case 'group_updated':
        return 'bg-amber-50 border-amber-200'
      default:
        return 'bg-slate-50 border-slate-200'
    }
  }

  if (isLoading) {
    return (
      <div className="py-12 text-center">
        <div className="w-8 h-8 border-2 border-slate-200 border-t-secondary rounded-full animate-spin mx-auto mb-2" />
        <p className="text-sm text-slate-500">Loading history...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-on-surface">Group History</h2>
          <p className="text-sm text-slate-500 mt-1">
            Timeline of all activities and changes for this group
          </p>
        </div>
        
        {/* Filter */}
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white"
        >
          <option value="all">All Events</option>
          <option value="session">Sessions</option>
          <option value="student">Students</option>
          <option value="group">Group Changes</option>
        </select>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-4 text-center">
          <p className="text-2xl font-bold text-green-600">
            {allEvents.filter(e => e.type === 'session_completed').length}
          </p>
          <p className="text-xs text-slate-500">Sessions Completed</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4 text-center">
          <p className="text-2xl font-bold text-red-600">
            {allEvents.filter(e => e.type === 'session_cancelled').length}
          </p>
          <p className="text-xs text-slate-500">Sessions Cancelled</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4 text-center">
          <p className="text-2xl font-bold text-green-600">
            {allEvents.filter(e => e.type === 'student_enrolled').length}
          </p>
          <p className="text-xs text-slate-500">Students Enrolled</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4 text-center">
          <p className="text-2xl font-bold text-slate-600">
            {allEvents.filter(e => e.type === 'group_updated').length}
          </p>
          <p className="text-xs text-slate-500">Group Updates</p>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredEvents.length === 0 ? (
          <EmptyState
            title="No history events"
            message="No events match the selected filter."
            icon="history"
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredEvents.map((event) => (
              <div 
                key={event.id} 
                className={`p-4 hover:bg-slate-50 transition-colors border-l-4 ${getEventColor(event.type)}`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
                    {getEventIcon(event.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-on-surface">{event.description}</p>
                      <span className="text-sm text-slate-500 whitespace-nowrap">
                        {new Date(event.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    {event.metadata && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {Object.entries(event.metadata).map(([key, value]) => (
                          <span 
                            key={key}
                            className="inline-flex items-center px-2 py-1 rounded text-xs bg-white border border-slate-200 text-slate-600"
                          >
                            <span className="font-medium capitalize mr-1">{key}:</span>
                            {value}
                          </span>
                        ))}
                      </div>
                    )}
                    {event.actor && (
                      <p className="text-sm text-slate-500 mt-1">
                        by {event.actor}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default HistoryTab
