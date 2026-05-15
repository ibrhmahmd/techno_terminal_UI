import { useState, useCallback } from 'react'
import { TopNavbar } from '../components/dashboard/TopNavbar'
import { Pagination, PageHeader, PageSection, ActionButton, SearchBar, Modal, ConfirmDialog } from '../components/common'
import { useToast } from '../components/common/Toast'
import { StudentForm } from '../components/crm/StudentForm'
import { ParentForm } from '../components/crm/ParentForm'
import { WaitingListPanel } from '../components/crm/WaitingListPanel'
import { EnrollPanel } from '../components/enrollments/EnrollPanel'
import { useSearch } from '../hooks/useSearch'
import { useDirectoryData } from '../hooks/directory/useDirectoryData'
import { useStudentActions } from '../components/directory/hooks/useStudentActions'
import { useAdvancedSearch } from '../hooks/directory/useAdvancedSearch'
import { AdvancedSearchPanel } from '../components/directory/AdvancedSearchPanel'
import { createParent, searchParents, type StudentListItem, type StudentFilterItem, type StudentFilterParams, type StudentWithDetails, type CreateStudentDTO, type ParentListItem, type StudentStatus } from '../api/crm'

type CreateStudentInput = CreateStudentDTO
import { StudentCard } from '../components/directory/StudentCard'
import { ParentCard } from '../components/directory/ParentCard'
import { CardGrid } from '../components/directory/CardGrid'
import { CardSkeleton } from '../components/directory/shared/CardSkeleton'
import { DirectoryTabs } from '../components/directory/DirectoryTabs'
import { AlphabetSlider } from '../components/directory/AlphabetSlider'
import { StudentGroupBySelector } from '../components/directory/StudentGroupBySelector'
import type { StudentGroupBy, WaitingGroupBy } from '../config/studentGrouping'

export function DirectoryPage() {
  const { showToast, ToastComponent } = useToast()
  const [activeTab, setActiveTab] = useState<'students' | 'parents' | 'waiting' | 'advanced'>('students')

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
    data: CreateStudentInput,
    parent: ParentListItem | null,
    status: StudentStatus
  ) => {
    await handleCreateStudent(data, parent, status)
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
  const displayStudents = students.filter((s) => s.status !== 'waiting')

  // Handle create parent
  const handleCreateParent = useCallback(
    async (data: Parameters<typeof createParent>[0]) => {
      try {
        await createParent(data)
        showToast('Parent created successfully', 'success')
        setIsCreateParentModalOpen(false)
      } catch {
        showToast('Failed to create parent', 'error')
      }
    },
    [showToast]
  )

  // Handle soft delete with confirmation
  const handleSoftDeleteWithConfirm = useCallback(
    (student: StudentListItem | StudentFilterItem) => {
      setConfirmDialog({
        isOpen: true,
        title: 'Move to Trash',
        message: `Are you sure you want to move "${student.full_name}" to the trash? You can restore them later.`,
        variant: 'warning',
        confirmText: 'Move to Trash',
        onConfirm: () => {
          handleSoftDeleteStudent(student as StudentListItem)
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
        title: 'Permanently Delete',
        message: `Are you sure you want to permanently delete "${student.full_name}"? This action cannot be undone.`,
        variant: 'danger',
        confirmText: 'Delete Permanently',
        onConfirm: () => {
          handleHardDeleteStudent(student as StudentListItem)
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

  return (
    <div className="min-h-screen bg-surface">
      <TopNavbar activePage="Directory" />

      {/* Header */}
      <PageHeader 
        title="Directory"
        count={activeTab === 'students' ? totalStudents : activeTab === 'advanced' ? (filteredTotal ?? 0) : totalParents}
        subtitle="Browse and manage students and parents"
        actions={
          <>
            <SearchBar
              placeholder="Search by name or phone..."
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
                Add {activeTab === 'parents' ? 'Parent' : 'Student'}
              </ActionButton>
            )}
          </>
        }
      />

      {/* Tab Navigation */}
      <DirectoryTabs
        activeTab={activeTab}
        waitingCount={waitingStudents.length}
        onTabChange={handleTabChange}
      />

        {/* Content */}
        <PageSection>
          {activeTab === 'students' && (
            <>
              {/* Group by selector and deleted toggle */}
              <div className="flex justify-end items-center mb-4">
                <StudentGroupBySelector
                  value={studentGroupBy}
                  onChange={(newGroupBy) => {
                    setStudentGroupBy(newGroupBy as StudentGroupBy)
                    setStudentGroupedPage(1)
                    setCurrentPage(1)
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
                              ? (selectedLetter ? `No deleted students found starting with "${selectedLetter}"` : 'No deleted students found')
                              : searchTerm.length >= 2 
                                ? 'No students match your search' 
                                : (selectedLetter ? `No students found starting with "${selectedLetter}"` : 'No students found')
                            return (
                              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                                <span className="material-symbols-outlined text-5xl mb-3">
                                  {studentGroupBy === 'deleted' ? 'delete' : 'search'}
                                </span>
                                <p className="text-sm">{msg}</p>
                              </div>
                            )
                          }
                          return (
                            <CardGrid>
                              {items.map((s) => (
                                <StudentCard
                                  key={s.id}
                                  student={s}
                                  isDeleted={studentGroupBy === 'deleted'}
                                  actions={{
                                    onEdit: () => {
                                      setEditingStudent(s as StudentListItem)
                                      setIsEditStudentModalOpen(true)
                                    },
                                    onDelete: () => handleSoftDeleteWithConfirm(s),
                                    onRestore: () => handleRestoreStudent(s),
                                    onPermanentDelete: () => handleHardDeleteWithConfirm(s),
                                  }}
                                />
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
                          <span className="material-symbols-outlined text-5xl mb-3">inbox</span>
                          <p className="text-sm">No students found</p>
                        </div>
                      ) : (
                        (() => {
                          const activeKey = activeStudentGroup || studentsGroupedData[0]?.key || ''
                          const activeItems = studentsGroupedData.find(g => g.key === activeKey)?.items ?? []
                          return (
                            <>
                              <div className="overflow-x-auto mb-4">
                                <div className="flex min-w-full w-max items-center gap-1 rounded-xl bg-slate-800 p-1.5">
                                  {studentsGroupedData.map((group) => (
                                    <button
                                      key={group.key}
                                      onClick={() => setActiveStudentGroup(group.key)}
                                      className={`flex-1 flex justify-center items-center gap-2.5 min-w-[120px] px-5 py-2 rounded-lg text-sm font-medium transition-all select-none ${
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
                                  <StudentCard
                                    key={s.id}
                                    student={s}
                                    actions={{
                                      onEdit: () => {
                                        setEditingStudent(s as unknown as StudentListItem)
                                        setIsEditStudentModalOpen(true)
                                      },
                                      onDelete: () => handleSoftDeleteWithConfirm(s),
                                      onRestore: () => handleRestoreStudent(s),
                                      onPermanentDelete: () => handleHardDeleteWithConfirm(s),
                                    }}
                                  />
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
            </>
          )}
          {activeTab === 'waiting' && (
            <>
              {/* Group by selector for waiting list */}
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-on-surface">
                  Waiting List ({waitingStudents.length} students)
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
                      <span className="material-symbols-outlined text-5xl mb-3">inbox</span>
                      <p className="text-sm">No waiting students found</p>
                    </div>
                  ) : (
                    (() => {
                      const activeKey = activeStudentGroup || waitingGroupedData[0]?.key || ''
                      const activeItems = waitingGroupedData.find(g => g.key === activeKey)?.items ?? []
                      return (
                        <>
                          <div className="overflow-x-auto mb-4">
                            <div className="flex min-w-full w-max items-center gap-1 rounded-xl bg-slate-800 p-1.5">
                              {waitingGroupedData.map((group) => (
                                <button
                                  key={group.key}
                                  onClick={() => setActiveStudentGroup(group.key)}
                                  className={`flex-1 flex justify-center items-center gap-2.5 min-w-[120px] px-5 py-2 rounded-lg text-sm font-medium transition-all select-none ${
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
                              <StudentCard
                                key={s.id}
                                student={s}
                                actions={{
                                  onEdit: () => {
                                    setEditingStudent(s as StudentListItem)
                                    setIsEditStudentModalOpen(true)
                                  },
                                  onDelete: () => handleSoftDeleteWithConfirm(s),
                                }}
                              />
                            ))}
                          </CardGrid>
                        </>
                      )
                    })()
                  )}
                </>
              )}
            </>
          )}
          {activeTab === 'parents' && (
            <>
              {isLoading ? (
                <CardGrid>
                  {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
                </CardGrid>
              ) : parents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                  <span className="material-symbols-outlined text-5xl mb-3">search</span>
                  <p className="text-sm">
                    {searchTerm.length >= 2 ? 'No parents match your search' : 'No parents found'}
                  </p>
                </div>
              ) : (
                <CardGrid>
                  {parents.map((p) => (
                    <ParentCard
                      key={p.id}
                      parent={p}
                      actions={{}}
                    />
                  ))}
                </CardGrid>
              )}
            </>
          )}
          {activeTab === 'advanced' && (
            <div className="space-y-4">
              {/* Filter Panel - Horizontal Pills */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                {/* Top Action Bar */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-headline font-semibold text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary">tune</span>
                    Filter Students
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleResetFilters}
                      disabled={!hasActiveFilters}
                      className="px-4 py-2 bg-slate-100 text-slate-600 font-medium rounded-lg hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 text-sm"
                    >
                      <span className="material-symbols-outlined text-[18px]">refresh</span>
                      Reset
                    </button>
                    <button
                      onClick={handleApplyFilters}
                      disabled={!hasActiveFilters}
                      className="px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 text-sm"
                    >
                      <span className="material-symbols-outlined text-[18px]">search</span>
                      Apply
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
                    }
                  }}
                />
              </div>

              {/* Results Area */}
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                {/* Group by selector for filtered results */}
                <div className="flex justify-between items-center mb-4">
                  {appliedFilters && (
                    <div className="text-sm text-slate-600">
                      Found <span className="font-semibold text-secondary">{filteredTotal ?? 0}</span> students
                    </div>
                  )}
                  <StudentGroupBySelector
                    value={filterGroupBy}
                    onChange={(newGroupBy) => {
                      setFilterGroupBy(newGroupBy as 'none' | 'status' | 'age')
                      setFilterPage(1)
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
                        <span className="material-symbols-outlined text-5xl mb-3">filter_list</span>
                        <p className="text-sm">Select filters and click Apply to search</p>
                      </div>
                    ) : !filteredStudents || filteredStudents.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                        <span className="material-symbols-outlined text-5xl mb-3">search</span>
                        <p className="text-sm">No students match your filters</p>
                      </div>
                    ) : (
                      <CardGrid>
                        {(filteredStudents ?? []).map((s) => (
                          <StudentCard
                            key={s.id}
                            student={s}
                            actions={{
                              onEdit: () => {
                                setEditingStudent(s as unknown as StudentListItem)
                                setIsEditStudentModalOpen(true)
                              },
                              onDelete: () => handleSoftDeleteWithConfirm(s),
                            }}
                          />
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
                        <span className="material-symbols-outlined text-5xl mb-3">filter_list</span>
                        <p className="text-sm">Select filters and click Apply to search</p>
                      </div>
                    ) : !filteredGroupedData || filteredGroupedData.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                        <span className="material-symbols-outlined text-5xl mb-3">search</span>
                        <p className="text-sm">No students match your filters</p>
                      </div>
                    ) : (
                      (() => {
                        const activeKey = activeFilterGroup || filteredGroupedData[0]?.key || ''
                        const activeItems = filteredGroupedData.find(g => g.key === activeKey)?.items ?? []
                        return (
                          <>
                            <div className="overflow-x-auto mb-4">
                              <div className="flex min-w-full w-max items-center gap-1 rounded-xl bg-slate-800 p-1.5">
                                {filteredGroupedData.map((group) => (
                                  <button
                                    key={group.key}
                                    onClick={() => setActiveFilterGroup(group.key)}
                                    className={`flex-1 flex justify-center items-center gap-2.5 min-w-[120px] px-5 py-2 rounded-lg text-sm font-medium transition-all select-none ${
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
                                <StudentCard
                                  key={s.id}
                                  student={s}
                                  actions={{
                                    onEdit: () => {
                                      setEditingStudent(s as StudentListItem)
                                      setIsEditStudentModalOpen(true)
                                    },
                                    onDelete: () => handleSoftDeleteWithConfirm(s),
                                  }}
                                />
                              ))}
                            </CardGrid>
                          </>
                        )
                      })()
                    )}
                  </>
                )}
              </div>

              {/* Pagination for filtered results */}
              {appliedFilters && (
                <div className="mt-6 pt-4 border-t border-slate-200">
                  <Pagination
                    currentPage={filterPage}
                    totalPages={Math.ceil((filteredTotal ?? 0) / 25)}
                    totalRecords={filteredTotal ?? 0}
                    pageSize={25}
                    onPageChange={setFilterPage}
                    pageSizeOptions={[10, 25, 50, 100]}
                    showTotalInfo={true}
                    loading={isLoadingFiltered}
                  />
                </div>
              )}
            </div>
          )}
          
          {/* Pagination - only show when not searching and not on advanced tab */}
          {searchTerm.length < 2 && activeTab !== 'advanced' && (
            <div className="mt-6 pt-4 border-t border-slate-200">
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil((activeTab === 'students' ? totalStudents : totalParents) / pageSize)}
                totalRecords={activeTab === 'students' ? totalStudents : totalParents}
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
        title="Create Student"
      >
        <StudentForm
          onSubmit={(data, parent, status) =>
            handleCreateStudentAndRedirect(data, parent, status)
          }
          onCancel={() => setIsCreateStudentModalOpen(false)}
          mode="create"
          onSearchParents={searchParents}
        />
      </Modal>

      {/* Edit Student Modal */}
      <Modal
        isOpen={isEditStudentModalOpen}
        onClose={() => {
          setIsEditStudentModalOpen(false)
          setEditingStudent(null)
        }}
        title="Edit Student"
      >
        <StudentForm
          initialData={editingStudent || undefined}
          initialStatus={editingStudent?.status || 'active'}
          onSubmit={(data, parent, status) =>
            handleEditStudent(editingStudent!, data, parent, status)
          }
          onCancel={() => {
            setIsEditStudentModalOpen(false)
            setEditingStudent(null)
          }}
          mode="edit"
        />
      </Modal>

      {/* Create Parent Modal */}
      <Modal
        isOpen={isCreateParentModalOpen}
        onClose={() => setIsCreateParentModalOpen(false)}
        title="Create Parent"
      >
        <ParentForm
          onSubmit={handleCreateParent}
          onCancel={() => setIsCreateParentModalOpen(false)}
          mode="create"
        />
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
        cancelText="Cancel"
      />

      {/* Waiting List Enrollment Modal */}
      <Modal
        isOpen={isWaitingEnrollModalOpen}
        onClose={() => {
          setIsWaitingEnrollModalOpen(false)
          setSelectedWaitingStudent(null)
        }}
        title={`Enroll ${selectedWaitingStudent?.full_name || 'Student'}`}
        size="xl"
      >
        <EnrollPanel
          useMockData={false}
          isLoading={isEnrollPanelLoading}
          setIsLoading={setIsEnrollPanelLoading}
          preSelectedStudent={selectedWaitingStudent}
          onEnrollmentSuccess={() => {
            setIsWaitingEnrollModalOpen(false)
            setSelectedWaitingStudent(null)
            showToast('Student enrolled successfully!', 'success')
          }}
        />
      </Modal>

      {/* Toast Notifications */}
      {ToastComponent}
    </div>
  )
}
