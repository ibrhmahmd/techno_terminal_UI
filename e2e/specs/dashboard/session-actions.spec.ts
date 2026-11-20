import { test, expect } from '../../support/test'
import { ADMIN_ROLES } from '../../support/env'
import { addExtraSession, groupRegion, openDashboard, sessionButton } from '../../support/dashboard'
import { captureApi } from '../../support/ui'
import { cairoDate } from '../../support/scenario'

for (const role of ADMIN_ROLES) {
  test.describe(`dashboard session actions on a test-owned session (${role})`, () => {
    test.use({ role })

    test('cancel, then reactivate', async ({ page, scenario, extraSessionDate }) => {
      await openDashboard(page)
      const region = groupRegion(page, scenario.groups.instructor_a.name)
      await addExtraSession(page, region, extraSessionDate)

      await sessionButton(region, 'Cancel session', extraSessionDate).click()
      await page.getByRole('alertdialog').getByRole('button', { name: 'Cancel Session' }).click()
      await expect(sessionButton(region, 'Reactivate session', extraSessionDate)).toBeVisible()

      await sessionButton(region, 'Reactivate session', extraSessionDate).click()
      await expect(sessionButton(region, 'Cancel session', extraSessionDate)).toBeVisible()
    })

    test('mark complete', async ({ page, scenario, extraSessionDate }) => {
      await openDashboard(page)
      const region = groupRegion(page, scenario.groups.instructor_a.name)
      await addExtraSession(page, region, extraSessionDate)

      await sessionButton(region, 'Mark session as completed', extraSessionDate).click()
      await expect(sessionButton(region, 'Mark session as completed', extraSessionDate)).toBeHidden()
      await expect(sessionButton(region, 'Edit session details', extraSessionDate)).toBeVisible()
    })

    test('edit moves the session to another date', async ({ page, scenario, extraSessionDate, dateCounter }) => {
      const newDate = cairoDate(dateCounter.next())
      await openDashboard(page)
      const region = groupRegion(page, scenario.groups.instructor_b.name)
      await addExtraSession(page, region, extraSessionDate)

      await sessionButton(region, 'Edit session details', extraSessionDate).click()
      const dialog = page.getByRole('dialog', { name: 'Edit Session' })
      await dialog.getByLabel('Date', { exact: true }).fill(newDate)
      await dialog.getByRole('button', { name: 'Save Changes' }).click()
      await expect(dialog).toBeHidden()
      await expect(sessionButton(region, 'Edit session details', newDate)).toBeVisible()
      await expect(sessionButton(region, 'Edit session details', extraSessionDate)).toBeHidden()
    })

    test('delete removes the session column', async ({ page, scenario, extraSessionDate }) => {
      await openDashboard(page)
      const region = groupRegion(page, scenario.groups.instructor_b.name)
      await addExtraSession(page, region, extraSessionDate)

      await sessionButton(region, 'Delete session', extraSessionDate).click()
      await captureApi(page, 'DELETE', /\/academics\/sessions\/\d+$/, () =>
        page.getByRole('alertdialog').getByRole('button', { name: 'Delete Session' }).click(),
      )
      await expect(sessionButton(region, 'Edit session details', extraSessionDate)).toBeHidden()
    })
  })
}
