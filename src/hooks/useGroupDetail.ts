import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  getEnrichedGroup,
  getDetailedLevels,
  listSessionsForGroup,
  generateLevelSessions,
  type EnrichedGroupPublic,
  type LevelDetailDTO,
  type Session,
  type GenerateLevelSessionsRequest,
} from '../api/academics'
import { extractErrorMessage } from '../utils/apiErrors'

interface UseGroupDetailReturn {
  group: EnrichedGroupPublic | null
  levels: LevelDetailDTO[]
  currentLevel: LevelDetailDTO | null
  sessions: Session[]
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
  setActiveLevel: (levelId: number) => void
  activeLevelId: number | null
  generateSessions: (data: GenerateLevelSessionsRequest) => Promise<Session[]>
}

export function useGroupDetail(groupId: number): UseGroupDetailReturn {
  const [group, setGroup] = useState<EnrichedGroupPublic | null>(null)
  const [levels, setLevels] = useState<LevelDetailDTO[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeLevelId, setActiveLevelId] = useState<number | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const groupData = await getEnrichedGroup(groupId)
      setGroup(groupData)

      // Get ALL levels (not just current level) to show historical levels
      const levelsResponse = await getDetailedLevels(groupId, -1)

      setLevels(levelsResponse.levels)

      const sessionsData = await listSessionsForGroup(groupId)
      setSessions(sessionsData)

      // Set active level to current level by default
      const current = levelsResponse.levels.find((l) => l.status === 'active')
      if (current) {
        setActiveLevelId(current.level_id)
      } else if (levelsResponse.levels.length > 0) {
        setActiveLevelId(levelsResponse.levels[levelsResponse.levels.length - 1].level_id)
      }
    } catch (err) {
      const userMessage = extractErrorMessage(err)
      console.error('[useGroupDetail] Failed:', { error: err, userMessage })
      setError(userMessage)
    } finally {
      setIsLoading(false)
    }
  }, [groupId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const currentLevel = useMemo(() => {
    return levels.find((l) => l.level_id === activeLevelId) || null
  }, [levels, activeLevelId])

  const setActiveLevel = useCallback((levelId: number) => {
    setActiveLevelId(levelId)
  }, [])

  const generateSessions = useCallback(async (data: GenerateLevelSessionsRequest): Promise<Session[]> => {
    const result = await generateLevelSessions(groupId, data)
    await fetchData()
    return result
  }, [groupId, fetchData])

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
    generateSessions,
  }
}
