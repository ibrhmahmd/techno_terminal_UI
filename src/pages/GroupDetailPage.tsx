import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { TopNavbar } from '../components/dashboard/TopNavbar'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { TabNavigation } from '../components/groups/TabNavigation'
import { AttendanceTab } from '../components/groups/AttendanceTab'
import { StudentsTab } from '../components/groups/StudentsTab'
import { HistoryTab } from '../components/groups/history/HistoryTab'
import { GroupInfoCard, ProgressLevelDialog } from '../components/groups/detail'
import { EditGroupDialog } from '../components/groups/detail/EditGroupDialog'
import { ErrorBoundary } from '../components/common/ErrorBoundary'
import { useGroupDetail } from '../hooks/useGroupDetail'
import { useGroupLifecycle } from '../hooks/useGroupLifecycle'
import { useGroupCompetitions } from '../hooks/useGroupCompetitions'
import { useGroupMutations } from '../hooks/useGroupMutations'
import { useToast } from '../components/common/Toast'
import type { UpdateGroupDTO, ProgressGroupLevelRequest } from '../api/academics'

export function GroupDetailPage() {
  const { id } = useParams<{ id: string }>()
  const groupId = Number(id) || 0
  const { showToast } = useToast()

  const [activeTab, setActiveTab] = useState<'attendance' | 'students' | 'history'>('attendance')
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false)
  const [isProgressLevelDialogOpen, setIsProgressLevelDialogOpen] = useState(false)
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
    instructorHistory,
    lifecycleHistory,
    courseHistory,
    enrollmentTransitions,
    levelAnalytics,
    enrollmentAnalytics,
    isLoadingHistory,
    isLoadingAnalytics,
    pagination,
    setEnrollmentPage,
    completeLevel,
    cancelLevel,
  } = useGroupLifecycle(groupId)

  const {
    teams,
    availableTeams,
    competitions,
    competitionAnalytics,
    isLoadingTeams,
    isLoadingCompetitions,
    linkTeam,
    registerForCompetition,
    completeParticipation,
    withdrawFromCompetition,
  } = useGroupCompetitions(groupId)

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
      const result = await levelUp()
      showToast(
        `Group progressed from level ${result.old_level_number} to ${result.new_level_number}. ${result.sessions_created} sessions created, ${result.enrollments_migrated} enrollments migrated.`,
        'success'
      )
      await refresh()
    } catch {
      showToast(mutationError || 'Failed to level up group', 'error')
    }
  }

  const handleCreateNewLevel = () => {
    setIsProgressLevelDialogOpen(true)
  }

  const handleProgressLevelConfirm = async (data: ProgressGroupLevelRequest) => {
    try {
      const result = await createNewLevel(data)
      showToast(
        `Group progressed from level ${result.old_level_number} to ${result.new_level_number}. ${result.sessions_created} sessions created, ${result.enrollments_migrated} enrollments migrated.`,
        'success'
      )
      setIsProgressLevelDialogOpen(false)
      await refresh()
    } catch {
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

  const handleCompleteLevel = async (levelNumber: number) => {
    try {
      const result = await completeLevel(levelNumber)
      showToast(
        `Level ${result.completed_level.level_number} completed. Now at level ${result.new_level.level_number}.`,
        'success'
      )
    } catch {
      showToast(mutationError || 'Failed to complete level', 'error')
    }
  }

  const handleCancelLevel = async (levelNumber: number, reason?: string) => {
    try {
      await cancelLevel(levelNumber, reason)
      showToast(`Level ${levelNumber} cancelled.`, 'success')
    } catch {
      showToast(mutationError || 'Failed to cancel level', 'error')
    }
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
              instructorHistory={instructorHistory}
              lifecycleHistory={lifecycleHistory}
              courseHistory={courseHistory}
              enrollmentTransitions={enrollmentTransitions}
              levelAnalytics={levelAnalytics}
              enrollmentAnalytics={enrollmentAnalytics}
              competitions={competitions}
              competitionAnalytics={competitionAnalytics}
              teams={teams}
              availableTeams={availableTeams}
              isLoadingHistory={isLoadingHistory}
              isLoadingAnalytics={isLoadingAnalytics}
              isLoadingTeams={isLoadingTeams}
              isLoadingCompetitions={isLoadingCompetitions}
              totalEnrollment={pagination.enrollment.total}
              onEnrollmentPageChange={setEnrollmentPage}
              enrollmentSkip={pagination.enrollment.skip}
              enrollmentLimit={pagination.enrollment.limit}
              onCompleteLevel={handleCompleteLevel}
              onCancelLevel={handleCancelLevel}
              onLinkTeam={linkTeam}
              onRegisterForCompetition={registerForCompetition}
              onCompleteParticipation={completeParticipation}
              onWithdrawFromCompetition={withdrawFromCompetition}
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

          <ProgressLevelDialog
            isOpen={isProgressLevelDialogOpen}
            groupId={groupId}
            currentLevelNumber={currentLevel?.level_number ?? 1}
            currentInstructorId={group?.instructor_id ?? 0}
            currentCourseId={group?.course_id ?? 0}
            currentGroupName={group?.group_name ?? ''}
            currentPriceOverride={currentLevel?.price_override}
            onClose={() => setIsProgressLevelDialogOpen(false)}
            onConfirm={handleProgressLevelConfirm}
            isLoading={false}
          />
        </ErrorBoundary>
      </div>
    </div>
  )
}
