import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5 min default — overridden per query
      gcTime: 30 * 60 * 1000,        // Keep unused data for 30 min
      retry: 1,                       // Retry once on failure
      refetchOnWindowFocus: false,    // Don't refetch just because user alt-tabs
    },
    mutations: {
      retry: 0,                       // Never retry mutations automatically
    },
  },
})
