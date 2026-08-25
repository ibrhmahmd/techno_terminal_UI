import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { FilterPill, ActiveFilterTagsList } from '../common'
import { useCourses } from '../../hooks/useCourses'
import { useEmployees } from '../../hooks/useStaff'
import { getTranslatedDays } from '../../utils/dayTranslation'

interface GroupFiltersProps {
  isOpen: boolean
  onClose: () => void
  onApply?: () => void
  filters: {
    selectedCourses: number[]
    setSelectedCourses: (ids: number[]) => void
    selectedInstructors: number[]
    setSelectedInstructors: (ids: number[]) => void
    selectedDays: string[]
    setSelectedDays: (days: string[]) => void
    selectedLevels: number[]
    setSelectedLevels: (levels: number[]) => void
    selectedStatuses: string[]
    setSelectedStatuses: (statuses: string[]) => void
  }
  activeFilterTags?: { id: string; label: string; value: string }[]
  onRemoveFilter?: (id: string) => void
  onClearAllFilters?: () => void
}

const STATUSES = ['active', 'inactive', 'archived', 'completed'] as const
const LEVELS = [1, 2, 3, 4, 5, 6, 7, 8]

function OptionPill({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap text-center focus-visible:ring-2 focus-visible:ring-secondary/30 focus-visible:outline-none ${
        selected
          ? 'bg-white text-secondary shadow-sm font-bold border border-blue-200'
          : 'text-slate-600 hover:text-secondary hover:bg-white/70'
      }`}
    >
      {children}
    </button>
  )
}

export function GroupFilters({ isOpen, onClose, onApply, filters, activeFilterTags, onRemoveFilter, onClearAllFilters }: GroupFiltersProps) {
  const { t } = useTranslation('groups')
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)

  // Local temp state — initialized from committed filter values on mount (sync ensured by GroupsPage `key` prop)
  const [tempCourses, setTempCourses] = useState<number[]>(filters.selectedCourses)
  const [tempInstructors, setTempInstructors] = useState<number[]>(filters.selectedInstructors)
  const [tempDays, setTempDays] = useState<string[]>(filters.selectedDays)
  const [tempLevels, setTempLevels] = useState<number[]>(filters.selectedLevels)
  const [tempStatuses, setTempStatuses] = useState<string[]>(filters.selectedStatuses)

  const { courses } = useCourses()
  const { data: staffData } = useEmployees('', 1, 100)
  const staff = staffData?.items || []
  const translatedDays = getTranslatedDays(t)

  const filterCategories = [
    { id: 'course',    label: t('filters.course'),    icon: 'menu_book'      },
    { id: 'instructor', label: t('filters.instructor'), icon: 'person'        },
    { id: 'level',     label: t('filters.level'),     icon: 'layers'         },
    { id: 'day',       label: t('filters.day'),       icon: 'calendar_today' },
    { id: 'status',    label: t('filters.status'),    icon: 'toggle_on'      },
  ]

  const statusLabels: Record<string, string> = {
    active: t('common:status.active'),
    inactive: t('common:status.inactive'),
    archived: t('common:status.archived'),
    completed: t('common:status.completed'),
  }

  const sortedCourses = useMemo(
    () => [...courses].sort((a, b) => a.name.localeCompare(b.name)),
    [courses]
  )
  const sortedStaff = useMemo(
    () => [...staff].sort((a, b) => a.full_name.localeCompare(b.full_name)),
    [staff]
  )

  if (!isOpen) return null

  const toggleCategory = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId)
  }

  const getFilterCount = (categoryId: string): number => {
    switch (categoryId) {
      case 'course': return tempCourses.length
      case 'instructor': return tempInstructors.length
      case 'level': return tempLevels.length
      case 'day': return tempDays.length
      case 'status': return tempStatuses.length
      default: return 0
    }
  }

  const handleApply = () => {
    filters.setSelectedCourses(tempCourses)
    filters.setSelectedInstructors(tempInstructors)
    filters.setSelectedDays(tempDays)
    filters.setSelectedLevels(tempLevels)
    filters.setSelectedStatuses(tempStatuses)
    onApply?.()
    onClose()
  }

  const handleReset = () => {
    setTempCourses(filters.selectedCourses)
    setTempInstructors(filters.selectedInstructors)
    setTempDays(filters.selectedDays)
    setTempLevels(filters.selectedLevels)
    setTempStatuses(filters.selectedStatuses)
  }

  return (
    <div role="region" aria-label={t('filters.panel_heading')} className="bg-white/95 backdrop-blur-sm border-b border-blue-100 px-4 sm:px-6 lg:px-8 py-3 animate-in slide-in-from-top-2">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('filters.panel_heading')}</h3>
        <button
          onClick={onClose}
          aria-label={t('filters.close_aria')}
          className="text-slate-400 hover:text-slate-600 w-5 h-5 flex items-center justify-center rounded hover:bg-slate-200"
        >
          <span className="material-symbols-outlined text-[16px]" aria-hidden="true">close</span>
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-1 rounded-lg bg-blue-50 border border-blue-100 p-1 mb-3">
        {filterCategories.map(cat => (
          <FilterPill
            key={cat.id}
            icon={cat.icon}
            label={cat.label}
            isExpanded={expandedCategory === cat.id}
            hasFilters={getFilterCount(cat.id) > 0}
            filterCount={getFilterCount(cat.id)}
            onClick={() => toggleCategory(cat.id)}
            className="flex-1 px-4 py-2 rounded-md"
          />
        ))}
        <div className="flex items-center gap-1 ms-auto shrink-0">
          <button
            onClick={handleReset}
            className="px-3 py-1.5 text-xs font-medium text-slate-600 border border-blue-200 rounded-md hover:bg-blue-50 hover:text-slate-800 transition-all focus-visible:ring-2 focus-visible:ring-secondary/30 focus-visible:outline-none"
          >
            {t('common:buttons.reset', { ns: 'common' })}
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-1.5 text-xs font-medium text-white bg-secondary rounded-md hover:bg-secondary/90 transition-all focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:outline-none"
          >
            {t('common:buttons.apply', { ns: 'common' })}
          </button>
        </div>
      </div>

      {expandedCategory && (
        <div className="bg-white rounded-lg p-3 border border-blue-100 mb-3" aria-live="polite">
          {expandedCategory === 'course' && (
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2 text-center">{t('filters.course')}</span>
              <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto justify-center">
                {sortedCourses.map(course => (
                  <OptionPill
                    key={course.id}
                    selected={tempCourses.includes(course.id)}
                    onClick={() => {
                      const newIds = tempCourses.includes(course.id)
                        ? tempCourses.filter(id => id !== course.id)
                        : [...tempCourses, course.id]
                      setTempCourses(newIds)
                    }}
                  >
                    {course.name}
                  </OptionPill>
                ))}
                {sortedCourses.length === 0 && (
                  <p className="text-sm text-slate-400">{t('filters.no_courses')}</p>
                )}
              </div>
            </div>
          )}

          {expandedCategory === 'instructor' && (
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2 text-center">{t('filters.instructor')}</span>
              <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto justify-center">
                {sortedStaff.map(instructor => (
                  <OptionPill
                    key={instructor.id}
                    selected={tempInstructors.includes(instructor.id)}
                    onClick={() => {
                      const newIds = tempInstructors.includes(instructor.id)
                        ? tempInstructors.filter(id => id !== instructor.id)
                        : [...tempInstructors, instructor.id]
                      setTempInstructors(newIds)
                    }}
                  >
                    {instructor.full_name}
                  </OptionPill>
                ))}
                {sortedStaff.length === 0 && (
                  <p className="text-sm text-slate-400">{t('filters.no_instructors')}</p>
                )}
              </div>
            </div>
          )}

          {expandedCategory === 'level' && (
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2 text-center">{t('filters.level')}</span>
              <div className="flex flex-wrap gap-1.5 justify-center">
                {LEVELS.map(level => (
                  <OptionPill
                    key={level}
                    selected={tempLevels.includes(level)}
                    onClick={() => {
                      const newLevels = tempLevels.includes(level)
                        ? tempLevels.filter(l => l !== level)
                        : [...tempLevels, level]
                      setTempLevels(newLevels)
                    }}
                  >
                    {t('filters.level_value', { level })}
                  </OptionPill>
                ))}
              </div>
            </div>
          )}

          {expandedCategory === 'day' && (
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2 text-center">{t('filters.day')}</span>
              <div className="flex flex-wrap gap-1.5 justify-center">
                {translatedDays.map(day => (
                  <OptionPill
                    key={day.api}
                    selected={tempDays.includes(day.api)}
                    onClick={() => {
                      const newDays = tempDays.includes(day.api)
                        ? tempDays.filter(d => d !== day.api)
                        : [...tempDays, day.api]
                      setTempDays(newDays)
                    }}
                  >
                    {day.label}
                  </OptionPill>
                ))}
              </div>
            </div>
          )}

          {expandedCategory === 'status' && (
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2 text-center">{t('filters.status')}</span>
              <div className="flex flex-wrap gap-1.5 justify-center">
                {STATUSES.map(status => (
                  <OptionPill
                    key={status}
                    selected={tempStatuses.includes(status)}
                    onClick={() => {
                      const newStatuses = tempStatuses.includes(status)
                        ? tempStatuses.filter(s => s !== status)
                        : [...tempStatuses, status]
                      setTempStatuses(newStatuses)
                    }}
                  >
                    {statusLabels[status] || status}
                  </OptionPill>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeFilterTags && activeFilterTags.length > 0 && onRemoveFilter && onClearAllFilters && (
        <div className="mb-1">
          <ActiveFilterTagsList
            filters={activeFilterTags}
            onRemoveFilter={onRemoveFilter}
            onClearAll={onClearAllFilters}
          />
        </div>
      )}
    </div>
  )
}
