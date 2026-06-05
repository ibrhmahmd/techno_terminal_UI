import { useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { DualNumberInput, ActiveFilterTagsList } from '../common'
import { getCoursesPaginated } from '../../api/academics'
import { queryKeys } from '../../hooks/queryKeys'
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

export function AdvancedSearchPanel({
  filters,
  onFilterChange,
  onApply,
  onReset,
  hasActiveFilters,
  activeFilters,
  onRemoveFilter,
}: AdvancedSearchPanelProps) {
  // Fetch courses list for inclusion/exclusion filtering
  const { data: coursesData } = useQuery({
    queryKey: queryKeys.coursesListSimple,
    queryFn: async () => {
      const res = await getCoursesPaginated({ skip: 0, limit: 150 })
      return res.items || []
    },
    staleTime: 5 * 60 * 1000,
  })
  const courses = coursesData || []

  // Handle Enter key to apply filters
  const onApplyRef = useRef(onApply)
  useEffect(() => {
    onApplyRef.current = onApply
  }, [onApply])
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && hasActiveFilters) {
        onApplyRef.current()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [hasActiveFilters])

  return (
    <div className="space-y-6">
      {/* 3-Column Filter Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Column 1: Student Profile */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-5 hover:shadow-md transition-all duration-200 space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <span aria-hidden="true" className="material-symbols-outlined text-secondary font-semibold">person</span>
            <h4 className="font-headline font-semibold text-slate-800">Student Profile</h4>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Status</span>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map(({ value, label, color }) => {
                const isSelected = filters.status.includes(value)
                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => {
                      const newStatus = isSelected
                        ? filters.status.filter((s) => s !== value)
                        : [...filters.status, value]
                      onFilterChange('status', newStatus)
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-secondary text-white shadow-sm'
                        : 'bg-white text-slate-600 border border-slate-200 hover:border-secondary'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${color}`}></span>
                    {label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Gender</span>
            <div className="flex flex-wrap gap-2">
              {GENDER_OPTIONS.map(({ value, label }) => {
                const isSelected = filters.gender.includes(value)
                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => {
                      const newGender = isSelected
                        ? filters.gender.filter((g) => g !== value)
                        : [...filters.gender, value]
                      onFilterChange('gender', newGender)
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-secondary text-white shadow-sm'
                        : 'bg-white text-slate-600 border border-slate-200 hover:border-secondary'
                    }`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Age Range */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Age Range</span>
              {(filters.ageMin !== '' || filters.ageMax !== '') && (
                <span className="text-xs text-secondary font-medium">
                  {filters.ageMin !== '' && filters.ageMax !== ''
                    ? `${filters.ageMin}-${filters.ageMax} yrs`
                    : filters.ageMin !== ''
                      ? `${filters.ageMin}+ yrs`
                      : `Up to ${filters.ageMax} yrs`}
                </span>
              )}
            </div>
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
          </div>

          {/* Instructor Name */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Assigned Instructor</span>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by instructor name..."
                aria-label="Instructor name"
                value={filters.instructorName}
                onChange={(e) => onFilterChange('instructorName', e.target.value)}
                className="w-full px-3 py-2 pl-9 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
              />
              <span aria-hidden="true" className="material-symbols-outlined text-[16px] text-slate-400 absolute left-3 top-2.5">
                person_2
              </span>
            </div>
          </div>
        </div>

        {/* Column 2: Academics & Courses */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-5 hover:shadow-md transition-all duration-200 space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <span aria-hidden="true" className="material-symbols-outlined text-secondary font-semibold">school</span>
            <h4 className="font-headline font-semibold text-slate-800">Courses & Groups</h4>
          </div>

          {/* Enrolled Courses */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Enrolled in Courses</span>
            <div className="max-h-[100px] overflow-y-auto border border-slate-200 rounded-lg p-2 bg-white space-y-1 scrollbar-thin">
              {courses.map((course) => {
                const checked = filters.courseIds.includes(course.id)
                return (
                  <label key={course.id} className="flex items-center gap-2 px-2 py-1 hover:bg-slate-50 rounded cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        const next = checked
                          ? filters.courseIds.filter((id) => id !== course.id)
                          : [...filters.courseIds, course.id]
                        onFilterChange('courseIds', next)
                      }}
                      className="rounded border-slate-300 text-secondary focus:ring-secondary w-3.5 h-3.5"
                    />
                    <span className="text-slate-700 truncate">{course.name}</span>
                  </label>
                )
              })}
              {courses.length === 0 && <span className="text-[11px] text-slate-400 p-1 block">No courses found</span>}
            </div>
          </div>

          {/* Exclude Courses */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Exclude Courses</span>
            <div className="max-h-[100px] overflow-y-auto border border-slate-200 rounded-lg p-2 bg-white space-y-1 scrollbar-thin">
              {courses.map((course) => {
                const checked = filters.excludeCourseIds.includes(course.id)
                return (
                  <label key={course.id} className="flex items-center gap-2 px-2 py-1 hover:bg-slate-50 rounded cursor-pointer text-xs text-red-700">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        const next = checked
                          ? filters.excludeCourseIds.filter((id) => id !== course.id)
                          : [...filters.excludeCourseIds, course.id]
                        onFilterChange('excludeCourseIds', next)
                      }}
                      className="rounded border-slate-300 text-red-600 focus:ring-red-500 w-3.5 h-3.5"
                    />
                    <span className="text-slate-700 truncate">{course.name}</span>
                  </label>
                )
              })}
              {courses.length === 0 && <span className="text-[11px] text-slate-400 p-1 block">No courses found</span>}
            </div>
          </div>

          {/* Group Days */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Group Class Days</span>
            <div className="flex flex-wrap gap-1">
              {DAY_OPTIONS.map((day) => {
                const isSelected = filters.groupDays.includes(day)
                return (
                  <button
                    key={day}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => {
                      const newDays = isSelected
                        ? filters.groupDays.filter((d) => d !== day)
                        : [...filters.groupDays, day]
                      onFilterChange('groupDays', newDays)
                    }}
                    className={`px-2 py-1 rounded-md text-[11px] font-medium transition-all ${
                      isSelected
                        ? 'bg-secondary text-white shadow-sm'
                        : 'bg-white text-slate-600 border border-slate-200 hover:border-secondary'
                    }`}
                  >
                    {day}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Enrollment Count & Date Range */}
          <div className="space-y-3 pt-2 border-t border-slate-200/60">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Enrollment Count</span>
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
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 block">Enrolled Date Range</span>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  aria-label="Enrollment date from"
                  value={filters.enrollmentDateFrom}
                  onChange={(e) => onFilterChange('enrollmentDateFrom', e.target.value)}
                  className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-secondary"
                />
                <span className="text-slate-400 text-xs">to</span>
                <input
                  type="date"
                  aria-label="Enrollment date to"
                  value={filters.enrollmentDateTo}
                  onChange={(e) => onFilterChange('enrollmentDateTo', e.target.value)}
                  className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-secondary"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: Finances & Activities */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-5 hover:shadow-md transition-all duration-200 space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <span aria-hidden="true" className="material-symbols-outlined text-secondary font-semibold">timeline</span>
            <h4 className="font-headline font-semibold text-slate-800">Finances & Logs</h4>
          </div>

          {/* Unpaid Balance */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Financial Status</span>
            <button
              type="button"
              onClick={() => onFilterChange('hasUnpaidBalance', filters.hasUnpaidBalance === true ? null : true)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all w-full justify-center ${
                filters.hasUnpaidBalance === true
                  ? 'bg-red-50 text-red-600 border border-red-200 shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-red-300'
              }`}
            >
              <span aria-hidden="true" className="material-symbols-outlined text-[16px]">
                {filters.hasUnpaidBalance === true ? 'check_box' : 'check_box_outline_blank'}
              </span>
              Has unpaid balance only
            </button>
          </div>

          {/* Activity Types */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Logged Activity Types</span>
            <div className="max-h-[100px] overflow-y-auto border border-slate-200 rounded-lg p-2 bg-white space-y-1 scrollbar-thin">
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
                  <label key={type.value} className="flex items-center gap-2 px-2 py-1 hover:bg-slate-50 rounded cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        const next = checked
                          ? filters.activityTypes.filter((t) => t !== type.value)
                          : [...filters.activityTypes, type.value]
                        onFilterChange('activityTypes', next)
                      }}
                      className="rounded border-slate-300 text-secondary focus:ring-secondary w-3.5 h-3.5"
                    />
                    <span className="text-slate-700">{type.label}</span>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Logged Activities count */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Total Logged Activities</span>
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

          {/* Activity Logged Date range & keyword search */}
          <div className="space-y-3 pt-2 border-t border-slate-200/60">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 block">Activity Logged between</span>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  aria-label="Activity date from"
                  value={filters.activityDateFrom}
                  onChange={(e) => onFilterChange('activityDateFrom', e.target.value)}
                  className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-secondary"
                />
                <span className="text-slate-400 text-xs">to</span>
                <input
                  type="date"
                  aria-label="Activity date to"
                  value={filters.activityDateTo}
                  onChange={(e) => onFilterChange('activityDateTo', e.target.value)}
                  className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-secondary"
                />
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 block">Search Log Description/Metadata</span>
              <input
                type="text"
                placeholder="e.g., Coupon, HTML, manual..."
                aria-label="Activity search term"
                value={filters.activitySearchTerm}
                onChange={(e) => onFilterChange('activitySearchTerm', e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Active Filter Tags */}
      <ActiveFilterTagsList
        filters={activeFilters}
        onRemoveFilter={onRemoveFilter}
        onClearAll={onReset}
      />
    </div>
  )
}
