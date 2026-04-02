import { useState, useEffect } from 'react'
import { TopNavbar } from '../components/dashboard/TopNavbar'
import { StudentList } from '../components/crm/StudentList'
import { ParentList } from '../components/crm/ParentList'
import { getStudents, searchStudents, getParents, searchParents, type Student, type Parent } from '../api/crm'

// Mock data for fallback
const MOCK_STUDENTS: Student[] = [
  { id: 1, full_name: 'Ahmed Mohamed', gender: 'male', phone: '+20 123 456 7890', is_active: true, notes: '' },
  { id: 2, full_name: 'Fatima Ali', gender: 'female', phone: '+20 123 456 7891', is_active: true, notes: '' },
  { id: 3, full_name: 'Omar Hassan', gender: 'male', phone: '+20 123 456 7892', is_active: true, notes: '' },
  { id: 4, full_name: 'Aisha Ibrahim', gender: 'female', phone: null, is_active: false, notes: 'Transferred' },
]

const MOCK_PARENTS: Parent[] = [
  { id: 1, full_name: 'Mohamed Hassan', phone: '+20 111 222 3333', email: 'mohamed@example.com', is_active: true },
  { id: 2, full_name: 'Ali Kamal', phone: '+20 111 222 4444', email: 'ali@example.com', is_active: true },
  { id: 3, full_name: 'Sarah Ahmed', phone: '+20 111 222 5555', email: null, is_active: true },
]

export function DirectoryPage() {
  const [activeTab, setActiveTab] = useState<'students' | 'parents'>('students')
  const [students, setStudents] = useState<Student[]>([])
  const [parents, setParents] = useState<Parent[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      setError(null)
      try {
        const [studentsData, parentsData] = await Promise.all([
          getStudents(0, 15),
          getParents(0, 15),
        ])
        setStudents(studentsData || [])
        setParents(parentsData || [])
      } catch (err) {
        console.error('API Error:', err)
        setError('API not available. Showing mock data.')
        setStudents(MOCK_STUDENTS)
        setParents(MOCK_PARENTS)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  // Search with 2 char minimum
  useEffect(() => {
    async function doSearch() {
      if (searchTerm.length < 2) {
        return
      }
      
      setIsLoading(true)
      try {
        if (activeTab === 'students') {
          const data = await searchStudents(searchTerm)
          setStudents(data || [])
        } else {
          const data = await searchParents(searchTerm)
          setParents(data || [])
        }
      } catch (err) {
        console.error('Search error:', err)
      } finally {
        setIsLoading(false)
      }
    }

    const timeout = setTimeout(doSearch, 300)
    return () => clearTimeout(timeout)
  }, [searchTerm, activeTab])

  const filteredStudents = searchTerm.length < 2
    ? students
    : students.filter(s => s.full_name.toLowerCase().includes(searchTerm.toLowerCase()))

  const filteredParents = searchTerm.length < 2
    ? parents
    : parents.filter(p => p.full_name.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="min-h-screen bg-surface">
      <TopNavbar activePage="Directory" />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-8 py-6">
        <div className="max-w-[1400px] mx-auto flex items-end justify-between">
          <div>
            <h1 className="font-headline text-3xl font-bold text-on-surface tracking-tight">Directory</h1>
            <p className="text-sm text-on-surface-variant mt-2">Browse and manage students and parents</p>
          </div>
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
            students={filteredStudents} 
            isLoading={isLoading} 
            emptyMessage={searchTerm.length >= 2 ? 'No students match your search' : 'No students found'}
          />
        ) : (
          <ParentList 
            parents={filteredParents} 
            isLoading={isLoading}
            emptyMessage={searchTerm.length >= 2 ? 'No parents match your search' : 'No parents found'}
          />
        )}
      </section>
    </div>
  )
}
