import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { TopNavbar } from '../components/dashboard/TopNavbar'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { getParent, type Parent } from '../api/crm'

// Mock data
const MOCK_PARENT: Parent & { students: { id: number; full_name: string; is_active: boolean }[] } = {
  id: 1,
  full_name: 'Mohamed Hassan',
  phone: '+20 111 222 3333',
  email: 'mohamed@example.com',
  address: 'Cairo, Egypt',
  is_active: true,
  students: [
    { id: 1, full_name: 'Ahmed Mohamed', is_active: true },
    { id: 2, full_name: 'Fatima Mohamed', is_active: true },
  ],
}

export function ParentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const parentId = parseInt(id || '1', 10)

  const [parent, setParent] = useState<typeof MOCK_PARENT | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadParent() {
      setIsLoading(true)
      setError(null)
      try {
        const data = await getParent(parentId)
        setParent({ ...data, students: MOCK_PARENT.students }) // Mock students for now
      } catch (err) {
        console.error('API Error:', err)
        setError('API not available. Showing mock data.')
        setParent(MOCK_PARENT)
      } finally {
        setIsLoading(false)
      }
    }
    loadParent()
  }, [parentId])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface">
        <TopNavbar activePage="Directory" />
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  if (!parent) {
    return (
      <div className="min-h-screen bg-surface">
        <TopNavbar activePage="Directory" />
        <div className="p-8 text-center text-slate-500">
          <p>Parent not found</p>
          <button
            onClick={() => navigate('/directory')}
            className="mt-4 px-4 py-2 text-sm text-secondary border border-secondary rounded hover:bg-secondary-container"
          >
            Back to Directory
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface">
      <TopNavbar activePage="Directory" />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-8 py-6">
        <div className="max-w-[1400px] mx-auto">
          <button
            onClick={() => navigate('/directory')}
            className="flex items-center gap-1 text-sm text-slate-500 hover:text-on-surface mb-2"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to Directory
          </button>
          <div className="flex items-center gap-4">
            <h1 className="font-headline text-3xl font-bold text-on-surface tracking-tight">{parent.full_name}</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              parent.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
            }`}>
              {parent.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </header>

      {/* Content */}
      <section className="p-8 max-w-[1400px] mx-auto">
        {error && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-100 rounded-lg text-yellow-700 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Contact Info */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 className="font-headline text-xl font-semibold text-on-surface mb-4">Contact Information</h2>
            <div className="space-y-4">
              {parent.phone && (
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-slate-400">phone</span>
                  <div>
                    <p className="text-sm text-slate-500">Phone</p>
                    <p className="text-on-surface">{parent.phone}</p>
                  </div>
                </div>
              )}
              {parent.email && (
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-slate-400">email</span>
                  <div>
                    <p className="text-sm text-slate-500">Email</p>
                    <p className="text-on-surface">{parent.email}</p>
                  </div>
                </div>
              )}
              {parent.address && (
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-slate-400">location_on</span>
                  <div>
                    <p className="text-sm text-slate-500">Address</p>
                    <p className="text-on-surface">{parent.address}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Students */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 className="font-headline text-xl font-semibold text-on-surface mb-4">Children</h2>
            {parent.students.length === 0 ? (
              <p className="text-slate-500 text-sm">No students linked</p>
            ) : (
              <div className="space-y-3">
                {parent.students.map((student) => (
                  <div
                    key={student.id}
                    onClick={() => navigate(`/students/${student.id}`)}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-slate-400">school</span>
                      <p className="font-medium text-on-surface">{student.full_name}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      student.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {student.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
