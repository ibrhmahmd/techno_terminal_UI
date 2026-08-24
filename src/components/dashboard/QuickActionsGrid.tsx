import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { QuickActionWidget } from './QuickActionWidget'
import { StatWidget } from './StatWidget'
import { Modal } from '../common'
import { StudentForm } from '../crm/StudentForm'
import { useCreateStudent } from '../../hooks/useDirectory'
import { linkParentToStudent } from '../../api/crm'
import { useToast } from '../common/Toast'
import type { ParentListItem, CreateStudentDTO, StudentStatus } from '../../api/crm'
import { logActivity } from '../../api/crm/students/activity'

interface QuickActionsGridProps {
  todaySessionCount: number
}

export function QuickActionsGrid({ todaySessionCount }: QuickActionsGridProps) {
  const navigate = useNavigate()
  const { t } = useTranslation('dashboard')
  const { showToast, ToastComponent } = useToast()
  const [isQuickRegisterOpen, setIsQuickRegisterOpen] = useState(false)
  
  const createStudentMutation = useCreateStudent()

  const handleQuickRegister = () => {
    setIsQuickRegisterOpen(true)
  }

  const handleCreateStudent = async (
    data: CreateStudentDTO,
    selectedParent: ParentListItem | null,
    status: StudentStatus,
    initialActivity?: { activity_type: string; description: string }
  ) => {
    try {
      const newStudent = await createStudentMutation.mutateAsync({
        ...data,
        status,
      })

      if (selectedParent) {
        await linkParentToStudent(newStudent.id, selectedParent.id)
      }

      if (initialActivity && initialActivity.description) {
        await logActivity(newStudent.id, {
          activity_type: initialActivity.activity_type,
          description: initialActivity.description,
        })
      }

      showToast(t('quick_actions.student_registered_success'), 'success')
      setIsQuickRegisterOpen(false)
    } catch {
      showToast(t('quick_actions.student_register_failed'), 'error')
    }
  }

  return (
    <section className="w-full" aria-label={t('quick_actions.aria_label')}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickActionWidget
          icon="person_add"
          title={t('quick_actions.quick_register')}
          subtitle={t('quick_actions.quick_register_subtitle')}
          variant="primary"
          onClick={handleQuickRegister}
        />

        <QuickActionWidget
          icon="payment"
          title={t('quick_actions.create_payment')}
          subtitle={t('quick_actions.create_payment_subtitle')}
          variant="secondary"
          onClick={() => navigate('/finance')}
        />

        <StatWidget
          value={todaySessionCount}
          label={t('quick_actions.todays_sessions')}
          icon="event_note"
          trend="neutral"
        />

        <QuickActionWidget
          icon="analytics"
          title={t('quick_actions.quick_reports')}
          subtitle={t('quick_actions.quick_reports_subtitle')}
          variant="accent"
          onClick={() => navigate('/reports')}
        />
      </div>

      {/* Quick Register Modal */}
      <Modal
        isOpen={isQuickRegisterOpen}
        onClose={() => setIsQuickRegisterOpen(false)}
        title={t('quick_actions.quick_register_student')}
      >
        <StudentForm
          onSubmit={(data, parent, status, initialActivity) =>
            handleCreateStudent(data, parent, status, initialActivity)
          }
          onCancel={() => setIsQuickRegisterOpen(false)}
          mode="create"
        />
      </Modal>

      {ToastComponent}
    </section>
  )
}
