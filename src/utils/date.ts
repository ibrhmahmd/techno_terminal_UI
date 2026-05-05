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
