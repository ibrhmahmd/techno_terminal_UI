// Bulk Messaging Hooks
// React Query hooks for bulk notification operations

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  previewRecipients,
  sendBulkMessage,
  getJobStatus,
  cancelJob,
  getActiveJobs,
  type BulkMessageRequest,
} from '../../api/notifications'
import { notificationKeys } from './queryKeys'

/**
 * Hook to preview recipients before sending bulk message
 */
export function usePreviewRecipients() {
  return useMutation({
    mutationFn: (request: BulkMessageRequest) => previewRecipients(request),
  })
}

/**
 * Hook to send a bulk message
 */
export function useSendBulkMessage() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (request: BulkMessageRequest) => sendBulkMessage(request),
    onSuccess: () => {
      // Invalidate active jobs and logs
      queryClient.invalidateQueries({ queryKey: notificationKeys.bulk.activeJobs() })
      queryClient.invalidateQueries({ queryKey: notificationKeys.logs.all })
    },
  })
}

/**
 * Hook to fetch status of a specific bulk message job
 */
export function useBulkJobStatus(jobId: number) {
  return useQuery({
    queryKey: notificationKeys.bulk.job(jobId),
    queryFn: () => getJobStatus(jobId),
    enabled: !!jobId,
    refetchInterval: (query) => {
      // Poll every 3 seconds if job is processing or queued
      const job = query.state.data
      if (job?.status === 'processing' || job?.status === 'queued') {
        return 3000
      }
      return false
    },
    staleTime: 0, // Always fresh for job status
  })
}

/**
 * Hook to cancel a bulk message job
 */
export function useCancelBulkJob() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (jobId: number) => cancelJob(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.bulk.all })
      queryClient.invalidateQueries({ queryKey: notificationKeys.logs.all })
    },
  })
}

/**
 * Hook to fetch all currently active bulk message jobs
 */
export function useActiveBulkJobs() {
  return useQuery({
    queryKey: notificationKeys.bulk.activeJobs(),
    queryFn: getActiveJobs,
    refetchInterval: 5000, // Poll every 5 seconds
    staleTime: 0,
  })
}
