// Notifications Hooks barrel export
// React Query hooks for notifications API

export { notificationKeys } from './queryKeys'

// Admin Settings
export {
  useAdminSettings,
  useNotificationSetting,
  useUpdateAdminSettings,
  useToggleNotification,
  useBatchToggleNotifications,
} from './useAdminSettings'

// Additional Recipients
export {
  useAdditionalRecipients,
  useAddRecipient,
  useUpdateRecipient,
  useDeleteRecipient,
  useToggleRecipientStatus,
} from './useAdditionalRecipients'

// Templates
export {
  useNotificationTemplates,
  useNotificationTemplate,
  useCreateTemplate,
  useUpdateTemplate,
  useDeleteTemplate,
  useTestTemplate,
} from './useNotificationTemplates'

// Logs
export {
  useNotificationLogs,
  useNotificationLog,
  useLogRecipients,
  useRetryFailed,
} from './useNotificationLogs'

// Bulk Messaging
export {
  usePreviewRecipients,
  useSendBulkMessage,
  useBulkJobStatus,
  useCancelBulkJob,
  useActiveBulkJobs,
} from './useBulkMessaging'
