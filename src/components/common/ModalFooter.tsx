import { LoadingSpinner } from './LoadingSpinner'

interface ModalFooterProps {
  /** Cancel button click handler */
  onCancel: () => void
  /** Confirm button click handler */
  onConfirm: () => void
  /** Cancel button text */
  cancelText?: string
  /** Confirm button text */
  confirmText?: string
  /** Visual variant for confirm button */
  variant?: 'default' | 'danger'
  /** Whether confirm action is in progress */
  isProcessing?: boolean
  /** Disable confirm button */
  confirmDisabled?: boolean
  /** Disable cancel button */
  cancelDisabled?: boolean
  /** Additional CSS classes for the container */
  className?: string
}

/**
 * ModalFooter - Standardized modal footer with Cancel/Confirm buttons
 * 
 * Provides consistent button layout and styling for modal dialogs.
 * Supports danger variants and loading states.
 * 
 * @example
 * // Standard usage
 * <ModalFooter
 *   onCancel={() => setIsOpen(false)}
 *   onConfirm={handleDelete}
 *   confirmText="Delete"
 *   variant="danger"
 *   isProcessing={isDeleting}
 * />
 * 
 * @example
 * // With custom button text
 * <ModalFooter
 *   onCancel={onClose}
 *   onConfirm={onSave}
 *   cancelText="Discard"
 *   confirmText="Save Changes"
 * />
 */
export function ModalFooter({
  onCancel,
  onConfirm,
  cancelText = 'Cancel',
  confirmText = 'Confirm',
  variant = 'default',
  isProcessing = false,
  confirmDisabled = false,
  cancelDisabled = false,
  className = ''
}: ModalFooterProps) {
  const confirmClasses = variant === 'danger'
    ? 'bg-red-600 hover:bg-red-700 text-white'
    : 'bg-slate-900 hover:bg-slate-800 text-white'

  return (
    <div className={`flex justify-end gap-3 ${className}`}>
      <button
        onClick={onCancel}
        disabled={cancelDisabled || isProcessing}
        className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
      >
        {cancelText}
      </button>
      <button
        onClick={onConfirm}
        disabled={confirmDisabled || isProcessing}
        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 ${confirmClasses}`}
      >
        {isProcessing && <LoadingSpinner size="sm" />}
        {confirmText}
      </button>
    </div>
  )
}
