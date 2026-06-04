import { useState } from 'react'
import { Users, Plus, Calendar, CheckCircle2, XCircle, Clock, MapPin } from 'lucide-react'
import type { EnrollmentInfo } from '../../api/crm/students'
import type { EnrichedGroupPublic } from '../../api/academics'
import { EmptyState, EntityDetailCard, Modal } from '../common'
import { GroupCombobox } from '../common/combobox/GroupCombobox'
import { EditEnrollmentModal } from '../enrollments/EditEnrollmentModal'

interface EnrollmentsTabProps {
  studentId: number
  enrollments: EnrollmentInfo[]
  currentGroupName?: string | null
  onEnroll?: () => void
}

interface EnrollDialogProps {
  isOpen: boolean
  onClose: () => void
  onEnroll: (groupId: number) => Promise<void>
  availableGroups: EnrichedGroupPublic[]
  isLoading?: boolean
  recentGroupIds?: number[]
}

export function EnrollDialog({ isOpen, onClose, onEnroll, availableGroups, isLoading, recentGroupIds = [] }: EnrollDialogProps) {
  const [selectedGroup, setSelectedGroup] = useState<EnrichedGroupPublic | null>(null)
  const [search, setSearch] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleEnroll = async () => {
    if (!selectedGroup) return
    setIsSubmitting(true)
    try {
      await onEnroll(selectedGroup.id)
      setSelectedGroup(null)
      setSearch('')
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setSelectedGroup(null)
    setSearch('')
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Enroll Student in New Group"
      size="xl"
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
            disabled={!selectedGroup || isSubmitting || isLoading}
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
      <div className="space-y-4 min-h-[400px]">
        <p className="text-sm text-slate-600">
          Search and select a group to enroll this student in:
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
          <GroupCombobox
            value={selectedGroup}
            onChange={setSelectedGroup}
            search={search}
            setSearch={setSearch}
            groups={availableGroups}
            isLoading={isLoading || false}
            recentGroupIds={recentGroupIds}
          />
        )}
      </div>
    </Modal>
  )
}

export function EnrollmentsTab({ studentId, enrollments, onEnroll }: EnrollmentsTabProps) {
  const [editEnrollmentId, setEditEnrollmentId] = useState<number | null>(null)

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
            onClick={onEnroll}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-secondary rounded-lg hover:bg-secondary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Enroll in New Group
          </button>
        )}
      </div>

      {/* Current Enrollment */}
      {currentEnrollment && (
        <EntityDetailCard
          title="Current Enrollment"
          subtitle={`Level ${currentEnrollment.level_number}`}
          icon={<Users className="w-5 h-5" />}
          variant="hero"
          status="active"
          details={[
            { label: 'Group', value: currentEnrollment.group_name, icon: <Users className="w-3 h-3" />, link: `/groups/${currentEnrollment.group_id}` },
            { label: 'Course', value: currentEnrollment.course_name, icon: <MapPin className="w-3 h-3" />, link: `/courses/${currentEnrollment.course_id}` },
            { label: 'Enrolled On', value: currentEnrollment.enrolled_at, icon: <Calendar className="w-3 h-3" /> }
          ]}
          actions={[
            {
              label: 'Edit Finance / Notes',
              onClick: () => setEditEnrollmentId(currentEnrollment.enrollment_id),
              variant: 'secondary'
            }
          ]}
        />
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
              <div key={enrollment.enrollment_id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <p className="font-semibold text-on-surface">{enrollment.group_name}</p>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(enrollment.status)}`}>
                        {getStatusIcon(enrollment.status)}
                        {enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">{enrollment.course_name} • Level {enrollment.level_number}</p>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Enrolled: {enrollment.enrolled_at}
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <p className="text-sm font-medium text-on-surface">
                      Level {enrollment.level_number}
                    </p>
                    <p className="text-xs text-slate-500 mb-2">
                      {enrollment.status === 'active' ? 'Active Enrollment' : 'Past Enrollment'}
                    </p>
                    <button
                      onClick={() => setEditEnrollmentId(enrollment.enrollment_id)}
                      className="text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-1 rounded"
                    >
                      Edit Finance / Notes
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <EditEnrollmentModal
        isOpen={editEnrollmentId !== null}
        onClose={() => setEditEnrollmentId(null)}
        enrollmentId={editEnrollmentId}
        studentId={studentId}
      />
    </div>
  )
}

export default EnrollmentsTab
