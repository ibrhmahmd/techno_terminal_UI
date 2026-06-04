// Logs API
// Endpoints for notification history and audit logs

import { client } from '../client'
import type { PaginatedApiResponse } from '../../types/api'
import type {
  NotificationLogDTO,
  NotificationLogDetailDTO,
  LogRecipientDTO,
  NotificationLogFilters,
} from './types'

const LOGS_BASE = '/notifications/logs'

/**
 * Get notification logs with optional filters
 * GET /api/v1/notifications/logs
 */
export async function getLogs(filters?: NotificationLogFilters): Promise<PaginatedApiResponse<NotificationLogDTO>> {
  const params = new URLSearchParams()
  if (filters?.status) params.append('status', filters.status)
  if (filters?.channel) params.append('channel', filters.channel)
  if (filters?.search) params.append('search', filters.search)
  if (filters?.recipient_type) params.append('recipient_type', filters.recipient_type)
  if (filters?.limit !== undefined) params.append('limit', filters.limit.toString())
  if (filters?.offset !== undefined) params.append('offset', filters.offset.toString())

  const query = params.toString()
  const url = query ? `${LOGS_BASE}?${query}` : LOGS_BASE

  const response = await client.get<PaginatedApiResponse<NotificationLogDTO>>(url)
  return response.data
}

/**
 * Get detailed information about a specific notification log
 * GET /api/v1/notifications/logs/{id}
 */
export async function getLog(id: number): Promise<NotificationLogDetailDTO> {
  const response = await client.get<{ data: NotificationLogDetailDTO }>(`${LOGS_BASE}/${id}`)
  return response.data.data
}

/**
 * Get recipients for a specific notification log
 * GET /api/v1/notifications/logs/{log_id}/recipients
 */
export async function getLogRecipients(logId: number): Promise<LogRecipientDTO[]> {
  const response = await client.get<{ data: LogRecipientDTO[] }>(
    `${LOGS_BASE}/${logId}/recipients`
  )
  return response.data.data
}

/**
 * Retry failed notifications from a log
 * POST /api/v1/notifications/logs/{log_id}/retry
 */
export async function retryFailed(logId: number): Promise<{ message: string }> {
  const response = await client.post<{ data: { message: string } }>(
    `${LOGS_BASE}/${logId}/retry`
  )
  return response.data.data
}

