import { useState, useEffect } from 'react'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { useStudentsSearch } from '../../hooks/useDirectory'
import { useReceipts } from '../../hooks/finance'
import type { CreateReceiptRequest } from '../../api/finance'
import type { UnpaidEnrollment } from '../../api/crm/students/types/finance'
import type { Student } from '../../api/crm'
import { ReceiptLineItemRow } from './CreateReceipt/ReceiptLineItemRow'
import type { ReceiptLineItem } from './CreateReceipt/ReceiptLineItemRow'

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'transfer', label: 'Bank Transfer' },
  { value: 'other', label: 'Other' }
] as const

interface CreateReceiptPanelProps {
  isLoading: boolean
  onSuccess: (message: string, receiptId?: number) => void
  onError: (message: string) => void
  initialData?: UnpaidEnrollment | null
  onClearInitialData?: () => void
}

export function CreateReceiptPanel({ isLoading, onSuccess, onError, initialData, onClearInitialData }: CreateReceiptPanelProps) {
  const { create, previewRisk, isCreating, createError, overpaymentRisk, clearOverpaymentRisk } = useReceipts()
  const [payerName, setPayerName] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer' | 'other'>('cash')
  const [notes, setNotes] = useState('')
  const [lineItems, setLineItems] = useState<ReceiptLineItem[]>([
    {
      id: '1',
      studentSearch: '',
      selectedStudent: null,
      students: [],
      selectedEnrollment: null,
      amount: 0,
      payment_type: 'course_level',
      discount: 0,
      notes: ''
    }
  ])
  const [localOverpaymentRisk, setLocalOverpaymentRisk] = useState<{ has_risk: boolean; message?: string } | null>(null)
  
  // Track which item is currently searching for debounced/cached student search
  const [activeSearchItemId, setActiveSearchItemId] = useState<string | null>(null)
  const [activeSearchQuery, setActiveSearchQuery] = useState('')
  const { data: searchResults, isLoading: isSearchingStudents } = useStudentsSearch(activeSearchQuery)

  const totalAmount = lineItems.reduce((sum, item) => sum + (item.amount || 0), 0)

  // Initialize from initialData when provided (Pay button from Unpaid Enrollments)
  useEffect(() => {
    if (initialData) {
      // Construct minimal Student object
      const selectedStudent: Student = {
        id: initialData.student_id,
        full_name: initialData.student_name,
        phone: null,
        status: 'active',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      // Map UnpaidEnrollment to StudentEnrollmentInfo format
      const selectedEnrollment = {
        enrollment_id: initialData.enrollment_id,
        group_id: initialData.group_id,
        group_name: initialData.group_name,
        level_number: initialData.level_number,
        amount_due: initialData.amount_due,
        discount_applied: initialData.discount_applied,
        amount_paid: initialData.total_paid, // Map total_paid to amount_paid
        remaining_balance: initialData.remaining_balance
      }

      // Pre-fill the form with initial data
      setPayerName('')
      setPaymentMethod('cash')
      setNotes('')
      setLineItems([{
        id: '1',
        studentSearch: initialData.student_name,
        selectedStudent,
        students: [selectedStudent],
        selectedEnrollment,
        amount: initialData.remaining_balance, // Pre-fill with full remaining balance
        payment_type: 'course_level',
        discount: 0,
        notes: ''
      }])
      setLocalOverpaymentRisk(null)
      clearOverpaymentRisk?.()

      // Clear initial data so it doesn't re-apply
      onClearInitialData?.()
    }
  }, [initialData, onClearInitialData])

  // Sync search results to the active line item
  useEffect(() => {
    if (activeSearchItemId && searchResults) {
      setLineItems(prev => prev.map(item =>
        item.id === activeSearchItemId
          ? { ...item, students: searchResults }
          : item
      ))
    }
  }, [activeSearchItemId, searchResults])

  const handleAddLineItem = () => {
    setLineItems(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      studentSearch: '',
      selectedStudent: null,
      students: [],
      selectedEnrollment: null,
      amount: 0,
      payment_type: 'course_level',
      discount: 0,
      notes: ''
    }])
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
      
      // Track search changes to enable caching
      if (updates.studentSearch !== undefined && updates.studentSearch !== item.studentSearch) {
        setActiveSearchItemId(id)
        setActiveSearchQuery(updates.studentSearch)
        // Clear students array when search changes (new results will come from useEffect)
        return { ...item, ...updates, students: [] }
      }
      
      return { ...item, ...updates }
    }))
  }

  const handlePreviewRisk = async () => {
    const validItems = lineItems.filter(item => item.selectedStudent && item.amount > 0)

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
      method: paymentMethod,
      notes: notes || null,
      allow_credit: true,
      lines: validItems.map((item, index) => ({
        id: index + 1,
        student_id: item.selectedStudent!.id,
        enrollment_id: item.selectedEnrollment?.enrollment_id,
        amount: item.amount,
        transaction_type: 'charge',
        payment_type: item.payment_type,
        discount: item.discount || 0,
        notes: item.notes || undefined
      }))
    }

    try {
      const risk = await previewRisk(request)
      setLocalOverpaymentRisk(risk)
    } catch {
      setLocalOverpaymentRisk(null)
    }
  }

  const handleCreateReceipt = async () => {
    const validItems = lineItems.filter(item => item.selectedStudent && item.amount > 0)

    if (validItems.length === 0) {
      onError('Please add at least one valid line item with a student and amount')
      return
    }

    const itemsWithoutEnrollment = validItems.filter(item => !item.selectedEnrollment)
    if (itemsWithoutEnrollment.length > 0) {
      onError('Please select an enrollment for each line item (click on student first)')
      return
    }

    onError('')
    try {
      const request: CreateReceiptRequest = {
        payer_name: payerName || null,
        method: paymentMethod,
        notes: notes || null,
        allow_credit: true,
        lines: validItems.map((item, index) => ({
          id: index + 1,
          student_id: item.selectedStudent!.id,
          enrollment_id: item.selectedEnrollment?.enrollment_id,
          amount: item.amount,
          transaction_type: 'charge',
          payment_type: item.payment_type,
          discount: item.discount || 0,
          notes: item.notes || undefined
        }))
      }
      
      const result = await create(request)
      onSuccess(`Receipt created successfully: ${result.receipt_number}`, result.receipt_id)
      
      // Reset form
      setPayerName('')
      setNotes('')
      setLineItems([{
        id: '1',
        studentSearch: '',
        selectedStudent: null,
        students: [],
        selectedEnrollment: null,
        amount: 0,
        payment_type: 'course_level',
        discount: 0,
        notes: ''
      }])
      setLocalOverpaymentRisk(null)
      clearOverpaymentRisk()
    } catch {
      onError(createError?.message || 'Failed to create receipt')
    }
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <h2 className="font-headline text-xl font-semibold text-on-surface mb-6">Create Receipt</h2>

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
          <label className="block text-sm font-medium text-on-surface mb-2">Payment Method</label>
          <select
            value={paymentMethod}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPaymentMethod(e.target.value as 'cash' | 'card' | 'transfer' | 'other')}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white transition-shadow focus:ring-2 focus:ring-secondary/20 focus:outline-none"
          >
            {PAYMENT_METHODS.map(method => (
              <option key={method.value} value={method.value}>{method.label}</option>
            ))}
          </select>
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
            <span className="material-symbols-outlined text-sm">add</span>
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
            />
          ))}
        </div>
      </div>

      {/* Overpayment Warning */}
      {(overpaymentRisk?.has_risk || localOverpaymentRisk?.has_risk) && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg animate-pulse">
          <p className="text-sm text-yellow-800 flex items-center gap-2">
            <span className="material-symbols-outlined">warning</span>
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
            <span className="material-symbols-outlined">receipt</span>
            Create Receipt
          </button>
        </div>
      </div>
    </div>
  )
}
