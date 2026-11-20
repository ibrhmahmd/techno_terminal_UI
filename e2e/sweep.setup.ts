import { test as setup } from '@playwright/test'
import { authFile } from './support/env'
import { sweepLedgers } from './support/scenario'

setup.use({ storageState: authFile('admin') })
setup.setTimeout(15 * 60_000)

setup('sweep data left by interrupted runs', async ({ page }) => {
  const { swept, failed } = await sweepLedgers(page)
  if (swept.length) console.log(`e2e sweep: ${swept.length} ledger(s) processed`)
  // Don't block the run on old residue; report it so someone can look.
  if (failed.length) console.warn(`e2e sweep: could not fully clean:\n${failed.join('\n')}`)
})
