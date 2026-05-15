// CompetitionsTable — component contract
// DataTable wrapper for competitions with standard actions
// Props:
interface CompetitionsTableProps {
  data: Competition[]
  onView: (id: number) => void
  onEdit: (competition: Competition) => void
  onDelete: (id: number) => void
}
// Renders: DataTable with CompetitionColumns, action buttons, empty state
