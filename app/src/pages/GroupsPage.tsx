import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TopNavbar } from '../components/dashboard/TopNavbar'
import { DataTable, type DataTableColumn, PageSection, Modal, LoadingSpinner, Pagination } from '../components/common'
import { GroupForm } from '../components/groups/GroupForm'
import { 
  createGroup, 
  updateGroup,
  deleteGroup,
  type EnrichedGroupPublic, 
  type ScheduleGroupInput 
} from '../api/academics'
import { ErrorBoundary } from '../components/common/ErrorBoundary'
import { GroupsHeader } from '../components/groups/GroupsHeader'
import { GroupsControls } from '../components/groups/GroupsControls'

import { useGroups } from '../hooks/useGroups'

// Column configuration for Groups DataTable
const groupColumns: DataTableColumn<EnrichedGroupPublic>[] = [
  {
    key: 'name',
    header: 'Group Name',
    sortable: true,
    cell: (group) => <span className="font-semibold text-slate-900">{group.group_name}</span>
  },
  {
    key: 'course_name',
    header: 'Course',
    sortable: true,
    cell: (group) => (
      <span className="text-sm text-slate-600 bg-slate-100/50 px-2.5 py-1 rounded-md border border-slate-200">
        {group.course_name}
      </span>
    )
  },
  {
    key: 'instructor_name',
    header: 'Instructor',
    sortable: true,
    cell: (group) => (
      <span className="text-sm text-slate-600 font-medium">
        {group.instructor_name || <span className="text-slate-400 italic">Unassigned</span>}
      </span>
    )
  },
  {
    key: 'schedule',
    header: 'Schedule',
    cell: (group) => (
      <div className="flex flex-col gap-0.5">
        <span className="text-xs font-semibold text-slate-900">{group.default_day}</span>
        <span className="text-[10px] text-slate-500">
          {group.default_time_start?.slice(0, 5) ?? ''} - {group.default_time_end?.slice(0, 5) ?? ''}
        </span>
      </div>
    )
  },
  {
    key: 'max_capacity',
    header: 'Capacity',
    sortable: true,
    align: 'center',
    cell: (group) => (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-700">
        <span className="material-symbols-outlined text-xs">group</span>
        {group.max_capacity}
      </span>
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

      <PageSection>
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
                  delete: (g) => handleDelete(g.id)
                }}
                emptyMessage="No groups matched your selection"
                emptyIcon="none"
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
