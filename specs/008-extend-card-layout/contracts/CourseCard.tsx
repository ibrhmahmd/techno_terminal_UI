// CourseCard — component contract
// Props:
interface CourseCardProps {
  course: Course
  actions: {
    onView?: () => void
    onEdit?: () => void
    onDelete?: () => void
  }
  loading?: boolean   // when true, renders CardSkeleton
}
// Renders: rounded card with course name, category badge, price/sessions info, active status, action buttons
// States: loading skeleton, data, edge case (null category → "Uncategorised")
