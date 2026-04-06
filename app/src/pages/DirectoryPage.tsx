import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { TopNavbar } from '../components/dashboard/TopNavbar'
import { DataTable, type DataTableColumn, Pagination, PageHeader, PageSection, ActionButton, SearchBar, Modal } from '../components/common'
import { StudentForm } from '../components/crm/StudentForm'
import { ParentForm } from '../components/crm/ParentForm'
import { useSearch } from '../hooks/useSearch'
import { 
  getStudentsPaginated, 
  searchStudents, 
  getParentsPaginated, 
  searchParents, 
  createStudent,
  updateStudent,
  deleteStudent,
  createParent,
  linkParentToStudent,
  type Student, 
  type Parent 
} from '../api/crm'



// Column configuration for Students DataTable
const studentColumns: DataTableColumn<Student>[] = [
  {
    key: 'full_name',
    header: 'Name',
    cell: (student) => <span className="font-semibold text-slate-900">{student.full_name}</span>
  },
  {
    key: 'phone',
    header: 'Phone',
    cell: (student) => <span className="text-slate-600">{student.phone || '-'}</span>
  },
  {
    key: 'current_group',
    header: 'Current Group',
    cell: (student) => (
      student.current_group_name ? (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium">
          <span className="material-symbols-outlined text-sm">group</span>
          {student.current_group_name}
        </span>
      ) : (
        <span className="text-slate-400 text-xs">Not enrolled</span>
      )
    )
  },
  {
    key: 'status',
    header: 'Status',
    cell: (student) => (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
        student.is_active
          ? 'bg-green-100 text-green-700'
          : 'bg-slate-100 text-slate-600'
      }`}>
        <span className="material-symbols-outlined text-sm">
          {student.is_active ? 'check_circle' : 'cancel'}
        </span>
        {student.is_active ? 'Active' : 'Inactive'}
      </span>
    )
  },
  {
    key: 'notes',
    header: 'Notes',
    cell: (student) => <span className="text-slate-600 max-w-xs truncate">{student.notes || '-'}</span>
  }
]

// Column configuration for Parents DataTable
const parentColumns: DataTableColumn<Parent>[] = [
  {
    key: 'full_name',
    header: 'Name',
    cell: (parent) => <span className="font-semibold text-slate-900">{parent.full_name}</span>
  },
  {
    key: 'phone',
    header: 'Phone',
    cell: (parent) => <span className="text-slate-600">{parent.phone_primary || '-'}</span>
  },
  {
    key: 'email',
    header: 'Email',
    cell: (parent) => <span className="text-slate-600">{parent.email || '-'}</span>
  },
  {
    key: 'relation',
    header: 'Relation',
    cell: (parent) => <span className="text-slate-600">{parent.relation || '-'}</span>
  },
  {
    key: 'status',
    header: 'Status',
    cell: (parent) => (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
        parent.is_active
          ? 'bg-green-100 text-green-700'
          : 'bg-slate-100 text-slate-600'
      }`}>
        <span className="material-symbols-outlined text-sm">
          {parent.is_active ? 'check_circle' : 'cancel'}
        </span>
        {parent.is_active ? 'Active' : 'Inactive'}
      </span>
    )
  }
]

export function DirectoryPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'students' | 'parents' | 'waiting'>('students')
  const [students, setStudents] = useState<Student[]>([])
  const [parents, setParents] = useState<Parent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(15)
  const [totalStudents, setTotalStudents] = useState(0)
  const [totalParents, setTotalParents] = useState(0)
  
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

  // Load data on mount
  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      setError(null)
      try {
        const [studentsResult, parentsResult] = await Promise.all([
          getStudentsPaginated({ skip: 0, limit: pageSize }),
          getParentsPaginated({ skip: 0, limit: pageSize }),
        ])
        setStudents(studentsResult.items || [])
        setTotalStudents(studentsResult.total || 0)
        setParents(parentsResult.items || [])
        setTotalParents(parentsResult.total || 0)
      } catch (err) {
        console.error('API Error:', err)
        setError('Failed to load data. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [pageSize])

  // Handle search and pagination changes
  useEffect(() => {
    async function reloadOrSearch() {
      setIsLoading(true)
      try {
        if (debouncedSearch.length < 2) {
          // Reload initial paginated data
          if (activeTab === 'students') {
            const result = await getStudentsPaginated({ skip: (currentPage - 1) * pageSize, limit: pageSize })
            setStudents(result.items || [])
            setTotalStudents(result.total || 0)
          } else {
            const result = await getParentsPaginated({ skip: (currentPage - 1) * pageSize, limit: pageSize })
            setParents(result.items || [])
            setTotalParents(result.total || 0)
          }
        } else {
          // API search
          if (activeTab === 'students') {
            const data = await searchStudents(debouncedSearch)
            setStudents(data || [])
          } else {
            const data = await searchParents(debouncedSearch)
            setParents(data || [])
          }
        }
      } catch (err) {
        console.error('Search/Reload error:', err)
      } finally {
        setIsLoading(false)
      }
    }
    
    reloadOrSearch()
  }, [debouncedSearch, activeTab, currentPage, pageSize])

  // Reset search and reload data when tab changes
  const handleTabChange = useCallback((tab: 'students' | 'parents' | 'waiting') => {
    setActiveTab(tab)
    clearSearch()
    setCurrentPage(1)
    setIsLoading(true)
    async function reloadData() {
      try {
        if (tab === 'students') {
          const result = await getStudentsPaginated({ skip: 0, limit: pageSize })
          setStudents(result.items || [])
          setTotalStudents(result.total || 0)
        } else {
          const result = await getParentsPaginated({ skip: 0, limit: pageSize })
          setParents(result.items || [])
          setTotalParents(result.total || 0)
        }
      } catch (err) {
        console.error('Tab switch reload error:', err)
      } finally {
        setIsLoading(false)
      }
    }
    reloadData()
  }, [clearSearch, pageSize])

  // BUG-23: Use API results directly - no double filtering
  const displayStudents = students.filter(s => s.status !== 'waiting')
  const displayParents = parents
  const waitingStudents = useMemo(() => students.filter(s => s.status === 'waiting'), [students])

  const handleCreateStudent = async (data: Omit<Student, 'id'>, selectedParent: Parent | null) => {
    try {
      const newStudent = await createStudent(data)
      setStudents(prev => [newStudent, ...prev])
      
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
      const updatedStudent = await updateStudent(editingStudent.id, data)
      setStudents(prev => prev.map(s => s.id === updatedStudent.id ? updatedStudent : s))
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
      await deleteStudent(student.id)
      setStudents(prev => prev.filter(s => s.id !== student.id))
      setError(null)
    } catch {
      setError('Failed to delete student')
    }
  }

  const handleCreateParent = async (data: Omit<Parent, 'id'>) => {
    try {
      const newParent = await createParent(data)
      setParents(prev => [newParent, ...prev])
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
      <div className="px-8 pt-4 border-b border-slate-200">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex space-x-1">
            <button
              onClick={() => handleTabChange('students')}
              className={`px-6 py-3 text-sm font-medium transition-colors relative ${
                activeTab === 'students'
                  ? 'text-on-surface'
                  : 'text-slate-400 hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined inline-block mr-2 align-text-bottom">school</span>
              Students
              {activeTab === 'students' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary rounded-t"></span>
              )}
            </button>
            <button
              onClick={() => handleTabChange('parents')}
              className={`px-6 py-3 text-sm font-medium transition-colors relative ${
                activeTab === 'parents'
                  ? 'text-on-surface'
                  : 'text-slate-400 hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined inline-block mr-2 align-text-bottom">family_restroom</span>
              Parents
              {activeTab === 'parents' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary rounded-t"></span>
              )}
            </button>
            <button
              onClick={() => handleTabChange('waiting')}
              className={`px-6 py-3 text-sm font-medium transition-colors relative ${
                activeTab === 'waiting'
                  ? 'text-on-surface'
                  : 'text-slate-400 hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined inline-block mr-2 align-text-bottom">schedule</span>
              Waiting ({waitingStudents.length})
              {activeTab === 'waiting' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary rounded-t"></span>
              )}
            </button>
          </div>
        </div>
      </div>

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
