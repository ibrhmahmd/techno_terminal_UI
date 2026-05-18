interface ValidationErrorDetail {
  type: string
  msg: string
  path?: string
  loc?: string[]
}

interface ApiErrorResponse {
  success: boolean
  error: string
  message: string
  // FastAPI returns 'detail' for validation errors
  detail?: ValidationErrorDetail[]
  // Some APIs may use 'details'
  details?: ValidationErrorDetail[]
}

interface AxiosError {
  response?: {
    status?: number
    statusText?: string
    data?: ApiErrorResponse
  }
  message?: string
}

function formatValidationErrors(errors: ValidationErrorDetail[]): string {
  return errors.map(d => {
    // FastAPI uses 'loc' array like ['body', 'field_name']
    const path = d.loc?.join('.') || d.path || 'field'
    // Remove 'body.' prefix if present
    const cleanPath = path.replace(/^body\./, '')
    return `${cleanPath}: ${d.msg}`
  }).join('; ')
}

export function extractErrorMessage(error: unknown): string {
  const axiosError = error as AxiosError | null
  
  if (!axiosError) {
    return 'An unexpected error occurred. Please try again.'
  }
  
  const responseData = axiosError.response?.data
  
  if (responseData) {
    // Handle FastAPI validation errors (uses 'detail')
    if (responseData.detail && Array.isArray(responseData.detail) && responseData.detail.length > 0) {
      return formatValidationErrors(responseData.detail)
    }
    
    // Handle alternative format (uses 'details')
    if (responseData.details && Array.isArray(responseData.details) && responseData.details.length > 0) {
      return formatValidationErrors(responseData.details)
    }
    
    // Handle simple string detail
    if (typeof responseData.detail === 'string') {
      return responseData.detail
    }
    
    if (responseData.message) {
      return responseData.message
    }
    
    if (responseData.error) {
      return responseData.error
    }
  }
  
  if (axiosError.message) {
    if (axiosError.message.includes('Network Error')) {
      return 'Unable to connect to server. Please check your internet connection.'
    }
    if (axiosError.message.includes('timeout')) {
      return 'Request timed out. Please try again.'
    }
    return axiosError.message
  }
  
  return 'An unexpected error occurred. Please try again.'
}

export function getErrorStatus(error: unknown): number | null {
  const axiosError = error as AxiosError
  return axiosError?.response?.status ?? null
}

export function isAuthError(error: unknown): boolean {
  const axiosError = error as AxiosError
  const status = axiosError?.response?.status
  return status === 401 || status === 403
}

export function isNotFoundError(error: unknown): boolean {
  const axiosError = error as AxiosError
  return axiosError?.response?.status === 404
}

export function isValidationError(error: unknown): boolean {
  const axiosError = error as AxiosError
  return axiosError?.response?.status === 422
}

export function isServerError(error: unknown): boolean {
  const axiosError = error as AxiosError
  const status = axiosError?.response?.status
  return status !== undefined && status >= 500 && status < 600
}

export function getErrorCode(error: unknown): string | null {
  const axiosError = error as AxiosError
  return axiosError?.response?.data?.error || null
}
