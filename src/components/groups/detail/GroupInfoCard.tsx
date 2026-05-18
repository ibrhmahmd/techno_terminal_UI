import { Edit2, Trash2, Archive, ArrowUpCircle, Users, Calendar, Clock, BookOpen, PlusCircle } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import type { EnrichedGroupPublic, LevelDetailDTO } from '../../../api/academics'
import { LevelBadge } from '../shared/LevelBadge'
import { GroupStatusBadge } from '../shared/GroupStatusBadge'
import { useDebounce } from '../../../hooks/useDebounce'

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
}: GroupInfoCardProps) {
  const [notes, setNotes] = useState(group.notes || '')
  const debouncedNotes = useDebounce(notes, 300)
  const isInitialMount = useRef(true)
  const formatTime = (time: string | null | undefined) => {
    if (!time) return '--:--'
    return time.slice(0, 5)
  }

  // Sync notes when group data changes (e.g., after refetch)
  useEffect(() => {
    const newNotes = group.notes || ''
    if (newNotes !== notes) {
      setNotes(newNotes)
    }
  }, [group.notes])

  // Only trigger onNotesChange after initial mount and when notes actually change
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    if (debouncedNotes !== (group.notes || '')) {
      onNotesChange?.(debouncedNotes)
    }
  }, [debouncedNotes, onNotesChange, group.notes])

  const handleNotesChange = (value: string) => {
    setNotes(value)
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{group.name}</h1>
          <div className="flex items-center gap-3 mt-2">
            <GroupStatusBadge status={group.status} />
            {currentLevel && (
              <span className="flex items-center gap-1.5 text-sm text-slate-600">
                <LevelBadge level={currentLevel.level_number} size="sm" isActive />
                Current Level
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canLevelUp && (
            <button
              onClick={onLevelUp}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <ArrowUpCircle className="w-4 h-4" />
              Level Up
            </button>
          )}
          <button
            onClick={onCreateNewLevel}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            New Level
          </button>
          <button
            onClick={onEdit}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            title="Edit Group"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={onArchive}
            className="p-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
            title="Archive Group"
          >
            <Archive className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete Group"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
          <Users className="w-5 h-5 text-slate-500" />
          <div>
            <p className="text-sm text-slate-500">Instructor</p>
            <p className="font-medium text-slate-900">{group.instructor_name || 'Not assigned'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
          <BookOpen className="w-5 h-5 text-slate-500" />
          <div>
            <p className="text-sm text-slate-500">Course</p>
            <p className="font-medium text-slate-900">{group.course_name || 'Not assigned'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
          <Calendar className="w-5 h-5 text-slate-500" />
          <div>
            <p className="text-sm text-slate-500">Schedule</p>
            <p className="font-medium text-slate-900 flex items-center gap-1">
              {group.schedule?.day || 'No day'}
              <Clock className="w-3 h-3" />
              {formatTime(group.schedule?.start_time)} - {formatTime(group.schedule?.end_time)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
          <Users className="w-5 h-5 text-slate-500" />
          <div>
            <p className="text-sm text-slate-500">Students in Level</p>
            <p className="font-medium text-slate-900">
              {group.current_student_count ?? 0}
            </p>
          </div>
        </div>
      </div>

      {/* Notes Section */}
      <div className="mt-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Group Notes
          {isSavingNotes && <span className="ml-2 text-xs text-slate-400">Saving...</span>}
        </label>
        <textarea
          value={notes}
          onChange={(e) => handleNotesChange(e.target.value)}
          placeholder="Add notes about this group..."
          className="w-full px-3 py-2 text-sm text-slate-700 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary resize-none"
          rows={3}
        />
      </div>
    </div>
  )
}
