import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useDashboard } from '../hooks/dashboard'
import { TopNavbar } from '../components/dashboard/TopNavbar'
import { DaySelectorBar } from '../components/dashboard/DaySelectorBar'
import { InstructorSelectorBar } from '../components/dashboard/InstructorSelectorBar'
import { GroupSessionCard } from '../components/dashboard/GroupSessionCard'
import { QuickActionsGrid } from '../components/dashboard/QuickActionsGrid'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { MobileTopBar } from '../components/layout/MobileTopBar'
import { MobileGroupCard } from '../components/dashboard/MobileGroupCard'
import { MobileDashboardFAB } from '../components/dashboard/MobileDashboardFAB'
import { AttendanceMobileSheet } from '../components/attendance/AttendanceMobileSheet'
import { useIsMobile } from '../hooks/useIsMobile'

import { getTodayISO } from '../utils/formatting'

export function DashboardPage() {
  const isMobile = useIsMobile()
  const { t } = useTranslation('dashboard')
  const [openGroupId, setOpenGroupId] = useState<number | null>(null)
  
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
      {isMobile ? (
        <>
          <MobileTopBar title={t('page_title')} />
          <main className="p-4 flex-1 space-y-6">
            <DaySelectorBar selectedDate={selectedDate} onSelectDate={setSelectedDate} />
            <InstructorSelectorBar
              instructors={uniqueInstructors}
              selectedInstructor={selectedInstructor}
              onSelectInstructor={setSelectedInstructor}
              disabled={isLoading}
            />

            {isLoading ? (
              <div role="status" aria-live="polite">
                <LoadingSpinner />
              </div>
            ) : error ? (
              <div role="alert" className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <span className="material-symbols-outlined" aria-hidden="true">error</span>
                <span>{error}</span>
              </div>
            ) : (
              <section aria-label={t('scheduled_groups')} className="flex flex-col gap-4 pb-24">
                {filteredScheduleItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-10 text-slate-500 bg-white rounded-xl border border-slate-200">
                    <span className="material-symbols-outlined text-4xl mb-3 opacity-50" aria-hidden="true">event_busy</span>
                    <p className="text-sm">{t('empty.no_groups')}</p>
                  </div>
                ) : (
                  filteredScheduleItems.map((item, index) => {
                    const group = getGroupInfo(item.group_id)
                    if (!group) return null
                    
                    return (
                      <MobileGroupCard
                        key={`mobile-group-${item.group_id}-${index}`}
                        group={group}
                        instructorName={group.instructor_id ? instructors[group.instructor_id]?.name || t('fallbacks.tba') : t('fallbacks.tba')}
                        onOpenAttendance={() => setOpenGroupId(item.group_id)}
                      />
                    )
                  })
                )}
              </section>
            )}
          </main>
          <MobileDashboardFAB />
          {(() => {
            const groupInfo = openGroupId ? getGroupInfo(openGroupId) : undefined
            if (!groupInfo || !openGroupId) return null
            const groupInstructorId = groupInfo.instructor_id
            return (
              <AttendanceMobileSheet
              isOpen={true}
              groupId={openGroupId}
              groupName={groupInfo.name || t('fallbacks.unknown_group')}
              instructorName={
                groupInstructorId
                  ? instructors[groupInstructorId]?.name || t('fallbacks.tba')
                  : t('fallbacks.tba')
              }
              sessions={getGroupData(openGroupId).sessions}
              roster={getGroupData(openGroupId).roster}
              selectedDate={selectedDate}
              onClose={() => setOpenGroupId(null)}
            />
            )
          })()}
        </>
      ) : (
        <>
          <TopNavbar activePage={t('page_title')} />
          
          <main className="p-10 flex-1 space-y-8">
            <QuickActionsGrid todaySessionCount={scheduleItems.length} />
            <DaySelectorBar selectedDate={selectedDate} onSelectDate={setSelectedDate} />
            <InstructorSelectorBar
              instructors={uniqueInstructors}
              selectedInstructor={selectedInstructor}
              onSelectInstructor={setSelectedInstructor}
              disabled={isLoading}
            />

            {isLoading ? (
              <div role="status" aria-live="polite">
                <LoadingSpinner />
              </div>
            ) : error ? (
              <div role="alert" className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <span className="material-symbols-outlined" aria-hidden="true">error</span>
                <span>{error}</span>
              </div>
            ) : (
              <section aria-label={t('scheduled_groups')} className="flex flex-col gap-8 pb-20">
                {filteredScheduleItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-16 text-on-surface-variant bg-white rounded-lg border border-slate-200">
                    <span className="material-symbols-outlined text-5xl mb-4 opacity-50" aria-hidden="true">event_busy</span>
                    <p>{t('empty.no_groups_today')}</p>
                  </div>
              ) : (
                filteredScheduleItems.map((item, index) => {
                  const group = getGroupInfo(item.group_id)
                  const groupData = getGroupData(item.group_id)
                  const isLast = index === filteredScheduleItems.length - 1
                  return (
                    <article
                      key={`group-${item.group_id}-${index}`}
                      className={`relative ${!isLast ? 'pb-8 border-b-2 border-slate-200' : ''}`}
                    >
                        <GroupSessionCard
                          groupName={group?.name || t('fallbacks.unknown_group')}
                          courseName={group?.course_name || t('fallbacks.unknown_course')}
                          instructorName={group?.instructor_id ? instructors[group.instructor_id]?.name || t('fallbacks.tba') : t('fallbacks.tba')}
                          sessions={groupData.sessions}
                          roster={groupData.roster}
                          groupId={item.group_id}
                          level={item.current_level?.level_number ?? 0}
                          selectedDate={selectedDate}
                        />
                      </article>
                    )
                  })
                )}
              </section>
            )}
          </main>
        </>
      )}
    </div>
  )
}
