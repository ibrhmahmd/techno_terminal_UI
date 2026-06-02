import { useState, useCallback } from 'react'
import { queryClient } from '../../lib/queryClient'
import {
  issueRefund,
  previewRefundRisk,
  type RefundRequest,
  type RefundResult,
  type RiskAssessment,
} from '../../api/finance'

export interface UseRefundsResult {
  // Data
  refundResult: RefundResult | null
  riskAssessment: RiskAssessment | null

  // Loading states
  isIssuingRefund: boolean
  isPreviewingRisk: boolean

  // Errors
  issueRefundError: Error | null
  previewRiskError: Error | null

  // Actions
  issueRefund: (request: RefundRequest) => Promise<RefundResult>
  previewRisk: (request: RefundRequest) => Promise<RiskAssessment>

  // Utils
  clearErrors: () => void
  clearRefundResult: () => void
  clearRiskAssessment: () => void
}

export function useRefunds(): UseRefundsResult {
  // Data states
  const [refundResult, setRefundResult] = useState<RefundResult | null>(null)
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment | null>(null)

  // Loading states
  const [isIssuingRefund, setIsIssuingRefund] = useState(false)
  const [isPreviewingRisk, setIsPreviewingRisk] = useState(false)

  // Error states
  const [issueRefundError, setIssueRefundError] = useState<Error | null>(null)
  const [previewRiskError, setPreviewRiskError] = useState<Error | null>(null)

  const issueRefundFn = useCallback(async (request: RefundRequest) => {
    setIsIssuingRefund(true)
    setIssueRefundError(null)
    try {
      const result = await issueRefund(request)
      setRefundResult(result)
      queryClient.invalidateQueries({ queryKey: ['finance', 'metrics'] })
      return result
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Failed to issue refund')
      setIssueRefundError(error)
      throw error
    } finally {
      setIsIssuingRefund(false)
    }
  }, [])

  const previewRiskFn = useCallback(async (request: RefundRequest) => {
    setIsPreviewingRisk(true)
    setPreviewRiskError(null)
    try {
      const assessment = await previewRefundRisk(request)
      setRiskAssessment(assessment)
      return assessment
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Failed to preview refund risk')
      setPreviewRiskError(error)
      throw error
    } finally {
      setIsPreviewingRisk(false)
    }
  }, [])

  const clearErrors = useCallback(() => {
    setIssueRefundError(null)
    setPreviewRiskError(null)
  }, [])

  const clearRefundResult = useCallback(() => {
    setRefundResult(null)
  }, [])

  const clearRiskAssessment = useCallback(() => {
    setRiskAssessment(null)
  }, [])

  return {
    // Data
    refundResult,
    riskAssessment,

    // Loading states
    isIssuingRefund,
    isPreviewingRisk,

    // Errors
    issueRefundError,
    previewRiskError,

    // Actions
    issueRefund: issueRefundFn,
    previewRisk: previewRiskFn,

    // Utils
    clearErrors,
    clearRefundResult,
    clearRiskAssessment,
  }
}
