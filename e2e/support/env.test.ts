// Run with: npm run e2e:guard-test (node --test, no browser, no network)
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { assertNoApiBaseOverride, assertStagingTarget, isAllowedRequestUrl, STAGING_API_HOST } from './env.ts'

test('allows the staging host', () => {
  assert.equal(assertStagingTarget(`https://${STAGING_API_HOST}/`), `https://${STAGING_API_HOST}`)
})

test('refuses production, other hosts, http, empty and garbage', () => {
  for (const bad of [
    'https://techno-terminal-5c255cfe.fastapicloud.dev',
    `http://${STAGING_API_HOST}`,
    `https://${STAGING_API_HOST}.evil.dev`,
    'http://0.0.0.0:8000',
    '',
    undefined,
    'not a url',
  ]) {
    assert.throws(() => assertStagingTarget(bad), /E2E refused to start/, String(bad))
  }
})

test('request allowlist: e2e server and fonts only', () => {
  assert.ok(isAllowedRequestUrl('http://localhost:5179/api/v1/x'))
  assert.ok(isAllowedRequestUrl('https://fonts.gstatic.com/s/a.woff2'))
  for (const bad of ['https://techno-terminal-5c255cfe.fastapicloud.dev/api/v1/x', `https://${STAGING_API_HOST}/api`, 'http://localhost:8000/api', 'http://localhost:5179/certs-api/api/v1/x', 'garbage']) {
    assert.equal(isAllowedRequestUrl(bad), false, bad)
  }
})

test('refuses a VITE_API_BASE_URL override', () => {
  assert.throws(() => assertNoApiBaseOverride({ VITE_API_BASE_URL: 'https://x.dev/api/v1' }), /VITE_API_BASE_URL/)
  assert.doesNotThrow(() => assertNoApiBaseOverride({}, { VITE_API_BASE_URL: '' }))
})
