import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { TopNavbar } from '../components/dashboard/TopNavbar'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { MetricsStripCards } from '../components/common/MetricsStripCards'
import { LevelsTab } from '../components/groups/LevelsTab'
import { HistoryTab } from '../components/groups/HistoryTab'
import { GroupInfoCard, ProgressLevelDialog } from '../components/groups/detail'
import { EditGroupDialog } from '../components/groups/detail/EditGroupDialog'
import { ErrorBoundary } from '../components/common/ErrorBoundary'
import { useGroupDetail } from '../hooks/useGroupDetail'
import { useGroupPayments } from '../hooks/useGroupPayments'
import { useGroupMutations } from '../hooks/useGroupMutations'
import { useToast } from '../components/common/Toast'
import type { UpdateGroupDTO, ProgressGroupLevelRequest } from '../api/academics'

export function GroupDetailPage() {
  const { t } = useTranslation('groups')
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const groupId = Number(id) || 0
  const { showToast } = useToast()

  const isValidGroupId = !isNaN(groupId) && groupId > 0

  const [activeTab, setActiveTab] = useState<'levels' | 'history' | 'competitions'>('levels')
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
    coursesMap,
    instructorsMap,
  } = useGroupDetail(groupId)

  // Real payment data
  const {
    paymentsByLevel,
    error: paymentsError,
  } = useGroupPayments(groupId, activeTab === 'levels')

  const prevPaymentErrorRef = useRef<string | null>(null)
  useEffect(() => {
    if (paymentsError && paymentsError !== prevPaymentErrorRef.current) {
      prevPaymentErrorRef.current = paymentsError
      showToast(paymentsError, 'error')
    }
    if (!paymentsError) {
      prevPaymentErrorRef.current = null
    }
  }, [paymentsError, showToast])

  const { 
    updateGroup, 
    deleteGroup, 
    archiveGroup,
    levelUp, 
    createNewLevel,
    isCreateLevelPending,
    isLevelUpPending,
  } = useGroupMutations(groupId)

  // Current level enrollment count from consolidated data

  const handleUpdateGroup = async (data: UpdateGroupDTO) => {
    try {
      await updateGroup(data)
      showToast(t('toast.updated'), 'success')
      setIsEditDialogOpen(false)
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : t('toast.update_failed'), 'error')
    }
  }

  const handleDeleteGroup = async () => {
    try {
      await deleteGroup()
      showToast(t('toast.deleted'), 'success')
      navigate('/groups')
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : t('toast.delete_failed'), 'error')
      setIsDeleteDialogOpen(false)
    }
  }

  const handleArchiveGroup = async () => {
    try {
      await archiveGroup()
      showToast(t('toast.archived'), 'success')
      setIsArchiveDialogOpen(false)
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : t('toast.archive_failed'), 'error')
      setIsArchiveDialogOpen(false)
    }
  }

  const handleLevelUp = async () => {
    try {
      const result = await levelUp()
      showToast(
        t('toast.level_up_success', { old: result.old_level_number, new: result.new_level_number, sessions: result.sessions_created, enrollments: result.enrollments_migrated }),
        'success'
      )
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : t('toast.level_up_failed'), 'error')
    }
  }

  const handleCreateNewLevel = () => {
    setIsProgressLevelDialogOpen(true)
  }

  const handleProgressLevelConfirm = async (data: ProgressGroupLevelRequest) => {
    try {
      const result = await createNewLevel(data)
      showToast(
        t('toast.level_up_success', { old: result.old_level_number, new: result.new_level_number, sessions: result.sessions_created, enrollments: result.enrollments_migrated }),
        'success'
      )
      setIsProgressLevelDialogOpen(false)
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : t('toast.new_level_failed'), 'error')
    }
  }

  const handleNotesChange = useCallback(async (notes: string) => {
    setIsSavingNotes(true)
    try {
      await updateGroup({ notes })
    } catch {
      // Error handled by mutation hook
    } finally {
      setIsSavingNotes(false)
    }
  }, [updateGroup])

  if (!isValidGroupId) {
    return (
      <div className="min-h-screen bg-surface">
        <TopNavbar activePage={t('page_title')} />
        <div className="p-8 max-w-[1680px] mx-auto">
          <div className="p-12 bg-amber-50 border border-amber-100 rounded-xl text-center">
            <span className="material-symbols-outlined text-4xl text-amber-500 mb-2" aria-hidden="true">warning</span>
            <h2 className="text-xl font-bold text-amber-800 mb-2">{t('detail.invalid_id')}</h2>
            <p className="text-amber-600 mb-4">{t('detail.invalid_id_desc')}</p>
            <button
              onClick={() => navigate('/groups')}
              className="px-4 py-2 text-sm font-medium text-white bg-secondary rounded-lg hover:bg-secondary/90 transition-colors"
            >
              {t('detail.back_to_groups')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface">
        <TopNavbar activePage={t('page_title')} />
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-surface">
        <TopNavbar activePage={t('page_title')} />
        <div className="p-8 max-w-[1680px] mx-auto">
          <div className="p-8 bg-red-50 border border-red-100 rounded-xl text-center">
            <span className="material-symbols-outlined text-4xl text-red-500 mb-2" aria-hidden="true">error</span>
            <h2 className="text-xl font-bold text-red-800 mb-2">{t('detail.error')}</h2>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-surface">
        <TopNavbar activePage={t('page_title')} />
        <div className="p-8 max-w-[1680px] mx-auto">
          <div className="p-12 text-center text-on-surface-variant">
            <p>{t('detail.not_found')}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface">
      <TopNavbar activePage={t('page_title')} />

      <div className="p-4 md:p-8 max-w-[1680px] mx-auto space-y-6">
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
            isLevelUpPending={isLevelUpPending}
          />

          <MetricsStripCards
            items={[
              {
                label: t('detail.levels_sessions'),
                icon: 'school',
                color: 'emerald',
                isActive: activeTab === 'levels',
                onClick: () => setActiveTab('levels'),
              },
              {
                label: t('detail.history'),
                icon: 'history',
                color: 'secondary',
                isActive: activeTab === 'history',
                onClick: () => setActiveTab('history'),
              },
              {
                label: t('detail.competitions_soon'),
                icon: 'emoji_events',
                color: 'slate',
                isActive: activeTab === 'competitions',
                onClick: () => setActiveTab('competitions'),
              },
            ]}
          />

          <div className="mt-8">
          {activeTab === 'levels' && (
            <div role="tabpanel" id="panel-levels" aria-labelledby="tab-levels">
              <LevelsTab
                levels={levels}
                currentLevelNumber={group.current_level}
                groupId={groupId}
                paymentsByLevel={paymentsByLevel}
                coursesMap={coursesMap}
                instructorsMap={instructorsMap}
                onAddLevel={() => setIsProgressLevelDialogOpen(true)}
                groupInstructorName={group.instructor_name}
                groupName={group.name}
                courseName={group.course_name}
              />
            </div>
          )}
          {activeTab === 'history' && (
            <div role="tabpanel" id="panel-history" aria-labelledby="tab-history">
              <HistoryTab groupId={groupId} />
            </div>
          )}
          {activeTab === 'competitions' && (
            <div role="tabpanel" id="panel-competitions" aria-labelledby="tab-competitions" className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
              <span className="material-symbols-outlined text-6xl text-slate-300 mb-3 block" aria-hidden="true">emoji_events</span>
              <h3 className="text-lg font-bold font-headline text-slate-800 mb-1">{t('detail.competitions_title')}</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                {t('detail.competitions_desc')}
              </p>
            </div>
          )}
          </div>

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
            title={t('delete.title')}
            message={t('delete.message')}
            confirmText={t('delete.confirm')}
            variant="danger"
          />

          <ConfirmDialog
            isOpen={isArchiveDialogOpen}
            onCancel={() => setIsArchiveDialogOpen(false)}
            onConfirm={handleArchiveGroup}
            title={t('archive.title')}
            message={t('archive.message')}
            confirmText={t('archive.confirm')}
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
            isLoading={isCreateLevelPending}
          />
        </ErrorBoundary>
      </div>
    </div>
  )
}
