import { useState, useEffect, useMemo } from 'react'
import { type Session } from '../api/academics'
import { useDashboard } from '../hooks/dashboard'
import { TopNavbar } from '../components/dashboard/TopNavbar'
import { DashboardHeader } from '../components/dashboard/DashboardHeader'
import { DaySelectorBar } from '../components/dashboard/DaySelectorBar'
import { InstructorSelectorBar } from '../components/dashboard/InstructorSelectorBar'
import { GroupSessionCard } from '../components/dashboard/GroupSessionCard'
import { QuickActionsGrid } from '../components/dashboard/QuickActionsGrid'
import { LoadingSpinner } from '../components/common/LoadingSpinner'

import { getTodayISO } from '../utils/formatting'

export function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState(getTodayISO)
  const [selectedInstructor, setSelectedInstructor] = useState<string | null>(null)

  const { scheduleItems, enrichedGroups, groupSessions, isLoading, error } = useDashboard(selectedDate)

  // Reset instructor filter when date changes
  useEffect(() => {
    setSelectedInstructor(null)
  }, [selectedDate])

  // Extract unique instructors from enriched groups (exclude TBA)
  const uniqueInstructors = useMemo(() => {
    const instructors = new Set<string>()
    enrichedGroups.forEach(g => {
      if (g.instructor_name && g.instructor_name !== 'TBA') {
        instructors.add(g.instructor_name)
      }
    })
    return Array.from(instructors)
  }, [enrichedGroups])

  // Filter schedule items by selected instructor
  const filteredScheduleItems = useMemo(() => {
    if (!selectedInstructor) return scheduleItems

    return scheduleItems.filter(item => {
      const group = enrichedGroups.find(g => g.id === item.group_id)
      return group?.instructor_name === selectedInstructor
    })
  }, [scheduleItems, enrichedGroups, selectedInstructor])

  const getSessionsForGroup = (groupId: number): Session[] => {
    return groupSessions[groupId] || []
  }

  const getEnrichedData = (groupId: number) => {
    return enrichedGroups.find(g => g.id === groupId)
  }

  return (
    <div className="min-h-screen bg-surface">
      <TopNavbar activePage="Dashboard" />
      
      <div className="p-10 flex-1 space-y-8">
        <DashboardHeader
          title="System Overview"
          subtitle="Real-time status of active groups and attendance tracking."
          showTime
        />
        <QuickActionsGrid todaySessionCount={scheduleItems.length} />
        <DaySelectorBar selectedDate={selectedDate} onSelectDate={setSelectedDate} />
        <InstructorSelectorBar
          instructors={uniqueInstructors}
          selectedInstructor={selectedInstructor}
          onSelectInstructor={setSelectedInstructor}
          disabled={isLoading}
        />

        {isLoading ? (
          <LoadingSpinner />
        ) : error ? (
          <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <span className="material-symbols-outlined">error</span>
            <span>{error}</span>
          </div>
        ) : (
          <div className="flex flex-col gap-8 pb-20">
            {filteredScheduleItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-16 text-on-surface-variant bg-white rounded-lg border border-slate-200">
                <span className="material-symbols-outlined text-5xl mb-4 opacity-50">event_busy</span>
                <p>No groups scheduled for this day</p>
              </div>
            ) : (
              filteredScheduleItems.map((item, index) => {
                const enriched = getEnrichedData(item.group_id)
                const isLast = index === filteredScheduleItems.length - 1
                return (
                  <div
                    key={`group-${item.group_id}-${index}`}
                    className={`relative ${!isLast ? 'pb-8 border-b-2 border-slate-200' : ''}`}
                  >
                    <GroupSessionCard
                      groupName={item.group_name}
                      courseName={item.course_name}
                      instructorName={enriched?.instructor_name || 'TBA'}
                      sessions={getSessionsForGroup(item.group_id)}
                      groupId={item.group_id}
                      level={item.level_number}
                    />
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>
    </div>
  )
}
