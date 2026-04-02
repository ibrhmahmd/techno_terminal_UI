import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { TopNavbar } from '../components/dashboard/TopNavbar'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { getStudent, type StudentWithDetails } from '../api/crm'

// Mock data
const MOCK_STUDENT: StudentWithDetails = {
  id: 1,
  full_name: 'Ahmed Mohamed',
  birth_date: '2010-05-15',
  gender: 'male',
  phone: '+20 123 456 7890',
  is_active: true,
  notes: 'Excellent student, strong in robotics',
  parents: [
    { id: 1, full_name: 'Mohamed Hassan', phone: '+20 111 222 3333', email: 'mohamed@example.com', is_active: true },
  ],
  enrollments: [
    { id: 1, group_id: 1, group_name: 'Robotics A', course_name: 'Robotics', level: 1, status: 'active', amount_due: 1200, discount: 0, enrolled_on: '2025-09-01' },
  ],
  balance: 1200,
}

export function StudentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const studentId = parseInt(id || '1', 10)

  const [student, setStudent] = useState<StudentWithDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadStudent() {
      setIsLoading(true)
      setError(null)
      try {
        const data = await getStudent(studentId)
        setStudent({
          ...data,
          parents: data.parents || [],
          enrollments: data.enrollments || [],
          balance: data.balance ?? 0,
        })
      } catch (err) {
        console.error('API Error:', err)
        setError('API not available. Showing mock data.')
        setStudent(MOCK_STUDENT)
      } finally {
        setIsLoading(false)
      }
    }
    loadStudent()
  }, [studentId])

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

  if (!student) {
    return (
      <div className="min-h-screen bg-surface">
        <TopNavbar activePage="Directory" />
        <div className="p-8 text-center text-slate-500">
          <p>Student not found</p>
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
            <h1 className="font-headline text-3xl font-bold text-on-surface tracking-tight">{student.full_name}</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              student.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
            }`}>
              {student.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
          <p className="text-sm text-on-surface-variant mt-1">
            {student.gender && `${student.gender.charAt(0).toUpperCase() + student.gender.slice(1)} • `}
            {student.birth_date && `Born ${student.birth_date} • `}
            {student.phone}
          </p>
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
          {/* Left: Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Enrollments */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h2 className="font-headline text-xl font-semibold text-on-surface mb-4">Enrollments</h2>
              {student.enrollments?.length === 0 ? (
                <p className="text-slate-500 text-sm">No enrollments found</p>
              ) : (
                <div className="space-y-3">
                  {student.enrollments?.map((enrollment) => (
                    <div key={enrollment.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-semibold text-on-surface">{enrollment.group_name}</p>
                        <p className="text-sm text-slate-500">{enrollment.course_name} • Level {enrollment.level}</p>
                        <p className="text-xs text-slate-400 mt-1">Enrolled {enrollment.enrolled_on}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          enrollment.status === 'active' ? 'bg-green-100 text-green-700' :
                          enrollment.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {enrollment.status}
                        </span>
                        <p className="text-sm font-medium text-on-surface mt-1">
                          {enrollment.amount_due - enrollment.discount} EGP
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Notes */}
            {student.notes && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h2 className="font-headline text-xl font-semibold text-on-surface mb-4">Notes</h2>
                <p className="text-sm text-on-surface-variant">{student.notes}</p>
              </div>
            )}
          </div>

          {/* Right: Parents & Balance */}
          <div className="space-y-6">
            {/* Balance */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h2 className="font-headline text-lg font-semibold text-on-surface mb-3">Account Balance</h2>
              <p className={`text-3xl font-bold ${student.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {student.balance} EGP
              </p>
              <p className="text-sm text-slate-500 mt-1">
                {student.balance > 0 ? 'Outstanding balance' : 'No balance due'}
              </p>
            </div>

            {/* Parents */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h2 className="font-headline text-lg font-semibold text-on-surface mb-4">Parents</h2>
              {student.parents?.length === 0 ? (
                <p className="text-slate-500 text-sm">No parents linked</p>
              ) : (
                <div className="space-y-3">
                  {student.parents?.map((parent) => (
                    <div key={parent.id} className="p-3 bg-slate-50 rounded-lg">
                      <p className="font-medium text-on-surface">{parent.full_name}</p>
                      <p className="text-sm text-slate-500">{parent.phone}</p>
                      {parent.email && <p className="text-xs text-slate-400">{parent.email}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
