// Shared pagination types for API responses

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  total: number
  skip: number
  limit: number
}

// Utility type for paginated function returns
export interface PaginationResult<T> {
  items: T[]
  total: number
  hasMore: boolean
}

// Input parameters for paginated requests
export interface PaginationParams {
  skip?: number
  limit?: number
  q?: string  // for search queries
}

// State management for pagination
export interface PaginationState {
  skip: number
  limit: number
  total: number
  hasMore: boolean
  isLoading: boolean
}


