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
  // Don't render if no instructors
  if (instructors.length === 0) {
    return null
  }

  const sortedInstructors = [...instructors].sort()

  return (
    <section className="w-full pb-6">
      <div className="overflow-x-auto">
        <div className="flex min-w-[300px] items-center gap-1 rounded-lg bg-slate-100 p-1">
          {/* All Instructors button */}
          <button
            key="all"
            disabled={disabled}
            className={`flex-1 px-4 py-2 rounded-md font-headline text-sm font-medium transition-all whitespace-nowrap ${
              selectedInstructor === null
                ? 'bg-white text-secondary shadow-sm font-bold'
                : 'text-slate-500 hover:text-secondary hover:bg-white/50'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => onSelectInstructor(null)}
          >
            All Instructors
          </button>

          {/* Individual instructor buttons */}
          {sortedInstructors.map((instructorName) => (
            <button
              key={instructorName}
              disabled={disabled}
              className={`flex-1 px-4 py-2 rounded-md font-headline text-sm font-medium transition-all whitespace-nowrap ${
                selectedInstructor === instructorName
                  ? 'bg-white text-secondary shadow-sm font-bold'
                  : 'text-slate-500 hover:text-secondary hover:bg-white/50'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => onSelectInstructor(instructorName)}
            >
              {instructorName}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
