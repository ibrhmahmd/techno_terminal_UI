import { useState } from 'react'
import { useSendDailyReport } from '../hooks/useDailyReport'
import { useToast } from '../../common/Toast'

interface ReportEmailSenderProps {
  date: string
  disabled: boolean
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function ReportEmailSender({ date, disabled }: ReportEmailSenderProps) {
  const [inputValue, setInputValue] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)
  const sendMutation = useSendDailyReport()
  const { showToast, ToastComponent } = useToast()

  const parseEmails = (value: string): string[] => {
    return value
      .split(',')
      .map((e) => e.trim())
      .filter((e) => e.length > 0)
  }

  const validateEmails = (emails: string[]): boolean => {
    if (emails.length === 0) {
      setValidationError('Enter at least one email address')
      return false
    }
    if (emails.length > 100) {
      setValidationError('Maximum 100 recipients allowed')
      return false
    }
    const invalid = emails.filter((e) => !EMAIL_REGEX.test(e))
    if (invalid.length > 0) {
      setValidationError(`Invalid email format: ${invalid.join(', ')}`)
      return false
    }
    setValidationError(null)
    return true
  }

  const handleSend = async () => {
    const emails = parseEmails(inputValue)
    if (!validateEmails(emails)) return

    try {
      await sendMutation.mutateAsync({ date, recipients: emails })
      showToast('Report queued for email delivery', 'success')
      setInputValue('')
    } catch {
      showToast('Failed to send report', 'error')
    }
  }

  const handleBlur = () => {
    const emails = parseEmails(inputValue)
    if (inputValue.trim()) {
      validateEmails(emails)
    } else {
      setValidationError(null)
    }
  }

  return (
    <div className="flex-1 min-w-0">
      {ToastComponent}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <input
            type="text"
            value={inputValue}
            aria-label="Email recipients"
            onChange={(e) => {
              setInputValue(e.target.value)
              if (validationError) setValidationError(null)
            }}
            onBlur={handleBlur}
            placeholder="Enter email(s), comma-separated"
            disabled={disabled}
            className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary disabled:bg-slate-50 disabled:cursor-not-allowed ${
              validationError ? 'border-red-300' : 'border-slate-200'
            }`}
          />
          {validationError && (
            <p className="mt-1 text-xs text-red-600">{validationError}</p>
          )}
        </div>
        <button
          onClick={handleSend}
          disabled={disabled || sendMutation.isPending || !inputValue.trim()}
          className="flex items-center gap-2 px-4 py-2 bg-secondary text-white text-sm font-medium rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          <span className="material-symbols-outlined text-sm" aria-hidden="true">send</span>
          {sendMutation.isPending ? 'Sending...' : 'Send Report'}
        </button>
      </div>
    </div>
  )
}
