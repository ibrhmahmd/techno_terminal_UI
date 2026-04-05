import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { TopNavbar } from '../components/dashboard/TopNavbar'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { Modal } from '../components/common/Modal'
import { GroupForm } from '../components/groups/GroupForm'
import { GroupHeader } from '../components/groups/GroupHeader'
import { EditSessionPopup } from '../components/attendance/EditSessionPopup'
import { AddSessionModal } from '../components/groups/AddSessionModal'
import { TabNavigation } from '../components/groups/TabNavigation'
import { SessionsList } from '../components/groups/SessionsList'
import { RosterTab } from '../components/groups/RosterTab'
import { AttendanceTab } from '../components/groups/AttendanceTab'
import { HistoryTab } from '../components/groups/HistoryTab'
import { ErrorBoundary } from '../components/common/ErrorBoundary'
import { 
  cancelSession,
  updateGroup,
  getEnrichedGroup,
  getGroupSessions,
  updateSession,
  deleteSession,
  type EnrichedGroupPublic,
  type Session, 
  type UpdateSessionDTO,
  type ScheduleGroupInput
} from '../api/academics'

/**
 * Custom hook to manage group detail data and logic
 */
function useGroupDetail(groupId: number) {
  const [group, setGroup] = useState<EnrichedGroupPublic | null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [groupData, sessionsData] = await Promise.all([
        getEnrichedGroup(groupId),
        getGroupSessions(groupId)
      ])
      setGroup(groupData)
      setSessions(sessionsData)
    } catch (err) {
      console.error('[useGroupDetail] loadData failed:', err)
      setError('Failed to load group details. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }, [groupId])

  useEffect(() => {
    loadData()
  }, [loadData])

  return {
    group,
    setGroup,
    sessions,
    setSessions,
    isLoading,
    error,
    refresh: loadData
  }
}

export function GroupDetailPage() {
  const { id } = useParams<{ id: string }>()
  const groupId = Number(id) || 1
  
  const {
    group,
    setGroup,
    sessions,
    setSessions,
    isLoading,
    error
  } = useGroupDetail(groupId)

  const [activeTab, setActiveTab] = useState<'roster' | 'attendance' | 'history'>('attendance')
  const [editingSession, setEditingSession] = useState<Session | null>(null)
  const [deletingSessionId, setDeletingSessionId] = useState<number | null>(null)
  const [isAddSessionModalOpen, setIsAddSessionModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [mutationError, setMutationError] = useState<string | null>(null)

  const handleUpdateSession = async (sessionId: number, data: UpdateSessionDTO) => {
    setIsProcessing(true)
    setMutationError(null)
    try {
      await updateSession(sessionId, data)
      const updatedSessions = await getGroupSessions(groupId)
      setSessions(updatedSessions)
      setEditingSession(null)
    } catch (err: unknown) {
      console.error('[GroupDetailPage] updateSession failed:', err)
      setMutationError('Failed to update session.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDeleteSession = async (sessionId: number) => {
    setIsProcessing(true)
    setMutationError(null)
    try {
      await deleteSession(sessionId)
      setSessions(prev => prev.filter(s => s.id !== sessionId))
      setDeletingSessionId(null)
    } catch (err: unknown) {
      console.error('[GroupDetailPage] deleteSession failed:', err)
      setMutationError('Failed to delete session.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCancelSession = async (sessionId: number) => {
    setIsProcessing(true)
    setMutationError(null)
    try {
      await cancelSession(sessionId)
      const updatedSessions = await getGroupSessions(groupId)
      setSessions(updatedSessions)
    } catch (err: unknown) {
      console.error('[GroupDetailPage] cancelSession failed:', err)
      setMutationError('Failed to cancel session.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleAddSession = (newSession: Session) => {
    setSessions(prev => [...prev, newSession])
  }

  const handleUpdateGroup = async (data: ScheduleGroupInput) => {
    setIsProcessing(true)
    setMutationError(null)
    try {
      const updated = await updateGroup(groupId, data)
      setGroup(prev => prev ? ({ ...prev, ...updated }) : (updated as Record<string, unknown>))
      setIsEditModalOpen(false)
    } catch (err: unknown) {
      console.error('[GroupDetailPage] updateGroup failed:', err)
      setMutationError('Failed to update group.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface">
      <TopNavbar activePage="Groups" />
      
      <div className="p-8 max-w-[1400px] mx-auto space-y-8">
        <ErrorBoundary>
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <div className="p-8 bg-red-50 border border-red-100 rounded-xl text-center">
              <span className="material-symbols-outlined text-4xl text-red-500 mb-2">error</span>
              <h2 className="text-xl font-bold text-red-800 mb-2">Error</h2>
              <p className="text-red-600">{error}</p>
            </div>
          ) : group ? (
            <>
              <GroupHeader 
                groupId={String(group.id)}
                name={group.name}
                scheduleTime={`${group.default_day} ${group.default_time_start}`}
                level={group.level_number}
                instructor={group.instructor_name || 'No Instructor'}
                enrollmentCount={0} // Standard Group doesn't return active count
                maxEnrollment={group.max_capacity}
                onEdit={() => setIsEditModalOpen(true)}
              />

              <TabNavigation 
                activeTab={activeTab}
                onTabChange={setActiveTab}
                sessionCount={sessions.length}
              />

              {mutationError && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700 flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">error</span>
                  {mutationError}
                </div>
              )}

              {activeTab === 'attendance' && (
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <button
                      onClick={() => setIsAddSessionModalOpen(true)}
                      className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-secondary rounded-lg hover:bg-secondary/90 transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">add</span>
                      Add Session
                    </button>
                  </div>

                  <SessionsList 
                    sessions={sessions}
                    deletingSessionId={deletingSessionId}
                    isProcessing={isProcessing}
                    onEdit={setEditingSession}
                    onCancel={handleCancelSession}
                    onDeleteRequest={setDeletingSessionId}
                    onDeleteConfirm={handleDeleteSession}
                    onDeleteCancel={() => setDeletingSessionId(null)}
                  />
                </div>
              )}

              {activeTab === 'roster' && (
                <RosterTab 
                  students={group.students || []}
                  maxCapacity={group.max_capacity}
                  isLoading={isLoading}
                />
              )}
              {activeTab === 'attendance' && (
                <AttendanceTab 
                  sessions={sessions}
                  students={group.students?.map(s => ({ id: s.id, full_name: s.full_name })) || []}
                  isLoading={isLoading}
                />
              )}
              {activeTab === 'history' && (
                <HistoryTab 
                  sessions={sessions}
                  isLoading={isLoading}
                />
              )}

              <EditSessionPopup
                session={editingSession}
                isOpen={!!editingSession}
                onClose={() => setEditingSession(null)}
                onSave={handleUpdateSession}
              />

              <AddSessionModal
                groupId={Number(groupId)}
                levelNumber={group?.level_number || 1}
                isOpen={isAddSessionModalOpen}
                onClose={() => setIsAddSessionModalOpen(false)}
                onAdded={handleAddSession}
              />

              <Modal 
                isOpen={isEditModalOpen} 
                onClose={() => setIsEditModalOpen(false)} 
                title="Edit Group"
              >
                <GroupForm 
                  mode="edit"
                  initialData={{
                    course_id: group.course_id,
                    instructor_id: group.instructor_id,
                    max_capacity: group.max_capacity,
                    default_day: group.default_day,
                    default_time_start: group.default_time_start,
                    default_time_end: group.default_time_end,
                    notes: '',
                  }}
                  onSubmit={handleUpdateGroup}
                  onCancel={() => setIsEditModalOpen(false)}
                />
              </Modal>
            </>
          ) : (
            <div className="p-12 text-center text-on-surface-variant">
              <p>Group not found</p>
            </div>
          )}
        </ErrorBoundary>
      </div>
    </div>
  )
}
