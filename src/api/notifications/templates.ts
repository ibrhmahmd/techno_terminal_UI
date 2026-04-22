// Templates API
// Endpoints for notification template CRUD operations

import client from '../client'
import type {
  NotificationTemplateDTO,
  CreateTemplateRequest,
  UpdateTemplateRequest,
  TemplateTestRequest,
} from './types'

const TEMPLATES_BASE = '/notifications/templates'

/**
 * Get all notification templates
 * GET /api/v1/notifications/templates
 */
export async function getTemplates(): Promise<NotificationTemplateDTO[]> {
  const response = await client.get<{ data: NotificationTemplateDTO[] }>(TEMPLATES_BASE)
  return response.data.data
}

/**
 * Get a single notification template by ID
 * GET /api/v1/notifications/templates/{id}
 */
export async function getTemplate(id: number): Promise<NotificationTemplateDTO> {
  const response = await client.get<{ data: NotificationTemplateDTO }>(`${TEMPLATES_BASE}/${id}`)
  return response.data.data
}

/**
 * Create a new notification template
 * POST /api/v1/notifications/templates
 */
export async function createTemplate(
  request: CreateTemplateRequest
): Promise<NotificationTemplateDTO> {
  const response = await client.post<{ data: NotificationTemplateDTO }>(TEMPLATES_BASE, request)
  return response.data.data
}

/**
 * Update an existing notification template
 * PATCH /api/v1/notifications/templates/{id}
 */
export async function updateTemplate(
  id: number,
  request: UpdateTemplateRequest
): Promise<NotificationTemplateDTO> {
  const response = await client.patch<{ data: NotificationTemplateDTO }>(
    `${TEMPLATES_BASE}/${id}`,
    request
  )
  return response.data.data
}

/**
 * Delete a notification template
 * DELETE /api/v1/notifications/templates/{id}
 */
export async function deleteTemplate(id: number): Promise<void> {
  await client.delete(`${TEMPLATES_BASE}/${id}`)
}

/**
 * Send a test notification using a template
 * POST /api/v1/notifications/templates/{id}/test
 */
export async function testTemplate(
  id: number,
  request: TemplateTestRequest
): Promise<{ message: string }> {
  const response = await client.post<{ data: { message: string } }>(
    `${TEMPLATES_BASE}/${id}/test`,
    request
  )
  return response.data.data
}
