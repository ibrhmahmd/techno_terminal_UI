import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { TopNavbar } from '../components/dashboard/TopNavbar'
import { PageHeader, PageSection, ActionButton, SearchBar, LoadingSpinner, Modal, Pagination, EmptyState, ErrorState } from '../components/common'
import { EmployeeForm } from '../components/staff/EmployeeForm'
import { CreateAccountModal } from '../components/staff/CreateAccountModal'
import { EmployeeDetailModal } from '../components/staff/EmployeeDetailModal'
import { EmployeeCard } from '../components/staff/EmployeeCard'
import { CardGrid } from '../components/directory/CardGrid'
import { CardSkeleton } from '../components/directory/shared/CardSkeleton'
import { useToast } from '../components/common/Toast'
import { useEmployees, useEmployee, useCreateEmployee, useUpdateEmployee, useSoftDeleteEmployee, useRestoreEmployee } from '../hooks/useStaff'
import { useCreateEmployeeAccount } from '../hooks/useStaffAccounts'
import type { EmployeeCreateInput, CreateEmployeeAccountRequest } from '../api/hr'

export function StaffPage() {
  const { t } = useTranslation('staff')
  const { t: tCommon } = useTranslation('common')
  const { showToast, ToastComponent } = useToast()
  const [searchParams] = useSearchParams()
  const initialSearch = searchParams.get('search') || ''

  // Pagination state (declared before effects that reference it)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  // Search with debounce
  const [searchInput, setSearchInput] = useState(initialSearch)
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch)
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  // Sync search input if url search parameter changes
  useEffect(() => {
    const searchVal = searchParams.get('search') || ''
    // setState in effect is required here to sync URL param changes to local state
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearchInput(searchVal)
    setDebouncedSearch(searchVal)
    setPage(1)
  }, [searchParams])

  useEffect(() => {
    // If the searchInput matches the debounced search (e.g. from initial/sync), skip debounce to avoid infinite loop or extra requests
    if (searchInput === debouncedSearch) return

    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(searchInput)
      setPage(1)
    }, 300)
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
    }
  }, [searchInput, debouncedSearch])

  // Filter state
  const [employmentType] = useState('')
  const [includeDeleted, setIncludeDeleted] = useState(false)

  // Server data via React Query
  const { data: pageData, isLoading, error, refetch } = useEmployees(debouncedSearch, page, pageSize, employmentType || undefined, includeDeleted)
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
  const deleteMutation = useSoftDeleteEmployee()
  const restoreMutation = useRestoreEmployee()

  // Detail query for view modal
  const { data: employeeDetail, isLoading: isLoadingDetail, refetch: refetchDetail } = useEmployee(viewingEmployeeId)

  // Detail query for edit modal (fetches full EmployeePublic for pre-fill)
  const { data: editingEmployeeDetail, isLoading: isLoadingEditDetail, error: editDetailError, refetch: refetchEditDetail } = useEmployee(editingEmployee)

  // Create handler
  const handleCreateEmployee = async (data: EmployeeCreateInput) => {
    await createMutation.mutateAsync(data)
    setIsAddModalOpen(false)
    showToast(t('toast.created'), 'success')
  }

  // Update handler
  const handleUpdateEmployee = async (data: EmployeeCreateInput) => {
    if (!editingEmployee) return
    await updateMutation.mutateAsync({ id: editingEmployee, data })
    setEditingEmployee(null)
    showToast(t('toast.updated'), 'success')
  }

  // Account creation handler
  const handleCreateAccount = async (data: CreateEmployeeAccountRequest) => {
    if (!creatingAccountFor) return
    await createAccountMutation.mutateAsync({ employeeId: creatingAccountFor, data })
    setCreatingAccountFor(null)
    showToast(t('toast.account_created'), 'success')
  }

  const handleViewEmployee = (id: number) => {
    setViewingEmployeeId(id)
  }

  // Confirmation dialog state
  const [confirmAction, setConfirmAction] = useState<{ title: string; message: string; onConfirm: () => void; variant: 'danger' | 'success' } | null>(null)

  // Delete handler
  const handleDeleteEmployee = async (id: number) => {
    setConfirmAction({
      title: t('dialogs.delete_title'),
      message: t('dialogs.delete_message'),
      variant: 'danger',
      onConfirm: async () => {
        try {
          await deleteMutation.mutateAsync(id)
          setViewingEmployeeId(null)
          showToast(t('toast.deleted'), 'success')
        } catch (err) {
          showToast(err instanceof Error ? err.message : t('toast.delete_failed'), 'error')
        }
      },
    })
  }

  // Restore handler
  const handleRestoreEmployee = async (id: number) => {
    setConfirmAction({
      title: t('dialogs.restore_title'),
      message: t('dialogs.restore_message'),
      variant: 'success',
      onConfirm: async () => {
        try {
          await restoreMutation.mutateAsync(id)
          setViewingEmployeeId(null)
          showToast(t('toast.restored'), 'success')
        } catch (err) {
          showToast(err instanceof Error ? err.message : t('toast.restore_failed'), 'error')
        }
      },
    })
  }

  // Find editing employee info from the list
  const editingEmployeeData = employees.find(e => e.id === editingEmployee) ?? null
  const accountEmployeeData = employees.find(e => e.id === creatingAccountFor) ?? null

  return (
    <div className="min-h-screen bg-surface">
      {ToastComponent}
      <TopNavbar activePage={t('page_title')} />

      <PageHeader
        title={t('page_title')}
        subtitle=""
        actions={
          <ActionButton
            icon="person_add"
            onClick={() => setIsAddModalOpen(true)}
          >
            {t('actions.add_employee')}
          </ActionButton>
        }
      />

      <PageSection>
        {/* Error banner */}
        {error && (
          <div className="mb-6">
            <ErrorState
              title={tCommon('messages.error')}
              message={error instanceof Error ? error.message : tCommon('messages.error')}
              onRetry={() => refetch()}
            />
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <SearchBar
            placeholder={tCommon('labels.searchPlaceholder')}
            onSearch={setSearchInput}
            className="flex-1 max-w-md"
          />
          <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeDeleted}
              onChange={(e) => { setIncludeDeleted(e.target.checked); setPage(1) }}
              className="w-4 h-4 text-red-600 border-slate-300 rounded focus:ring-red-500"
            />
            {t('actions.include_deleted')}
          </label>
        </div>

        {isLoading ? (
          <CardGrid>
            {Array.from({ length: 8 }).map((_, i) => (
              <CardSkeleton key={`skeleton-${i}`} />
            ))}
          </CardGrid>
        ) : employees.length === 0 ? (
          <EmptyState
            icon="inbox"
            title={debouncedSearch ? t('empty.no_staff') : t('empty.no_staff')}
            message={debouncedSearch ? t('empty.no_results') : t('empty.add_first')}
          />
        ) : (
          <>
            {/* Employee Cards Grid */}
            <CardGrid>
              {employees.map((employee) => (
                <EmployeeCard
                  key={employee.id}
                  employee={employee}
                  onView={() => handleViewEmployee(employee.id)}
                  onEdit={() => setEditingEmployee(employee.id)}
                  onCreateAccount={() => setCreatingAccountFor(employee.id)}
                  onDelete={() => handleDeleteEmployee(employee.id)}
                  onRestore={() => handleRestoreEmployee(employee.id)}
                />
              ))}
            </CardGrid>

            {/* Pagination Controls */}
            <div className="mt-6">
              <Pagination
                currentPage={page}
                totalPages={Math.max(1, Math.ceil(total / pageSize))}
                onPageChange={setPage}
                pageSize={pageSize}
                onPageSizeChange={(size) => { setPageSize(size); setPage(1) }}
                pageSizeOptions={[10, 20, 50, 100]}
                showTotalInfo
                totalRecords={total}
              />
            </div>
          </>
        )}
      </PageSection>

      {/* Add Employee Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={t('actions.add_employee')}
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
        title={t('employee.edit_employee')}
        size="lg"
      >
        {isLoadingEditDetail ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : editDetailError ? (
          <div className="py-4">
            <ErrorState
              title={t('detail_modal.load_error_title')}
              message={t('detail_modal.load_error_message')}
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
        onDelete={() => viewingEmployeeId && handleDeleteEmployee(viewingEmployeeId)}
        onRestore={() => viewingEmployeeId && handleRestoreEmployee(viewingEmployeeId)}
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

      {/* Confirmation Dialog */}
      <Modal
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        title={confirmAction?.title ?? ''}
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">{confirmAction?.message}</p>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setConfirmAction(null)}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              {t('confirm.cancel')}
            </button>
            <button
              onClick={async () => {
                const action = confirmAction
                setConfirmAction(null)
                await action?.onConfirm()
              }}
              className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
                confirmAction?.variant === 'danger'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {confirmAction?.variant === 'danger' ? t('confirm.delete') : t('confirm.restore')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
