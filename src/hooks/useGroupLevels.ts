import { useState, useEffect, useCallback } from 'react'
import {
  getDetailedLevels,
  type DetailedLevelsResponse,
  type LevelDetailDTO,
} from '../api/academics'
import { extractErrorMessage } from '../utils/apiErrors'

interface UseGroupLevelsReturn {
  levels: LevelDetailDTO[]
  courses: DetailedLevelsResponse['courses']
  instructors: DetailedLevelsResponse['instructors']
  currentLevel: LevelDetailDTO | null
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useGroupLevels(groupId: number): UseGroupLevelsReturn {
  const [data, setData] = useState<DetailedLevelsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!groupId) {
      console.error('[useGroupLevels] Invalid groupId:', groupId)
      setIsLoading(false)
      return
    }

    console.log(`[useGroupLevels] Starting fetch for groupId: ${groupId}`)
    setIsLoading(true)
    setError(null)
    try {
      let response
      try {
        response = await getDetailedLevels(groupId, 1)
      } catch {
        response = await getDetailedLevels(groupId)
      }
      console.log(`[useGroupLevels] Success for groupId: ${groupId}`, {
        levelsCount: response.levels.length,
        coursesCount: Object.keys(response.courses).length,
        instructorsCount: Object.keys(response.instructors).length,
      })
      setData(response)
    } catch (err) {
      const userMessage = extractErrorMessage(err)
      console.error(`[useGroupLevels] Failed for groupId: ${groupId}`, {
        error: err,
        userMessage,
        url: `/academics/groups/${groupId}/levels/detailed`,
      })
      setError(userMessage)
    } finally {
      setIsLoading(false)
    }
  }, [groupId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Find current level (active status or most recent)
  const currentLevel = data?.levels.find(l => l.status === 'active') ||
    data?.levels[data.levels.length - 1] ||
    null

  return {
    levels: data?.levels ?? [],
    courses: data?.courses ?? {},
    instructors: data?.instructors ?? {},
    currentLevel,
    isLoading,
    error,
    refresh: fetchData,
  }
}
