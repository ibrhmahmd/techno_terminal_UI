import { useState, useCallback } from 'react'

/**
 * Tracks recently selected groups for quick enrollment.
 * Uses component-level state (no localStorage).
 */
interface UseRecentGroupsResult {
  recentGroupIds: number[]
  addRecentGroup: (groupId: number) => void
}

export function useRecentGroups(): UseRecentGroupsResult {
  const [recentGroupIds, setRecentGroupIds] = useState<number[]>([])

  const addRecentGroup = useCallback((groupId: number) => {
    setRecentGroupIds((prev) => {
      const filtered = prev.filter((id) => id !== groupId)
      return [groupId, ...filtered].slice(0, 5)
    })
  }, [])

  return { recentGroupIds, addRecentGroup }
}
