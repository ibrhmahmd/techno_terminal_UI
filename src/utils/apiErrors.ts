import { isAxiosError } from 'axios'
import type { AxiosInstance } from 'axios'
import i18n from '../i18n'

interface ErrorResponseLike {
  response?: {
    status?: number
    data?: {
      error?: unknown
    }
  }
}

interface ValidationDetail {
  msg?: unknown
  loc?: unknown
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null
    ? (value as Record<string, unknown>)
    : null
}

function pickDetailArray(data: unknown): ValidationDetail[] | null {
  const record = asRecord(data)
  if (!record) return null
  for (const key of ['details', 'detail'] as const) {
    const value = record[key]
    if (Array.isArray(value) && value.length > 0) {
      return value as ValidationDetail[]
    }
  }
  return null
}

function pickString(data: unknown, key: 'detail' | 'message'): string | null {
  const record = asRecord(data)
  const value = record?.[key]
  return typeof value === 'string' && value.trim().length > 0 ? value : null
}

function humanizeField(segment: string): string {
  const words = segment.split('_').filter((word) => word.length > 0)
  if (words.length === 0) return segment
  return words
    .map((word, index) =>
      index === 0
        ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        : word.toLowerCase()
    )
    .join(' ')
}

function fieldFromLoc(loc: unknown): string {
  if (!Array.isArray(loc)) return ''
  let segments = loc
  const first = segments[0]
  if (first === 'body' || first === 'query' || first === 'path') {
    segments = segments.slice(1)
  }
  for (let i = segments.length - 1; i >= 0; i--) {
    const segment = segments[i]
    if (typeof segment === 'string' && segment.length > 0) {
      return humanizeField(segment)
    }
  }
  return ''
}

function formatDetail(detail: ValidationDetail): string {
  const msg = typeof detail.msg === 'string' ? detail.msg : ''
  const field = fieldFromLoc(detail.loc)
  if (field && msg) return `${field}: ${msg}`
  return field || msg
}

function formatDetails(details: ValidationDetail[]): string {
  return details
    .slice(0, 3)
    .map(formatDetail)
    .filter((entry) => entry.length > 0)
    .join('; ')
}

export function extractErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const response = error.response

    if (response) {
      if (typeof response.status === 'number' && response.status >= 500) {
        return i18n.t('common:errors.serverError')
      }

      const details = pickDetailArray(response.data)
      if (details) {
        const formatted = formatDetails(details)
        if (formatted) return formatted
      }

      const detail = pickString(response.data, 'detail')
      if (detail) return detail

      const message = pickString(response.data, 'message')
      if (message) return message

      return i18n.t('common:errors.unexpectedError')
    }

    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return i18n.t('common:errors.timeout')
    }

    return i18n.t('common:messages.networkError')
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message
  }

  return i18n.t('common:errors.unexpectedError')
}

export function attachErrorNormalizer(instance: AxiosInstance): void {
  instance.interceptors.response.use(
    (response) => response,
    (error: unknown) => {
      if (isAxiosError(error)) {
        error.message = extractErrorMessage(error)
      }
      return Promise.reject(error)
    }
  )
}

export function getErrorStatus(error: unknown): number | null {
  const axiosError = error as ErrorResponseLike | null
  return axiosError?.response?.status ?? null
}

export function isAuthError(error: unknown): boolean {
  const status = (error as ErrorResponseLike | null)?.response?.status
  return status === 401 || status === 403
}

export function isNotFoundError(error: unknown): boolean {
  return (error as ErrorResponseLike | null)?.response?.status === 404
}

export function isValidationError(error: unknown): boolean {
  return (error as ErrorResponseLike | null)?.response?.status === 422
}

export function isServerError(error: unknown): boolean {
  const status = (error as ErrorResponseLike | null)?.response?.status
  return status !== undefined && status >= 500 && status < 600
}

export function getErrorCode(error: unknown): string | null {
  const code = (error as ErrorResponseLike | null)?.response?.data?.error
  return typeof code === 'string' && code.length > 0 ? code : null
}
