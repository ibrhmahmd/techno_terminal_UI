import { useState } from 'react'
import { Modal } from '../../common'
import { transferEnrollment } from '../../../api/enrollments/enrollments'
import { useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../../../hooks/queryKeys'
import type { TransferOptionDTO } from '../../../api/academics'

interface TransferDialogProps {
  isOpen: boolean
  groupId: number // source group id
  studentName: string
  enrollmentId: number
  transferOptions: TransferOptionDTO[]
  onClose: () => void
  onSuccess: () => void
}

export function TransferDialog({ 
  isOpen, 
  groupId, 
  studentName,
  enrollmentId,
  transferOptions,
  onClose,
  onSuccess
}: TransferDialogProps) {
  const [targetGroupId, setTargetGroupId] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    if (!targetGroupId) {
      setError('Please select a target group')
      return
    }

    if (targetGroupId === groupId) {
      setError('Cannot transfer to the same group')
      return
    }

    try {
      setIsSubmitting(true)
      await transferEnrollment({
        from_enrollment_id: enrollmentId,
        to_group_id: targetGroupId
      })
      
      // Invalidate both source and target group enrollments
      queryClient.invalidateQueries({ queryKey: queryKeys.groupEnrollments(groupId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.groupEnrollments(targetGroupId) })
      
      onSuccess()
      handleClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to transfer student')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setError(null)
    setTargetGroupId(null)
    onClose()
  }

  // Convert transferOptions to what GroupCombobox expects if needed, or we could just use a native select
  // since we already have the exact list. A native select is safer here since we only want to allow 
  // transferring to groups in the transferOptions list (which are active and have slots).

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Transfer Student"
      size="sm"
    >
      <form onSubmit={handleSubmit}>
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}
          
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-sm text-slate-500">Transferring</span>
            <div className="font-medium text-slate-900">{studentName}</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Select Target Group <span className="text-red-500">*</span>
            </label>
            <select
              value={targetGroupId || ''}
              onChange={(e) => setTargetGroupId(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-colors"
              required
            >
              <option value="" disabled>-- Select a group --</option>
              {transferOptions
                .filter(opt => opt.group_id !== groupId) // exclude current group
                .map(opt => (
                <option key={opt.group_id} value={opt.group_id}>
                  {opt.group_name} ({opt.course_name}) - {opt.available_slots} slots open
                </option>
              ))}
            </select>
            {transferOptions.length === 0 && (
              <p className="mt-2 text-sm text-amber-600">
                No active groups available for transfer.
              </p>
            )}
            {targetGroupId === groupId && (
              <p className="mt-1 text-sm text-red-600">
                Cannot transfer to the same group.
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 p-4 border-t border-slate-200">
          <button type="button" onClick={handleClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50" disabled={isSubmitting}>
            Cancel
          </button>
          <button type="submit" disabled={!targetGroupId || targetGroupId === groupId || isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
            {isSubmitting ? 'Transferring...' : 'Transfer'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
