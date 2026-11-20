import { test, expect } from '../../support/test'
import { ADMIN_ROLES } from '../../support/env'
import { sessionLabel } from '../../support/dashboard'
import { cairoDate } from '../../support/scenario'
import { captureApi, escapeRegExp } from '../../support/ui'

// Runs in the `mobile` project (Pixel 7, below the 1024px breakpoint).
for (const role of ADMIN_ROLES) {
  test.describe(`mobile dashboard (${role})`, () => {
    test.use({ role })

    test("mark attendance for today's session from the sheet", async ({ page, scenario }) => {
      const group = scenario.groups.instructor_b
      const today = cairoDate()
      const student = group.students[0].name
      const open = async () => {
        await page.getByRole('button', { name: `View attendance for ${group.name}` }).click()
        const sheet = page.getByRole('dialog')
        await sheet.getByRole('button').filter({ hasText: sessionLabel(today) }).first().click()
        return sheet.getByRole('button', { name: new RegExp(`^Attendance for ${escapeRegExp(student).source} on `) })
      }

      await page.goto('/dashboard')
      let button = await open()
      // Today's session is shared by every mobile test in this worker: flip to whichever saved status it isn't now.
      const before = (await button.getAttribute('aria-label'))?.split(': ').pop()
      const target = before === 'present' ? 'absent' : 'present'
      for (let i = 0; i < 2 && !(await button.getAttribute('aria-label'))?.endsWith(`: ${target}`); i++) await button.click()
      await expect(button).toHaveAccessibleName(new RegExp(`: ${target}$`))

      await captureApi(page, 'POST', /\/attendance\/session\/\d+\/mark$/, () =>
        page.getByRole('dialog').getByRole('button', { name: /^Save Attendance/ }).click(),
      )

      await page.reload()
      button = await open()
      await expect(button).toHaveAccessibleName(new RegExp(`: ${target}$`))
    })

    test('FAB actions navigate', async ({ page }) => {
      await page.goto('/dashboard')
      await page.getByRole('button', { name: 'Open actions' }).click()
      await page.getByRole('button', { name: /Create Payment/ }).click()
      await expect(page).toHaveURL(/\/finance$/)

      await page.goto('/dashboard')
      await page.getByRole('button', { name: 'Open actions' }).click()
      await page.getByRole('button', { name: /Quick Register/ }).click()
      await expect(page).toHaveURL(/\/directory$/)
    })
  })
}
