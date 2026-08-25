import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Plus, Trash2 } from 'lucide-react'
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
  const { t } = useTranslation('directory')
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
  const [metadataRows, setMetadataRows] = useState<{ key: string; value: string }[]>([])

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

      // Map metadata object to Key-Value Rows
      if (activity.metadata && typeof activity.metadata === 'object') {
        const rows = Object.entries(activity.metadata).map(([k, v]) => ({
          key: k,
          value: typeof v === 'object' ? JSON.stringify(v) : String(v),
        }))
        setMetadataRows(rows)
      } else {
        setMetadataRows([])
      }
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
      setMetadataRows([])
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

  // Key-Value row builders
  const addMetadataRow = () => {
    setMetadataRows([...metadataRows, { key: '', value: '' }])
  }

  const removeMetadataRow = (index: number) => {
    setMetadataRows(metadataRows.filter((_, idx) => idx !== index))
  }

  const updateMetadataRow = (index: number, field: 'key' | 'value', val: string) => {
    setMetadataRows(
      metadataRows.map((row, idx) => (idx === index ? { ...row, [field]: val } : row))
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const finalType = isCustomType ? customType.trim() : activityType
    if (!finalType) {
      showToast(t('toast.activity_type_required'), 'error')
      return
    }

    // Compile rows to a JSON metadata object
    const finalMetadata: Record<string, unknown> = {}
    for (const row of metadataRows) {
      const k = row.key.trim()
      const v = row.value.trim()
      if (k) {
        // Automatically parse simple types
        if (v === 'true') {
          finalMetadata[k] = true
        } else if (v === 'false') {
          finalMetadata[k] = false
        } else if (v !== '' && !isNaN(Number(v))) {
          finalMetadata[k] = Number(v)
        } else {
          try {
            // Try parsing if it is nested JSON
            finalMetadata[k] = JSON.parse(v)
          } catch {
            finalMetadata[k] = v
          }
        }
      }
    }

    let finalCreatedAt: string | null = null
    if (createdAt) {
      try {
        finalCreatedAt = new Date(createdAt).toISOString()
      } catch {
        showToast(t('toast.invalid_date_format'), 'error')
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
        metadata: Object.keys(finalMetadata).length > 0 ? finalMetadata : null,
        created_at: finalCreatedAt,
      }

      if (activity) {
        await updateActivity(studentId, activity.id, payload)
        showToast(t('toast.activity_updated'), 'success')
      } else {
        await logActivity(studentId, payload)
        showToast(t('toast.activity_logged'), 'success')
      }
      onSuccess()
      onClose()
    } catch (err: any) {
      showToast(err?.response?.data?.message || t('toast.operation_failed'), 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={activity ? t('log_activity.title_edit') : t('log_activity.title_log')}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Type Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              {t('log_activity.activity_type_label')}
            </label>
            <select
              value={activityType}
              onChange={(e) => handleTypeChange(e.target.value)}
              className="w-full bg-transparent border-b border-slate-300 focus:border-secondary focus:outline-none transition-all py-1.5 text-sm cursor-pointer"
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
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              {t('log_activity.subtype_label')}
            </label>
            <input
              type="text"
              placeholder={t('log_activity.subtype_placeholder')}
              value={activitySubtype}
              onChange={(e) => setActivitySubtype(e.target.value)}
              className="w-full bg-transparent border-b border-slate-300 focus:border-secondary focus:outline-none transition-all py-1.5 text-sm"
            />
          </div>
        </div>

        {/* Custom Type Input */}
        {isCustomType && (
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              {t('log_activity.custom_type_label')}
            </label>
            <input
              type="text"
              required
              placeholder={t('log_activity.custom_type_placeholder')}
              value={customType}
              onChange={(e) => setCustomType(e.target.value)}
              className="w-full bg-transparent border-b border-slate-300 focus:border-secondary focus:outline-none transition-all py-1.5 font-mono text-sm"
            />
          </div>
        )}

        {/* Description */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
            {t('log_activity.description_label')}
          </label>
          <textarea
            rows={2}
            placeholder={t('log_activity.description_placeholder')}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-transparent border-b border-slate-300 focus:border-secondary focus:outline-none transition-all py-1.5 text-sm resize-none"
          />
        </div>

        {/* Date Time Picker & Reference type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              {t('log_activity.logged_date_label')}
            </label>
            <input
              type="datetime-local"
              value={createdAt}
              onChange={(e) => setCreatedAt(e.target.value)}
              className="w-full bg-transparent border-b border-slate-300 focus:border-secondary focus:outline-none transition-all py-1.5 text-sm"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              {t('log_activity.reference_label')}
            </label>
            <select
              value={referenceType}
              onChange={(e) => handleReferenceTypeChange(e.target.value as ReferenceType | '')}
              className="w-full bg-transparent border-b border-slate-300 focus:border-secondary focus:outline-none transition-all py-1.5 text-sm cursor-pointer"
            >
              <option value="">{t('log_activity.no_reference')}</option>
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
          <div className="bg-slate-100/50 rounded-[6px] p-3 space-y-1">
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Select Referenced {referenceType} *
            </label>
            {referenceType === 'student' && (
              <div className="py-1 text-sm text-slate-700 font-medium">
                {studentData ? `${studentData.full_name} (ID: ${studentId})` : `Student (ID: ${studentId})`}
              </div>
            )}
            {referenceType === 'course' && (
              <div className="relative">
                <select
                  required
                  value={referenceId}
                  onChange={(e) => setReferenceId(e.target.value)}
                  className="w-full bg-transparent border-b border-slate-300 focus:border-secondary focus:outline-none transition-all py-1 text-sm cursor-pointer"
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
                  <span className="absolute right-8 top-1 animate-spin w-4 h-4 border-2 border-secondary border-t-transparent rounded-full" />
                )}
              </div>
            )}
            {referenceType === 'group' && (
              <div className="relative">
                <select
                  required
                  value={referenceId}
                  onChange={(e) => setReferenceId(e.target.value)}
                  className="w-full bg-transparent border-b border-slate-300 focus:border-secondary focus:outline-none transition-all py-1 text-sm cursor-pointer"
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
                  <span className="absolute right-8 top-1 animate-spin w-4 h-4 border-2 border-secondary border-t-transparent rounded-full" />
                )}
              </div>
            )}
            {referenceType === 'competition' && (
              <div className="relative">
                <select
                  required
                  value={referenceId}
                  onChange={(e) => setReferenceId(e.target.value)}
                  className="w-full bg-transparent border-b border-slate-300 focus:border-secondary focus:outline-none transition-all py-1 text-sm cursor-pointer"
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
                  <span className="absolute right-8 top-1 animate-spin w-4 h-4 border-2 border-secondary border-t-transparent rounded-full" />
                )}
              </div>
            )}
            {referenceType === 'payment' && (
              <div className="relative">
                <select
                  required
                  value={referenceId}
                  onChange={(e) => setReferenceId(e.target.value)}
                  className="w-full bg-transparent border-b border-slate-300 focus:border-secondary focus:outline-none transition-all py-1 text-sm cursor-pointer"
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
                  <span className="absolute right-8 top-1 animate-spin w-4 h-4 border-2 border-secondary border-t-transparent rounded-full" />
                )}
              </div>
            )}
            {referenceType === 'enrollment' && (
              <div className="relative">
                <select
                  required
                  value={referenceId}
                  onChange={(e) => setReferenceId(e.target.value)}
                  className="w-full bg-transparent border-b border-slate-300 focus:border-secondary focus:outline-none transition-all py-1 text-sm cursor-pointer"
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
                  <span className="absolute right-8 top-1 animate-spin w-4 h-4 border-2 border-secondary border-t-transparent rounded-full" />
                )}
              </div>
            )}
          </div>
        )}

        {/* Metadata Custom Fields builder */}
        <div className="bg-slate-100/50 rounded-[6px] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              {t('log_activity.metadata_label')}
            </span>
            <button
              type="button"
              onClick={addMetadataRow}
              className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-secondary hover:text-secondary/80 bg-slate-200/50 hover:bg-slate-200/80 rounded-[6px] transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              {t('log_activity.add_field')}
            </button>
          </div>

          {metadataRows.length === 0 ? (
            <p className="text-xs text-slate-400 italic">
              {t('log_activity.no_custom_fields')}
            </p>
          ) : (
            <div className="space-y-3 max-h-40 overflow-y-auto pr-1 scrollbar-thin">
              {metadataRows.map((row, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder={t('log_activity.key_placeholder')}
                    value={row.key}
                    onChange={(e) => updateMetadataRow(idx, 'key', e.target.value)}
                    className="flex-1 min-w-0 bg-transparent border-b border-slate-300 focus:border-secondary focus:outline-none transition-all py-1 text-xs"
                  />
                  <input
                    type="text"
                    placeholder={t('log_activity.value_placeholder')}
                    value={row.value}
                    onChange={(e) => updateMetadataRow(idx, 'value', e.target.value)}
                    className="flex-1 min-w-0 bg-transparent border-b border-slate-300 focus:border-secondary focus:outline-none transition-all py-1 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => removeMetadataRow(idx)}
                    className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-[4px] transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-[6px] text-xs font-semibold transition-colors"
          >
            {t('log_activity.cancel')}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-white bg-secondary hover:bg-secondary/90 disabled:bg-secondary/50 rounded-[6px] text-xs font-semibold transition-colors flex items-center gap-2"
          >
            {loading && <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />}
            {activity ? t('log_activity.save_changes') : t('log_activity.log_activity')}
          </button>
        </div>
      </form>
    </Modal>
  )
}
