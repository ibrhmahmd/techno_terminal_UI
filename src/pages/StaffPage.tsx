import { useState, useEffect, useRef } from 'react'
import { TopNavbar } from '../components/dashboard/TopNavbar'
import { PageHeader, PageSection, ActionButton, SearchBar, LoadingSpinner, Modal, PaginationControls, EmptyState, ErrorState } from '../components/common'
import { EmployeeForm } from '../components/staff/EmployeeForm'
import { CreateAccountModal } from '../components/staff/CreateAccountModal'
import { EmployeeDetailModal } from '../components/staff/EmployeeDetailModal'
import { EmployeeCard } from '../components/staff/EmployeeCard'
import { useToast } from '../components/common/Toast'
import { useEmployees, useEmployee, useCreateEmployee, useUpdateEmployee } from '../hooks/useStaff'
import { useCreateEmployeeAccount } from '../hooks/useStaffAccounts'
import { PillSelector } from '../components/common/PillSelector'
import type { EmployeeCreateInput, CreateEmployeeAccountRequest } from '../api/hr'

const EMPLOYMENT_TYPE_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: 'full_time', label: 'Full Time' },
  { value: 'part_time', label: 'Part Time' },
  { value: 'contract', label: 'Contract' },
]

export function StaffPage() {
  const { showToast, ToastComponent } = useToast()

  // Pagination state (declared before effects that reference it)
  const [page, setPage] = useState(1)
  const pageSize = 20

  // Search with debounce
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(searchInput)
      setPage(1)
    }, 300)
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
    }
  }, [searchInput])

  // Filter state
  const [employmentType, setEmploymentType] = useState('')

  // Server data via React Query
  const { data: pageData, isLoading, error, refetch } = useEmployees(debouncedSearch, page, pageSize, employmentType || undefined)
  const employees = pageData?.items ?? []
  const total = pageData?.total ?? 0

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<number | null>(null)
  const [viewingEmployeeId, setViewingEmployeeId] = useState<number | null>(null)
  const [creatingAccountFor, setCreatingAccountFor] = useState<number | null>(null)

  // Mutations
  const createMutation = useCreateEmployee()
  const updateMutation = useUpdateEmployee()
  const createAccountMutation = useCreateEmployeeAccount()

  // Detail query for view modal
  const { data: employeeDetail, isLoading: isLoadingDetail, refetch: refetchDetail } = useEmployee(viewingEmployeeId)

  // Detail query for edit modal (fetches full EmployeePublic for pre-fill)
  const { data: editingEmployeeDetail, isLoading: isLoadingEditDetail, error: editDetailError, refetch: refetchEditDetail } = useEmployee(editingEmployee)

  // Create handler
  const handleCreateEmployee = async (data: EmployeeCreateInput) => {
    await createMutation.mutateAsync(data)
    setIsAddModalOpen(false)
    showToast('Employee created successfully', 'success')
  }

  // Update handler
  const handleUpdateEmployee = async (data: EmployeeCreateInput) => {
    if (!editingEmployee) return
    await updateMutation.mutateAsync({ id: editingEmployee, data })
    setEditingEmployee(null)
    showToast('Employee updated successfully', 'success')
  }

  // Account creation handler
  const handleCreateAccount = async (data: CreateEmployeeAccountRequest) => {
    if (!creatingAccountFor) return
    await createAccountMutation.mutateAsync({ employeeId: creatingAccountFor, data })
    setCreatingAccountFor(null)
    showToast('Account created successfully', 'success')
  }

  // Filter change
  const handleEmploymentTypeChange = (value: string) => {
    setEmploymentType(value)
    setPage(1)
  }

  const handleViewEmployee = (id: number) => {
    setViewingEmployeeId(id)
  }

  // Find editing employee info from the list
  const editingEmployeeData = employees.find(e => e.id === editingEmployee) ?? null
  const accountEmployeeData = employees.find(e => e.id === creatingAccountFor) ?? null

  return (
    <div className="min-h-screen bg-surface">
      {ToastComponent}
      <TopNavbar activePage="Staff" />

      <PageHeader
        title="Staff Management"
        subtitle="Manage employees, attendance, and staff accounts"
        actions={
          <ActionButton
            icon="person_add"
            onClick={() => setIsAddModalOpen(true)}
          >
            Add Employee
          </ActionButton>
        }
      />

      <PageSection>
        {/* Error banner */}
        {error && (
          <div className="mb-6">
            <ErrorState
              title="Failed to load employees"
              message={error instanceof Error ? error.message : 'An error occurred'}
              onRetry={() => refetch()}
            />
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <SearchBar
            placeholder="Search employees..."
            onSearch={setSearchInput}
            className="flex-1 max-w-md"
          />
          <PillSelector
            options={EMPLOYMENT_TYPE_OPTIONS}
            value={employmentType}
            onChange={handleEmploymentTypeChange}
          />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <EmployeeCard
                key={`skeleton-${i}`}
                employee={{ id: 0, full_name: '', job_title: '', employment_type: 'full_time', is_active: false }}
                onView={() => {}}
                onEdit={() => {}}
                onCreateAccount={() => {}}
                isLoading
              />
            ))}
          </div>
        ) : employees.length === 0 ? (
          <EmptyState
            icon="inbox"
            title={debouncedSearch ? 'No employees found' : 'No employees yet'}
            message={debouncedSearch ? 'Try adjusting your search or filters.' : 'Add your first employee to get started.'}
          />
        ) : (
          <>
            {/* Employee Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {employees.map((employee) => (
                <EmployeeCard
                  key={employee.id}
                  employee={employee}
                  onView={() => handleViewEmployee(employee.id)}
                  onEdit={() => setEditingEmployee(employee.id)}
                  onCreateAccount={() => setCreatingAccountFor(employee.id)}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="mt-6 flex justify-center">
              <PaginationControls
                currentPage={page}
                total={total}
                pageSize={pageSize}
                onChange={setPage}
              />
            </div>
          </>
        )}
      </PageSection>

      {/* Add Employee Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Employee"
        size="lg"
      >
        <EmployeeForm
          onSubmit={handleCreateEmployee}
          onCancel={() => {
            setIsAddModalOpen(false)
          }}
          mode="create"
          isLoading={createMutation.isPending}
          apiError={createMutation.error ? (createMutation.error as Error).message : null}
        />
      </Modal>

      {/* Edit Employee Modal */}
      <Modal
        isOpen={!!editingEmployee}
        onClose={() => setEditingEmployee(null)}
        title="Edit Employee"
        size="lg"
      >
        {isLoadingEditDetail ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : editDetailError ? (
          <div className="py-4">
            <ErrorState
              title="Failed to load employee details"
              message="Could not load employee data for editing. Please try again."
              onRetry={() => refetchEditDetail()}
            />
          </div>
        ) : editingEmployeeDetail ? (
          <EmployeeForm
            initialData={editingEmployeeDetail}
            onSubmit={handleUpdateEmployee}
            onCancel={() => setEditingEmployee(null)}
            mode="edit"
            isLoading={updateMutation.isPending}
            apiError={updateMutation.error ? (updateMutation.error as Error).message : null}
          />
        ) : editingEmployeeData ? (
          <EmployeeForm
            initialData={{
              id: editingEmployeeData.id,
              full_name: editingEmployeeData.full_name,
              job_title: editingEmployeeData.job_title,
              employment_type: editingEmployeeData.employment_type,
              is_active: editingEmployeeData.is_active,
            }}
            onSubmit={handleUpdateEmployee}
            onCancel={() => setEditingEmployee(null)}
            mode="edit"
            isLoading={updateMutation.isPending}
            apiError={updateMutation.error ? (updateMutation.error as Error).message : null}
          />
        ) : null}
      </Modal>

      {/* Employee Detail Modal */}
      <EmployeeDetailModal
        employee={employeeDetail ?? null}
        isLoading={isLoadingDetail}
        isOpen={!!viewingEmployeeId}
        onClose={() => {
          setViewingEmployeeId(null)
        }}
        onRetry={() => refetchDetail()}
      />

      {/* Create Account Modal */}
      {accountEmployeeData && (
        <CreateAccountModal
          employee={accountEmployeeData}
          isOpen={!!creatingAccountFor}
          onClose={() => setCreatingAccountFor(null)}
          onSubmit={handleCreateAccount}
          isLoading={createAccountMutation.isPending}
        />
      )}
    </div>
  )
}
