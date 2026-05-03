import { useState, useEffect } from 'react'
import { TopNavbar } from '../components/dashboard/TopNavbar'
import { PageHeader, PageSection, ActionButton, SearchBar, DataTableContainer, LoadingSpinner, Modal, PaginationControls } from '../components/common'
import { EmployeeForm } from '../components/staff/EmployeeForm'
import { AttendanceLog } from '../components/staff/AttendanceLog'
import { CreateAccountModal } from '../components/staff/CreateAccountModal'
import { EmployeeDetailModal } from '../components/staff/EmployeeDetailModal'
import { useToast } from '../components/common/Toast'
import { usePagination } from '../hooks/usePagination'
import { extractErrorMessage, isValidationError } from '../utils/apiErrors'
import { 
  getEmployeesPaginated, 
  getEmployee,
  createEmployee,
  updateEmployee,
  logAttendance,
  getStaffAccounts,
  createEmployeeAccount,
  type EmployeePublic,
  type EmployeeCreateInput,
  type AttendanceLogInput,
  type StaffAccountPublic,
  type CreateEmployeeAccountRequest
} from '../api/hr'

export function StaffPage() {
  const { showToast, ToastComponent } = useToast()
  
  // Tab state
  const [activeTab, setActiveTab] = useState<'employees' | 'staff-accounts'>('employees')
  
  // Use pagination hook for employees
  const {
    items: employees,
    total: totalEmployees,
    isLoading,
    currentPage,
    setPage,
    refresh
  } = usePagination(getEmployeesPaginated, { initialLimit: 20, initialSkip: 0 })
  
  // Staff accounts state
  const [staffAccounts, setStaffAccounts] = useState<StaffAccountPublic[]>([])
  const [isLoadingStaffAccounts, setIsLoadingStaffAccounts] = useState(false)
  
  // Employee detail state
  const [viewingEmployee, setViewingEmployee] = useState<EmployeePublic | null>(null)
  const [employeeDetail, setEmployeeDetail] = useState<EmployeePublic | null>(null)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)
  
  // Create account state
  const [creatingAccountFor, setCreatingAccountFor] = useState<EmployeePublic | null>(null)
  
  const [error, setError] = useState<string | null>(null)
  const [createError, setCreateError] = useState<string | null>(null)
  const [updateError, setUpdateError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<EmployeePublic | null>(null)
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [isProcessing, setIsProcessing] = useState(false)

  // Load initial data - only on mount to prevent infinite loops
  useEffect(() => {
    async function loadData() {
      refresh()
      await loadStaffAccounts()
    }
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Empty dependency array - run once on mount only

  // Load staff accounts when switching to that tab
  useEffect(() => {
    if (activeTab === 'staff-accounts') {
      loadStaffAccounts()
    }
  }, [activeTab])

  async function loadStaffAccounts() {
    setIsLoadingStaffAccounts(true)
    try {
      const response = await getStaffAccounts()
      setStaffAccounts(response.data || [])
    } catch {
      setError('Failed to load staff accounts')
    } finally {
      setIsLoadingStaffAccounts(false)
    }
  }

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

  const handleLogAttendance = async (data: AttendanceLogInput) => {
    await logAttendance(data)
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
      await loadStaffAccounts() // Refresh staff accounts list
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
          <>
            {activeTab === 'employees' && (
              <>
                <ActionButton 
                  variant="secondary" 
                  icon="schedule" 
                  onClick={() => setIsAttendanceModalOpen(true)}
                >
                  Log Attendance
                </ActionButton>
                <ActionButton 
                  icon="person_add" 
                  onClick={() => setIsAddModalOpen(true)}
                >
                  Add Employee
                </ActionButton>
              </>
            )}
          </>
        }
      />

      <PageSection>


        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-6 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('employees')}
            className={`pb-2 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'employees' 
                ? 'border-secondary text-secondary' 
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Employees
          </button>
          <button
            onClick={() => setActiveTab('staff-accounts')}
            className={`pb-2 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'staff-accounts' 
                ? 'border-secondary text-secondary' 
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Staff Accounts
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <SearchBar
            placeholder="Search employees..."
            onSearch={setSearchTerm}
            className="flex-1 max-w-md"
          />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 text-sm border border-slate-200 rounded-lg bg-white text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
          />
        </div>

        {/* Employees Table */}
        {activeTab === 'employees' && (
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
              <DataTableContainer>
                <table className="w-full border-collapse text-left">
                  <thead className="bg-slate-50/80 backdrop-blur-sm sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Employee</th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Job Title</th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Type</th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                      <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredEmployees.map((employee) => (
                      <tr key={employee.id} className="group/row border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-slate-900">{employee.full_name}</p>
                            <p className="text-sm text-slate-500">{employee.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{employee.job_title}</td>
                        <td className="px-6 py-4 text-sm text-slate-600 capitalize">{(employee.employment_type || 'full_time').replace('_', ' ')}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${employee.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                            {employee.is_active ? 'active' : 'inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleViewEmployee(employee)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                              title="View Details"
                            >
                              <span className="material-symbols-outlined text-xl">visibility</span>
                            </button>
                            <button
                              onClick={() => setEditingEmployee(employee)}
                              className="p-1.5 text-slate-400 hover:text-secondary rounded-lg hover:bg-secondary-container transition-colors"
                              title="Edit"
                            >
                              <span className="material-symbols-outlined text-xl">edit</span>
                            </button>
                            <button
                              onClick={() => setCreatingAccountFor(employee)}
                              className="p-1.5 text-slate-400 hover:text-green-600 rounded-lg hover:bg-green-50 transition-colors"
                              title="Create Account"
                            >
                              <span className="material-symbols-outlined text-xl">person_add</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {/* Pagination Controls */}
                <div className="mt-4 flex justify-center">
                  <PaginationControls
                    currentPage={currentPage}
                    total={totalEmployees}
                    pageSize={20}
                    onChange={setPage}
                  />
                </div>
              </DataTableContainer>
            )}
          </>
        )}

        {/* Staff Accounts Table */}
        {activeTab === 'staff-accounts' && (
          <>
            {isLoadingStaffAccounts ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : staffAccounts.length === 0 ? (
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-4xl text-slate-300 mb-4">admin_panel_settings</span>
                <p className="text-slate-500">No staff accounts found</p>
                <p className="text-sm text-slate-400 mt-2">
                  Staff accounts are created when you assign login credentials to employees.
                </p>
              </div>
            ) : (
              <DataTableContainer>
                <table className="w-full border-collapse text-left">
                  <thead className="bg-slate-50/80 backdrop-blur-sm sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Username</th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Email</th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Employee</th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Job Title</th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {staffAccounts.map((account) => (
                      <tr key={account.id} className="group/row border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-slate-400 text-lg">person</span>
                            <span className="font-medium text-slate-900">{account.username}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{account.email}</td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-slate-900">{account.employee_name}</p>
                            <p className="text-xs text-slate-500">ID: #{account.employee_id}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{account.job_title}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${account.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                            {account.is_active ? 'active' : 'inactive'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </DataTableContainer>
            )}
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

      {/* Attendance Log Modal */}
      <AttendanceLog
        employees={employees}
        selectedDate={selectedDate}
        onLogAttendance={handleLogAttendance}
        onClose={() => setIsAttendanceModalOpen(false)}
        isOpen={isAttendanceModalOpen}
      />

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
