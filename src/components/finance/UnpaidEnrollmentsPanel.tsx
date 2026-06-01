import { useState, useEffect, useMemo } from 'react'
import { useBalance } from '../../hooks/finance'
import { useGroupsFlat } from '../../hooks/useGroupQueries'
import { UnpaidEnrollmentCard } from './UnpaidEnrollmentCard'
import { UnpaidEnrollmentsFilters } from './UnpaidEnrollmentsFilters'
import { Pagination } from '../common'
import type { UnpaidEnrollment } from '../../api/crm/students/types/finance'
import type { EnrichedGroupPublic } from '../../api/academics'

interface UnpaidEnrollmentsPanelProps {
  onError: (message: string) => void
  onPay: (enrollment: UnpaidEnrollment) => void
  onNavigateToCreate?: () => void
}

interface GroupedEnrollments {
  key: string
  label: string
  count: number
  items: UnpaidEnrollment[]
}

const PAGE_SIZE = 12

export function UnpaidEnrollmentsPanel({ onError, onPay, onNavigateToCreate }: UnpaidEnrollmentsPanelProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedGroup, setSelectedGroup] = useState<EnrichedGroupPublic | null>(null)
  const [minBalance, setMinBalance] = useState<number | ''>('')
  const [ageFilter, setAgeFilter] = useState<'all' | 'lt30' | '30to60' | 'gt60'>('all')
  const [groupBy, setGroupByState] = useState<'none' | 'student' | 'group' | 'course'>('none')
  const [selectedGroupKey, setSelectedGroupKey] = useState<string>('all')

  // Wrap setGroupBy to also reset selectedGroupKey
  const setGroupBy = (value: 'none' | 'student' | 'group' | 'course') => {
    setGroupByState(value)
    setSelectedGroupKey('all')
  }

  // Check if any client-side filters are active
  const hasActiveFilters = minBalance !== '' || ageFilter !== 'all' || selectedGroup !== null

  const { fetchUnpaidEnrollments, unpaidEnrollments, isLoadingUnpaidEnrollments, unpaidEnrollmentsError } = useBalance()
  const { data: groupsData, isLoading: isLoadingGroups } = useGroupsFlat(true)

  // Fetch unpaid enrollments - fetch all when filtering, paginated otherwise
  useEffect(() => {
    fetchUnpaidEnrollments({
      skip: hasActiveFilters ? 0 : (currentPage - 1) * PAGE_SIZE,
      limit: hasActiveFilters ? 1000 : PAGE_SIZE,
      group_id: selectedGroup?.id || undefined,
    }).catch(() => {
      onError('Failed to load unpaid enrollments')
    })
  }, [currentPage, selectedGroup, hasActiveFilters, fetchUnpaidEnrollments, onError])

  // Handle errors
  useEffect(() => {
    if (unpaidEnrollmentsError) {
      onError(unpaidEnrollmentsError.message)
    }
  }, [unpaidEnrollmentsError, onError])

  // Apply client-side filters
  const filteredEnrollments = useMemo(() => {
    if (!unpaidEnrollments?.items) return []

    return unpaidEnrollments.items.filter((enrollment) => {
      // Minimum balance filter
      if (minBalance !== '' && enrollment.remaining_balance < minBalance) {
        return false
      }

      // Age filter
      if (ageFilter !== 'all') {
        const enrolledDate = new Date(enrollment.enrolled_at)
        const today = new Date()
        const daysUnpaid = Math.floor((today.getTime() - enrolledDate.getTime()) / (1000 * 60 * 60 * 24))

        switch (ageFilter) {
          case 'lt30':
            if (daysUnpaid >= 30) return false
            break
          case '30to60':
            if (daysUnpaid < 30 || daysUnpaid > 60) return false
            break
          case 'gt60':
            if (daysUnpaid <= 60) return false
            break
        }
      }

      return true
    })
  }, [unpaidEnrollments, minBalance, ageFilter])

  // Group enrollments based on groupBy selection
  const groupedEnrollments = useMemo((): GroupedEnrollments[] => {
    if (groupBy === 'none') {
      return [{ key: 'all', label: 'All Unpaid', count: filteredEnrollments.length, items: filteredEnrollments }]
    }

    const groupsMap = filteredEnrollments.reduce<Record<string, GroupedEnrollments>>((acc, enrollment) => {
      let key: string
      let label: string

      switch (groupBy) {
        case 'student':
          key = `student-${enrollment.student_id}`
          label = enrollment.student_name
          break
        case 'group':
          key = `group-${enrollment.group_id}`
          label = enrollment.group_name
          break
        case 'course':
          key = `course-${enrollment.course_name || 'unknown'}`
          label = enrollment.course_name || 'Unknown Course'
          break
        default:
          key = 'all'
          label = 'All'
      }

      if (!acc[key]) {
        acc[key] = { key, label, count: 0, items: [] }
      }
      acc[key].count += 1
      acc[key].items.push(enrollment)
      return acc
    }, {})

    return Object.values(groupsMap)
  }, [filteredEnrollments, groupBy])

  // Get current display items based on selected group key
  const currentItems = useMemo(() => {
    const group = groupedEnrollments.find((g) => g.key === selectedGroupKey)
    return group?.items || filteredEnrollments
  }, [groupedEnrollments, selectedGroupKey, filteredEnrollments])


  const handlePay = (enrollment: UnpaidEnrollment) => {
    if (onPay) {
      onPay(enrollment)
    } else {
      // Navigate to create receipt with pre-filled data
      console.log('Pay clicked for:', enrollment)
    }
  }

  const handleRemind = (enrollment: UnpaidEnrollment) => {
    // TODO: Implement WhatsApp reminder
    console.log('Remind clicked for:', enrollment)
    alert(`WhatsApp reminder would be sent to ${enrollment.student_name}`)
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <UnpaidEnrollmentsFilters
        selectedGroup={selectedGroup}
        minBalance={minBalance}
        ageFilter={ageFilter}
        groups={groupsData || []}
        isLoadingGroups={isLoadingGroups}
        onGroupChange={setSelectedGroup}
        onMinBalanceChange={setMinBalance}
        onAgeFilterChange={setAgeFilter}
      />

      {/* Group By Selector */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-slate-600">Group by:</span>
        <div className="flex bg-slate-100 rounded-lg p-1 gap-1">
          {[
            { value: 'none', label: 'All', icon: 'grid_view' },
            { value: 'student', label: 'Student', icon: 'person' },
            { value: 'group', label: 'Group', icon: 'groups' },
            { value: 'course', label: 'Course', icon: 'school' },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setGroupBy(option.value as typeof groupBy)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${
                groupBy === option.value
                  ? 'bg-white text-secondary shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">{option.icon}</span>
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Group Tabs (if grouping is active) */}
      {groupBy !== 'none' && groupedEnrollments.length > 0 && (
        <div className="overflow-x-auto">
          <div className="flex items-center gap-1 rounded-xl bg-slate-800 p-1.5 min-w-max">
            {groupedEnrollments.map((group) => {
              const isActive = selectedGroupKey === group.key
              return (
                <button
                  key={group.key}
                  onClick={() => setSelectedGroupKey(group.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-secondary text-white font-bold shadow-lg shadow-secondary/20'
                      : 'text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                  }`}
                >
                  <span className="font-headline">{group.label}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {group.count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-600">
          Found <span className="font-semibold text-secondary">{currentItems.length}</span> unpaid enrollment
          {currentItems.length !== 1 ? 's' : ''}
        </div>
        {onNavigateToCreate && (
          <button
            type="button"
            onClick={onNavigateToCreate}
            className="text-sm text-secondary hover:text-secondary/80 font-medium flex items-center gap-1 transition-colors"
          >
            <span className="material-symbols-outlined text-base">add_circle</span>
            Create Receipt
          </button>
        )}
      </div>

      {/* Cards Grid */}
      {isLoadingUnpaidEnrollments ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 h-40 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-slate-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-slate-200 rounded w-1/3 ml-auto"></div>
            </div>
          ))}
        </div>
      ) : currentItems.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">check_circle</span>
          <h3 className="font-headline text-xl font-semibold text-on-surface mb-2">No unpaid enrollments</h3>
          <p className="text-slate-500">All students are up to date with their payments!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {currentItems.map((enrollment) => (
            <UnpaidEnrollmentCard
              key={enrollment.enrollment_id}
              enrollment={enrollment}
              onPay={() => handlePay(enrollment)}
              onRemind={() => handleRemind(enrollment)}
            />
          ))}
        </div>
      )}

      {/* Pagination - hide when filters are active */}
      {!hasActiveFilters && unpaidEnrollments && unpaidEnrollments.total > PAGE_SIZE && (
        <div className="mt-6 pt-4 border-t border-slate-200">
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(unpaidEnrollments.total / PAGE_SIZE)}
            pageSize={PAGE_SIZE}
            onPageChange={setCurrentPage}
            pageSizeOptions={[12, 24, 48]}
            showTotalInfo={true}
            loading={isLoadingUnpaidEnrollments}
          />
        </div>
      )}
    </div>
  )
}
