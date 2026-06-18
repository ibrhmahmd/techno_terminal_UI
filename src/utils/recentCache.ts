export interface RecentItem {
  id: string | number
  name: string
}

export function getRecentItems(key: string): RecentItem[] {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is RecentItem => 
        item !== null && 
        typeof item === 'object' && 
        (typeof item.id === 'string' || typeof item.id === 'number') &&
        typeof item.name === 'string'
      )
    }
  } catch {
    // ignore parsing errors and return empty list
  }
  return []
}

export function addRecentItem(key: string, item: RecentItem): void {
  try {
    const current = getRecentItems(key)
    // Filter out if it already exists to move it to the front
    const updated = [
      item,
      ...current.filter(i => i.id !== item.id)
    ].slice(0, 5)
    
    localStorage.setItem(key, JSON.stringify(updated))
  } catch {
    // ignore storage errors
  }
}
