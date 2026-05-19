import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { TopNavbar } from '../components/dashboard/TopNavbar'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { TabNavigation } from '../components/groups/TabNavigation'
import { AttendanceTab } from '../components/groups/AttendanceTab'
import { LevelsTab } from '../components/groups/LevelsTab'
import { StudentsTab } from '../components/groups/StudentsTab'
import { PaymentsTab } from '../components/groups/PaymentsTab'
import { GroupInfoCard, ProgressLevelDialog } from '../components/groups/detail'
import { EditGroupDialog } from '../components/groups/detail/EditGroupDialog'
import { ErrorBoundary } from '../components/common/ErrorBoundary'
import { useGroupDetail } from '../hooks/useGroupDetail'
import { useGroupEnrollments } from '../hooks/useGroupEnrollments'
import { useGroupPayments } from '../hooks/useGroupPayments'
import { useGroupMutations } from '../hooks/useGroupMutations'
import { useToast } from '../components/common/Toast'
import type { UpdateGroupDTO, ProgressGroupLevelRequest } from '../api/academics'

export function GroupDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const groupId = Number(id) || 0
  const { showToast } = useToast()
  const enrollmentsErrorShownRef = useRef(false)
  const paymentsErrorShownRef = useRef(false)

  const isValidGroupId = !isNaN(groupId) && groupId > 0

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
    isLoading,
    error,
    refetch,
    setActiveLevel,
    activeLevelId,
  } = useGroupDetail(groupId)

  // Consolidated enrollments data
  const {
    error: enrollmentsError,
  } = useGroupEnrollments(groupId, activeTab === 'students')

  // Real payment data (replaces enrollmentAnalytics estimates)
  const {
    summary: paymentSummary,
    paymentsByLevel,
    totalExpected,
    totalCollected,
    totalDue,
    collectionRate,
    isLoading: isLoadingPayments,
    error: paymentsError,
  } = useGroupPayments(groupId, activeTab === 'payments')

  // Show toast notifications for hook errors
  useEffect(() => {
    if (enrollmentsError && !enrollmentsErrorShownRef.current) {
      showToast(enrollmentsError, 'error')
      enrollmentsErrorShownRef.current = true
    }
  }, [enrollmentsError, showToast])

  useEffect(() => {
    if (paymentsError && !paymentsErrorShownRef.current) {
      showToast(paymentsError, 'error')
      paymentsErrorShownRef.current = true
    }
  }, [paymentsError, showToast])

  const { 
    updateGroup, 
    deleteGroup, 
    archiveGroup,
    levelUp, 
    createNewLevel,
    error: mutationError 
  } = useGroupMutations(groupId)

  // Current level enrollment count from consolidated data

  const handleUpdateGroup = async (data: UpdateGroupDTO & { notes?: string; status?: 'active' | 'inactive' | 'archived' | 'completed' }) => {
    try {
      await updateGroup(data)
      showToast('Group updated successfully', 'success')
      await refetch()
      setIsEditDialogOpen(false)
    } catch {
      showToast(mutationError || 'Failed to update group', 'error')
    }
  }

  const handleDeleteGroup = async () => {
    try {
      await deleteGroup()
      showToast('Group deleted successfully', 'success')
      navigate('/groups')
    } catch {
      showToast(mutationError || 'Failed to delete group', 'error')
      setIsDeleteDialogOpen(false)
    }
  }

  const handleArchiveGroup = async () => {
    try {
      await archiveGroup()
      showToast('Group archived successfully', 'success')
      await refetch()
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
      await refetch()
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
      await refetch()
    } catch {
      showToast(mutationError || 'Failed to create new level', 'error')
    }
  }

  const handleNotesChange = useCallback(async (notes: string) => {
    setIsSavingNotes(true)
    try {
      await updateGroup({ notes } as UpdateGroupDTO)
    } catch {
      // Error handled by mutation hook
    } finally {
      setIsSavingNotes(false)
    }
  }, [updateGroup])

  if (!isValidGroupId) {
    return (
      <div className="min-h-screen bg-surface">
        <TopNavbar activePage="Groups" />
        <div className="p-8 max-w-[1400px] mx-auto">
          <div className="p-12 bg-amber-50 border border-amber-100 rounded-xl text-center">
            <span className="material-symbols-outlined text-4xl text-amber-500 mb-2" aria-hidden="true">warning</span>
            <h2 className="text-xl font-bold text-amber-800 mb-2">Invalid Group ID</h2>
            <p className="text-amber-600 mb-4">The group ID in the URL is not valid.</p>
            <button
              onClick={() => navigate('/groups')}
              className="px-4 py-2 text-sm font-medium text-white bg-secondary rounded-lg hover:bg-secondary/90 transition-colors"
            >
              Back to Groups
            </button>
          </div>
        </div>
      </div>
    )
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
            <span className="material-symbols-outlined text-4xl text-red-500 mb-2" aria-hidden="true">error</span>
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
            canLevelUp={currentLevel?.status === 'active' && currentLevel?.students_completed > 0}
            onNotesChange={handleNotesChange}
            isSavingNotes={isSavingNotes}
          />

          <TabNavigation
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          {activeTab === 'attendance' && (
            <AttendanceTab
              groupId={groupId}
              levels={levels}
              activeLevelId={activeLevelId}
              currentLevelNumber={group.current_level}
              instructorName={group.instructor_name}
              onLevelChange={setActiveLevel}
            />
          )}

          {activeTab === 'levels' && (
            <LevelsTab
              levels={levels}
              currentLevelNumber={group.current_level}
            />
          )}

          {activeTab === 'students' && (
            <StudentsTab
              groupId={groupId}
              levels={levels}
              activeLevelId={activeLevelId}
              currentLevelNumber={group.current_level}
              onLevelChange={setActiveLevel}
            />
          )}

          {activeTab === 'payments' && (
            <PaymentsTab
              paymentSummary={paymentSummary}
              paymentsByLevel={paymentsByLevel}
              totalExpected={totalExpected}
              totalCollected={totalCollected}
              totalDue={totalDue}
              collectionRate={collectionRate}
              isLoading={isLoadingPayments}
            />
          )}

          {activeTab === 'history' && (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
              <span className="material-symbols-outlined text-4xl mb-2" aria-hidden="true">history</span>
              <p className="font-medium">Competition history has been moved to the Competitions section.</p>
            </div>
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
            currentGroupName={group?.name ?? ''}
            currentPriceOverride={null}
            onClose={() => setIsProgressLevelDialogOpen(false)}
            onConfirm={handleProgressLevelConfirm}
            isLoading={false}
          />
        </ErrorBoundary>
      </div>
    </div>
  )
}
