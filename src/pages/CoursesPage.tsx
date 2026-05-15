import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TopNavbar } from '../components/dashboard/TopNavbar'
import { PageSection, Modal, LoadingSpinner, Pagination, ConfirmDialog } from '../components/common'
import { useToast } from '../components/common/Toast'
import { CourseForm } from '../components/courses/CourseForm'
import { CoursesHeader } from '../components/courses/CoursesHeader'
import { CoursesTable, CourseCard } from '../components/courses'
import { CardGrid } from '../components/directory/CardGrid'
import { CardSkeleton } from '../components/directory/shared/CardSkeleton'
import { ViewToggle } from '../components/groups/ViewToggle'
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
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')
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
          <div className="flex items-center gap-3">
            <ViewToggle value={viewMode} onChange={setViewMode} />
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
        </div>

        <ErrorBoundary>
          {isLoading ? (
            viewMode === 'cards' ? (
              <CardGrid>
                {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
              </CardGrid>
            ) : (
              <div className="flex items-center justify-center py-20"><LoadingSpinner /></div>
            )
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

              {viewMode === 'cards' ? (
                <CardGrid>
                  {paginatedCourses.map((course) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      actions={{
                        onView: () => handleView(course.id),
                        onEdit: () => handleEdit(course),
                        onDelete: () => handleDeleteClick(course.id),
                      }}
                    />
                  ))}
                </CardGrid>
              ) : (
                <CoursesTable
                  data={paginatedCourses}
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                  onRowClick={(c) => handleView(c.id)}
                  onView={(c) => handleView(c.id)}
                  onEdit={handleEdit}
                  onDelete={(c) => handleDeleteClick(c.id)}
                />
              )}

              {viewMode === 'table' && totalPages > 1 && (
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
