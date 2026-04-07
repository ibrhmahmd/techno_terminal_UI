import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { TopNavbar } from '../components/dashboard/TopNavbar'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { Modal } from '../components/common/Modal'
import { CourseInfoCard } from '../components/courses/CourseInfoCard'
import { CourseForm } from '../components/courses/CourseForm'
import { DataTable, type DataTableColumn } from '../components/common/DataTable'
import { useToast } from '../components/common/Toast'
import { ErrorBoundary } from '../components/common/ErrorBoundary'
import { 
  getCourseById, 
  getCourseStats, 
  getCourseGroups,
  updateCourse,
  deleteCourse,
  type Course,
  type CourseStats,
  type EnrichedGroupPublic,
  type UpdateCourseDTO
} from '../api/academics'

type TabId = 'info' | 'groups'

const groupColumns: DataTableColumn<EnrichedGroupPublic>[] = [
  {
    key: 'group_name',
    header: 'Group Name',
    cell: (group) => <span className="font-semibold text-slate-900">{group.group_name}</span>
  },
  {
    key: 'instructor_name',
    header: 'Instructor',
    cell: (group) => (
      <span className="text-sm text-slate-600">
        {group.instructor_name || <span className="text-slate-400 italic">Unassigned</span>}
      </span>
    )
  },
  {
    key: 'level_number',
    header: 'Level',
    align: 'center',
    cell: (group) => (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-700">
        Level {group.level_number}
      </span>
    )
  },
  {
    key: 'max_capacity',
    header: 'Capacity',
    align: 'center',
    cell: (group) => (
      <span className="text-sm text-slate-600">{group.max_capacity} students</span>
    )
  },
  {
    key: 'is_active',
    header: 'Status',
    cell: (group) => (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
        group.is_active 
          ? 'bg-green-100 text-green-700' 
          : 'bg-slate-100 text-slate-600'
      }`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
        {group.is_active ? 'Active' : 'Archived'}
      </span>
    )
  }
]

export function CourseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const courseId = Number(id) || 0
  const { showToast, ToastComponent } = useToast()

  const [course, setCourse] = useState<Course | null>(null)
  const [stats, setStats] = useState<CourseStats | null>(null)
  const [groups, setGroups] = useState<EnrichedGroupPublic[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabId>('info')
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [mutationError, setMutationError] = useState<string | null>(null)

  const loadCourseData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [courseData, statsData, groupsData] = await Promise.all([
        getCourseById(courseId),
        getCourseStats(courseId).catch(() => null),
        getCourseGroups(courseId).catch(() => [])
      ])
      setCourse(courseData)
      setStats(statsData)
      setGroups(groupsData)
    } catch (err: unknown) {
      console.error('[CourseDetailPage] Failed to load course data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load course data')
    } finally {
      setIsLoading(false)
    }
  }, [courseId])

  useEffect(() => {
    loadCourseData()
  }, [loadCourseData])

  const handleUpdateCourse = async (data: UpdateCourseDTO) => {
    if (!course) return
    setMutationError(null)
    try {
      await updateCourse(course.id, data)
      setIsEditModalOpen(false)
      await loadCourseData()
      showToast('Course updated successfully', 'success')
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update course'
      setMutationError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const handleDeleteCourse = async () => {
    if (!course) return
    try {
      await deleteCourse(course.id)
      showToast('Course deleted successfully', 'success')
      navigate('/courses')
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete course'
      setMutationError(errorMessage)
      showToast(errorMessage, 'error')
      setIsDeleteDialogOpen(false)
    }
  }

  const handleViewGroup = (groupId: number) => {
    navigate(`/groups/${groupId}`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface">
        <TopNavbar activePage="Courses" />
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-surface">
        <TopNavbar activePage="Courses" />
        <div className="p-8 max-w-[1400px] mx-auto">
          <div className="p-8 bg-red-50 border border-red-100 rounded-xl text-center">
            <span className="material-symbols-outlined text-4xl text-red-500 mb-2">error</span>
            <h2 className="text-xl font-bold text-red-800 mb-2">Error</h2>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-surface">
        <TopNavbar activePage="Courses" />
        <div className="p-8 max-w-[1400px] mx-auto">
          <div className="p-12 text-center text-on-surface-variant">
            <p>Course not found</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface">
      <TopNavbar activePage="Courses" />

      <div className="p-4 md:p-8 max-w-[1400px] mx-auto space-y-6">
        <ErrorBoundary>
          {/* Back Link */}
          <button
            onClick={() => navigate('/courses')}
            className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to Courses
          </button>

          {/* Course Info Card */}
          <CourseInfoCard
            course={course}
            stats={stats}
            onEdit={() => setIsEditModalOpen(true)}
            onDelete={() => setIsDeleteDialogOpen(true)}
          />

          {/* Tabs */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center gap-1 p-2 border-b border-slate-200">
              <button
                onClick={() => setActiveTab('info')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'info'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="material-symbols-outlined text-sm">info</span>
                Details
              </button>
              <button
                onClick={() => setActiveTab('groups')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'groups'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="material-symbols-outlined text-sm">group</span>
                Groups ({groups.length})
              </button>
            </div>

            <div className="p-4">
              {mutationError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700 flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">error</span>
                  {mutationError}
                </div>
              )}

              {activeTab === 'info' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-slate-400">school</span>
                        Course Information
                      </h3>
                      <dl className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <dt className="text-slate-500">Course ID</dt>
                          <dd className="font-medium text-slate-900">#{course.id}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-slate-500">Category</dt>
                          <dd className="font-medium text-slate-900">{course.category || 'Uncategorized'}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-slate-500">Status</dt>
                          <dd className="font-medium">
                            <span className={`px-2 py-0.5 rounded-full text-xs ${
                              course.is_active 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-slate-100 text-slate-600'
                            }`}>
                              {course.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </dd>
                        </div>
                      </dl>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-lg">
                      <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-slate-400">payments</span>
                        Pricing & Structure
                      </h3>
                      <dl className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <dt className="text-slate-500">Price Per Level</dt>
                          <dd className="font-medium text-slate-900">{course.price_per_level?.toLocaleString() ?? '0'} EGP</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-slate-500">Sessions Per Level</dt>
                          <dd className="font-medium text-slate-900">{course.sessions_per_level} sessions</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-slate-500">Estimated Duration</dt>
                          <dd className="font-medium text-slate-900">
                            ~{Math.ceil((course.sessions_per_level || 0) / 4)} months
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </div>

                  {course.description && (
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <h3 className="text-sm font-semibold text-slate-900 mb-2">Description</h3>
                      <p className="text-sm text-slate-600 leading-relaxed">{course.description}</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'groups' && (
                <DataTable
                  data={groups}
                  columns={groupColumns}
                  keyExtractor={(g) => g.id.toString()}
                  onRowClick={(g) => handleViewGroup(g.id)}
                  actions={{
                    view: (g) => handleViewGroup(g.id)
                  }}
                  emptyMessage="No groups are assigned to this course"
                  emptyIcon="inbox"
                />
              )}
            </div>
          </div>
        </ErrorBoundary>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Course"
      >
        <CourseForm
          mode="edit"
          initialData={course}
          onSubmit={handleUpdateCourse}
          onCancel={() => setIsEditModalOpen(false)}
        />
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="Delete Course"
        message={`Are you sure you want to delete "${course.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteCourse}
        onCancel={() => setIsDeleteDialogOpen(false)}
        variant="danger"
      />

      {/* Toast Notifications */}
      {ToastComponent}
    </div>
  )
}
