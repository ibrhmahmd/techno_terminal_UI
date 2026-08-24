import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BookOpen, GraduationCap, CheckCircle, XCircle, AlertCircle, Edit3, FileDown, MessageCircle, Calendar, Trash2 } from 'lucide-react'
import type { LevelDetailDTO, LevelPaymentsDTO, CourseInfoDTO, InstructorInfoDTO, PaymentDetailDTO } from '../../api/academics'
import { LevelSelector } from './detail/LevelSelector'
import { useGroupAttendance } from '../../hooks/useGroupAttendance'
import { AttendanceGrid } from '../attendance/AttendanceGrid'
import { transformRoster, transformSessions } from '../../utils/attendanceTransforms'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { downloadReceiptPdf } from '../../api/finance/receipts'
import { sendReceiptToStudent } from '../../api/crm/students/payments'
import { useToast } from '../common/Toast'
import { formatDate } from '../../utils/formatting'
import { useAuthStore } from '../../store/authStore'
import { useGroupMutations } from '../../hooks/useGroupMutations'
import { EditGroupLevelDialog } from './detail/EditGroupLevelDialog'
import { ConfirmDialog } from '../common/ConfirmDialog'

const formatCurrency = (amount: number) => {
  return `${amount.toLocaleString()} EGP`
}

function LevelPaymentsPanel({ payments }: { payments: LevelPaymentsDTO['payments'] }) {
  const { t } = useTranslation('groups')
  const { showToast } = useToast()
  const [downloadingId, setDownloadingId] = useState<number | null>(null)
  const [sendingId, setSendingId] = useState<number | null>(null)

  if (!payments || payments.length === 0) {
    return (
      <div className="py-8 text-center bg-slate-50 rounded-lg">
        <p className="text-slate-500 text-sm">{t('levelsTab.no_payments')}</p>
      </div>
    )
  }

  const handleDownloadPdf = async (payment: PaymentDetailDTO, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!payment.receipt_id) {
      showToast('No receipt linked to this payment', 'error')
      return
    }
    setDownloadingId(payment.payment_id)
    try {
      const blob = await downloadReceiptPdf(payment.receipt_id)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `receipt-${payment.receipt_number || payment.receipt_id}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      showToast('Receipt PDF downloaded successfully', 'success')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to download receipt PDF', 'error')
    } finally {
      setDownloadingId(null)
    }
  }

  const handleSendWhatsApp = async (payment: PaymentDetailDTO, e: React.MouseEvent) => {
    e.stopPropagation()
    setSendingId(payment.payment_id)
    try {
      const result = await sendReceiptToStudent(payment.payment_id, 'whatsapp')
      if (result.success) {
        showToast(result.message || 'Receipt sent via WhatsApp successfully', 'success')
      } else {
        showToast(result.message || 'Failed to send receipt via WhatsApp', 'error')
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to send receipt via WhatsApp', 'error')
    } finally {
      setSendingId(null)
    }
  }

  return (
    <div className="mt-4 border border-slate-100 rounded-xl bg-white overflow-hidden">
      <div className="bg-slate-50 px-4 py-3 border-b border-slate-100">
        <h5 className="text-sm font-semibold text-slate-700">Recent Payments ({payments.length})</h5>
      </div>
      <div className="divide-y divide-slate-100">
        {payments.map((payment) => (
          <div key={payment.payment_id} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50/50 transition-colors">
            <div>
              <p className="text-sm font-medium text-slate-900">{payment.student_name}</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {formatDate(payment.payment_date)} • {payment.payment_method}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-end">
                <p className={`text-sm font-semibold ${
                  payment.status === 'completed' ? 'text-emerald-600' :
                  payment.status === 'pending' ? 'text-amber-600' :
                  payment.status === 'failed' ? 'text-red-600' :
                  'text-slate-600'
                }`}>
                  {formatCurrency(payment.amount)}
                </p>
                <span className={`text-[10px] px-2 py-0.5 mt-1 inline-block rounded-full uppercase tracking-wider font-bold ${
                  payment.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                  payment.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                  payment.status === 'failed' ? 'bg-red-100 text-red-700' :
                  'bg-slate-100 text-slate-600'
                }`}>
                  {payment.status}
                </span>
              </div>
              {payment.status === 'completed' && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => handleDownloadPdf(payment, e)}
                    disabled={downloadingId === payment.payment_id}
                    className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50"
                    title={t('levelsTab.download_pdf')}
                  >
                    <FileDown className="w-4 h-4" aria-hidden="true" />
                  </button>
                  <button
                    onClick={(e) => handleSendWhatsApp(payment, e)}
                    disabled={sendingId === payment.payment_id}
                    className="p-1.5 text-slate-400 hover:text-green-600 rounded-lg hover:bg-green-50 transition-colors disabled:opacity-50"
                    title={t('levelsTab.send_whatsapp')}
                  >
                    <MessageCircle className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

interface LevelsTabProps {
  levels: LevelDetailDTO[]
  currentLevelNumber: number
  groupId: number
  paymentsByLevel?: LevelPaymentsDTO[]
  coursesMap: Record<string, CourseInfoDTO>
  instructorsMap: Record<string, InstructorInfoDTO>
  onAddLevel?: () => void
  groupInstructorName?: string
  groupName?: string
  courseName?: string
}

export function LevelsTab({
  levels,
  currentLevelNumber,
  groupId,
  paymentsByLevel,
  coursesMap,
  instructorsMap,
  onAddLevel,
  groupInstructorName,
  groupName,
  courseName,
}: LevelsTabProps) {
  const { t } = useTranslation('groups')
  const initialLevelId = levels.find(l => l.level_number === currentLevelNumber)?.level_id || levels[0]?.level_id || null
  const [selectedLevelId, setSelectedLevelId] = useState<number | null>(initialLevelId)
  const [viewMode, setViewMode] = useState<'attendance' | 'payments'>('attendance')

  const activeLevelId = selectedLevelId || levels[0]?.level_id || null
  const selectedLevel = levels.find(l => l.level_id === activeLevelId)

  const { user } = useAuthStore()
  const isAdmin = user?.role === 'admin' || user?.role === 'system_admin'
  const { showToast } = useToast()
  
  const { updateLevel, deleteLevel } = useGroupMutations(groupId)

  const [isEditLevelDialogOpen, setIsEditLevelDialogOpen] = useState(false)
  const [isDeleteLevelDialogOpen, setIsDeleteLevelDialogOpen] = useState(false)
  const [isMutatingLevel, setIsMutatingLevel] = useState(false)

  const maxLevelNumber = levels.length > 0 ? Math.max(...levels.map(l => l.level_number)) : 0
  const isLatestLevel = selectedLevel?.level_number === maxLevelNumber

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-500" aria-hidden={true} />
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" aria-hidden={true} />
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" aria-hidden={true} />
      default:
        return <AlertCircle className="w-5 h-5 text-slate-400" aria-hidden={true} />
    }
  }

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium"
    switch (status) {
      case 'active':
        return <span className={`${baseClasses} bg-amber-100 text-amber-700`}>Active</span>
      case 'completed':
        return <span className={`${baseClasses} bg-green-100 text-green-700`}>Completed</span>
      case 'cancelled':
        return <span className={`${baseClasses} bg-red-100 text-red-700`}>Cancelled</span>
      default:
        return <span className={`${baseClasses} bg-slate-100 text-slate-600`}>Unknown</span>
    }
  }

  const getDurationString = (start?: string | null, end?: string | null) => {
    if (!start || !end) return ''
    try {
      const s = new Date(start)
      const e = new Date(end)
      const diffTime = Math.abs(e.getTime() - s.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      const weeks = Math.floor(diffDays / 7)
      const extraDays = diffDays % 7
      
      const parts = []
      if (weeks > 0) {
        parts.push(`${weeks} week${weeks > 1 ? 's' : ''}`)
      }
      if (extraDays > 0 || weeks === 0) {
        parts.push(`${extraDays} day${extraDays > 1 ? 's' : ''}`)
      }
      return `${parts.join(' ')}`
    } catch {
      return ''
    }
  }

  const handleEditLevelConfirm = async (data: {
    instructor_id: number | null
    course_id: number | null
    price_override: number | null
    notes: string | null
  }) => {
    if (!selectedLevel) return
    setIsMutatingLevel(true)
    try {
      await updateLevel(selectedLevel.level_number, data)
      showToast(t('levelsTab.level_updated', { level: selectedLevel.level_number }), 'success')
      setIsEditLevelDialogOpen(false)
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : t('levelsTab.failed_update'), 'error')
    } finally {
      setIsMutatingLevel(false)
    }
  }


  const handleDeleteLevelConfirm = async () => {
    if (!selectedLevel) return
    setIsMutatingLevel(true)
    try {
      await deleteLevel(selectedLevel.level_number)
      showToast(t('levelsTab.level_deleted', { level: selectedLevel.level_number }), 'success')
      const remainingLevels = levels.filter(l => l.level_number !== selectedLevel.level_number)
      if (remainingLevels.length > 0) {
        const nextActiveId = remainingLevels.find(l => l.level_number === currentLevelNumber - 1)?.level_id || remainingLevels[remainingLevels.length - 1]?.level_id || null
        setSelectedLevelId(nextActiveId)
      } else {
        setSelectedLevelId(null)
      }
      setIsDeleteLevelDialogOpen(false)
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : t('levelsTab.failed_delete'), 'error')
    } finally {
      setIsMutatingLevel(false)
    }
  }

  if (levels.length === 0) {
      return (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
          <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" aria-hidden={true} />
          <h3 className="text-lg font-medium text-slate-700 mb-1">{t('levelsTab.no_level_history')}</h3>
          <p className="text-slate-500">{t('levelsTab.no_level_history_desc')}</p>
        </div>
      )
  }

  if (!selectedLevel) return null

  return (
    <div className="space-y-4">
      <LevelSelector
        levels={levels}
        activeLevelId={activeLevelId}
        onLevelChange={setSelectedLevelId}
        currentLevelNumber={currentLevelNumber}
        onAddLevel={onAddLevel}
      />

      <div className="grid gap-6">
        <div className={`bg-surface-container-low border border-surface-container-low rounded-lg p-6 ${
          selectedLevel.level_number === currentLevelNumber ? 'ring-1 ring-secondary/30' : ''
        }`}>
          {/* Card Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-md bg-gradient-to-br from-secondary to-secondary/80 flex items-center justify-center text-white font-bold text-lg">
                {selectedLevel.level_number}
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                  Level {selectedLevel.level_number}
                  {isAdmin && selectedLevel.status === 'active' && (
                    <button
                      onClick={() => setIsEditLevelDialogOpen(true)}
                      title="Edit Level Details"
                      className="p-1 hover:bg-slate-200 rounded-md transition-colors text-slate-500 hover:text-slate-700 flex items-center justify-center"
                      aria-label="Edit level details"
                    >
                      <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  )}
                  {selectedLevel.level_number === currentLevelNumber && (
                    <span className="text-[10px] bg-secondary/10 text-secondary px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                      {t('levelsTab.current')}
                    </span>
                  )}
                </h3>
                <p className="text-sm text-slate-500 flex items-center gap-1">
                  <BookOpen className="w-4 h-4" aria-hidden="true" />
                  {coursesMap[selectedLevel.course_id]?.course_name || `${t('levelsTab.course')} ID: ${selectedLevel.course_id}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isAdmin && selectedLevel.status === 'active' && isLatestLevel && selectedLevel.level_number > 1 && (
                <div className="flex items-center gap-1.5 me-2">
                  <button
                    onClick={() => setIsDeleteLevelDialogOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-200 shadow-sm flex items-center"
                    title={t('levelsTab.undo_level')}
                  >
                    <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                    {t('levelsTab.undo_level')}
                  </button>
                </div>
              )}
              {getStatusBadge(selectedLevel.status)}
              {getStatusIcon(selectedLevel.status)}
            </div>
          </div>

          {/* Level Metrics Grid */}
          {(() => {
            const unpaidCount = selectedLevel.payment_summary?.unpaid_students_count ?? 0
            const paidCount = Math.max(0, (selectedLevel.students_count ?? 0) - unpaidCount)

            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
                {/* Start Date Card */}
                <div className="bg-surface-container-lowest p-3.5 rounded-md border border-surface-container-low flex flex-col justify-between min-h-[84px] shadow-sm">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 mb-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                      {t('levelsTab.start_date')}
                    </span>
                    <span className="font-headline text-sm font-extrabold text-slate-900 leading-tight block">
                      {formatDate(selectedLevel.start_date) || 'N/A'}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block">Level induction</span>
                </div>

                {/* End Date Card */}
                <div className="bg-surface-container-lowest p-3.5 rounded-md border border-surface-container-low flex flex-col justify-between min-h-[84px] shadow-sm">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 mb-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                      {t('levelsTab.end_date')}
                    </span>
                    <span className="font-headline text-sm font-extrabold text-slate-900 leading-tight block">
                      {formatDate(selectedLevel.end_date) || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] font-extrabold text-secondary bg-secondary/10 px-2 py-0.5 rounded mt-1 inline-block">
                      {t('levelsTab.duration', { duration: getDurationString(selectedLevel.start_date, selectedLevel.end_date) || t('levelsTab.duration_n_a') })}
                    </span>
                  </div>
                </div>

                {/* Paid Students Card */}
                <div className="bg-surface-container-lowest p-3.5 rounded-md border border-surface-container-low flex flex-col justify-between min-h-[84px] shadow-sm">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 mb-1">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500" aria-hidden="true" />
                      {t('levelsTab.paid_students')}
                    </span>
                    <span className="font-headline text-base font-extrabold text-emerald-600 leading-tight block">
                      {paidCount} {t('levelsTab.student')}{paidCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block font-medium">{t('levelsTab.tuition_settled')}</span>
                </div>

                {/* Unpaid Students Card */}
                <div className="bg-surface-container-lowest p-3.5 rounded-md border border-surface-container-low flex flex-col justify-between min-h-[84px] shadow-sm">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 mb-1">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" />
                      {t('levelsTab.unpaid_students')}
                    </span>
                    <span className="font-headline text-base font-extrabold text-amber-600 leading-tight block">
                      {unpaidCount} {t('levelsTab.student')}{unpaidCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block font-medium">{t('levelsTab.outstanding_fees')}</span>
                </div>

                {/* Course Card */}
                <div className="bg-surface-container-lowest p-3.5 rounded-md border border-surface-container-low flex flex-col justify-between min-h-[84px] shadow-sm">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 mb-1">
                      <BookOpen className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                      {t('levelsTab.course')}
                    </span>
                    <span className="font-headline text-sm font-extrabold text-slate-900 leading-tight block truncate" title={coursesMap[selectedLevel.course_id]?.course_name || courseName || `ID: ${selectedLevel.course_id}`}>
                      {coursesMap[selectedLevel.course_id]?.course_name || courseName || `ID: ${selectedLevel.course_id}`}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block">{t('levelsTab.curriculum_standard')}</span>
                </div>
              </div>
            )
          })()}

          <div className="mt-6 border-t border-slate-200 pt-6">
            <div className="flex justify-center mb-6">
              <div role="tablist" aria-label="Select view" className="flex items-center gap-1 rounded-md bg-surface-container-low border border-surface-container-low p-1 w-full max-w-md">
                <button
                  role="tab"
                  aria-selected={viewMode === 'attendance'}
                  onClick={() => setViewMode('attendance')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-all whitespace-nowrap font-headline text-sm ${
                    viewMode === 'attendance'
                      ? 'bg-surface text-secondary shadow-sm font-bold border border-surface-container-high'
                      : 'text-slate-600 hover:text-secondary hover:bg-surface-container-lowest/50'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]" aria-hidden="true">groups</span>
                  {t('levelsTab.attendance_sessions')}
                </button>
                <button
                  role="tab"
                  aria-selected={viewMode === 'payments'}
                  onClick={() => setViewMode('payments')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-all whitespace-nowrap font-headline text-sm ${
                    viewMode === 'payments'
                      ? 'bg-surface text-secondary shadow-sm font-bold border border-surface-container-high'
                      : 'text-slate-600 hover:text-secondary hover:bg-surface-container-lowest/50'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]" aria-hidden="true">payments</span>
                  {t('levelsTab.payments')}
                </button>
              </div>
            </div>
            
            {viewMode === 'attendance' ? (
              <div className="animate-fadeIn">
                <LevelAttendancePanel
                  groupId={groupId}
                  levelNumber={selectedLevel.level_number}
                  groupInstructorName={
                    (selectedLevel.instructor_id && instructorsMap?.[selectedLevel.instructor_id]?.instructor_name) ||
                    groupInstructorName
                  }
                  groupName={groupName}
                  courseName={courseName}
                />
              </div>
            ) : viewMode === 'payments' ? (
              <div className="animate-fadeIn">
                {selectedLevel.payment_summary && (
                  <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                      <p className="text-xs text-slate-500 font-medium mb-1 uppercase tracking-wider">{t('levelsTab.expected')}</p>
                      <p className="text-xl font-bold text-slate-900 font-headline">{selectedLevel.payment_summary.total_expected} EGP</p>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                      <p className="text-xs text-emerald-600 font-medium mb-1 uppercase tracking-wider">{t('levelsTab.collected')}</p>
                      <p className="text-xl font-bold text-emerald-700 font-headline">
                        {selectedLevel.payment_summary.total_collected} EGP
                      </p>
                    </div>
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                      <p className="text-xs text-amber-600 font-medium mb-1 uppercase tracking-wider">{t('levelsTab.due')}</p>
                      <p className="text-xl font-bold text-amber-700 font-headline">
                        {selectedLevel.payment_summary.total_due} EGP
                      </p>
                    </div>
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                      <p className="text-xs text-blue-600 font-medium mb-1 uppercase tracking-wider">{t('levelsTab.collection_rate')}</p>
                      <p className="text-xl font-bold text-blue-700 font-headline">
                        {Math.round(selectedLevel.payment_summary.collection_rate * 100)}%
                      </p>
                    </div>
                  </div>
                )}
                <LevelPaymentsPanel payments={paymentsByLevel?.find(p => p.level_number === selectedLevel.level_number)?.payments || []} />
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Level Management Dialogs */}
      <EditGroupLevelDialog
        isOpen={isEditLevelDialogOpen}
        levelNumber={selectedLevel.level_number}
        currentInstructorId={selectedLevel.instructor_id}
        currentCourseId={selectedLevel.course_id}
        currentPriceOverride={selectedLevel.price_override}
        currentNotes={selectedLevel.notes}
        onClose={() => setIsEditLevelDialogOpen(false)}
        onConfirm={handleEditLevelConfirm}
        isLoading={isMutatingLevel}
      />

      <ConfirmDialog
        isOpen={isDeleteLevelDialogOpen}
        onCancel={() => setIsDeleteLevelDialogOpen(false)}
        onConfirm={handleDeleteLevelConfirm}
        title={t('levelsTab.undo_level_title', { level: selectedLevel.level_number })}
        message={t('levelsTab.undo_level_message')}
        confirmText={t('levelsTab.undo_progression')}
        variant="danger"
      />
    </div>
  )
}

function LevelAttendancePanel({
  groupId,
  levelNumber,
  groupInstructorName,
  groupName,
  courseName,
}: {
  groupId: number
  levelNumber: number
  groupInstructorName?: string
  groupName?: string
  courseName?: string
}) {
  const { roster, sessions, isLoading, error } = useGroupAttendance(groupId, levelNumber)

  if (isLoading) return <div className="py-12 flex justify-center"><LoadingSpinner /></div>
  if (error) return <div className="py-8 text-center text-red-500">Failed to load attendance: {error}</div>

  const transformedRoster = transformRoster(roster)
  const transformedSessions = transformSessions(sessions, roster, groupId, levelNumber)

  return (
    <AttendanceGrid 
      roster={transformedRoster}
      sessions={transformedSessions}
      groupId={groupId}
      level={levelNumber}
      groupInstructorName={groupInstructorName}
      groupName={groupName}
      courseName={courseName}
    />
  )
}
