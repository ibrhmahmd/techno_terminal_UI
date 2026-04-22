// Notification Query Keys
// Centralized query key definitions for React Query

export const notificationKeys = {
  // Admin Settings
  admin: {
    all: ['notifications', 'admin'] as const,
    settings: () => [...notificationKeys.admin.all, 'settings'] as const,
    setting: (type: string) => [...notificationKeys.admin.all, 'setting', type] as const,
    recipients: () => [...notificationKeys.admin.all, 'recipients'] as const,
  },
  
  // Templates
  templates: {
    all: ['notifications', 'templates'] as const,
    list: () => [...notificationKeys.templates.all, 'list'] as const,
    detail: (id: number) => [...notificationKeys.templates.all, 'detail', id] as const,
  },
  
  // Logs
  logs: {
    all: ['notifications', 'logs'] as const,
    list: (filters?: unknown) => 
      [...notificationKeys.logs.all, 'list', filters] as const,
    detail: (id: number) => [...notificationKeys.logs.all, 'detail', id] as const,
    recipients: (logId: number) => [...notificationKeys.logs.all, 'recipients', logId] as const,
  },
  
  // Bulk
  bulk: {
    all: ['notifications', 'bulk'] as const,
    jobs: () => [...notificationKeys.bulk.all, 'jobs'] as const,
    job: (id: number) => [...notificationKeys.bulk.all, 'job', id] as const,
    activeJobs: () => [...notificationKeys.bulk.all, 'jobs', 'active'] as const,
  },
} as const
