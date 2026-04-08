import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TopNavbar } from '../components/dashboard/TopNavbar'
import { DataTable, type DataTableColumn, PageSection, Modal, LoadingSpinner, Pagination, ConfirmDialog } from '../components/common'
import { useToast } from '../components/common/Toast'
import { CourseForm } from '../components/courses/CourseForm'
import { CoursesHeader } from '../components/courses/CoursesHeader'
import { 
  createCourse, 
  updateCourse,
  deleteCourse,
  type Course, 
  type AddNewCourseInput,
  type UpdateCourseDTO
} from '../api/academics'
import { ErrorBoundary } from '../components/common/ErrorBoundary'
import { useCourses } from '../hooks/useCourses'

// Column configuration for Courses DataTable
const courseColumns: DataTableColumn<Course>[] = [
  {
    key: 'name',
    header: 'Course Name',
    sortable: true,
    cell: (course) => <span className="font-semibold text-slate-900">{course.name}</span>
  },
  {
    key: 'category',
    header: 'Category',
    sortable: true,
    cell: (course) => (
      <span className="text-sm text-slate-600 bg-slate-100/50 px-2.5 py-1 rounded-md border border-slate-200">
        {course.category || 'Uncategorized'}
      </span>
    )
  },
  {
    key: 'price_per_level',
    header: 'Price/Level',
    sortable: true,
    align: 'center',
    cell: (course) => (
      <span className="text-sm font-medium text-slate-700">
        {course.price_per_level?.toLocaleString() ?? '0'} EGP
      </span>
    )
  },
  {
    key: 'sessions_per_level',
    header: 'Sessions/Level',
    sortable: true,
    align: 'center',
    cell: (course) => (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-700">
        <span className="material-symbols-outlined text-xs">schedule</span>
        {course.sessions_per_level}
      </span>
    )
  },
  {
    key: 'is_active',
    header: 'Status',
    cell: (course) => (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
        course.is_active 
          ? 'bg-green-100 text-green-700' 
          : 'bg-slate-100 text-slate-600'
      }`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
        {course.is_active ? 'Active' : 'Inactive'}
      </span>
    )
  }
]

export function CoursesPage() {
  const navigate = useNavigate()
  const {
    totalCourses,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    sortField,
    sortDirection,
    handleSort,
    paginatedCourses,
    totalPages,
    refresh
  } = useCourses()

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deletingCourseId, setDeletingCourseId] = useState<number | null>(null)
  const { showToast, ToastComponent } = useToast()
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [mutationError, setMutationError] = useState<string | null>(null)

  const handleView = (id: number) => {
    navigate(`/courses/${id}`)
  }

  const handleEdit = (course: Course) => {
    setSelectedCourse(course)
    setIsEditModalOpen(true)
  }

  const handleDeleteClick = (id: number) => {
    setDeletingCourseId(id)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deletingCourseId) return
    
    setMutationError(null)
    try {
      await deleteCourse(deletingCourseId)
      await refresh()
      showToast('Course deleted successfully', 'success')
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete course'
      setMutationError(errorMessage)
      showToast(errorMessage, 'error')
    } finally {
      setIsDeleteDialogOpen(false)
      setDeletingCourseId(null)
    }
  }

  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false)
    setDeletingCourseId(null)
  }

  const handleCreateCourse = async (data: AddNewCourseInput | UpdateCourseDTO) => {
    setMutationError(null)
    try {
      await createCourse(data as AddNewCourseInput)
      setIsCreateModalOpen(false)
      await refresh()
      showToast('Course created successfully', 'success')
    } catch (err: unknown) {
      console.error('[CoursesPage] createCourse failed:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to create course'
      setMutationError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const handleUpdateCourse = async (data: UpdateCourseDTO) => {
    if (!selectedCourse) return
    setMutationError(null)
    try {
      await updateCourse(selectedCourse.id, data)
      setIsEditModalOpen(false)
      setSelectedCourse(null)
      await refresh()
      showToast('Course updated successfully', 'success')
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update course'
      setMutationError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  return (
    <div className="min-h-screen bg-surface">
      <TopNavbar activePage="Courses" />
      
      <CoursesHeader 
        totalCourses={totalCourses}
        searchTerm={searchTerm}
        onSearchChange={(val) => { setSearchTerm(val); setCurrentPage(1) }}
        onCreateClick={() => setIsCreateModalOpen(true)}
      />

      <PageSection>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-slate-500">
            Showing {paginatedCourses.length} of {totalCourses} courses
          </p>
          <select
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1) }}
            className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white"
          >
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div>

        <ErrorBoundary>
          {isLoading ? (
            <div className="flex items-center justify-center py-20"><LoadingSpinner /></div>
          ) : error ? (
            <div className="p-4 bg-red-50 border border-red-100 rounded-lg text-red-700 text-center">{error}</div>
          ) : (
            <>
              {mutationError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700 flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">error</span>
                  {mutationError}
                </div>
              )}
              <DataTable
                data={paginatedCourses}
                columns={courseColumns}
                keyExtractor={(c) => c.id.toString()}
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
                onRowClick={(c) => handleView(c.id)}
                actions={{
                  view: (c) => handleView(c.id),
                  edit: handleEdit,
                  delete: (c) => handleDeleteClick(c.id)
                }}
                emptyMessage="No courses found"
                emptyIcon="inbox"
              />

              {totalPages > 1 && (
                <div className="mt-6 flex justify-center">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </>
          )}
        </ErrorBoundary>
      </PageSection>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Course"
      >
        <CourseForm
          mode="create"
          onSubmit={handleCreateCourse}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => { setIsEditModalOpen(false); setSelectedCourse(null) }}
        title="Edit Course"
      >
        {selectedCourse && (
          <CourseForm
            mode="edit"
            initialData={selectedCourse}
            onSubmit={handleUpdateCourse}
            onCancel={() => { setIsEditModalOpen(false); setSelectedCourse(null) }}
          />
        )}
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="Delete Course"
        message="Are you sure you want to delete this course? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        variant="danger"
      />

      {/* Toast Notifications */}
      {ToastComponent}
    </div>
  )
}
