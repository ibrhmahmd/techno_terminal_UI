import { Trophy, Calendar, Medal, Award, Star } from 'lucide-react'
// Note: CompetitionRecord type should be defined in the competitions API module
interface CompetitionRecord {
  id: number
  competition_name: string
  date?: string | null
  result?: string | null
  achievement?: string | null
  notes?: string | null
}
import { EmptyState } from '../common/EmptyState'

interface CompetitionsTabProps {
  competitions: CompetitionRecord[]
}

export function CompetitionsTab({ competitions }: CompetitionsTabProps) {
  const getAchievementIcon = (achievement?: string | null) => {
    if (!achievement) return <Trophy className="w-5 h-5 text-slate-500" />
    const lower = achievement.toLowerCase()
    if (lower.includes('gold') || lower.includes('1st') || lower.includes('first')) {
      return <Medal className="w-5 h-5 text-yellow-500" />
    }
    if (lower.includes('silver') || lower.includes('2nd') || lower.includes('second')) {
      return <Medal className="w-5 h-5 text-slate-400" />
    }
    if (lower.includes('bronze') || lower.includes('3rd') || lower.includes('third')) {
      return <Medal className="w-5 h-5 text-amber-700" />
    }
    if (lower.includes('winner') || lower.includes('champion')) {
      return <Award className="w-5 h-5 text-yellow-500" />
    }
    return <Star className="w-5 h-5 text-blue-500" />
  }

  const getAchievementColor = (achievement?: string | null) => {
    if (!achievement) return 'bg-slate-100 text-slate-600'
    const lower = achievement.toLowerCase()
    if (lower.includes('gold') || lower.includes('1st') || lower.includes('first')) {
      return 'bg-yellow-100 text-yellow-800'
    }
    if (lower.includes('silver') || lower.includes('2nd') || lower.includes('second')) {
      return 'bg-slate-200 text-slate-800'
    }
    if (lower.includes('bronze') || lower.includes('3rd') || lower.includes('third')) {
      return 'bg-amber-100 text-amber-800'
    }
    if (lower.includes('winner') || lower.includes('champion')) {
      return 'bg-yellow-100 text-yellow-800'
    }
    return 'bg-blue-100 text-blue-700'
  }

  if (competitions.length === 0) {
    return (
      <EmptyState
        title="No competition records"
        message="This student has not participated in any competitions yet."
        icon="inbox"
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-on-surface">Competition History</h2>
          <p className="text-sm text-slate-500 mt-1">
            View all competitions this student has participated in
          </p>
        </div>
        <div className="text-sm text-slate-500">
          Total: <span className="font-medium text-on-surface">{competitions.length}</span> competitions
        </div>
      </div>

      {/* Achievements Summary */}
      {competitions.some(c => c.achievement) && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['Gold', 'Silver', 'Bronze', 'Participation'].map((type) => {
            const count = competitions.filter(c => 
              c.achievement?.toLowerCase().includes(type.toLowerCase())
            ).length
            if (count === 0) return null
            return (
              <div key={type} className="bg-white rounded-lg border border-slate-200 p-4 text-center">
                <Medal className={`w-6 h-6 mx-auto mb-2 ${
                  type === 'Gold' ? 'text-yellow-500' :
                  type === 'Silver' ? 'text-slate-400' :
                  type === 'Bronze' ? 'text-amber-700' :
                  'text-slate-500'
                }`} />
                <p className="text-2xl font-bold text-on-surface">{count}</p>
                <p className="text-xs text-slate-500">{type} {count === 1 ? 'Medal' : 'Medals'}</p>
              </div>
            )
          })}
        </div>
      )}

      {/* Competitions List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
          <h3 className="font-semibold text-on-surface">All Competitions</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {competitions.map((competition) => (
            <div key={competition.id} className="p-6 hover:bg-slate-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
                    {getAchievementIcon(competition.achievement)}
                  </div>
                  <div>
                    <p className="font-semibold text-on-surface">{competition.competition_name}</p>
                    <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {competition.date}
                      </span>
                    </div>
                    {competition.result && (
                      <p className="text-sm text-slate-600 mt-2">
                        Result: {competition.result}
                      </p>
                    )}
                  </div>
                </div>
                {competition.achievement && (
                  <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium ${getAchievementColor(competition.achievement)}`}>
                    {getAchievementIcon(competition.achievement)}
                    {competition.achievement}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CompetitionsTab
