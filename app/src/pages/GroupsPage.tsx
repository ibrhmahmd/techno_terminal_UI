import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { TopNavbar } from '../components/dashboard/TopNavbar'
import { Modal } from '../components/common/Modal'
import { GroupForm } from '../components/groups/GroupForm'
import { 
  createGroup, 
  updateGroup,
  deleteGroup,
  getEnrichedGroups,
  type EnrichedGroupPublic, 
  type ScheduleGroupInput 
} from '../api/academics'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { GroupsTable } from '../components/groups/GroupsTable'
import { Pagination } from '../components/common/Pagination'
import { ErrorBoundary } from '../components/common/ErrorBoundary'
import { GroupsHeader } from '../components/groups/GroupsHeader'
import { GroupsControls } from '../components/groups/GroupsControls'

import { useGroups } from '../hooks/useGroups'

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
    processedGroups,
    paginatedGroups,
    totalPages,
    refresh
  } = useGroups()

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<EnrichedGroupPublic | null>(null)
  const [mutationError, setMutationError] = useState<string | null>(null)

  const handleView = (id: number) => {
    navigate(`/groups/${id}`)
  }

  const handleEdit = (group: EnrichedGroupPublic) => {
    setSelectedGroup(group)
    setIsEditModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to archive this group? This will stop all future sessions.')) return
    
    setMutationError(null)
    try {
      await deleteGroup(id)
      await refresh()
    } catch (err: any) {
      setMutationError(err.message || 'Failed to delete group')
    }
  }

  const handleCreateGroup = async (data: ScheduleGroupInput) => {
    setMutationError(null)
    try {
      await createGroup(data)
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
      await updateGroup(selectedGroup.id, data)
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

      <section className="w-full px-4 sm:px-6 lg:px-8 py-8 mx-auto">
        <GroupsControls 
          pageSize={pageSize}
          onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1) }}
          totalGroups={totalGroups}
          currentPage={currentPage}
          processedCount={processedGroups.length}
        />

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
              <GroupsTable
                groups={paginatedGroups}
                sortField={sortField}
                sortDirection={sortDirection}
                onSort={handleSort}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
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
      </section>

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
            initialData={selectedGroup}
            onSubmit={handleUpdateGroup}
            onCancel={() => { setIsEditModalOpen(false); setSelectedGroup(null) }}
          />
        )}
      </Modal>
    </div>
  )
}
