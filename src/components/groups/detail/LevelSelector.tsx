import type { LevelDetailDTO } from '../../../api/academics'

interface LevelSelectorProps {
  levels: LevelDetailDTO[]
  activeLevelId: number | null
  onLevelChange: (levelId: number) => void
  currentLevelNumber: number
  onAddLevel?: () => void
}

export function LevelSelector({
  levels,
  activeLevelId,
  onLevelChange,
  currentLevelNumber,
  onAddLevel,
}: LevelSelectorProps) {
  if (levels.length === 0) {
    return null
  }

  const currentLevelIndex = levels.findIndex((l) => l.level_number === currentLevelNumber)

  return (
    <section className="w-full pb-4">
      <div className="overflow-x-auto">
        <div role="tablist" aria-label="Select level" className="flex w-full min-w-fit items-center gap-1 rounded-md bg-surface-container-low border border-surface-container-low p-1">
          <div className="flex flex-1 items-center gap-1">
          {levels.map((level, index) => {
            const isActive = level.level_id === activeLevelId
            const isCurrent = level.level_number === currentLevelNumber
            const statusLabel = isCurrent ? 'Current' : index < currentLevelIndex ? 'Completed' : 'Upcoming'
            
            return (
              <button
                key={level.level_id}
                role="tab"
                aria-selected={isActive}
                onClick={() => onLevelChange(level.level_id)}
                className={`flex flex-col items-center justify-center px-6 py-2 rounded-md transition-all whitespace-nowrap min-w-[120px] ${
                  isActive
                    ? 'bg-surface text-secondary shadow-sm font-bold border border-surface-container-high'
                    : 'text-slate-600 hover:text-secondary hover:bg-surface-container-lowest/50'
                }`}
              >
                <span className="font-headline text-sm">Level {level.level_number}</span>
                <span className={`text-[10px] uppercase tracking-wider ${isActive ? 'text-secondary/70 font-bold' : 'text-slate-400 font-medium'}`}>
                  {statusLabel}
                </span>
              </button>
            )
          })}
          </div>
          {onAddLevel && (
            <button
              onClick={onAddLevel}
              className="flex items-center gap-1.5 px-4 py-2 ml-4 rounded-md transition-all whitespace-nowrap text-secondary hover:bg-secondary/10 font-bold border border-transparent hover:border-secondary/20"
            >
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">add</span>
              <span className="font-headline text-sm uppercase tracking-wider">Add Level</span>
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
