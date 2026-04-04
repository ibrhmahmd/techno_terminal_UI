import { useState, useEffect } from 'react'
import { TopNavbar } from '../components/dashboard/TopNavbar'
import { StudentList } from '../components/crm/StudentList'
import { ParentList } from '../components/crm/ParentList'
import { Modal } from '../components/common/Modal'
import { StudentForm } from '../components/crm/StudentForm'
import { ParentForm } from '../components/crm/ParentForm'
import { 
  getStudentsPaginated, 
  searchStudents, 
  getParentsPaginated, 
  searchParents, 
  createStudent,
  createParent,
  type Student, 
  type Parent 
} from '../api/crm'

export function DirectoryPage() {
  const [activeTab, setActiveTab] = useState<'students' | 'parents'>('students')
  const [students, setStudents] = useState<Student[]>([])
  const [parents, setParents] = useState<Parent[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // BUG-27: Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(15)
  const [totalStudents, setTotalStudents] = useState(0)
  const [totalParents, setTotalParents] = useState(0)
  
  // Modal states
  const [isCreateStudentModalOpen, setIsCreateStudentModalOpen] = useState(false)
  const [isCreateParentModalOpen, setIsCreateParentModalOpen] = useState(false)

  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      setError(null)
      try {
        const [studentsResult, parentsResult] = await Promise.all([
          getStudentsPaginated({ skip: 0, limit: 15 }),
          getParentsPaginated({ skip: 0, limit: 15 }),
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
  }, [])

  // BUG-26: Reload initial data when search cleared, API search when >= 2 chars
  useEffect(() => {
    async function reloadOrSearch() {
      setIsLoading(true)
      try {
        if (searchTerm.length < 2) {
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
            const data = await searchStudents(searchTerm)
            setStudents(data || [])
          } else {
            const data = await searchParents(searchTerm)
            setParents(data || [])
          }
        }
      } catch (err) {
        console.error('Search/Reload error:', err)
      } finally {
        setIsLoading(false)
      }
    }
    
    const timeout = setTimeout(reloadOrSearch, 300)
    return () => clearTimeout(timeout)
  }, [searchTerm, activeTab, currentPage, pageSize])

  // BUG-24: Reset search and reload data when tab changes
  useEffect(() => {
    setSearchTerm('')
    setIsLoading(true)
    async function reloadData() {
      try {
        if (activeTab === 'students') {
          const result = await getStudentsPaginated({ skip: 0, limit: 15 })
          setStudents(result.items || [])
          setTotalStudents(result.total || 0)
        } else {
          const result = await getParentsPaginated({ skip: 0, limit: 15 })
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
  }, [activeTab])

  // BUG-23: Use API results directly - no double filtering
  const displayStudents = students
  const displayParents = parents

  const handleCreateStudent = async (data: Omit<Student, 'id'>) => {
    try {
      const newStudent = await createStudent(data)
      setStudents(prev => [newStudent, ...prev])
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
              <span className="material-symbols-outlined text-slate-500">search</span>
              <input
                type="text"
                placeholder="Search (min 2 chars)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none outline-none text-sm text-on-surface min-w-[200px] placeholder-slate-400"
              />
            </div>
            {activeTab === 'students' ? (
              <button
                onClick={() => setIsCreateStudentModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-secondary rounded-lg hover:bg-secondary/90 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">person_add</span>
                Add Student
              </button>
            ) : (
              <button
                onClick={() => setIsCreateParentModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-secondary rounded-lg hover:bg-secondary/90 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">person_add</span>
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
              onClick={() => setActiveTab('students')}
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
              onClick={() => setActiveTab('parents')}
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
            />
          ) : (
            <ParentList 
              parents={displayParents} 
              isLoading={isLoading}
              emptyMessage={searchTerm.length >= 2 ? 'No parents match your search' : 'No parents found'}
            />
          )}
          
          {/* BUG-27: Pagination Controls - only show when not searching */}
          {searchTerm.length < 2 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">Show</span>
                <select
                  value={pageSize}
                  onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1) }}
                  className="px-2 py-1 text-sm border border-slate-200 rounded bg-white"
                >
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <span className="text-sm text-slate-500">entries per page</span>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1 || isLoading}
                  className="px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-slate-100 rounded">
                  Page {currentPage}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={displayStudents.length < pageSize && displayParents.length < pageSize || isLoading}
                  className="px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
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
