import { UsersRound, Calendar, UserCog, Shield } from 'lucide-react'
import { EmptyState } from '../common/EmptyState'

// Inline type definition (was in deleted legacy types)
interface TeamRecord {
  id: number
  team_name: string
  role?: string | null
  start_date?: string | null
  end_date?: string | null
  status: 'active' | 'former'
}

interface TeamsTabProps {
  teams: TeamRecord[]
}

export function TeamsTab({ teams }: TeamsTabProps) {
  // Separate active and former teams
  const activeTeams = teams.filter(t => t.status === 'active')
  const formerTeams = teams.filter(t => t.status === 'former')

  const getRoleIcon = (role?: string | null) => {
    if (!role) return <UsersRound className="w-5 h-5 text-slate-500" />
    const lower = role.toLowerCase()
    if (lower.includes('captain') || lower.includes('lead')) {
      return <Shield className="w-5 h-5 text-amber-600" />
    }
    if (lower.includes('coach')) {
      return <UserCog className="w-5 h-5 text-blue-600" />
    }
    return <UsersRound className="w-5 h-5 text-slate-500" />
  }

  const renderTeamCard = (team: TeamRecord) => (
    <div key={team.id} className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            {getRoleIcon(team.role)}
          </div>
          <div>
            <p className="font-semibold text-on-surface">{team.team_name}</p>
            {team.role && (
              <p className="text-sm text-slate-500">{team.role}</p>
            )}
            <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {team.start_date}
                {team.end_date && ` - ${team.end_date}`}
              </span>
            </div>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
          team.status === 'active' 
            ? 'bg-green-100 text-green-700' 
            : 'bg-slate-100 text-slate-600'
        }`}>
          {team.status === 'active' ? 'Active Member' : 'Former Member'}
        </span>
      </div>
    </div>
  )

  if (teams.length === 0) {
    return (
      <EmptyState
        title="No team records"
        message="This student is not part of any teams."
        icon="inbox"
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-on-surface">Team History</h2>
          <p className="text-sm text-slate-500 mt-1">
            View all teams this student is or was part of
          </p>
        </div>
        <div className="text-sm text-slate-500">
          Total: <span className="font-medium text-on-surface">{teams.length}</span> teams
        </div>
      </div>

      {/* Active Teams */}
      {activeTeams.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-green-50">
            <div className="flex items-center gap-2">
              <UsersRound className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-on-surface">Active Teams</h3>
              <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                {activeTeams.length}
              </span>
            </div>
          </div>
          <div className="p-4 space-y-3">
            {activeTeams.map(renderTeamCard)}
          </div>
        </div>
      )}

      {/* Former Teams */}
      {formerTeams.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
            <div className="flex items-center gap-2">
              <UsersRound className="w-5 h-5 text-slate-500" />
              <h3 className="font-semibold text-on-surface">Past Teams</h3>
              <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-200 text-slate-600">
                {formerTeams.length}
              </span>
            </div>
          </div>
          <div className="p-4 space-y-3">
            {formerTeams.map(renderTeamCard)}
          </div>
        </div>
      )}
    </div>
  )
}

export default TeamsTab
