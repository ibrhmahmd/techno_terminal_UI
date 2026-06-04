import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { FilterPill, DualNumberInput, ActiveFilterTagsList } from '../common'
import { getCoursesPaginated } from '../../api/academics'
import type { FilterState } from '../../hooks/directory/useAdvancedSearch'

interface AdvancedSearchPanelProps {
  filters: FilterState
  onFilterChange: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void
  onApply: () => void
  onReset: () => void
  hasActiveFilters: boolean
  activeFilters: { id: string; label: string; value: string }[]
  onRemoveFilter: (id: string) => void
}

const STATUS_OPTIONS = [
  { value: 'active' as const, label: 'Active', color: 'bg-green-500' },
  { value: 'waiting' as const, label: 'Waiting', color: 'bg-amber-500' },
  { value: 'inactive' as const, label: 'Inactive', color: 'bg-slate-400' },
]

const GENDER_OPTIONS = [
  { value: 'male' as const, label: 'Male' },
  { value: 'female' as const, label: 'Female' },
  { value: 'unknown' as const, label: 'Unknown' },
] as const

const DAY_OPTIONS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const FILTER_CATEGORIES = [
  { id: 'age', label: 'Age', icon: 'cake' },
  { id: 'status', label: 'Status', icon: 'flag' },
  { id: 'gender', label: 'Gender', icon: 'person' },
  { id: 'days', label: 'Days', icon: 'calendar_today' },
  { id: 'instructor', label: 'Instructor', icon: 'person_2' },
  { id: 'balance', label: 'Balance', icon: 'payments' },
  { id: 'courses', label: 'Courses', icon: 'school' },
  { id: 'activity_logs', label: 'Activities', icon: 'timeline' },
  { id: 'more', label: 'More', icon: 'more_horiz' },
] as const

export function AdvancedSearchPanel({
  filters,
  onFilterChange,
  onApply,
  onReset,
  hasActiveFilters,
  activeFilters,
  onRemoveFilter,
}: AdvancedSearchPanelProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>('age')

  // Fetch courses list for inclusion/exclusion filtering
  const { data: coursesData } = useQuery({
    queryKey: ['courses', 'list-simple'],
    queryFn: async () => {
      const res = await getCoursesPaginated({ skip: 0, limit: 100 })
      return res.items || []
    },
    staleTime: 5 * 60 * 1000,
  })
  const courses = coursesData || []

  // Handle Enter key to apply filters
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && hasActiveFilters) {
        onApply()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [hasActiveFilters, onApply])

  const toggleCategory = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId)
  }

  const getFilterCount = (categoryId: string): number => {
    switch (categoryId) {
      case 'age':
        return filters.ageMin !== '' || filters.ageMax !== '' ? 1 : 0
      case 'status':
        return filters.status.length
      case 'gender':
        return filters.gender.length
      case 'days':
        return filters.groupDays.length
      case 'instructor':
        return filters.instructorName ? 1 : 0
      case 'balance':
        return filters.hasUnpaidBalance === true ? 1 : 0
      case 'courses':
        return (filters.courseIds.length > 0 ? 1 : 0) +
               (filters.excludeCourseIds.length > 0 ? 1 : 0) +
               (filters.courseEnrollmentDateFrom || filters.courseEnrollmentDateTo ? 1 : 0)
      case 'activity_logs':
        return (filters.minActivityCount !== '' || filters.maxActivityCount !== '' ? 1 : 0) +
               (filters.activityTypes.length > 0 ? 1 : 0) +
               (filters.activityDateFrom || filters.activityDateTo ? 1 : 0) +
               (filters.activitySearchTerm ? 1 : 0)
      case 'more':
        return (filters.enrollmentCountMin !== '' || filters.enrollmentCountMax !== '' ? 1 : 0) +
               (filters.enrollmentDateFrom || filters.enrollmentDateTo ? 1 : 0)
      default:
        return 0
    }
  }

  return (
    <div className="space-y-4">
      {/* Horizontal Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {FILTER_CATEGORIES.map((category) => (
          <FilterPill
            key={category.id}
            icon={category.icon}
            label={category.label}
            isExpanded={expandedCategory === category.id}
            hasFilters={getFilterCount(category.id) > 0}
            filterCount={getFilterCount(category.id)}
            onClick={() => toggleCategory(category.id)}
          />
        ))}
      </div>

      {/* Expanded Filter Controls */}
      {expandedCategory && (
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
          {/* Age Range - Priority Feature */}
          {expandedCategory === 'age' && (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-slate-600">Age Range:</span>
              <DualNumberInput
                minValue={filters.ageMin}
                maxValue={filters.ageMax}
                onMinChange={(val) => onFilterChange('ageMin', val)}
                onMaxChange={(val) => onFilterChange('ageMax', val)}
                minPlaceholder="0"
                maxPlaceholder="100"
                unit="y"
                min={0}
                max={100}
              />
              {(filters.ageMin !== '' || filters.ageMax !== '') && (
                <span className="text-sm text-secondary font-medium">
                  {filters.ageMin !== '' && filters.ageMax !== ''
                    ? `${filters.ageMin}-${filters.ageMax} years`
                    : filters.ageMin !== ''
                      ? `${filters.ageMin}+ years`
                      : `Up to ${filters.ageMax} years`}
                </span>
              )}
            </div>
          )}

          {/* Status */}
          {expandedCategory === 'status' && (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-slate-600">Status:</span>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map(({ value, label, color }) => (
                  <button
                    key={value}
                    onClick={() => {
                      const newStatus = filters.status.includes(value)
                        ? filters.status.filter((s) => s !== value)
                        : [...filters.status, value]
                      onFilterChange('status', newStatus)
                    }}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      filters.status.includes(value)
                        ? 'bg-secondary text-white'
                        : 'bg-white text-slate-600 border border-slate-200 hover:border-secondary'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${color}`}></span>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Gender */}
          {expandedCategory === 'gender' && (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-slate-600">Gender:</span>
              <div className="flex flex-wrap gap-2">
                {GENDER_OPTIONS.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => {
                      const newGender = filters.gender.includes(value)
                        ? filters.gender.filter((g) => g !== value)
                        : [...filters.gender, value]
                      onFilterChange('gender', newGender)
                    }}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                      filters.gender.includes(value)
                        ? 'bg-secondary text-white'
                        : 'bg-white text-slate-600 border border-slate-200 hover:border-secondary'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Days */}
          {expandedCategory === 'days' && (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-slate-600">Group Days:</span>
              <div className="flex flex-wrap gap-1">
                {DAY_OPTIONS.map((day) => (
                  <button
                    key={day}
                    onClick={() => {
                      const newDays = filters.groupDays.includes(day)
                        ? filters.groupDays.filter((d) => d !== day)
                        : [...filters.groupDays, day]
                      onFilterChange('groupDays', newDays)
                    }}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      filters.groupDays.includes(day)
                        ? 'bg-secondary text-white'
                        : 'bg-white text-slate-600 border border-slate-200 hover:border-secondary'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Instructor */}
          {expandedCategory === 'instructor' && (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-slate-600">Instructor:</span>
              <input
                type="text"
                placeholder="Search by name..."
                value={filters.instructorName}
                onChange={(e) => onFilterChange('instructorName', e.target.value)}
                className="px-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary w-64"
              />
            </div>
          )}

          {/* Balance */}
          {expandedCategory === 'balance' && (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-slate-600">Payment Status:</span>
              <button
                onClick={() => onFilterChange('hasUnpaidBalance', filters.hasUnpaidBalance === true ? null : true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filters.hasUnpaidBalance === true
                    ? 'bg-red-50 text-red-600 border border-red-200'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-red-300'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {filters.hasUnpaidBalance === true ? 'check_box' : 'check_box_outline_blank'}
                </span>
                Has unpaid balance only
              </button>
            </div>
          )}

          {/* Courses Selection (Inclusion, Exclusion, Dates) */}
          {expandedCategory === 'courses' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Enrolled in Courses */}
                <div>
                  <span className="text-sm font-medium text-slate-600 block mb-2">Enrolled in Courses:</span>
                  <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-lg p-2 bg-white space-y-1">
                    {courses.map((course) => {
                      const checked = filters.courseIds.includes(course.id)
                      return (
                        <label key={course.id} className="flex items-center gap-2 px-2 py-1 hover:bg-slate-50 rounded cursor-pointer text-sm">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => {
                              const next = checked
                                ? filters.courseIds.filter((id) => id !== course.id)
                                : [...filters.courseIds, course.id]
                              onFilterChange('courseIds', next)
                            }}
                            className="rounded border-slate-300 text-secondary focus:ring-secondary"
                          />
                          <span className="text-slate-700">{course.name}</span>
                        </label>
                      )
                    })}
                    {courses.length === 0 && <span className="text-xs text-slate-400 p-2 block">No courses found</span>}
                  </div>
                </div>

                {/* Exclude Courses */}
                <div>
                  <span className="text-sm font-medium text-slate-600 block mb-2">Exclude Enrolled Courses:</span>
                  <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-lg p-2 bg-white space-y-1">
                    {courses.map((course) => {
                      const checked = filters.excludeCourseIds.includes(course.id)
                      return (
                        <label key={course.id} className="flex items-center gap-2 px-2 py-1 hover:bg-slate-50 rounded cursor-pointer text-sm text-red-700">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => {
                              const next = checked
                                ? filters.excludeCourseIds.filter((id) => id !== course.id)
                                : [...filters.excludeCourseIds, course.id]
                              onFilterChange('excludeCourseIds', next)
                            }}
                            className="rounded border-slate-300 text-red-600 focus:ring-red-500"
                          />
                          <span className="text-slate-700">{course.name}</span>
                        </label>
                      )
                    })}
                    {courses.length === 0 && <span className="text-xs text-slate-400 p-2 block">No courses found</span>}
                  </div>
                </div>
              </div>

              {/* Course Enrollment Date Range */}
              <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-100">
                <span className="text-sm font-medium text-slate-600">Course Enrolled between:</span>
                <input
                  type="date"
                  value={filters.courseEnrollmentDateFrom}
                  onChange={(e) => onFilterChange('courseEnrollmentDateFrom', e.target.value)}
                  className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                />
                <span className="text-slate-400">-</span>
                <input
                  type="date"
                  value={filters.courseEnrollmentDateTo}
                  onChange={(e) => onFilterChange('courseEnrollmentDateTo', e.target.value)}
                  className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                />
              </div>
            </div>
          )}

          {/* Activity Logs (Counts, Types, Dates, Search) */}
          {expandedCategory === 'activity_logs' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Activity Types checklist */}
                <div>
                  <span className="text-sm font-medium text-slate-600 block mb-2">Activity Types:</span>
                  <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-lg p-2 bg-white space-y-1">
                    {[
                      { value: 'registration', label: 'Registration' },
                      { value: 'status_change', label: 'Status Change' },
                      { value: 'enrollment', label: 'Enrollment' },
                      { value: 'enrollment_change', label: 'Enrollment Change' },
                      { value: 'payment', label: 'Payment' },
                      { value: 'note_added', label: 'Note Added' },
                      { value: 'competition', label: 'Competition' },
                      { value: 'deletion', label: 'Deletion' }
                    ].map((type) => {
                      const checked = filters.activityTypes.includes(type.value)
                      return (
                        <label key={type.value} className="flex items-center gap-2 px-2 py-1 hover:bg-slate-50 rounded cursor-pointer text-sm">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => {
                              const next = checked
                                ? filters.activityTypes.filter((t) => t !== type.value)
                                : [...filters.activityTypes, type.value]
                              onFilterChange('activityTypes', next)
                            }}
                            className="rounded border-slate-300 text-secondary focus:ring-secondary"
                          />
                          <span className="text-slate-700">{type.label}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>

                {/* Activity Counts and Search Term */}
                <div className="space-y-4">
                  <div>
                    <span className="text-sm font-medium text-slate-600 block mb-2">Total Logged Activities:</span>
                    <DualNumberInput
                      minValue={filters.minActivityCount}
                      maxValue={filters.maxActivityCount}
                      onMinChange={(val) => onFilterChange('minActivityCount', val)}
                      onMaxChange={(val) => onFilterChange('maxActivityCount', val)}
                      minPlaceholder="Min events"
                      maxPlaceholder="Max events"
                      min={0}
                      max={100}
                    />
                  </div>

                  <div>
                    <span className="text-sm font-medium text-slate-600 block mb-2">Search Description or Metadata:</span>
                    <input
                      type="text"
                      placeholder="e.g., Coupon, HTML, manual note..."
                      value={filters.activitySearchTerm}
                      onChange={(e) => onFilterChange('activitySearchTerm', e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                    />
                  </div>
                </div>
              </div>

              {/* Activity Logged Date Range */}
              <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-100">
                <span className="text-sm font-medium text-slate-600">Activity Logged between:</span>
                <input
                  type="date"
                  value={filters.activityDateFrom}
                  onChange={(e) => onFilterChange('activityDateFrom', e.target.value)}
                  className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                />
                <span className="text-slate-400">-</span>
                <input
                  type="date"
                  value={filters.activityDateTo}
                  onChange={(e) => onFilterChange('activityDateTo', e.target.value)}
                  className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                />
              </div>
            </div>
          )}

          {/* More - Enrollment count & dates */}
          {expandedCategory === 'more' && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-slate-600">Enrollments:</span>
                <DualNumberInput
                  minValue={filters.enrollmentCountMin}
                  maxValue={filters.enrollmentCountMax}
                  onMinChange={(val) => onFilterChange('enrollmentCountMin', val)}
                  onMaxChange={(val) => onFilterChange('enrollmentCountMax', val)}
                  minPlaceholder="Min"
                  maxPlaceholder="Max"
                  min={0}
                  max={50}
                />
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-slate-600">Enrolled between:</span>
                <input
                  type="date"
                  value={filters.enrollmentDateFrom}
                  onChange={(e) => onFilterChange('enrollmentDateFrom', e.target.value)}
                  className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                />
                <span className="text-slate-400">-</span>
                <input
                  type="date"
                  value={filters.enrollmentDateTo}
                  onChange={(e) => onFilterChange('enrollmentDateTo', e.target.value)}
                  className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Active Filter Tags */}
      <ActiveFilterTagsList
        filters={activeFilters}
        onRemoveFilter={onRemoveFilter}
        onClearAll={onReset}
      />
    </div>
  )
}
