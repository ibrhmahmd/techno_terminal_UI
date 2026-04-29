import type { CompetitionParticipationDTO } from '../../../api/academics'
import { CompetitionRecords } from './CompetitionRecords'

interface HistoryTabProps {
  competitions: CompetitionParticipationDTO[]
  isLoading: boolean
}

export function HistoryTab({
  competitions,
  isLoading,
}: HistoryTabProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-4">
          <CompetitionRecords data={competitions} isLoading={isLoading} />
        </div>
      </div>
    </div>
  )
}
