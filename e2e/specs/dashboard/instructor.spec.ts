import { test, expect } from '../../support/test'
import type { InstructorRole } from '../../support/env'
import { groupRegion, openDashboard } from '../../support/dashboard'

const OTHER: Record<InstructorRole, InstructorRole> = { instructor_a: 'instructor_b', instructor_b: 'instructor_a' }

for (const role of ['instructor_a', 'instructor_b'] as const) {
  test.describe(`instructor dashboard (${role})`, () => {
    test.use({ role })

    test('sees only their own group', async ({ page, scenario }) => {
      // Instructors get 403 on /dashboard/daily-overview today.
      test.fail(true, 'Blocked by ibrhmahmd/techno-terminal#220 and techno_terminal_UI#34')
      await openDashboard(page)
      await expect(groupRegion(page, scenario.groups[role].name)).toBeVisible()
      await expect(groupRegion(page, scenario.groups[OTHER[role]].name)).toBeHidden()
    })

    test('admin-only pages redirect back to the dashboard', async ({ page }) => {
      for (const path of ['/finance', '/reports', '/directory']) {
        await page.goto(path)
        await expect(page).toHaveURL(/\/dashboard$/)
      }
    })
  })
}
