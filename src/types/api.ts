/** Standard envelope wrapping all backend API responses */
export interface ApiResponse<T> {
  success: boolean
  data: T
  message: string | null
}

/** Session lifecycle status, shared across attendance + academics DTOs */
export type SessionStatus = 'scheduled' | 'completed' | 'cancelled'

/** 
 * Paginated data envelope.
 * Matches backend PaginatedResponse (flat structure).
 */
export interface PaginatedApiResponse<T> {
  success: boolean
  data: T[]
  total: number
  skip: number
  limit: number
}
