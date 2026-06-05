# Data Model: Notifications Feature

## Entity: NotificationSetting

Maps admin toggle for a notification type.

| Field | Type | Nullable | Notes |
|-------|------|----------|-------|
| `notification_type` | `NotificationType` | No | Union of 14 event types |
| `is_enabled` | `boolean` | No | Whether notifications are sent for this event |
| `channel` | `'EMAIL'` | No | Currently only EMAIL |
| `description` | `string` | No | Human-readable description |

**Source**: `AdminNotificationSettingDTO` in `types.ts:30-35`
**API**: `GET /api/v1/notifications/admin/settings` → `AdminSettingsResponse`
**API**: `PATCH /api/v1/notifications/admin/settings/{type}` → `ToggleNotificationRequest`

## Entity: AdditionalRecipient

Extra email recipients for admin notifications.

| Field | Type | Nullable | Notes |
|-------|------|----------|-------|
| `id` | `number` | No | Primary key |
| `email` | `string` | No | Recipient email address |
| `label` | `string` | Yes | Display label |
| `notification_types` | `NotificationType[]` | Yes | Filter which types they receive |
| `is_active` | `boolean` | No | Whether recipient is active |

**Source**: `AdditionalRecipientDTO` in `types.ts:37-43`
**API**: Part of `AdminSettingsResponse.additional_recipients`
**CRUD**: POST to create, PATCH to update, DELETE to remove

## Entity: NotificationTemplate

Defines an email template with variables.

| Field | Type | Nullable | Notes |
|-------|------|----------|-------|
| `id` | `number` | No | Primary key |
| `template_key` | `string` | No | Unique key (e.g. `enrollment_confirmation`) |
| `name` | `string` | No | Display name |
| `subject` | `string` | No | Email subject line with variable placeholders |
| `body_html` | `string` | No | HTML body with variable placeholders |
| `body_text` | `string` | Yes | Plain text fallback |
| `variables` | `TemplateVariable[]` | No | Array of variable definitions (CAN be null from API) |
| `is_active` | `boolean` | No | Whether template is active |
| `created_at` | `string` | No | ISO timestamp |
| `updated_at` | `string` | No | ISO timestamp |

**Source**: `NotificationTemplateDTO` in `types.ts:83-94`
**API**: CRUD via `/api/v1/notifications/templates/`
**Bug**: `variables` field type says `TemplateVariable[]` (non-nullable) but API may return `null`.

### Sub-entity: TemplateVariable

| Field | Type | Nullable | Notes |
|-------|------|----------|-------|
| `name` | `string` | No | Variable name (used as `{{name}}` in templates) |
| `description` | `string` | No | Human-readable description |
| `required` | `boolean` | No | Whether variable must be provided |
| `default_value` | `string` | Yes | Fallback if not provided |

## Entity: NotificationLog

Record of a dispatched notification.

| Field | Type | Nullable | Notes |
|-------|------|----------|-------|
| `id` | `number` | No | Primary key |
| `template_id` | `number` | Yes | Template used |
| `channel` | `string` | No | `'EMAIL'` or `'WHATSAPP'` |
| `recipient_type` | `string` | No | `'PARENT'` or `'EMPLOYEE'` |
| `recipient_id` | `number` | No | ID of the recipient entity |
| `recipient_contact` | `string` | No | Email address |
| `subject` | `string` | Yes | Email subject |
| `body` | `string` | No | Rendered content |
| `status` | `string` | No | `'PENDING'` / `'SENT'` / `'FAILED'` |
| `error_message` | `string` | Yes | Error details if failed |
| `sent_at` | `string` | Yes | ISO timestamp |
| `created_at` | `string` | No | ISO timestamp |

**Source**: `NotificationLogDTO` in `types.ts:141-154`
**Extended**: `NotificationLogDetailDTO` adds `recipients` and `template` relations.

### Sub-entity: LogRecipient

| Field | Type | Nullable | Notes |
|-------|------|----------|-------|
| `id` | `number` | No | Primary key |
| `recipient_email` | `string` | No | Email address |
| `recipient_type` | `string` | No | `'admin'` / `'additional'` / `'student'` / `'parent'` |
| `status` | `string` | No | `'pending'` / `'sent'` / `'failed'` |
| `error_message` | `string` | Yes | Error details |
| `sent_at` | `string` | Yes | ISO timestamp |

## Entity: BulkMessageJob

Background job for bulk messaging.

| Field | Type | Nullable | Notes |
|-------|------|----------|-------|
| `job_id` / `id` | `number` | No | Primary key |
| `status` | `string` | No | `'queued'` / `'processing'` / `'completed'` / `'failed'` / `'cancelled'` |
| `total_recipients` | `number` | No | Total count |
| `processed_count` | `number` | No | Count processed so far |
| `success_count` | `number` | No | Count succeeded |
| `failure_count` | `number` | No | Count failed |
| `created_at` | `string` | No | ISO timestamp |
| `completed_at` | `string` | Yes | ISO timestamp |

---

## Entity State Transitions

### Notification Log Status

```
PENDING → SENT
PENDING → FAILED
```

### Bulk Job Status

```
queued → processing → completed
queued → processing → failed
queued → cancelled
```

---

## Key Relationships

- `AdminSettingsResponse` contains `settings[]` + `additional_recipients[]` (embedded, not FK)
- `NotificationLogDetailDTO` extends `NotificationLogDTO` with `recipients[]` and `template`
- `BulkMessageRequest` references `template_id` and `notification_type`
