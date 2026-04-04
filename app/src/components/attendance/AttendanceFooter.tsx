import { LoadingSpinner } from '../common/LoadingSpinner'

interface AttendanceFooterProps {
  isSaving: boolean
  onCancel: () => void
  onSave: () => void
  hasError?: boolean
}

export function AttendanceFooter({ isSaving, onCancel, onSave, hasError }: AttendanceFooterProps) {
  const handleSaveClick = () => {
    console.log('[Footer] Save button clicked!')
    console.log('[Footer] Save button clicked with props:', { isSaving, onCancel, onSave, hasError })
    onSave()
  }

  const handleCancelClick = () => {
    console.log('[Footer] Cancel button clicked!')
    console.log('[Footer] Cancel button clicked with props:', { isSaving, onCancel, onSave, hasError })
    onCancel()
  }

  return (
    <div className="p-4 bg-surface-container-low border-t border-outline-variant/10 flex justify-end gap-3">
      <button
        onClick={handleCancelClick}
        className="px-4 py-2 rounded text-sm font-semibold text-outline hover:text-secondary transition-colors"
        disabled={isSaving}
      >
        Cancel
      </button>
      <button
        onClick={handleSaveClick}
        disabled={isSaving}
        className="bg-secondary text-white px-5 py-2 rounded text-sm font-bold flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {isSaving ? (
          <>
            <LoadingSpinner size="sm" />
            <span>Saving...</span>
          </>
        ) : (
          <>
            <span className="material-symbols-outlined text-sm">save</span>
            <span>Save Changes</span>
          </>
        )}
      </button>
    </div>
  )
}
