import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, XCircle, Clock } from 'lucide-react'
import { TransferDialog } from './detail/TransferDialog'
import { LevelSelector } from './detail/LevelSelector'
import { DataTable } from '../common/datatable'
import { ConfirmDialog } from '../common/ConfirmDialog'
import { useToast } from '../common/Toast'
import { useGroupEnrollments } from '../../hooks/useGroupEnrollments'
import { deleteEnrollment } from '../../api/enrollments/enrollments'
import { queryClient } from '../../lib/queryClient'
import { queryKeys } from '../../hooks/queryKeys'
import type { LevelDetailDTO } from '../../api/academics'

type StudentWithEnrollment = {
  enrollment_id: number
  student_id: number
  status: 'active' | 'completed' | 'dropped'
  payment_status: 'paid' | 'due' | 'partial'
  student_name: string
  phone: string | null
  parent_name: string | null
}

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
  const [isDropDialogOpen, setIsDropDialogOpen] = useState(false)
  const [droppingEnrollmentId, setDroppingEnrollmentId] = useState<number | null>(null)
  
  const [isTransferOpen, setIsTransferOpen] = useState(false)
  const [transferStudent, setTransferStudent] = useState<StudentWithEnrollment | null>(null)
  
  const navigate = useNavigate()
  const { showToast, ToastComponent } = useToast()

  useEffect(() => {
    setSelectedLevelId(activeLevelId)
  }, [activeLevelId])
  const selectedLevel = useMemo(() =>
    levels.find(l => l.level_id === selectedLevelId) || null
  , [levels, selectedLevelId])

  const { 
    students: studentsRecord,
    enrollmentsByLevel,
    transferOptions,
    isLoading, 
    error,
    refetch: refetchEnrollments,
  } = useGroupEnrollments(groupId)

  // Get students for the selected level - combine enrollment data with student lookup
  const students = useMemo(() => {
    if (!selectedLevel) return []
    const levelData = enrollmentsByLevel.find(l => l.level_number === selectedLevel.level_number)
    if (!levelData?.enrollments) return []
    
    // Map enrollments with student info from lookup table
    return levelData.enrollments.map(enrollment => {
      const studentInfo = studentsRecord[enrollment.student_id]
      return {
        ...enrollment,
        student_name: studentInfo?.student_name || 'Unknown',
        phone: studentInfo?.phone || null,
        parent_name: studentInfo?.parent_name || null,
      }
    })
  }, [enrollmentsByLevel, selectedLevel, studentsRecord])

  const handleLevelChange = (levelId: number) => {
    setSelectedLevelId(levelId)
    onLevelChange(levelId)
  }

  const handleDropClick = (enrollmentId: number) => {
    setDroppingEnrollmentId(enrollmentId)
    setIsDropDialogOpen(true)
  }

  const handleConfirmDrop = async () => {
    if (!droppingEnrollmentId) return
    try {
      await deleteEnrollment(droppingEnrollmentId)
      showToast('Student removed from group', 'success')
      queryClient.invalidateQueries({ queryKey: queryKeys.groupEnrollments(groupId) })
    } catch {
      showToast('Failed to remove student', 'error')
    } finally {
      setIsDropDialogOpen(false)
      setDroppingEnrollmentId(null)
    }
  }

  const handleCancelDrop = () => {
    setIsDropDialogOpen(false)
    setDroppingEnrollmentId(null)
  }

  const columns = [
    {
      key: 'student_name' as const,
      header: 'Student Name',
      cell: (student: StudentWithEnrollment) => (
        <span className="font-medium text-slate-900">{student.student_name}</span>
      ),
    },
    {
      key: 'phone' as const,
      header: 'Phone',
      cell: (student: StudentWithEnrollment) => (
        <span className="text-slate-600">{student.phone || '-'}</span>
      ),
    },
    {
      key: 'status' as const,
      header: 'Status',
      cell: (student: StudentWithEnrollment) => getPaymentStatusBadge(student.payment_status),
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
        <div role="alert" className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
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
          view: (student) => navigate(`/students/${student.student_id}`),
          edit: (student) => { setTransferStudent(student); setIsTransferOpen(true) },
          delete: (student) => handleDropClick(student.enrollment_id),
        }}
      />

      <ConfirmDialog
        isOpen={isDropDialogOpen}
        title="Remove Student"
        message="Are you sure you want to remove this student from the group? This action cannot be undone."
        confirmText="Remove"
        cancelText="Cancel"
        onConfirm={handleConfirmDrop}
        onCancel={handleCancelDrop}
        variant="danger"
      />

      {transferStudent && (
        <TransferDialog
          isOpen={isTransferOpen}
          groupId={groupId}
          studentName={transferStudent.student_name}
          enrollmentId={transferStudent.enrollment_id}
          transferOptions={transferOptions}
          onClose={() => {
            setIsTransferOpen(false)
            setTransferStudent(null)
          }}
          onSuccess={() => {
            showToast('Student transferred successfully', 'success')
            refetchEnrollments()
          }}
        />
      )}

      {ToastComponent}
    </div>
  )
}
