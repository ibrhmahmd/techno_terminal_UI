import type { Student } from '../../../api/crm'
import type { StudentEnrollmentInfo } from '../../../hooks/finance/useStudentEnrollments'
import { EnrollmentSelection } from './EnrollmentSelection'
import { StudentCombobox } from '../../common/combobox'

export interface ReceiptLineItem {
  id: string
  studentSearch: string
  selectedStudent: Student | null
  students: Student[]
  selectedEnrollment: StudentEnrollmentInfo | null
  amount: number
  payment_type: 'course_level' | 'competition' | 'materials' | 'registration' | 'other'
  discount: number
  notes: string
}

const ITEM_TYPES = [
  { value: 'course_level', label: 'Tuition (Course Level)' },
  { value: 'competition', label: 'Competition' },
  { value: 'materials', label: 'Materials' },
  { value: 'registration', label: 'Registration' },
  { value: 'other', label: 'Other' }
] as const

interface ReceiptLineItemRowProps {
  item: ReceiptLineItem
  index: number
  onUpdate: (updates: Partial<ReceiptLineItem>) => void
  onRemove: () => void
  isSearchingStudents?: boolean
}

export function ReceiptLineItemRow({ 
  item, 
  index, 
  onUpdate, 
  onRemove,
  isSearchingStudents = false
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Student Selection */}
        <div className="lg:col-span-2">
          <StudentCombobox
            value={item.selectedStudent}
            onChange={(student) => onUpdate({ 
              selectedStudent: student, 
              studentSearch: student?.full_name || '', 
              students: [],
              selectedEnrollment: null  // Reset enrollment when student changes
            })}
            search={item.studentSearch}
            setSearch={(search) => onUpdate({ studentSearch: search })}
            students={item.students}
            isLoading={isSearchingStudents}
          />
        </div>

        {/* Enrollment Selection - Shows when student is selected */}
        {item.selectedStudent && (
          <EnrollmentSelection
            studentId={item.selectedStudent.id}
            selectedEnrollment={item.selectedEnrollment}
            onSelect={(enrollment) => onUpdate({ selectedEnrollment: enrollment })}
          />
        )}

        {/* Amount */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Amount (EGP)</label>
          <input
            type="number"
            min={0}
            value={item.amount || ''}
            onChange={(e) => onUpdate({ amount: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20"
          />
        </div>

        {/* Payment Type */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Payment Type</label>
          <select
            value={item.payment_type}
            onChange={(e) => onUpdate({ payment_type: e.target.value as ReceiptLineItem['payment_type'] })}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-secondary/20"
          >
            {ITEM_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Notes */}
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
