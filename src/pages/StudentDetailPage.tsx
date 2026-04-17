import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit2, Trash2 } from 'lucide-react'
import { TopNavbar } from '../components/dashboard/TopNavbar'
import { PageSection, Modal, LoadingSpinner } from '../components/common'
import { StudentForm } from '../components/crm/StudentForm'
import { LinkParentModal } from '../components/crm/LinkParentModal'
import { StudentTabs, type TabId } from '../components/student/StudentTabs'
import { OverviewTab } from '../components/student/OverviewTab'
import { EnrollmentsTab, EnrollDialog } from '../components/student/EnrollmentsTab'
import { CoursesTab } from '../components/student/CoursesTab'
import { CompetitionsTab } from '../components/student/CompetitionsTab'
import { TeamsTab } from '../components/student/TeamsTab'
import { PaymentsTab } from '../components/student/PaymentsTab'
import { ActivityHistoryTab } from '../components/student/ActivityHistoryTab'
import { 
  updateStudent,
  deleteStudent,
  type Student,
  type Parent,
  type UpdateStudentDTO,
  getStatusColorClass,
  getStatusLabel
} from '../api/crm/students/'
import { useStudentCore, useStudentBalance, useStudentSiblings } from '../hooks/students'
import { enrollStudent } from '../api/academics'
import { useGroupsFlat } from '../hooks/useGroupQueries'


export function StudentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const studentId = Number(id) || 1
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
  
  // LAZY: Siblings load when needed (could expand Overview to lazy-load these)
  const {
    siblings,
    refresh: refreshSiblings
  } = useStudentSiblings(studentId, activeTab === 'overview')
  
  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isLinkParentModalOpen, setIsLinkParentModalOpen] = useState(false)
  const [isEnrollDialogOpen, setIsEnrollDialogOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  
  // Available groups for enrollment
  const { data: groups, isLoading: isLoadingGroups } = useGroupsFlat()

  // Filter out groups the student is already enrolled in
  const enrolledGroupIds = student?.enrollments
    ?.filter(e => e.status === 'active')
    .map(e => e.group_id) || []
    
  const availableGroups = (groups || [])
    .filter(g => !enrolledGroupIds.includes(g.id))
    .map(g => ({
      id: g.id,
      group_name: g.group_name || 'Unknown Group',
      course_name: g.course_name || 'Unknown Course',
      level: g.level || 1,
    }))

  // Refresh data after successful operations
  const handleRefresh = async () => {
    await refreshCore()
    // Also refresh lazy-loaded data if already loaded
    if (activeTab === 'payments') {
      await refreshBalance()
    }
    if (activeTab === 'overview') {
      await refreshSiblings()
    }
  }

  const handleUpdateStudent = async (data: UpdateStudentDTO, _selectedParent?: Parent | null) => {
    setIsProcessing(true)
    try {
      await updateStudent(studentId, data)
      await handleRefresh()
      setIsEditModalOpen(false)
    } catch (err) {
      console.error('Failed to update student:', err)
      // TODO: Show error toast to user
      alert('Failed to update student. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDeleteStudent = async () => {
    setIsProcessing(true)
    try {
      await deleteStudent(studentId)
      navigate('/directory')
    } catch (err: any) {
      console.error('Failed to delete student:', err)
      alert('Failed to delete student: ' + (err.message || 'Unknown error'))
      setIsDeleteModalOpen(false)
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
            balance={balance}
            siblings={siblings}
            parents={details?.parents || []}
            onLinkParent={() => setIsLinkParentModalOpen(true)}
          />
        )
      case 'enrollments':
        return (
          <EnrollmentsTab 
            enrollments={details?.enrollments || []}
            currentGroupName={details?.enrollments?.find((e: { status: string; group_name?: string }) => e.status === 'active')?.group_name}
            onEnroll={() => setIsEnrollDialogOpen(true)}
          />
        )
      case 'courses':
        return <CoursesTab courses={details?.courses || []} />
      case 'competitions':
        return <CompetitionsTab competitions={details?.competitions || []} />
      case 'teams':
        return <TeamsTab teams={details?.teams || []} />
      case 'payments':
        return (
          <PaymentsTab 
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

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-8 py-6">
        <div className="max-w-[1400px] mx-auto">
          <button
            onClick={() => navigate('/directory')}
            className="flex items-center gap-1 text-sm text-slate-500 hover:text-on-surface mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Directory
          </button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="font-headline text-3xl font-bold text-on-surface tracking-tight">
                {student.full_name}
              </h1>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColorClass(student.status)}`}>
                {getStatusLabel(student.status)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-secondary border border-secondary rounded-lg hover:bg-secondary-container transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
          <p className="text-sm text-on-surface-variant mt-1">
            {student.gender && `${student.gender.charAt(0).toUpperCase() + student.gender.slice(1)} • `}
            {student.date_of_birth && `Born ${student.date_of_birth} • `}
            {student.phone}
          </p>
        </div>
      </header>

      {/* Tabs Navigation */}
      <StudentTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Content */}
      <PageSection>
        {/* Core data errors */}
        {errorCore && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-100 rounded-lg text-yellow-700 text-sm">
            {errorCore}
          </div>
        )}
        {renderTabContent()}
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
              onClick={handleDeleteStudent}
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
      />
    </div>
  )
}
