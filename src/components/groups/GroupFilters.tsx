import { useState, useMemo } from 'react'
import { FilterPill } from '../common'
import { useCourses } from '../../hooks/useCourses'
import { useEmployees } from '../../hooks/useStaff'

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
}

const FILTER_CATEGORIES = [
  { id: 'course',    label: 'Course',     icon: 'menu_book'      },
  { id: 'instructor', label: 'Instructor', icon: 'person'        },
  { id: 'level',     label: 'Level',      icon: 'layers'         },
  { id: 'day',       label: 'Day',        icon: 'calendar_today' },
  { id: 'status',    label: 'Status',     icon: 'toggle_on'      },
] as const

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const STATUSES = ['active', 'inactive', 'archived']
const LEVELS = [1, 2, 3, 4, 5, 6, 7, 8]

export function GroupFilters({ isOpen, onClose, onApply, filters }: GroupFiltersProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const { courses } = useCourses()
  const { data: staffData } = useEmployees('', 1, 100)
  const staff = staffData?.items || []

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
      case 'course': return filters.selectedCourses.length
      case 'instructor': return filters.selectedInstructors.length
      case 'level': return filters.selectedLevels.length
      case 'day': return filters.selectedDays.length
      case 'status': return filters.selectedStatuses.filter(s => s !== 'active').length
      default: return 0
    }
  }

  const hasAnyFilters = FILTER_CATEGORIES.some(cat => getFilterCount(cat.id) > 0)

  const handleApply = () => {
    onApply?.()
    onClose()
  }

  const handleReset = () => {
    filters.setSelectedCourses([])
    filters.setSelectedInstructors([])
    filters.setSelectedDays([])
    filters.setSelectedLevels([])
    filters.setSelectedStatuses(['active'])
  }

  return (
    <div className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-4 animate-in slide-in-from-top-2">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Filter Groups</h3>
        <button
          onClick={onClose}
          aria-label="Close filters"
          className="text-slate-400 hover:text-slate-600 w-6 h-6 flex items-center justify-center rounded-md hover:bg-slate-200"
        >
          <span className="material-symbols-outlined text-[20px]" aria-hidden="true">close</span>
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        {FILTER_CATEGORIES.map(cat => (
          <FilterPill
            key={cat.id}
            icon={cat.icon}
            label={cat.label}
            isExpanded={expandedCategory === cat.id}
            hasFilters={getFilterCount(cat.id) > 0}
            filterCount={getFilterCount(cat.id)}
            onClick={() => toggleCategory(cat.id)}
          />
        ))}
      </div>

      {expandedCategory && (
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-4">
          {expandedCategory === 'course' && (
            <div>
              <span className="text-sm font-medium text-slate-600 block mb-3">Course</span>
              <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto">
                {sortedCourses.map(course => (
                  <button
                    key={course.id}
                    type="button"
                    aria-pressed={filters.selectedCourses.includes(course.id)}
                    onClick={() => {
                      const newIds = filters.selectedCourses.includes(course.id)
                        ? filters.selectedCourses.filter(id => id !== course.id)
                        : [...filters.selectedCourses, course.id]
                      filters.setSelectedCourses(newIds)
                    }}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                      filters.selectedCourses.includes(course.id)
                        ? 'bg-secondary text-white'
                        : 'bg-white text-slate-600 border border-slate-200 hover:border-secondary'
                    }`}
                  >
                    {course.name}
                  </button>
                ))}
                {sortedCourses.length === 0 && (
                  <p className="text-sm text-slate-400">No courses available</p>
                )}
              </div>
            </div>
          )}

          {expandedCategory === 'instructor' && (
            <div>
              <span className="text-sm font-medium text-slate-600 block mb-3">Instructor</span>
              <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto">
                {sortedStaff.map(instructor => (
                  <button
                    key={instructor.id}
                    type="button"
                    aria-pressed={filters.selectedInstructors.includes(instructor.id)}
                    onClick={() => {
                      const newIds = filters.selectedInstructors.includes(instructor.id)
                        ? filters.selectedInstructors.filter(id => id !== instructor.id)
                        : [...filters.selectedInstructors, instructor.id]
                      filters.setSelectedInstructors(newIds)
                    }}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                      filters.selectedInstructors.includes(instructor.id)
                        ? 'bg-secondary text-white'
                        : 'bg-white text-slate-600 border border-slate-200 hover:border-secondary'
                    }`}
                  >
                    {instructor.full_name}
                  </button>
                ))}
                {sortedStaff.length === 0 && (
                  <p className="text-sm text-slate-400">No instructors available</p>
                )}
              </div>
            </div>
          )}

          {expandedCategory === 'level' && (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-slate-600">Level:</span>
              <div className="flex flex-wrap gap-2">
                {LEVELS.map(level => (
                  <button
                    key={level}
                    type="button"
                    aria-pressed={filters.selectedLevels.includes(level)}
                    onClick={() => {
                      const newLevels = filters.selectedLevels.includes(level)
                        ? filters.selectedLevels.filter(l => l !== level)
                        : [...filters.selectedLevels, level]
                      filters.setSelectedLevels(newLevels)
                    }}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                      filters.selectedLevels.includes(level)
                        ? 'bg-secondary text-white'
                        : 'bg-white text-slate-600 border border-slate-200 hover:border-secondary'
                    }`}
                  >
                    Level {level}
                  </button>
                ))}
              </div>
            </div>
          )}

          {expandedCategory === 'day' && (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-slate-600">Day:</span>
              <div className="flex flex-wrap gap-2">
                {DAYS.map(day => (
                  <button
                    key={day}
                    type="button"
                    aria-pressed={filters.selectedDays.includes(day)}
                    onClick={() => {
                      const newDays = filters.selectedDays.includes(day)
                        ? filters.selectedDays.filter(d => d !== day)
                        : [...filters.selectedDays, day]
                      filters.setSelectedDays(newDays)
                    }}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                      filters.selectedDays.includes(day)
                        ? 'bg-secondary text-white'
                        : 'bg-white text-slate-600 border border-slate-200 hover:border-secondary'
                    }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {expandedCategory === 'status' && (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-slate-600">Status:</span>
              <div className="flex flex-wrap gap-2">
                {STATUSES.map(status => (
                  <button
                    key={status}
                    type="button"
                    aria-pressed={filters.selectedStatuses.includes(status)}
                    onClick={() => {
                      const newStatuses = filters.selectedStatuses.includes(status)
                        ? filters.selectedStatuses.filter(s => s !== status)
                        : [...filters.selectedStatuses, status]
                      filters.setSelectedStatuses(newStatuses)
                    }}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                      filters.selectedStatuses.includes(status)
                        ? 'bg-secondary text-white'
                        : 'bg-white text-slate-600 border border-slate-200 hover:border-secondary'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        {hasAnyFilters && (
          <span className="text-xs text-slate-400">
            {FILTER_CATEGORIES.reduce((sum, cat) => sum + getFilterCount(cat.id), 0)} filter(s) active
          </span>
        )}
        <div className="flex items-center gap-3 ml-auto">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-slate-800 transition-all"
          >
            Reset
          </button>
          <button
            onClick={handleApply}
            className="px-5 py-2 text-sm font-medium text-white bg-secondary rounded-lg hover:bg-secondary/90 transition-all"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  )
}
