import { useState, useEffect, useCallback } from 'react'
import { Search, Plus } from 'lucide-react'
import { TopNavbar } from '../components/dashboard/TopNavbar'
import { StudentList } from '../components/crm/StudentList'
import { ParentList } from '../components/crm/ParentList'
import { Pagination } from '../components/common/Pagination'
import { useSearch } from '../hooks/useSearch'
import { 
  getStudentsPaginated, 
  searchStudents, 
  getParentsPaginated, 
  searchParents, 
  createStudent,
  createParent,
  linkParentToStudent,
  type Student, 
  type Parent 
} from '../api/crm'
import { Modal } from '../components/common/Modal'
import { StudentForm } from '../components/crm/StudentForm'
import { ParentForm } from '../components/crm/ParentForm'

export function DirectoryPage() {
  const [activeTab, setActiveTab] = useState<'students' | 'parents'>('students')
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
  const handleTabChange = useCallback((tab: 'students' | 'parents') => {
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
  const displayStudents = students
  const displayParents = parents

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
          // Show warning but don't fail the entire operation
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
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-8 py-6">
        <div className="max-w-[1400px] mx-auto flex items-end justify-between">
          <div>
            <h1 className="font-headline text-3xl font-bold text-on-surface tracking-tight">
              Directory 
              <span className="text-lg font-normal text-slate-500 ml-2">
                ({activeTab === 'students' ? totalStudents : totalParents} {activeTab})
              </span>
            </h1>
            <p className="text-sm text-on-surface-variant mt-2">Browse and manage students and parents</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 px-4 py-2 bg-slate-100 rounded-lg border border-slate-200">
              <Search className="w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search by name or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none outline-none text-sm text-on-surface min-w-[220px] placeholder-slate-400"
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="p-1 hover:bg-slate-200 rounded transition-colors"
                  aria-label="Clear search"
                >
                  <span className="material-symbols-outlined text-sm text-slate-500">close</span>
                </button>
              )}
            </div>
            {activeTab === 'students' ? (
              <button
                onClick={() => setIsCreateStudentModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-secondary rounded-lg hover:bg-secondary/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Student
              </button>
            ) : (
              <button
                onClick={() => setIsCreateParentModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-secondary rounded-lg hover:bg-secondary/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Parent
              </button>
            )}
          </div>
        </div>
      </header>

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
          </div>
        </div>
      </div>

        {/* Content */}
        <section className="p-8 max-w-[1400px] mx-auto">
          {error && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-100 rounded-lg text-yellow-700 text-sm">
              {error}
            </div>
          )}

          {activeTab === 'students' ? (
            <StudentList 
              students={displayStudents} 
              isLoading={isLoading} 
              emptyMessage={searchTerm.length >= 2 ? 'No students match your search' : 'No students found'}
              onEdit={(student) => {
                // TODO: Implement edit student modal
                console.log('Edit student:', student)
              }}
              onDelete={(student) => {
                // TODO: Implement delete student confirmation
                console.log('Delete student:', student)
              }}
            />
          ) : (
            <ParentList 
              parents={displayParents} 
              isLoading={isLoading}
              emptyMessage={searchTerm.length >= 2 ? 'No parents match your search' : 'No parents found'}
              onEdit={(parent) => {
                // TODO: Implement edit parent modal
                console.log('Edit parent:', parent)
              }}
              onDelete={(parent) => {
                // TODO: Implement delete parent confirmation
                console.log('Delete parent:', parent)
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
        </section>

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
