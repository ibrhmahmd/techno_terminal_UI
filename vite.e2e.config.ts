import { defineConfig, loadEnv, mergeConfig } from 'vite'
import base from './vite.config'
import { apiTarget, assertNoApiBaseOverride } from './e2e/support/env'

// Same as vite.config.ts, but /api goes to staging (guarded) instead of production.
export default defineConfig((env) => {
  assertNoApiBaseOverride(loadEnv(env.mode, process.cwd(), ''), process.env)
  return mergeConfig(
    base,
    defineConfig({
      // Always same-origin, so every API call goes through the guarded proxy below.
      define: { 'import.meta.env.VITE_API_BASE_URL': JSON.stringify('') },
      server: { proxy: { '/api': { target: apiTarget(), changeOrigin: true, secure: true } } },
    }),
  )
})
