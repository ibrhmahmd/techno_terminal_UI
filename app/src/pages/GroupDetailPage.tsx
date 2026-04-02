import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { TopNavbar } from '../components/dashboard/TopNavbar'
import { GroupHeader } from '../components/groups/GroupHeader'
import { TabNavigation } from '../components/groups/TabNavigation'
import { AttendanceGrid } from '../components/attendance/AttendanceGrid'
import { EditSessionPopup } from '../components/attendance/EditSessionPopup'
import { AddSessionModal } from '../components/groups/AddSessionModal'
import { ProgressSection } from '../components/groups/ProgressSection'
import { SuccessBanner } from '../components/common/SuccessBanner'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { 
  getGroupDetails, 
  getGroupSessions, 
  getGroupProgress, 
  updateSession,
  deleteSession,
  cancelSession,
  type Group, 
  type Session, 
  type ProgressLevel,
  type UpdateSessionInput
} from '../api/academics'

// Mock data for fallback
const MOCK_GROUP: Group = {
  id: '1',
  name: 'Robotics A',
  course_name: 'Robotics',
  instructor_name: 'Ali Mahmoud',
  student_count: 12,
  level: 1,
  schedule_time: 'Sat 15:00',
}

const MOCK_SESSIONS: Session[] = [
  { id: '1', group_id: '1', date: '2026-04-01', start_time: '15:00', end_time: '16:30', instructor_name: 'Ali Mahmoud', status: 'completed', attendance_marked: true, notes: 'Good session' },
  { id: '2', group_id: '1', date: '2026-04-08', start_time: '15:00', end_time: '16:30', instructor_name: 'Ali Mahmoud', status: 'scheduled', attendance_marked: false },
  { id: '3', group_id: '1', date: '2026-04-15', start_time: '15:00', end_time: '16:30', instructor_name: 'Ali Mahmoud', status: 'scheduled', attendance_marked: false },
  { id: '4', group_id: '1', date: '2026-04-22', start_time: '15:00', end_time: '16:30', instructor_name: 'Ali Mahmoud', status: 'scheduled', attendance_marked: false },
  { id: '5', group_id: '1', date: '2026-04-29', start_time: '15:00', end_time: '16:30', instructor_name: 'Ali Mahmoud', status: 'scheduled', attendance_marked: false },
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
  const groupId = id || '1'
  
  const [group, setGroup] = useState<Group | null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [progress, setProgress] = useState<ProgressLevel | null>(null)
  const [activeTab, setActiveTab] = useState<'roster' | 'attendance' | 'history'>('attendance')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Session management state
  const [editingSession, setEditingSession] = useState<Session | null>(null)
  const [isAddSessionModalOpen, setIsAddSessionModalOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

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

  const handleUpdateSession = async (sessionId: string, data: UpdateSessionInput) => {
    setIsProcessing(true)
    try {
      await updateSession(sessionId, data)
      // Refresh sessions list
      const updatedSessions = await getGroupSessions(groupId)
      setSessions(updatedSessions)
      setEditingSession(null)
      setError(null)
    } catch {
      setError('Failed to update session')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to delete this session?')) return
    setIsProcessing(true)
    try {
      await deleteSession(sessionId)
      // Refresh sessions list
      const updatedSessions = await getGroupSessions(groupId)
      setSessions(updatedSessions)
      setError(null)
    } catch {
      setError('Failed to delete session')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCancelSession = async (sessionId: string) => {
    setIsProcessing(true)
    try {
      await cancelSession(sessionId)
      // Refresh sessions list
      const updatedSessions = await getGroupSessions(groupId)
      setSessions(updatedSessions)
      setError(null)
    } catch {
      setError('Failed to cancel session')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleAddSession = async (newSession: Session) => {
    setSessions(prev => [...prev, newSession])
  }

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
              <div className="space-y-4">
                {/* Add Session Button */}
                <div className="flex justify-end">
                  <button
                    onClick={() => setIsAddSessionModalOpen(true)}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-secondary rounded-lg hover:bg-secondary/90 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">add</span>
                    Add Session
                  </button>
                </div>

                {/* Sessions List */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
                    <h3 className="font-semibold text-on-surface">Sessions ({sessions.length})</h3>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {sessions.map((session) => (
                      <div
                        key={session.id}
                        className="flex items-center justify-between px-6 py-4 hover:bg-slate-50"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col">
                            <span className="font-medium text-on-surface">{session.date}</span>
                            <span className="text-sm text-slate-500">
                              {session.start_time} - {session.end_time}
                            </span>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            session.status === 'completed' ? 'bg-green-100 text-green-700' :
                            session.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {session.status}
                          </span>
                          {session.attendance_marked && (
                            <span className="text-xs text-green-600 flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">check_circle</span>
                              Attendance marked
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingSession(session)}
                            className="p-2 text-slate-400 hover:text-secondary transition-colors"
                            title="Edit session"
                          >
                            <span className="material-symbols-outlined text-sm">edit</span>
                          </button>
                          {session.status === 'scheduled' && (
                            <button
                              onClick={() => handleCancelSession(session.id)}
                              disabled={isProcessing}
                              className="p-2 text-slate-400 hover:text-orange-500 transition-colors disabled:opacity-50"
                              title="Cancel session"
                            >
                              <span className="material-symbols-outlined text-sm">block</span>
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteSession(session.id)}
                            disabled={isProcessing}
                            className="p-2 text-slate-400 hover:text-red-500 transition-colors disabled:opacity-50"
                            title="Delete session"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
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

            {/* Edit Session Modal */}
            <EditSessionPopup
              session={editingSession}
              isOpen={!!editingSession}
              onClose={() => setEditingSession(null)}
              onSave={handleUpdateSession}
            />

            {/* Add Session Modal */}
            <AddSessionModal
              groupId={groupId}
              isOpen={isAddSessionModalOpen}
              onClose={() => setIsAddSessionModalOpen(false)}
              onAdded={handleAddSession}
            />
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
