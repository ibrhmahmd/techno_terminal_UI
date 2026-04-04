import { useCallback, useEffect, useMemo, useState } from 'react'

interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'info'
  duration?: number
  onClose?: () => void
}

export function Toast({ message, type = 'info', duration = 3000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      onClose?.()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const bgColors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  }

  const icons = {
    success: 'check_circle',
    error: 'error',
    info: 'info',
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-2 fade-in duration-200">
      <div className={`${bgColors[type]} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[200px]`}>
        <span className="material-symbols-outlined text-sm">{icons[type]}</span>
        <span className="text-sm font-medium">{message}</span>
        <button
          onClick={() => setIsVisible(false)}
          className="ml-2 text-white/80 hover:text-white"
        >
          <span className="material-symbols-outlined text-sm">close</span>
        </button>
      </div>
    </div>
  )
}

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
