// GroupCard — component contract
// Props:
interface GroupCardProps {
  group: EnrichedGroupPublic
  actions: {
    onView?: () => void
    onEdit?: () => void
    onDelete?: () => void
  }
  loading?: boolean   // when true, renders CardSkeleton
}
// Renders: rounded card with group info, status badge, action buttons
// States: loading skeleton, data, edge case (null instructor → "Unassigned")
