// Bulk Messaging API
// Endpoints for bulk messaging operations

import client from '../client'
import type {
  BulkMessageRequest,
  BulkMessagePreviewDTO,
  BulkMessageResponseDTO,
  BulkMessageJobDTO,
} from './types'

const BULK_BASE = '/notifications/bulk'

/**
 * Preview recipients before sending bulk message
 * POST /api/v1/notifications/bulk/preview
 */
export async function previewRecipients(
  request: BulkMessageRequest
): Promise<BulkMessagePreviewDTO> {
  const response = await client.post<{ data: BulkMessagePreviewDTO }>(
    `${BULK_BASE}/preview`,
    request
  )
  return response.data.data
}

/**
 * Send a bulk message
 * POST /api/v1/notifications/bulk/send
 */
export async function sendBulkMessage(
  request: BulkMessageRequest
): Promise<BulkMessageResponseDTO> {
  const response = await client.post<{ data: BulkMessageResponseDTO }>(
    `${BULK_BASE}/send`,
    request
  )
  return response.data.data
}

/**
 * Get status of a bulk message job
 * GET /api/v1/notifications/bulk/jobs/{job_id}
 */
export async function getJobStatus(jobId: number): Promise<BulkMessageJobDTO> {
  const response = await client.get<{ data: BulkMessageJobDTO }>(
    `${BULK_BASE}/jobs/${jobId}`
  )
  return response.data.data
}

/**
 * Cancel a queued or processing bulk message job
 * POST /api/v1/notifications/bulk/jobs/{job_id}/cancel
 */
export async function cancelJob(jobId: number): Promise<{ message: string }> {
  const response = await client.post<{ data: { message: string } }>(
    `${BULK_BASE}/jobs/${jobId}/cancel`
  )
  return response.data.data
}

/**
 * Get all currently active bulk message jobs
 * GET /api/v1/notifications/bulk/jobs/active
 */
export async function getActiveJobs(): Promise<BulkMessageJobDTO[]> {
  const response = await client.get<{ data: BulkMessageJobDTO[] }>(
    `${BULK_BASE}/jobs/active`
  )
  return response.data.data
}
