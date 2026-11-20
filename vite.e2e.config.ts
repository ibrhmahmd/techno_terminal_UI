import { defineConfig, mergeConfig } from 'vite'
import base from './vite.config'
import { apiTarget } from './e2e/support/env'

// Same as vite.config.ts, but /api goes to staging (guarded) instead of production.
export default mergeConfig(
  base,
  defineConfig({
    server: { proxy: { '/api': { target: apiTarget(), changeOrigin: true, secure: true } } },
  }),
)
