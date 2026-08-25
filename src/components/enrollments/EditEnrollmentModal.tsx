import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal } from '../common/Modal'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { useUpdateEnrollment } from '../../hooks/useEnrollmentMutations'
import { useStudentEnrollments } from '../../hooks/finance/useStudentEnrollments'

interface EditEnrollmentModalProps {
  isOpen: boolean
  onClose: () => void
  enrollmentId: number | null
  studentId: number | null
}

export function EditEnrollmentModal({ isOpen, onClose, enrollmentId, studentId }: EditEnrollmentModalProps) {
  const { t } = useTranslation('enrollments')
  const [amountDue, setAmountDue] = useState('')
  const [discountApplied, setDiscountApplied] = useState('')
  const [notes, setNotes] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  // Fetch enrollments for this student to get the finance details
  const { enrollments, loading } = useStudentEnrollments(studentId)
  const updateMutation = useUpdateEnrollment()

  const enrollment = enrollments.find(e => e.enrollment_id === enrollmentId)

  useEffect(() => {
    if (enrollment && isOpen) {
      setAmountDue(enrollment.amount_due !== null ? enrollment.amount_due.toString() : '')
      setDiscountApplied(enrollment.discount_applied ? enrollment.discount_applied.toString() : '0')
      setNotes(enrollment.notes || '')
      setErrorMsg('')
    }
  }, [enrollment, isOpen])

  if (!isOpen || !enrollmentId) return null

  const handleSave = async () => {
    if (!enrollment) return
    try {
      setErrorMsg('')
      const payload = {
        amount_due: amountDue === '' ? null : parseFloat(amountDue),
        discount: discountApplied === '' ? 0 : parseFloat(discountApplied),
        notes: notes.trim() || undefined
      }

      await updateMutation.mutateAsync({
        enrollmentId: enrollment.enrollment_id,
        data: payload
      })
      onClose()
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to update enrollment')
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('edit_modal.title')} size="lg">
      <div className="space-y-4 p-4">
        {loading ? (
          <div className="flex justify-center py-8"><LoadingSpinner size="md" /></div>
        ) : !enrollment ? (
          <div className="p-4 text-center text-slate-500">{t('edit_modal.not_found')}</div>
        ) : (
          <>
            {errorMsg && (
              <div className="p-3 bg-error-container/20 border border-error/20 rounded-xl text-error text-sm">
                {errorMsg}
              </div>
            )}

            {/* Info Box */}
            <div className="p-4 bg-surface-container-low border border-slate-200 rounded-xl space-y-2">
              <p className="font-semibold text-sm text-on-surface">📚 {enrollment.course_name || 'Course'}</p>
              <div className="flex gap-4 text-xs text-on-surface-variant">
                <span>Group: {enrollment.group_name}</span>
                <span>Instructor: {enrollment.instructor_name || 'TBD'}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">{t('edit_modal.amount_due')}</label>
                <div className="relative">
                  <input
                    type="number"
                    value={amountDue}
                    onChange={e => setAmountDue(e.target.value)}
                    onWheel={(e) => (e.target as HTMLInputElement).blur()}
                    onKeyDown={(e) => { if (e.key === 'ArrowUp' || e.key === 'ArrowDown') e.preventDefault() }}
                    placeholder={t('edit_modal.group_default')}
                    min="0"
                    step="0.01"
                    className="w-full pl-3 pr-10 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">EGP</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">{t('edit_modal.leave_blank_price')}</p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">{t('edit_modal.discount_applied')}</label>
                <div className="relative">
                  <input
                    type="number"
                    value={discountApplied}
                    onChange={e => setDiscountApplied(e.target.value)}
                    onWheel={(e) => (e.target as HTMLInputElement).blur()}
                    onKeyDown={(e) => { if (e.key === 'ArrowUp' || e.key === 'ArrowDown') e.preventDefault() }}
                    min="0"
                    step="0.01"
                    className="w-full pl-3 pr-10 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">EGP</span>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">{t('edit_modal.internal_notes')}</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                placeholder={t('edit_modal.add_notes_placeholder')}
              />
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-slate-200">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-all"
              >
                {t('edit_modal.cancel')}
              </button>
              <button
                onClick={handleSave}
                disabled={updateMutation.isPending}
                className="px-6 py-2 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700"
              >
                {updateMutation.isPending ? <LoadingSpinner size="sm" /> : t('edit_modal.save_changes')}
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}
