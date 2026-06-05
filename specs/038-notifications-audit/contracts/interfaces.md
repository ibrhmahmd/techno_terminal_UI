# Interface Contracts: Notifications Feature

This feature is **frontend-only** — no external API contracts change. The TypeScript interfaces in `src/api/notifications/types.ts` are the contracts consumed by components and hooks.

## Stable Interfaces (not modified)

| Interface | File | Consumers |
|-----------|------|-----------|
| `AdminNotificationSettingDTO` | `types.ts:30` | AdminSettingsTab |
| `AdditionalRecipientDTO` | `types.ts:37` | AdminSettingsTab |
| `AdminSettingsResponse` | `types.ts:45` | useAdminSettings |
| `UpdateAdminSettingsRequest` | `types.ts:51` | (unused hook) |
| `ToggleNotificationRequest` | `types.ts:55` | AdminSettingsTab |
| `AddRecipientRequest` | `types.ts:59` | AdminSettingsTab |
| `UpdateRecipientRequest` | `types.ts:65` | AdminSettingsTab |
| `TemplateVariable` | `types.ts:76` | (via TemplatesTab — dead) |
| `NotificationTemplateDTO` | `types.ts:83` | (via TemplatesTab — dead) |
| `CreateTemplateRequest` | `types.ts:96` | (via TemplatesTab — dead) |
| `UpdateTemplateRequest` | `types.ts:105` | (via TemplatesTab — dead) |
| `TemplateTestRequest` | `types.ts:114` | (via TemplatesTab — dead) |
| `NotificationLogDTO` | `types.ts:141` | LogsTab |
| `NotificationLogDetailDTO` | `types.ts:156` | LogsTab |
| `NotificationLogFilters` | `types.ts:161` | LogsTab |
| `BulkMessagePreviewDTO` | `types.ts:191` | (via unused hook) |
| `BulkMessageRequest` | `types.ts:198` | (via unused hook) |
| `BulkMessageResponseDTO` | `types.ts:206` | (via unused hook) |
| `BulkMessageJobDTO` | `types.ts:213` | (via unused hook) |

## Interfaces for Removal

| Interface | Reason |
|-----------|--------|
| `LogStatus` (types.ts:123) | Unused — actual status in DTO uses inline strings |
| `UpdateAdminSettingsRequest` (types.ts:51) | Only consumed by unused `useUpdateAdminSettings` hook |
| Template-related request DTOs (96-118) | Only consumed by dead TemplatesTab and its unused hooks |

## API Endpoints (unchanged)

| Method | Path | Consumer |
|--------|------|----------|
| GET | `/api/v1/notifications/admin/settings` | `useAdminSettings` |
| PATCH | `/api/v1/notifications/admin/settings/{type}` | AdminSettingsTab |
| GET | `/api/v1/notifications/admin/recipients` | `useAdditionalRecipients` (to be removed) |
| POST | `/api/v1/notifications/admin/recipients` | AdminSettingsTab |
| PATCH | `/api/v1/notifications/admin/recipients/{id}` | AdminSettingsTab |
| DELETE | `/api/v1/notifications/admin/recipients/{id}` | AdminSettingsTab |
| GET | `/api/v1/notifications/templates` | (via dead hook) |
| POST | `/api/v1/notifications/templates` | (via dead hook) |
| GET | `/api/v1/notifications/templates/{id}` | (via dead hook) |
| PATCH | `/api/v1/notifications/templates/{id}` | (via dead hook) |
| DELETE | `/api/v1/notifications/templates/{id}` | (via dead hook) |
| POST | `/api/v1/notifications/templates/{id}/test` | (via dead hook) |
| GET | `/api/v1/notifications/logs` | `useNotificationLogs` |
| GET | `/api/v1/notifications/logs/{id}` | (via dead hook) |
| GET | `/api/v1/notifications/logs/{id}/recipients` | (via dead hook) |
| POST | `/api/v1/notifications/logs/{id}/retry` | (via dead hook) |
| POST | `/api/v1/notifications/bulk/preview` | (via dead hook) |
| POST | `/api/v1/notifications/bulk/send` | (via dead hook) |
| GET | `/api/v1/notifications/bulk/jobs/{id}` | (via dead hook) |
| POST | `/api/v1/notifications/bulk/jobs/{id}/cancel` | (via dead hook) |
| GET | `/api/v1/notifications/bulk/jobs/active` | (via dead hook) |
