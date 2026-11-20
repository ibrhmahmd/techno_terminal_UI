import type { Locator, Page } from '@playwright/test'
import { test, expect } from '../../support/test'
import { ADMIN_ROLES } from '../../support/env'
import { addExtraSession, cell, expectCell, groupRegion, notesBox, openDashboard, saveGrid } from '../../support/dashboard'

for (const role of ADMIN_ROLES) {
  test.describe(`dashboard attendance grid (${role})`, () => {
    test.use({ role })

    test('a cell cycles not_taken → present → absent → not_taken', async ({ page, scenario, extraSessionDate }) => {
      const group = scenario.groups.instructor_a
      const student = group.students[0].name
      await openDashboard(page)
      const region = groupRegion(page, group.name)
      await addExtraSession(page, region, extraSessionDate)

      await expectCell(region, student, extraSessionDate, 'not_taken')
      await cell(region, student, extraSessionDate).click()
      await expectCell(region, student, extraSessionDate, 'present')
      await cell(region, student, extraSessionDate).click()
      await expectCell(region, student, extraSessionDate, 'absent')
      await cell(region, student, extraSessionDate).click()
      await expectCell(region, student, extraSessionDate, 'not_taken')
    })

    test('batch save persists after reload', async ({ page, scenario, extraSessionDate }) => {
      const group = scenario.groups.instructor_a
      const [s1, s2, s3] = group.students.map((s) => s.name)
      await openDashboard(page)
      let region = groupRegion(page, group.name)
      await addExtraSession(page, region, extraSessionDate)

      await cell(region, s1, extraSessionDate).click() // present
      await cell(region, s2, extraSessionDate).click()
      await cell(region, s2, extraSessionDate).click() // absent
      await saveGrid(page, region)

      await page.reload()
      region = groupRegion(page, group.name)
      await expectCell(region, s1, extraSessionDate, 'present')
      await expectCell(region, s2, extraSessionDate, 'absent')
      await expectCell(region, s3, extraSessionDate, 'not_taken')
    })

    test('Cancel discards unsaved changes', async ({ page, scenario, extraSessionDate }) => {
      const group = scenario.groups.instructor_b
      const student = group.students[0].name
      await openDashboard(page)
      const region = groupRegion(page, group.name)
      await addExtraSession(page, region, extraSessionDate)

      await cell(region, student, extraSessionDate).click()
      await expectCell(region, student, extraSessionDate, 'present')
      await region.getByRole('button', { name: 'Cancel', exact: true }).click()
      await expectCell(region, student, extraSessionDate, 'not_taken')
    })

    test('a session note is saved and survives a reload', async ({ page, scenario, extraSessionDate }) => {
      const group = scenario.groups.instructor_b
      const note = `${scenario.tag} note ${Date.now()}`
      await openDashboard(page)
      let region = groupRegion(page, group.name)
      await addExtraSession(page, region, extraSessionDate)

      await notesBox(region, extraSessionDate).fill(note)
      const saved = page.waitForResponse((r) => r.request().method() === 'PATCH' && /\/academics\/sessions\/\d+$/.test(r.url()))
      await region.getByRole('button', { name: 'Save Changes' }).click()
      expect((await saved).ok()).toBeTruthy()
      // Dirty notes must not be overwritten by the post-save refetch.
      await expect(notesBox(region, extraSessionDate)).toHaveValue(note)

      await page.reload()
      region = groupRegion(page, group.name)
      await expect(notesBox(region, extraSessionDate)).toHaveValue(note)
    })

    test('a failed save shows a retry that then succeeds', async ({ page, scenario, extraSessionDate }) => {
      const group = scenario.groups.instructor_a
      const student = group.students[1].name
      await openDashboard(page)
      let region = groupRegion(page, group.name)
      await addExtraSession(page, region, extraSessionDate)

      // Fail only the first attempt; the retry goes to staging for real.
      let failed = false
      await page.route('**/api/v1/attendance/session/*/mark', async (route) => {
        if (!failed) {
          failed = true
          await route.fulfill({ status: 500, json: { success: false, message: 'e2e injected failure' } })
        } else {
          await route.continue()
        }
      })

      await cell(region, student, extraSessionDate).click()
      await region.getByRole('button', { name: 'Save Changes' }).click()
      await expect(region.getByText('Failed to save:')).toBeVisible()
      await saveGridRetry(page, region)

      await page.reload()
      region = groupRegion(page, group.name)
      await expectCell(region, student, extraSessionDate, 'present')
    })
  })
}

async function saveGridRetry(page: Page, region: Locator) {
  const done = page.waitForResponse((r) => r.request().method() === 'POST' && /\/attendance\/session\/\d+\/mark$/.test(r.url()) && r.ok())
  await region.getByRole('button', { name: /^Session \d+$/ }).click()
  await done
}
