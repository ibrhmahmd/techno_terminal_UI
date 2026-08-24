import { useState, useEffect, useRef, startTransition } from 'react'
import { useTranslation } from 'react-i18next'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { PaymentMethodPills } from './PaymentMethodPills'
import type { PillOption } from './PaymentMethodPills'
import { useStudentsSearch } from '../../hooks/useDirectory'
import { useReceipts } from '../../hooks/finance'
import type { CreateReceiptRequest } from '../../api/finance'
import type { UnpaidEnrollment } from '../../api/crm/students/types/finance'
import type { Student } from '../../api/crm'
import { ReceiptLineItemRow } from './CreateReceipt/ReceiptLineItemRow'
import type { ReceiptLineItem } from './CreateReceipt/ReceiptLineItemRow'
import { SlideToConfirm } from './CreateReceipt/SlideToConfirm'

function usePaymentMethods(): PillOption[] {
  const { t } = useTranslation('finance')
  return [
    { value: 'cash', label: t('payment_methods.cash'), color: 'emerald', icon: 'payments' },
    { value: 'e_wallet', label: t('payment_methods.e_wallet'), color: 'red', icon: 'account_balance_wallet' },
    { value: 'instapay', label: t('payment_methods.instapay'), color: 'purple', icon: 'bolt' },
    { value: 'other', label: t('payment_methods.other'), color: 'slate', icon: 'more_horiz' },
  ]
}

const DRAFT_KEY = 'receipt-draft'
const PRESETS = [150, 500, 550, 600, 650, 700]

interface CreateReceiptPanelProps {
  isLoading: boolean
  onSuccess: (message: string, receiptId?: number) => void
  onError: (message: string) => void
  initialData?: UnpaidEnrollment | null
  onClearInitialData?: () => void
  onNavigateToUnpaid?: () => void
}

const VALID_METHODS = ['cash', 'e_wallet', 'instapay', 'other'] as const

function narrowMethod(value: string | null | undefined): 'cash' | 'e_wallet' | 'instapay' | 'other' {
  if (value && (VALID_METHODS as readonly string[]).includes(value)) return value as 'cash' | 'e_wallet' | 'instapay' | 'other'
  return 'cash'
}

function emptyLineItem(): ReceiptLineItem {
  return {
    id: Math.random().toString(36).substr(2, 9),
    studentSearch: '',
    selectedStudent: null,
    students: [],
    selectedEnrollment: null,
    amount: 0,
    payment_type: 'course_level',
    discount: 0,
    notes: '',
  }
}

function getSessionDraft(): Record<string, unknown> | null {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY)
    if (raw) {
      const draft = JSON.parse(raw)
      if (draft && typeof draft === 'object') return draft as Record<string, unknown>
    }
  } catch { /* ignore */ }
  return null
}

function initFromDraft<T>(key: string, fallback: T): T {
  const d = getSessionDraft()
  if (d && key in d) return (d as Record<string, T>)[key]
  return fallback
}

export function CreateReceiptPanel({ isLoading, onSuccess, onError, initialData, onClearInitialData, onNavigateToUnpaid }: CreateReceiptPanelProps) {
  const { t } = useTranslation('finance')
  const PAYMENT_METHODS = usePaymentMethods()
  const { create, isCreating } = useReceipts()
  const [payerName, setPayerName] = useState(() => initFromDraft('payerName', ''))
  const [paymentMethod, setPaymentMethod] = useState<string | null>(() => initFromDraft<string | null>('paymentMethod', null))
  const [paymentMethodError, setPaymentMethodError] = useState<string | undefined>()
  const [notes, setNotes] = useState(() => initFromDraft('notes', ''))
  const [lineItems, setLineItems] = useState<ReceiptLineItem[]>(() => {
    const d = getSessionDraft()
    if (d && Array.isArray(d.lineItems) && d.lineItems.length > 0) return d.lineItems as ReceiptLineItem[]
    return [{ ...emptyLineItem(), id: '1' }]
  })
  const [activeLineItemId, setActiveLineItemId] = useState<string>(() => {
    const d = getSessionDraft()
    if (d && Array.isArray(d.lineItems) && d.lineItems.length > 0) return (d.lineItems as ReceiptLineItem[])[0].id
    return '1'
  })
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const [activeSearchItemId, setActiveSearchItemId] = useState<string | null>(null)
  const activeItem = lineItems.find(item => item.id === activeSearchItemId)
  const activeSearchQuery = activeItem ? activeItem.studentSearch : ''
  const { data: searchResults, isLoading: isSearchingStudents } = useStudentsSearch(activeSearchQuery)
  const [draftRestored] = useState(() => !!getSessionDraft())

  const totalAmount = lineItems.reduce((sum, item) => sum + (item.amount || 0), 0)

  // Draft auto-save
  const hasUnmounted = useRef(false)
  useEffect(() => {
    hasUnmounted.current = false
    const interval = setInterval(() => {
      if (hasUnmounted.current) return
      const draft = { payerName, paymentMethod, notes, lineItems }
      try {
        sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
      } catch { /* storage full */ }
    }, 10000)

    return () => {
      hasUnmounted.current = true
      clearInterval(interval)
    }
  }, [payerName, paymentMethod, notes, lineItems])

  // Initialize from initialData when provided (Pay button from Unpaid Enrollments)
  useEffect(() => {
    if (initialData) {
      startTransition(() => {
        const selectedStudent: Student = {
          id: initialData.student_id,
          full_name: initialData.student_name,
          phone: null,
          status: 'active',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        const selectedEnrollment = {
          enrollment_id: initialData.enrollment_id,
          group_id: initialData.group_id,
          group_name: initialData.group_name,
          level_number: initialData.level_number,
          amount_due: initialData.amount_due,
          discount_applied: initialData.discount_applied,
          amount_paid: initialData.total_paid,
          remaining_balance: initialData.remaining_balance,
          notes: null,
          status: 'active',
          enrolled_at: new Date().toISOString(),
        }

        setPayerName('')
        setPaymentMethod(null)
        setNotes('')
        setLineItems([{
          id: '1',
          studentSearch: initialData.student_name,
          selectedStudent,
          students: [selectedStudent],
          selectedEnrollment,
          amount: initialData.remaining_balance,
          payment_type: 'course_level',
          discount: 0,
          notes: '',
        }])
        onClearInitialData?.()
      })
    }
  }, [initialData, onClearInitialData])

  // Sync search results to the active line item
  useEffect(() => {
    if (activeSearchItemId && searchResults) {
      startTransition(() => {
        setLineItems(prev => prev.map(item =>
          item.id === activeSearchItemId
            ? { ...item, students: searchResults }
            : item
        ))
      })
    }
  }, [activeSearchItemId, searchResults])

  const handleAddLineItem = () => {
    const newItem = emptyLineItem()
    setLineItems(prev => [...prev, newItem])
    setActiveLineItemId(newItem.id)
  }

  const handleRemoveLineItem = (id: string) => {
    if (lineItems.length === 1) {
      onError(t('receipt.minimum_line_items'))
      return
    }
    setLineItems(prev => {
      const filtered = prev.filter(item => item.id !== id)
      if (activeLineItemId === id) {
        setActiveLineItemId(filtered[0].id)
      }
      return filtered
    })
  }

  const handleUpdateLineItem = (id: string, updates: Partial<ReceiptLineItem>) => {
    setLineItems(prev => prev.map(item => {
      if (item.id !== id) return item

      if (updates.studentSearch !== undefined && updates.studentSearch !== item.studentSearch) {
        setActiveSearchItemId(id)
        return { ...item, ...updates, students: [] }
      }

      return { ...item, ...updates }
    }))
  }

  const validate = (): boolean => {
    let valid = true

    // Validate payment method
    if (!paymentMethod) {
      setPaymentMethodError(t('receipt.select_payment_method'))
      valid = false
    } else {
      setPaymentMethodError(undefined)
    }

    // Validate line items
    const newErrors: Record<string, Record<string, string | undefined>> = {}
    lineItems.forEach((item) => {
      const itemErrors: Record<string, string | undefined> = {}
      if (!item.selectedStudent) {
        itemErrors.student = t('receipt.select_student')
        valid = false
      }
      if (item.amount <= 0) {
        itemErrors.amount = t('receipt.amount_required')
        valid = false
      }
      if (Object.keys(itemErrors).length > 0) {
        newErrors[item.id] = itemErrors
      }
    })

    return valid
  }

  const handleOpenConfirm = () => {
    if (!validate()) return

    const validItems = lineItems.filter(item => item.selectedStudent && item.amount > 0)

    const itemsWithoutEnrollment = validItems.filter(item => !item.selectedEnrollment)
    if (itemsWithoutEnrollment.length > 0) {
      onError(t('receipt.select_enrollment'))
      return
    }

    setShowConfirmModal(true)
  }

  const handleCreateReceipt = async () => {
    setShowConfirmModal(false)
    const validItems = lineItems.filter(item => item.selectedStudent && item.amount > 0)

    onError('')
    try {
      const request: CreateReceiptRequest = {
        payer_name: payerName || null,
        method: narrowMethod(paymentMethod),
        notes: notes || null,
        allow_credit: true,
        lines: validItems.map((item, index) => ({
          id: index + 1,
          student_id: item.selectedStudent!.id,
          enrollment_id: item.selectedEnrollment?.enrollment_id,
          amount: item.amount,
          transaction_type: 'charge',
          payment_type: 'course_level',
          discount: item.discount || 0,
          notes: item.notes || undefined,
        })),
      }

      const result = await create(request)
      onSuccess(t('receipt.receipt_created', { number: result.receipt_number }), result.receipt_id)

      // Clear draft on success
      sessionStorage.removeItem(DRAFT_KEY)

      // Reset form
      setPayerName('')
      setPaymentMethod(null)
      setPaymentMethodError(undefined)
      setNotes('')
      setLineItems([{ ...emptyLineItem(), id: '1' }])
      setActiveLineItemId('1')
    } catch (err) {
      onError(err instanceof Error ? err.message : t('receipt.receipt_failed'))
    }
  }

  const selectedMethodObj = PAYMENT_METHODS.find(m => m.value === paymentMethod)
  const activeItemForSidebar = lineItems.find(item => item.id === activeLineItemId) || lineItems[0]

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 relative">
      <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <h2 className="font-headline text-xl font-bold text-on-surface">{t('receipt.create')}</h2>
          {draftRestored && (
            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium animate-pulse">
              {t('receipt.draft_restored')}
            </span>
          )}
        </div>
        {onNavigateToUnpaid && (
          <button
            type="button"
            onClick={onNavigateToUnpaid}
            className="text-sm text-secondary hover:text-secondary/80 flex items-center gap-1.5 font-bold transition-colors bg-secondary/5 px-3 py-1.5 rounded-xl border border-secondary/10"
          >
            <span className="material-symbols-outlined text-base font-bold" aria-hidden="true">warning</span>
            {t('receipt.pay_from_unpaid')}
          </button>
        )}
      </div>

      {/* POS Two-Column Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Column: Form Details */}
        <div className="lg:col-span-3 space-y-6">
          {/* Line Items */}
          <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-200/50 space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-bold text-slate-800 uppercase tracking-wider">{t('receipt.line_items')}</label>
              <button
                onClick={handleAddLineItem}
                className="text-xs font-bold text-secondary hover:text-secondary/80 flex items-center gap-1 transition-colors bg-secondary/5 px-3 py-1.5 rounded-lg border border-secondary/15 active:scale-95 duration-100"
              >
                <span className="material-symbols-outlined text-sm font-bold" aria-hidden="true">add</span>
                {t('receipt.add_student')}
              </button>
            </div>

            <div className="space-y-4">
              {lineItems.map((item, index) => (
                <ReceiptLineItemRow
                  key={item.id}
                  item={item}
                  index={index}
                  isActive={activeLineItemId === item.id}
                  onFocus={() => setActiveLineItemId(item.id)}
                  onUpdate={(updates) => handleUpdateLineItem(item.id, updates)}
                  onRemove={() => handleRemoveLineItem(item.id)}
                  isSearchingStudents={activeSearchItemId === item.id && isSearchingStudents}
                />
              ))}
            </div>
          </div>

          {/* Optional Details (Payer & Notes) */}
          <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-200/50 space-y-4">
            <label className="block text-sm font-bold text-slate-800 uppercase tracking-wider">{t('receipt.payer_notes')}</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t('receipt.payer_name_optional')}</label>
                <input
                  type="text"
                  value={payerName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPayerName(e.target.value)}
                  placeholder={t('receipt.payer_name_placeholder')}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm transition-shadow focus:ring-2 focus:ring-secondary/20 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{t('receipt.general_notes_optional')}</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNotes(e.target.value)}
                  placeholder={t('receipt.general_notes_placeholder')}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm transition-shadow focus:ring-2 focus:ring-secondary/20 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Checkout Sidebar (Sticky) */}
        <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-6">
          {/* Active Student Monetary Editor */}
          {activeItemForSidebar && activeItemForSidebar.selectedStudent && activeItemForSidebar.selectedEnrollment ? (
            <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-200/50 space-y-4 animate-fadeIn">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider pb-2 border-b border-slate-200/40 truncate" title={activeItemForSidebar.selectedStudent.full_name}>
                {t('receipt.payment')}: <span className="text-slate-850 font-extrabold">{activeItemForSidebar.selectedStudent.full_name}</span>
              </h3>

              {/* Suggestions presets (Placed above Amount input) */}
              <div className="text-start">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider select-none block mb-1.5">{t('receipt.suggestions')}</span>
                <div className="flex flex-wrap gap-1.5 items-center">
                  {activeItemForSidebar.selectedEnrollment.remaining_balance > 0 && (
                    <button
                      type="button"
                      onClick={() => handleUpdateLineItem(activeItemForSidebar.id, { amount: activeItemForSidebar.selectedEnrollment!.remaining_balance })}
                      className="text-xs px-3 py-1.5 rounded-xl border border-secondary/35 bg-secondary/5 text-secondary hover:bg-secondary/10 hover:border-secondary transition-all font-extrabold active:scale-95 duration-100"
                    >
                      {t('receipt.remaining_balance')} ({activeItemForSidebar.selectedEnrollment.remaining_balance.toFixed(0)})
                    </button>
                  )}
                  {PRESETS.filter(p => p < activeItemForSidebar.selectedEnrollment!.remaining_balance).map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => handleUpdateLineItem(activeItemForSidebar.id, { amount: p })}
                      className="text-xs px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all font-extrabold active:scale-95 duration-100"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <label htmlFor="sidebar-amount" className="block text-[11px] font-bold uppercase tracking-wider text-slate-555 mb-1.5">{t('receipt.amount_to_pay')}</label>
                <div className="relative">
                  <input
                    id="sidebar-amount"
                    type="number"
                    min={0}
                    value={activeItemForSidebar.amount || ''}
                    onChange={(e) => handleUpdateLineItem(activeItemForSidebar.id, { amount: parseFloat(e.target.value) || 0 })}
                    onWheel={(e) => (e.target as HTMLInputElement).blur()}
                    onKeyDown={(e) => { if (e.key === 'ArrowUp' || e.key === 'ArrowDown') e.preventDefault() }}
                    placeholder="0.00"
                    className={`w-full py-2.5 px-3.5 pe-12 border rounded-xl text-base font-bold focus:outline-none focus:ring-2 transition-all ${
                      activeItemForSidebar.amount > activeItemForSidebar.selectedEnrollment.remaining_balance
                        ? 'border-rose-500 focus:ring-rose-500/20 text-rose-700 bg-rose-50/5'
                        : (activeItemForSidebar.amount === activeItemForSidebar.selectedEnrollment.remaining_balance && activeItemForSidebar.amount > 0)
                          ? 'border-emerald-500 focus:ring-emerald-500/20 text-emerald-700 bg-emerald-50/5'
                          : (activeItemForSidebar.amount > 0 && activeItemForSidebar.amount < activeItemForSidebar.selectedEnrollment.remaining_balance)
                            ? 'border-amber-400 focus:ring-amber-500/20 text-amber-700 bg-amber-50/5'
                            : 'border-slate-200 focus:ring-secondary/20 text-slate-900 bg-white'
                    }`}
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-450">{t('currency')}</span>
                </div>

                {/* Overpayment Warning */}
                {activeItemForSidebar.amount > activeItemForSidebar.selectedEnrollment.remaining_balance && (
                  <p className="text-[10px] text-rose-600 mt-1.5 flex items-start gap-1 animate-fadeIn font-semibold leading-tight text-start">
                    <span className="material-symbols-outlined text-[12px] shrink-0 select-none mt-0.5">warning</span>
                    <span>{t('receipt.overpayment_warning', { amount: activeItemForSidebar.selectedEnrollment.remaining_balance.toFixed(0) })}</span>
                  </p>
                )}
                {/* Perfect Match */}
                {activeItemForSidebar.amount === activeItemForSidebar.selectedEnrollment.remaining_balance && activeItemForSidebar.amount > 0 && (
                  <p className="text-[10px] text-emerald-600 mt-1.5 flex items-center gap-1 animate-fadeIn font-semibold text-start">
                    <span className="material-symbols-outlined text-[14px] shrink-0 select-none">check_circle</span>
                    <span>{t('receipt.perfect_match')}</span>
                  </p>
                )}
                {/* Partial Match */}
                {activeItemForSidebar.amount > 0 && activeItemForSidebar.amount < activeItemForSidebar.selectedEnrollment.remaining_balance && (
                  <p className="text-[10px] text-amber-600 mt-1.5 flex items-center gap-1 animate-fadeIn font-semibold text-start">
                    <span className="material-symbols-outlined text-[14px] shrink-0 select-none">info</span>
                    <span>{t('receipt.partial_payment')}</span>
                  </p>
                )}
              </div>

              {/* Discount Input */}
              <div>
                <label htmlFor="sidebar-discount" className="block text-[11px] font-bold uppercase tracking-wider text-slate-555 mb-1.5 text-start">{t('receipt.discount')}</label>
                <div className="relative">
                  <input
                    id="sidebar-discount"
                    type="number"
                    min={0}
                    value={activeItemForSidebar.discount || ''}
                    onChange={(e) => handleUpdateLineItem(activeItemForSidebar.id, { discount: parseFloat(e.target.value) || 0 })}
                    onWheel={(e) => (e.target as HTMLInputElement).blur()}
                    onKeyDown={(e) => { if (e.key === 'ArrowUp' || e.key === 'ArrowDown') e.preventDefault() }}
                    placeholder="0.00"
                    className="w-full py-2 px-3 pe-12 border border-slate-200 rounded-xl text-base font-bold focus:outline-none focus:ring-2 focus:ring-secondary/20 text-slate-900 bg-white transition-all text-start"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-450">EGP</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-200/50 text-center text-slate-400 text-[11px] py-8">
              <span className="material-symbols-outlined text-3xl text-slate-300 block mb-1">payments</span>
              {t('receipt.select_student_first')}
            </div>
          )}

          {/* Payment Method Selector */}
          <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-200/50">
            <PaymentMethodPills
              label={t('receipt.payment_method')}
              options={PAYMENT_METHODS}
              selected={paymentMethod}
              onChange={(value) => { setPaymentMethod(value); setPaymentMethodError(undefined) }}
              error={paymentMethodError}
            />
          </div>

          {/* POS Summary Box (Light Mode) */}
          <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl shadow-sm space-y-4 text-slate-800 text-start">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider pb-2.5 border-b border-slate-200/60">{t('receipt.pos_checkout_summary')}</h3>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-medium">{t('receipt.payment_mode')}</span>
                <span className="font-semibold text-slate-850">{selectedMethodObj?.label || t('receipt.not_selected')}</span>
              </div>
              {payerName && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">{t('receipt.payer')}</span>
                  <span className="font-semibold text-slate-850 truncate max-w-[120px]">{payerName}</span>
                </div>
              )}

              {lineItems.some(i => i.selectedStudent && i.selectedEnrollment) && (
                <div className="pt-2 border-t border-slate-200/60 space-y-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-start">{t('receipt.breakdown')}</p>
                  {lineItems.filter(i => i.selectedStudent && i.selectedEnrollment).map(i => {
                    const remaining = i.selectedEnrollment!.remaining_balance
                    const payAmount = i.amount || 0
                    const disc = i.discount || 0
                    const newBal = Math.max(0, remaining - payAmount)

                    return (
                      <div key={i.id} className="bg-white/50 border border-slate-200/60 rounded-xl p-3 text-xs space-y-1.5 shadow-sm text-slate-750 text-start">
                        <div className="flex justify-between items-start">
                          <a 
                            href={`/students/${i.selectedStudent!.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="font-bold text-slate-850 hover:text-secondary hover:underline flex items-center gap-0.5 truncate max-w-[140px]"
                          >
                            {i.selectedStudent!.full_name}
                            <span className="material-symbols-outlined text-[12px] text-slate-400 select-none">open_in_new</span>
                          </a>
                          <span className="font-extrabold text-slate-900">{payAmount.toFixed(0)} {t('currency')}</span>
                        </div>
                        <div className="flex justify-between text-[11px] text-slate-500">
                          <a 
                            href={`/groups/${i.selectedEnrollment!.group_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="hover:text-secondary hover:underline flex items-center gap-0.5 truncate max-w-[145px]"
                          >
                            {i.selectedEnrollment!.group_name}
                            <span className="material-symbols-outlined text-[10px] text-slate-400 select-none">open_in_new</span>
                          </a>
                          <span>LVL {i.selectedEnrollment!.level_number}</span>
                        </div>
                        <div className="pt-1.5 border-t border-slate-200/40 grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px] text-slate-500">
                          <div>{t('receipt.current_remaining')} <span className="font-semibold text-slate-700">{remaining.toFixed(0)} {t('currency')}</span></div>
                          {disc > 0 && <div className="text-end">{t('receipt.discount_label')} <span className="font-semibold text-slate-700">{disc.toFixed(0)} {t('currency')}</span></div>}
                          <div className="col-span-2 mt-0.5 pt-0.5 border-t border-dashed border-slate-200/50 flex justify-between font-bold">
                            <span>{t('receipt.new_balance')}</span>
                            <span className={newBal === 0 ? 'text-emerald-600 font-extrabold' : 'text-slate-800 font-extrabold'}>
                              {newBal.toFixed(0)} {t('currency')}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              <div className="pt-3 border-t border-slate-200/60 flex justify-between items-baseline">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">{t('receipt.total')}</span>
                <span className="text-3xl font-black text-slate-900">{totalAmount.toFixed(2)} <span className="text-xs font-normal text-slate-500">{t('currency')}</span></span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleOpenConfirm}
              disabled={isLoading || isCreating || totalAmount === 0}
              className="w-full py-3.5 bg-secondary text-white rounded-xl font-extrabold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-secondary/90 transition-all flex items-center justify-center gap-2 shadow-md active:scale-[0.98] duration-100 text-sm"
            >
              {(isLoading || isCreating) ? <LoadingSpinner size="sm" /> : null}
              <span className="material-symbols-outlined text-lg" aria-hidden="true">receipt</span>
              {t('receipt.create')}
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl w-full max-w-md p-6 overflow-hidden animate-scaleIn">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-full bg-secondary/10 text-secondary">
                <span className="material-symbols-outlined text-2xl block">lock</span>
              </div>
              <div>
                <h3 className="font-headline text-lg font-bold text-slate-900">{t('receipt.confirm_payment')}</h3>
                <p className="text-xs text-slate-500">{t('receipt.confirm_review')}</p>
              </div>
            </div>

            <div className="space-y-3.5 my-5">
              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 space-y-2">
                <div className="flex justify-between items-center text-sm border-b border-slate-200/50 pb-2">
                  <span className="text-slate-500 font-medium">{t('receipt.payment_method')}</span>
                  <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-${selectedMethodObj?.color}-50 text-${selectedMethodObj?.color}-700 border border-${selectedMethodObj?.color}-200`}>
                    <span className="material-symbols-outlined text-sm">{selectedMethodObj?.icon}</span>
                    {selectedMethodObj?.label}
                  </span>
                </div>
                {payerName && (
                  <div className="flex justify-between text-sm border-b border-slate-200/50 pb-2">
                    <span className="text-slate-500 font-medium">{t('receipt.payer_name')}</span>
                    <span className="font-semibold text-slate-800 truncate max-w-[200px]">{payerName}</span>
                  </div>
                )}
                {notes && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500 font-medium">{t('receipt.notes')}</span>
                    <span className="text-slate-700 italic text-xs truncate max-w-[200px]">{notes}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2 max-h-[160px] overflow-y-auto pe-1">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('receipt.line_items')}</p>
                {lineItems.filter(item => item.selectedStudent && item.amount > 0).map((item) => (
                  <div key={item.id} className="bg-slate-50/50 border border-slate-200/60 rounded-xl p-3 flex flex-col gap-1 text-sm">
                    <div className="flex justify-between font-bold text-slate-800">
                      <span>{item.selectedStudent?.full_name}</span>
                      <span>{item.amount.toFixed(2)} {t('currency')}</span>
                    </div>
                    {item.selectedEnrollment && (
                      <div className="flex justify-between text-xs text-slate-500 font-medium">
                        <span>{item.selectedEnrollment.group_name}</span>
                        <span>Level {item.selectedEnrollment.level_number}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-end">
                <div>
                  <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">{t('receipt.total_charge')}</span>
                  <p className="text-xl font-bold text-slate-800">{totalAmount.toFixed(2)} {t('currency')}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4 mt-6">
              {isLoading || isCreating ? (
                <div className="flex items-center justify-center gap-2 py-3 bg-slate-50 border border-slate-100 rounded-full text-slate-500 font-bold text-sm">
                  <LoadingSpinner size="sm" />
                  <span>{t('receipt.creating_receipt')}</span>
                </div>
              ) : (
                <SlideToConfirm 
                  onConfirm={handleCreateReceipt} 
                  label={t('receipt.slide_to_confirm')} 
                />
              )}
              <button
                type="button"
                disabled={isLoading || isCreating}
                onClick={() => setShowConfirmModal(false)}
                className="w-full py-2 text-xs font-semibold text-slate-450 hover:text-slate-600 transition-colors text-center disabled:opacity-40"
              >
                {t('receipt.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
