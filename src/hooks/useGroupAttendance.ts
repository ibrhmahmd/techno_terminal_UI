import { useQuery } from '@tanstack/react-query'
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
    queryKey: ['groups', groupId, 'attendance', levelNumber],
    queryFn: async () => {
      if (!levelNumber) throw new Error('Level number is required')
      const result = await getAttendanceForLevel(groupId, levelNumber)
      console.log('[DEBUG Group Detail] Raw API response:', {
        groupId,
        levelNumber,
        rosterCount: result.roster?.length || 0,
        sessions: result.sessions?.map(s => ({
          sessionId: s.session_id,
          date: s.date,
          attendanceEntries: Object.entries(s.attendance || {}).map(([studentId, status]) => ({
            studentId,
            status
          })),
          presentCount: Object.values(s.attendance || {}).filter(st => st === 'present').length,
          absentCount: Object.values(s.attendance || {}).filter(st => st === 'absent').length,
          excusedCount: Object.values(s.attendance || {}).filter(st => st === 'excused').length,
          lateCount: Object.values(s.attendance || {}).filter(st => st === 'late').length,
        }))
      })
      return result
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
