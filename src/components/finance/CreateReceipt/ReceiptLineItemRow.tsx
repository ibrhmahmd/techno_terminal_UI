import { PaymentMethodPills } from '../PaymentMethodPills'
import type { StudentListItem } from '../../../api/crm'
import type { StudentEnrollmentInfo } from '../../../hooks/finance/useStudentEnrollments'
import { EnrollmentSelection } from './EnrollmentSelection'
import { StudentCombobox } from '../../common/combobox'

export interface ReceiptLineItem {
  id: string
  studentSearch: string
  selectedStudent: StudentListItem | null
  students: StudentListItem[]
  selectedEnrollment: StudentEnrollmentInfo | null
  amount: number
  payment_type: string | null
  discount: number
  notes: string
}

const ITEM_TYPE_OPTIONS = [
  { value: 'course_level', label: 'Course Level' },
  { value: 'competition', label: 'Competition' },
  { value: 'other', label: 'Other' },
]

interface ReceiptLineItemRowProps {
  item: ReceiptLineItem
  index: number
  onUpdate: (updates: Partial<ReceiptLineItem>) => void
  onRemove: () => void
  isSearchingStudents?: boolean
  errors?: Record<string, string | undefined>
}

export function ReceiptLineItemRow({
  item,
  index,
  onUpdate,
  onRemove,
  isSearchingStudents = false,
  errors = {},
}: ReceiptLineItemRowProps) {
  return (
    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-slate-600">Item {index + 1}</span>
        <button
          onClick={onRemove}
          className="text-red-500 hover:text-red-700 transition-colors"
          title="Remove item"
        >
          <span className="material-symbols-outlined text-sm">delete</span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        {/* Student + Enrollment — 2/3 width on desktop */}
        <div className="flex-1 min-w-0 space-y-3">
          <StudentCombobox
            value={item.selectedStudent}
            onChange={(student) => onUpdate({
              selectedStudent: student,
              studentSearch: student?.full_name || '',
              students: [],
              selectedEnrollment: null,
            })}
            search={item.studentSearch}
            setSearch={(search) => onUpdate({ studentSearch: search })}
            students={item.students}
            isLoading={isSearchingStudents}
          />
          {item.selectedStudent && (
            <EnrollmentSelection
              studentId={item.selectedStudent.id}
              selectedEnrollment={item.selectedEnrollment}
              onSelect={(enrollment) => onUpdate({ selectedEnrollment: enrollment })}
            />
          )}
        </div>

        {/* Amount, Type, Discount — fixed width on desktop */}
        <div className="flex flex-row flex-wrap md:flex-col gap-2 md:min-w-[200px]">
          <div className="flex-1 md:w-full">
            <label className="block text-xs font-medium text-slate-600 mb-1">Amount (EGP)</label>
            <input
              type="number"
              min={0}
              value={item.amount || ''}
              onChange={(e) => onUpdate({ amount: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20"
            />
          </div>

          <div className="flex-1 md:w-full">
            <label className="block text-xs font-medium text-slate-600 mb-1">Discount</label>
            <input
              type="number"
              min={0}
              value={item.discount || ''}
              onChange={(e) => onUpdate({ discount: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20"
            />
          </div>
        </div>

        {/* Payment Type — full width below */}
        <div className="w-full md:w-auto md:min-w-[240px]">
          <PaymentMethodPills
            label="Payment Type"
            options={ITEM_TYPE_OPTIONS}
            selected={item.payment_type}
            onChange={(value) => onUpdate({ payment_type: value })}
            error={errors.payment_type}
          />
        </div>
      </div>

      <div className="mt-3">
        <label className="block text-xs font-medium text-slate-600 mb-1">Notes (Optional)</label>
        <input
          type="text"
          value={item.notes}
          onChange={(e) => onUpdate({ notes: e.target.value })}
          placeholder="e.g., March 2026 tuition"
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20"
        />
      </div>
    </div>
  )
}
