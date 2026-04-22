// Student Payments React Query Hook
// Provides data fetching and mutations for student payment operations

import { useState, useCallback, useEffect } from 'react'
import { getStudentPayments, getPaymentDetails, sendReceiptToStudent } from '../../api/crm/students/payments'
import { downloadReceiptPdf } from '../../api/finance/receipts'
import type { PaymentListItem, PaymentDetailsResponse } from '../../api/crm/students/types/payments'

interface UseStudentPaymentsReturn {
  payments: PaymentListItem[]
  isLoading: boolean
  error: string | null
  selectedPayment: PaymentDetailsResponse | null
  isDetailsLoading: boolean
  isSendingReceipt: boolean
  isDownloading: boolean
  fetchPayments: () => Promise<void>
  selectPayment: (paymentId: number) => Promise<void>
  clearSelectedPayment: () => void
  sendReceipt: (paymentId: number, method: 'whatsapp' | 'email') => Promise<{ success: boolean; message: string }>
  downloadReceipt: (receiptId: number) => Promise<void>
}

export function useStudentPayments(studentId: number | null, enabled: boolean = true): UseStudentPaymentsReturn {
  const [payments, setPayments] = useState<PaymentListItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedPayment, setSelectedPayment] = useState<PaymentDetailsResponse | null>(null)
  const [isDetailsLoading, setIsDetailsLoading] = useState(false)
  const [isSendingReceipt, setIsSendingReceipt] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [hasFetched, setHasFetched] = useState(false)

  // Fetch all payments for the student
  const fetchPayments = useCallback(async () => {
    if (!studentId) return

    setIsLoading(true)
    setError(null)

    try {
      const data = await getStudentPayments(studentId)
      // Sort by payment_date descending (newest first)
      const sortedData = data.sort((a, b) => 
        new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime()
      )
      setPayments(sortedData)
      setHasFetched(true)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load payments'
      setError(message)
      console.error('Failed to load student payments:', err)
    } finally {
      setIsLoading(false)
    }
  }, [studentId])

  // Fetch detailed information for a specific payment
  const selectPayment = useCallback(async (paymentId: number) => {
    setIsDetailsLoading(true)
    setError(null)

    try {
      const data = await getPaymentDetails(paymentId)
      setSelectedPayment(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load payment details'
      setError(message)
      console.error('Failed to load payment details:', err)
    } finally {
      setIsDetailsLoading(false)
    }
  }, [])

  // Clear selected payment
  const clearSelectedPayment = useCallback(() => {
    setSelectedPayment(null)
  }, [])

  // Send receipt to student
  const sendReceipt = useCallback(async (
    paymentId: number, 
    method: 'whatsapp' | 'email'
  ): Promise<{ success: boolean; message: string }> => {
    setIsSendingReceipt(true)
    
    try {
      const result = await sendReceiptToStudent(paymentId, method)
      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send receipt'
      console.error('Failed to send receipt:', err)
      return { success: false, message }
    } finally {
      setIsSendingReceipt(false)
    }
  }, [])

  // Download receipt PDF
  const downloadReceipt = useCallback(async (receiptId: number): Promise<void> => {
    setIsDownloading(true)
    
    try {
      const blob = await downloadReceiptPdf(receiptId)
      
      // Create blob URL and trigger download
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `receipt-${receiptId}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to download receipt'
      console.error('Failed to download receipt:', err)
      throw new Error(message)
    } finally {
      setIsDownloading(false)
    }
  }, [])

  // Auto-fetch when enabled and studentId changes
  useEffect(() => {
    if (enabled && studentId && !hasFetched) {
      fetchPayments()
    }
  }, [enabled, studentId, hasFetched, fetchPayments])

  // Refetch when tab is revisited (enabled becomes true again)
  useEffect(() => {
    if (enabled && studentId && hasFetched) {
      fetchPayments()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled])

  return {
    payments,
    isLoading,
    error,
    selectedPayment,
    isDetailsLoading,
    isSendingReceipt,
    isDownloading,
    fetchPayments,
    selectPayment,
    clearSelectedPayment,
    sendReceipt,
    downloadReceipt,
  }
}
