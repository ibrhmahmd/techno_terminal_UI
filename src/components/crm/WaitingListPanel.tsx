// Waiting List Management Panel
// Dedicated interface for managing waiting list students with priority controls

import { useState } from 'react'
import { useWaitingList } from '../../hooks/useWaitingList'
import { WaitingStudentCard } from './WaitingStudentCard'
import { Users, Search, Calendar } from 'lucide-react'
import type { StudentWithDetails } from '../../api/crm'

interface WaitingListPanelProps {
  onEnrollStudent?: (student: StudentWithDetails) => void
}

const DATE_FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
] as const

export function WaitingListPanel({ onEnrollStudent }: WaitingListPanelProps) {
  const { students, isLoading, error } = useWaitingList()
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState<typeof DATE_FILTERS[number]['value']>('all')

  const filteredStudents = students.filter(student => {
    // Name search filter
    const matchesSearch = student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (student.phone?.includes(searchTerm) ?? false)
    
    // Date filter
    if (dateFilter === 'all') return matchesSearch
    
    const addedDate = student.waiting_since ? new Date(student.waiting_since) : null
    if (!addedDate) return matchesSearch
    
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - addedDate.getTime()) / (1000 * 60 * 60 * 24))
    
    switch (dateFilter) {
      case 'today':
        return matchesSearch && diffDays === 0
      case 'week':
        return matchesSearch && diffDays <= 7
      case 'month':
        return matchesSearch && diffDays <= 30
      default:
        return matchesSearch
    }
  })

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-surface-container-low rounded-xl h-48 animate-pulse" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-error">
        <p>Failed to load waiting list</p>
        <p className="text-sm text-on-surface-variant mt-2">Please try again later</p>
      </div>
    )
  }

  if (students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-on-surface-variant">
        <Users className="w-12 h-12 mb-4 opacity-50" />
        <p className="text-lg font-medium">No students in waiting list</p>
        <p className="text-sm mt-2">Students added to waiting list will appear here</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header with filters */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-on-surface-variant" />
          <div className="flex gap-1">
            {DATE_FILTERS.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setDateFilter(filter.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  dateFilter === filter.value
                    ? 'bg-secondary text-on-secondary'
                    : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-on-surface-variant">
        {filteredStudents.length} of {students.length} waiting
      </div>

      {/* Card Grid */}
      {filteredStudents.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-on-surface-variant">
          <p>No students match your search</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredStudents.map((student) => (
            <WaitingStudentCard
              key={student.id}
              student={student}
              onEnroll={onEnrollStudent || (() => {})}
              onViewProfile={(id) => window.open(`/students/${id}`, '_blank')}
            />))}
        </div>
      )}
    </div>
  )
}
