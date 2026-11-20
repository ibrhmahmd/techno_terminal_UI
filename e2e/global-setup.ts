import { apiTarget } from './support/env'

export default function globalSetup() {
  apiTarget() // guard again, independent of the config
  // Propagates to every worker; prefixes all data this run creates.
  process.env.E2E_RUN_ID ??= new Date().toISOString().replace(/\D/g, '').slice(0, 14)
}
