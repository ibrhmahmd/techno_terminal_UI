// GroupCardGrid — component contract
// Wraps CardGrid with groups-specific empty state
// Props:
interface GroupCardGridProps {
  children: ReactNode
  emptyMessage?: string
  emptyIcon?: string
  isLoading?: boolean
  skeletonCount?: number
}
// Renders: CardGrid with children, or skeleton placeholders, or empty state div
// Reuses CardGrid and CardSkeleton from src/components/directory/
