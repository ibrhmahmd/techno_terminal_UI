import { test, expect } from '../../support/test'
import { ADMIN_ROLES } from '../../support/env'
import { openDashboard } from '../../support/dashboard'
import { trackStudent, untrackStudent } from '../../support/scenario'
import { captureApi, fillStudentForm, hardDeleteStudent } from '../../support/ui'

for (const role of ADMIN_ROLES) {
  test.describe(`dashboard quick actions (${role})`, () => {
    test.use({ role })

    test("today's session count includes this run's groups", async ({ page, scenario }) => {
      void scenario // groups with a session today must exist before reading the count
      await openDashboard(page)
      const widget = page.getByRole('region', { name: 'Quick actions' }).getByText("Today's Sessions").locator('..')
      await expect(widget).toContainText(/\d+/)
      const count = Number((await widget.innerText()).match(/\d+/)?.[0])
      expect(count).toBeGreaterThanOrEqual(2)
    })

    test('Quick Register creates a student', async ({ page, scenario }) => {
      await openDashboard(page)
      await page.getByRole('button', { name: /Quick Register/ }).first().click()
      const dialog = page.getByRole('dialog', { name: 'Quick Register Student' })
      const name = `${scenario.tag}-quick-${test.info().retry}-${role}`
      await fillStudentForm(dialog, name)
      const student = await captureApi<{ id: number }>(page, 'POST', /\/crm\/students\/?$/, () =>
        dialog.getByRole('button', { name: 'Create Student' }).click(),
      )
      trackStudent(scenario.tag, student.id)
      try {
        await expect(page.getByText('Student registered successfully')).toBeVisible()
        await expect(dialog).toBeHidden()
      } finally {
        await hardDeleteStudent(page, student.id)
        untrackStudent(scenario.tag, student.id)
      }
    })

    test('Create Payment opens finance and Quick Reports opens reports', async ({ page }) => {
      await openDashboard(page)
      await page.getByRole('button', { name: /Create Payment/ }).first().click()
      await expect(page).toHaveURL(/\/finance$/)
      await openDashboard(page)
      await page.getByRole('button', { name: /Quick Reports/ }).first().click()
      await expect(page).toHaveURL(/\/reports$/)
    })
  })
}
