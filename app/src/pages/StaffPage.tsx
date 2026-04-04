import { useState, useEffect } from 'react'
import { TopNavbar } from '../components/dashboard/TopNavbar'
import { Modal } from '../components/common/Modal'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import { EmployeeForm } from '../components/staff/EmployeeForm'
import { AttendanceLog } from '../components/staff/AttendanceLog'
import { PaginationControls } from '../components/common/PaginationControls'
import { usePagination } from '../hooks/usePagination'
import { 
  getEmployeesPaginated, 
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getHRStats,
  logAttendance,
  type Employee,
  type CreateEmployeeInput,
  type UpdateEmployeeInput,
  type LogAttendanceInput
} from '../api/hr'

// Mock data for fallback
import { departmentColors } from '../utils/colors'

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  on_leave: 'bg-blue-100 text-blue-700',
  suspended: 'bg-yellow-100 text-yellow-700',
  terminated: 'bg-red-100 text-red-700',
}

export function StaffPage() {
  const [stats, setStats] = useState<{
    total_employees: number
    active_employees: number
    on_leave: number
    present_today: number
    monthly_payroll_total: number
  } | null>(null)
  
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
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all')
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [deletingEmployee, setDeletingEmployee] = useState<number | null>(null)
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [isProcessing, setIsProcessing] = useState(false)

  // Load initial data
  useEffect(() => {
    async function loadData() {
      try {
        const statsData = await getHRStats()
        setStats(statsData)
      } catch {
        setError('API unavailable. Failed to load stats.')
      }
      // Trigger employees load
      refresh()
    }
    loadData()
  }, [refresh])

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
    const matchesDepartment = selectedDepartment === 'all' || employee.department === selectedDepartment
    return matchesSearch && matchesDepartment
  })

  return (
    <div className="min-h-screen bg-surface">
      <TopNavbar activePage="Staff" />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-8 py-6">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-end justify-between">
            <div>
              <h1 className="font-headline text-3xl font-bold text-on-surface tracking-tight">Staff Management</h1>
              <p className="text-sm text-on-surface-variant mt-2">Manage employees, attendance, and payroll</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsAttendanceModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-secondary border border-secondary rounded-lg hover:bg-secondary-container transition-colors"
              >
                <span className="material-symbols-outlined text-sm">schedule</span>
                Log Attendance
              </button>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-secondary rounded-lg hover:bg-secondary/90 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">person_add</span>
                Add Employee
              </button>
            </div>
          </div>
        </div>
      </header>

      <section className="p-8 max-w-[1400px] mx-auto">


        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        {stats && (
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
        )}

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-lg border border-slate-200 flex-1 max-w-md">
            <span className="material-symbols-outlined text-slate-400">search</span>
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none text-sm text-on-surface w-full placeholder-slate-400"
            />
          </div>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-4 py-2 text-sm border border-slate-200 rounded-lg bg-white text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary"
          >
            <option value="all">All Departments</option>
            <option value="academics">Academics</option>
            <option value="operations">Operations</option>
            <option value="admin">Administration</option>
            <option value="management">Management</option>
          </select>
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
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Employee</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Department</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Job Title</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Type</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Salary</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Status</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((employee) => (
                  <tr key={employee.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-on-surface">{employee.full_name}</p>
                        <p className="text-sm text-slate-500">{employee.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${departmentColors[employee.department]}`}>
                        {employee.department}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{employee.job_title}</td>
                    <td className="py-3 px-4 text-slate-600 capitalize">{employee.employment_type.replace('_', ' ')}</td>
                    <td className="py-3 px-4 text-slate-600">{employee.salary.toLocaleString()} EGP</td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[employee.status]}`}>
                        {employee.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingEmployee(employee)}
                          className="p-2 text-slate-400 hover:text-secondary transition-colors"
                          title="Edit"
                        >
                          <span className="material-symbols-outlined text-sm">edit</span>
                        </button>
                        <button
                          onClick={() => setDeletingEmployee(employee.id)}
                          className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                          title="Delete"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
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
          </div>
        )}
      </section>

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
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setDeletingEmployee(null)}
              disabled={isProcessing}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={() => deletingEmployee && handleDeleteEmployee(deletingEmployee)}
              disabled={isProcessing}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {isProcessing && <LoadingSpinner size="sm" />}
              Delete
            </button>
          </div>
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
