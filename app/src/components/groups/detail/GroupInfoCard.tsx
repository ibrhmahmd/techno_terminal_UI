import { Edit2, Trash2, ArrowUpCircle, Users, Calendar, Clock, BookOpen } from 'lucide-react'
import type { EnrichedGroupPublic, GroupLevelHistoryDTO } from '../../../api/academics'
import { LevelBadge } from '../shared/LevelBadge'
import { GroupStatusBadge } from '../shared/GroupStatusBadge'

interface GroupInfoCardProps {
  group: EnrichedGroupPublic
  currentLevel: GroupLevelHistoryDTO | null
  onEdit: () => void
  onDelete: () => void
  onLevelUp: () => void
  canLevelUp: boolean
}

export function GroupInfoCard({
  group,
  currentLevel,
  onEdit,
  onDelete,
  onLevelUp,
  canLevelUp,
}: GroupInfoCardProps) {
  const formatTime = (time: string | null | undefined) => {
    if (!time) return '--:--'
    return time.slice(0, 5)
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{group.group_name}</h1>
          <div className="flex items-center gap-3 mt-2">
            <GroupStatusBadge status={group.is_active ? 'active' : 'inactive'} />
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
            onClick={onEdit}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
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
              {group.default_day}
              <Clock className="w-3 h-3" />
              {formatTime(group.default_time_start)} - {formatTime(group.default_time_end)}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
