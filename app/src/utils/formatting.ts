/**
 * Format time string to HH:MM format
 * Handles both simple HH:MM strings and full datetime strings
 */
export function formatTime(timeStr: string): string {
  if (!timeStr) return ''
  // If time is already in simple HH:MM format, return as-is
  if (/^\d{1,2}:\d{2}$/.test(timeStr)) {
    return timeStr
  }
  // If it's a full datetime string, extract just the time
  try {
    const date = new Date(timeStr)
    if (isNaN(date.getTime())) return timeStr
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
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
export function formatDate(dateString: string | Date, options?: Intl.DateTimeFormatOptions): string {
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
  return new Date().toISOString().split('T')[0]
}
