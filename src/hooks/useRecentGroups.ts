import { useState, useEffect, useCallback } from 'react'

const RECENT_GROUPS_KEY = 'techno_recent_enrollment_groups'

export function useRecentGroups(maxRecent: number = 3) {
  const [recentGroupIds, setRecentGroupIds] = useState<number[]>([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_GROUPS_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          setRecentGroupIds(parsed)
        }
      }
    } catch (err) {
      console.error('Failed to load recent groups from localStorage:', err)
    }
  }, [])

  const addRecentGroup = useCallback((groupId: number) => {
    setRecentGroupIds(prev => {
      // Remove group if it's already in the list (so we can move it to the front)
      const filtered = prev.filter(id => id !== groupId)
      const updated = [groupId, ...filtered].slice(0, maxRecent)
      
      try {
        localStorage.setItem(RECENT_GROUPS_KEY, JSON.stringify(updated))
      } catch (err) {
        console.error('Failed to save recent groups to localStorage:', err)
      }
      
      return updated
    })
  }, [maxRecent])

  return {
    recentGroupIds,
    addRecentGroup
  }
}
