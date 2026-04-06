import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  getEnrichedGroup,
  getGroupLevels,
  listSessionsForGroup,
  type EnrichedGroupPublic,
  type GroupLevelHistoryDTO,
  type Session,
} from '../api/academics'

interface UseGroupDetailReturn {
  group: EnrichedGroupPublic | null
  levels: GroupLevelHistoryDTO[]
  currentLevel: GroupLevelHistoryDTO | null
  sessions: Session[]
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
  setActiveLevel: (levelId: number) => void
  activeLevelId: number | null
}

export function useGroupDetail(groupId: number): UseGroupDetailReturn {
  const [group, setGroup] = useState<EnrichedGroupPublic | null>(null)
  const [levels, setLevels] = useState<GroupLevelHistoryDTO[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeLevelId, setActiveLevelId] = useState<number | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [groupData, levelsData, sessionsData] = await Promise.all([
        getEnrichedGroup(groupId),
        getGroupLevels(groupId),
        listSessionsForGroup(groupId),
      ])
      setGroup(groupData)
      console.log('[DEBUG] GroupDetail loaded:', {
        id: groupData.id,
        name: groupData.name,
        group_name: (groupData as any).group_name
      })
      setLevels(levelsData)
      setSessions(sessionsData)

      // Set active level to current level by default
      const current = levelsData.find((l) => !l.end_date)
      if (current) {
        setActiveLevelId(current.id)
      } else if (levelsData.length > 0) {
        setActiveLevelId(levelsData[levelsData.length - 1].id)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load group details')
    } finally {
      setIsLoading(false)
    }
  }, [groupId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const currentLevel = useMemo(() => {
    return levels.find((l) => l.id === activeLevelId) || null
  }, [levels, activeLevelId])

  const setActiveLevel = useCallback((levelId: number) => {
    setActiveLevelId(levelId)
  }, [])

  return {
    group,
    levels,
    currentLevel,
    sessions,
    isLoading,
    error,
    refresh: fetchData,
    setActiveLevel,
    activeLevelId,
  }
}
