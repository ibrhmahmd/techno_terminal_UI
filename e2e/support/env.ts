import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

export const STAGING_API_HOST = 'techno-terminal-staging.fastapicloud.dev'

export const ROLES = ['admin', 'system_admin', 'instructor_a', 'instructor_b'] as const
export type Role = (typeof ROLES)[number]
export const ADMIN_ROLES = ['admin', 'system_admin'] as const
export type InstructorRole = 'instructor_a' | 'instructor_b'

const ENV_FILE = fileURLToPath(new URL('../../.env.e2e', import.meta.url))

/**
 * Fail closed: the suite creates and deletes real records, so the only API it
 * may ever talk to is staging. Anything else (prod host, typo, empty) throws.
 */
export function assertStagingTarget(target: string | undefined): string {
  let url: URL | null = null
  try {
    url = new URL(target ?? '')
  } catch {
    url = null
  }
  if (!url || url.protocol !== 'https:' || url.host !== STAGING_API_HOST) {
    throw new Error(
      `E2E refused to start: E2E_API_TARGET must be https://${STAGING_API_HOST} (got "${target ?? ''}"). ` +
        'The suite writes data and must never run against production.',
    )
  }
  return url.origin
}

/** Loads .env.e2e (if present) and returns the guarded staging origin. */
export function apiTarget(): string {
  if (existsSync(ENV_FILE)) process.loadEnvFile(ENV_FILE)
  return assertStagingTarget(process.env.E2E_API_TARGET)
}

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing ${name} in .env.e2e (see .env.e2e.example)`)
  return value
}

export function credentials(role: Role): { email: string; password: string } {
  const key = role.toUpperCase()
  return { email: requireEnv(`E2E_${key}_EMAIL`), password: requireEnv(`E2E_${key}_PASSWORD`) }
}

/** Employee full name as shown in instructor pickers and dashboard filters. */
export function instructorName(role: InstructorRole): string {
  return requireEnv(`E2E_${role.toUpperCase()}_NAME`)
}

export function authFile(role: Role): string {
  return fileURLToPath(new URL(`../.auth/${role}.json`, import.meta.url))
}

/** Browser requests the e2e suite may make; anything else could reach a real backend. */
export const E2E_ORIGIN = 'http://localhost:5179'
const ALLOWED_EXTERNAL_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com', 'va.vercel-scripts.com']

export function isAllowedRequestUrl(rawUrl: string): boolean {
  let url: URL
  try {
    url = new URL(rawUrl)
  } catch {
    return false
  }
  if (url.protocol === 'data:' || url.protocol === 'blob:' || url.protocol === 'about:') return true
  // vite.config.ts proxies /certs-api to the production certificates backend; M1 never needs it.
  if (url.origin === E2E_ORIGIN && url.pathname.startsWith('/certs-api')) return false
  return url.origin === E2E_ORIGIN || ALLOWED_EXTERNAL_HOSTS.includes(url.hostname)
}

/** The e2e build must use the guarded Vite proxy, never a direct API host. */
export function assertNoApiBaseOverride(...sources: Array<Record<string, string | undefined>>): void {
  if (sources.some((env) => env.VITE_API_BASE_URL)) {
    throw new Error(
      'E2E refused to start: VITE_API_BASE_URL is set (shell or .env file). It would make the browser call that host directly, ' +
        'bypassing the staging-only proxy. Unset it.',
    )
  }
}
