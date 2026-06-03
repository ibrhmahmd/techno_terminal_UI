import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, XCircle, Clock } from 'lucide-react'
import { TransferDialog } from './TransferDialog'
import { ConfirmDialog } from '../../common/ConfirmDialog'
import { RowActions } from '../../common/RowActions'
import { useToast } from '../../common/Toast'
import { useGroupEnrollments } from '../../../hooks/useGroupEnrollments'
import { deleteEnrollment } from '../../../api/enrollments/enrollments'
import { queryClient } from '../../../lib/queryClient'
import { queryKeys } from '../../../hooks/queryKeys'
import type { LevelDetailDTO } from '../../../api/academics'

type StudentWithEnrollment = {
  enrollment_id: number
  student_id: number
  status: 'active' | 'completed' | 'dropped'
  payment_status: 'paid' | 'due' | 'partial'
  student_name: string
  phone: string | null
  parent_name: string | null
}

interface LevelStudentsPanelProps {
  groupId: number
  selectedLevel: LevelDetailDTO
}

const getPaymentStatusBadge = (status: string) => {
  switch (status) {
    case 'paid':
      return <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-700 rounded-full"><CheckCircle2 className="w-3 h-3" /> Paid</span>
    case 'partial':
      return <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 rounded-full"><Clock className="w-3 h-3" /> Partial</span>
    case 'due':
    default:
      return <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700 rounded-full"><XCircle className="w-3 h-3" /> Due</span>
  }
}

function GroupStudentCard({ 
  student, 
  onView, 
  onTransfer, 
  onDrop 
}: { 
  student: StudentWithEnrollment, 
  onView: () => void, 
  onTransfer: () => void, 
  onDrop: () => void 
}) {
  const enrollmentStatusConfig: Record<string, { bg: string, text: string, label: string }> = {
    active: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Active' },
    completed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Completed' },
    dropped: { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Dropped' }
  }

  const status = enrollmentStatusConfig[student.status] || enrollmentStatusConfig.active

  return (
    <div
      onClick={onView}
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:border-secondary/30 cursor-pointer flex flex-col"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-headline font-semibold text-slate-900 text-base truncate">
            {student.student_name}
          </h3>
          {student.phone ? (
            <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">phone</span>
              {student.phone}
            </p>
          ) : (
            <p className="text-sm text-slate-400 mt-0.5 flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">phone</span>
              &mdash;
            </p>
          )}
        </div>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider shrink-0 ${status.bg} ${status.text}`}>
          {status.label}
        </span>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500 mb-3">
        <span className="flex items-center gap-2">
          {getPaymentStatusBadge(student.payment_status)}
        </span>
      </div>

      <div className="mt-auto pt-3 border-t border-slate-100 flex justify-end" onClick={(e) => e.stopPropagation()}>
        <RowActions
          visible="always"
          actions={[
            { icon: 'visibility', label: 'View', onClick: onView, variant: 'primary' },
            { icon: 'swap_horiz', label: 'Transfer', onClick: onTransfer },
            { icon: 'person_remove', label: 'Drop', onClick: onDrop, variant: 'danger' },
          ]}
        />
      </div>
    </div>
  )
}

export function LevelStudentsPanel({
  groupId,
  selectedLevel,
}: LevelStudentsPanelProps) {
  const [isDropDialogOpen, setIsDropDialogOpen] = useState(false)
  const [droppingEnrollmentId, setDroppingEnrollmentId] = useState<number | null>(null)
  
  const [isTransferOpen, setIsTransferOpen] = useState(false)
  const [transferStudent, setTransferStudent] = useState<StudentWithEnrollment | null>(null)
  
  const navigate = useNavigate()
  const { showToast, ToastComponent } = useToast()

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

  return (
    <div className="space-y-6">
      {error && (
        <div role="alert" className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm h-[140px] animate-pulse">
              <div className="flex gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-slate-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-2/3" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                </div>
              </div>
              <div className="h-3 bg-slate-200 rounded w-1/3 mt-6" />
            </div>
          ))}
        </div>
      ) : students.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {students.map(student => (
            <GroupStudentCard
              key={student.enrollment_id}
              student={student}
              onView={() => navigate(`/students/${student.student_id}`)}
              onTransfer={() => { setTransferStudent(student); setIsTransferOpen(true) }}
              onDrop={() => handleDropClick(student.enrollment_id)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-8 text-center">
          <p className="text-slate-500 font-medium">No students enrolled in this level</p>
        </div>
      )}

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
