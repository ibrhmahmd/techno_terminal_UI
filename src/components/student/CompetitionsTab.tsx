import { Trophy, Calendar, Medal, Award, Star } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { CompetitionRecord } from '../../api/competitions'
import { formatDate } from '../../utils/formatting'
import { EmptyState } from '../common/EmptyState'

interface CompetitionsTabProps {
  competitions: CompetitionRecord[]
}

export function CompetitionsTab({ competitions }: CompetitionsTabProps) {
  const { t } = useTranslation('common')
  const getAchievementIcon = (achievement?: string | null) => {
    if (!achievement) return <Trophy className="w-5 h-5 text-slate-500" aria-hidden="true" />
    const lower = achievement.toLowerCase()
    if (lower.includes('gold') || lower.includes('1st') || lower.includes('first')) {
      return <Medal className="w-5 h-5 text-yellow-500" aria-hidden="true" />
    }
    if (lower.includes('silver') || lower.includes('2nd') || lower.includes('second')) {
      return <Medal className="w-5 h-5 text-slate-400" aria-hidden="true" />
    }
    if (lower.includes('bronze') || lower.includes('3rd') || lower.includes('third')) {
      return <Medal className="w-5 h-5 text-amber-700" aria-hidden="true" />
    }
    if (lower.includes('winner') || lower.includes('champion')) {
      return <Award className="w-5 h-5 text-yellow-500" aria-hidden="true" />
    }
    return <Star className="w-5 h-5 text-blue-500" aria-hidden="true" />
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
        title={t('competitionsTab.no_competition_records')}
        message={t('competitionsTab.no_competition_records_message')}
        icon="inbox"
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-on-surface">{t('competitionsTab.competition_history')}</h2>
          <p className="text-sm text-slate-500 mt-1">
            {t('competitionsTab.competition_history_subtitle')}
          </p>
        </div>
        <div className="text-sm text-slate-500">
          {t('competitionsTab.total_competitions', { count: competitions.length })}
        </div>
      </div>

      {/* Achievements Summary */}
      {competitions.some(c => c.achievement) && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[{ key: 'Gold', label: t('competitionsTab.gold') }, { key: 'Silver', label: t('competitionsTab.silver') }, { key: 'Bronze', label: t('competitionsTab.bronze') }, { key: 'Participation', label: t('competitionsTab.participation') }].map(({ key, label }) => {
            const count = competitions.filter(c => 
              c.achievement?.toLowerCase().includes(key.toLowerCase())
            ).length
            if (count === 0) return null
            return (
              <div key={key} className="bg-white rounded-lg border border-slate-200 p-4 text-center">
                <Medal aria-hidden="true" className={`w-6 h-6 mx-auto mb-2 ${
                  key === 'Gold' ? 'text-yellow-500' :
                  key === 'Silver' ? 'text-slate-400' :
                  key === 'Bronze' ? 'text-amber-700' :
                  'text-slate-500'
                }`} />
                <p className="text-2xl font-bold text-on-surface">{count}</p>
                <p className="text-xs text-slate-500">{key === 'Participation' ? label : `${label} ${count === 1 ? t('competitionsTab.medal') : t('competitionsTab.medals')}`}</p>
              </div>
            )
          })}
        </div>
      )}

      {/* Competitions List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
          <h3 className="font-semibold text-on-surface">{t('competitionsTab.all_competitions')}</h3>
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
                        <Calendar className="w-3 h-3" aria-hidden="true" />
                        {competition.date ? formatDate(competition.date) : 'N/A'}
                      </span>
                    </div>
                    {competition.result && (
                      <p className="text-sm text-slate-600 mt-2">
                        {t('competitionsTab.result', { result: competition.result })}
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


