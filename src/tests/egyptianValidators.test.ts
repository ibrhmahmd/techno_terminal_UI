import { describe, expect, it } from 'vitest'
import { hasValidChecksum, isValidEgyptianNationalId, normalizeEgyptianPhone } from '../utils/egyptianValidators'

describe('isValidEgyptianNationalId', () => {
  it('accepts a structurally valid 14-digit ID', () => {
    expect(isValidEgyptianNationalId('30001011234567')).toBe(true)
  })

  it('trims surrounding whitespace', () => {
    expect(isValidEgyptianNationalId('  30001011234567  ')).toBe(true)
  })

  it('rejects short input', () => {
    expect(isValidEgyptianNationalId('123')).toBe(false)
  })

  it('rejects more than 14 digits', () => {
    expect(isValidEgyptianNationalId('300010112345678')).toBe(false)
  })

  it('rejects non-digit characters', () => {
    expect(isValidEgyptianNationalId('3000101123456a')).toBe(false)
  })

  it('rejects an unknown century digit', () => {
    expect(isValidEgyptianNationalId('40001011234567')).toBe(false)
  })

  it('rejects month 13', () => {
    expect(isValidEgyptianNationalId('30013011234567')).toBe(false)
  })

  it('rejects day 32', () => {
    expect(isValidEgyptianNationalId('30001321234567')).toBe(false)
  })

  it('rejects February 30 even in a leap year', () => {
    expect(isValidEgyptianNationalId('30002301234567')).toBe(false)
  })

  it('rejects an out-of-range governorate', () => {
    expect(isValidEgyptianNationalId('30001019934567')).toBe(false)
  })
})

describe('normalizeEgyptianPhone', () => {
  it('accepts all four live prefixes', () => {
    expect(normalizeEgyptianPhone('01012345678')).toBe('01012345678')
    expect(normalizeEgyptianPhone('01112345678')).toBe('01112345678')
    expect(normalizeEgyptianPhone('01212345678')).toBe('01212345678')
    expect(normalizeEgyptianPhone('01512345678')).toBe('01512345678')
  })

  it('normalizes a +20 international prefix', () => {
    expect(normalizeEgyptianPhone('+201001234567')).toBe('01001234567')
  })

  it('normalizes a bare 20 country prefix', () => {
    expect(normalizeEgyptianPhone('201001234567')).toBe('01001234567')
  })

  it('strips separators before validating', () => {
    expect(normalizeEgyptianPhone('010 1234 5678')).toBe('01012345678')
    expect(normalizeEgyptianPhone('(010) 123-45678')).toBe('01012345678')
  })

  it('rejects a dead operator prefix', () => {
    expect(normalizeEgyptianPhone('01812345678')).toBeNull()
  })

  it('rejects truncated numbers', () => {
    expect(normalizeEgyptianPhone('0101234567')).toBeNull()
  })

  it('rejects letters', () => {
    expect(normalizeEgyptianPhone('abc')).toBeNull()
  })

  it('rejects empty input', () => {
    expect(normalizeEgyptianPhone('')).toBeNull()
  })
})

describe('hasValidChecksum', () => {
  it('is deterministic for repeated calls', () => {
    const first = hasValidChecksum('30001011234567')
    const second = hasValidChecksum('30001011234567')
    expect(first).toBe(second)
  })
})
