import { Edit2, Trash2, Archive, ArrowUpCircle, Users, Calendar, Clock, BookOpen, PlusCircle } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import type { EnrichedGroupPublic, LevelDetailDTO } from '../../../api/academics'
import { LevelBadge } from '../shared/LevelBadge'
import { GroupStatusBadge } from '../shared/GroupStatusBadge'
import { useDebounce } from '../../../hooks/useDebounce'
import { formatTime } from '../../../utils/formatting'
import { LoadingSpinner } from '../../common/LoadingSpinner'


interface GroupInfoCardProps {
  group: EnrichedGroupPublic
  currentLevel: LevelDetailDTO | null
  onEdit: () => void
  onDelete: () => void
  onArchive: () => void
  onLevelUp: () => void
  onCreateNewLevel: () => void
  canLevelUp: boolean
  onNotesChange?: (notes: string) => void
  isSavingNotes?: boolean
  isLevelUpPending?: boolean
}

export function GroupInfoCard({
  group,
  currentLevel,
  onEdit,
  onDelete,
  onArchive,
  onLevelUp,
  onCreateNewLevel,
  canLevelUp,
  onNotesChange,
  isSavingNotes,
  isLevelUpPending = false,
}: GroupInfoCardProps) {
  const [notes, setNotes] = useState(group.notes || '')
  const debouncedNotes = useDebounce(notes, 500)
  const lastSavedRef = useRef(group.notes || '')

  // Sync from external changes (e.g. refetch) ONLY if what the server has
  // is different from what we last saved. This breaks the loop.
  useEffect(() => {
    const serverNotes = group.notes || ''
    if (serverNotes !== lastSavedRef.current) {
      setNotes(serverNotes)
      lastSavedRef.current = serverNotes
    }
  }, [group.notes])

  // Trigger save when debounced notes change, and update our ref
  useEffect(() => {
    if (debouncedNotes !== lastSavedRef.current) {
      lastSavedRef.current = debouncedNotes
      onNotesChange?.(debouncedNotes)
    }
  }, [debouncedNotes, onNotesChange])

  const handleNotesChange = (value: string) => {
    setNotes(value)
  }

  return (
    <div className="bg-white rounded-md border border-slate-200/50 shadow-sm p-6">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-extrabold font-headline text-slate-900 tracking-tight">{group.name}</h1>
          <div className="flex items-center gap-3 mt-2">
            <GroupStatusBadge status={group.status} />
            {currentLevel && (
              <span className="flex items-center gap-1.5 text-sm text-slate-600 font-body">
                <LevelBadge level={currentLevel.level_number} size="sm" isActive />
                Current Level
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {canLevelUp && (
            <button
              onClick={onLevelUp}
              disabled={isLevelUpPending}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-green-700 bg-green-50 rounded hover:bg-green-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLevelUpPending
                ? <LoadingSpinner size="sm" />
                : <ArrowUpCircle className="w-4 h-4" />}
              {isLevelUpPending ? 'Leveling Up...' : 'Level Up'}
            </button>
          )}
          <button
            onClick={onCreateNewLevel}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-secondary bg-secondary/15 rounded hover:bg-secondary/25 transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            New Level
          </button>
          <button
            onClick={onEdit}
            aria-label="Edit Group"
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
          >
            <Edit2 className="w-4 h-4" aria-hidden="true" />
          </button>
          <button
            onClick={onArchive}
            aria-label="Archive Group"
            className="p-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded transition-colors"
          >
            <Archive className="w-4 h-4" aria-hidden="true" />
          </button>
          <button
            onClick={onDelete}
            aria-label="Delete Group"
            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
          >
            <Trash2 className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded border border-slate-100">
          <Users className="w-5 h-5 text-slate-400" aria-hidden="true" />
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Instructor</p>
            {group.instructor_id ? (
              <Link
                to={`/staff?search=${encodeURIComponent(group.instructor_name || '')}`}
                className="text-sm font-semibold text-secondary hover:underline"
              >
                {group.instructor_name || 'Not assigned'}
              </Link>
            ) : (
              <p className="text-sm font-semibold text-slate-900">{group.instructor_name || 'Not assigned'}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded border border-slate-100">
          <BookOpen className="w-5 h-5 text-slate-400" aria-hidden="true" />
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Course</p>
            {group.course_id ? (
              <Link
                to={`/courses/${group.course_id}`}
                className="text-sm font-semibold text-secondary hover:underline"
              >
                {group.course_name || 'Not assigned'}
              </Link>
            ) : (
              <p className="text-sm font-semibold text-slate-900">{group.course_name || 'Not assigned'}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded border border-slate-100">
          <Calendar className="w-5 h-5 text-slate-400" aria-hidden="true" />
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Schedule</p>
            <p className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
              {group.schedule?.day || 'No day'}
              <Clock className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
              {formatTime(group.schedule?.start_time || '') || '--:--'} - {formatTime(group.schedule?.end_time || '') || '--:--'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded border border-slate-100">
          <Users className="w-5 h-5 text-slate-400" aria-hidden="true" />
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Students in Level</p>
            <p className="text-sm font-semibold text-slate-900">
              {group.current_student_count ?? 0}
            </p>
          </div>
        </div>
      </div>

      {/* Notes Section */}
      <div className="mt-6 border-t border-slate-100 pt-6">
        <label htmlFor="group-notes" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
          Group Notes
          {isSavingNotes && <span className="ml-2 text-xs text-slate-400 font-normal normal-case">Saving...</span>}
        </label>
        <textarea
          id="group-notes"
          value={notes}
          onChange={(e) => handleNotesChange(e.target.value)}
          placeholder="Add notes about this group..."
          className="w-full px-1 py-2 text-sm text-slate-700 bg-transparent border-b-2 border-slate-200 focus:border-secondary focus:outline-none transition-colors resize-none"
          rows={3}
        />
      </div>
    </div>
  )
}
