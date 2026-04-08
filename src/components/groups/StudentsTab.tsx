import { useState, useMemo } from 'react'
import { CheckCircle2, XCircle, Clock } from 'lucide-react'
import { LevelSelector } from './detail/LevelSelector'
import { DataTable } from '../common/DataTable'
import { useGroupStudents } from '../../hooks/useGroupStudents'
import type { GroupLevelHistoryDTO } from '../../api/academics'
import type { StudentEnrollmentSummary } from '../../api/enrollments'

interface StudentsTabProps {
  groupId: number
  levels: GroupLevelHistoryDTO[]
  activeLevelId: number | null
  currentLevelNumber: number
  onLevelChange: (levelId: number) => void
}

const getPaymentStatusBadge = (status: string) => {
  switch (status) {
    case 'paid':
      return <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full"><CheckCircle2 className="w-3 h-3" /> Paid</span>
    case 'partial':
      return <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-amber-100 text-amber-700 rounded-full"><Clock className="w-3 h-3" /> Partial</span>
    case 'due':
    default:
      return <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full"><XCircle className="w-3 h-3" /> Due</span>
  }
}

export function StudentsTab({
  groupId,
  levels,
  activeLevelId,
  currentLevelNumber,
  onLevelChange,
}: StudentsTabProps) {
  const [selectedLevelId, setSelectedLevelId] = useState<number | null>(activeLevelId)
  const selectedLevel = useMemo(() => 
    levels.find(l => l.id === selectedLevelId) || null
  , [levels, selectedLevelId])

  const { 
    students, 
    isLoading, 
    error, 
    dropStudent,
  } = useGroupStudents(groupId, selectedLevel?.level_number)

  const handleLevelChange = (levelId: number) => {
    setSelectedLevelId(levelId)
    onLevelChange(levelId)
  }

  const handleDrop = async (enrollmentId: number) => {
    if (!confirm('Are you sure you want to remove this student from the group?')) return
    try {
      await dropStudent(enrollmentId)
    } catch (err) {
      console.error('Failed to drop student:', err)
    }
  }

  const columns = [
    {
      key: 'student_name' as const,
      header: 'Student Name',
      cell: (student: StudentEnrollmentSummary) => (
        <span className="font-medium text-slate-900">{student.student_name}</span>
      ),
    },
    {
      key: 'sessions_attended' as const,
      header: 'Sessions Attended',
      cell: (student: StudentEnrollmentSummary) => (
        <span className="text-slate-600">
          {student.sessions_attended} / {student.sessions_total}
        </span>
      ),
    },
    {
      key: 'payment_status' as const,
      header: 'Payment Status',
      cell: (student: StudentEnrollmentSummary) => getPaymentStatusBadge(student.payment_status),
    },
    {
      key: 'amount_due' as const,
      header: 'Amount Due',
      cell: (student: StudentEnrollmentSummary) => (
        <span className="text-slate-600">
          {student.amount_due - student.discount_applied > 0 
            ? `${student.amount_due - student.discount_applied} EGP`
            : 'Paid'}
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <LevelSelector 
        levels={levels}
        activeLevelId={selectedLevelId}
        onLevelChange={handleLevelChange}
        currentLevelNumber={currentLevelNumber}
      />
      
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <DataTable 
        data={students}
        columns={columns}
        keyExtractor={(student) => String(student.enrollment_id)}
        isLoading={isLoading}
        emptyMessage="No students enrolled in this level"
        actions={{
          view: (student) => console.log('View student', student.student_id),
          edit: (student) => console.log('Edit student', student.student_id),
          delete: (student) => handleDrop(student.enrollment_id),
        }}
      />
    </div>
  )
}

export default StudentsTab
