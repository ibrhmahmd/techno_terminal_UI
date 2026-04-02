import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { TopNavbar } from '../components/dashboard/TopNavbar'
import { GroupHeader } from '../components/groups/GroupHeader'
import { TabNavigation } from '../components/groups/TabNavigation'
import { AttendanceGrid } from '../components/attendance/AttendanceGrid'
import { ProgressSection } from '../components/groups/ProgressSection'
import { SuccessBanner } from '../components/common/SuccessBanner'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { getGroupDetails, getGroupSessions, getGroupProgress, type Group, type Session, type ProgressLevel } from '../api/academics'

// Mock data for fallback
const MOCK_GROUP: Group = {
  id: 1,
  name: 'Robotics A',
  course_name: 'Robotics',
  instructor_name: 'Ali Mahmoud',
  student_count: 12,
  level: 1,
  schedule_time: 'Sat 15:00',
}

const MOCK_SESSIONS: Session[] = [
  { id: 1, group_id: 1, date: '2026-04-01', start_time: '15:00', end_time: '16:30', instructor_name: 'Ali Mahmoud', status: 'completed', attendance_marked: true, notes: 'Good session' },
  { id: 2, group_id: 1, date: '2026-04-08', start_time: '15:00', end_time: '16:30', instructor_name: 'Ali Mahmoud', status: 'scheduled', attendance_marked: false },
  { id: 3, group_id: 1, date: '2026-04-15', start_time: '15:00', end_time: '16:30', instructor_name: 'Ali Mahmoud', status: 'scheduled', attendance_marked: false },
  { id: 4, group_id: 1, date: '2026-04-22', start_time: '15:00', end_time: '16:30', instructor_name: 'Ali Mahmoud', status: 'scheduled', attendance_marked: false },
  { id: 5, group_id: 1, date: '2026-04-29', start_time: '15:00', end_time: '16:30', instructor_name: 'Ali Mahmoud', status: 'scheduled', attendance_marked: false },
]

const MOCK_PROGRESS: ProgressLevel = {
  current_module: 'Mechanical Linkages Progress',
  description: '3D spatial reasoning through assembly. 80% completion across group benchmarks.',
  group_score: 80,
  target_score: 100,
  is_completed: true,
  ready_for_next_level: true,
}

export function GroupDetailPage() {
  const { id } = useParams<{ id: string }>()
  const groupId = parseInt(id || '1', 10)
  
  const [group, setGroup] = useState<Group | null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [progress, setProgress] = useState<ProgressLevel | null>(null)
  const [activeTab, setActiveTab] = useState<'roster' | 'attendance' | 'history'>('attendance')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadGroupData() {
      setIsLoading(true)
      setError(null)
      try {
        const [groupData, sessionsData, progressData] = await Promise.all([
          getGroupDetails(groupId),
          getGroupSessions(groupId),
          getGroupProgress(groupId),
        ])
        setGroup(groupData)
        setSessions(sessionsData)
        setProgress(progressData)
      } catch (err) {
        console.error('API Error:', err)
        setError('API not available. Showing mock data.')
        setGroup(MOCK_GROUP)
        setSessions(MOCK_SESSIONS)
        setProgress(MOCK_PROGRESS)
      } finally {
        setIsLoading(false)
      }
    }
    loadGroupData()
  }, [groupId])

  return (
    <div className="min-h-screen bg-surface">
      <TopNavbar activePage="Groups" />
      
      <div className="p-8 space-y-8">
        {/* Success Banner */}
        {progress?.ready_for_next_level && (
          <SuccessBanner 
            message={`Level ${group?.level} Complete. Ready for Level ${(group?.level || 0) + 1} progression and billing generation.`}
            actionText="Proceed"
            onAction={() => console.log('Proceed to next level')}
          />
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner />
          </div>
        ) : group ? (
          <>
            {/* Group Header */}
            <GroupHeader 
              name={group.name}
              scheduleTime={group.schedule_time || 'Sat 15:00'}
              level={group.level || 1}
              instructor={group.instructor_name}
              enrollmentCount={group.student_count}
              maxEnrollment={12}
            />

            {/* Tab Navigation */}
            <TabNavigation 
              activeTab={activeTab}
              onTabChange={setActiveTab}
              sessionCount={sessions.length}
            />

            {/* Tab Content */}
            {activeTab === 'attendance' && (
              <AttendanceGrid sessions={sessions} />
            )}

            {activeTab === 'roster' && (
              <div className="p-12 text-center text-on-surface-variant bg-surface-container-low rounded-lg">
                <span className="material-symbols-outlined text-4xl mb-3 opacity-50">people</span>
                <p>Roster view coming soon</p>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="p-12 text-center text-on-surface-variant bg-surface-container-low rounded-lg">
                <span className="material-symbols-outlined text-4xl mb-3 opacity-50">history</span>
                <p>History view coming soon</p>
              </div>
            )}

            {/* Progress Section */}
            {progress && (
              <ProgressSection progress={progress} />
            )}
          </>
        ) : (
          <div className="p-12 text-center text-on-surface-variant">
            <p>Group not found</p>
          </div>
        )}
      </div>
    </div>
  )
}
