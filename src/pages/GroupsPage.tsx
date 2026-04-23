import { useState } from 'react'
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
import { useGroups } from '../hooks/useGroups'
import { useCreateGroup, useUpdateGroup, useDeleteGroup } from '../hooks/useGroupQueries'

import { groupColumns } from '../components/groups/GroupColumns'

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
    processedGroups: _processedGroups,
    paginatedGroups,
    totalPages,
    refresh,
    // Grouping
    groupBy,
    setGroupBy,
    groupedData,
    isGroupedView,
  } = useGroups()

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deletingGroupId, setDeletingGroupId] = useState<number | null>(null)
  const { showToast, ToastComponent } = useToast()
  const [selectedGroup, setSelectedGroup] = useState<EnrichedGroupPublic | null>(null)
  const [mutationError, setMutationError] = useState<string | null>(null)

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
    } catch (err: any) {
      const msg = err.message || 'Failed to delete group'
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
    } catch (err: any) {
      console.error('[GroupsPage] createGroup failed:', err)
      const detail = err?.response?.data?.detail
      let errorMsg = 'Failed to create group.'
      
      if (Array.isArray(detail)) {
        errorMsg = detail.map((d: any) => `${d.loc?.[d.loc.length-1] || 'Field'}: ${d.msg}`).join(', ')
      } else if (typeof detail === 'string') {
        errorMsg = detail
      }
      
      setMutationError(errorMsg)
      throw new Error(errorMsg)
    }
  }

  const handleUpdateGroup = async (data: any) => {
    if (!selectedGroup) return
    setMutationError(null)
    try {
      await updateGroupMutation.mutateAsync({ id: selectedGroup.id, data })
      setIsEditModalOpen(false)
      setSelectedGroup(null)
      await refresh()
    } catch (err: any) {
      setMutationError(err.message || 'Failed to update group')
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
        <GroupBySelector
          value={groupBy || 'course'}
          onChange={(field) => {
            setGroupBy(field)
            setCurrentPage(1)
          }}
        />

        <ErrorBoundary>
          {isLoading && (
            <div className="flex items-center justify-center py-20"><LoadingSpinner /></div>
          )}
          
          {!isLoading && groupBy === undefined && (
            <div className="flex flex-col items-center justify-center py-28 gap-3 text-center">
              <span className="material-symbols-outlined text-6xl text-slate-200">grid_view</span>
              <p className="text-slate-400 text-sm font-medium">
                Select a view above to load groups
              </p>
            </div>
          )}

          {!isLoading && error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-lg text-red-700 text-center">{error}</div>
          )}

          {!isLoading && !error && groupBy !== undefined && (
            <>
              {mutationError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700 flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">error</span>
                  {mutationError}
                </div>
              )}
              {isGroupedView ? (
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

              {!isGroupedView && totalPages > 0 && (
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
            initialData={selectedGroup as any}
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
