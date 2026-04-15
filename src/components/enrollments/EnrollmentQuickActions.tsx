import { QuickActionWidget } from '../dashboard/QuickActionWidget'

interface EnrollmentQuickActionsProps {
  onEnrollClick?: () => void
  onManageClick?: () => void
}

export function EnrollmentQuickActions({
  onEnrollClick,
  onManageClick
}: EnrollmentQuickActionsProps) {
  return (
    <section className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <QuickActionWidget
          icon="person_add"
          title="New Enrollment"
          subtitle="Add student to a group"
          variant="primary"
          onClick={onEnrollClick || (() => {})}
        />
        <QuickActionWidget
          icon="settings_suggest"
          title="Manage Enrollment"
          subtitle="Transfer or drop students"
          variant="secondary"
          onClick={onManageClick || (() => {})}
        />
      </div>
    </section>
  )
}
