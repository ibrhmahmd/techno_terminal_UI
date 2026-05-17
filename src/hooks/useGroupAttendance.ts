import { useQuery } from '@tanstack/react-query'
import { queryKeys } from './queryKeys'
import { getAttendanceForLevel } from '../api/academics'

interface UseGroupAttendanceOptions {
  enabled?: boolean
}

/**
 * Hook to fetch consolidated attendance data for a group level
 * Replaces multiple API calls with a single consolidated endpoint
 */
export function useGroupAttendance(
  groupId: number,
  levelNumber: number | null | undefined,
  options: UseGroupAttendanceOptions = {}
) {
  const { enabled = true } = options

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.groupAttendance(groupId, levelNumber ?? 0),
    queryFn: async () => {
      if (!levelNumber) throw new Error('Level number is required')
      return getAttendanceForLevel(groupId, levelNumber)
    },
    enabled: !!groupId && !!levelNumber && enabled,
    staleTime: 60 * 1000, // 1 minute - attendance changes frequently
    gcTime: 5 * 60 * 1000, // 5 minutes garbage collection
  })

  return {
    roster: data?.roster ?? [],
    sessions: data?.sessions ?? [],
    generatedAt: data?.generated_at,
    cacheTtl: data?.cache_ttl,
    isLoading,
    error: error instanceof Error ? error.message : error ? String(error) : null,
    refresh: refetch,
  }
}

export type { UseGroupAttendanceOptions }
