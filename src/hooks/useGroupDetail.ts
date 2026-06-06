import { useState, useCallback, useMemo } from 'react'
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
  const [userActiveLevelId, setActiveLevelId] = useState<number | null>(null)
  const qc = useQueryClient()

  const { data: groupData, isLoading: isLoadingGroup, error: groupError } = useQuery({
    queryKey: queryKeys.group(groupId),
    queryFn: () => getEnrichedGroup(groupId),
    enabled: groupId > 0,
    staleTime: 5 * 60 * 1000,
  })

  const { data: levelsResponse, isLoading: isLoadingLevels, error: levelsError } = useQuery({
    queryKey: queryKeys.groupLevels(groupId),
    queryFn: () => getDetailedLevels(groupId),
    enabled: groupId > 0,
    staleTime: 5 * 60 * 1000,
  })

  const { data: sessionsData, isLoading: isLoadingSessions, error: sessionsError } = useQuery({
    queryKey: queryKeys.groupSessions(groupId),
    queryFn: () => listSessionsForGroup(groupId),
    enabled: groupId > 0,
    staleTime: 5 * 60 * 1000,
  })

  const levels = useMemo(() => levelsResponse?.levels ?? [], [levelsResponse])
  const coursesMap = useMemo(() => levelsResponse?.courses ?? {}, [levelsResponse])
  const instructorsMap = useMemo(() => levelsResponse?.instructors ?? {}, [levelsResponse])
  const sessions = sessionsData ?? []
  const isLoading = isLoadingGroup || isLoadingLevels || isLoadingSessions
  const combinedError = [groupError, levelsError, sessionsError].find(e => e instanceof Error)
  const error = combinedError instanceof Error ? combinedError.message : null

  // Derive active level: user preference, or first active level, or last level
  const activeLevelId = useMemo(() => {
    if (userActiveLevelId !== null) return userActiveLevelId
    if (levels.length === 0) return null
    const current = levels.find((l) => l.status === 'active')
    return current ? current.level_id : levels[levels.length - 1].level_id
  }, [userActiveLevelId, levels])

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
