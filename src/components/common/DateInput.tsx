// DateInput.tsx
// Custom date input component that displays DD-MM-YYYY format
// while internally handling ISO format (YYYY-MM-DD) for API compatibility

import { useState, useEffect, useRef } from 'react'

interface DateInputProps {
  id?: string
  value: string | null | undefined
  onChange: (value: string | null) => void
  label?: string
  disabled?: boolean
  placeholder?: string
  required?: boolean
}

/**
 * Convert ISO date (YYYY-MM-DD) to display format (DD-MM-YYYY)
 */
function isoToDisplay(isoDate: string | null | undefined): string {
  if (!isoDate) return ''
  const parts = isoDate.split('-')
  if (parts.length !== 3) return ''
  const [year, month, day] = parts
  return `${day}-${month}-${year}`
}

/**
 * Convert display format (DD-MM-YYYY) to ISO date (YYYY-MM-DD)
 * Returns null if invalid or incomplete
 */
function displayToIso(displayDate: string): string | null {
  if (!displayDate) return null
  const parts = displayDate.split('-')
  if (parts.length !== 3) return null
  const [day, month, year] = parts
  
  // Validate day and month
  const dayNum = parseInt(day, 10)
  const monthNum = parseInt(month, 10)
  const yearNum = parseInt(year, 10)
  
  if (isNaN(dayNum) || isNaN(monthNum) || isNaN(yearNum)) return null
  if (dayNum < 1 || dayNum > 31) return null
  if (monthNum < 1 || monthNum > 12) return null
  if (yearNum < 1900 || yearNum > 2100) return null
  
  // Pad with zeros
  const paddedDay = day.padStart(2, '0')
  const paddedMonth = month.padStart(2, '0')
  
  return `${year}-${paddedMonth}-${paddedDay}`
}

/**
 * Check if a string looks like a valid display date (DD-MM-YYYY)
 */
function isValidDisplayFormat(value: string): boolean {
  if (!value) return true // Empty is valid
  const regex = /^(\d{1,2})-(\d{1,2})-(\d{4})$/
  return regex.test(value)
}

export function DateInput({
  id,
  value,
  onChange,
  label,
  disabled = false,
  placeholder = 'DD-MM-YYYY',
  required = false,
}: DateInputProps) {
  // Track internal display state so incomplete dates aren't wiped
  const [displayValue, setDisplayValue] = useState(() => isoToDisplay(value))
  const isTyping = useRef(false)

  // Sync from external value changes (e.g., form reset), but not while user is typing
  useEffect(() => {
    if (!isTyping.current) {
      setDisplayValue(isoToDisplay(value))
    }
  }, [value])
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    isTyping.current = true
    
    // Allow empty value
    if (!inputValue) {
      setDisplayValue('')
      onChange(null)
      return
    }
    
    // Auto-add hyphens as user types
    let formatted = inputValue.replace(/[^\d-]/g, '')
    
    // Remove extra hyphens
    formatted = formatted.replace(/-+/g, '-')
    
    // Auto-format: add hyphen after day and month
    const digitsOnly = formatted.replace(/-/g, '')
    if (digitsOnly.length > 0) {
      let result = ''
      if (digitsOnly.length <= 2) {
        result = digitsOnly
      } else if (digitsOnly.length <= 4) {
        result = digitsOnly.slice(0, 2) + '-' + digitsOnly.slice(2)
      } else {
        result = digitsOnly.slice(0, 2) + '-' + digitsOnly.slice(2, 4) + '-' + digitsOnly.slice(4, 8)
      }
      formatted = result
    }
    
    // Update display immediately so user sees what they typed
    setDisplayValue(formatted)
    
    // Only propagate valid complete dates to parent
    if (isValidDisplayFormat(formatted)) {
      const isoValue = displayToIso(formatted)
      onChange(isoValue)
    }
  }
  
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    isTyping.current = false
    const inputValue = e.target.value
    
    if (!inputValue) {
      onChange(null)
      return
    }
    
    // Validate on blur - if invalid, try to convert what we have
    if (isValidDisplayFormat(inputValue)) {
      const isoValue = displayToIso(inputValue)
      onChange(isoValue)
    } else {
      // Invalid/incomplete - reset to last valid external value
      setDisplayValue(isoToDisplay(value))
      // If there was no previous valid value, clear it
      if (!value) {
        onChange(null)
      }
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-on-surface">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        id={id}
        type="text"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        maxLength={10}
        className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-on-surface placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all disabled:bg-slate-50 disabled:cursor-not-allowed"
      />
    </div>
  )
}
