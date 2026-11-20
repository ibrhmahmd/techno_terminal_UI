import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AxiosError, isAxiosError } from 'axios'
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { client } from '../api/client'
import { certsClient } from '../api/certificates/certificates'
import { refreshToken } from '../api/auth'

const mocks = vi.hoisted(() => ({
  setTokens: vi.fn(),
  logout: vi.fn(),
  refreshToken: vi.fn(),
}))

vi.mock('../store/authStore', () => ({
  useAuthStore: {
    getState: () => ({
      token: 'old-token',
      refreshToken: 'refresh-token',
      setTokens: mocks.setTokens,
      logout: mocks.logout,
    }),
  },
}))

vi.mock('../api/auth', () => ({
  refreshToken: mocks.refreshToken,
}))

function rejectingAdapter(status: number, data: unknown) {
  return (config: InternalAxiosRequestConfig): Promise<AxiosResponse> => {
    const response: AxiosResponse = { data, status, statusText: '', headers: {}, config }
    return Promise.reject(
      new AxiosError(`Request failed with status code ${status}`, 'ERR_BAD_REQUEST', config, {}, response)
    )
  }
}

async function captureRejection(request: Promise<unknown>): Promise<AxiosError> {
  try {
    await request
  } catch (error) {
    return error as AxiosError
  }
  throw new Error('Expected the request to reject')
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('error normalizer on the main API client', () => {
  it('lands a 422 details body on error.message and keeps response/status/code intact', async () => {
    const error = await captureRejection(
      client.get('/groups', {
        adapter: rejectingAdapter(422, {
          success: false,
          error: 'RequestValidationError',
          message: "('body', 'phone'): String should match pattern ...",
          details: [
            { type: 'string_pattern_mismatch', loc: ['body', 'phone'], msg: 'String should match pattern' },
            { type: 'missing', loc: ['body', 'birth_date'], msg: 'Field required' },
          ],
        }),
      })
    )

    expect(isAxiosError(error)).toBe(true)
    expect(error.message).toBe('Phone: String should match pattern; Birth date: Field required')
    expect(error.response?.status).toBe(422)
    expect(error.code).toBe('ERR_BAD_REQUEST')
    expect(error.config?.url).toBe('/groups')
  })

  it('lands a 409 message body on error.message', async () => {
    const error = await captureRejection(
      client.get('/groups', {
        adapter: rejectingAdapter(409, {
          success: false,
          error: 'Conflict',
          message: 'A session already exists on this date',
        }),
      })
    )

    expect(error.message).toBe('A session already exists on this date')
    expect(error.response?.status).toBe(409)
  })

  it('never leaks the axios status text for 5xx responses', async () => {
    const error = await captureRejection(
      client.get('/groups', {
        adapter: rejectingAdapter(500, {
          success: false,
          error: 'InternalServerError',
          message: 'An unexpected error occurred. The server logs contain details.',
        }),
      })
    )

    expect(error.message).toBe('Something went wrong on our side. Please try again later.')
    expect(error.message).not.toContain('status code')
    expect(error.response?.status).toBe(500)
  })
})

describe('error normalizer on the certificates client', () => {
  it('formats a FastAPI 422 detail array', async () => {
    const error = await captureRejection(
      certsClient.get('/certificates', {
        adapter: rejectingAdapter(422, {
          detail: [{ loc: ['body', 'student_name'], msg: 'value is not a valid string', type: 'string_type' }],
        }),
      })
    )

    expect(isAxiosError(error)).toBe(true)
    expect(error.message).toBe('Student name: value is not a valid string')
    expect(error.response?.status).toBe(422)
  })

  it('returns a string detail verbatim', async () => {
    const error = await captureRejection(
      certsClient.get('/certificates', {
        adapter: rejectingAdapter(409, { detail: 'Certificate already revoked' }),
      })
    )

    expect(error.message).toBe('Certificate already revoked')
    expect(error.response?.status).toBe(409)
  })
})

describe('blob (PDF) download errors', () => {
  it('decodes a JSON error body delivered as a Blob on client', async () => {
    const body = new Blob([JSON.stringify({ success: false, error: 'NotFoundError', message: 'Receipt 7 not found' })])
    const error = await captureRejection(
      client.get('/finance/receipts/7/pdf', { responseType: 'blob', adapter: rejectingAdapter(404, body) })
    )

    expect(error.message).toBe('Receipt 7 not found')
    expect(error.response?.status).toBe(404)
  })

  it('decodes a FastAPI detail Blob on certsClient', async () => {
    const body = new Blob([JSON.stringify({ detail: 'Certificate not found' })])
    const error = await captureRejection(
      certsClient.get('/certificates/x/pdf', { responseType: 'blob', adapter: rejectingAdapter(404, body) })
    )

    expect(error.message).toBe('Certificate not found')
  })

  it('falls back to the generic message when the Blob is not JSON', async () => {
    const error = await captureRejection(
      client.get('/finance/receipts/7/pdf', { responseType: 'blob', adapter: rejectingAdapter(404, new Blob(['<html>nope</html>'])) })
    )

    expect(error.message).toBe('An unexpected error occurred.')
  })
})

describe('401 refresh flow with the normalizer attached', () => {
  it('still refreshes and retries for a non-auth 401, rejecting with a normalized message', async () => {
    mocks.refreshToken.mockResolvedValue({
      data: { access_token: 'new-token', refresh_token: 'new-refresh' },
    })

    const error = await captureRejection(
      client.get('/groups/5', {
        adapter: rejectingAdapter(401, { success: false, error: 'Unauthorized', message: 'Session expired' }),
      })
    )

    expect(vi.mocked(refreshToken)).toHaveBeenCalledTimes(1)
    expect(vi.mocked(refreshToken)).toHaveBeenCalledWith({ refresh_token: 'refresh-token' })
    expect(mocks.setTokens).toHaveBeenCalledWith('new-token', 'new-refresh')
    expect(mocks.logout).not.toHaveBeenCalled()
    expect(error.response?.status).toBe(401)
    expect(error.message).toBe('Session expired')
    expect(error.message).not.toContain('status code')
  })
})
