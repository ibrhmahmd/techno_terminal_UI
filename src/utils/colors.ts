/**
 * Status color mappings for consistent styling across the app
 * Each entry provides background and text color classes
 */

export const employeeStatusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-gray-100 text-gray-700',
  on_leave: 'bg-blue-100 text-blue-700',
  suspended: 'bg-yellow-100 text-yellow-700',
  terminated: 'bg-red-100 text-red-700',
}

export const sessionStatusColors: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  postponed: 'bg-yellow-100 text-yellow-700',
}
