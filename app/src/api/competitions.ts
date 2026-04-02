import client from './client'

export interface Competition {
  id: string
  name: string
  description?: string
  location: string
  start_date: string
  end_date: string
  registration_deadline: string
  status: 'upcoming' | 'active' | 'completed' | 'cancelled'
  max_teams?: number
  registered_teams: number
  total_participants: number
  fee_per_participant: number
  categories?: CompetitionCategory[]
}

export interface CompetitionCategory {
  id: string
  competition_id: string
  name: string
  description?: string
  min_age?: number
  max_age?: number
  max_team_size: number
  registered_teams: number
}

export interface TeamRegistration {
  id: string
  category_id: string
  team_name: string
  members: TeamMember[]
  registration_date: string
  payment_status: 'pending' | 'paid' | 'waived'
  total_fee: number
}

export interface TeamMember {
  id: string
  student_id: string
  student_name: string
  role: 'leader' | 'member'
  fee_paid: boolean
}

export interface CreateCompetitionInput {
  name: string
  description?: string
  location: string
  start_date: string
  end_date: string
  registration_deadline: string
  max_teams?: number
  fee_per_participant: number
}

export interface UpdateCompetitionInput {
  name?: string
  description?: string
  location?: string
  start_date?: string
  end_date?: string
  registration_deadline?: string
  status?: 'upcoming' | 'active' | 'completed' | 'cancelled'
  max_teams?: number
  fee_per_participant?: number
}

export interface CreateCategoryInput {
  name: string
  description?: string
  min_age?: number
  max_age?: number
  max_team_size: number
}

export interface RegisterTeamInput {
  competition_id: string
  category_id: string
  team_name: string
  members: { student_id: string; role: 'leader' | 'member' }[]
}

// Get all competitions
export async function getCompetitions(): Promise<Competition[]> {
  const response = await client.get<{ data: Competition[] }>('/competitions')
  return response.data.data || []
}

// Get competition by ID
export async function getCompetition(id: string): Promise<Competition> {
  const response = await client.get<{ data: Competition }>(`/competitions/${id}`)
  return response.data.data
}

// Create new competition
export async function createCompetition(data: CreateCompetitionInput): Promise<Competition> {
  const response = await client.post<{ data: Competition }>('/competitions', data)
  return response.data.data
}

// Update competition
export async function updateCompetition(id: string, data: UpdateCompetitionInput): Promise<Competition> {
  const response = await client.patch<{ data: Competition }>(`/competitions/${id}`, data)
  return response.data.data
}

// Delete competition
export async function deleteCompetition(id: string): Promise<void> {
  await client.delete(`/competitions/${id}`)
}

// Get competition categories
export async function getCompetitionCategories(competitionId: string): Promise<CompetitionCategory[]> {
  const response = await client.get<{ data: CompetitionCategory[] }>(`/competitions/${competitionId}/categories`)
  return response.data.data || []
}

// Add category to competition
export async function addCompetitionCategory(
  competitionId: string, 
  data: CreateCategoryInput
): Promise<CompetitionCategory> {
  const response = await client.post<{ data: CompetitionCategory }>(
    `/competitions/${competitionId}/categories`, 
    data
  )
  return response.data.data
}

// Delete category
export async function deleteCategory(competitionId: string, categoryId: string): Promise<void> {
  await client.delete(`/competitions/${competitionId}/categories/${categoryId}`)
}

// Register team for competition
export async function registerTeam(data: RegisterTeamInput): Promise<TeamRegistration> {
  const response = await client.post<{ data: TeamRegistration }>('/competitions/register-team', data)
  return response.data.data
}

// Get registered teams for a category
export async function getCategoryTeams(competitionId: string, categoryId: string): Promise<TeamRegistration[]> {
  const response = await client.get<{ data: TeamRegistration[] }>(
    `/competitions/${competitionId}/categories/${categoryId}/teams`
  )
  return response.data.data || []
}

// Mark competition fee as paid for a team member
export async function markCompetitionFeePaid(teamMemberId: string): Promise<void> {
  await client.post(`/competitions/team-members/${teamMemberId}/mark-paid`)
}

// Get competition statistics
export async function getCompetitionStats(competitionId: string): Promise<{
  total_teams: number
  total_participants: number
  total_revenue: number
  paid_count: number
  pending_count: number
}> {
  const response = await client.get<{ data: {
    total_teams: number
    total_participants: number
    total_revenue: number
    paid_count: number
    pending_count: number
  } }>(`/competitions/${competitionId}/stats`)
  return response.data.data
}
