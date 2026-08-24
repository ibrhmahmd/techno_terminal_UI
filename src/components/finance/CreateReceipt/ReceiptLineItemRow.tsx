import { useTranslation } from 'react-i18next'
import type { StudentListItem } from '../../../api/crm'
import type { StudentEnrollmentInfo } from '../../../hooks/finance/useStudentEnrollments'
import { EnrollmentSelection } from './EnrollmentSelection'
import { StudentCombobox } from '../../student/StudentCombobox'

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

interface ReceiptLineItemRowProps {
  item: ReceiptLineItem
  index: number
  isActive: boolean
  onFocus: () => void
  onUpdate: (updates: Partial<ReceiptLineItem>) => void
  onRemove: () => void
  isSearchingStudents?: boolean
}

export function ReceiptLineItemRow({
  item,
  index,
  isActive,
  onFocus,
  onUpdate,
  onRemove,
  isSearchingStudents = false,
}: ReceiptLineItemRowProps) {
  const { t } = useTranslation('finance')
  let wrapperClass = "p-5 rounded-2xl border transition-all duration-150 space-y-4"
  if (isActive) {
    wrapperClass += " border-secondary bg-secondary/[0.01] ring-1 ring-secondary shadow-sm"
  } else {
    wrapperClass += " border-slate-200 bg-white hover:border-slate-350 hover:bg-slate-50/50 cursor-pointer"
  }

  return (
    <div
      onClick={() => { if (!isActive) onFocus() }}
      className={wrapperClass}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{t('line_item.student', { index: index + 1 })}</span>
          {isActive && (
            <span className="text-[10px] font-bold bg-secondary text-white px-2 py-0.5 rounded-full uppercase tracking-wider select-none">{t('line_item.active')}</span>
          )}
        </div>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="text-red-500 hover:text-red-700 transition-colors p-1 hover:bg-red-50 rounded"
          title={t('line_item.remove')}
        >
          <span className="material-symbols-outlined text-sm block font-bold" aria-hidden="true">delete</span>
        </button>
      </div>

      {isActive ? (
        <div className="space-y-4 select-text">
          {/* Step 1: Student Combobox */}
          <div className="w-full">
            {!item.selectedStudent && (
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">{t('line_item.select_student')}</label>
            )}
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
          </div>

          {/* Step 2: Enrollment Grid Selection */}
          {item.selectedStudent && (
            <div className="w-full pt-1">
              <EnrollmentSelection
                studentId={item.selectedStudent.id}
                selectedEnrollment={item.selectedEnrollment}
                onSelect={(enrollment) => {
                  const updates: Partial<ReceiptLineItem> = {
                    selectedEnrollment: enrollment,
                  }
                  if (enrollment) {
                    if (enrollment.remaining_balance > 0) {
                      updates.amount = enrollment.remaining_balance
                    }
                    updates.payment_type = 'course_level'
                  }
                  onUpdate(updates)
                }}
              />
            </div>
          )}

          {/* Item Notes */}
          <div className="pt-2">
            <label htmlFor={`notes-${item.id}`} className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">{t('line_item.item_notes')}</label>
            <input
              id={`notes-${item.id}`}
              type="text"
              value={item.notes}
              onChange={(e) => onUpdate({ notes: e.target.value })}
              placeholder={t('line_item.item_notes_placeholder')}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20 transition-all select-text"
            />
          </div>
        </div>
      ) : (
        /* Inactive Summary View */
        <div className="space-y-2 select-none">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-headline font-semibold text-slate-800 text-sm">
                {item.selectedStudent?.full_name || t('line_item.no_student')}
              </h4>
              {item.selectedEnrollment && (
                <p className="text-xs text-slate-500 mt-0.5">
                  {item.selectedEnrollment.group_name} • Level {item.selectedEnrollment.level_number}
                </p>
              )}
            </div>
            <div className="text-end">
              <p className="text-sm font-bold text-slate-800">{item.amount.toFixed(2)} EGP</p>
              {item.discount > 0 && (
                <p className="text-[10px] text-emerald-600 font-semibold">Discount: -{item.discount.toFixed(0)} EGP</p>
              )}
            </div>
          </div>
          <p className="text-[11px] text-slate-400 font-medium italic">{t('line_item.click_to_edit')}</p>
        </div>
      )}
    </div>
  )
}
