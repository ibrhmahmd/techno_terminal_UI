import { useState, useEffect } from 'react'
import { getDailySchedule, type DailySchedule, type Session } from '../api/academics'
import { TopNavbar } from '../components/dashboard/TopNavbar'
import { DashboardHeader } from '../components/dashboard/DashboardHeader'
import { DaySelectorBar } from '../components/dashboard/DaySelectorBar'
import { GroupSessionCard } from '../components/dashboard/GroupSessionCard'
import { LoadingSpinner } from '../components/common/LoadingSpinner'

// Mock data for testing when API is unavailable
const MOCK_DATA: DailySchedule = {
  date: new Date().toISOString().split('T')[0],
  groups: [
    {
      id: 1,
      name: 'Robotics A - Saturday',
      course_name: 'Robotics',
      instructor_name: 'Ahmed Hassan',
      student_count: 12,
    },
    {
      id: 2,
      name: 'Coding B - Sunday',
      course_name: 'Coding',
      instructor_name: 'Sara Mohamed',
      student_count: 8,
    },
    {
      id: 3,
      name: 'Electronics A - Monday',
      course_name: 'Electronics',
      instructor_name: 'Omar Khalid',
      student_count: 15,
    },
  ],
  sessions: [
    {
      id: 1,
      group_id: 1,
      date: new Date().toISOString().split('T')[0],
      start_time: '10:00',
      end_time: '12:00',
      instructor_name: 'Ahmed Hassan',
      status: 'scheduled',
      attendance_marked: false,
    },
    {
      id: 2,
      group_id: 2,
      date: new Date().toISOString().split('T')[0],
      start_time: '14:00',
      end_time: '16:00',
      instructor_name: 'Sara Mohamed',
      status: 'scheduled',
      attendance_marked: true,
    },
    {
      id: 3,
      group_id: 3,
      date: new Date().toISOString().split('T')[0],
      start_time: '09:00',
      end_time: '11:00',
      instructor_name: 'Omar Khalid',
      status: 'scheduled',
      attendance_marked: false,
    },
  ],
}

export function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split('T')[0]
  })
  const [schedule, setSchedule] = useState<DailySchedule | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [useMockData, setUseMockData] = useState(false)

  useEffect(() => {
    async function loadSchedule() {
      setIsLoading(true)
      setError(null)
      try {
        const data = await getDailySchedule(selectedDate)
        setSchedule(data)
        setUseMockData(false)
      } catch (err) {
        console.error('API Error:', err)
        setError('API not available. Showing mock data for testing.')
        setSchedule(MOCK_DATA)
        setUseMockData(true)
      } finally {
        setIsLoading(false)
      }
    }
    loadSchedule()
  }, [selectedDate])

  const getSessionsForGroup = (groupId: number): Session[] => {
    if (!schedule) return []
    return schedule.sessions.filter((s) => s.group_id === groupId)
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
        ) : (
          <>
            {useMockData && (
              <div className="flex items-center gap-2 p-3 px-4 bg-amber-100 border border-amber-300 rounded-lg mb-6 text-sm text-amber-800">
                <span className="material-symbols-outlined text-xl">info</span>
                <span>{error}</span>
              </div>
            )}

            <div className="flex flex-col gap-6 pb-20">
              {schedule?.groups?.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-16 text-on-surface-variant bg-white rounded-lg border border-slate-200">
                  <span className="material-symbols-outlined text-5xl mb-4 opacity-50">event_busy</span>
                  <p>No groups scheduled for this day</p>
                </div>
              ) : (
                schedule?.groups?.map((group) => (
                  <GroupSessionCard
                    key={group.id}
                    group={group}
                    sessions={getSessionsForGroup(group.id)}
                    selectedDate={selectedDate}
                  />
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
