/** Standard envelope wrapping all backend API responses */
export interface ApiResponse<T> {
  success: boolean
  data: T
  message: string | null
}

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
