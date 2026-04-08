import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { TopNavbar } from '../components/dashboard/TopNavbar'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { TabNavigation } from '../components/groups/TabNavigation'
import { AttendanceTab } from '../components/groups/AttendanceTab'
import { StudentsTab } from '../components/groups/StudentsTab'
import { HistoryTab } from '../components/groups/history/HistoryTab'
import { GroupInfoCard } from '../components/groups/detail/GroupInfoCard'
import { EditGroupDialog } from '../components/groups/detail/EditGroupDialog'
import { ErrorBoundary } from '../components/common/ErrorBoundary'
import { useGroupDetail } from '../hooks/useGroupDetail'
import { useGroupHistory } from '../hooks/useGroupHistory'
import { useGroupMutations } from '../hooks/useGroupMutations'
import { useToast } from '../components/common/Toast'
import type { UpdateGroupDTO } from '../api/academics'

export function GroupDetailPage() {
  const { id } = useParams<{ id: string }>()
  const groupId = Number(id) || 0
  const { showToast } = useToast()

  const [activeTab, setActiveTab] = useState<'attendance' | 'students' | 'history'>('attendance')
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false)
  const [isSavingNotes, setIsSavingNotes] = useState(false)

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

  const { 
    updateGroup, 
    deleteGroup, 
    archiveGroup,
    levelUp, 
    createNewLevel,
    error: mutationError 
  } = useGroupMutations(groupId)

  // Calculate current level enrollment count from levels data
  const currentLevelEnrollmentCount = currentLevel?.enrollment_count_start || 0

  // Build courses history from levels
  const coursesHistory = levels.map(level => ({
    level_number: level.level_number,
    course_name: group?.course_name || 'Unknown Course',
    start_date: level.start_date,
    end_date: level.end_date,
  }))

  const handleUpdateGroup = async (data: UpdateGroupDTO & { notes?: string; status?: 'active' | 'inactive' | 'archived' }) => {
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

  const handleArchiveGroup = async () => {
    try {
      await archiveGroup()
      showToast('Group archived successfully', 'success')
      await refresh()
      setIsArchiveDialogOpen(false)
    } catch {
      showToast(mutationError || 'Failed to archive group', 'error')
      setIsArchiveDialogOpen(false)
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

  const handleCreateNewLevel = async () => {
    console.log('[DEBUG] handleCreateNewLevel called')
    console.log('[DEBUG] currentLevel:', currentLevel)
    if (!currentLevel) {
      console.error('[DEBUG] No current level, cannot create new level')
      return
    }
    try {
      console.log('[DEBUG] Calling createNewLevel with:', {
        level_number: currentLevel.level_number + 1,
        pricing_snapshot: currentLevel.pricing_snapshot,
      })
      await createNewLevel({
        level_number: currentLevel.level_number + 1,
        pricing_snapshot: currentLevel.pricing_snapshot,
      })
      showToast('New level created successfully', 'success')
      await refresh()
    } catch (err: any) {
      console.error('[DEBUG] createNewLevel failed:', err)
      showToast(mutationError || 'Failed to create new level', 'error')
    }
  }

  const handleNotesChange = async (notes: string) => {
    setIsSavingNotes(true)
    try {
      await updateGroup({ notes } as UpdateGroupDTO)
    } catch {
      // Error handled by mutation hook
    } finally {
      setIsSavingNotes(false)
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
            currentLevelEnrollmentCount={currentLevelEnrollmentCount}
            onEdit={() => setIsEditDialogOpen(true)}
            onDelete={() => setIsDeleteDialogOpen(true)}
            onArchive={() => setIsArchiveDialogOpen(true)}
            onLevelUp={handleLevelUp}
            onCreateNewLevel={handleCreateNewLevel}
            canLevelUp={currentLevel?.completion_rate === 100}
            onNotesChange={handleNotesChange}
            isSavingNotes={isSavingNotes}
          />

          <TabNavigation
            activeTab={activeTab}
            onTabChange={setActiveTab}
            enrollmentCount={currentLevelEnrollmentCount}
          />

          {activeTab === 'attendance' && (
            <AttendanceTab
              groupId={groupId}
              levels={levels}
              sessions={sessions}
              activeLevelId={activeLevelId}
              currentLevelNumber={group.level_number}
              pricingHistory={buildPricingHistory()}
              currency={currentLevel?.pricing_snapshot.currency || 'EGP'}
              instructorName={group.instructor_name}
              onLevelChange={setActiveLevel}
            />
          )}

          {activeTab === 'students' && (
            <StudentsTab
              groupId={groupId}
              levels={levels}
              activeLevelId={activeLevelId}
              currentLevelNumber={group.level_number}
              onLevelChange={setActiveLevel}
            />
          )}

          {activeTab === 'history' && (
            <HistoryTab
              enrollmentHistory={enrollmentHistory}
              competitions={competitions}
              instructorHistory={instructorHistory}
              coursesHistory={coursesHistory}
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

          <ConfirmDialog
            isOpen={isArchiveDialogOpen}
            onCancel={() => setIsArchiveDialogOpen(false)}
            onConfirm={handleArchiveGroup}
            title="Archive Group"
            message="Are you sure you want to archive this group? It will be hidden from the main groups list but can be accessed later."
            confirmText="Archive"
            variant="warning"
          />
        </ErrorBoundary>
      </div>
    </div>
  )
}
