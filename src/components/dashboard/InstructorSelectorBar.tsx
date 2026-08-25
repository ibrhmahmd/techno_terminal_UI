import { useTranslation } from 'react-i18next'
import { useIsMobile } from '../../hooks/useIsMobile'
import { useNavDirection } from '../../hooks/useNavDirection'
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
  const { getNextIndex } = useNavDirection()
  const { t } = useTranslation('dashboard')

  // Don't render if no instructors
  if (instructors.length === 0) {
    return null
  }

  const sortedInstructors = [...instructors].sort()

  const isSelected = (name: string | null) => selectedInstructor === name
  const allButton = { name: null, label: isMobile ? <span className="material-symbols-outlined flex items-center justify-center text-[20px]" aria-hidden="true">groups</span> : t('instructor_filter.all') }
  const instructorButtons = sortedInstructors.map(name => ({ name, label: isMobile ? formatInstructorName(name) : name }))
  const allTabs = [allButton, ...instructorButtons]

  const handleTablistKeyDown = (e: React.KeyboardEvent) => {
    const target = e.target as HTMLElement
    const buttons = Array.from(target.parentElement?.querySelectorAll('[role="tab"]') ?? [])
    const currentIndex = buttons.indexOf(target)
    if (currentIndex === -1) return

    const nextIndex = getNextIndex(e, currentIndex, buttons.length)
    if (nextIndex === null) return

    e.preventDefault()
    ;(buttons[nextIndex] as HTMLElement).focus()
    onSelectInstructor(allTabs[nextIndex].name)
  }

  return (
    <section className="w-full pb-6">
      <div className="overflow-x-auto">
        <div role="tablist" aria-label={t('instructor_filter.filter_by_instructor')} className="flex min-w-[300px] items-center gap-1 rounded-lg bg-emerald-50 border border-emerald-100 p-1" onKeyDown={handleTablistKeyDown}>
          {allTabs.map(({ name }) => (
            <button
              key={name ?? 'all'}
              role="tab"
              aria-selected={isSelected(name)}
              disabled={disabled}
              tabIndex={isSelected(name) ? 0 : -1}
              className={`flex-1 px-4 py-2 rounded-md font-headline text-sm font-medium transition-all whitespace-nowrap ${
                isSelected(name)
                  ? 'bg-white text-secondary shadow-sm font-bold border border-emerald-200'
                  : 'text-slate-600 hover:text-secondary hover:bg-white/70'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => onSelectInstructor(name)}
              title={name ?? t('instructor_filter.all')}
            >
              {name === null ? allButton.label : (isMobile ? formatInstructorName(name) : name)}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
