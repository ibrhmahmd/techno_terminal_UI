import { useNavigate } from 'react-router-dom'
import { QuickActionWidget } from './QuickActionWidget'
import { StatWidget } from './StatWidget'

interface QuickActionsGridProps {
  todaySessionCount: number
}

export function QuickActionsGrid({ todaySessionCount }: QuickActionsGridProps) {
  const navigate = useNavigate()

  return (
    <section className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickActionWidget
          icon="person_add"
          title="Enroll Student"
          subtitle="Add new enrollment"
          variant="primary"
          onClick={() => navigate('/enrollments')}
        />

        <QuickActionWidget
          icon="payment"
          title="Create Payment"
          subtitle="Record new payment"
          variant="secondary"
          onClick={() => navigate('/finance')}
        />

        <StatWidget
          value={todaySessionCount}
          label="Today's Sessions"
          icon="event_note"
          trend="neutral"
        />

        <QuickActionWidget
          icon="analytics"
          title="Quick Reports"
          subtitle="View insights"
          variant="accent"
          onClick={() => navigate('/reports')}
        />
      </div>
    </section>
  )
}
