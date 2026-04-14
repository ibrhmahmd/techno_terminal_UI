import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { TopNavbar } from '../components/dashboard/TopNavbar'
import { DataTable, type DataTableColumn, Pagination, PageHeader, PageSection, ActionButton, SearchBar, Modal } from '../components/common'
import { StudentForm } from '../components/crm/StudentForm'
import { ParentForm } from '../components/crm/ParentForm'
import { useSearch } from '../hooks/useSearch'
import { 
  searchParents, 
  linkParentToStudent,
  type Student, 
  type Parent 
} from '../api/crm'
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
  type Student, 
  type Parent 
} from '../api/crm'


import { studentColumns, parentColumns } from '../components/directory/DirectoryColumns'
import { DirectoryTabs } from '../components/directory/DirectoryTabs'

export function DirectoryPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'students' | 'parents' | 'waiting'>('students')
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(15)
  
  // Modal states
  const [isCreateStudentModalOpen, setIsCreateStudentModalOpen] = useState(false)
  const [isEditStudentModalOpen, setIsEditStudentModalOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [isCreateParentModalOpen, setIsCreateParentModalOpen] = useState(false)

  // Use shared search hook
  const { searchTerm, setSearchTerm, debouncedSearch, clearSearch } = useSearch({
    debounceMs: 300,
    minLength: 2
  })

  // React Query driving data fetching
  const isSearching = debouncedSearch.length >= 2

  const studentsListQuery = useStudentsList(currentPage, pageSize, (activeTab === 'students' || activeTab === 'waiting') && !isSearching)
  const studentsSearchQuery = useStudentsSearch(debouncedSearch)
  
  const parentsListQuery = useParentsList(currentPage, pageSize, activeTab === 'parents' && !isSearching)
  const parentsSearchQuery = useParentsSearch(debouncedSearch)

  const isLoading = studentsListQuery.isLoading || studentsSearchQuery.isLoading || parentsListQuery.isLoading || parentsSearchQuery.isLoading

  const students = isSearching ? (studentsSearchQuery.data ?? []) : (studentsListQuery.data?.items ?? [])
  const totalStudents = isSearching ? students.length : (studentsListQuery.data?.total ?? 0)

  const parents = isSearching ? (parentsSearchQuery.data ?? []) : (parentsListQuery.data?.items ?? [])
  const totalParents = isSearching ? parents.length : (parentsListQuery.data?.total ?? 0)

  // Reset search and reload data when tab changes
  const handleTabChange = useCallback((tab: 'students' | 'parents' | 'waiting') => {
    setActiveTab(tab)
    clearSearch()
    setCurrentPage(1)
  }, [clearSearch])

  // BUG-23: Use API results directly - no double filtering
  const displayStudents = students.filter(s => s.status !== 'waiting')
  const displayParents = parents
  const waitingStudents = useMemo(() => students.filter(s => s.status === 'waiting'), [students])

  const createStudentMutation = useCreateStudent()
  const updateStudentMutation = useUpdateStudent()
  const deleteStudentMutation = useDeleteStudent()
  const createParentMutation = useCreateParent()

  const handleCreateStudent = async (data: Omit<Student, 'id'>, selectedParent: Parent | null) => {
    try {
      const newStudent = await createStudentMutation.mutateAsync(data)
      
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

  const handleEditStudent = async (data: Omit<Student, 'id'>) => {
    if (!editingStudent) return
    try {
      await updateStudentMutation.mutateAsync({ id: editingStudent.id, data })
      setIsEditStudentModalOpen(false)
      setEditingStudent(null)
      setError(null)
    } catch {
      setError('Failed to update student')
    }
  }

  const handleDeleteStudent = async (student: Student) => {
    if (!confirm(`Are you sure you want to delete "${student.full_name}"?`)) return
    try {
      await deleteStudentMutation.mutateAsync(student.id)
      setError(null)
    } catch {
      setError('Failed to delete student')
    }
  }

  const handleCreateParent = async (data: Omit<Parent, 'id'>) => {
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
          )}
          {activeTab === 'waiting' && (
            <DataTable
              data={waitingStudents}
              columns={studentColumns}
              keyExtractor={(s) => s.id.toString()}
              isLoading={isLoading}
              emptyMessage="No students on waiting list"
              emptyIcon="schedule"
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
