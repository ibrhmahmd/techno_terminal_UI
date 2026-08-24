interface ApiErrorEnvelope {
  success?: boolean
  message?: unknown
}

export function extractApiErrorMessage(err: unknown): string | null {
  if (typeof err !== 'object' || err === null) return null
  const response = (err as { response?: { data?: ApiErrorEnvelope } }).response
  const data = response?.data
  if (data && data.success === false && typeof data.message === 'string' && data.message.trim() !== '') {
    return data.message
  }
  return null
}
