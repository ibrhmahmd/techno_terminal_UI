import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { AxiosError } from 'axios'
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import i18n from '../i18n'
import {
  extractErrorMessage,
  getErrorCode,
  getErrorStatus,
  isAuthError,
  isNotFoundError,
  isServerError,
  isValidationError,
} from '../utils/apiErrors'

const SERVER_ERROR = 'Something went wrong on our side. Please try again later.'
const UNEXPECTED_ERROR = 'An unexpected error occurred.'
const TIMEOUT_ERROR = 'The request took too long. Please try again.'
const NETWORK_ERROR = 'Unable to connect. Please check your internet connection and try again.'

function axiosErrorWith(status: number, data: unknown, code = 'ERR_BAD_REQUEST'): AxiosError {
  const config = {} as InternalAxiosRequestConfig
  const response: AxiosResponse = { data, status, statusText: '', headers: {}, config }
  return new AxiosError(`Request failed with status code ${status}`, code, config, {}, response)
}

function axiosErrorWithoutResponse(code = 'ERR_NETWORK', message = 'Network Error'): AxiosError {
  return new AxiosError(message, code, {} as InternalAxiosRequestConfig)
}

beforeAll(async () => {
  await i18n.changeLanguage('en')
})

afterAll(async () => {
  await i18n.changeLanguage('en')
})

describe('extractErrorMessage — rule a: axios responses with status >= 500', () => {
  it('returns the localized server error instead of the raw 500 body message', () => {
    const error = axiosErrorWith(500, {
      success: false,
      error: 'InternalServerError',
      message: 'An unexpected error occurred. The server logs contain details.',
    })
    expect(extractErrorMessage(error)).toBe(SERVER_ERROR)
  })

  it('returns the localized server error for other 5xx statuses', () => {
    expect(extractErrorMessage(axiosErrorWith(503, { detail: 'Service unavailable' }))).toBe(
      SERVER_ERROR
    )
  })
})

describe('extractErrorMessage — rule b: validation detail arrays', () => {
  it('formats main-API 422 details and prefers details over the technical message', () => {
    const error = axiosErrorWith(422, {
      success: false,
      error: 'RequestValidationError',
      message: "('body', 'phone'): String should match pattern ...",
      details: [
        { type: 'string_pattern_mismatch', loc: ['body', 'phone'], msg: 'String should match pattern' },
        { type: 'missing', loc: ['query', 'page'], msg: 'Field required' },
      ],
    })
    expect(extractErrorMessage(error)).toBe('Phone: String should match pattern; Page: Field required')
  })

  it('humanizes snake_case field names and strips body/query/path prefixes', () => {
    expect(
      extractErrorMessage(
        axiosErrorWith(422, {
          details: [{ type: 'string', loc: ['body', 'birth_date'], msg: 'String should match a pattern' }],
        })
      )
    ).toBe('Birth date: String should match a pattern')

    expect(
      extractErrorMessage(
        axiosErrorWith(422, { details: [{ type: 'missing', loc: ['path', 'group_id'], msg: 'Group not found' }] })
      )
    ).toBe('Group id: Group not found')
  })

  it('uses the last string segment when loc contains numeric indices', () => {
    expect(
      extractErrorMessage(
        axiosErrorWith(422, {
          details: [{ type: 'missing', loc: ['body', 'students', 0, 'birth_date'], msg: 'Field required' }],
        })
      )
    ).toBe('Birth date: Field required')
  })

  it('formats at most three entries', () => {
    const error = axiosErrorWith(422, {
      details: [
        { type: 'missing', loc: ['body', 'first_field'], msg: 'Field required' },
        { type: 'missing', loc: ['body', 'second_field'], msg: 'Field required' },
        { type: 'missing', loc: ['body', 'third_field'], msg: 'Field required' },
        { type: 'missing', loc: ['body', 'fourth_field'], msg: 'Field required' },
      ],
    })
    const message = extractErrorMessage(error)
    expect(message).toBe(
      'First field: Field required; Second field: Field required; Third field: Field required'
    )
    expect(message).not.toContain('fourth_field')
    expect(message).not.toContain('Fourth field')
  })

  it('falls back to msg when loc yields no usable field', () => {
    expect(
      extractErrorMessage(axiosErrorWith(422, { details: [{ type: 'value_error', loc: ['body'], msg: 'Invalid value' }] }))
    ).toBe('Invalid value')
    expect(extractErrorMessage(axiosErrorWith(422, { details: [{ type: 'value_error', msg: 'Invalid value' }] }))).toBe(
      'Invalid value'
    )
  })

  it('formats the certificates FastAPI detail array', () => {
    const error = axiosErrorWith(422, {
      detail: [
        { loc: ['body', 'student_name'], msg: 'value is not a valid string', type: 'string_type' },
        { loc: ['body', 'level'], msg: 'Input should be greater than or equal to 1', type: 'int_too_small' },
      ],
    })
    expect(extractErrorMessage(error)).toBe(
      'Student name: value is not a valid string; Level: Input should be greater than or equal to 1'
    )
  })
})

describe('extractErrorMessage — rule c: string bodies', () => {
  it('returns a certificates string detail verbatim', () => {
    expect(extractErrorMessage(axiosErrorWith(409, { detail: 'Certificate already revoked' }))).toBe(
      'Certificate already revoked'
    )
  })

  it('returns a non-empty message string verbatim', () => {
    expect(
      extractErrorMessage(
        axiosErrorWith(409, { success: false, error: 'Conflict', message: 'A session already exists on this date' })
      )
    ).toBe('A session already exists on this date')
  })

  it('never shows the error type name when there is no detail or message', () => {
    expect(extractErrorMessage(axiosErrorWith(404, { success: false, error: 'NotFoundError' }))).toBe(
      'An unexpected error occurred.'
    )
  })

  it('returns the technical message for a 422 without a details array', () => {
    const technical = "('body', 'phone'): String should match pattern ..."
    expect(extractErrorMessage(axiosErrorWith(422, { success: false, error: 'ValidationError', message: technical }))).toBe(
      technical
    )
  })
})

describe('extractErrorMessage — rule d: response without a usable body', () => {
  it('returns the unexpected error for an empty object body', () => {
    expect(extractErrorMessage(axiosErrorWith(400, {}))).toBe(UNEXPECTED_ERROR)
  })

  it('returns the unexpected error for a null body', () => {
    expect(extractErrorMessage(axiosErrorWith(400, null))).toBe(UNEXPECTED_ERROR)
  })

  it('returns the unexpected error for a blank message string', () => {
    expect(extractErrorMessage(axiosErrorWith(400, { message: '   ' }))).toBe(UNEXPECTED_ERROR)
  })
})

describe('extractErrorMessage — rule e: axios errors with no response', () => {
  it('returns the localized timeout for ECONNABORTED', () => {
    expect(extractErrorMessage(axiosErrorWithoutResponse('ECONNABORTED', 'timeout of 15000ms exceeded'))).toBe(
      TIMEOUT_ERROR
    )
  })

  it('returns the localized timeout for ETIMEDOUT', () => {
    expect(extractErrorMessage(axiosErrorWithoutResponse('ETIMEDOUT'))).toBe(TIMEOUT_ERROR)
  })

  it('returns the localized network error for other network failures', () => {
    expect(extractErrorMessage(axiosErrorWithoutResponse('ERR_NETWORK', 'Network Error'))).toBe(NETWORK_ERROR)
  })
})

describe('extractErrorMessage — rules f and g: non-axios values', () => {
  it('returns the message of a plain Error', () => {
    expect(extractErrorMessage(new Error('plain failure'))).toBe('plain failure')
  })

  it('skips an Error with an empty message', () => {
    expect(extractErrorMessage(new Error('   '))).toBe(UNEXPECTED_ERROR)
  })

  it('falls back to the unexpected error for non-Error values', () => {
    expect(extractErrorMessage(null)).toBe(UNEXPECTED_ERROR)
    expect(extractErrorMessage(undefined)).toBe(UNEXPECTED_ERROR)
    expect(extractErrorMessage('boom')).toBe(UNEXPECTED_ERROR)
    expect(extractErrorMessage(42)).toBe(UNEXPECTED_ERROR)
    expect(extractErrorMessage({})).toBe(UNEXPECTED_ERROR)
  })
})

describe('extractErrorMessage — idempotency', () => {
  it('returns the same result once the message has already been normalized', () => {
    const cases = [
      axiosErrorWith(422, {
        success: false,
        error: 'RequestValidationError',
        message: "('body', 'phone'): String should match pattern ...",
        details: [{ type: 'string_pattern_mismatch', loc: ['body', 'phone'], msg: 'String should match pattern' }],
      }),
      axiosErrorWith(500, { success: false, error: 'InternalServerError', message: 'server side details' }),
      axiosErrorWith(409, { success: false, error: 'Conflict', message: 'Already exists' }),
      axiosErrorWithoutResponse('ECONNABORTED', 'timeout of 15000ms exceeded'),
      axiosErrorWithoutResponse('ERR_NETWORK', 'Network Error'),
      new Error('plain failure'),
    ]

    for (const error of cases) {
      const first = extractErrorMessage(error)
      error.message = first
      expect(extractErrorMessage(error)).toBe(first)
      expect(extractErrorMessage(error)).toBe(first)
    }
  })

  it('never yields the axios status text after normalization', () => {
    const error = axiosErrorWith(422, {
      details: [{ type: 'missing', loc: ['body', 'phone'], msg: 'Field required' }],
    })
    error.message = extractErrorMessage(error)
    expect(error.message).not.toContain('status code')
    expect(extractErrorMessage(error)).toBe('Phone: Field required')
  })
})

describe('extractErrorMessage — Arabic locale', () => {
  it('returns the Arabic server/network/timeout strings under ar', async () => {
    await i18n.changeLanguage('ar')
    try {
      expect(extractErrorMessage(axiosErrorWith(500, { message: 'server side details' }))).toBe(
        'حصلت مشكلة عندنا. جرّب تاني بعد شوية.'
      )
      expect(extractErrorMessage(axiosErrorWithoutResponse('ERR_NETWORK', 'Network Error'))).toBe('مفيش نت. تأكد من الشبكة.')
      expect(extractErrorMessage(axiosErrorWithoutResponse('ECONNABORTED', 'timeout'))).toBe('الطلب خد وقت طويل. جرّب تاني.')
    } finally {
      await i18n.changeLanguage('en')
    }
  })
})

describe('helper exports keep their signatures', () => {
  const error = axiosErrorWith(422, { success: false, error: 'RequestValidationError', message: 'nope' })

  it('getErrorStatus / isValidationError', () => {
    expect(getErrorStatus(error)).toBe(422)
    expect(isValidationError(error)).toBe(true)
    expect(getErrorStatus(new Error('x'))).toBeNull()
  })

  it('isAuthError / isNotFoundError / isServerError', () => {
    expect(isAuthError(axiosErrorWith(401, null))).toBe(true)
    expect(isAuthError(axiosErrorWith(403, null))).toBe(true)
    expect(isNotFoundError(axiosErrorWith(404, null))).toBe(true)
    expect(isServerError(axiosErrorWith(500, null))).toBe(true)
    expect(isServerError(error)).toBe(false)
  })

  it('getErrorCode returns the error type string', () => {
    expect(getErrorCode(error)).toBe('RequestValidationError')
    expect(getErrorCode(new Error('x'))).toBeNull()
    expect(getErrorCode(axiosErrorWith(400, { error: '' }))).toBeNull()
  })
})
