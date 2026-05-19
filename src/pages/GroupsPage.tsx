import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { TopNavbar } from '../components/dashboard/TopNavbar'
import { DataTable, PageSection, Modal, LoadingSpinner, Pagination, ConfirmDialog } from '../components/common'
import { useToast } from '../components/common/Toast'
import { GroupForm } from '../components/groups/GroupForm'
import { 
  type EnrichedGroupPublic, 
  type ScheduleGroupInput 
} from '../api/academics'
import { ErrorBoundary } from '../components/common/ErrorBoundary'
import { GroupsHeader } from '../components/groups/GroupsHeader'
import { GroupBySelector } from '../components/groups/GroupBySelector'
import { GroupCard } from '../components/groups/GroupCard'
import { ViewToggle } from '../components/groups/ViewToggle'
import { GroupCardGrid } from '../components/groups/GroupCardGrid'
import { GroupCategoryTabs } from '../components/groups/GroupCategoryTabs'
import { useGroups } from '../hooks/useGroups'
import { useCreateGroup, useUpdateGroup, useDeleteGroup, useArchivedGroups, useSearchGroups } from '../hooks/useGroupQueries'

import { groupColumns } from '../components/groups/GroupColumns'

type GroupsView = 'active' | 'completed'

export function GroupsPage() {
  const navigate = useNavigate()
  const [activeView] = useState<GroupsView>('active')
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
    refresh,
    // Grouping
    groupBy,
    setGroupBy,
    groupedData,
    isGroupedView,
  } = useGroups()

  // Server-side search hook
  const { data: searchResults, isLoading: isSearching } = useSearchGroups(
    searchTerm,
    undefined,
    searchTerm.length > 0 && activeView === 'active'
  )

  // Archived (completed) groups hook
  const { data: archivedGroups, isLoading: isLoadingArchived } = useArchivedGroups(
    activeView === 'completed'
  )

  // Use search results when query is non-empty, otherwise fall back to paginated groups
  const displayGroups = useMemo(() => {
    if (activeView === 'completed') {
      return archivedGroups?.items ?? []
    }
    if (searchTerm.length > 0 && searchResults) {
      return searchResults
    }
    return paginatedGroups
  }, [activeView, archivedGroups, searchTerm, searchResults, paginatedGroups])

  const displayTotal = useMemo(() => {
    if (activeView === 'completed') {
      return archivedGroups?.total ?? 0
    }
    if (searchTerm.length > 0) {
      return searchResults?.length ?? 0
    }
    return totalGroups
  }, [activeView, archivedGroups, searchTerm, searchResults, totalGroups])

  const displayLoading = activeView === 'completed'
    ? isLoadingArchived
    : isLoading || (searchTerm.length > 0 && isSearching)

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deletingGroupId, setDeletingGroupId] = useState<number | null>(null)
  const { showToast, ToastComponent } = useToast()
  const [selectedGroup, setSelectedGroup] = useState<EnrichedGroupPublic | null>(null)
  const [mutationError, setMutationError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')
  const [activeCategoryKey, setActiveCategoryKey] = useState<string | null>(null)

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
      await refresh()
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
      await refresh()
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
      await refresh()
    } catch (err: unknown) {
      setMutationError(err instanceof Error ? err.message : 'Failed to update group')
      throw err
    }
  }

  return (
    <div className="min-h-screen bg-surface">
      <TopNavbar activePage="Groups" />
      
      <GroupsHeader 
        totalGroups={displayTotal}
        searchTerm={searchTerm}
        onSearchChange={(val) => { setSearchTerm(val); setCurrentPage(1) }}
        onCreateClick={() => setIsCreateModalOpen(true)}
      />

      {/* View Toggle: Active / Completed */}
      {/* 
      <div className="px-6 pt-4">
        <div className="flex gap-2">
          <button
            onClick={() => { setActiveView('active'); setCurrentPage(1) }}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeView === 'active'
                ? 'bg-secondary text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => { setActiveView('completed'); setCurrentPage(1) }}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeView === 'completed'
                ? 'bg-secondary text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Completed
          </button>
        </div>
      </div>
      */}

      <PageSection>
        {activeView === 'active' && (
          <GroupBySelector
            value={groupBy ?? null}
            onChange={(field) => {
              setGroupBy(field)
              setCurrentPage(1)
            }}
            rightSlot={<ViewToggle value={viewMode} onChange={setViewMode} />}
          />
        )}

        <ErrorBoundary>
          {error && !isLoading && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-lg text-red-700 text-center">{error}</div>
          )}

          {groupBy === undefined && !isLoading && (
            <div className="flex flex-col items-center justify-center py-28 gap-3 text-center">
              <span className="material-symbols-outlined text-6xl text-slate-200" aria-hidden="true">grid_view</span>
              <p className="text-slate-400 text-sm font-medium">
                Select a view above to load groups
              </p>
            </div>
          )}

          {groupBy !== undefined && !error && activeView === 'active' && (
            <>
              {mutationError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700 flex items-center gap-2">
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
                  </>
                ) : (
                  <GroupCardGrid
                    isLoading={displayLoading}
                    emptyMessage="No groups matched your selection"
                    emptyIcon="grid_view"
                  >
                    {displayLoading ? null : displayGroups.map((g) => (
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
                  {displayLoading && (
                    <div className="flex items-center justify-center py-20"><LoadingSpinner /></div>
                  )}
                  {!displayLoading && isGroupedView && (
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
                  {!displayLoading && !isGroupedView && (
                    <>
                      <DataTable
                        data={displayGroups}
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
                      {totalPages > 0 && searchTerm.length === 0 && (
                        <div className="mt-6 pt-4 border-t border-slate-200">
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

          {/* Completed View */}
          {activeView === 'completed' && (
            <>
              {displayLoading && (
                <div className="flex items-center justify-center py-20"><LoadingSpinner /></div>
              )}
              {!displayLoading && (
                <>
                  {viewMode === 'cards' ? (
                    <GroupCardGrid
                      isLoading={false}
                      emptyMessage="No completed groups found"
                      emptyIcon="inbox"
                    >
                      {displayGroups.map((g) => (
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
                  ) : (
                    <>
                      <DataTable
                        data={displayGroups}
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
                        emptyMessage="No completed groups found"
                        emptyIcon="inbox"
                      />
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
