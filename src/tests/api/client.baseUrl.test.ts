import { describe, it, expect, vi } from 'vitest'

describe('API Client - Base URL Configuration', () => {
  it('uses default /api/v1 when VITE_API_BASE_URL is not set', async () => {
    vi.unstubAllEnvs()
    vi.resetModules()

    const { createApiClient } = await import('../../api/client')
    const client = createApiClient()

    expect(client.defaults.baseURL).toBe('/api/v1')
  })

  it('uses VITE_API_BASE_URL when set', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://staging.example.com/api/v1')
    vi.resetModules()

    const { createApiClient } = await import('../../api/client')
    const client = createApiClient()

    expect(client.defaults.baseURL).toBe('https://staging.example.com/api/v1')

    vi.unstubAllEnvs()
  })
})