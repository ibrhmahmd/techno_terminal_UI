import { test, expect } from '../../support/test'
import { ADMIN_ROLES } from '../../support/env'
import { cairoWeekday } from '../../support/scenario'
import { groupRegion, openDashboard } from '../../support/dashboard'

const tomorrow = () => cairoWeekday(new Date(Date.now() + 86_400_000))

for (const role of ADMIN_ROLES) {
  test.describe(`dashboard day and instructor filter (${role})`, () => {
    test.use({ role })

    test("today's tab is selected and shows this run's groups", async ({ page, scenario }) => {
      await openDashboard(page)
      const days = page.getByRole('tablist', { name: 'Select day' })
      await expect(days.getByRole('tab', { name: cairoWeekday(), exact: true })).toHaveAttribute('aria-selected', 'true')
      await expect(groupRegion(page, scenario.groups.instructor_a.name)).toBeVisible()
      await expect(groupRegion(page, scenario.groups.instructor_b.name)).toBeVisible()
    })

    test('instructor filter separates instructor A and B; All shows both', async ({ page, scenario }) => {
      const { instructor_a: a, instructor_b: b } = scenario.groups
      await openDashboard(page)
      const filter = page.getByRole('tablist', { name: 'Filter by instructor' })

      await filter.getByRole('tab', { name: a.instructor, exact: true }).click()
      await expect(groupRegion(page, a.name)).toBeVisible()
      await expect(groupRegion(page, b.name)).toBeHidden()

      await filter.getByRole('tab', { name: b.instructor, exact: true }).click()
      await expect(groupRegion(page, b.name)).toBeVisible()
      await expect(groupRegion(page, a.name)).toBeHidden()

      await filter.getByRole('tab', { name: 'All', exact: true }).click()
      await expect(groupRegion(page, a.name)).toBeVisible()
      await expect(groupRegion(page, b.name)).toBeVisible()
    })

    test('switching day hides our groups and resets the instructor filter', async ({ page, scenario }) => {
      const a = scenario.groups.instructor_a
      await openDashboard(page)
      await page.getByRole('tablist', { name: 'Filter by instructor' }).getByRole('tab', { name: a.instructor, exact: true }).click()

      await page.getByRole('tablist', { name: 'Select day' }).getByRole('tab', { name: tomorrow(), exact: true }).click()
      await expect(groupRegion(page, a.name)).toBeHidden()
      const filter = page.getByRole('tablist', { name: 'Filter by instructor' })

      await page.getByRole('tablist', { name: 'Select day' }).getByRole('tab', { name: cairoWeekday(), exact: true }).click()
      await expect(groupRegion(page, a.name)).toBeVisible()
      await expect(groupRegion(page, scenario.groups.instructor_b.name)).toBeVisible()
      // The bar is always rendered here (our instructors have groups today): the day switch must have reset it to "All".
      await expect(filter.getByRole('tab', { name: 'All', exact: true })).toHaveAttribute('aria-selected', 'true')
    })
  })
}
