import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { TopNavbar } from '../components/dashboard/TopNavbar'
import { Modal } from '../components/common/Modal'
import { GroupForm } from '../components/groups/GroupForm'
import { 
  createGroup, 
  getEnrichedGroups,
  type EnrichedGroupPublic, 
  type ScheduleGroupInput 
} from '../api/academics'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { GroupsTable, type SortField, type SortDirection } from '../components/groups/GroupsTable'
import { Pagination } from '../components/common/Pagination'
import { ErrorBoundary } from '../components/common/ErrorBoundary'
import { GroupsHeader } from '../components/groups/GroupsHeader'
import { GroupsControls } from '../components/groups/GroupsControls'

/**
 * Custom hook for groups logic to reduce component complexity
 */
function useGroups() {
  const [groups, setGroups] = useState<EnrichedGroupPublic[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  const loadGroups = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await getEnrichedGroups()
      setGroups(result || [])
    } catch (err: any) {
      console.error('[useGroups] loadGroups failed:', err)
      setError('Failed to load groups. Please check your connection.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadGroups()
  }, [loadGroups])

  const processedGroups = useMemo(() => {
    let filtered = groups.filter((group) =>
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (group.course_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (group.instructor_name || '').toLowerCase().includes(searchTerm.toLowerCase())
    )

    return [...filtered].sort((a, b) => {
      const aRaw = a[sortField as keyof EnrichedGroupPublic]
      const bRaw = b[sortField as keyof EnrichedGroupPublic]
      
      const aValue = sortField === 'max_capacity' ? Number(aRaw) : aRaw
      const bValue = sortField === 'max_capacity' ? Number(bRaw) : bRaw
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
      }
      
      const aStr = String(aValue || '').toLowerCase()
      const bStr = String(bValue || '').toLowerCase()
      
      return sortDirection === 'asc' 
        ? aStr.localeCompare(bStr) 
        : bStr.localeCompare(aStr)
    })
  }, [groups, searchTerm, sortField, sortDirection])

  const paginatedGroups = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return processedGroups.slice(start, start + pageSize)
  }, [processedGroups, currentPage, pageSize])

  const totalPages = Math.ceil(processedGroups.length / pageSize)

  return {
    groups,
    setGroups,
    totalGroups: groups.length,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    sortField,
    setSortField,
    sortDirection,
    setSortDirection,
    processedGroups,
    paginatedGroups,
    totalPages,
    refresh: loadGroups
  }
}

export function GroupsPage() {
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
    setSortField,
    sortDirection,
    setSortDirection,
    processedGroups,
    paginatedGroups,
    totalPages,
    setGroups
  } = useGroups()

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [mutationError, setMutationError] = useState<string | null>(null)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
    setCurrentPage(1)
  }

  const handleCreateGroup = async (data: ScheduleGroupInput) => {
    setMutationError(null)
    try {
      await createGroup(data)
      setIsCreateModalOpen(false)
      await refresh() // Reload groups to get enriched data with course/instructor names
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

  return (
    <div className="min-h-screen bg-surface">
      <TopNavbar activePage="Groups" />
      
      <GroupsHeader 
        totalGroups={totalGroups}
        searchTerm={searchTerm}
        onSearchChange={(val) => { setSearchTerm(val); setCurrentPage(1) }}
        onCreateClick={() => setIsCreateModalOpen(true)}
      />

      <section className="p-8 max-w-[1400px] mx-auto">
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
    </div>
  )
}
