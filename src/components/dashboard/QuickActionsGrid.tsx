import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { QuickActionWidget } from './QuickActionWidget'
import { StatWidget } from './StatWidget'
import { Modal } from '../common'
import { StudentForm } from '../crm/StudentForm'
import { useCreateStudent } from '../../hooks/useDirectory'
import { linkParentToStudent, updateStudentStatus } from '../../api/crm'
import { useToast } from '../common/Toast'
import type { ParentListItem, CreateStudentDTO, StudentStatus } from '../../api/crm'

interface QuickActionsGridProps {
  todaySessionCount: number
}

export function QuickActionsGrid({ todaySessionCount }: QuickActionsGridProps) {
  const navigate = useNavigate()
  const { showToast, ToastComponent } = useToast()
  const [isQuickRegisterOpen, setIsQuickRegisterOpen] = useState(false)
  
  const createStudentMutation = useCreateStudent()

  const handleQuickRegister = () => {
    setIsQuickRegisterOpen(true)
  }

  const handleCreateStudent = async (
    data: CreateStudentDTO,
    selectedParent: ParentListItem | null,
    status: StudentStatus
  ) => {
    try {
      const newStudent = await createStudentMutation.mutateAsync(data)

      if (selectedParent) {
        await linkParentToStudent(newStudent.id, selectedParent.id)
      }

      if (status && status !== 'active') {
        await updateStudentStatus(newStudent.id, { status })
      }

      showToast('Student registered successfully', 'success')
      setIsQuickRegisterOpen(false)
    } catch {
      showToast('Failed to register student', 'error')
    }
  }

  return (
    <section className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickActionWidget
          icon="person_add"
          title="Quick Register"
          subtitle="Register new student"
          variant="primary"
          onClick={handleQuickRegister}
        />

        <QuickActionWidget
          icon="payment"
          title="Create Payment"
          subtitle="Record new payment"
          variant="secondary"
          onClick={() => navigate('/finance')}
        />

        <StatWidget
          value={todaySessionCount}
          label="Today's Sessions"
          icon="event_note"
          trend="neutral"
        />

        <QuickActionWidget
          icon="analytics"
          title="Quick Reports"
          subtitle="View insights"
          variant="accent"
          onClick={() => navigate('/reports')}
        />
      </div>

      {/* Quick Register Modal */}
      <Modal
        isOpen={isQuickRegisterOpen}
        onClose={() => setIsQuickRegisterOpen(false)}
        title="Quick Register Student"
      >
        <StudentForm
          onSubmit={(data, parent, status) =>
            handleCreateStudent(data, parent, status)
          }
          onCancel={() => setIsQuickRegisterOpen(false)}
          mode="create"
        />
      </Modal>

      {ToastComponent}
    </section>
  )
}
