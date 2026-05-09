import { useState, useEffect } from 'react'
import { TopNavbar } from '../components/dashboard/TopNavbar'
import { PageHeader, PageSection, ActionButton, SearchBar, LoadingSpinner, Modal, PaginationControls } from '../components/common'
import { EmployeeForm } from '../components/staff/EmployeeForm'
import { CreateAccountModal } from '../components/staff/CreateAccountModal'
import { EmployeeDetailModal } from '../components/staff/EmployeeDetailModal'
import { EmployeeCard } from '../components/staff/EmployeeCard'
import { useToast } from '../components/common/Toast'
import { usePagination } from '../hooks/usePagination'
import { extractErrorMessage, isValidationError } from '../utils/apiErrors'
import {
  fetchEmployeesPaginated,
  getEmployee,
  createEmployee,
  updateEmployee,
  createEmployeeAccount,
  type EmployeePublic,
  type EmployeeCreateInput,
  type CreateEmployeeAccountRequest
} from '../api/hr'

export function StaffPage() {
  const { showToast, ToastComponent } = useToast()
  
  // Use pagination hook for employees
  const {
    items: employees,
    total: totalEmployees,
    isLoading,
    currentPage,
    setPage,
    refresh
  } = usePagination(fetchEmployeesPaginated, { initialLimit: 20, initialSkip: 0 })
  
  // Employee detail state
  const [viewingEmployee, setViewingEmployee] = useState<EmployeePublic | null>(null)
  const [employeeDetail, setEmployeeDetail] = useState<EmployeePublic | null>(null)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)
  
  const [error, setError] = useState<string | null>(null)
  const [createError, setCreateError] = useState<string | null>(null)
  const [updateError, setUpdateError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<EmployeePublic | null>(null)
  const [creatingAccountFor, setCreatingAccountFor] = useState<EmployeePublic | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Load initial data - only on mount to prevent infinite loops
  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Empty dependency array - run once on mount only

  const handleCreateEmployee = async (data: EmployeeCreateInput) => {
    setIsProcessing(true)
    setCreateError(null)
    try {
      await createEmployee(data)
      await refresh() // Refresh the list from server
      setIsAddModalOpen(false)
      setError(null)
      showToast('Employee created successfully', 'success')
    } catch (err) {
      const errorMessage = extractErrorMessage(err)
      setCreateError(errorMessage)
      setError(errorMessage)
      showToast(errorMessage, 'error')
      
      // Log full error details for debugging
      if (isValidationError(err)) {
        console.error('Validation error details:', err)
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const handleUpdateEmployee = async (data: EmployeeCreateInput) => {
    if (!editingEmployee) return
    setIsProcessing(true)
    setUpdateError(null)
    try {
      await updateEmployee(editingEmployee.id, data)
      await refresh() // Refresh the list from server
      setEditingEmployee(null)
      setError(null)
      showToast('Employee updated successfully', 'success')
    } catch (err) {
      const errorMessage = extractErrorMessage(err)
      setUpdateError(errorMessage)
      setError(errorMessage)
      showToast(errorMessage, 'error')
      
      // Log full error response for debugging
      if (isValidationError(err)) {
        const axiosError = err as { response?: { data?: unknown; status?: number } }
        console.error('=== 422 Validation Error ===')
        console.error('Status:', axiosError.response?.status)
        console.error('Response Data:', axiosError.response?.data)
        console.error('Full Error:', err)
        console.error('===========================')
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const handleViewEmployee = async (employee: EmployeePublic) => {
    setViewingEmployee(employee)
    setIsLoadingDetail(true)
    try {
      const response = await getEmployee(employee.id)
      setEmployeeDetail(response.data)
    } catch {
      setError('Failed to load employee details')
    } finally {
      setIsLoadingDetail(false)
    }
  }

  const handleCreateAccount = async (data: CreateEmployeeAccountRequest) => {
    if (!creatingAccountFor) return
    setIsProcessing(true)
    try {
      await createEmployeeAccount(creatingAccountFor.id, data)
      setCreatingAccountFor(null)
      setError(null)
      showToast('Account created successfully', 'success')
    } catch (err) {
      const errorMessage = extractErrorMessage(err)
      setError(errorMessage)
      showToast(errorMessage, 'error')
    } finally {
      setIsProcessing(false)
    }
  }

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.job_title.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  return (
    <div className="min-h-screen bg-surface">
      {ToastComponent}
      <TopNavbar activePage="Staff" />

      {/* Header */}
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


        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <SearchBar
            placeholder="Search employees..."
            onSearch={setSearchTerm}
            className="flex-1 max-w-md"
          />
        </div>

<>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : filteredEmployees.length === 0 ? (
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-4xl text-slate-300 mb-4">people</span>
                <p className="text-slate-500">No employees found</p>
              </div>
            ) : (
              <>
                {/* Employee Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredEmployees.map((employee) => (
                    <EmployeeCard
                      key={employee.id}
                      employee={employee}
                      onView={() => handleViewEmployee(employee)}
                      onEdit={() => setEditingEmployee(employee)}
                      onCreateAccount={() => setCreatingAccountFor(employee)}
                    />
                  ))}
                </div>
                {/* Pagination Controls */}
                <div className="mt-6 flex justify-center">
                  <PaginationControls
                    currentPage={currentPage}
                    total={totalEmployees}
                    pageSize={20}
                    onChange={setPage}
                  />
                </div>
              </>
            )}
          </>
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
            setCreateError(null)
          }}
          mode="create"
          isLoading={isProcessing}
          apiError={createError}
        />
      </Modal>

      {/* Edit Employee Modal */}
      <Modal
        isOpen={!!editingEmployee}
        onClose={() => setEditingEmployee(null)}
        title="Edit Employee"
        size="lg"
      >
        {editingEmployee && (
          <EmployeeForm
            initialData={editingEmployee}
            onSubmit={handleUpdateEmployee}
            onCancel={() => {
              setEditingEmployee(null)
              setUpdateError(null)
            }}
            mode="edit"
            isLoading={isProcessing}
            apiError={updateError}
          />
        )}
      </Modal>

      {/* Employee Detail Modal */}
      <EmployeeDetailModal
        employee={employeeDetail || viewingEmployee}
        isLoading={isLoadingDetail}
        isOpen={!!viewingEmployee}
        onClose={() => {
          setViewingEmployee(null)
          setEmployeeDetail(null)
        }}
      />

      {/* Create Account Modal */}
      {creatingAccountFor && (
        <CreateAccountModal
          employee={creatingAccountFor}
          isOpen={!!creatingAccountFor}
          onClose={() => setCreatingAccountFor(null)}
          onSubmit={handleCreateAccount}
          isLoading={isProcessing}
        />
      )}
    </div>
  )
}
