import { useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from './queryKeys'
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
  teams: TeamPublic[]
  availableTeams: TeamDTO[]
  competitions: CompetitionParticipationDTO[]
  competitionAnalytics: GroupCompetitionHistoryResponseDTO | null
  isLoadingTeams: boolean
  isLoadingAvailableTeams: boolean
  isLoadingCompetitions: boolean
  isLoadingAnalytics: boolean
  error: string | null
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
  refetch: () => void
}

export function useGroupCompetitions(groupId: number): UseGroupCompetitionsReturn {
  const qc = useQueryClient()

  const { data: teamsData, isLoading: isLoadingTeams, error: teamsError } = useQuery({
    queryKey: queryKeys.groupTeams(groupId),
    queryFn: () => getGroupTeams(groupId),
    enabled: groupId > 0,
    staleTime: 5 * 60 * 1000,
  })

  const { data: competitionsData, isLoading: isLoadingCompetitions, error: competitionsError } = useQuery({
    queryKey: queryKeys.groupCompetitions(groupId),
    queryFn: () => getGroupCompetitions(groupId),
    enabled: groupId > 0,
    staleTime: 5 * 60 * 1000,
  })

  const { data: analyticsData, isLoading: isLoadingAnalytics } = useQuery({
    queryKey: queryKeys.groupCompetitionAnalytics(groupId),
    queryFn: () => getGroupCompetitionAnalytics(groupId),
    enabled: groupId > 0,
    staleTime: 5 * 60 * 1000,
  })

  const competitions = Array.isArray(competitionsData) ? competitionsData : []
  const teams = Array.isArray(teamsData) ? teamsData : []

  const competitionIds = [...new Set(competitions.map(c => c.competition_id).filter(Boolean))]

  const { data: availableTeamsData, isLoading: isLoadingAvailableTeams } = useQuery({
    queryKey: queryKeys.groupAvailableTeams(groupId),
    queryFn: async () => {
      if (competitionIds.length === 0) return []
      const teamsPromises = competitionIds.map(compId =>
        getTeams({ competition_id: compId }).catch(() => [])
      )
      const teamsArrays = await Promise.all(teamsPromises)
      const allTeams = teamsArrays.flat()
      const uniqueTeams = [...new Map(allTeams.map(t => [t.id, t])).values()]
      const linkedTeamIds = new Set(teams.map(t => t.id))
      return uniqueTeams.filter((t: TeamDTO) => !linkedTeamIds.has(t.id))
    },
    enabled: groupId > 0 && !isLoadingCompetitions,
    staleTime: 5 * 60 * 1000,
  })

  const error = teamsError instanceof Error ? teamsError.message
    : competitionsError instanceof Error ? competitionsError.message
    : null

  const refetch = () => {
    qc.invalidateQueries({ queryKey: queryKeys.group(groupId) })
  }

  const linkTeamAction = async (teamId: number): Promise<LinkTeamResponse> => {
    const result = await linkTeamToGroup(groupId, teamId)
    refetch()
    return result
  }

  const registerAction = async (competitionId: number, teamId: number, categoryId?: number): Promise<CompetitionRegistrationResponse> => {
    const result = await registerForCompetition(groupId, competitionId, teamId, categoryId)
    refetch()
    return result
  }

  const completeAction = async (participationId: number, finalPlacement?: number): Promise<CompleteParticipationResponse> => {
    const result = await completeCompetitionParticipation(groupId, participationId, finalPlacement)
    refetch()
    return result
  }

  const withdrawAction = async (participationId: number, reason?: string): Promise<WithdrawParticipationResponse> => {
    const result = await withdrawFromCompetition(groupId, participationId, reason)
    refetch()
    return result
  }

  return {
    teams,
    availableTeams: availableTeamsData ?? [],
    competitions,
    competitionAnalytics: analyticsData ?? null,
    isLoadingTeams,
    isLoadingAvailableTeams,
    isLoadingCompetitions,
    isLoadingAnalytics,
    error,
    linkTeam: linkTeamAction,
    registerForCompetition: registerAction,
    completeParticipation: completeAction,
    withdrawFromCompetition: withdrawAction,
    refetch,
  }
}
