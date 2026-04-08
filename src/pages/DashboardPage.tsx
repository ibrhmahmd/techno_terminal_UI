import { useState, useEffect } from 'react'
import { getDailySchedule, getGroupSessions, getEnrichedGroups, type DailyScheduleItem, type Session, type EnrichedGroupPublic } from '../api/academics'
import { TopNavbar } from '../components/dashboard/TopNavbar'
import { DashboardHeader } from '../components/dashboard/DashboardHeader'
import { DaySelectorBar } from '../components/dashboard/DaySelectorBar'
import { GroupSessionCard } from '../components/dashboard/GroupSessionCard'
import { LoadingSpinner } from '../components/common/LoadingSpinner'

import { getTodayISO } from '../utils/formatting'

export function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState(getTodayISO)
  const [scheduleItems, setScheduleItems] = useState<DailyScheduleItem[]>([])
  const [enrichedGroups, setEnrichedGroups] = useState<EnrichedGroupPublic[]>([])
  const [groupSessions, setGroupSessions] = useState<Record<number, Session[]>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      setError(null)
      try {
        const [items, groups] = await Promise.all([
          getDailySchedule(selectedDate),
          getEnrichedGroups()
        ])
        
        setScheduleItems(items)
        setEnrichedGroups(groups)
        
        // Fetch up to 5 sessions for each group in the schedule
        const uniqueGroupIds = Array.from(new Set(items.map(item => item.group_id)))
        const sessionsMap: Record<number, Session[]> = {}
        
        await Promise.all(
          uniqueGroupIds.map(async (groupId) => {
            try {
              const sessions = await getGroupSessions(groupId)
              const sortedSessions = sessions
                .sort((a, b) => new Date(a.session_date).getTime() - new Date(b.session_date).getTime())
                .slice(0, 5)
              sessionsMap[groupId] = sortedSessions
            } catch {
              sessionsMap[groupId] = []
            }
          })
        )
        setGroupSessions(sessionsMap)
      } catch (err) {
        console.error('Data Load Error:', err)
        setError('Failed to load dashboard data. Please check your connection and try again.')
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [selectedDate])

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
        <DaySelectorBar selectedDate={selectedDate} onSelectDate={setSelectedDate} />

        {isLoading ? (
          <LoadingSpinner />
        ) : error ? (
          <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <span className="material-symbols-outlined">error</span>
            <span>{error}</span>
          </div>
        ) : (
          <div className="flex flex-col gap-6 pb-20">
            {scheduleItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-16 text-on-surface-variant bg-white rounded-lg border border-slate-200">
                <span className="material-symbols-outlined text-5xl mb-4 opacity-50">event_busy</span>
                <p>No groups scheduled for this day</p>
              </div>
            ) : (
              scheduleItems.map((item, index) => {
                const enriched = getEnrichedData(item.group_id)
                return (
                  <GroupSessionCard
                    key={`group-${item.group_id}-${index}`}
                    groupName={item.group_name}
                    courseName={item.course_name}
                    instructorName={enriched?.instructor_name || 'TBA'}
                    sessions={getSessionsForGroup(item.group_id)}
                    groupId={item.group_id}
                    level={item.level_number}
                  />
                )
              })
            )}
          </div>
        )}
      </div>
    </div>
  )
}
