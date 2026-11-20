import { test, expect } from '../../support/test'
import { ADMIN_ROLES } from '../../support/env'

// Shared staging always has other groups and rarely fails, so these two states
// are produced by intercepting the one dashboard request.
const OVERVIEW = '**/api/v1/dashboard/daily-overview*'

for (const role of ADMIN_ROLES) {
  test.describe(`dashboard states (${role})`, () => {
    test.use({ role })

    test('shows an error when the overview fails', async ({ page }) => {
      await page.route(OVERVIEW, (route) =>
        route.fulfill({ status: 500, json: { success: false, message: 'e2e injected failure' } }),
      )
      await page.goto('/dashboard')
      await expect(page.getByRole('main').getByRole('alert')).toBeVisible()
    })

    test('shows the empty state for a day with nothing scheduled', async ({ page }) => {
      await page.route(OVERVIEW, async (route) => {
        const response = await route.fetch()
        const body = await response.json()
        body.data = { ...body.data, scheduled_groups: [] }
        await route.fulfill({ response, json: body })
      })
      await page.goto('/dashboard')
      await expect(page.getByText('No groups scheduled for this day')).toBeVisible()
    })
  })
}
