import { useState, useEffect, useRef, startTransition } from 'react'
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

const PAYMENT_METHODS: PillOption[] = [
  { value: 'cash', label: 'Cash', color: 'emerald', icon: 'payments' },
  { value: 'e_wallet', label: 'E-Wallet', color: 'red', icon: 'account_balance_wallet' },
  { value: 'instapay', label: 'instaPay', color: 'purple', icon: 'bolt' },
  { value: 'other', label: 'Other', color: 'slate', icon: 'more_horiz' },
]

const DRAFT_KEY = 'receipt-draft'

interface CreateReceiptPanelProps {
  isLoading: boolean
  onSuccess: (message: string, receiptId?: number) => void
  onError: (message: string) => void
  initialData?: UnpaidEnrollment | null
  onClearInitialData?: () => void
  onNavigateToUnpaid?: () => void
}

const VALID_METHODS = ['cash', 'e_wallet', 'instapay', 'other'] as const
const VALID_TYPES = ['course_level', 'competition', 'other'] as const

function narrowMethod(value: string | null | undefined): 'cash' | 'e_wallet' | 'instapay' | 'other' {
  if (value && (VALID_METHODS as readonly string[]).includes(value)) return value as 'cash' | 'e_wallet' | 'instapay' | 'other'
  return 'cash'
}

function narrowType(value: string | null | undefined): 'course_level' | 'competition' | 'other' {
  if (value && (VALID_TYPES as readonly string[]).includes(value)) return value as 'course_level' | 'competition' | 'other'
  return 'course_level'
}

function emptyLineItem(): ReceiptLineItem {
  return {
    id: Math.random().toString(36).substr(2, 9),
    studentSearch: '',
    selectedStudent: null,
    students: [],
    selectedEnrollment: null,
    amount: 0,
    payment_type: null,
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
  const { create, previewRisk, isCreating, overpaymentRisk, clearOverpaymentRisk } = useReceipts()
  const [payerName, setPayerName] = useState(() => initFromDraft('payerName', ''))
  const [paymentMethod, setPaymentMethod] = useState<string | null>(() => initFromDraft<string | null>('paymentMethod', null))
  const [paymentMethodError, setPaymentMethodError] = useState<string | undefined>()
  const [notes, setNotes] = useState(() => initFromDraft('notes', ''))
  const [lineItems, setLineItems] = useState<ReceiptLineItem[]>(() => {
    const d = getSessionDraft()
    if (d && Array.isArray(d.lineItems) && d.lineItems.length > 0) return d.lineItems as ReceiptLineItem[]
    return [{ ...emptyLineItem(), id: '1' }]
  })
  const [lineItemErrors, setLineItemErrors] = useState<Record<string, Record<string, string | undefined>>>({})
  const [localOverpaymentRisk, setLocalOverpaymentRisk] = useState<{ has_risk: boolean; message?: string } | null>(null)

  const [activeSearchItemId, setActiveSearchItemId] = useState<string | null>(null)
  const [activeSearchQuery, setActiveSearchQuery] = useState('')
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
        setLocalOverpaymentRisk(null)
        clearOverpaymentRisk?.()
        onClearInitialData?.()
      })
    }
  }, [initialData, onClearInitialData, clearOverpaymentRisk])

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
    setLineItems(prev => [...prev, emptyLineItem()])
  }

  const handleRemoveLineItem = (id: string) => {
    if (lineItems.length === 1) {
      onError('Receipt must have at least one line item')
      return
    }
    setLineItems(prev => prev.filter(item => item.id !== id))
  }

  const handleUpdateLineItem = (id: string, updates: Partial<ReceiptLineItem>) => {
    setLineItems(prev => prev.map(item => {
      if (item.id !== id) return item

      if (updates.studentSearch !== undefined && updates.studentSearch !== item.studentSearch) {
        setActiveSearchItemId(id)
        setActiveSearchQuery(updates.studentSearch)
        return { ...item, ...updates, students: [] }
      }

      return { ...item, ...updates }
    }))
  }

  const validate = (): boolean => {
    let valid = true

    // Validate payment method
    if (!paymentMethod) {
      setPaymentMethodError('Please select a payment method')
      valid = false
    } else {
      setPaymentMethodError(undefined)
    }

    // Validate line items
    const newErrors: Record<string, Record<string, string | undefined>> = {}
    lineItems.forEach((item) => {
      const itemErrors: Record<string, string | undefined> = {}
      if (!item.selectedStudent) {
        itemErrors.student = 'Please select a student'
        valid = false
      }
      if (item.amount <= 0) {
        itemErrors.amount = 'Amount must be greater than 0'
        valid = false
      }
      if (!item.payment_type) {
        itemErrors.payment_type = 'Please select a payment type'
        valid = false
      }
      if (Object.keys(itemErrors).length > 0) {
        newErrors[item.id] = itemErrors
      }
    })
    setLineItemErrors(newErrors)

    return valid
  }

  const handlePreviewRisk = async () => {
    const validItems = lineItems.filter(item => item.selectedStudent && item.amount > 0 && item.payment_type)

    if (validItems.length === 0) {
      setLocalOverpaymentRisk(null)
      clearOverpaymentRisk()
      return
    }

    const itemsWithoutEnrollment = validItems.filter(item => !item.selectedEnrollment)
    if (itemsWithoutEnrollment.length > 0) {
      onError('Please select an enrollment for each line item')
      return
    }

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
        payment_type: narrowType(item.payment_type),
        discount: item.discount || 0,
        notes: item.notes || undefined,
      })),
    }

    try {
      const risk = await previewRisk(request)
      setLocalOverpaymentRisk(risk)
    } catch {
      setLocalOverpaymentRisk(null)
    }
  }

  const handleCreateReceipt = async () => {
    if (!validate()) return

    const validItems = lineItems.filter(item => item.selectedStudent && item.amount > 0 && item.payment_type)

    const itemsWithoutEnrollment = validItems.filter(item => !item.selectedEnrollment)
    if (itemsWithoutEnrollment.length > 0) {
      onError('Please select an enrollment for each line item (click on student first)')
      return
    }

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
          payment_type: narrowType(item.payment_type),
          discount: item.discount || 0,
          notes: item.notes || undefined,
        })),
      }

      const result = await create(request)
      onSuccess(`Receipt created successfully: ${result.receipt_number}`, result.receipt_id)

      // Clear draft on success
      sessionStorage.removeItem(DRAFT_KEY)

      // Reset form
      setPayerName('')
      setPaymentMethod(null)
      setPaymentMethodError(undefined)
      setNotes('')
      setLineItems([{ ...emptyLineItem(), id: '1' }])
      setLineItemErrors({})
      setLocalOverpaymentRisk(null)
      clearOverpaymentRisk()
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Failed to create receipt')
    }
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="font-headline text-xl font-semibold text-on-surface">Create Receipt</h2>
          {draftRestored && (
            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">
              Draft restored
            </span>
          )}
        </div>
        {onNavigateToUnpaid && (
          <button
            type="button"
            onClick={onNavigateToUnpaid}
            className="text-sm text-secondary hover:text-secondary/80 flex items-center gap-1.5 font-medium transition-colors"
          >
            <span className="material-symbols-outlined text-base" aria-hidden="true">warning</span>
            Pay from Unpaid
          </button>
        )}
      </div>

      {/* Receipt Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-on-surface mb-2">Payer Name</label>
          <input
            type="text"
            value={payerName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPayerName(e.target.value)}
            placeholder="Enter payer name..."
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm transition-shadow focus:ring-2 focus:ring-secondary/20 focus:outline-none"
          />
        </div>
        <div>
          <PaymentMethodPills
            label="Payment Method"
            options={PAYMENT_METHODS}
            selected={paymentMethod}
            onChange={(value) => { setPaymentMethod(value); setPaymentMethodError(undefined) }}
            error={paymentMethodError}
          />
        </div>
      </div>

      {/* Line Items */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-medium text-on-surface">Line Items</label>
          <button
            onClick={handleAddLineItem}
            className="text-sm font-semibold text-secondary hover:text-secondary/80 flex items-center gap-1 transition-colors"
          >
            <span className="material-symbols-outlined text-sm" aria-hidden="true">add</span>
            Add Item
          </button>
        </div>

        <div className="space-y-4">
          {lineItems.map((item, index) => (
            <ReceiptLineItemRow
              key={item.id}
              item={item}
              index={index}
              onUpdate={(updates) => handleUpdateLineItem(item.id, updates)}
              onRemove={() => handleRemoveLineItem(item.id)}
              isSearchingStudents={activeSearchItemId === item.id && isSearchingStudents}
              errors={lineItemErrors[item.id]}
            />
          ))}
        </div>
      </div>

      {/* Overpayment Warning */}
      {(overpaymentRisk?.has_risk || localOverpaymentRisk?.has_risk) && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg animate-pulse">
          <p className="text-sm text-yellow-800 flex items-center gap-2">
            <span className="material-symbols-outlined" aria-hidden="true">warning</span>
            {overpaymentRisk?.message || localOverpaymentRisk?.message || 'This payment may exceed the amount due'}
          </p>
        </div>
      )}

      {/* Total & Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <div>
          <p className="text-sm text-slate-600">Total Amount</p>
          <p className="text-2xl font-bold text-on-surface">{totalAmount.toFixed(2)} <span className="text-sm font-normal text-slate-400">EGP</span></p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handlePreviewRisk}
            className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            Check Risk
          </button>
          <button
            onClick={handleCreateReceipt}
            disabled={isLoading || isCreating || totalAmount === 0}
            className="px-6 py-2 bg-secondary text-white rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary/90 transition-all flex items-center gap-2 shadow-md hover:shadow-lg active:scale-95"
          >
            {(isLoading || isCreating) ? <LoadingSpinner size="sm" /> : null}
            <span className="material-symbols-outlined" aria-hidden="true">receipt</span>
            Create Receipt
          </button>
        </div>
      </div>
    </div>
  )
}
