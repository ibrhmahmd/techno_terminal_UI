import { useState, useEffect, useCallback } from 'react'
import {
  getCategoryTeams,
  registerTeam,
  type TeamRegistration,
  type RegisterTeamInput,
} from '../../api/competitions'

interface UseCompetitionTeamsReturn {
  teams: TeamRegistration[]
  isLoading: boolean
  isMutating: boolean
  error: string | null
  refresh: () => Promise<void>
  register: (data: RegisterTeamInput) => Promise<TeamRegistration>
}

export function useCompetitionTeams(
  competitionId: number | string,
  categoryId: string | null
): UseCompetitionTeamsReturn {
  const [teams, setTeams] = useState<TeamRegistration[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMutating, setIsMutating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTeams = useCallback(async () => {
    if (!competitionId || competitionId === '' || !categoryId) {
      setIsLoading(false)
      setTeams([])
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const numericId = typeof competitionId === 'string' ? parseInt(competitionId, 10) : competitionId
      const data = await getCategoryTeams(numericId, categoryId)
      setTeams(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load teams')
      setTeams([])
    } finally {
      setIsLoading(false)
    }
  }, [competitionId, categoryId])

  useEffect(() => {
    fetchTeams()
  }, [fetchTeams])

  const register = useCallback(
    async (data: RegisterTeamInput) => {
      setIsMutating(true)
      try {
        const newTeam = await registerTeam(data)
        setTeams((prev) => [...prev, newTeam])
        return newTeam
      } catch (err) {
        throw err
      } finally {
        setIsMutating(false)
      }
    },
    []
  )

  return {
    teams,
    isLoading,
    isMutating,
    error,
    refresh: fetchTeams,
    register,
  }
}
