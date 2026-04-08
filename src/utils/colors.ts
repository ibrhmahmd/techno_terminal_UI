/**
 * Status color mappings for consistent styling across the app
 * Each entry provides background and text color classes
 */

export const employeeStatusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  on_leave: 'bg-blue-100 text-blue-700',
  suspended: 'bg-yellow-100 text-yellow-700',
  terminated: 'bg-red-100 text-red-700',
}

export const attendanceStatusColors: Record<string, string> = {
  present: 'bg-green-100 text-green-700 border-green-300',
  absent: 'bg-red-100 text-red-700 border-red-300',
  late: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  on_leave: 'bg-blue-100 text-blue-700 border-blue-300',
  half_day: 'bg-orange-100 text-orange-700 border-orange-300',
}

export const competitionStatusColors: Record<string, string> = {
  upcoming: 'bg-blue-100 text-blue-700',
  active: 'bg-green-100 text-green-700',
  completed: 'bg-slate-100 text-slate-600',
  cancelled: 'bg-red-100 text-red-700',
}

export const departmentColors: Record<string, string> = {
  academics: 'bg-blue-100 text-blue-700',
  operations: 'bg-green-100 text-green-700',
  admin: 'bg-purple-100 text-purple-700',
  management: 'bg-amber-100 text-amber-700',
}

export const paymentStatusColors: Record<string, string> = {
  paid: 'bg-teal-100 text-teal-700',
  due: 'bg-red-100 text-red-700',
  pending: 'bg-yellow-100 text-yellow-700',
  overdue: 'bg-orange-100 text-orange-700',
}

export const sessionStatusColors: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  postponed: 'bg-yellow-100 text-yellow-700',
}
