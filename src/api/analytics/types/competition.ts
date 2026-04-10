/**
 * Analytics API Types - Competition Module
 * DTOs for competition metrics: participation and fee collection
 * @see docs/api/analytics/competition.md
 */

export interface CompetitionFeeSummaryDTO {
  competition_id: number
  competition_name: string
  competition_date: string
  team_count: number
  member_count: number
  fees_collected: number
  fees_outstanding: number
}
