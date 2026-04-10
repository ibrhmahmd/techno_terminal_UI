/**
 * Analytics API - Competition Module
 * Endpoints for competition metrics: participation and fee collection
 * 
 * @module analytics/competition
 * @see docs/api/analytics/competition.md
 */

import client from '../client'
import type { ApiResponse } from '../../types/api'
import type { CompetitionFeeSummaryDTO } from './types'

/**
 * Get competition fee summary showing participation and fees for all competitions
 * @see docs/api/analytics/competition.md#get-competition-fee-summary
 */
export async function getCompetitionFeeSummary(): Promise<CompetitionFeeSummaryDTO[]> {
  const response = await client.get<ApiResponse<CompetitionFeeSummaryDTO[]>>('/analytics/competitions/fee-summary')
  return response.data.data || []
}
