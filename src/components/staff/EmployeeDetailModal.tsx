import { useTranslation } from 'react-i18next'
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
  onDelete?: () => void
  onRestore?: () => void
}

export function EmployeeDetailModal({ employee, isLoading, isOpen, onClose, onRetry, onDelete, onRestore }: EmployeeDetailModalProps) {
  const { t } = useTranslation('staff')
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

  const isDeleted = !!employee?.deleted_at

  const modalFooter = (
    <div className="flex justify-end gap-2">
      {isDeleted ? (
        <button
          onClick={onRestore}
          className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
        >
          {t('detail_modal.restore_employee')}
        </button>
      ) : (
        <button
          onClick={onDelete}
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
        >
          {t('detail_modal.delete_employee')}
        </button>
      )}
      <button
        onClick={onClose}
        className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
      >
        {t('detail_modal.close')}
      </button>
    </div>
  )

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('detail_modal.title')} size="lg" footer={modalFooter}>
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
            title={t('detail_modal.load_error_title')}
            message={t('detail_modal.load_error_message')}
            onRetry={onRetry}
          />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Deleted warning banner */}
          {isDeleted && employee.deleted_at && (
            <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <span className="material-symbols-outlined text-yellow-600 mt-0.5">warning</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-800">
                  {t('detail_modal.deleted_warning')} {formatDate(employee.deleted_at)} {t('detail_modal.deleted_by')} #{employee.deleted_by}
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  {t('detail_modal.restore_warning')}
                </p>
              </div>
              <button
                onClick={onRestore}
                className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors shrink-0"
              >
                {t('detail_modal.restore')}
              </button>
            </div>
          )}

          {/* Header Section */}
          <div className="flex items-start gap-4 pb-6 border-b border-slate-200">
            <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl text-secondary">person</span>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-headline font-semibold text-on-surface">{employee.full_name}</h3>
              <p className="text-on-surface-variant">{employee.job_title || t('detail_modal.no_job_title')}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${employee.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                  {employee.is_active ? t('employee.active') : t('employee.inactive')}
                </span>
                <span className="text-xs text-on-surface-variant">
                  {getEmploymentTypeLabel(employee.employment_type)}
                </span>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div>
            <h4 className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider mb-3">{t('detail_modal.personal_info')}</h4>
            <div className="grid grid-cols-2 gap-4">
              <FieldLabel label={t('employee.role')} value={employee.national_id} icon="badge" fallback={t('detail_modal.not_provided')} />
              <FieldLabel label="Employee ID" value={`#${employee.id}`} icon="tag" />
              <FieldLabel label="Hire Date" value={formatDate(employee.hired_at)} icon="calendar_today" />
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider mb-3">{t('detail_modal.contact')}</h4>
            <div className="grid grid-cols-2 gap-4">
              <FieldLabel label="Email" value={employee.email} icon="mail" />
              <FieldLabel label="Phone" value={employee.phone} icon="call" />
            </div>
          </div>

          {/* Employment Details */}
          <div className="p-4 bg-surface-container-low rounded-lg">
            <h4 className="text-sm font-semibold text-on-surface uppercase tracking-wider mb-3">{t('detail_modal.employment_details')}</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-on-surface-variant mb-1">Job Title</p>
                <p className="text-sm font-medium text-on-surface">{employee.job_title || t('detail_modal.not_set')}</p>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant mb-1">Status</p>
                <p className="text-sm font-medium text-on-surface">{employee.is_active ? t('employee.active') : t('employee.inactive')}</p>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant mb-1">University</p>
                <p className="text-sm font-medium text-on-surface">{employee.university || t('detail_modal.not_specified')}</p>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant mb-1">Major</p>
                <p className="text-sm font-medium text-on-surface">{employee.major || t('detail_modal.not_specified')}</p>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant mb-1">Graduate</p>
                <p className="text-sm font-medium text-on-surface">
                  {employee.is_graduate === undefined ? t('detail_modal.not_specified') : employee.is_graduate ? t('detail_modal.yes') : t('detail_modal.no')}
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
