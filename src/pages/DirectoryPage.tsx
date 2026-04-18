import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { TopNavbar } from '../components/dashboard/TopNavbar'
import { DataTable, type DataTableColumn, Pagination, PageHeader, PageSection, ActionButton, SearchBar, Modal } from '../components/common'
import { StudentForm } from '../components/crm/StudentForm'
import { ParentForm } from '../components/crm/ParentForm'
import { WaitingListPanel } from '../components/crm/WaitingListPanel'
import { useSearch } from '../hooks/useSearch'
import { useStudentsGrouped } from '../hooks/useStudentsGrouped'
import {
  searchParents,
  linkParentToStudent,
  updateStudentStatus,
  type StudentListItem,
  type ParentListItem,
  type CreateStudentDTO,
  type UpdateStudentDTO,
  type ParentCreate,
  type StudentStatus
} from '../api/crm'
import type { StudentGroup } from '../api/crm'
import {
  useStudentsList,
  useStudentsSearch,
  useParentsList,
  useParentsSearch,
  useCreateStudent,
  useUpdateStudent,
  useDeleteStudent,
  useCreateParent
} from '../hooks/useDirectory'

import { studentColumns, parentColumns } from '../components/directory/DirectoryColumns'
import { DirectoryTabs } from '../components/directory/DirectoryTabs'
import { StudentGroupBySelector } from '../components/directory/StudentGroupBySelector'
import type { StudentGroupBy, WaitingGroupBy } from '../config/studentGrouping'

export function DirectoryPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'students' | 'parents' | 'waiting'>('students')
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(15)
  
  // Modal states
  const [isCreateStudentModalOpen, setIsCreateStudentModalOpen] = useState(false)
  const [isEditStudentModalOpen, setIsEditStudentModalOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState<StudentListItem | null>(null)
  const [isCreateParentModalOpen, setIsCreateParentModalOpen] = useState(false)

  // Use shared search hook
  const { searchTerm, setSearchTerm, debouncedSearch, clearSearch } = useSearch({
    debounceMs: 300,
    minLength: 2
  })

  // Grouping state for students and waiting tabs
  const [studentGroupBy, setStudentGroupBy] = useState<StudentGroupBy>('none')
  const [waitingGroupBy, setWaitingGroupBy] = useState<WaitingGroupBy>('none')
  const [studentGroupedPage, setStudentGroupedPage] = useState(1)
  const [waitingGroupedPage, setWaitingGroupedPage] = useState(1)
  const groupedPageSize = 15

  // React Query driving data fetching
  const isSearching = debouncedSearch.length >= 2

  // Grouped data fetching (lazy - only when grouping is active)
  const { data: studentsGroupedResult, isLoading: isLoadingStudentsGrouped } =
    useStudentsGrouped({
      groupBy: studentGroupBy === 'none' ? 'status' : studentGroupBy,
      pagination: { page: studentGroupedPage, pageSize: groupedPageSize },
      tab: 'students',
      enabled: activeTab === 'students' && studentGroupBy !== 'none' && !isSearching,
    })

  const { data: waitingGroupedResult, isLoading: isLoadingWaitingGrouped } =
    useStudentsGrouped({
      groupBy: waitingGroupBy === 'none' ? 'age' : waitingGroupBy,
      pagination: { page: waitingGroupedPage, pageSize: groupedPageSize },
      tab: 'waiting',
      enabled: activeTab === 'waiting' && waitingGroupBy !== 'none' && !isSearching,
    })

  const studentsListQuery = useStudentsList(currentPage, pageSize, (activeTab === 'students' || activeTab === 'waiting') && !isSearching)
  const studentsSearchQuery = useStudentsSearch(debouncedSearch)
  
  const parentsListQuery = useParentsList(currentPage, pageSize, activeTab === 'parents' && !isSearching)
  const parentsSearchQuery = useParentsSearch(debouncedSearch)

  const isLoading = studentsListQuery.isLoading || studentsSearchQuery.isLoading || parentsListQuery.isLoading || parentsSearchQuery.isLoading

  const students = isSearching ? (studentsSearchQuery.data ?? []) : (studentsListQuery.data?.items ?? [])
  const totalStudents = isSearching ? students.length : (studentsListQuery.data?.total ?? 0)

  const parents = isSearching ? (parentsSearchQuery.data ?? []) : (parentsListQuery.data?.items ?? [])
  const totalParents = isSearching ? parents.length : (parentsListQuery.data?.total ?? 0)

  // Reset search, grouping, and reload data when tab changes
  const handleTabChange = useCallback((tab: 'students' | 'parents' | 'waiting') => {
    setActiveTab(tab)
    clearSearch()
    setCurrentPage(1)
    // Reset grouping when switching tabs
    setStudentGroupBy('none')
    setWaitingGroupBy('none')
    setStudentGroupedPage(1)
    setWaitingGroupedPage(1)
  }, [clearSearch])

  // BUG-23: Use API results directly - no double filtering
  const displayStudents = students.filter(s => s.status !== 'waiting')
  const displayParents = parents
  const waitingStudents = useMemo(() => students.filter(s => s.status === 'waiting'), [students])

  // Transform grouped API response → GroupItem<StudentListItem>[] for DataTable
  const studentsGroupedData = useMemo(() => {
    if (!studentsGroupedResult || studentGroupBy === 'none') return undefined

    return studentsGroupedResult.groups.map((group) => ({
      key: group.key,
      label: group.label,
      count: group.count,
      items: group.students,
    }))
  }, [studentsGroupedResult, studentGroupBy])

  const waitingGroupedData = useMemo(() => {
    if (!waitingGroupedResult || waitingGroupBy === 'none') return undefined

    return waitingGroupedResult.groups.map((group) => ({
      key: group.key,
      label: group.label,
      count: group.count,
      items: group.students,
    }))
  }, [waitingGroupedResult, waitingGroupBy])

  const createStudentMutation = useCreateStudent()
  const updateStudentMutation = useUpdateStudent()
  const deleteStudentMutation = useDeleteStudent()
  const createParentMutation = useCreateParent()

  const handleCreateStudent = async (data: CreateStudentDTO, selectedParent: ParentListItem | null, status: StudentStatus) => {
    try {
      const newStudent = await createStudentMutation.mutateAsync(data)
      
      // Set initial status if not 'active' (default)
      if (status !== 'active') {
        try {
          await updateStudentStatus(newStudent.id, { status })
        } catch (statusError) {
          console.error('Failed to set student status:', statusError)
          setError('Student created but failed to set status. You can update status from the student detail page.')
          return
        }
      }
      
      // If a parent was selected, link them to the student
      if (selectedParent) {
        try {
          await linkParentToStudent(newStudent.id, selectedParent.id)
        } catch (linkError) {
          console.error('Failed to link parent:', linkError)
          setError('Student created but failed to link parent. You can link manually from the student detail page.')
          return
        }
      }
      
      setIsCreateStudentModalOpen(false)
      setError(null)
    } catch {
      setError('Failed to create student')
    }
  }

  const handleEditStudent = async (data: UpdateStudentDTO, _selectedParent: ParentListItem | null, status: StudentStatus) => {
    if (!editingStudent) return
    try {
      // Update student basic data
      await updateStudentMutation.mutateAsync({ id: editingStudent.id, data })
      
      // Update status if needed
      if (status !== editingStudent.status) {
        await updateStudentStatus(editingStudent.id, { status })
      }
      
      setIsEditStudentModalOpen(false)
      setEditingStudent(null)
      setError(null)
    } catch {
      setError('Failed to update student')
    }
  }

  const handleDeleteStudent = async (student: StudentListItem) => {
    if (!confirm(`Are you sure you want to delete "${student.full_name}"?`)) return
    try {
      await deleteStudentMutation.mutateAsync(student.id)
      setError(null)
    } catch {
      setError('Failed to delete student')
    }
  }

  const handleCreateParent = async (data: ParentCreate) => {
    try {
      await createParentMutation.mutateAsync(data)
      setIsCreateParentModalOpen(false)
      setError(null)
    } catch {
      setError('Failed to create parent')
    }
  }

  return (
    <div className="min-h-screen bg-surface">
      <TopNavbar activePage="Directory" />

      {/* Header */}
      <PageHeader 
        title="Directory"
        count={activeTab === 'students' ? totalStudents : totalParents}
        subtitle="Browse and manage students and parents"
        actions={
          <>
            <SearchBar
              placeholder="Search by name or phone..."
              onSearch={setSearchTerm}
              className="min-w-[220px]"
            />
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
          {error && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-100 rounded-lg text-yellow-700 text-sm">
              {error}
            </div>
          )}

          {activeTab === 'students' && (
            <>
              {/* Group by selector - disabled when searching */}
              <div className="flex justify-end mb-4">
                <StudentGroupBySelector
                  value={studentGroupBy}
                  onChange={(newGroupBy) => {
                    setStudentGroupBy(newGroupBy as StudentGroupBy)
                    setStudentGroupedPage(1)
                  }}
                  mode="students"
                  disabled={isSearching}
                />
              </div>

              {/* DataTable - flat or grouped */}
              {studentGroupBy === 'none' ? (
                <DataTable
                  data={displayStudents}
                  columns={studentColumns}
                  keyExtractor={(s) => s.id.toString()}
                  isLoading={isLoading}
                  emptyMessage={searchTerm.length >= 2 ? 'No students match your search' : 'No students found'}
                  emptyIcon="search"
                  onRowClick={(student) => navigate(`/students/${student.id}`)}
                  actions={{
                    view: (student) => navigate(`/students/${student.id}`),
                    edit: (student) => {
                      setEditingStudent(student)
                      setIsEditStudentModalOpen(true)
                    },
                    delete: handleDeleteStudent
                  }}
                />
              ) : (
                <DataTable
                  groupedData={studentsGroupedData}
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
                    delete: handleDeleteStudent
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
                  groupedData={waitingGroupedData}
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
                    delete: handleDeleteStudent
                  }}
                />
              )}
            </>
          )}
          {activeTab === 'parents' && (
            <DataTable
              data={displayParents}
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
          
          {/* Pagination - only show when not searching */}
          {searchTerm.length < 2 && (
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
          onSubmit={handleCreateStudent}
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
          onSubmit={handleEditStudent}
          onCancel={() => {
            setIsEditStudentModalOpen(false)
            setEditingStudent(null)
          }}
          mode="edit"
          onSearchParents={searchParents}
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
    </div>
  )
}
