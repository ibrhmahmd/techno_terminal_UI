const NID_PATTERN = /^[23]\d{13}$/
const NID_CHECKSUM_WEIGHTS = [2, 7, 6, 3, 4, 8, 5, 10, 9, 7, 6, 4, 2]
const PHONE_PATTERN = /^01[0125]\d{8}$/

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

export function isValidEgyptianNationalId(nationalId: string, verifyChecksum = false): boolean {
  const nid = nationalId.trim()
  if (!NID_PATTERN.test(nid)) return false
  const year = parseInt(nid.slice(1, 3), 10) + (nid.startsWith('2') ? 1900 : 2000)
  const month = parseInt(nid.slice(3, 5), 10)
  if (month < 1 || month > 12) return false
  const day = parseInt(nid.slice(5, 7), 10)
  if (day < 1 || day > daysInMonth(year, month)) return false
  const governorate = parseInt(nid.slice(7, 9), 10)
  if (governorate < 1 || governorate > 88) return false
  if (verifyChecksum && !hasValidChecksum(nid)) return false
  return true
}

export function hasValidChecksum(nationalId: string): boolean {
  const nid = nationalId.trim()
  let sum = 0
  for (let i = 0; i < 13; i++) {
    sum += parseInt(nid[i], 10) * NID_CHECKSUM_WEIGHTS[i]
  }
  const remainder = sum % 11
  const expected = remainder === 0 ? 0 : 11 - remainder
  return Number.isInteger(expected) && expected === parseInt(nid[13], 10)
}

export function normalizeEgyptianPhone(raw: string): string | null {
  let phone = raw.replace(/[\s\-()]/g, '')
  if (phone.startsWith('+20')) {
    phone = `0${phone.slice(3)}`
  } else if (phone.length === 12 && phone.startsWith('20')) {
    phone = `0${phone.slice(2)}`
  }
  return PHONE_PATTERN.test(phone) ? phone : null
}
