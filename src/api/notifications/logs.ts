// Logs API
// Endpoints for notification history and audit logs

import { client } from '../client'
import type { PaginatedApiResponse } from '../../types/api'
import type {
  NotificationLogDTO,
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
  if (filters?.start_date) params.append('start_date', filters.start_date)
  if (filters?.end_date) params.append('end_date', filters.end_date)
  if (filters?.template_id !== undefined) params.append('template_id', filters.template_id.toString())
  if (filters?.sort_by) params.append('sort_by', filters.sort_by)
  if (filters?.sort_order) params.append('sort_order', filters.sort_order)
  if (filters?.limit !== undefined) params.append('limit', filters.limit.toString())
  if (filters?.offset !== undefined) params.append('offset', filters.offset.toString())

  const query = params.toString()
  const url = query ? `${LOGS_BASE}?${query}` : LOGS_BASE

  const response = await client.get<PaginatedApiResponse<NotificationLogDTO>>(url)
  return response.data
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

