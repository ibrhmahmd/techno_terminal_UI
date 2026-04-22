import { useState, useEffect, useCallback } from 'react'
import {
  getGroupCompetitions,
  getGroupTeams,
  linkTeamToGroup,
  registerForCompetition,
  completeCompetitionParticipation,
  withdrawFromCompetition,
  getGroupCompetitionAnalytics,
  type CompetitionParticipationDTO,
  type TeamPublic,
  type GroupCompetitionHistoryResponseDTO,
  type LinkTeamResponse,
  type CompetitionRegistrationResponse,
  type CompleteParticipationResponse,
  type WithdrawParticipationResponse,
} from '../api/academics'
import { getTeams, type TeamDTO } from '../api/teams'

interface UseGroupCompetitionsReturn {
  // Data
  teams: TeamPublic[]
  availableTeams: TeamDTO[]
  competitions: CompetitionParticipationDTO[]
  competitionAnalytics: GroupCompetitionHistoryResponseDTO | null

  // Loading states
  isLoadingTeams: boolean
  isLoadingAvailableTeams: boolean
  isLoadingCompetitions: boolean
  isLoadingAnalytics: boolean
  error: string | null

  // Actions
  linkTeam: (teamId: number) => Promise<LinkTeamResponse>
  registerForCompetition: (
    competitionId: number,
    teamId: number,
    categoryId?: number
  ) => Promise<CompetitionRegistrationResponse>
  completeParticipation: (
    participationId: number,
    finalPlacement?: number
  ) => Promise<CompleteParticipationResponse>
  withdrawFromCompetition: (
    participationId: number,
    reason?: string
  ) => Promise<WithdrawParticipationResponse>

  // Refresh
  refresh: () => Promise<void>
}

export function useGroupCompetitions(groupId: number): UseGroupCompetitionsReturn {
  const [teams, setTeams] = useState<TeamPublic[]>([])
  const [availableTeams, setAvailableTeams] = useState<TeamDTO[]>([])
  const [competitions, setCompetitions] = useState<CompetitionParticipationDTO[]>([])
  const [competitionAnalytics, setCompetitionAnalytics] = useState<GroupCompetitionHistoryResponseDTO | null>(null)

  const [isLoadingTeams, setIsLoadingTeams] = useState(true)
  const [isLoadingAvailableTeams, setIsLoadingAvailableTeams] = useState(true)
  const [isLoadingCompetitions, setIsLoadingCompetitions] = useState(true)
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoadingTeams(true)
    setIsLoadingCompetitions(true)
    setIsLoadingAnalytics(true)
    setError(null)

    try {
      const [teamsData, competitionsData, analyticsData] = await Promise.all([
        getGroupTeams(groupId),
        getGroupCompetitions(groupId),
        getGroupCompetitionAnalytics(groupId),
      ])

      setTeams(Array.isArray(teamsData) ? teamsData : [])
      setCompetitions(Array.isArray(competitionsData) ? competitionsData : [])
      setCompetitionAnalytics(analyticsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load competitions data')
    } finally {
      setIsLoadingTeams(false)
      setIsLoadingCompetitions(false)
      setIsLoadingAnalytics(false)
    }
  }, [groupId])

  const fetchAvailableTeams = useCallback(async () => {
    setIsLoadingAvailableTeams(true)
    try {
      // Get unique competition IDs from the group's competitions
      const competitionIds = [...new Set(competitions.map(c => c.competition_id).filter(Boolean))]
      
      if (competitionIds.length === 0) {
        console.log('[useGroupCompetitions] No competitions found, skipping available teams fetch')
        setAvailableTeams([])
        return
      }
      
      console.log(`[useGroupCompetitions] Fetching teams for competitions: ${competitionIds.join(', ')}`)
      
      // Fetch teams for each competition
      const teamsPromises = competitionIds.map(compId => 
        getTeams({ competition_id: compId }).catch(err => {
          console.error(`[useGroupCompetitions] Failed to fetch teams for competition ${compId}:`, err)
          return []
        })
      )
      
      const teamsArrays = await Promise.all(teamsPromises)
      const allTeams = teamsArrays.flat()
      
      // Deduplicate by team ID
      const uniqueTeams = [...new Map(allTeams.map(t => [t.id, t])).values()]
      
      // Filter teams that are not already linked to this group
      const linkedTeamIds = new Set(teams.map(t => t.id))
      const availableTeamsFiltered = uniqueTeams.filter((t: TeamDTO) => !linkedTeamIds.has(t.id))
      
      console.log(`[useGroupCompetitions] Found ${availableTeamsFiltered.length} available teams from ${competitionIds.length} competitions`)
      setAvailableTeams(availableTeamsFiltered)
    } catch (err) {
      console.error('[useGroupCompetitions] Failed to load available teams:', err)
      setAvailableTeams([])
    } finally {
      setIsLoadingAvailableTeams(false)
    }
  }, [competitions, teams])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    if (!isLoadingTeams) {
      fetchAvailableTeams()
    }
  }, [isLoadingTeams, fetchAvailableTeams])

  const linkTeamAction = useCallback(async (teamId: number): Promise<LinkTeamResponse> => {
    const result = await linkTeamToGroup(groupId, teamId)
    await fetchData()
    return result
  }, [groupId, fetchData])

  const registerAction = useCallback(
    async (competitionId: number, teamId: number, categoryId?: number): Promise<CompetitionRegistrationResponse> => {
      const result = await registerForCompetition(groupId, competitionId, teamId, categoryId)
      await fetchData()
      return result
    },
    [groupId, fetchData]
  )

  const completeAction = useCallback(
    async (participationId: number, finalPlacement?: number): Promise<CompleteParticipationResponse> => {
      const result = await completeCompetitionParticipation(groupId, participationId, finalPlacement)
      await fetchData()
      return result
    },
    [groupId, fetchData]
  )

  const withdrawAction = useCallback(
    async (participationId: number, reason?: string): Promise<WithdrawParticipationResponse> => {
      const result = await withdrawFromCompetition(groupId, participationId, reason)
      await fetchData()
      return result
    },
    [groupId, fetchData]
  )

  return {
    teams,
    availableTeams,
    competitions,
    competitionAnalytics,
    isLoadingTeams,
    isLoadingAvailableTeams,
    isLoadingCompetitions,
    isLoadingAnalytics,
    error,
    linkTeam: linkTeamAction,
    registerForCompetition: registerAction,
    completeParticipation: completeAction,
    withdrawFromCompetition: withdrawAction,
    refresh: fetchData,
  }
}
