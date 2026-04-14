import { QuickActionWidget } from '../dashboard/QuickActionWidget'

interface EnrollmentQuickActionsProps {
  onEnrollClick?: () => void
  onTransferClick?: () => void
  onDropClick?: () => void
}

export function EnrollmentQuickActions({
  onEnrollClick,
  onTransferClick,
  onDropClick
}: EnrollmentQuickActionsProps) {
  return (
    <section className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuickActionWidget
          icon="person_add"
          title="Enroll Student"
          subtitle="Add new enrollment"
          variant="primary"
          onClick={onEnrollClick || (() => {})}
        />
        <QuickActionWidget
          icon="swap_horiz"
          title="Transfer Student"
          subtitle="Move between groups"
          variant="secondary"
          onClick={onTransferClick || (() => {})}
        />
        <QuickActionWidget
          icon="person_remove"
          title="Drop Student"
          subtitle="Remove from group"
          variant="accent"
          onClick={onDropClick || (() => {})}
        />
      </div>
    </section>
  )
}
