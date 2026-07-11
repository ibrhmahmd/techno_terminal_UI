import { useEffect } from 'react'
import { useStudentEnrollments } from '../../../hooks/finance/useStudentEnrollments'
import type { StudentEnrollmentInfo } from '../../../hooks/finance/useStudentEnrollments'

interface EnrollmentSelectionProps {
  studentId: number
  selectedEnrollment: StudentEnrollmentInfo | null
  onSelect: (enrollment: StudentEnrollmentInfo | null) => void
}

function getLevelCircleStyle(level: number) {
  switch (level) {
    case 1:
      return "bg-blue-600 border-blue-400 text-white"
    case 2:
      return "bg-purple-600 border-purple-400 text-white"
    case 3:
      return "bg-emerald-600 border-emerald-400 text-white"
    case 4:
      return "bg-amber-600 border-amber-400 text-white"
    default:
      return "bg-slate-600 border-slate-400 text-white"
  }
}

export function EnrollmentSelection({ studentId, selectedEnrollment, onSelect }: EnrollmentSelectionProps) {
  const { enrollments, loading, error } = useStudentEnrollments(studentId)

  // Auto-select if only one enrollment
  useEffect(() => {
    if (enrollments.length === 1 && !selectedEnrollment) {
      onSelect(enrollments[0])
    }
  }, [enrollments, selectedEnrollment, onSelect])

  if (loading) {
    return (
      <div className="w-full">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">الاشتراك</label>
        <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-500">
          <span className="animate-spin rounded-full h-4 w-4 border-2 border-slate-500 border-t-transparent" />
          جاري تحميل الاشتراكات...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">الاشتراك</label>
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 flex items-center gap-2">
          <span className="material-symbols-outlined text-base">error</span>
          {error}
        </div>
      </div>
    )
  }

  if (enrollments.length === 0) {
    return (
      <div className="w-full">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">الاشتراك</label>
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700 flex items-center gap-2">
          <span className="material-symbols-outlined text-base">warning</span>
          لم يتم العثور على اشتراكات نشطة لهذا الطالب
        </div>
      </div>
    )
  }

  const gridClass = enrollments.length === 1
    ? "grid grid-cols-1 max-w-sm gap-3.5"
    : enrollments.length === 2
      ? "grid grid-cols-1 sm:grid-cols-2 max-w-2xl gap-3.5"
      : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5"

  return (
    <div className="w-full">
      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
        {enrollments.length === 1 ? 'الاشتراك (محدد تلقائياً)' : 'اختر الاشتراك *'}
      </label>

      {/* Warning Banner Placement (above the cards grid) */}
      {selectedEnrollment && selectedEnrollment.remaining_balance <= 0 && (
        <div className="mb-4 p-4 bg-rose-50 border-l-4 border-rose-500 rounded-r-xl text-sm text-rose-905 flex items-start gap-3 shadow-sm animate-fadeIn" dir="rtl">
          <span className="material-symbols-outlined text-rose-600 shrink-0 text-xl font-bold select-none animate-bounce" aria-hidden="true">warning</span>
          <div className="text-right">
            <span className="font-bold block mb-0.5 text-rose-900">تحذير: اشتراك مدفوع بالكامل</span>
            المستوى المختار لـ <strong className="font-extrabold">{selectedEnrollment.group_name}</strong> مدفوع بالكامل بالفعل (المتبقي 0.00 جنيه). تسجيل دفعة جديدة سيؤدي إلى دفع زائد. يرجى التأكيد مع ولي الأمر قبل المتابعة.
          </div>
        </div>
      )}

      <div className={gridClass}>
        {enrollments.map((enrollment) => {
          const isSelected = selectedEnrollment?.enrollment_id === enrollment.enrollment_id
          const hasOutstanding = enrollment.remaining_balance > 0
          const isZeroOrNegative = enrollment.remaining_balance <= 0

          // Style definitions based on paid/unpaid status
          let cardStyle = "w-full p-4 rounded-xl border text-left transition-all duration-200 flex flex-col items-stretch gap-3 cursor-pointer select-none"
          if (isSelected) {
            if (isZeroOrNegative) {
              cardStyle += " border-emerald-500 bg-emerald-50/10 ring-1 ring-emerald-500 shadow-sm"
            } else {
              cardStyle += " border-rose-500 bg-rose-50/10 ring-1 ring-rose-500 shadow-sm"
            }
          } else {
            if (isZeroOrNegative) {
              cardStyle += " border-emerald-200 bg-white hover:border-emerald-350 hover:shadow-sm opacity-80"
            } else {
              cardStyle += " border-rose-200 bg-white hover:border-rose-350 hover:shadow-sm"
            }
          }

          return (
            <div key={enrollment.enrollment_id} className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => onSelect(enrollment)}
                className={cardStyle}
              >
                <div className="flex gap-3.5 items-start">
                  {/* Circular Level Badge */}
                  <div className={`w-12 h-12 rounded-full shrink-0 flex flex-col items-center justify-center border-2 font-headline shadow-sm ${getLevelCircleStyle(enrollment.level_number)}`}>
                    <span className="text-[10px] uppercase font-bold tracking-wider leading-none">LVL</span>
                    <span className="text-base font-extrabold leading-none mt-0.5">{enrollment.level_number}</span>
                  </div>

                  {/* Enrollment Details */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <a
                        href={`/groups/${enrollment.group_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="font-semibold text-slate-800 text-sm leading-tight hover:text-secondary hover:underline flex items-center gap-1 text-left"
                      >
                        {enrollment.group_name}
                        <span className="material-symbols-outlined text-[14px] text-slate-400 select-none">open_in_new</span>
                      </a>
                      {/* Payment Status Badge */}
                      {hasOutstanding ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-600 text-white border border-rose-500 shadow-sm uppercase tracking-wider shrink-0 select-none">
                          غير مدفوع
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-600 text-white border border-emerald-500 shadow-sm uppercase tracking-wider shrink-0 select-none">
                          مدفوع
                        </span>
                      )}
                    </div>

                    {enrollment.course_name && enrollment.course_name !== enrollment.group_name && (
                      <p className="text-xs text-slate-500 font-medium truncate text-left">
                        Course: {enrollment.course_name}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-400">
                      {/* Enrollment status tag in meta row */}
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold border ${
                        enrollment.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' :
                        enrollment.status === 'completed' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {enrollment.status ? enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1) : 'Active'}
                      </span>
                      <span>•</span>
                      <a
                        href={`/enrollments?tab=modify`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-100 text-slate-600 hover:bg-secondary/15 hover:text-secondary border border-slate-200 transition-colors"
                        title="تعديل الاشتراك"
                      >
                        <span className="material-symbols-outlined text-[12px]">edit_document</span>
                        تعديل
                      </a>
                      <span>•</span>
                      {enrollment.instructor_name && (
                        <>
                          <span className="truncate max-w-[120px]">Instructor: {enrollment.instructor_name}</span>
                          <span>•</span>
                        </>
                      )}
                      <span>Joined: {new Date(enrollment.enrolled_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-slate-100 my-0.5" />

                {/* Billing Summary Bar */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className={`material-symbols-outlined text-[18px] ${isSelected ? 'text-secondary font-bold' : 'text-slate-300'}`}>
                      {isSelected ? 'radio_button_checked' : 'radio_button_unchecked'}
                    </span>
                    <span className="text-xs font-medium text-slate-500">
                      {isSelected ? 'محدد' : 'تحديد'}
                    </span>
                  </div>

                  <div className="text-right">
                    {hasOutstanding ? (
                      <span className="text-xs font-bold text-rose-600" dir="rtl">
                        متبقي {enrollment.remaining_balance.toFixed(0)} ج.م
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-emerald-600" dir="rtl">
                        متبقي 0 ج.م
                      </span>
                    )}
                  </div>
                </div>

                {enrollment.notes && (
                  <div className="p-2 bg-slate-50 border border-slate-100 rounded-lg text-slate-500 text-[11px] truncate flex items-center gap-1.5 select-text text-left">
                    <span className="material-symbols-outlined text-[14px] shrink-0 text-slate-400">info</span>
                    <span className="truncate">Note: {enrollment.notes}</span>
                  </div>
                )}

                {isSelected && (
                  <div className="mt-1 pt-3 border-t border-slate-200/60 grid grid-cols-3 gap-2 text-center text-xs animate-fadeIn">
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <span className="block text-slate-400 font-medium mb-0.5">إجمالي الرسوم</span>
                      <span className="font-semibold text-slate-700">{(enrollment.amount_due ?? 0).toFixed(2)} ج.م</span>
                    </div>
                    <div className="bg-emerald-50/30 p-2 rounded-lg border border-emerald-100/50">
                      <span className="block text-emerald-600 font-medium mb-0.5">المدفوع بالفعل</span>
                      <span className="font-semibold text-emerald-700">{enrollment.amount_paid.toFixed(2)} ج.م</span>
                    </div>
                    <div className={`${hasOutstanding ? 'bg-rose-50/40 border-rose-100/50' : 'bg-emerald-50/20 border-emerald-100/50'} p-2 rounded-lg border`}>
                      <span className="block text-slate-550 font-medium mb-0.5">المتبقي</span>
                      <span className={`font-bold ${hasOutstanding ? 'text-rose-700' : 'text-emerald-700'}`}>
                        {enrollment.remaining_balance.toFixed(2)} ج.م
                      </span>
                    </div>
                  </div>
                )}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
