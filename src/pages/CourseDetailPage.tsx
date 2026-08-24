import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { TopNavbar } from '../components/dashboard/TopNavbar'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { Modal } from '../components/common/Modal'
import { CourseInfoCard } from '../components/courses/CourseInfoCard'
import { CourseForm } from '../components/courses/CourseForm'
import { DataTable, type DataTableColumn } from '../components/common/datatable'
import { useToast } from '../components/common/Toast'
import { ErrorBoundary } from '../components/common/ErrorBoundary'
import { 
  getCourseById, 
  getCourseStats, 
  updateCourse,
  deleteCourse,
  type Course,
  type CourseStats,
  type EnrichedGroupPublic,
  type UpdateCourseDTO
} from '../api/academics'
import { useGroupsByCourse } from '../hooks/useGroupQueries'

type TabId = 'info' | 'groups'

export function CourseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation('courses')
  const courseId = Number(id) || 0
  const { showToast, ToastComponent } = useToast()

  const groupColumns: DataTableColumn<EnrichedGroupPublic>[] = [
    {
      key: 'name',
      header: t('courseDetail.group_name'),
      cell: (group) => <span className="font-semibold text-slate-900">{group.name}</span>
    },
    {
      key: 'instructor_name',
      header: t('courseDetail.instructor'),
      cell: (group) => (
        <span className="text-sm text-slate-600">
          {group.instructor_name || <span className="text-slate-400 italic">{t('courseDetail.unassigned')}</span>}
        </span>
      )
    },
    {
      key: 'current_level',
      header: t('courseDetail.level'),
      align: 'center',
      cell: (group) => (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-700">
          {t('courseDetail.level')} {group.current_level}
        </span>
      )
    },
    {
      key: 'capacity',
      header: t('courseDetail.capacity'),
      align: 'center',
      cell: (group) => (
        <span className="text-sm text-slate-600">{group.capacity} {t('courseDetail.students')}</span>
      )
    },
    {
      key: 'status',
      header: t('common:labels.status'),
      cell: (group) => (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
          group.status === 'active'
            ? 'bg-green-100 text-green-700'
            : group.status === 'completed'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-slate-100 text-slate-600'
        }`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
          {group.status === 'active' ? t('courseDetail.active') : group.status === 'completed' ? 'Completed' : 'Archived'}
        </span>
      )
    }
  ]

  const [course, setCourse] = useState<Course | null>(null)
  const [stats, setStats] = useState<CourseStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabId>('info')
  
  // Use the new hook for groups by course
  const { data: groups = [] } = useGroupsByCourse(courseId)
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [mutationError, setMutationError] = useState<string | null>(null)

  const loadCourseData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [courseData, statsData] = await Promise.all([
        getCourseById(courseId),
        getCourseStats(courseId).catch(() => null),
      ])
      setCourse(courseData)
      setStats(statsData)
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
      showToast(t('courseDetail.toast.update_success'), 'success')
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
      showToast(t('courseDetail.toast.delete_success'), 'success')
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
            <h2 className="text-xl font-bold text-red-800 mb-2">{t('courseDetail.error')}</h2>
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
            <p>{t('courseDetail.not_found')}</p>
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
            <span className="material-symbols-outlined text-sm icon-flip-rtl">arrow_back</span>
            {t('courseDetail.back_to_courses')}
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
                {t('courseDetail.tab_details')}
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
                {t('courseDetail.tab_groups', { count: groups.length })}
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
                        {t('courseDetail.course_information')}
                      </h3>
                      <dl className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <dt className="text-slate-500">{t('courseDetail.course_id')}</dt>
                          <dd className="font-medium text-slate-900">#{course.id}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-slate-500">{t('courseDetail.category')}</dt>
                          <dd className="font-medium text-slate-900">{course.category || t('courses.uncategorized')}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-slate-500">{t('courseDetail.status')}</dt>
                          <dd className="font-medium">
                            <span className={`px-2 py-0.5 rounded-full text-xs ${
                              course.is_active 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-slate-100 text-slate-600'
                            }`}>
                              {course.is_active ? t('courseDetail.active') : t('courseDetail.inactive')}
                            </span>
                          </dd>
                        </div>
                      </dl>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-lg">
                      <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-slate-400">payments</span>
                        {t('courseDetail.pricing_structure')}
                      </h3>
                      <dl className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <dt className="text-slate-500">{t('courseDetail.price_per_level')}</dt>
                          <dd className="font-medium text-slate-900">{course.price_per_level?.toLocaleString() ?? '0'} EGP</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-slate-500">{t('courseDetail.sessions_per_level')}</dt>
                          <dd className="font-medium text-slate-900">{course.sessions_per_level} {t('courseDetail.sessions')}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-slate-500">{t('courseDetail.estimated_duration')}</dt>
                          <dd className="font-medium text-slate-900">
                            ~{Math.ceil((course.sessions_per_level || 0))} 
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </div>

                  {course.description && (
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <h3 className="text-sm font-semibold text-slate-900 mb-2">{t('courseDetail.description')}</h3>
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
                  emptyMessage={t('courseDetail.no_groups')}
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
        title={t('courseDetail.edit_title')}
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
        title={t('courseDetail.delete_title')}
        message={t('courseDetail.delete_confirm', { name: course.name })}
        confirmText={t('common:buttons.delete')}
        cancelText={t('common:buttons.cancel')}
        onConfirm={handleDeleteCourse}
        onCancel={() => setIsDeleteDialogOpen(false)}
        variant="danger"
      />

      {/* Toast Notifications */}
      {ToastComponent}
    </div>
  )
}
