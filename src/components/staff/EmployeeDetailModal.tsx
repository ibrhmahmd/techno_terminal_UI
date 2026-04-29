import { Modal } from '../common/Modal'
import { LoadingSpinner } from '../common/LoadingSpinner'
import type { EmployeePublic } from '../../api/hr'

interface EmployeeDetailModalProps {
  employee: EmployeePublic | null
  isLoading: boolean
  isOpen: boolean
  onClose: () => void
}

export function EmployeeDetailModal({ employee, isLoading, isOpen, onClose }: EmployeeDetailModalProps) {
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Not set'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusBadge = (isActive: boolean) => {
    return isActive
      ? 'bg-green-100 text-green-700'
      : 'bg-gray-100 text-gray-700'
  }

  const getEmploymentTypeLabel = (type: string | undefined) => {
    if (!type) return 'Not set'
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Employee Details"
      size="lg"
      footer={
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
        </div>
      }
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : !employee ? (
        <div className="text-center py-8 text-slate-500">
          Failed to load employee details
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex items-start gap-4 pb-6 border-b border-slate-200">
            <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl text-secondary">person</span>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-slate-900">{employee.full_name}</h3>
              <p className="text-slate-600">{employee.job_title || 'No job title set'}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(employee.is_active)}`}>
                  {employee.is_active ? 'Active' : 'Inactive'}
                </span>
                <span className="text-xs text-slate-500">
                  {getEmploymentTypeLabel(employee.employment_type)}
                </span>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Email</p>
              <p className="text-sm text-slate-900">{employee.email || 'Not set'}</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Phone</p>
              <p className="text-sm text-slate-900">{employee.phone || 'Not set'}</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Hire Date</p>
              <p className="text-sm text-slate-900">{formatDate(employee.hired_at)}</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Employee ID</p>
              <p className="text-sm text-slate-900">#{employee.id}</p>
            </div>
          </div>

          {/* Employment Info */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-3">Employment Information</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-blue-700 mb-1">Employment Type</p>
                <p className="text-sm font-medium text-slate-900">{getEmploymentTypeLabel(employee.employment_type)}</p>
              </div>
              <div>
                <p className="text-xs text-blue-700 mb-1">Status</p>
                <p className="text-sm font-medium text-slate-900">{employee.is_active ? 'Active' : 'Inactive'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  )
}
