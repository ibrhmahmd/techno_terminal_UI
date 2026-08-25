import { useState, useCallback, useMemo, lazy, Suspense } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { queryKeys } from '../hooks/queryKeys'
import { useNavDirection } from '../hooks/useNavDirection'
import { TopNavbar } from '../components/dashboard/TopNavbar'
import { Pagination, PageHeader, PageSection, ActionButton, SearchBar, Modal, ConfirmDialog } from '../components/common'
import { useToast } from '../components/common/Toast'
const StudentForm = lazy(() => import('../components/crm/StudentForm').then(m => ({ default: m.StudentForm })))
const ParentForm = lazy(() => import('../components/crm/ParentForm').then(m => ({ default: m.ParentForm })))
import { WaitingListPanel } from '../components/crm/WaitingListPanel'
const EnrollPanel = lazy(() => import('../components/enrollments/EnrollPanel').then(m => ({ default: m.EnrollPanel })))
import { useSearch } from '../hooks/useSearch'
import { useDirectoryData } from '../hooks/directory/useDirectoryData'
import { useStudentActions } from '../hooks/directory/useStudentActions'
import { useAdvancedSearch } from '../hooks/directory/useAdvancedSearch'
import { AdvancedSearchPanel } from '../components/directory/AdvancedSearchPanel'
import { createParent, searchParents } from '../api/crm/parents'
import type { StudentListItem, StudentFilterItem, StudentWithDetails, ParentListItem, StudentStatus } from '../api/crm/students/types/models'
import type { StudentFilterParams } from '../api/crm/students/search'
import type { CreateStudentDTO } from '../api/crm/students/types/inputs'

import { isStudentListItem, toStudentListItem } from '../api/crm/students/utils'
import { StudentCard } from '../components/directory/StudentCard'
import { StudentMobileCard } from '../components/crm/StudentMobileCard'
import { ParentCard } from '../components/directory/ParentCard'
import { ParentMobileCard } from '../components/crm/ParentMobileCard'
import { CardGrid } from '../components/directory/CardGrid'
import { useIsMobile } from '../hooks/useIsMobile'
import { CardSkeleton } from '../components/directory/shared/CardSkeleton'
import { MetricsStripCards } from '../components/common/MetricsStripCards'
import { AlphabetSlider } from '../components/directory/AlphabetSlider'
import { StudentGroupBySelector } from '../components/directory/StudentGroupBySelector'
import { ErrorBoundary } from '../components/common/ErrorBoundary'
import type { StudentGroupBy, WaitingGroupBy } from '../config/studentGrouping'

const PANEL_ORDER = ['students', 'parents', 'waiting', 'advanced'] as const

export function DirectoryPage() {
  const { t } = useTranslation('directory')
  const { t: tCommon } = useTranslation('common')
  const isMobile = useIsMobile()
  const { showToast, ToastComponent } = useToast()
  const [activeTab, setActiveTab] = useState<(typeof PANEL_ORDER)[number]>(() => 'students')

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  
  // Grouping state
  const [studentGroupBy, setStudentGroupBy] = useState<StudentGroupBy>('none')
  const [waitingGroupBy, setWaitingGroupBy] = useState<WaitingGroupBy>('none')
  const [studentGroupedPage, setStudentGroupedPage] = useState(1)
  const [waitingGroupedPage, setWaitingGroupedPage] = useState(1)
  const groupedPageSize = 15
  const [activeStudentGroup, setActiveStudentGroup] = useState<string>('')
  const [activeFilterGroup, setActiveFilterGroup] = useState<string>('')

  // Advanced search filter state
  const [filterGroupBy, setFilterGroupBy] = useState<'none' | 'status' | 'age'>('none')
  const [filterPage, setFilterPage] = useState(1)
  const [appliedFilters, setAppliedFilters] = useState<StudentFilterParams | null>(null)
  const { filters, setFilter, resetFilters, hasActiveFilters, convertToApiParams, getActiveFiltersArray } = useAdvancedSearch()

  // Waiting list enrollment modal state
  const [isWaitingEnrollModalOpen, setIsWaitingEnrollModalOpen] = useState(false)
  const [selectedWaitingStudent, setSelectedWaitingStudent] = useState<StudentWithDetails | null>(null)
  const [isEnrollPanelLoading, setIsEnrollPanelLoading] = useState(false)

  // Search and filters
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null)
  const { searchTerm, setSearchTerm, debouncedSearch, clearSearch } = useSearch({
    debounceMs: 300,
    minLength: 2,
  })
  const isSearching = debouncedSearch.length >= 2

  // Data fetching via consolidated hook
  const {
    students,
    parents,
    waitingStudents,
    studentsGroupedData,
    waitingGroupedData,
    filteredStudents,
    filteredTotal,
    filteredGroupedData,
    isLoading,
    isLoadingStudentsGrouped,
    isLoadingWaitingGrouped,
    isLoadingFiltered,
    isLoadingFilteredGrouped,
    totalStudents,
    totalParents,
    totalWaiting,
    isError,
  } = useDirectoryData({
    activeTab,
    isSearching,
    debouncedSearch,
    studentGroupBy,
    waitingGroupBy,
    currentPage,
    pageSize,
    groupedPageSize,
    studentGroupedPage,
    waitingGroupedPage,
    filterParams: appliedFilters || undefined,
    filterPage,
    filterGroupBy,
  })

  // Modal states - must be declared before useStudentActions
  const [isCreateStudentModalOpen, setIsCreateStudentModalOpen] = useState(false)
  const [isEditStudentModalOpen, setIsEditStudentModalOpen] = useState(false)
  const [isCreateParentModalOpen, setIsCreateParentModalOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState<StudentListItem | null>(null)

  // Student actions via consolidated hook
  const {
    handleCreateStudent,
    handleEditStudent,
    handleSoftDeleteStudent,
    handleRestoreStudent,
    handleHardDeleteStudent,
  } = useStudentActions(
    () => setIsCreateStudentModalOpen(false),
    () => {
      setIsEditStudentModalOpen(false)
      setEditingStudent(null)
    },
    clearSearch
  )

  // Wrapper to redirect to waiting list tab after successful creation
  const handleCreateStudentAndRedirect = async (
    data: CreateStudentDTO,
    parent: ParentListItem | null,
    status: StudentStatus,
    initialActivity?: { activity_type: string; description: string }
  ) => {
    await handleCreateStudent(data, parent, status, initialActivity)
    // Redirect to waiting list tab (default status is 'waiting')
    handleTabChange('waiting')
  }

  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    title: string
    message: string
    onConfirm: () => void
    variant: 'danger' | 'warning' | 'info'
    confirmText: string
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    variant: 'info',
    confirmText: 'Confirm',
  })
  // Filter active vs deleted students
  const displayStudents = useMemo(() => students.filter((s) => s.status !== 'waiting'), [students])

  const qc = useQueryClient()
  const createParentMutation = useMutation({
    mutationFn: createParent,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.directory.parents.all })
      showToast(t('toast.parent_created'), 'success')
      setIsCreateParentModalOpen(false)
    },
    onError: () => {
      showToast(t('toast.create_failed'), 'error')
    },
  })

  const handleCreateParent = useCallback(
    async (data: Parameters<typeof createParent>[0]) => {
      await createParentMutation.mutateAsync(data)
    },
    [createParentMutation]
  )

  // Handle soft delete with confirmation
  const handleSoftDeleteWithConfirm = useCallback(
    (student: StudentListItem | StudentFilterItem) => {
      setConfirmDialog({
        isOpen: true,
        title: t('confirm.soft_delete_title'),
        message: t('confirm.soft_delete_message', { name: student.full_name }),
        variant: 'warning',
        confirmText: tCommon('buttons.delete'),
        onConfirm: () => {
          if (isStudentListItem(student)) {
            handleSoftDeleteStudent(student)
          }
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }))
        },
      })
    },
    [handleSoftDeleteStudent, setConfirmDialog]
  )

  // Handle hard delete with confirmation
  const handleHardDeleteWithConfirm = useCallback(
    (student: StudentListItem | StudentFilterItem) => {
      setConfirmDialog({
        isOpen: true,
        title: t('confirm.hard_delete_title'),
        message: t('confirm.hard_delete_message', { name: student.full_name }),
        variant: 'danger',
        confirmText: tCommon('buttons.delete'),
        onConfirm: () => {
          if (isStudentListItem(student)) {
            handleHardDeleteStudent(student)
          }
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }))
        },
      })
    },
    [handleHardDeleteStudent, setConfirmDialog]
  )

  // Reset search and grouping when tab changes
  const handleTabChange = useCallback(
    (tab: 'students' | 'parents' | 'waiting' | 'advanced') => {
      setActiveTab(tab)
      clearSearch()
      setCurrentPage(1)
      setStudentGroupBy('none')
      setWaitingGroupBy('none')
      setStudentGroupedPage(1)
      setWaitingGroupedPage(1)
      setActiveStudentGroup('')
      setActiveFilterGroup('')
      setFilterPage(1)
      if (tab !== 'advanced') {
        setAppliedFilters(null)
      }
    },
    [clearSearch]
  )

  // Handle apply filters
  const handleApplyFilters = useCallback(() => {
    const params = convertToApiParams()
    setAppliedFilters(params)
    setFilterPage(1)
  }, [convertToApiParams])

  // Handle reset filters
  const handleResetFilters = useCallback(() => {
    resetFilters()
    setAppliedFilters(null)
    setFilterPage(1)
    setSelectedLetter(null)
  }, [resetFilters])

  const activeIndex = PANEL_ORDER.indexOf(activeTab)
  const { getNextIndex } = useNavDirection()

  function handleGroupTabKeyDown<T extends { key: string }>(
    e: React.KeyboardEvent,
    groups: readonly T[],
    activeKey: string,
    setActive: (key: string) => void
  ) {
    const count = groups.length
    if (count === 0) return
    const currentIndex = groups.findIndex(g => g.key === activeKey)
    let newIndex: number | undefined
    const navIndex = getNextIndex(e, currentIndex, count)
    if (navIndex !== null) newIndex = navIndex
    if (e.key === 'Home') {
      newIndex = 0
    } else if (e.key === 'End') {
      newIndex = count - 1
    }
    if (newIndex !== undefined) {
      e.preventDefault()
      setActive(groups[newIndex].key)
    }
  }

  const metricItems = useMemo(() => [
    {
      label: t('tabs.students'),
      value: String(totalStudents),
      icon: 'school',
      color: 'secondary' as const,
      isLoading: isLoading && students.length === 0,
      id: 'tab-btn-students',
      controls: 'tabpanel-students',
      onClick: () => handleTabChange('students'),
    },
    {
      label: t('tabs.parents'),
      value: String(totalParents),
      icon: 'family_restroom',
      color: 'emerald' as const,
      isLoading: isLoading && parents.length === 0,
      id: 'tab-btn-parents',
      controls: 'tabpanel-parents',
      onClick: () => handleTabChange('parents'),
    },
    {
      label: t('tabs.waiting'),
      value: String(totalWaiting),
      icon: 'schedule',
      color: 'amber' as const,
      isLoading: isLoading && waitingStudents.length === 0,
      id: 'tab-btn-waiting',
      controls: 'tabpanel-waiting',
      onClick: () => handleTabChange('waiting'),
    },
    {
      label: t('tabs.advanced'),
      value: undefined,
      icon: 'tune',
      color: 'blue' as const,
      isLoading: false,
      id: 'tab-btn-advanced',
      controls: 'tabpanel-advanced',
      onClick: () => handleTabChange('advanced'),
    },
  ], [totalStudents, totalParents, waitingStudents.length, appliedFilters, filteredTotal, isLoading, isLoadingFiltered, handleTabChange, students.length, parents.length, t])

  if (isError) {
    return (
      <div role="alert" className="flex flex-col items-center justify-center py-16 text-red-500">
        <span className="material-symbols-outlined text-5xl mb-3" aria-hidden="true">error</span>
        <p className="text-sm">{tCommon('messages.error')}</p>
        <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-secondary text-white rounded-lg">
          {tCommon('buttons.retry')}
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface">
      <TopNavbar activePage={t('page_title')} />

      {/* Header */}
      <PageHeader 
        title={t('page_title')}
        count={activeTab === 'students' ? totalStudents : activeTab === 'advanced' ? (filteredTotal ?? 0) : totalParents}
        subtitle=""
        actions={
          <>
            <SearchBar
              placeholder={tCommon('labels.searchPlaceholder')}
              onSearch={setSearchTerm}
              className="min-w-[220px]"
            />
            {studentGroupBy !== 'deleted' && (
              <ActionButton 
                icon="add" 
                onClick={() => {
                  if (activeTab === 'parents') {
                    setIsCreateParentModalOpen(true)
                  } else {
                    setIsCreateStudentModalOpen(true)
                  }
                }}
              >
                {activeTab === 'parents' ? t('actions.add_parent') : t('actions.add_student')}
              </ActionButton>
            )}
          </>
        }
      />

      {/* Tab Navigation */}
      <section className="px-8 pt-6">
        <div className="max-w-[1680px] mx-auto">
          <MetricsStripCards items={metricItems} activeIndex={activeIndex} />
        </div>
      </section>

        {/* Content */}
        <PageSection>
          {activeTab === 'students' && (
            <div role="tabpanel" id="tabpanel-students" aria-labelledby="tab-btn-students">
              <ErrorBoundary>
              {/* Group by selector and deleted toggle */}
              <div className="flex justify-end items-center mb-4">
                <StudentGroupBySelector
                  value={studentGroupBy}
                  onChange={(newGroupBy) => {
                    setStudentGroupBy(newGroupBy as StudentGroupBy)
                    setStudentGroupedPage(1)
                    setCurrentPage(1)
                    setActiveStudentGroup('')
                  }}
                  mode="students"
                  disabled={isSearching}
                />
              </div>

              {/* Cards with AlphabetSlider */}
              <div className="flex gap-4">
                {/* Alphabet Slider - hidden on mobile */}
                <div className="hidden md:block">
                  <AlphabetSlider
                    selectedLetter={selectedLetter}
                    onSelect={setSelectedLetter}
                  />
                </div>
                
                {/* Cards - flat or grouped */}
                <div className="flex-1 min-w-0">
                  {studentGroupBy === 'deleted' || studentGroupBy === 'none' ? (
                    <>
                      {isLoading ? (
                        <CardGrid>
                          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
                        </CardGrid>
                      ) : (
                        (() => {
                          const items = studentGroupBy === 'deleted' 
                            ? selectedLetter 
                              ? students.filter(s => s.full_name.charAt(0).toUpperCase() === selectedLetter)
                              : students
                            : selectedLetter
                              ? displayStudents.filter(s => s.full_name.charAt(0).toUpperCase() === selectedLetter)
                              : displayStudents
                          if (items.length === 0) {
                            const msg = studentGroupBy === 'deleted'
                              ? (selectedLetter ? t('empty.no_deleted_students_letter', { letter: selectedLetter }) : t('empty.no_deleted_students'))
                              : searchTerm.length >= 2 
                                ? t('empty.no_students_match_search') 
                                : (selectedLetter ? t('empty.no_students_letter', { letter: selectedLetter }) : t('empty.no_students'))
                            return (
                              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                                <span aria-hidden="true" className="material-symbols-outlined text-5xl mb-3">
                                  {studentGroupBy === 'deleted' ? 'delete' : 'search'}
                                </span>
                                <p className="text-sm">{msg}</p>
                              </div>
                            )
                          }
                          return (
                            <CardGrid>
{items.map((s) => (
                isMobile ? (
                  <StudentMobileCard
                    key={s.id}
                    id={s.id}
                    name={s.full_name}
                    gender={s.gender || 'male'}
                    grade={s.grade}
                    status={s.status}
                    billingStatus={s.has_unpaid_balance ? 'due' : 'paid'}
                    current_group_name={'current_group_name' in s ? s.current_group_name : undefined}
                  />
                ) : (
                  <StudentCard
                    key={s.id}
                    student={s}
                    isDeleted={studentGroupBy === 'deleted'}
                    actions={{
                      onEdit: () => {
                        setEditingStudent(s)
                        setIsEditStudentModalOpen(true)
                      },
                      onDelete: () => handleSoftDeleteWithConfirm(s),
                      onRestore: () => handleRestoreStudent(s),
                      onPermanentDelete: () => handleHardDeleteWithConfirm(s),
                    }}
                  />
                )
              ))}
                            </CardGrid>
                          )
                        })()
                      )}
                    </>
                  ) : (
                    <>
                      {isLoadingStudentsGrouped ? (
                        <CardGrid>
                          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
                        </CardGrid>
                      ) : !studentsGroupedData || studentsGroupedData.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                          <span aria-hidden="true" className="material-symbols-outlined text-5xl mb-3">inbox</span>
                          <p className="text-sm">{t('empty.no_students')}</p>
                        </div>
                      ) : (
                        (() => {
                          const groupMap = new Map(studentsGroupedData.map(g => [g.key, g]))
                          const defaultKey = studentsGroupedData[0]?.key ?? ''
                          const activeKey = (activeStudentGroup || defaultKey) && groupMap.has(activeStudentGroup || defaultKey)
                            ? (activeStudentGroup || defaultKey)
                            : defaultKey
                          const activeItems = groupMap.get(activeKey)?.items ?? []
                          return (
                            <>
                              <div className="overflow-x-auto mb-4">
                                <div role="tablist" aria-label="Student groups" className="flex min-w-full w-max items-center gap-1 rounded-xl bg-slate-800 p-2"
                                  onKeyDown={(e) => handleGroupTabKeyDown(e, studentsGroupedData, activeKey, setActiveStudentGroup)}>
                                  {studentsGroupedData.map((group) => (
                                    <button
                                      key={group.key}
                                      role="tab"
                                      aria-selected={activeKey === group.key}
                                      onClick={() => setActiveStudentGroup(group.key)}
                                      className={`flex-1 flex justify-center items-center gap-3 min-w-[120px] px-5 py-2 rounded-lg text-sm font-medium transition-all select-none ${
                                        activeKey === group.key
                                          ? 'bg-secondary text-white font-bold shadow-lg shadow-secondary/20'
                                          : 'text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                                      }`}
                                    >
                                      <span className="font-headline">{group.label}</span>
                                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold tabular-nums ${
                                        activeKey === group.key
                                          ? 'bg-white/20 text-white'
                                          : 'bg-slate-700 text-slate-300'
                                      }`}>
                                        {group.count}
                                      </span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <CardGrid>
                                {activeItems.map((s) => (
                                  isMobile ? (
                                    <StudentMobileCard
                                      key={s.id}
                                      id={s.id}
                                      name={s.full_name}
                                      gender={s.gender || 'male'}
                                      grade={s.grade}
                                      status={s.status}
                                      billingStatus={s.has_unpaid_balance ? 'due' : 'paid'}
                                      current_group_name={s.current_group_name}
                                    />
                                  ) : (
                                    <StudentCard
                                      key={s.id}
                                      student={s}
                                      actions={{
                                        onEdit: () => {
                                        setEditingStudent(s)
                                        setIsEditStudentModalOpen(true)
                                      },
                                      onDelete: () => handleSoftDeleteWithConfirm(s),
                                      onRestore: () => handleRestoreStudent(s),
                                      onPermanentDelete: () => handleHardDeleteWithConfirm(s),
                                      }}
                                    />
                                  )
                                ))}
                              </CardGrid>
                            </>
                          )
                        })()
                      )}
                    </>
                  )}
                </div>
              </div>
              </ErrorBoundary>
            </div>
          )}
          {activeTab === 'waiting' && (
            <div role="tabpanel" id="tabpanel-waiting" aria-labelledby="tab-btn-waiting">
              <ErrorBoundary>
              {/* Group by selector for waiting list */}
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-on-surface font-headline">
                  {t('waiting_list.title', { count: waitingStudents.length })}
                </h2>
                <StudentGroupBySelector
                  value={waitingGroupBy}
                  onChange={(newGroupBy) => {
                    setWaitingGroupBy(newGroupBy as WaitingGroupBy)
                    setWaitingGroupedPage(1)
                  }}
                  mode="waiting"
                  disabled={isSearching}
                />
              </div>

              {/* Cards - flat or grouped */}
              {waitingGroupBy === 'none' ? (
                <WaitingListPanel
                  onEnrollStudent={(student) => {
                    setSelectedWaitingStudent(student)
                    setIsWaitingEnrollModalOpen(true)
                  }}
                />
              ) : (
                <>
                  {isLoadingWaitingGrouped ? (
                    <CardGrid>
                      {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
                    </CardGrid>
                  ) : !waitingGroupedData || waitingGroupedData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                      <span aria-hidden="true" className="material-symbols-outlined text-5xl mb-3">inbox</span>
                      <p className="text-sm">{t('empty.no_waiting_students')}</p>
                    </div>
                  ) : (
                    (() => {
                      const groupMap = new Map(waitingGroupedData.map(g => [g.key, g]))
                      const defaultKey = waitingGroupedData[0]?.key ?? ''
                      const activeKey = (activeStudentGroup || defaultKey) && groupMap.has(activeStudentGroup || defaultKey)
                        ? (activeStudentGroup || defaultKey)
                        : defaultKey
                      const activeItems = groupMap.get(activeKey)?.items ?? []
                      return (
                        <>
                          <div className="overflow-x-auto mb-4">
                            <div role="tablist" aria-label="Waiting list groups" className="flex min-w-full w-max items-center gap-1 rounded-xl bg-slate-800 p-2"
                              onKeyDown={(e) => handleGroupTabKeyDown(e, waitingGroupedData, activeKey, setActiveStudentGroup)}>
                              {waitingGroupedData.map((group) => (
                                <button
                                  key={group.key}
                                  role="tab"
                                  aria-selected={activeKey === group.key}
                                  onClick={() => setActiveStudentGroup(group.key)}
                                  className={`flex-1 flex justify-center items-center gap-3 min-w-[120px] px-5 py-2 rounded-lg text-sm font-medium transition-all select-none ${
                                    activeKey === group.key
                                      ? 'bg-secondary text-white font-bold shadow-lg shadow-secondary/20'
                                      : 'text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                                  }`}
                                >
                                  <span className="font-headline">{group.label}</span>
                                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold tabular-nums ${
                                    activeKey === group.key
                                      ? 'bg-white/20 text-white'
                                      : 'bg-slate-700 text-slate-300'
                                  }`}>
                                    {group.count}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                          <CardGrid>
                            {activeItems.map((s) => (
                              isMobile ? (
                                <StudentMobileCard
                                  key={s.id}
                                  id={s.id}
                                  name={s.full_name}
                                  gender={s.gender || 'male'}
                                  grade={s.grade}
                                  status={s.status}
                                  billingStatus={s.has_unpaid_balance ? 'due' : 'paid'}
                                  current_group_name={s.current_group_name}
                                />
                              ) : (
                                <StudentCard
                                  key={s.id}
                                  student={s}
                                  actions={{
                                    onEdit: () => {
                                      setEditingStudent(s)
                                      setIsEditStudentModalOpen(true)
                                    },
                                    onDelete: () => handleSoftDeleteWithConfirm(s),
                                  }}
                                />
                              )
                            ))}
                          </CardGrid>
                        </>
                      )
                    })()
                  )}
                </>
              )}
              </ErrorBoundary>
            </div>
          )}
          {activeTab === 'parents' && (
            <div role="tabpanel" id="tabpanel-parents" aria-labelledby="tab-btn-parents">
              <ErrorBoundary>
              {isLoading ? (
                <CardGrid>
                  {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
                </CardGrid>
              ) : parents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                  <span aria-hidden="true" className="material-symbols-outlined text-5xl mb-3">search</span>
                  <p className="text-sm">
                    {searchTerm.length >= 2 ? t('empty.no_parents_match_search') : t('empty.no_parents')}
                  </p>
                </div>
              ) : (
                <CardGrid>
                  {parents.map((p) => (
                    isMobile ? (
                      <ParentMobileCard
                        key={p.id}
                        id={p.id}
                        name={p.full_name}
                        phone={p.phone_primary}
                        studentCount={p.student_count || 0}
                      />
                    ) : (
                      <ParentCard
                        key={p.id}
                        parent={p}
                        actions={{}}
                      />
                    )
                  ))}
                </CardGrid>
              )}
              </ErrorBoundary>
            </div>
          )}
          {activeTab === 'advanced' && (
            <div role="tabpanel" id="tabpanel-advanced" aria-labelledby="tab-btn-advanced" className="space-y-4">
              {/* Filter Panel - Horizontal Pills */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                {/* Top Action Bar */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-headline font-semibold text-on-surface flex items-center gap-2">
                    <span aria-hidden="true" className="material-symbols-outlined text-secondary">tune</span>
                    {t('filter_panel.title')}
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleResetFilters}
                      disabled={!hasActiveFilters}
                      className="px-4 py-2 bg-slate-100 text-slate-600 font-medium rounded-lg hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 text-sm"
                    >
                      <span aria-hidden="true" className="material-symbols-outlined text-[18px]">refresh</span>
                      {t('filter_panel.reset')}
                    </button>
                    <button
                      onClick={handleApplyFilters}
                      disabled={!hasActiveFilters}
                      className="px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 text-sm"
                    >
                      <span aria-hidden="true" className="material-symbols-outlined text-[18px]">search</span>
                      {t('filter_panel.apply')}
                    </button>
                  </div>
                </div>

                <AdvancedSearchPanel
                  filters={filters}
                  onFilterChange={setFilter}
                  onApply={handleApplyFilters}
                  onReset={handleResetFilters}
                  hasActiveFilters={hasActiveFilters}
                  activeFilters={getActiveFiltersArray()}
                  onRemoveFilter={(id) => {
                    // Remove specific filter by resetting its value
                    switch (id) {
                      case 'age':
                        setFilter('ageMin', '')
                        setFilter('ageMax', '')
                        break
                      case 'status':
                        setFilter('status', [])
                        break
                      case 'gender':
                        setFilter('gender', [])
                        break
                      case 'days':
                        setFilter('groupDays', [])
                        break
                      case 'instructor':
                        setFilter('instructorName', '')
                        break
                      case 'balance':
                        setFilter('hasUnpaidBalance', null)
                        break
                      case 'enrollments':
                        setFilter('enrollmentCountMin', '')
                        setFilter('enrollmentCountMax', '')
                        break
                      case 'dates':
                        setFilter('enrollmentDateFrom', '')
                        setFilter('enrollmentDateTo', '')
                        break
                      case 'excludeCourseIds':
                        setFilter('excludeCourseIds', [])
                        break
                      case 'courseEnrollmentDates':
                        setFilter('courseEnrollmentDateFrom', '')
                        setFilter('courseEnrollmentDateTo', '')
                        break
                      case 'activityCount':
                        setFilter('minActivityCount', '')
                        setFilter('maxActivityCount', '')
                        break
                      case 'activityTypes':
                        setFilter('activityTypes', [])
                        break
                      case 'activityDates':
                        setFilter('activityDateFrom', '')
                        setFilter('activityDateTo', '')
                        break
                      case 'activitySearch':
                        setFilter('activitySearchTerm', '')
                        break
                    }
                  }}
                />
              </div>

              {/* Results Area */}
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                {/* Group by selector for filtered results */}
                <div className="flex justify-between items-center mb-4">
                  {appliedFilters && (
                    <div className="text-sm text-slate-600" dangerouslySetInnerHTML={{ __html: t('filter_panel.found_count', { count: filteredTotal ?? 0 }) }} />
                  )}
                  <StudentGroupBySelector
                    value={filterGroupBy}
                    onChange={(newGroupBy) => {
                      setFilterGroupBy(newGroupBy as 'none' | 'status' | 'age')
                      setFilterPage(1)
                      setActiveFilterGroup('')
                    }}
                    mode="students"
                    disabled={!appliedFilters}
                  />
                </div>

                {/* Cards - flat or grouped */}
                {filterGroupBy === 'none' ? (
                  <>
                    {isLoadingFiltered ? (
                      <CardGrid>
                        {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
                      </CardGrid>
                    ) : !appliedFilters ? (
                      <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                        <span aria-hidden="true" className="material-symbols-outlined text-5xl mb-3">filter_list</span>
                        <p className="text-sm">{t('filter_panel.select_filters_hint')}</p>
                      </div>
                    ) : !filteredStudents || filteredStudents.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                        <span aria-hidden="true" className="material-symbols-outlined text-5xl mb-3">search</span>
                        <p className="text-sm">{t('empty.no_filtered_students')}</p>
                      </div>
                    ) : (
                      <CardGrid>
                        {(filteredStudents ?? []).map((s) => (
                          isMobile ? (
                            <StudentMobileCard
                              key={s.id}
                              id={s.id}
                              name={s.full_name}
                              gender={s.gender || 'male'}
                              grade={s.grade}
                              status={s.status}
                              billingStatus={s.has_unpaid_balance ? 'due' : 'paid'}
                              current_group_name={s.current_group_name}
                            />
                          ) : (
                            <StudentCard
                              key={s.id}
                              student={s}
                              actions={{
                                onEdit: () => {
                                  setEditingStudent(toStudentListItem(s))
                                  setIsEditStudentModalOpen(true)
                                },
                                onDelete: () => handleSoftDeleteWithConfirm(s),
                              }}
                            />
                          )
                        ))}
                      </CardGrid>
                    )}
                  </>
                ) : (
                  <>
                    {isLoadingFilteredGrouped ? (
                      <CardGrid>
                        {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
                      </CardGrid>
                    ) : !appliedFilters ? (
                      <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                        <span aria-hidden="true" className="material-symbols-outlined text-5xl mb-3">filter_list</span>
                        <p className="text-sm">{t('filter_panel.select_filters_hint')}</p>
                      </div>
                    ) : !filteredGroupedData || filteredGroupedData.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                        <span aria-hidden="true" className="material-symbols-outlined text-5xl mb-3">search</span>
                        <p className="text-sm">{t('empty.no_filtered_students')}</p>
                      </div>
                    ) : (
                      (() => {
                        const groupMap = new Map(filteredGroupedData.map(g => [g.key, g]))
                        const defaultKey = filteredGroupedData[0]?.key ?? ''
                        const activeKey = (activeFilterGroup || defaultKey) && groupMap.has(activeFilterGroup || defaultKey)
                          ? (activeFilterGroup || defaultKey)
                          : defaultKey
                        const activeItems = groupMap.get(activeKey)?.items ?? []
                        return (
                          <>
                            <div className="overflow-x-auto mb-4">
                              <div role="tablist" aria-label="Filtered student groups" className="flex min-w-full w-max items-center gap-1 rounded-xl bg-slate-800 p-2"
                                onKeyDown={(e) => handleGroupTabKeyDown(e, filteredGroupedData, activeKey, setActiveFilterGroup)}>
                                {filteredGroupedData.map((group) => (
                                  <button
                                    key={group.key}
                                    role="tab"
                                    aria-selected={activeKey === group.key}
                                    onClick={() => setActiveFilterGroup(group.key)}
                                    className={`flex-1 flex justify-center items-center gap-3 min-w-[120px] px-5 py-2 rounded-lg text-sm font-medium transition-all select-none ${
                                      activeKey === group.key
                                        ? 'bg-secondary text-white font-bold shadow-lg shadow-secondary/20'
                                        : 'text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                                    }`}
                                  >
                                    <span className="font-headline">{group.label}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold tabular-nums ${
                                      activeKey === group.key
                                        ? 'bg-white/20 text-white'
                                        : 'bg-slate-700 text-slate-300'
                                    }`}>
                                      {group.count}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            </div>
                            <CardGrid>
                              {activeItems.map((s) => (
                                isMobile ? (
                                  <StudentMobileCard
                                    key={s.id}
                                    id={s.id}
                                    name={s.full_name}
                                    gender={s.gender || 'male'}
                                    grade={s.grade}
                                    status={s.status}
                                    billingStatus={s.has_unpaid_balance ? 'due' : 'paid'}
                                    current_group_name={s.current_group_name}
                                  />
                                ) : (
                                  <StudentCard
                                    key={s.id}
                                    student={s}
                                    actions={{
                                      onEdit: () => {
                                        setEditingStudent(s)
                                        setIsEditStudentModalOpen(true)
                                      },
                                      onDelete: () => handleSoftDeleteWithConfirm(s),
                                    }}
                                  />
                                )
                              ))}
                            </CardGrid>
                          </>
                        )
                      })()
                    )}
                  </>
                  )}
                </div>
              </div>
            )}

        {/* Pagination - only show when not searching and not on advanced tab */}
          {searchTerm.length < 2 && activeTab !== 'advanced' && (
            <div className="mt-6 pt-4 border-t border-slate-200">
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil((activeTab === 'students' ? totalStudents : activeTab === 'waiting' ? waitingStudents.length : totalParents) / pageSize)}
                totalRecords={activeTab === 'students' ? totalStudents : activeTab === 'waiting' ? waitingStudents.length : totalParents}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={(newSize) => {
                  setPageSize(newSize)
                  setCurrentPage(1)
                }}
                pageSizeOptions={[10, 25, 50, 100]}
                showTotalInfo={true}
                loading={isLoading}
              />
            </div>
          )}
        </PageSection>

      {/* Create Student Modal */}
      <Modal
        isOpen={isCreateStudentModalOpen}
        onClose={() => setIsCreateStudentModalOpen(false)}
        title={t('modal.create_student')}
      >
        <Suspense fallback={<div className="h-64 bg-slate-50 rounded-xl animate-pulse" />}>
          <StudentForm
            onSubmit={(data: CreateStudentDTO, parent: ParentListItem | null, status: StudentStatus, initialActivity?: { activity_type: string; description: string }) =>
              handleCreateStudentAndRedirect(data, parent, status, initialActivity)
            }
            onCancel={() => setIsCreateStudentModalOpen(false)}
            mode="create"
            onSearchParents={searchParents}
          />
        </Suspense>
      </Modal>

      {/* Edit Student Modal */}
      <Modal
        isOpen={isEditStudentModalOpen}
        onClose={() => {
          setIsEditStudentModalOpen(false)
          setEditingStudent(null)
        }}
        title={t('modal.edit_student')}
      >
        <Suspense fallback={<div className="h-64 bg-slate-50 rounded-xl animate-pulse" />}>
          <StudentForm
            initialData={editingStudent || undefined}
            initialStatus={editingStudent?.status || 'active'}
            onSubmit={async (data: CreateStudentDTO, parent: ParentListItem | null, status: StudentStatus) => {
              if (!editingStudent) return
              await handleEditStudent(editingStudent, data, parent, status)
            }}
            onCancel={() => {
              setIsEditStudentModalOpen(false)
              setEditingStudent(null)
            }}
            mode="edit"
          />
        </Suspense>
      </Modal>

      {/* Create Parent Modal */}
      <Modal
        isOpen={isCreateParentModalOpen}
        onClose={() => setIsCreateParentModalOpen(false)}
        title={t('modal.create_parent')}
      >
        <Suspense fallback={<div className="h-64 bg-slate-50 rounded-xl animate-pulse" />}>
          <ParentForm
            onSubmit={handleCreateParent}
            onCancel={() => setIsCreateParentModalOpen(false)}
            mode="create"
          />
        </Suspense>
      </Modal>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        variant={confirmDialog.variant}
        confirmText={confirmDialog.confirmText}
        cancelText={t('confirm.cancel')}
      />

      {/* Waiting List Enrollment Modal */}
      <Modal
        isOpen={isWaitingEnrollModalOpen}
        onClose={() => {
          setIsWaitingEnrollModalOpen(false)
          setSelectedWaitingStudent(null)
        }}
        title={t('modal.enroll_student', { name: selectedWaitingStudent?.full_name || tCommon('labels.student') })}
        size="xl"
      >
        <Suspense fallback={<div className="h-64 bg-slate-50 rounded-xl animate-pulse" />}>
          <EnrollPanel
            useMockData={false}
            isLoading={isEnrollPanelLoading}
            setIsLoading={setIsEnrollPanelLoading}
            preSelectedStudent={selectedWaitingStudent}
            onEnrollmentSuccess={() => {
              setIsWaitingEnrollModalOpen(false)
              setSelectedWaitingStudent(null)
            showToast(t('enroll_toast.success'), 'success')
          }}
          />
        </Suspense>
      </Modal>

      {/* Toast Notifications */}
      {ToastComponent}
    </div>
  )
}
