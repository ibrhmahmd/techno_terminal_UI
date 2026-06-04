import { useState, useCallback, useMemo, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
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
  type CourseInfoDTO,
  type InstructorInfoDTO,
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
  coursesMap: Record<string, CourseInfoDTO>
  instructorsMap: Record<string, InstructorInfoDTO>
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

  const { data: levelsResponse, isLoading: isLoadingLevels } = useQuery({
    queryKey: queryKeys.groupLevels(groupId),
    queryFn: () => getDetailedLevels(groupId),
    enabled: groupId > 0,
    staleTime: 5 * 60 * 1000,
  })

  const { data: sessionsData, isLoading: isLoadingSessions } = useQuery({
    queryKey: queryKeys.groupSessions(groupId),
    queryFn: () => listSessionsForGroup(groupId),
    enabled: groupId > 0,
    staleTime: 5 * 60 * 1000,
  })

  const levels = levelsResponse?.levels ?? []
  const coursesMap = levelsResponse?.courses ?? {}
  const instructorsMap = levelsResponse?.instructors ?? {}
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
  }, [levels, activeLevelId, setActiveLevelId])

  const currentLevel = useMemo(() => {
    return levels.find((l) => l.level_id === activeLevelId) || null
  }, [levels, activeLevelId])

  const setActiveLevel = useCallback((levelId: number) => {
    setActiveLevelId(levelId)
  }, [])

  const refetch = () => {
    qc.invalidateQueries({ queryKey: queryKeys.group(groupId) })
  }

  const generateSessionsMutation = useMutation({
    mutationFn: (data: GenerateLevelSessionsRequest) => generateLevelSessions(groupId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.groupSessions(groupId) })
      qc.invalidateQueries({ queryKey: queryKeys.groupLevels(groupId) })
    },
  })

  const generateSessions = async (data: GenerateLevelSessionsRequest): Promise<Session[]> => {
    return generateSessionsMutation.mutateAsync(data)
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
    coursesMap,
    instructorsMap,
  }
}
