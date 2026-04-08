import type { Competition } from '../api/competitions'

/**
 * Check if registration is open for a competition
 * Registration is open if:
 * 1. Current date is before or on registration deadline
 * 2. Competition status is either 'upcoming' or 'active'
 */
export function isRegistrationOpen(competition: Competition): boolean {
  const now = new Date()
  const deadline = new Date(competition.registration_deadline)
  return now <= deadline && 
    (competition.status === 'upcoming' || competition.status === 'active')
}

/**
 * Calculate available team slots for a competition
 * Returns null if there's no maximum limit
 */
export function getAvailableSlots(competition: Competition): number | null {
  if (!competition.max_teams) return null
  return competition.max_teams - competition.registered_teams
}

/**
 * Calculate total revenue from all participants
 */
export function calculateTotalRevenue(competition: Competition): number {
  return competition.total_participants * competition.fee_per_participant
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
