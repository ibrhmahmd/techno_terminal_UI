/**
 * Dashboard API - Core Functions
 * Endpoints for dashboard overview
 * 
 * @module dashboard
 * @see docs/api/dashboard-api.md
 */

import { client } from '../client'
import type { ApiResponse } from '../../types/api'
import type { DashboardDailyOverviewDTO } from './types'

interface GetDashboardOverviewParams {
  date: string
  include_attendance?: boolean
}

/**
 * Get daily dashboard overview
 * Returns consolidated data: groups, instructors, sessions, and attendance
 * 
 * @param params - Query parameters including date and optional attendance flag
 * @see docs/api/dashboard-api.md#get-dashboard-daily-overview
 */
export async function getDashboardOverview(
  params: GetDashboardOverviewParams
): Promise<DashboardDailyOverviewDTO> {
  const response = await client.get<ApiResponse<DashboardDailyOverviewDTO>>(
    '/dashboard/daily-overview',
    { 
      params: {
        date: params.date,
        include_attendance: params.include_attendance ?? true
      }
    }
  )
  return response.data.data
}

