import { useState, useCallback } from 'react'
import {
  searchReceipts,
  getReceiptDetails,
  createReceipt,
  batchGenerateReceipts,
  markReceiptAsSent,
  generateReceiptText,
  downloadReceiptPdf,
  previewOverpaymentRisk,
  type ReceiptListItem,
  type ReceiptDetail,
  type ReceiptSearchParams,
  type CreateReceiptRequest,
  type BatchGenerateRequest,
  type OverpaymentRisk,
} from '../../api/finance'

export interface UseReceiptsResult {
  // Data
  receipts: ReceiptListItem[]
  selectedReceipt: ReceiptDetail | null
  createdReceipt: { id: number; receipt_number: string } | null
  overpaymentRisk: OverpaymentRisk | null
  generatedText: string | null
  pdfBlob: Blob | null

  // Loading states
  isSearching: boolean
  isLoadingDetails: boolean
  isCreating: boolean
  isBatchGenerating: boolean
  isMarkingSent: boolean
  isGeneratingText: boolean
  isDownloadingPdf: boolean
  isPreviewingRisk: boolean

  // Errors
  searchError: Error | null
  detailsError: Error | null
  createError: Error | null
  batchError: Error | null
  markSentError: Error | null
  generateTextError: Error | null
  downloadPdfError: Error | null
  previewRiskError: Error | null

  // Actions
  search: (params: ReceiptSearchParams) => Promise<ReceiptListItem[]>
  getDetails: (receiptId: number) => Promise<ReceiptDetail>
  create: (request: CreateReceiptRequest) => Promise<{ id: number; receipt_number: string }>
  batchGenerate: (params: BatchGenerateRequest) => Promise<ReceiptListItem[]>
  markAsSent: (receiptId: number) => Promise<void>
  generateText: (receiptId: number) => Promise<string>
  downloadPdf: (receiptId: number) => Promise<Blob>
  previewRisk: (request: CreateReceiptRequest) => Promise<OverpaymentRisk>

  // Utils
  clearErrors: () => void
  clearSelectedReceipt: () => void
  clearCreatedReceipt: () => void
  clearOverpaymentRisk: () => void
}

export function useReceipts(): UseReceiptsResult {
  // Data states
  const [receipts, setReceipts] = useState<ReceiptListItem[]>([])
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptDetail | null>(null)
  const [createdReceipt, setCreatedReceipt] = useState<{ id: number; receipt_number: string } | null>(null)
  const [overpaymentRisk, setOverpaymentRisk] = useState<OverpaymentRisk | null>(null)
  const [generatedText, setGeneratedText] = useState<string | null>(null)
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null)

  // Loading states
  const [isSearching, setIsSearching] = useState(false)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isBatchGenerating, setIsBatchGenerating] = useState(false)
  const [isMarkingSent, setIsMarkingSent] = useState(false)
  const [isGeneratingText, setIsGeneratingText] = useState(false)
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false)
  const [isPreviewingRisk, setIsPreviewingRisk] = useState(false)

  // Error states
  const [searchError, setSearchError] = useState<Error | null>(null)
  const [detailsError, setDetailsError] = useState<Error | null>(null)
  const [createError, setCreateError] = useState<Error | null>(null)
  const [batchError, setBatchError] = useState<Error | null>(null)
  const [markSentError, setMarkSentError] = useState<Error | null>(null)
  const [generateTextError, setGenerateTextError] = useState<Error | null>(null)
  const [downloadPdfError, setDownloadPdfError] = useState<Error | null>(null)
  const [previewRiskError, setPreviewRiskError] = useState<Error | null>(null)

  const search = useCallback(async (params: ReceiptSearchParams) => {
    setIsSearching(true)
    setSearchError(null)
    try {
      const data = await searchReceipts(params)
      setReceipts(data)
      return data
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to search receipts')
      setSearchError(error)
      throw error
    } finally {
      setIsSearching(false)
    }
  }, [])

  const getDetails = useCallback(async (receiptId: number) => {
    setIsLoadingDetails(true)
    setDetailsError(null)
    try {
      const data = await getReceiptDetails(receiptId)
      setSelectedReceipt(data)
      return data
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to get receipt details')
      setDetailsError(error)
      throw error
    } finally {
      setIsLoadingDetails(false)
    }
  }, [])

  const create = useCallback(async (request: CreateReceiptRequest) => {
    setIsCreating(true)
    setCreateError(null)
    try {
      const result = await createReceipt(request)
      setCreatedReceipt(result)
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create receipt')
      setCreateError(error)
      throw error
    } finally {
      setIsCreating(false)
    }
  }, [])

  const batchGenerate = useCallback(async (params: BatchGenerateRequest) => {
    setIsBatchGenerating(true)
    setBatchError(null)
    try {
      const data = await batchGenerateReceipts(params)
      setReceipts(data)
      return data
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to batch generate receipts')
      setBatchError(error)
      throw error
    } finally {
      setIsBatchGenerating(false)
    }
  }, [])

  const markAsSent = useCallback(async (receiptId: number) => {
    setIsMarkingSent(true)
    setMarkSentError(null)
    try {
      await markReceiptAsSent(receiptId)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to mark receipt as sent')
      setMarkSentError(error)
      throw error
    } finally {
      setIsMarkingSent(false)
    }
  }, [])

  const generateText = useCallback(async (receiptId: number) => {
    setIsGeneratingText(true)
    setGenerateTextError(null)
    try {
      const text = await generateReceiptText(receiptId)
      setGeneratedText(text)
      return text
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to generate receipt text')
      setGenerateTextError(error)
      throw error
    } finally {
      setIsGeneratingText(false)
    }
  }, [])

  const downloadPdf = useCallback(async (receiptId: number) => {
    setIsDownloadingPdf(true)
    setDownloadPdfError(null)
    try {
      const blob = await downloadReceiptPdf(receiptId)
      setPdfBlob(blob)
      return blob
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to download PDF')
      setDownloadPdfError(error)
      throw error
    } finally {
      setIsDownloadingPdf(false)
    }
  }, [])

  const previewRisk = useCallback(async (request: CreateReceiptRequest) => {
    setIsPreviewingRisk(true)
    setPreviewRiskError(null)
    try {
      const risk = await previewOverpaymentRisk(request)
      setOverpaymentRisk(risk)
      return risk
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to preview risk')
      setPreviewRiskError(error)
      throw error
    } finally {
      setIsPreviewingRisk(false)
    }
  }, [])

  const clearErrors = useCallback(() => {
    setSearchError(null)
    setDetailsError(null)
    setCreateError(null)
    setBatchError(null)
    setMarkSentError(null)
    setGenerateTextError(null)
    setDownloadPdfError(null)
    setPreviewRiskError(null)
  }, [])

  const clearSelectedReceipt = useCallback(() => {
    setSelectedReceipt(null)
  }, [])

  const clearCreatedReceipt = useCallback(() => {
    setCreatedReceipt(null)
  }, [])

  const clearOverpaymentRisk = useCallback(() => {
    setOverpaymentRisk(null)
  }, [])

  return {
    // Data
    receipts,
    selectedReceipt,
    createdReceipt,
    overpaymentRisk,
    generatedText,
    pdfBlob,

    // Loading states
    isSearching,
    isLoadingDetails,
    isCreating,
    isBatchGenerating,
    isMarkingSent,
    isGeneratingText,
    isDownloadingPdf,
    isPreviewingRisk,

    // Errors
    searchError,
    detailsError,
    createError,
    batchError,
    markSentError,
    generateTextError,
    downloadPdfError,
    previewRiskError,

    // Actions
    search,
    getDetails,
    create,
    batchGenerate,
    markAsSent,
    generateText,
    downloadPdf,
    previewRisk,

    // Utils
    clearErrors,
    clearSelectedReceipt,
    clearCreatedReceipt,
    clearOverpaymentRisk,
  }
}
