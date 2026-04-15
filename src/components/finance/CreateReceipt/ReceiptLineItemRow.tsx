import type { Student } from '../../../api/crm'
import type { StudentEnrollmentInfo } from '../../../hooks/finance/useStudentEnrollments'
import { EnrollmentSelection } from './EnrollmentSelection'

export interface ReceiptLineItem {
  id: string
  studentSearch: string
  selectedStudent: Student | null
  students: Student[]
  selectedEnrollment: StudentEnrollmentInfo | null
  amount: number
  type: 'tuition' | 'materials' | 'registration' | 'other' | 'competition'
  discount: number
  description: string
}

const ITEM_TYPES = [
  { value: 'tuition', label: 'Tuition (Course Level)' },
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
  onSearchStudents: (search: string) => void
}

export function ReceiptLineItemRow({ 
  item, 
  index, 
  onUpdate, 
  onRemove, 
  onSearchStudents 
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
          <label className="block text-xs font-medium text-slate-600 mb-1">Student</label>
          {item.selectedStudent ? (
            <div className="flex items-center justify-between p-2 bg-white rounded border border-slate-200">
              <span className="text-sm font-medium">{item.selectedStudent.full_name}</span>
              <button
                onClick={() => onUpdate({ selectedStudent: null, studentSearch: '', selectedEnrollment: null, students: [] })}
                className="text-red-500 hover:text-red-700 text-xs font-medium"
              >
                Change
              </button>
            </div>
          ) : (
            <div className="relative">
              <input
                type="text"
                value={item.studentSearch}
                onChange={(e) => onSearchStudents(e.target.value)}
                placeholder="Search student (min 2 chars)..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20"
              />
              {item.students.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden max-h-48 overflow-y-auto">
                  {item.students.map(s => (
                    <button
                      key={s.id}
                      onClick={() => onUpdate({ selectedStudent: s, studentSearch: s.full_name, students: [] })}
                      className="w-full px-3 py-2 text-left hover:bg-slate-50 border-b border-slate-100 last:border-0 text-sm transition-colors"
                    >
                      <div className="font-medium">{s.full_name}</div>
                      {s.phone && <div className="text-[10px] text-slate-400">{s.phone}</div>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
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

        {/* Type */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Type</label>
          <select
            value={item.type}
            onChange={(e) => onUpdate({ type: e.target.value as ReceiptLineItem['type'] })}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-secondary/20"
          >
            {ITEM_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Description */}
      <div className="mt-3">
        <label className="block text-xs font-medium text-slate-600 mb-1">Description (Optional)</label>
        <input
          type="text"
          value={item.description}
          onChange={(e) => onUpdate({ description: e.target.value })}
          placeholder="e.g., March 2026 tuition"
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20"
        />
      </div>
    </div>
  )
}
