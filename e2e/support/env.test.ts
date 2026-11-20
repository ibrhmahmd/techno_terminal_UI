// Run with: npm run e2e:guard-test (node --test, no browser, no network)
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { assertStagingTarget, STAGING_API_HOST } from './env.ts'

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
