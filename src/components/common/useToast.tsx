import { useCallback, useMemo, useState } from 'react'
import { Toast } from './Toast'

// Hook for managing toast
export function useToast() {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type })
  }, [])

  const hideToast = useCallback(() => setToast(null), [])

  const ToastComponent = useMemo(
    () =>
      toast ? (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      ) : null,
    [toast, hideToast]
  )

  return {
    toast,
    showToast,
    hideToast,
    ToastComponent,
  }
}
