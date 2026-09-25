# Research: Notifications Feature Audit

## Unknown 1: Centralized Query Keys

**Decision**: Add a `notifications` domain to `src/hooks/queryKeys.ts`
**Rationale**: The centralized file currently has no notification stubs. It uses a consistent pattern (`'resource', id?, 'nested?'`). Following the existing patterns (e.g., `reports`, `finance`, `directory`, `auth`), we'll add:

```ts
notifications: {
  admin: {
    all: ['notifications', 'admin'] as const,
    setting: (type: NotificationType) => ['notifications', 'admin', 'setting', type] as const,
  },
  templates: {
    all: ['notifications', 'templates'] as const,
    detail: (id: number) => ['notifications', 'templates', id] as const,
  },
  logs: {
    list: (filters: NotificationLogFilters) => ['notifications', 'logs', filters] as const,
    detail: (id: number) => ['notifications', 'logs', id] as const,
    recipients: (logId: number) => ['notifications', 'logs', logId, 'recipients'] as const,
  },
  bulk: {
    all: ['notifications', 'bulk'] as const,
    job: (id: number) => ['notifications', 'bulk', id] as const,
  },
}
```

**Alternatives considered**: Keep local file — rejected because the project convention requires centralized keys.

## Unknown 2: TemplatesTab Removal Safety

**Decision**: Safe to remove entirely
**Verification**: Grep for `TemplatesTab` across `src/` returned zero results. The component is defined at `src/components/notifications/tabs/TemplatesTab.tsx` but never imported by `NotificationsPage.tsx` or any other file. The `NotificationsPage.tsx` only imports and renders 3 tabs: `AdminSettingsTab`, `LogsTab`, `BulkMessagingTab`.

Related hooks (`useNotificationTemplates`, `useCreateTemplate`, `useUpdateTemplate`, `useDeleteTemplate`, `useTestTemplate`) are also only consumed by `TemplatesTab.tsx` — they should be removed together.

## Unknown 3: 14 Unused Hooks Removal Safety

**Decision**: All 14 hooks safe to remove
**Verification**: Each of these 14 barrel exports has zero consumers outside its own definition file and the barrel index:
- `useNotificationSetting`, `useUpdateAdminSettings`, `useToggleNotification`, `useBatchToggleNotifications` (from `useAdminSettings.ts`)
- `useToggleRecipientStatus` (from `useAdditionalRecipients.ts`)
- `useNotificationTemplate` (from `useNotificationTemplates.ts`)
- `useNotificationLog`, `useLogRecipients`, `useRetryFailed` (from `useNotificationLogs.ts`)
- `usePreviewRecipients`, `useSendBulkMessage`, `useBulkJobStatus`, `useCancelBulkJob`, `useActiveBulkJobs` (from `useBulkMessaging.ts`)

These hooks are scaffolding built for future use but never wired up.

## Unknown 4: AdminSettingsResponse.additional_recipients

**Decision**: The `useAdditionalRecipients` call can be removed
**Verification**: `AdminSettingsResponse` (line 48 of `types.ts`) includes `additional_recipients: AdditionalRecipientDTO[]`. The `useAdminSettings` hook already fetches this data. The separate `useAdditionalRecipients` call in `AdminSettingsTab.tsx:67-68` is a duplicate.

## Unknown 5: BulkMessagingTab Accessibility

**Decision**: Apply all accessibility fixes to `BulkMessagingTab.tsx` — it's a live rendered component (even as a placeholder), so it must meet the same accessibility standards.

## Additional Findings from Research

**LogStatus type** (`types.ts:123`): Defined as `'pending' | 'processing' | 'completed' | 'failed' | 'partial'` but the actual `NotificationLogDTO.status` uses `'PENDING' | 'SENT' | 'FAILED'` (uppercase, different values). `LogStatus` is unused and should be removed.

**notificationKeys.bulk.jobs()**: Never referenced. Should be removed from query keys.

**useNotificationTemplates**: Used only by dead TemplatesTab. Should be removed along with `useCreateTemplate`, `useUpdateTemplate`, `useDeleteTemplate`, `useTestTemplate`.
