/**
 * Format time string to HH:MM format
 * Handles both simple HH:MM strings and full datetime strings
 */
export function formatTime(timeStr: string): string {
  if (!timeStr) return ''
  // If time is in simple HH:MM format, parse and convert to 12h
  if (/^\d{1,2}:\d{2}$/.test(timeStr)) {
    const [hours, minutes] = timeStr.split(':').map(Number)
    const date = new Date()
    date.setHours(hours, minutes)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  }
  // If it's a full datetime string, extract just the time
  try {
    const date = new Date(timeStr)
    if (isNaN(date.getTime())) return timeStr
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  } catch {
    return timeStr
  }
}

/**
 * Get initials from a full name (first letter of each word)
 * Returns '?' for empty/undefined names
 */
export function getInitials(name: string | undefined | null, fallback = '?'): string {
  if (!name || typeof name !== 'string') return fallback
  return name
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || fallback
}

/**
 * Format a name as initials with length limit
 * Same as getInitials but defaults to empty string
 */
export function formatInitials(name: string | undefined | null): string {
  if (!name) return 'N/A'
  return name.split(' ').map(n => n[0]).join('') || 'N/A'
}

/**
 * Format date to localized string
 */
export function formatDate(dateString: string | Date | null | undefined, options?: Intl.DateTimeFormatOptions): string {
  if (dateString == null) return ''
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString
  if (isNaN(date.getTime())) return ''
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }
  
  return date.toLocaleDateString('en-US', options || defaultOptions)
}

/**
 * Format date to short format (Month Day)
 */
export function formatShortDate(dateString: string | Date): string {
  return formatDate(dateString, { month: 'short', day: 'numeric' })
}

/**
 * Get today's date as ISO string (YYYY-MM-DD)
 */
export function getTodayISO(): string {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Normalize a time input string to HH:MM:00 format with zero-padded hours.
 * Returns null for empty/null input.
 */
export function formatTimeInput(value: string | null): string | null {
  if (!value) return null
  const trimmed = value.trim()
  if (!trimmed) return null

  const parts = trimmed.split(':')
  if (parts.length < 2) return null

  const hours = Number(parts[0])
  const minutes = parts[1]

  if (isNaN(hours) || hours < 0 || hours > 23) return null

  return `${String(hours).padStart(2, '0')}:${minutes}:00`
}

/**
 * Display a time string as HH:MM.
 * Returns '--:--' for null/undefined values.
 */
export function formatTimeDisplay(value: string | null | undefined): string {
  if (!value) return '--:--'
  return value.slice(0, 5)
}

/**
 * Format a full name to First Name + Last Initial (e.g., "Ibrahim Ahmd" -> "Ibrahim A.")
 */
export function formatInstructorName(fullName: string | undefined | null): string {
  if (!fullName) return 'TBA'
  const parts = fullName.trim().split(/\s+/)
  if (parts.length <= 1) return parts[0]
  return `${parts[0]} ${parts[1][0]}.`
}
