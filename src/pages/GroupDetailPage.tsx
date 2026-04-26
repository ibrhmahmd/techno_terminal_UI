import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { TopNavbar } from '../components/dashboard/TopNavbar'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { TabNavigation } from '../components/groups/TabNavigation'
import { AttendanceTab } from '../components/groups/AttendanceTab'
import { LevelsTab } from '../components/groups/LevelsTab'
import { StudentsTab } from '../components/groups/StudentsTab'
import { PaymentsTab } from '../components/groups/PaymentsTab'
import { HistoryTab } from '../components/groups/history/HistoryTab'
import { GroupInfoCard, ProgressLevelDialog } from '../components/groups/detail'
import { EditGroupDialog } from '../components/groups/detail/EditGroupDialog'
import { ErrorBoundary } from '../components/common/ErrorBoundary'
import { useGroupDetail } from '../hooks/useGroupDetail'
import { useGroupLifecycle } from '../hooks/useGroupLifecycle'
import { useGroupCompetitions } from '../hooks/useGroupCompetitions'
import { useGroupMutations } from '../hooks/useGroupMutations'
import { useToast } from '../components/common/Toast'
import type { UpdateGroupDTO, ProgressGroupLevelRequest, GroupLevelHistoryDTO } from '../api/academics'
import { useMemo } from 'react'

export function GroupDetailPage() {
  const { id } = useParams<{ id: string }>()
  const groupId = Number(id) || 0
  const { showToast } = useToast()

  const [activeTab, setActiveTab] = useState<'attendance' | 'levels' | 'students' | 'payments' | 'history'>('attendance')
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
    enrollmentTransitions: _enrollmentTransitions,
    levelAnalytics,
    enrollmentAnalytics,
    isLoadingHistory,
    isLoadingAnalytics: _isLoadingAnalytics,
    pagination,
    setEnrollmentPage,
    completeLevel: _completeLevel,
    cancelLevel: _cancelLevel,
  } = useGroupLifecycle(groupId)

  // Convert timeline items to GroupLevelHistoryDTO format for components
  const levelTimeline = useMemo(() => {
    if (!lifecycleHistory?.levels_timeline) return []
    return lifecycleHistory.levels_timeline.map(timeline => ({
      id: timeline.id,
      level_number: timeline.level_number,
      price_override: undefined,
      start_date: timeline.start_date,
      end_date: timeline.end_date,
      status: timeline.status,
      course_name: timeline.course_name,
      instructor_name: timeline.instructor_name,
      enrollment_count_start: timeline.enrollment_count,
      completion_rate: 0, // Not available in timeline
    })) as unknown as GroupLevelHistoryDTO[]
  }, [lifecycleHistory])

  const {
    teams: _teams,
    availableTeams: _availableTeams,
    competitions,
    competitionAnalytics: _competitionAnalytics,
    isLoadingTeams: _isLoadingTeams,
    isLoadingCompetitions: _isLoadingCompetitions,
    linkTeam: _linkTeam,
    registerForCompetition: _registerForCompetition,
    completeParticipation: _completeParticipation,
    withdrawFromCompetition: _withdrawFromCompetition,
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
              levels={levelTimeline.length > 0 ? levelTimeline : levels}
              sessions={sessions}
              activeLevelId={activeLevelId}
              currentLevelNumber={group.level_number}
              instructorName={group.instructor_name}
              onLevelChange={setActiveLevel}
            />
          )}

          {activeTab === 'levels' && (
            <LevelsTab
              groupId={groupId}
              levels={lifecycleHistory?.levels_timeline || []}
              levelAnalytics={levelAnalytics}
              currentLevelNumber={group.level_number}
            />
          )}

          {activeTab === 'students' && (
            <StudentsTab
              groupId={groupId}
              levels={levelTimeline.length > 0 ? levelTimeline : levels}
              activeLevelId={activeLevelId}
              currentLevelNumber={group.level_number}
              onLevelChange={setActiveLevel}
            />
          )}

          {activeTab === 'payments' && (
            <PaymentsTab
              groupId={groupId}
              enrollmentAnalytics={enrollmentAnalytics}
            />
          )}

          {activeTab === 'history' && (
            <HistoryTab
              enrollmentHistory={enrollmentHistory}
              instructorHistory={instructorHistory}
              coursesHistory={courseHistory.map((c, index) => ({
                level_number: index + 1,
                course_name: c.course_name,
                start_date: c.assigned_at,
              })) as { level_number: number; course_name: string; start_date: string; end_date?: string }[]}
              competitions={competitions}
              isLoading={isLoadingHistory}
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
