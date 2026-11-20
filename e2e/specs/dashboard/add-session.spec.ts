import { test, expect } from '../../support/test'
import { ADMIN_ROLES } from '../../support/env'
import { addExtraSession, groupRegion, openDashboard, sessionLabel } from '../../support/dashboard'

for (const role of ADMIN_ROLES) {
  test.describe(`dashboard add session (${role})`, () => {
    test.use({ role })

    test('an extra session with a substitute shows the substitute; the group stays under its own instructor', async ({
      page,
      scenario,
      extraSessionDate,
    }) => {
      const { instructor_a: a, instructor_b: b } = scenario.groups
      await openDashboard(page)
      const region = groupRegion(page, a.name)
      await addExtraSession(page, region, extraSessionDate, { substitute: b.instructor })

      const header = region.getByRole('columnheader').filter({ hasText: sessionLabel(extraSessionDate) })
      await expect(header).toContainText(b.instructor)

      // The dashboard filter goes by the group's instructor, not the session's (agreed behaviour).
      const filter = page.getByRole('tablist', { name: 'Filter by instructor' })
      await filter.getByRole('tab', { name: a.instructor, exact: true }).click()
      await expect(groupRegion(page, a.name)).toBeVisible()
      await filter.getByRole('tab', { name: b.instructor, exact: true }).click()
      await expect(groupRegion(page, a.name)).toBeHidden()
    })
  })
}
