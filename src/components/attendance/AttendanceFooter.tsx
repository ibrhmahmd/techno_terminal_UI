import { LoadingSpinner } from '../common/LoadingSpinner'

interface AttendanceFooterProps {
  isSaving: boolean
  onCancel: () => void
  onSave: () => void
  hasChanges?: boolean
  saveStatus?: Map<number, 'idle' | 'saving' | 'success' | 'error'>
  onRetrySession?: (sessionId: number) => void
  dirtySessions?: Set<number>
}

export function AttendanceFooter({ 
  isSaving, 
  onCancel, 
  onSave, 
  hasChanges = false,
  saveStatus = new Map(),
  onRetrySession,
  dirtySessions = new Set()
}: AttendanceFooterProps) {
  // Get failed sessions for retry
  const failedSessions = Array.from(dirtySessions).filter(
    sessionId => saveStatus.get(sessionId) === 'error'
  )

  return (
    <div className={`p-4 bg-surface-container-low border-t border-outline-variant/10 flex flex-col gap-3 transition-all duration-300 ${
      hasChanges ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none h-0 py-0 overflow-hidden'
    }`}>
      {/* Failed sessions retry buttons */}
      {failedSessions.length > 0 && onRetrySession && (
        <div className="flex flex-wrap gap-2 items-center text-sm">
          <span className="text-error font-semibold">Failed to save:</span>
          {failedSessions.map(sessionId => (
            <button
              key={sessionId}
              onClick={() => onRetrySession(sessionId)}
              disabled={isSaving}
              className="px-2 py-1 rounded bg-error-container text-on-error-container text-xs font-semibold hover:opacity-80 transition-opacity disabled:opacity-50 flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-xs" aria-hidden="true">refresh</span>
              Session {sessionId}
            </button>
          ))}
        </div>
      )}
      
      {/* Main action buttons */}
      {hasChanges && (
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded text-sm font-semibold text-outline hover:text-secondary transition-colors"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            onClick={onSave}
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
                <span className="material-symbols-outlined text-sm" aria-hidden="true">save</span>
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
