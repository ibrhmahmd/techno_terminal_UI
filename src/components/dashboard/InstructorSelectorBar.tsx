import { useIsMobile } from '../../hooks/useIsMobile'
import { formatInstructorName } from '../../utils/formatting'

interface InstructorSelectorBarProps {
  instructors: string[]
  selectedInstructor: string | null
  onSelectInstructor: (instructor: string | null) => void
  disabled?: boolean
}

export function InstructorSelectorBar({
  instructors,
  selectedInstructor,
  onSelectInstructor,
  disabled = false
}: InstructorSelectorBarProps) {
  const isMobile = useIsMobile()

  // Don't render if no instructors
  if (instructors.length === 0) {
    return null
  }

  const sortedInstructors = [...instructors].sort()

  return (
    <section className="w-full pb-6">
      <div className="overflow-x-auto">
        <div role="tablist" aria-label="Filter by instructor" className="flex min-w-[300px] items-center gap-1 rounded-lg bg-emerald-50 border border-emerald-100 p-1">
          {/* All Instructors button */}
          <button
            key="all"
            role="tab"
            aria-selected={selectedInstructor === null}
            disabled={disabled}
            className={`flex-1 px-4 py-2 rounded-md font-headline text-sm font-medium transition-all whitespace-nowrap ${
              selectedInstructor === null
                ? 'bg-white text-secondary shadow-sm font-bold border border-emerald-200'
                : 'text-slate-600 hover:text-secondary hover:bg-white/70'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => onSelectInstructor(null)}
            title="All Instructors"
          >
            {isMobile ? (
              <span className="material-symbols-outlined flex items-center justify-center text-[20px]">groups</span>
            ) : (
              'All Instructors'
            )}
          </button>

          {/* Individual instructor buttons */}
          {sortedInstructors.map((instructorName) => (
            <button
              key={instructorName}
              role="tab"
              aria-selected={selectedInstructor === instructorName}
              disabled={disabled}
              className={`flex-1 px-4 py-2 rounded-md font-headline text-sm font-medium transition-all whitespace-nowrap ${
                selectedInstructor === instructorName
                  ? 'bg-white text-secondary shadow-sm font-bold border border-emerald-200'
                  : 'text-slate-600 hover:text-secondary hover:bg-white/70'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => onSelectInstructor(instructorName)}
              title={instructorName}
            >
              {isMobile ? formatInstructorName(instructorName) : instructorName}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
