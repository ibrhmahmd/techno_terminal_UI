import type { Competition } from '../api/competitions'

/**
 * Check if registration is open for a competition
 * Registration is open if:
 * 1. Current date is before or on registration deadline
 * 2. Competition status is either 'upcoming' or 'active'
 */
export function isRegistrationOpen(competition: Competition): boolean {
  const now = new Date()
  if (!competition.registration_deadline) return false
  const deadline = new Date(competition.registration_deadline)
  return now <= deadline && 
    (competition.status === 'upcoming' || competition.status === 'active')
}

/**
 * Calculate available team slots for a competition
 * Returns null if there's no maximum limit
 */
export function getAvailableSlots(_competition: Competition): number | null {
  // max_teams is not part of Competition interface, so we return null
  // This function may need to be updated if the API adds this field
  return null
}

/**
 * Calculate total revenue from all participants
 */
export function calculateTotalRevenue(competition: Competition): number {
  return (competition.total_participants || 0) * (competition.fee_per_participant || 0)
}

/**
 * Format competition dates for display
 */
export function formatCompetitionDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
  const end = new Date(endDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
  return `${start} - ${end}`
}
