import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { TopNavbar } from '../components/dashboard/TopNavbar'
import { DataTable, PageSection, Modal, LoadingSpinner, Pagination, ConfirmDialog } from '../components/common'

import { useToast } from '../components/common/Toast'
import { GroupForm } from '../components/groups/GroupForm'
import { type EnrichedGroupPublic, type ScheduleGroupInput } from '../api/academics'
import { ErrorBoundary } from '../components/common/ErrorBoundary'
import { GroupsHeader } from '../components/groups/GroupsHeader'
import { GroupBySelector } from '../components/groups/GroupBySelector'
import { GroupCard } from '../components/groups/GroupCard'
import { ViewToggle } from '../components/groups/ViewToggle'
import { GroupCardGrid } from '../components/groups/GroupCardGrid'
import { GroupCategoryTabs } from '../components/groups/GroupCategoryTabs'
import { useGroups } from '../hooks/useGroups'
import { useCreateGroup, useUpdateGroup, useDeleteGroup } from '../hooks/useGroupQueries'
import { groupColumns } from '../components/groups/GroupColumns'
import { GroupFilters } from '../components/groups/GroupFilters'
import { useCourses } from '../hooks/useCourses'
import { useEmployees } from '../hooks/useStaff'

export function GroupsPage() {
  const navigate = useNavigate()
  
  const {
    totalGroups,
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
    paginatedGroups,
    totalPages,
    groupBy,
    setGroupBy,
    groupedData,
    isGroupedView,
    filters,
  } = useGroups()

  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deletingGroupId, setDeletingGroupId] = useState<number | null>(null)
  const { showToast, ToastComponent } = useToast()
  const [selectedGroup, setSelectedGroup] = useState<EnrichedGroupPublic | null>(null)
  const [mutationError, setMutationError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')
  const [activeCategoryKey, setActiveCategoryKey] = useState<string | null>(null)

  const { courses } = useCourses()
  const { data: staffData } = useEmployees('', 1, 100)
  const staff = staffData?.items || []

  const activeFilterTags = useMemo(() => {
    const tags: { id: string; label: string; value: string }[] = []
    
    filters.selectedCourses.forEach(id => {
      const course = courses.find(c => c.id === id)
      if (course) tags.push({ id: `course-${id}`, label: 'Course', value: course.name })
    })
    
    filters.selectedInstructors.forEach(id => {
      const instructor = staff.find(s => s.id === id)
      if (instructor) tags.push({ id: `instructor-${id}`, label: 'Instructor', value: instructor.full_name })
    })

    filters.selectedDays.forEach(day => {
      tags.push({ id: `day-${day}`, label: 'Day', value: day })
    })
    
    filters.selectedLevels.forEach(level => {
      tags.push({ id: `level-${level}`, label: 'Level', value: `Level ${level}` })
    })

    filters.selectedStatuses.forEach(status => {
      // Don't show tag for default active if it's the only one
      if (filters.selectedStatuses.length === 1 && status === 'active') return;
      tags.push({ id: `status-${status}`, label: 'Status', value: status.charAt(0).toUpperCase() + status.slice(1) })
    })

    return tags
  }, [filters, courses, staff])

  const hasActiveFilters = 
    filters.selectedCourses.length > 0 || 
    filters.selectedInstructors.length > 0 || 
    filters.selectedDays.length > 0 || 
    filters.selectedLevels.length > 0 || 
    (filters.selectedStatuses.length > 0 && !(filters.selectedStatuses.length === 1 && filters.selectedStatuses[0] === 'active'));

  const handleRemoveFilter = (id: string) => {
    const [type, valStr] = id.split('-')
    if (type === 'course') filters.setSelectedCourses(filters.selectedCourses.filter(v => v !== Number(valStr)))
    if (type === 'instructor') filters.setSelectedInstructors(filters.selectedInstructors.filter(v => v !== Number(valStr)))
    if (type === 'day') filters.setSelectedDays(filters.selectedDays.filter(v => v !== valStr))
    if (type === 'level') filters.setSelectedLevels(filters.selectedLevels.filter(v => v !== Number(valStr)))
    if (type === 'status') filters.setSelectedStatuses(filters.selectedStatuses.filter(v => v !== valStr))
    setCurrentPage(1)
  }

  const handleClearAllFilters = () => {
    filters.setSelectedCourses([])
    filters.setSelectedInstructors([])
    filters.setSelectedDays([])
    filters.setSelectedLevels([])
    filters.setSelectedStatuses(['active'])
    setCurrentPage(1)
  }

  const handleView = (id: number) => {
    navigate(`/groups/${id}`)
  }

  const createGroupMutation = useCreateGroup()
  const updateGroupMutation = useUpdateGroup()
  const deleteGroupMutation = useDeleteGroup()

  const handleEdit = (group: EnrichedGroupPublic) => {
    setSelectedGroup(group)
    setIsEditModalOpen(true)
  }

  const handleDeleteClick = (id: number) => {
    setDeletingGroupId(id)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deletingGroupId) return
    
    setMutationError(null)
    try {
      await deleteGroupMutation.mutateAsync(deletingGroupId)
      showToast('Group deleted successfully', 'success')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete group'
      setMutationError(msg)
      showToast(msg, 'error')
    } finally {
      setIsDeleteDialogOpen(false)
      setDeletingGroupId(null)
    }
  }

  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false)
    setDeletingGroupId(null)
  }

  const handleCreateGroup = async (data: ScheduleGroupInput) => {
    setMutationError(null)
    try {
      await createGroupMutation.mutateAsync(data)
      setIsCreateModalOpen(false)
    } catch (err: unknown) {
      const detail = err instanceof Error && 'response' in err
        ? (err as { response?: { data?: { detail?: unknown } } }).response?.data?.detail
        : undefined
      let errorMsg = 'Failed to create group.'
      
      if (Array.isArray(detail)) {
        errorMsg = detail.map((d: { loc?: string[]; msg?: string }) => `${d.loc?.[d.loc.length - 1] || 'Field'}: ${d.msg}`).join(', ')
      } else if (typeof detail === 'string') {
        errorMsg = detail
      } else if (err instanceof Error) {
        errorMsg = err.message
      }
      
      setMutationError(errorMsg)
      throw new Error(errorMsg)
    }
  }

  const handleUpdateGroup = async (data: ScheduleGroupInput) => {
    if (!selectedGroup) return
    setMutationError(null)
    try {
      await updateGroupMutation.mutateAsync({ id: selectedGroup.id, data })
      setIsEditModalOpen(false)
      setSelectedGroup(null)
    } catch (err: unknown) {
      setMutationError(err instanceof Error ? err.message : 'Failed to update group')
      throw err
    }
  }

  return (
    <div className="min-h-screen bg-surface">
      <TopNavbar activePage="Groups" />
      
      <GroupsHeader 
        totalGroups={totalGroups}
        searchTerm={searchTerm}
        onSearchChange={(val) => { setSearchTerm(val); setCurrentPage(1) }}
        onCreateClick={() => setIsCreateModalOpen(true)}
      />

      <PageSection>
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <GroupBySelector
              value={((isFiltersOpen || hasActiveFilters) && !isGroupedView ? 'search' : (groupBy ?? null)) as any}
              onChange={(field) => {
                if (field === 'search') {
                  // Toggle filter panel, switch to flat view
                  setIsFiltersOpen(prev => !prev)
                  if (groupBy !== null) {
                    setGroupBy(null)
                  }
                } else if (field === null) {
                  // "All" view: switch to flat view, close filters, clear filters
                  setGroupBy(null)
                  setIsFiltersOpen(false)
                  handleClearAllFilters()
                } else {
                  // Grouped view: switch to grouped view, close filters
                  setGroupBy(field)
                  setIsFiltersOpen(false)
                  // Optional: handleClearAllFilters() here if we want to reset filters 
                  // when leaving search view, but preserving them is often better UX 
                  // so they can return to "Filter Groups" and see their filters.
                }
                setCurrentPage(1)
              }}
            />
          </div>
          <div className="shrink-0">
            <ViewToggle value={viewMode} onChange={setViewMode} />
          </div>
        </div>

        <GroupFilters 
          isOpen={isFiltersOpen && !isGroupedView} 
          onClose={() => setIsFiltersOpen(false)}
          onApply={() => setCurrentPage(1)}
          filters={filters}
          activeFilterTags={activeFilterTags}
          onRemoveFilter={handleRemoveFilter}
          onClearAllFilters={handleClearAllFilters}
        />

        <ErrorBoundary>
          {error && !isLoading && (
            <div role="alert" className="p-4 bg-red-50 border border-red-100 rounded-lg text-red-700 text-center">{error}</div>
          )}

          {groupBy === undefined && (
            <div className="flex flex-col items-center justify-center py-28 gap-3 text-center">
              <span className="material-symbols-outlined text-6xl text-slate-200" aria-hidden="true">grid_view</span>
              <p className="text-slate-400 text-sm font-medium">
                Select a view above to load groups
              </p>
            </div>
          )}

          {groupBy !== undefined && !error && (
            <>
              {mutationError && (
                <div role="alert" className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700 flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg" aria-hidden="true">error</span>
                  {mutationError}
                </div>
              )}
              {viewMode === 'cards' ? (
                isGroupedView ? (
                  <>
                    <GroupCategoryTabs
                      categories={groupedData.map(g => ({ key: g.key, label: g.label, count: g.count }))}
                      activeKey={activeCategoryKey ?? groupedData[0]?.key ?? ''}
                      onChange={setActiveCategoryKey}
                    />
                    <div role="tabpanel" id={`panel-${activeCategoryKey ?? groupedData[0]?.key ?? ''}`} aria-labelledby={`tab-${activeCategoryKey ?? groupedData[0]?.key ?? ''}`}>
                      <GroupCardGrid
                        isLoading={isLoading}
                        emptyMessage="No groups matched your selection"
                        emptyIcon="grid_view"
                      >
                        {(groupedData.find(g => g.key === (activeCategoryKey ?? groupedData[0]?.key))?.groups ?? []).map((g) => (
                          <GroupCard
                            key={g.id}
                            group={g}
                            actions={{
                              onView: () => handleView(g.id),
                              onEdit: () => handleEdit(g),
                              onDelete: () => handleDeleteClick(g.id),
                            }}
                          />
                        ))}
                      </GroupCardGrid>
                    </div>
                  </>
                ) : (
                  <GroupCardGrid
                    isLoading={isLoading}
                    emptyMessage="No groups matched your selection"
                    emptyIcon="grid_view"
                  >
                    {isLoading ? null : paginatedGroups.map((g) => (
                      <GroupCard
                        key={g.id}
                        group={g}
                        actions={{
                          onView: () => handleView(g.id),
                          onEdit: () => handleEdit(g),
                          onDelete: () => handleDeleteClick(g.id),
                        }}
                      />
                    ))}
                  </GroupCardGrid>
                )
              ) : (
                <>
                  {isLoading && (
                    <div className="flex items-center justify-center py-20"><LoadingSpinner /></div>
                  )}
                  {!isLoading && isGroupedView && (
                    <DataTable
                      groupedData={groupedData.map(g => ({ ...g, items: g.groups }))}
                      columns={groupColumns}
                      keyExtractor={(g) => g.id.toString()}
                      sortField={sortField}
                      sortDirection={sortDirection}
                      onSort={handleSort}
                      onRowClick={(g) => handleView(g.id)}
                      actions={{
                        view: (g) => handleView(g.id),
                        edit: handleEdit,
                        delete: (g) => handleDeleteClick(g.id)
                      }}
                      emptyMessage="No groups matched your selection"
                      emptyIcon="none"
                      defaultActiveGroup={groupedData[0]?.key}
                    />
                  )}
                  {!isLoading && !isGroupedView && (
                    <>
                      {paginatedGroups.length === 0 && !isLoading ? (
                        <div className="flex flex-col items-center justify-center py-28 gap-4 text-center">
                          <span className="material-symbols-outlined text-6xl text-slate-200" aria-hidden="true">search_off</span>
                          <div>
                            <p className="text-slate-500 font-medium">No groups found</p>
                            {hasActiveFilters && (
                              <p className="text-slate-400 text-sm mt-1">
                                Your filters returned no results.{' '}
                                <button
                                  onClick={handleClearAllFilters}
                                  className="text-secondary underline hover:text-secondary/80 font-medium"
                                >
                                  Clear all filters
                                </button>
                              </p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <DataTable
                          data={paginatedGroups}
                          columns={groupColumns}
                          keyExtractor={(g) => g.id.toString()}
                          sortField={sortField}
                          sortDirection={sortDirection}
                          onSort={handleSort}
                          onRowClick={(g) => handleView(g.id)}
                          actions={{
                            view: (g) => handleView(g.id),
                            edit: handleEdit,
                            delete: (g) => handleDeleteClick(g.id)
                          }}
                          emptyMessage="No groups matched your selection"
                          emptyIcon="none"
                        />
                      )}
                      {totalPages > 0 && paginatedGroups.length > 0 && (
                        <div className="mt-6 pt-4 border-t border-slate-200 flex flex-col items-center">
                          <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            pageSize={pageSize}
                            onPageSizeChange={(newSize) => {
                              setPageSize(newSize)
                              setCurrentPage(1)
                            }}
                            onPageChange={setCurrentPage}
                            pageSizeOptions={[10, 20, 50, 100]}
                            showTotalInfo={true}
                            loading={isLoading}
                          />
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </>
          )}
        </ErrorBoundary>
      </PageSection>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Group"
      >
        <GroupForm
          mode="create"
          onSubmit={handleCreateGroup}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => { setIsEditModalOpen(false); setSelectedGroup(null) }}
        title="Edit Group"
      >
        {selectedGroup && (
          <GroupForm
            mode="edit"
            initialData={{
              name: selectedGroup.name,
              course_id: selectedGroup.course_id,
              instructor_id: selectedGroup.instructor_id,
              capacity: selectedGroup.capacity,
              schedule: selectedGroup.schedule ? {
                day: selectedGroup.schedule.day,
                time_start: selectedGroup.schedule.start_time,
                time_end: selectedGroup.schedule.end_time,
              } : undefined,
              start_date: selectedGroup.start_date,
            }}
            onSubmit={handleUpdateGroup}
            onCancel={() => { setIsEditModalOpen(false); setSelectedGroup(null) }}
          />
        )}
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="Delete Group"
        message="Are you sure you want to delete this group? This action cannot be undone."
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
