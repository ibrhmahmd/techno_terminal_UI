import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { TopNavbar } from '../components/dashboard/TopNavbar'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { TabNavigation } from '../components/groups/TabNavigation'
import { AttendanceTab } from '../components/groups/AttendanceTab'
import { HistoryTab } from '../components/groups/history/HistoryTab'
import { GroupInfoCard } from '../components/groups/detail/GroupInfoCard'
import { LevelSelector } from '../components/groups/detail/LevelSelector'
import { LevelInfoPanel } from '../components/groups/detail/LevelInfoPanel'
import { GroupPricingCard } from '../components/groups/detail/GroupPricingCard'
import { EditGroupDialog } from '../components/groups/detail/EditGroupDialog'
import { SessionsList } from '../components/groups/SessionsList'
import { ErrorBoundary } from '../components/common/ErrorBoundary'
import { useGroupDetail } from '../hooks/useGroupDetail'
import { useGroupHistory } from '../hooks/useGroupHistory'
import { useGroupMutations } from '../hooks/useGroupMutations'
import { useToast } from '../components/common/Toast'
import { reactivateSession, cancelSession, deleteSession } from '../api/academics'
import type { UpdateGroupDTO } from '../api/academics'

export function GroupDetailPage() {
  const { id } = useParams<{ id: string }>()
  const groupId = Number(id) || 0
  const { showToast } = useToast()

  const [activeTab, setActiveTab] = useState<'info' | 'attendance' | 'history'>('info')
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  
  // Session management state
  const [isProcessingSession, setIsProcessingSession] = useState(false)
  const [deletingSessionId, setDeletingSessionId] = useState<number | null>(null)

  const {
    group,
    levels,
    currentLevel,
    sessions,
    isLoading,
    error,
    refresh,
    setActiveLevel,
    activeLevelId,
  } = useGroupDetail(groupId)

  const {
    enrollmentHistory,
    competitions,
    instructorHistory,
    isLoading: isHistoryLoading,
    pagination,
    setEnrollmentPage,
  } = useGroupHistory(groupId)

  const { updateGroup, deleteGroup, levelUp, error: mutationError } = useGroupMutations(groupId)

  const handleUpdateGroup = async (data: UpdateGroupDTO & { name?: string; notes?: string; status?: 'active' | 'inactive' | 'archived' }) => {
    try {
      await updateGroup(data)
      showToast('Group updated successfully', 'success')
      await refresh()
      setIsEditDialogOpen(false)
    } catch {
      showToast(mutationError || 'Failed to update group', 'error')
    }
  }

  const handleDeleteGroup = async () => {
    try {
      await deleteGroup()
      showToast('Group deleted successfully', 'success')
      window.location.href = '/groups'
    } catch {
      showToast(mutationError || 'Failed to delete group', 'error')
      setIsDeleteDialogOpen(false)
    }
  }

  const handleLevelUp = async () => {
    try {
      await levelUp()
      showToast('Group leveled up successfully', 'success')
      await refresh()
    } catch {
      showToast(mutationError || 'Failed to level up group', 'error')
    }
  }

  // Session handlers
  const handleCancelSession = async (sessionId: number) => {
    setIsProcessingSession(true)
    try {
      await cancelSession(sessionId)
      showToast('Session cancelled successfully', 'success')
      await refresh()
    } catch (err: any) {
      showToast(err.message || 'Failed to cancel session', 'error')
    } finally {
      setIsProcessingSession(false)
    }
  }

  const handleReactivateSession = async (sessionId: number) => {
    setIsProcessingSession(true)
    try {
      await reactivateSession(sessionId)
      showToast('Session reactivated successfully', 'success')
      await refresh()
    } catch (err: any) {
      showToast(err.message || 'Failed to reactivate session', 'error')
    } finally {
      setIsProcessingSession(false)
    }
  }

  const handleDeleteSession = async (sessionId: number) => {
    setIsProcessingSession(true)
    try {
      await deleteSession(sessionId)
      showToast('Session deleted successfully', 'success')
      await refresh()
    } catch (err: any) {
      showToast(err.message || 'Failed to delete session', 'error')
    } finally {
      setIsProcessingSession(false)
      setDeletingSessionId(null)
    }
  }

  const buildPricingHistory = () => {
    if (!levels.length) return []
    return levels.map((level) => ({
      levelNumber: level.level_number,
      dateRange: { start: level.start_date, end: level.end_date },
      monthlyFee: level.pricing_snapshot.monthly_fee,
      sessionFee: level.pricing_snapshot.session_fee,
      isActive: !level.end_date,
    }))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface">
        <TopNavbar activePage="Groups" />
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-surface">
        <TopNavbar activePage="Groups" />
        <div className="p-8 max-w-[1400px] mx-auto">
          <div className="p-8 bg-red-50 border border-red-100 rounded-xl text-center">
            <span className="material-symbols-outlined text-4xl text-red-500 mb-2">error</span>
            <h2 className="text-xl font-bold text-red-800 mb-2">Error</h2>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-surface">
        <TopNavbar activePage="Groups" />
        <div className="p-8 max-w-[1400px] mx-auto">
          <div className="p-12 text-center text-on-surface-variant">
            <p>Group not found</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface">
      <TopNavbar activePage="Groups" />

      <div className="p-4 md:p-8 max-w-[1400px] mx-auto space-y-6">
        <ErrorBoundary>
          <GroupInfoCard
            group={group}
            currentLevel={currentLevel}
            onEdit={() => setIsEditDialogOpen(true)}
            onDelete={() => setIsDeleteDialogOpen(true)}
            onLevelUp={handleLevelUp}
            canLevelUp={currentLevel?.completion_rate === 100}
          />

          <TabNavigation
            activeTab={activeTab}
            onTabChange={setActiveTab}
            sessionCount={sessions.length}
          />

          {activeTab === 'info' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <LevelSelector
                  levels={levels}
                  activeLevelId={activeLevelId}
                  onLevelChange={setActiveLevel}
                  currentLevelNumber={group.level_number}
                />
                <LevelInfoPanel
                  level={currentLevel}
                  isActiveLevel={currentLevel?.level_number === group.level_number}
                  attendanceStats={{
                    completedSessions: sessions.filter((s) => s.status === 'completed').length,
                    totalSessions: sessions.length,
                    averageAttendance: 85,
                  }}
                />
                <SessionsList
                  sessions={sessions}
                  deletingSessionId={deletingSessionId}
                  isProcessing={isProcessingSession}
                  onCancel={handleCancelSession}
                  onReactivate={handleReactivateSession}
                  onDeleteRequest={setDeletingSessionId}
                  onDeleteConfirm={handleDeleteSession}
                  onDeleteCancel={() => setDeletingSessionId(null)}
                />
              </div>
              <div className="space-y-6">
                <GroupPricingCard
                  pricingHistory={buildPricingHistory()}
                  currency={currentLevel?.pricing_snapshot.currency || 'EGP'}
                />
              </div>
            </div>
          )}

          {activeTab === 'attendance' && (
            <AttendanceTab
              sessions={sessions}
              students={group.students?.map((s) => ({ id: s.id, full_name: s.full_name })) || []}
              isLoading={isLoading}
            />
          )}

          {activeTab === 'history' && (
            <HistoryTab
              enrollmentHistory={enrollmentHistory}
              competitions={competitions}
              instructorHistory={instructorHistory}
              isLoading={isHistoryLoading}
              totalEnrollment={pagination.enrollment.total}
              onEnrollmentPageChange={setEnrollmentPage}
              enrollmentSkip={pagination.enrollment.skip}
              enrollmentLimit={pagination.enrollment.limit}
            />
          )}

          <EditGroupDialog
            isOpen={isEditDialogOpen}
            group={group}
            onClose={() => setIsEditDialogOpen(false)}
            onSave={handleUpdateGroup}
          />

          <ConfirmDialog
            isOpen={isDeleteDialogOpen}
            onCancel={() => setIsDeleteDialogOpen(false)}
            onConfirm={handleDeleteGroup}
            title="Delete Group"
            message="Are you sure you want to delete this group? This action cannot be undone."
            confirmText="Delete"
            variant="danger"
          />
        </ErrorBoundary>
      </div>
    </div>
  )
}
