import { useState, useCallback, useMemo, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from './queryKeys'
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

interface UseGroupDetailReturn {
  group: EnrichedGroupPublic | null
  levels: LevelDetailDTO[]
  currentLevel: LevelDetailDTO | null
  sessions: Session[]
  isLoading: boolean
  error: string | null
  refetch: () => void
  setActiveLevel: (levelId: number) => void
  activeLevelId: number | null
  generateSessions: (data: GenerateLevelSessionsRequest) => Promise<Session[]>
}

export function useGroupDetail(groupId: number): UseGroupDetailReturn {
  const [activeLevelId, setActiveLevelId] = useState<number | null>(null)
  const qc = useQueryClient()

  const { data: groupData, isLoading: isLoadingGroup, error: groupError } = useQuery({
    queryKey: queryKeys.group(groupId),
    queryFn: () => getEnrichedGroup(groupId),
    enabled: groupId > 0,
    staleTime: 5 * 60 * 1000,
  })

  const { data: levelsData, isLoading: isLoadingLevels } = useQuery({
    queryKey: queryKeys.groupLevels(groupId),
    queryFn: () => getDetailedLevels(groupId).then(r => r.levels),
    enabled: groupId > 0,
    staleTime: 5 * 60 * 1000,
  })

  const { data: sessionsData, isLoading: isLoadingSessions } = useQuery({
    queryKey: queryKeys.groupSessions(groupId),
    queryFn: () => listSessionsForGroup(groupId),
    enabled: groupId > 0,
    staleTime: 5 * 60 * 1000,
  })

  const levels = levelsData ?? []
  const sessions = sessionsData ?? []
  const isLoading = isLoadingGroup || isLoadingLevels || isLoadingSessions
  const error = groupError instanceof Error ? groupError.message : null

  // Set active level to current level by default when levels load
  useEffect(() => {
    if (levels.length > 0 && activeLevelId === null) {
      const current = levels.find((l) => l.status === 'active')
      if (current) {
        setActiveLevelId(current.level_id)
      } else {
        setActiveLevelId(levels[levels.length - 1].level_id)
      }
    }
  }, [levels, activeLevelId])

  const currentLevel = useMemo(() => {
    return levels.find((l) => l.level_id === activeLevelId) || null
  }, [levels, activeLevelId])

  const setActiveLevel = useCallback((levelId: number) => {
    setActiveLevelId(levelId)
  }, [])

  const refetch = () => {
    qc.invalidateQueries({ queryKey: queryKeys.group(groupId) })
  }

  const generateSessions = async (data: GenerateLevelSessionsRequest): Promise<Session[]> => {
    const result = await generateLevelSessions(groupId, data)
    refetch()
    return result
  }

  return {
    group: groupData ?? null,
    levels,
    currentLevel,
    sessions,
    isLoading,
    error,
    refetch,
    setActiveLevel,
    activeLevelId,
    generateSessions,
  }
}
