export function getUpcomingDates(count: number = 7): string[] {
  const dates: string[] = []
  const today = new Date()
  
  for (let i = 0; i < count; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    dates.push(date.toISOString().split('T')[0])
  }
  
  return dates
}

export function getTodayISO(): string {
  return new Date().toISOString().split('T')[0]
}

export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return 'N/A'
  const defaultOptions: Intl.DateTimeFormatOptions = {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }
  return d.toLocaleDateString('en-US', options ?? defaultOptions)
}
