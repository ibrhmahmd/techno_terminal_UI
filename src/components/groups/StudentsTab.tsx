import { useState, useMemo } from 'react'
import { CheckCircle2, XCircle, Clock } from 'lucide-react'
import { LevelSelector } from './detail/LevelSelector'
import { DataTable } from '../common/datatable'
import { useGroupEnrollments } from '../../hooks/useGroupEnrollments'
import type { LevelDetailDTO, EnrollmentStudentDTO } from '../../api/academics'

interface StudentsTabProps {
  groupId: number
  levels: LevelDetailDTO[]
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
    levels.find(l => l.level_id === selectedLevelId) || null
  , [levels, selectedLevelId])

  const { 
    students: studentsRecord,
    enrollmentsByLevel,
    isLoading, 
    error,
  } = useGroupEnrollments(groupId)

  // Get students for the selected level
  const students = useMemo(() => {
    if (!selectedLevel) return []
    const levelData = enrollmentsByLevel.find(l => l.level_number === selectedLevel.level_number)
    return levelData?.students ?? []
  }, [enrollmentsByLevel, selectedLevel])

  const handleLevelChange = (levelId: number) => {
    setSelectedLevelId(levelId)
    onLevelChange(levelId)
  }

  const handleDrop = async (studentId: number) => {
    if (!confirm('Are you sure you want to remove this student from the group?')) return
    console.log('Drop student:', studentId)
  }

  const columns = [
    {
      key: 'student_name' as const,
      header: 'Student Name',
      cell: (student: EnrollmentStudentDTO) => (
        <span className="font-medium text-slate-900">{student.student_name}</span>
      ),
    },
    {
      key: 'phone' as const,
      header: 'Phone',
      cell: (student: EnrollmentStudentDTO) => (
        <span className="text-slate-600">{student.phone || '-'}</span>
      ),
    },
    {
      key: 'status' as const,
      header: 'Status',
      cell: (student: EnrollmentStudentDTO) => getPaymentStatusBadge(student.status === 'active' ? 'paid' : 'due'),
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
          delete: (student) => handleDrop(student.student_id),
        }}
      />
    </div>
  )
}

export default StudentsTab
