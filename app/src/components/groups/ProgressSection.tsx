import type { ProgressLevel } from '../../api/academics'

interface ProgressSectionProps {
  progress: ProgressLevel
}

export function ProgressSection({ progress }: ProgressSectionProps) {
  const percentage = Math.round((progress.group_score / progress.target_score) * 100)

  return (
    <div className="grid grid-cols-1 gap-8 pt-4">
      <div className="bg-surface-container-lowest p-6 border border-outline-variant/10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-outline">
            Current Module
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 bg-primary-container text-white uppercase tracking-tighter rounded">
            Core
          </span>
        </div>

        {/* Title and Description */}
        <h3 className="font-headline font-bold text-base text-on-surface mb-2">
          {progress.current_module}
        </h3>
        <p className="text-xs text-on-surface-variant leading-relaxed mb-6">
          {progress.description}
        </p>

        {/* Progress Bar */}
        <div className="w-full bg-surface-container h-1">
          <div 
            className="bg-secondary h-full transition-all duration-500" 
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Labels */}
        <div className="flex justify-between mt-2 text-[10px] font-bold text-outline-variant">
          <span>{percentage}% GROUP SCORE</span>
          <span>TARGET: {progress.target_score}%</span>
        </div>
      </div>
    </div>
  )
}
