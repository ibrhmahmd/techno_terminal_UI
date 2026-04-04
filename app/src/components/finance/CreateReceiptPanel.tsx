import { useState } from 'react'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { searchStudents } from '../../api/crm'
import { createReceipt, previewOverpaymentRisk, type Receipt, type ReceiptItem } from '../../api/finance'
import type { Student } from '../../api/crm'

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'transfer', label: 'Bank Transfer' },
  { value: 'other', label: 'Other' }
] as const

const ITEM_TYPES = [
  { value: 'tuition', label: 'Tuition' },
  { value: 'materials', label: 'Materials' },
  { value: 'registration', label: 'Registration' },
  { value: 'other', label: 'Other' }
] as const

const MOCK_STUDENTS: Student[] = [
  { id: 1, full_name: 'Omar Khaled', phone: '0123456789', is_active: true, gender: 'male' },
  { id: 2, full_name: 'Sara Ahmed', phone: '0198765432', is_active: true, gender: 'female' },
  { id: 3, full_name: 'Ali Hassan', phone: '0155112233', is_active: true, gender: 'male' }
]

interface ReceiptLineItem {
  id: string
  studentSearch: string
  selectedStudent: Student | null
  students: Student[]
  enrollmentId: number | ''
  amount: number
  type: ReceiptItem['type']
  description: string
}

interface CreateReceiptPanelProps {
  useMockData: boolean
  isLoading: boolean
  onSuccess: (message: string, receiptId?: number) => void
  onError: (message: string) => void
  setIsLoading: (loading: boolean) => void
}

export function CreateReceiptPanel({ useMockData, isLoading, onSuccess, onError, setIsLoading }: CreateReceiptPanelProps) {
  const [payerName, setPayerName] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<Receipt['payment_method']>('cash')
  const [notes, setNotes] = useState('')
  const [lineItems, setLineItems] = useState<ReceiptLineItem[]>([
    {
      id: '1',
      studentSearch: '',
      selectedStudent: null,
      students: [],
      enrollmentId: '',
      amount: 0,
      type: 'tuition',
      description: ''
    }
  ])
  const [overpaymentRisk, setOverpaymentRisk] = useState<{ has_risk: boolean; message?: string } | null>(null)

  const totalAmount = lineItems.reduce((sum, item) => sum + (item.amount || 0), 0)

  const handleAddLineItem = () => {
    setLineItems(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      studentSearch: '',
      selectedStudent: null,
      students: [],
      enrollmentId: '',
      amount: 0,
      type: 'tuition',
      description: ''
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
    setLineItems(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ))
  }

  const handleStudentSearch = async (itemId: string, search: string) => {
    handleUpdateLineItem(itemId, { studentSearch: search, students: [] })
    
    if (search.length < 2) return
    
    try {
      const data = await searchStudents(search)
      handleUpdateLineItem(itemId, { students: data || [] })
    } catch {
      const filtered = MOCK_STUDENTS.filter(s => 
        s.full_name.toLowerCase().includes(search.toLowerCase())
      )
      handleUpdateLineItem(itemId, { students: filtered })
    }
  }

  const handlePreviewRisk = async () => {
    const validItems = lineItems
      .filter(item => item.selectedStudent && item.amount > 0)
      .map(item => ({
        enrollment_id: item.enrollmentId || item.selectedStudent!.id,
        amount: item.amount,
        type: item.type,
        description: item.description
      }))

    if (validItems.length === 0) {
      setOverpaymentRisk(null)
      return
    }

    try {
      const risk = await previewOverpaymentRisk({
        payment_method: paymentMethod,
        notes,
        items: validItems
      })
      setOverpaymentRisk(risk)
    } catch {
      setOverpaymentRisk(null)
    }
  }

  const handleCreateReceipt = async () => {
    const validItems = lineItems
      .filter(item => item.selectedStudent && item.amount > 0)
      .map(item => ({
        enrollment_id: item.enrollmentId || item.selectedStudent!.id,
        amount: item.amount,
        type: item.type,
        description: item.description
      }))

    if (validItems.length === 0) {
      onError('Please add at least one valid line item with a student and amount')
      return
    }

    if (!payerName.trim()) {
      onError('Please enter payer name')
      return
    }

    setIsLoading(true)
    onError('')
    try {
      if (useMockData) {
        await new Promise(r => setTimeout(r, 500))
        const mockId = `mock-receipt-${Date.now()}`
        onSuccess('Receipt created successfully: R-2026-MOCK', mockId)
      } else {
        const result = await createReceipt({
          payer_name: payerName,
          payment_method: paymentMethod,
          notes,
          items: validItems
        })
        onSuccess(`Receipt created successfully: ${result.receipt_number}`, result.id)
      }
      // Reset form
      setPayerName('')
      setNotes('')
      setLineItems([{
        id: '1',
        studentSearch: '',
        selectedStudent: null,
        students: [],
        enrollmentId: '',
        amount: 0,
        type: 'tuition',
        description: ''
      }])
      setOverpaymentRisk(null)
    } catch {
      onError('Failed to create receipt')
    } finally {
      setIsLoading(false)
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
            onChange={(e) => setPayerName(e.target.value)}
            placeholder="Enter payer name..."
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-on-surface mb-2">Payment Method</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as Receipt['payment_method'])}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
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
            className="text-sm text-secondary hover:text-secondary/80 flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Add Item
          </button>
        </div>

        <div className="space-y-4">
          {lineItems.map((item, index) => (
            <div key={item.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-600">Item {index + 1}</span>
                <button
                  onClick={() => handleRemoveLineItem(item.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Student Selection */}
                <div className="lg:col-span-2">
                  <label className="block text-xs font-medium text-slate-600 mb-1">Student</label>
                  {item.selectedStudent ? (
                    <div className="flex items-center justify-between p-2 bg-white rounded border">
                      <span className="text-sm">{item.selectedStudent.full_name}</span>
                      <button
                        onClick={() => handleUpdateLineItem(item.id, { selectedStudent: null, studentSearch: '' })}
                        className="text-red-500 hover:text-red-700 text-xs"
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <>
                      <input
                        type="text"
                        value={item.studentSearch}
                        onChange={(e) => handleStudentSearch(item.id, e.target.value)}
                        placeholder="Search student (min 2 chars)..."
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                      />
                      {item.students.length > 0 && (
                        <div className="mt-1 border border-slate-200 rounded-lg overflow-hidden max-h-32 overflow-y-auto">
                          {item.students.map(s => (
                            <button
                              key={s.id}
                              onClick={() => handleUpdateLineItem(item.id, { selectedStudent: s, studentSearch: s.full_name, students: [] })}
                              className="w-full px-3 py-2 text-left hover:bg-slate-100 border-b border-slate-100 last:border-0 text-sm"
                            >
                              {s.full_name}
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Amount (EGP)</label>
                  <input
                    type="number"
                    min={0}
                    value={item.amount || ''}
                    onChange={(e) => handleUpdateLineItem(item.id, { amount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>

                {/* Type */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Type</label>
                  <select
                    value={item.type}
                    onChange={(e) => handleUpdateLineItem(item.id, { type: e.target.value as ReceiptItem['type'] })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
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
                  onChange={(e) => handleUpdateLineItem(item.id, { description: e.target.value })}
                  placeholder="e.g., March 2026 tuition"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Overpayment Warning */}
      {overpaymentRisk?.has_risk && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800 flex items-center gap-2">
            <span className="material-symbols-outlined">warning</span>
            {overpaymentRisk.message || 'This payment may exceed the amount due'}
          </p>
        </div>
      )}

      {/* Total & Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <div>
          <p className="text-sm text-slate-600">Total Amount</p>
          <p className="text-2xl font-bold text-on-surface">{totalAmount.toFixed(2)} EGP</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handlePreviewRisk}
            className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50"
          >
            Check Risk
          </button>
          <button
            onClick={handleCreateReceipt}
            disabled={isLoading || totalAmount === 0}
            className="px-6 py-2 bg-secondary text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary/90 transition-colors flex items-center gap-2"
          >
            {isLoading ? <LoadingSpinner size="sm" /> : null}
            <span className="material-symbols-outlined">receipt</span>
            Create Receipt
          </button>
        </div>
      </div>
    </div>
  )
}
