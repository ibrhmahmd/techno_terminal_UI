import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Phone, Calendar, User, Clock, Edit2, Trash2 } from 'lucide-react'
import { TopNavbar } from '../components/dashboard/TopNavbar'
import { PageSection, Modal, LoadingSpinner, EntityPageHeader } from '../components/common'
import { useToast } from '../components/common/Toast'
import { StudentForm } from '../components/crm/StudentForm'
import { LinkParentModal } from '../components/crm/LinkParentModal'
import { StudentTabs, type TabId } from '../components/student/StudentTabs'
import { OverviewTab } from '../components/student/OverviewTab'
import { EnrollmentsTab, EnrollDialog } from '../components/student/EnrollmentsTab'
import { CoursesTab } from '../components/student/CoursesTab'
import { CompetitionsTab } from '../components/student/CompetitionsTab'
import { TeamsTab } from '../components/student/TeamsTab'
import { ErrorBoundary } from '../components/common/ErrorBoundary'
import { PaymentsTab } from '../components/student/PaymentsTab'
import { ActivityHistoryTab } from '../components/student/ActivityHistoryTab'
import { 
  updateStudent,
  softDeleteStudent,
  restoreStudent,
  hardDeleteStudent,
  isStudentDeleted,
  type UpdateStudentDTO,
  getStatusLabel
} from '../api/crm/students/'
import { useStudentCore, useStudentBalance } from '../hooks/students'
import { useStudentCourses } from '../hooks/students/useStudentCourses'
import { useStudentCompetitions } from '../hooks/students/useStudentCompetitions'
import { useStudentTeams } from '../hooks/students/useStudentTeams'
import { enrollStudent } from '../api/academics'
import { useGroupsFlat } from '../hooks/useGroupQueries'


export function StudentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const studentId = Number(id) || 1
  const { showToast, ToastComponent } = useToast()
  const [activeTab, setActiveTab] = useState<TabId>('overview')

  // OPTIMIZED: Core data loads immediately (2 API calls instead of 6)
  const { 
    student, 
    details,
    loading: loadingCore, 
    error: errorCore,
    refresh: refreshCore 
  } = useStudentCore(studentId)
  
  // LAZY: Balance only loads when Payments tab is active
  const {
    balance,
    loading: loadingBalance,
    error: errorBalance,
    refresh: refreshBalance
  } = useStudentBalance(studentId, activeTab === 'payments')
  
  // Siblings now come from details (no separate API call needed)
  const siblings = details?.siblings || []

  // Balance summary from details for Overview tab (no separate API call needed)
  // Full balance with enrollment breakdown is fetched separately for Payments tab
  const balanceFromDetails = details?.balance_summary ? {
    student_id: studentId,
    total_amount_due: details.balance_summary.total_due,
    total_discounts: details.balance_summary.total_discount,
    total_paid: details.balance_summary.total_paid,
    net_balance: details.balance_summary.net_balance,
    enrollments: [] // Summary doesn't include per-enrollment breakdown
  } : null

  // LAZY: Courses, Competitions, Teams load only when their tabs are active
  const { data: courses } = useStudentCourses(studentId, activeTab === 'courses')
  const { data: competitions } = useStudentCompetitions(studentId, activeTab === 'competitions')
  const { data: teams } = useStudentTeams(studentId, activeTab === 'teams')
  
  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false)
  const [isHardDeleteModalOpen, setIsHardDeleteModalOpen] = useState(false)
  const [isLinkParentModalOpen, setIsLinkParentModalOpen] = useState(false)
  const [isEnrollDialogOpen, setIsEnrollDialogOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [recentGroupIds, setRecentGroupIds] = useState<number[]>([])

  // Check if student is soft-deleted
  const studentIsDeleted = student ? isStudentDeleted(student) : false
  
  // Available groups for enrollment
  const { data: groups, isLoading: isLoadingGroups } = useGroupsFlat(undefined, isEnrollDialogOpen)

  // Filter out groups the student is already enrolled in
  const enrolledGroupIds = details?.enrollments
    ?.filter(e => e.status === 'active')
    .map(e => e.group_id) || []
    
  const availableGroups = (groups?.items || [])
    .filter(g => !enrolledGroupIds.includes(g.id))

  // Refresh data after successful operations
  const handleRefresh = async () => {
    await refreshCore()
    // Also refresh lazy-loaded data if already loaded
    if (activeTab === 'payments') {
      await refreshBalance()
    }
  }

  const handleUpdateStudent = async (data: UpdateStudentDTO) => {
    setIsProcessing(true)
    try {
      await updateStudent(studentId, data)
      await handleRefresh()
      setIsEditModalOpen(false)
    } catch (err) {
      console.error('Failed to update student:', err)
      showToast('Failed to update student. Please try again.', 'error')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSoftDelete = async () => {
    setIsProcessing(true)
    try {
      await softDeleteStudent(studentId)
      showToast('Student moved to deleted items', 'success')
      navigate('/directory')
    } catch (err: unknown) {
      console.error('Failed to soft delete student:', err)
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      showToast('Failed to delete student: ' + errorMessage, 'error')
      setIsDeleteModalOpen(false)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRestore = async () => {
    setIsProcessing(true)
    try {
      await restoreStudent(studentId)
      showToast('Student restored successfully', 'success')
      await handleRefresh()
      setIsRestoreModalOpen(false)
    } catch (err: unknown) {
      console.error('Failed to restore student:', err)
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      showToast('Failed to restore student: ' + errorMessage, 'error')
      setIsRestoreModalOpen(false)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleHardDelete = async () => {
    setIsProcessing(true)
    try {
      await hardDeleteStudent(studentId)
      showToast('Student permanently deleted', 'success')
      navigate('/directory')
    } catch (err: unknown) {
      console.error('Failed to hard delete student:', err)
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      showToast('Failed to permanently delete student: ' + errorMessage, 'error')
      setIsHardDeleteModalOpen(false)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleParentLinked = () => {
    // Refresh student data to get updated parents list
    refreshCore()
  }

  interface EnrollInput {
    student_id: number
    group_id: number
  }

  const handleEnroll = async (groupId: number) => {
    try {
      const enrollData: EnrollInput = {
        student_id: studentId,
        group_id: groupId,
      }
      await enrollStudent(enrollData)
      // Add to recent groups
      setRecentGroupIds(prev => [groupId, ...prev.filter(id => id !== groupId)].slice(0, 5))
      // Refresh student data to get updated enrollments
      await handleRefresh()
    } catch (err) {
      console.error('Failed to enroll student:', err)
      throw err
    }
  }

  const renderTabContent = () => {
    if (!student) return null

    switch (activeTab) {
      case 'overview':
        return (
          <OverviewTab 
            student={student}
            details={details}
            balance={balanceFromDetails}
            siblings={siblings}
            primaryParent={details?.primary_parent}
            onLinkParent={() => setIsLinkParentModalOpen(true)}
          />
        )
      case 'enrollments':
        return (
          <EnrollmentsTab 
            studentId={studentId}
            enrollments={details?.enrollments || []}
            currentGroupName={details?.enrollments?.find((e: { status: string; group_name?: string }) => e.status === 'active')?.group_name}
            onEnroll={() => setIsEnrollDialogOpen(true)}
          />
        )
      case 'courses':
        return <CoursesTab courses={courses || []} />
      case 'competitions':
        return (
          <ErrorBoundary fallback={<div className="p-8 bg-red-50 border border-red-100 rounded-xl text-center"><p className="text-red-600">Failed to load competitions</p></div>}>
            <CompetitionsTab competitions={competitions || []} />
          </ErrorBoundary>
        )
      case 'teams':
        return (
          <ErrorBoundary fallback={<div className="p-8 bg-red-50 border border-red-100 rounded-xl text-center"><p className="text-red-600">Failed to load teams</p></div>}>
            <TeamsTab teams={teams || []} />
          </ErrorBoundary>
        )
      case 'payments':
        return (
          <PaymentsTab 
            studentId={studentId}
            balance={balance}
            loading={loadingBalance}
            error={errorBalance}
          />
        )
      case 'history':
        return <ActivityHistoryTab studentId={studentId} />
      default:
        return null
    }
  }

  // Show loading state only for core data (2 API calls)
  if (loadingCore) {
    return (
      <div className="min-h-screen bg-surface">
        <TopNavbar activePage="Directory" />
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-surface">
        <TopNavbar activePage="Directory" />
        <div className="p-8 text-center text-slate-500">
          <p>Student not found</p>
          <button
            onClick={() => navigate('/directory')}
            className="mt-4 px-4 py-2 text-sm text-secondary border border-secondary rounded hover:bg-secondary-container"
          >
            Back to Directory
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface">
      <TopNavbar activePage="Directory" />

      {/* Deleted Student Banner */}
      {studentIsDeleted && (
        <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-700">
            <Trash2 className="w-5 h-5" />
            <span className="font-medium">This student has been deleted</span>
          </div>
          <p className="text-sm text-red-600 mt-1">
            This record is in the deleted state. Restore to enable full functionality.
          </p>
        </div>
      )}

      {/* Header with Personal Info */}
      <EntityPageHeader
        title={student.full_name}
        status={studentIsDeleted 
          ? { label: 'Deleted', variant: 'error' }
          : {
              label: getStatusLabel(student.status),
              variant: student.status as 'active' | 'inactive' | 'pending' | 'warning' | 'error'
            }
        }
        quickInfo={[
          { icon: <Phone className="w-4 h-4" />, value: student.phone || '-', copyable: true },
          { icon: <Calendar className="w-4 h-4" />, value: student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString('en-CA') : '-' },
          { icon: <User className="w-4 h-4" />, value: student.gender ? student.gender.charAt(0).toUpperCase() + student.gender.slice(1) : '-' },
          { icon: <Clock className="w-4 h-4" />, value: details?.age ? `${details.age} years` : '-' }
        ]}
        actions={studentIsDeleted ? [
          { label: 'Restore', onClick: () => setIsRestoreModalOpen(true), icon: <Edit2 className="w-4 h-4" />, variant: 'primary' },
          { label: 'Delete Permanently', onClick: () => setIsHardDeleteModalOpen(true), icon: <Trash2 className="w-4 h-4" />, variant: 'danger' }
        ] : [
          { label: 'Edit', onClick: () => setIsEditModalOpen(true), icon: <Edit2 className="w-4 h-4" />, variant: 'secondary' },
          { label: 'Delete', onClick: () => setIsDeleteModalOpen(true), icon: <Trash2 className="w-4 h-4" />, variant: 'danger' }
        ]}
        backLink="/directory"
        backLabel="Back to Directory"
        whatsappPhone={student.phone}
      />

      {/* Tabs Navigation - Only show all tabs for non-deleted students */}
      {!studentIsDeleted && <StudentTabs activeTab={activeTab} onTabChange={setActiveTab} />}

      {/* Tab Content */}
      <PageSection>
        {/* Core data errors */}
        {errorCore && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-100 rounded-lg text-yellow-700 text-sm">
            {errorCore}
          </div>
        )}
        {/* For deleted students, only show Overview tab */}
        {studentIsDeleted ? (
          <OverviewTab 
            student={student}
            details={details}
            balance={balanceFromDetails}
            siblings={siblings}
            primaryParent={details?.primary_parent}
            onLinkParent={() => {}}
          />
        ) : renderTabContent()}
      </PageSection>

      {/* Edit Student Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Student"
      >
        <StudentForm
          initialData={student}
          onSubmit={handleUpdateStudent}
          onCancel={() => setIsEditModalOpen(false)}
          mode="edit"
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Student"
        size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isProcessing}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSoftDelete}
              disabled={isProcessing}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {isProcessing && <LoadingSpinner size="sm" />}
              Delete
            </button>
          </div>
        }
      >
        <p className="text-sm text-slate-600">
          Are you sure you want to delete <strong>{student.full_name}</strong>? This action cannot be undone.
        </p>
      </Modal>

      {/* Restore Student Modal */}
      <Modal
        isOpen={isRestoreModalOpen}
        onClose={() => setIsRestoreModalOpen(false)}
        title="Restore Student"
        size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsRestoreModalOpen(false)}
              disabled={isProcessing}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleRestore}
              disabled={isProcessing}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {isProcessing && <LoadingSpinner size="sm" />}
              Restore
            </button>
          </div>
        }
      >
        <p className="text-sm text-slate-600">
          Are you sure you want to restore <strong>{student.full_name}</strong>? The student will become active again.
        </p>
      </Modal>

      {/* Hard Delete Student Modal */}
      <Modal
        isOpen={isHardDeleteModalOpen}
        onClose={() => setIsHardDeleteModalOpen(false)}
        title="Permanently Delete Student"
        size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsHardDeleteModalOpen(false)}
              disabled={isProcessing}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleHardDelete}
              disabled={isProcessing}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-700 rounded-lg hover:bg-red-800 transition-colors disabled:opacity-50"
            >
              {isProcessing && <LoadingSpinner size="sm" />}
              Delete Permanently
            </button>
          </div>
        }
      >
        <div className="text-sm text-slate-600 space-y-2">
          <p className="font-medium text-red-600">WARNING: This action cannot be undone!</p>
          <p>Are you sure you want to permanently delete <strong>{student.full_name}</strong>? All data associated with this student will be permanently removed from the system.</p>
        </div>
      </Modal>

      {/* Link Parent Modal */}
      <LinkParentModal
        studentId={studentId}
        isOpen={isLinkParentModalOpen}
        onClose={() => setIsLinkParentModalOpen(false)}
        onLinked={handleParentLinked}
      />

      {/* Enroll Student Dialog */}
      <EnrollDialog
        isOpen={isEnrollDialogOpen}
        onClose={() => setIsEnrollDialogOpen(false)}
        onEnroll={handleEnroll}
        availableGroups={availableGroups}
        isLoading={isLoadingGroups}
        recentGroupIds={recentGroupIds}
      />

      {ToastComponent}
    </div>
  )
}
