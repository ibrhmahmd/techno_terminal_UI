// Admin Settings API
// Endpoints for managing admin notification preferences and additional recipients

import { client } from '../client'
import type {
  AdminNotificationSettingDTO,
  AdminSettingsResponse,
  AdditionalRecipientDTO,
  ToggleNotificationRequest,
  AddRecipientRequest,
  UpdateRecipientRequest,
  NotificationType,
} from './types'

const ADMIN_BASE = '/notifications/admin/settings/me'

/**
 * Get all notification settings and additional recipients for current admin
 * GET /api/v1/notifications/admin/settings/me
 */
export async function getAdminSettings(): Promise<AdminSettingsResponse> {
  const response = await client.get<{ data: AdminSettingsResponse }>(ADMIN_BASE)
  return response.data.data
}

/**
 * Enable or disable a specific notification type
 * PUT /api/v1/notifications/admin/settings/me/types/{notification_type}
 */
export async function toggleNotification(
  notificationType: NotificationType,
  request: ToggleNotificationRequest
): Promise<AdminNotificationSettingDTO> {
  const response = await client.put<{ data: AdminNotificationSettingDTO }>(
    `${ADMIN_BASE}/types/${notificationType}`,
    request
  )
  return response.data.data
}

/**
 * Add a new additional email recipient
 * POST /api/v1/notifications/admin/settings/me/additional-recipients
 */
export async function addRecipient(
  request: AddRecipientRequest
): Promise<AdditionalRecipientDTO> {
  const response = await client.post<{ data: AdditionalRecipientDTO }>(
    `${ADMIN_BASE}/additional-recipients`,
    request
  )
  return response.data.data
}

/**
 * Update an existing additional recipient
 * PUT /api/v1/notifications/admin/settings/me/additional-recipients/{recipient_id}
 */
export async function updateRecipient(
  recipientId: number,
  request: UpdateRecipientRequest
): Promise<AdditionalRecipientDTO> {
  const response = await client.put<{ data: AdditionalRecipientDTO }>(
    `${ADMIN_BASE}/additional-recipients/${recipientId}`,
    request
  )
  return response.data.data
}

/**
 * Remove an additional recipient
 * DELETE /api/v1/notifications/admin/settings/me/additional-recipients/{recipient_id}
 */
export async function deleteRecipient(recipientId: number): Promise<{ message: string }> {
  const response = await client.delete<{ data: { message: string } }>(
    `${ADMIN_BASE}/additional-recipients/${recipientId}`
  )
  return response.data.data
}

