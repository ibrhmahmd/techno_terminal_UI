import { useState, useEffect, useMemo } from 'react'
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

  const { scheduleItems, groups, instructors, summary, isLoading, error } = useDashboard(selectedDate)

  // Reset instructor filter when date changes
  useEffect(() => {
    setSelectedInstructor(null)
  }, [selectedDate])

  // Extract unique instructors from summary (exclude TBA)
  const uniqueInstructors = useMemo(() => {
    if (!summary?.unique_instructor_ids) return []
    return summary.unique_instructor_ids
      .map(id => instructors[id])
      .filter(i => i && i.name !== 'TBA')
      .map(i => i.name)
  }, [instructors, summary])

  // Filter schedule items by selected instructor
  const filteredScheduleItems = useMemo(() => {
    if (!selectedInstructor) return scheduleItems

    return scheduleItems.filter(item => {
      const group = groups[item.group_id]
      if (!group?.instructor_id) return false
      const instructor = instructors[group.instructor_id]
      return instructor?.name === selectedInstructor
    })
  }, [scheduleItems, groups, instructors, selectedInstructor])

  const getGroupData = (groupId: number) => {
    const scheduledGroup = scheduleItems.find(sg => sg.group_id === groupId)
    return {
      sessions: scheduledGroup?.current_level?.sessions ?? [],
      roster: scheduledGroup?.roster ?? []
    }
  }

  const getGroupInfo = (groupId: number) => {
    return groups[groupId]
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
                const group = getGroupInfo(item.group_id)
                const groupData = getGroupData(item.group_id)
                const isLast = index === filteredScheduleItems.length - 1
                return (
                  <div
                    key={`group-${item.group_id}-${index}`}
                    className={`relative ${!isLast ? 'pb-8 border-b-2 border-slate-200' : ''}`}
                  >
                    <GroupSessionCard
                      groupName={group?.name || 'Unknown Group'}
                      courseName={group?.course_name || 'Unknown Course'}
                      instructorName={group?.instructor_id ? instructors[group.instructor_id]?.name || 'TBA' : 'TBA'}
                      sessions={groupData.sessions}
                      roster={groupData.roster}
                      groupId={item.group_id}
                      level={item.current_level.level_number}
                      selectedDate={selectedDate}
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
