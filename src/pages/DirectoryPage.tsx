import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { TopNavbar } from '../components/dashboard/TopNavbar'
import { DataTable, Pagination, PageHeader, PageSection, ActionButton, SearchBar, Modal, ConfirmDialog } from '../components/common'
import { useToast } from '../components/common/Toast'
import { StudentForm } from '../components/crm/StudentForm'
import { ParentForm } from '../components/crm/ParentForm'
import { WaitingListPanel } from '../components/crm/WaitingListPanel'
import { useSearch } from '../hooks/useSearch'
import { useDirectoryData, type GroupItem } from '../hooks/directory/useDirectoryData'
import { useStudentActions } from '../components/directory/hooks/useStudentActions'
import { useAdvancedSearch } from '../hooks/directory/useAdvancedSearch'
import { AdvancedSearchPanel } from '../components/directory/AdvancedSearchPanel'
import { createParent, type StudentListItem, type StudentFilterParams } from '../api/crm'
import { studentColumns, parentColumns } from '../components/directory/DirectoryColumns'
import { DirectoryTabs } from '../components/directory/DirectoryTabs'
import { StudentGroupBySelector } from '../components/directory/StudentGroupBySelector'
import type { StudentGroupBy, WaitingGroupBy } from '../config/studentGrouping'

export function DirectoryPage() {
  const navigate = useNavigate()
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

  // Advanced search filter state
  const [filterGroupBy, setFilterGroupBy] = useState<'none' | 'status' | 'age'>('none')
  const [filterPage, setFilterPage] = useState(1)
  const [appliedFilters, setAppliedFilters] = useState<StudentFilterParams | null>(null)
  const { filters, setFilter, resetFilters, hasActiveFilters, convertToApiParams, getActiveFiltersArray } = useAdvancedSearch()

  // Search state
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
  const activeStudents = students.filter((s) => s.status !== 'waiting')
  const displayStudents = activeStudents

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
    (student: StudentListItem) => {
      setConfirmDialog({
        isOpen: true,
        title: 'Move to Trash',
        message: `Are you sure you want to move "${student.full_name}" to the trash? You can restore them later.`,
        variant: 'warning',
        confirmText: 'Move to Trash',
        onConfirm: () => {
          handleSoftDeleteStudent(student)
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }))
        },
      })
    },
    [handleSoftDeleteStudent]
  )

  // Handle hard delete with confirmation
  const handleHardDeleteWithConfirm = useCallback(
    (student: StudentListItem) => {
      setConfirmDialog({
        isOpen: true,
        title: 'Permanently Delete',
        message: `Are you sure you want to permanently delete "${student.full_name}"? This action cannot be undone.`,
        variant: 'danger',
        confirmText: 'Delete Permanently',
        onConfirm: () => {
          handleHardDeleteStudent(student)
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }))
        },
      })
    },
    [handleHardDeleteStudent]
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

              {/* DataTable - flat or grouped */}
              {studentGroupBy === 'deleted' || studentGroupBy === 'none' ? (
                <DataTable
                  data={studentGroupBy === 'deleted' ? students : displayStudents}
                  columns={studentColumns}
                  keyExtractor={(s) => s.id.toString()}
                  isLoading={isLoading}
                  emptyMessage={studentGroupBy === 'deleted'
                    ? 'No deleted students found' 
                    : searchTerm.length >= 2 
                      ? 'No students match your search' 
                      : 'No students found'}
                  emptyIcon={studentGroupBy === 'deleted' ? 'trash' : 'search'}
                  onRowClick={(student) => navigate(`/students/${student.id}`)}
                  actions={studentGroupBy === 'deleted' ? {
                    view: (student) => navigate(`/students/${student.id}`),
                    restore: handleRestoreStudent,
                    delete: handleHardDeleteWithConfirm
                  } : {
                    view: (student) => navigate(`/students/${student.id}`),
                    edit: (student) => {
                      setEditingStudent(student)
                      setIsEditStudentModalOpen(true)
                    },
                    delete: handleSoftDeleteWithConfirm
                  }}
                />
              ) : (
                <DataTable
                  groupedData={studentsGroupedData ?? []}
                  columns={studentColumns}
                  keyExtractor={(s) => s.id.toString()}
                  isLoading={isLoadingStudentsGrouped}
                  emptyMessage="No students found"
                  emptyIcon="inbox"
                  onRowClick={(student) => navigate(`/students/${student.id}`)}
                  actions={{
                    view: (student) => navigate(`/students/${student.id}`),
                    edit: (student) => {
                      setEditingStudent(student)
                      setIsEditStudentModalOpen(true)
                    },
                    delete: handleSoftDeleteWithConfirm
                  }}
                />
              )}
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

              {/* DataTable - flat or grouped */}
              {waitingGroupBy === 'none' ? (
                <WaitingListPanel
                  onStudentClick={(student) => navigate(`/students/${student.id}`)}
                />
              ) : (
                <DataTable
                  groupedData={waitingGroupedData ?? []}
                  columns={studentColumns}
                  keyExtractor={(s) => s.id.toString()}
                  isLoading={isLoadingWaitingGrouped}
                  emptyMessage="No waiting students found"
                  emptyIcon="inbox"
                  onRowClick={(student) => navigate(`/students/${student.id}`)}
                  actions={{
                    view: (student) => navigate(`/students/${student.id}`),
                    edit: (student) => {
                      setEditingStudent(student)
                      setIsEditStudentModalOpen(true)
                    },
                    delete: handleSoftDeleteWithConfirm
                  }}
                />
              )}
            </>
          )}
          {activeTab === 'parents' && (
            <DataTable
              data={parents}
              columns={parentColumns}
              keyExtractor={(p) => p.id.toString()}
              isLoading={isLoading}
              emptyMessage={searchTerm.length >= 2 ? 'No parents match your search' : 'No parents found'}
              emptyIcon="search"
              onRowClick={(parent) => navigate(`/parents/${parent.id}`)}
              actions={{
                view: (parent) => navigate(`/parents/${parent.id}`),
                edit: (parent) => console.log('Edit parent:', parent),
                delete: (parent) => console.log('Delete parent:', parent)
              }}
            />
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

                {/* DataTable - flat or grouped */}
                {filterGroupBy === 'none' ? (
                  <DataTable
                    data={(filteredStudents ?? []) as StudentListItem[]}
                    columns={studentColumns}
                    keyExtractor={(s) => s.id.toString()}
                    isLoading={isLoadingFiltered}
                    emptyMessage={!appliedFilters
                      ? 'Select filters and click Apply to search'
                      : 'No students match your filters'}
                    emptyIcon={!appliedFilters ? 'filter_list' : 'search'}
                    onRowClick={(student) => navigate(`/students/${student.id}`)}
                    actions={{
                      view: (student) => navigate(`/students/${student.id}`),
                      edit: (student) => {
                        setEditingStudent(student as StudentListItem)
                        setIsEditStudentModalOpen(true)
                      },
                      delete: handleSoftDeleteWithConfirm
                    }}
                  />
                ) : (
                  <DataTable
                    groupedData={(filteredGroupedData ?? []) as GroupItem<StudentListItem>[]}
                    columns={studentColumns}
                    keyExtractor={(s) => s.id.toString()}
                    isLoading={isLoadingFilteredGrouped}
                    emptyMessage={!appliedFilters
                      ? 'Select filters and click Apply to search'
                      : 'No students match your filters'}
                    emptyIcon={!appliedFilters ? 'filter_list' : 'search'}
                    onRowClick={(student) => navigate(`/students/${student.id}`)}
                    actions={{
                      view: (student) => navigate(`/students/${student.id}`),
                      edit: (student) => {
                        setEditingStudent(student as StudentListItem)
                        setIsEditStudentModalOpen(true)
                      },
                      delete: handleSoftDeleteWithConfirm
                    }}
                  />
                )}

                {/* Pagination for filtered results */}
                {appliedFilters && (
                  <div className="mt-6 pt-4 border-t border-slate-200">
                    <Pagination
                      currentPage={filterPage}
                      totalPages={Math.ceil((filteredTotal ?? 0) / 25)}
                      pageSize={25}
                      onPageChange={setFilterPage}
                      pageSizeOptions={[25, 50, 100]}
                      showTotalInfo={true}
                      loading={isLoadingFiltered}
                    />
                  </div>
                )}
              </div>

            </div>
          )}
          
          {/* Pagination - only show when not searching and not on advanced tab */}
          {searchTerm.length < 2 && activeTab !== 'advanced' && (
            <div className="mt-6 pt-4 border-t border-slate-200">
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil((activeTab === 'students' ? totalStudents : totalParents) / pageSize)}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={(newSize) => {
                  setPageSize(newSize)
                  setCurrentPage(1)
                }}
                pageSizeOptions={[10, 25, 50, 100]}
                showTotalInfo={false}
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
            handleCreateStudent(data, parent, status)
          }
          onCancel={() => setIsCreateStudentModalOpen(false)}
          mode="create"
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

      {/* Toast Notifications */}
      {ToastComponent}
    </div>
  )
}
