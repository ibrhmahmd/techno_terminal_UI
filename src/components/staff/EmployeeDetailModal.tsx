import { Modal } from '../common/Modal'
import { ErrorState } from '../common/ErrorState'
import { FieldLabel } from './shared/FieldLabel'
import { Skeleton } from '../common/Skeleton'
import type { EmployeePublic } from '../../api/hr'

interface EmployeeDetailModalProps {
  employee: EmployeePublic | null
  isLoading: boolean
  isOpen: boolean
  onClose: () => void
  onRetry?: () => void
}

export function EmployeeDetailModal({ employee, isLoading, isOpen, onClose, onRetry }: EmployeeDetailModalProps) {
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getEmploymentTypeLabel = (type: string | undefined) => {
    if (!type) return 'Not set'
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const modalFooter = (
    <div className="flex justify-end">
      <button
        onClick={onClose}
        className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
      >
        Close
      </button>
    </div>
  )

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Employee Details" size="lg" footer={modalFooter}>
      {isLoading ? (
        <div className="space-y-6">
          <div className="flex items-start gap-4 pb-6 border-b border-slate-200">
            <Skeleton variant="circular" width={64} height={64} />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-4 bg-slate-50 rounded-lg space-y-2">
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-5 w-2/3" />
              </div>
            ))}
          </div>
          <div className="p-4 bg-surface-container-low rounded-lg space-y-3">
            <Skeleton className="h-4 w-1/4" />
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-1">
                  <Skeleton className="h-3 w-1/3" />
                  <Skeleton className="h-5 w-1/2" />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : !employee ? (
        <div className="py-4">
          <ErrorState
            title="Failed to load employee details"
            message="We could not load the employee information. Please try again."
            onRetry={onRetry}
          />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex items-start gap-4 pb-6 border-b border-slate-200">
            <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl text-secondary">person</span>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-headline font-semibold text-on-surface">{employee.full_name}</h3>
              <p className="text-on-surface-variant">{employee.job_title || 'No job title set'}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${employee.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                  {employee.is_active ? 'Active' : 'Inactive'}
                </span>
                <span className="text-xs text-on-surface-variant">
                  {getEmploymentTypeLabel(employee.employment_type)}
                </span>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div>
            <h4 className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider mb-3">Personal Information</h4>
            <div className="grid grid-cols-2 gap-4">
              <FieldLabel label="National ID" value={employee.national_id} icon="badge" fallback="Not provided" />
              <FieldLabel label="Employee ID" value={`#${employee.id}`} icon="tag" />
              <FieldLabel label="Hire Date" value={formatDate(employee.hired_at)} icon="calendar_today" />
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider mb-3">Contact</h4>
            <div className="grid grid-cols-2 gap-4">
              <FieldLabel label="Email" value={employee.email} icon="mail" />
              <FieldLabel label="Phone" value={employee.phone} icon="call" />
            </div>
          </div>

          {/* Employment Details */}
          <div className="p-4 bg-surface-container-low rounded-lg">
            <h4 className="text-sm font-semibold text-on-surface uppercase tracking-wider mb-3">Employment Details</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-on-surface-variant mb-1">Job Title</p>
                <p className="text-sm font-medium text-on-surface">{employee.job_title || 'Not set'}</p>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant mb-1">Status</p>
                <p className="text-sm font-medium text-on-surface">{employee.is_active ? 'Active' : 'Inactive'}</p>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant mb-1">University</p>
                <p className="text-sm font-medium text-on-surface">{employee.university || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant mb-1">Major</p>
                <p className="text-sm font-medium text-on-surface">{employee.major || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant mb-1">Graduate</p>
                <p className="text-sm font-medium text-on-surface">
                  {employee.is_graduate === undefined ? 'Not specified' : employee.is_graduate ? 'Yes' : 'No'}
                </p>
              </div>
              {/* <div>
                <p className="text-xs text-on-surface-variant mb-1">Monthly Salary</p>
                <p className="text-sm font-medium text-on-surface">{formatCurrency(employee.monthly_salary) || 'Not set'}</p>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant mb-1">Contract Percentage</p>
                <p className="text-sm font-medium text-on-surface">{formatPercentage(employee.contract_percentage) || 'Not set'}</p>
              </div> */}
            </div>
          </div>
        </div>
      )}
    </Modal>
  )
}
