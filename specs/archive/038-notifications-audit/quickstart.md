# Quickstart: Notifications Audit Fix

## Order of Operations

### Step 1: Fix Runtime Bugs
1. **TemplatesTab.tsx:82** — Change `{template.variables.length}` → `{(template.variables?.length ?? 0)}`
2. **TemplatesTab.tsx:361** — Change `const [variables] = useState(...)` → `const variables: Record<string, string> = {}`
3. **AdminSettingsTab.tsx:93** — Replace `console.error(...)` with proper error state/toast

### Step 2: Remove Dead Code
1. Verify zero imports for each target file (already confirmed)
2. Remove `src/components/notifications/tabs/TemplatesTab.tsx` (entire file)
3. Remove unused hooks from barrel `src/hooks/notifications/index.ts`:
   - Remove these named exports: `useNotificationSetting`, `useUpdateAdminSettings`, `useToggleNotification`, `useBatchToggleNotifications`, `useToggleRecipientStatus`, `useNotificationTemplate`, `useNotificationLog`, `useLogRecipients`, `useRetryFailed`, `usePreviewRecipients`, `useSendBulkMessage`, `useBulkJobStatus`, `useCancelBulkJob`, `useActiveBulkJobs`
4. Remove dead hook definition files:
   - `src/hooks/notifications/useAdditionalRecipients.ts` (only contains unused `useToggleRecipientStatus`)
   - (Keep `useAdminSettings.ts` — `useAdminSettings` is active, only remove the 4 unused exports from barrel)
   - (Keep `useNotificationTemplates.ts` — even though dead, verify first since hooks share files)
   - (Keep `useNotificationLogs.ts` — `useNotificationLogs` is active in LogsTab)
   - (Keep `useBulkMessaging.ts` — `useBulkMessaging` may have active exports, verify before removing)
5. Remove `LogStatus` type from `src/api/notifications/types.ts:123`
6. Remove unused query key `notificationKeys.bulk.jobs()` from notification query keys

### Step 3: Fix TypeScript Violations
1. **TemplatesTab.tsx:135** — Replace `data as CreateTemplateRequest` with validated data (but this file is being removed in Step 2, so this becomes moot)
2. **NotificationsPage.tsx:19** — Replace `as TabId` with runtime guard
3. **TemplatesTab.tsx:355** — Remove `templateId` from `TestModalProps` (file being removed, moot)

### Step 4: Fix Data Fetching Anti-Patterns
1. **AdminSettingsTab.tsx** — Remove `useAdditionalRecipients()` call, use `settings.additional_recipients`
2. **AdminSettingsTab.tsx** — Replace direct `toggleNotification()` call with `useToggleNotification` mutation hook
3. **Make shared**: Create retry button ref for LogsTab error state
4. **Migrate notification keys**: Add `notifications` domain to `src/hooks/queryKeys.ts`, update all imports from `../../hooks/notifications/queryKeys` → `../../queryKeys`

### Step 5: Fix Accessibility
1. Add `aria-label` to all 7 icon-only buttons
2. Add `aria-hidden="true"` to all 10 decorative icons
3. Wire `htmlFor`/`id` for all 4 label-input pairs
4. Add `role="tabpanel"` + `aria-labelledby` to tab panels in `NotificationsPage.tsx`
5. Wrap each tab panel in `<ErrorBoundary>`
6. Add retry button to LogsTab error state

### Step 6: Update Barrel Exports
After removing dead entries, update `src/hooks/notifications/index.ts` to only export:
```ts
export { useAdminSettings } from './useAdminSettings'
export { useToggleRecipientStatus } from './useAdditionalRecipients'
export { useNotificationTemplates, useCreateTemplate, useUpdateTemplate, useDeleteTemplate, useTestTemplate } from './useNotificationTemplates'
export { useNotificationLogs } from './useNotificationLogs'
export { useBulkMessaging } from './useBulkMessaging'
```

## Verification

```bash
npm run build        # Must pass with zero errors
npm run lint         # Must pass with zero errors
npm run test         # Existing tests must still pass
```
