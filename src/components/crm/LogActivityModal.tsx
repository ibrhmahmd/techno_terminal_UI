import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Modal } from '../common'
import {
  logActivity,
  updateActivity,
  getStudentPayments,
  getStudentById,
} from '../../api/crm'
import { getCoursesPaginated, getGroupsPaginated } from '../../api/academics'
import { getCompetitions } from '../../api/competitions'
import { getStudentEnrollments } from '../../api/enrollments'
import type { ActivityLogResponseDTO, ReferenceType } from '../../api/crm'
import { useToast } from '../common/Toast'

interface LogActivityModalProps {
  isOpen: boolean
  onClose: () => void
  studentId: number
  activity?: ActivityLogResponseDTO | null
  onSuccess: () => void
}

const PREDEFINED_TYPES = [
  { value: 'registration', label: 'Registration' },
  { value: 'status_change', label: 'Status Change' },
  { value: 'enrollment', label: 'Enrollment' },
  { value: 'enrollment_change', label: 'Enrollment Change' },
  { value: 'payment', label: 'Payment' },
  { value: 'note_added', label: 'Note Added (General)' },
  { value: 'competition', label: 'Competition' },
  { value: 'deletion', label: 'Deletion' },
]

export function LogActivityModal({
  isOpen,
  onClose,
  studentId,
  activity,
  onSuccess,
}: LogActivityModalProps) {
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)

  // Form State
  const [activityType, setActivityType] = useState('note_added')
  const [customType, setCustomType] = useState('')
  const [isCustomType, setIsCustomType] = useState(false)
  const [activitySubtype, setActivitySubtype] = useState('')
  const [description, setDescription] = useState('')
  const [createdAt, setCreatedAt] = useState('')
  const [referenceType, setReferenceType] = useState<ReferenceType | ''>('')
  const [referenceId, setReferenceId] = useState<string>('')
  const [metadataJson, setMetadataJson] = useState('')

  // Query Entities for reference selectors
  const { data: studentData } = useQuery({
    queryKey: ['student', studentId],
    queryFn: () => getStudentById(studentId),
    enabled: isOpen && studentId > 0,
  })

  const { data: coursesData, isLoading: loadingCourses } = useQuery({
    queryKey: ['courses', 'list-simple-modal'],
    queryFn: () => getCoursesPaginated({ skip: 0, limit: 150 }),
    enabled: isOpen && referenceType === 'course',
  })
  const courses = coursesData?.items || []

  const { data: groupsData, isLoading: loadingGroups } = useQuery({
    queryKey: ['groups', 'list-simple-modal'],
    queryFn: () => getGroupsPaginated({ skip: 0, limit: 150 }),
    enabled: isOpen && referenceType === 'group',
  })
  const groups = groupsData?.items || []

  const { data: competitionsData, isLoading: loadingCompetitions } = useQuery({
    queryKey: ['competitions', 'list-simple-modal'],
    queryFn: () => getCompetitions(),
    enabled: isOpen && referenceType === 'competition',
  })
  const competitions = competitionsData || []

  const { data: paymentsData, isLoading: loadingPayments } = useQuery({
    queryKey: ['student-payments-modal', studentId],
    queryFn: () => getStudentPayments(studentId),
    enabled: isOpen && referenceType === 'payment' && studentId > 0,
  })
  const payments = paymentsData || []

  const { data: enrollmentsData, isLoading: loadingEnrollments } = useQuery({
    queryKey: ['student-enrollments-modal', studentId],
    queryFn: () => getStudentEnrollments(studentId),
    enabled: isOpen && referenceType === 'enrollment' && studentId > 0,
  })
  const enrollments = enrollmentsData || []

  // Prefill reference ID if type is student
  useEffect(() => {
    if (referenceType === 'student') {
      setReferenceId(String(studentId))
    }
  }, [referenceType, studentId])

  // Initialize fields in Edit mode
  useEffect(() => {
    if (activity) {
      const isPredefined = PREDEFINED_TYPES.some((t) => t.value === activity.activity_type)
      if (isPredefined) {
        setActivityType(activity.activity_type)
        setIsCustomType(false)
        setCustomType('')
      } else {
        setActivityType('custom')
        setIsCustomType(true)
        setCustomType(activity.activity_type)
      }
      setActivitySubtype(activity.activity_subtype || '')
      setDescription(activity.description || '')

      if (activity.created_at) {
        const d = new Date(activity.created_at)
        const year = d.getFullYear()
        const month = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')
        const hours = String(d.getHours()).padStart(2, '0')
        const minutes = String(d.getMinutes()).padStart(2, '0')
        setCreatedAt(`${year}-${month}-${day}T${hours}:${minutes}`)
      } else {
        setCreatedAt('')
      }

      setReferenceType(activity.reference_type || '')
      setReferenceId(activity.reference_id ? String(activity.reference_id) : '')
      setMetadataJson(activity.metadata ? JSON.stringify(activity.metadata, null, 2) : '')
    } else {
      // Reset to defaults
      setActivityType('note_added')
      setIsCustomType(false)
      setCustomType('')
      setActivitySubtype('')
      setDescription('')

      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      const hours = String(now.getHours()).padStart(2, '0')
      const minutes = String(now.getMinutes()).padStart(2, '0')
      setCreatedAt(`${year}-${month}-${day}T${hours}:${minutes}`)

      setReferenceType('')
      setReferenceId('')
      setMetadataJson('')
    }
  }, [activity, isOpen])

  const handleTypeChange = (value: string) => {
    setActivityType(value)
    if (value === 'custom') {
      setIsCustomType(true)
    } else {
      setIsCustomType(false)
      setCustomType('')
    }
  }

  const handleReferenceTypeChange = (value: ReferenceType | '') => {
    setReferenceType(value)
    setReferenceId('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const finalType = isCustomType ? customType.trim() : activityType
    if (!finalType) {
      showToast('Activity type is required', 'error')
      return
    }

    let parsedMetadata: Record<string, unknown> | null = null
    if (metadataJson.trim()) {
      try {
        parsedMetadata = JSON.parse(metadataJson)
      } catch {
        showToast('Invalid JSON metadata format', 'error')
        return
      }
    }

    let finalCreatedAt: string | null = null
    if (createdAt) {
      try {
        finalCreatedAt = new Date(createdAt).toISOString()
      } catch {
        showToast('Invalid date format', 'error')
        return
      }
    }

    setLoading(true)
    try {
      const payload = {
        activity_type: finalType,
        activity_subtype: activitySubtype.trim() || null,
        description: description.trim() || null,
        reference_type: referenceType || null,
        reference_id: referenceId ? Number(referenceId) : null,
        metadata: parsedMetadata,
        created_at: finalCreatedAt,
      }

      if (activity) {
        await updateActivity(studentId, activity.id, payload)
        showToast('Activity updated successfully', 'success')
      } else {
        await logActivity(studentId, payload)
        showToast('Activity logged successfully', 'success')
      }
      onSuccess()
      onClose()
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Operation failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={activity ? 'Edit Activity Log' : 'Log Manual Activity'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Activity Type
            </label>
            <select
              value={activityType}
              onChange={(e) => handleTypeChange(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all bg-white text-sm"
            >
              {PREDEFINED_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
              <option value="custom">Custom Type...</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Subtype (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. system_import, manual_fix"
              value={activitySubtype}
              onChange={(e) => setActivitySubtype(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all text-sm"
            />
          </div>
        </div>

        {/* Custom Type Input */}
        {isCustomType && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Custom Activity Type Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. scholarship_awarded, interview_completed"
              value={customType}
              onChange={(e) => setCustomType(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary font-mono text-sm"
            />
          </div>
        )}

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Description / Log details
          </label>
          <textarea
            rows={3}
            placeholder="Describe what occurred..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all text-sm"
          />
        </div>

        {/* Date Time Picker & Reference type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Logged Date & Time
            </label>
            <input
              type="datetime-local"
              value={createdAt}
              onChange={(e) => setCreatedAt(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary text-sm bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Reference Entity (Optional)
            </label>
            <select
              value={referenceType}
              onChange={(e) => handleReferenceTypeChange(e.target.value as ReferenceType | '')}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all bg-white text-sm"
            >
              <option value="">No reference</option>
              <option value="student">Student</option>
              <option value="enrollment">Enrollment</option>
              <option value="payment">Payment</option>
              <option value="group">Group</option>
              <option value="course">Course</option>
              <option value="competition">Competition</option>
            </select>
          </div>
        </div>

        {/* Reference ID selector based on Reference Type */}
        {referenceType && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Select Referenced {referenceType.charAt(0).toUpperCase() + referenceType.slice(1)} *
            </label>
            {referenceType === 'student' && (
              <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 font-medium">
                {studentData ? `${studentData.full_name} (ID: ${studentId})` : `Student (ID: ${studentId})`}
              </div>
            )}
            {referenceType === 'course' && (
              <div className="relative">
                <select
                  required
                  value={referenceId}
                  onChange={(e) => setReferenceId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary bg-white text-sm"
                  disabled={loadingCourses}
                >
                  <option value="">-- Choose Course --</option>
                  {referenceId && !courses.some((c) => String(c.id) === referenceId) && (
                    <option value={referenceId}>Course ID: {referenceId}</option>
                  )}
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.name} ({course.category})
                    </option>
                  ))}
                </select>
                {loadingCourses && (
                  <span className="absolute right-8 top-2.5 animate-spin w-4 h-4 border-2 border-secondary border-t-transparent rounded-full" />
                )}
              </div>
            )}
            {referenceType === 'group' && (
              <div className="relative">
                <select
                  required
                  value={referenceId}
                  onChange={(e) => setReferenceId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary bg-white text-sm"
                  disabled={loadingGroups}
                >
                  <option value="">-- Choose Group --</option>
                  {referenceId && !groups.some((g) => String(g.id) === referenceId) && (
                    <option value={referenceId}>Group ID: {referenceId}</option>
                  )}
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name} - Level {group.current_level} ({group.schedule ? `${group.schedule.day} ${group.schedule.start_time}` : 'No schedule'})
                    </option>
                  ))}
                </select>
                {loadingGroups && (
                  <span className="absolute right-8 top-2.5 animate-spin w-4 h-4 border-2 border-secondary border-t-transparent rounded-full" />
                )}
              </div>
            )}
            {referenceType === 'competition' && (
              <div className="relative">
                <select
                  required
                  value={referenceId}
                  onChange={(e) => setReferenceId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary bg-white text-sm"
                  disabled={loadingCompetitions}
                >
                  <option value="">-- Choose Competition --</option>
                  {referenceId && !competitions.some((c) => String(c.id) === referenceId) && (
                    <option value={referenceId}>Competition ID: {referenceId}</option>
                  )}
                  {competitions.map((comp) => (
                    <option key={comp.id} value={comp.id}>
                      {comp.name} ({comp.competition_date ? new Date(comp.competition_date).toLocaleDateString() : 'No date'})
                    </option>
                  ))}
                </select>
                {loadingCompetitions && (
                  <span className="absolute right-8 top-2.5 animate-spin w-4 h-4 border-2 border-secondary border-t-transparent rounded-full" />
                )}
              </div>
            )}
            {referenceType === 'payment' && (
              <div className="relative">
                <select
                  required
                  value={referenceId}
                  onChange={(e) => setReferenceId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary bg-white text-sm"
                  disabled={loadingPayments}
                >
                  <option value="">-- Choose Payment --</option>
                  {referenceId && !payments.some((p) => String(p.id) === referenceId) && (
                    <option value={referenceId}>Invoice #{referenceId}</option>
                  )}
                  {payments.map((payment) => (
                    <option key={payment.id} value={payment.id}>
                      Invoice #{payment.id} - ${payment.amount} ({payment.status})
                    </option>
                  ))}
                  {payments.length === 0 && !loadingPayments && (
                    <option disabled value="">No payments found for this student</option>
                  )}
                </select>
                {loadingPayments && (
                  <span className="absolute right-8 top-2.5 animate-spin w-4 h-4 border-2 border-secondary border-t-transparent rounded-full" />
                )}
              </div>
            )}
            {referenceType === 'enrollment' && (
              <div className="relative">
                <select
                  required
                  value={referenceId}
                  onChange={(e) => setReferenceId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary bg-white text-sm"
                  disabled={loadingEnrollments}
                >
                  <option value="">-- Choose Enrollment --</option>
                  {referenceId && !enrollments.some((e) => String(e.id) === referenceId) && (
                    <option value={referenceId}>Enrollment ID: {referenceId}</option>
                  )}
                  {enrollments.map((enrollment) => (
                    <option key={enrollment.id} value={enrollment.id}>
                      {enrollment.course_name} (Level {enrollment.level_number}) - Group: {enrollment.group_name || 'N/A'}
                    </option>
                  ))}
                  {enrollments.length === 0 && !loadingEnrollments && (
                    <option disabled value="">No enrollments found for this student</option>
                  )}
                </select>
                {loadingEnrollments && (
                  <span className="absolute right-8 top-2.5 animate-spin w-4 h-4 border-2 border-secondary border-t-transparent rounded-full" />
                )}
              </div>
            )}
          </div>
        )}

        {/* Metadata JSON */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Metadata JSON (Optional)
          </label>
          <textarea
            rows={4}
            placeholder='{\n  "coupon_code": "SUMMER50",\n  "approved_by": "Principal"\n}'
            value={metadataJson}
            onChange={(e) => setMetadataJson(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary font-mono text-sm"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-white bg-primary hover:bg-primary/90 disabled:bg-primary/50 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            {loading && <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />}
            {activity ? 'Save Changes' : 'Log Activity'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
