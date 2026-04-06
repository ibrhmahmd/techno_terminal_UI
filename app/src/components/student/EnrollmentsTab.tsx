import { useState } from 'react'
import { Users, Plus, Calendar, CheckCircle2, XCircle, Clock } from 'lucide-react'
import type { Enrollment } from '../../api/enrollments'
import { EmptyState } from '../common/EmptyState'
import { Modal } from '../common/Modal'

interface EnrollmentsTabProps {
  enrollments: Enrollment[]
  currentGroupName?: string | null
  onEnroll?: () => void
}

interface EnrollDialogProps {
  isOpen: boolean
  onClose: () => void
  onEnroll: (groupId: number) => Promise<void>
  availableGroups: { id: number; name: string; course_name: string; level: number }[]
  isLoading?: boolean
}

export function EnrollDialog({ isOpen, onClose, onEnroll, availableGroups, isLoading }: EnrollDialogProps) {
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleEnroll = async () => {
    if (!selectedGroupId) return
    setIsSubmitting(true)
    try {
      await onEnroll(selectedGroupId)
      setSelectedGroupId(null)
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setSelectedGroupId(null)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Enroll Student in New Group"
      size="md"
      footer={
        <div className="flex justify-end gap-3">
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleEnroll}
            disabled={!selectedGroupId || isSubmitting || isLoading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-secondary rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Enrolling...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Enroll Student
              </>
            )}
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-slate-600">
          Select a group to enroll this student in:
        </p>
        
        {isLoading ? (
          <div className="py-8 text-center">
            <div className="w-8 h-8 border-2 border-slate-200 border-t-secondary rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm text-slate-500">Loading groups...</p>
          </div>
        ) : availableGroups.length === 0 ? (
          <div className="py-8 text-center bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-500">No available groups found</p>
            <p className="text-xs text-slate-400 mt-1">
              All groups may be at capacity or already enrolled
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {availableGroups.map((group) => (
              <button
                key={group.id}
                onClick={() => setSelectedGroupId(group.id)}
                className={`w-full p-4 text-left border rounded-lg transition-colors ${
                  selectedGroupId === group.id
                    ? 'border-secondary bg-secondary/5'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-on-surface">{group.name}</p>
                    <p className="text-sm text-slate-500">
                      {group.course_name} • Level {group.level}
                    </p>
                  </div>
                  {selectedGroupId === group.id && (
                    <CheckCircle2 className="w-5 h-5 text-secondary" />
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </Modal>
  )
}

export function EnrollmentsTab({ enrollments, onEnroll }: EnrollmentsTabProps) {
  const [, setIsDialogOpen] = useState(false)

  // Separate current and past enrollments
  const currentEnrollment = enrollments.find(e => e.status === 'active')
  const pastEnrollments = enrollments.filter(e => e.status !== 'active')

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-blue-600" />
      case 'dropped':
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <Clock className="w-4 h-4 text-slate-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700'
      case 'completed':
        return 'bg-blue-100 text-blue-700'
      case 'dropped':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-slate-100 text-slate-600'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Enroll Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-on-surface">Enrollment History</h2>
          <p className="text-sm text-slate-500 mt-1">
            View all group enrollments for this student
          </p>
        </div>
        {onEnroll && (
          <button
            onClick={() => setIsDialogOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-secondary rounded-lg hover:bg-secondary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Enroll in New Group
          </button>
        )}
      </div>

      {/* Current Enrollment */}
      {currentEnrollment && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-lg text-on-surface">Current Enrollment</h3>
            <span className="ml-auto px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Active
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-slate-500">Group</label>
              <p className="font-medium text-on-surface">{currentEnrollment.group_name}</p>
            </div>
            <div>
              <label className="text-sm text-slate-500">Course</label>
              <p className="font-medium text-on-surface">{currentEnrollment.course_name}</p>
            </div>
            <div>
              <label className="text-sm text-slate-500">Enrolled On</label>
              <p className="font-medium text-on-surface flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                {currentEnrollment.enrolled_on}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Past Enrollments */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
          <h3 className="font-semibold text-on-surface">Past Enrollments</h3>
        </div>
        
        {pastEnrollments.length === 0 ? (
          <EmptyState
            title="No past enrollments"
            message="This student has no previous group enrollments."
            icon="inbox"
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {pastEnrollments.map((enrollment) => (
              <div key={enrollment.id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <p className="font-semibold text-on-surface">{enrollment.group_name}</p>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(enrollment.status)}`}>
                        {getStatusIcon(enrollment.status)}
                        {enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">{enrollment.course_name} • Level {enrollment.level}</p>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Enrolled: {enrollment.enrolled_on}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-on-surface">
                      {enrollment.amount_due - enrollment.discount} EGP
                    </p>
                    <p className="text-xs text-slate-500">
                      after {enrollment.discount} EGP discount
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default EnrollmentsTab
