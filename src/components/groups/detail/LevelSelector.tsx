import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { LevelDetailDTO } from '../../../api/academics'
import { LevelBadge } from '../shared/LevelBadge'

interface LevelSelectorProps {
  levels: LevelDetailDTO[]
  activeLevelId: number | null
  onLevelChange: (levelId: number) => void
  currentLevelNumber: number
}

export function LevelSelector({
  levels,
  activeLevelId,
  onLevelChange,
  currentLevelNumber,
}: LevelSelectorProps) {
  if (levels.length === 0) {
    return (
      <div className="bg-slate-50 rounded-lg p-4 text-center text-sm text-slate-500">
        No level history available
      </div>
    )
  }

  const activeIndex = levels.findIndex((l) => l.level_id === activeLevelId)

  const navigate = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'prev' ? activeIndex - 1 : activeIndex + 1
    if (newIndex >= 0 && newIndex < levels.length) {
      onLevelChange(levels[newIndex].level_id)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-slate-900">Level Progression</h3>
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigate('prev')}
            disabled={activeIndex <= 0}
            className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Previous level"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate('next')}
            disabled={activeIndex >= levels.length - 1}
            className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Next level"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2" role="group" aria-label="Level selector">
        {levels.map((level, index) => {
          const isActive = level.level_id === activeLevelId
          const isCurrent = level.level_number === currentLevelNumber

          return (
            <button
              key={level.level_id}
              onClick={() => onLevelChange(level.level_id)}
              aria-pressed={isActive}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg min-w-[60px] transition-colors ${
                isActive ? 'bg-blue-50 border-2 border-blue-200' : 'hover:bg-slate-50'
              }`}
            >
              <LevelBadge level={level.level_number} isActive={isCurrent} size="md" />
              <span className={`text-xs ${isActive ? 'text-blue-700 font-medium' : 'text-slate-500'}`}>
                {isCurrent ? 'Current' : index < levels.findIndex((l) => l.level_number === currentLevelNumber) ? 'Completed' : 'Upcoming'}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
