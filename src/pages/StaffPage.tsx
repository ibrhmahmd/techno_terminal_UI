import { useState, useEffect } from 'react'
import { TopNavbar } from '../components/dashboard/TopNavbar'
import { PageHeader, PageSection, ActionButton, SearchBar, DataTableContainer, ModalFooter, LoadingSpinner, Modal, PaginationControls } from '../components/common'
import { EmployeeForm } from '../components/staff/EmployeeForm'
import { AttendanceLog } from '../components/staff/AttendanceLog'
import { usePagination } from '../hooks/usePagination'
import { 
  getEmployeesPaginated, 
  createEmployee,
  updateEmployee,
  deleteEmployee,
  // getHRStats, // NOTE: Disabled - endpoint not yet implemented
  logAttendance,
  type Employee,
  type CreateEmployeeInput,
  type UpdateEmployeeInput,
  type LogAttendanceInput
} from '../api/hr'

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  on_leave: 'bg-blue-100 text-blue-700',
  suspended: 'bg-yellow-100 text-yellow-700',
  terminated: 'bg-red-100 text-red-700',
}

export function StaffPage() {
  // NOTE: Stats disabled - HR Stats endpoint not yet implemented in backend
  // Stats cards section is commented out below until backend is ready
  
  // Use pagination hook for employees
  const {
    items: employees,
    total: totalEmployees,
    isLoading,
    currentPage,
    setPage,
    refresh
  } = usePagination(getEmployeesPaginated, { initialLimit: 20, initialSkip: 0 })
  
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [deletingEmployee, setDeletingEmployee] = useState<number | null>(null)
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [isProcessing, setIsProcessing] = useState(false)

  // Load initial data - only on mount to prevent infinite loops
  useEffect(() => {
    async function loadData() {
      // NOTE: HR Stats endpoint not yet implemented in backend
      // Keeping stats disabled to avoid API errors
      // try {
      //   const statsData = await getHRStats()
      //   setStats(statsData)
      // } catch {
      //   setError('API unavailable. Failed to load stats.')
      // }
      // Trigger employees load
      refresh()
    }
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Empty dependency array - run once on mount only

  const handleCreateEmployee = async (data: CreateEmployeeInput) => {
    setIsProcessing(true)
    try {
      await createEmployee(data)
      await refresh() // Refresh the list from server
      setIsAddModalOpen(false)
      setError(null)
    } catch {
      setError('Failed to create employee')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleUpdateEmployee = async (data: UpdateEmployeeInput) => {
    if (!editingEmployee) return
    setIsProcessing(true)
    try {
      await updateEmployee(editingEmployee.id, data)
      await refresh() // Refresh the list from server
      setEditingEmployee(null)
      setError(null)
    } catch {
      setError('Failed to update employee')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDeleteEmployee = async (id: number) => {
    setIsProcessing(true)
    try {
      await deleteEmployee(id)
      await refresh() // Refresh the list from server
      setDeletingEmployee(null)
      setError(null)
    } catch {
      setError('Failed to delete employee')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleLogAttendance = async (data: LogAttendanceInput) => {
    await logAttendance(data)
  }

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.job_title.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  return (
    <div className="min-h-screen bg-surface">
      <TopNavbar activePage="Staff" />

      {/* Header */}
      <PageHeader 
        title="Staff Management"
        subtitle="Manage employees, attendance, and payroll"
        actions={
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
        }
      />

      <PageSection>


        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Stats Cards - DISABLED: HR Stats endpoint not yet implemented */}
        {/* {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="p-4 bg-white rounded-xl border border-slate-200">
              <p className="text-sm text-slate-500">Total Employees</p>
              <p className="text-2xl font-bold text-on-surface">{stats.total_employees}</p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-200">
              <p className="text-sm text-slate-500">Active</p>
              <p className="text-2xl font-bold text-green-600">{stats.active_employees}</p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-200">
              <p className="text-sm text-slate-500">Present Today</p>
              <p className="text-2xl font-bold text-blue-600">{stats.present_today}</p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-200">
              <p className="text-sm text-slate-500">Monthly Payroll</p>
              <p className="text-2xl font-bold text-secondary">{stats.monthly_payroll_total.toLocaleString()} EGP</p>
            </div>
          </div>
        )} */}

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
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Salary</th>
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
                    <td className="px-6 py-4 text-sm text-slate-600">{employee.salary?.toLocaleString() ?? '0'} EGP</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[employee.status || 'active']}`}>
                        {(employee.status || 'active').replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity">
                        <button
                          onClick={() => setEditingEmployee(employee)}
                          className="p-1.5 text-slate-400 hover:text-secondary rounded-lg hover:bg-secondary-container transition-colors"
                          title="Edit"
                        >
                          <span className="material-symbols-outlined text-xl">edit</span>
                        </button>
                        <button
                          onClick={() => setDeletingEmployee(employee.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <span className="material-symbols-outlined text-xl">delete</span>
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
          onCancel={() => setIsAddModalOpen(false)}
          mode="create"
          isLoading={isProcessing}
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
            onCancel={() => setEditingEmployee(null)}
            mode="edit"
            isLoading={isProcessing}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingEmployee}
        onClose={() => setDeletingEmployee(null)}
        title="Delete Employee"
        size="sm"
        footer={
          <ModalFooter
            onCancel={() => setDeletingEmployee(null)}
            onConfirm={() => deletingEmployee && handleDeleteEmployee(deletingEmployee)}
            confirmText="Delete"
            variant="danger"
            isProcessing={isProcessing}
            cancelDisabled={isProcessing}
            confirmDisabled={isProcessing}
          />
        }
      >
        <p className="text-sm text-slate-600">
          Are you sure you want to delete this employee? This action cannot be undone.
        </p>
      </Modal>

      {/* Attendance Log Modal */}
      <AttendanceLog
        employees={employees}
        selectedDate={selectedDate}
        onLogAttendance={handleLogAttendance}
        onClose={() => setIsAttendanceModalOpen(false)}
        isOpen={isAttendanceModalOpen}
      />
    </div>
  )
}
