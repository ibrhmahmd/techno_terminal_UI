import { expect, type Locator, type Page } from '@playwright/test'
import { captureApi, escapeRegExp } from './ui'

export type CellStatus = 'not_taken' | 'present' | 'absent'

/** Same text the app renders for a session date ("Nov 14"), in Cairo time. */
export function sessionLabel(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'Africa/Cairo' })
}

export async function openDashboard(page: Page): Promise<void> {
  await page.goto('/dashboard')
  await expect(page.getByRole('tablist', { name: 'Select day' })).toBeVisible()
}

export function groupRegion(page: Page, groupName: string): Locator {
  return page.getByRole('region', { name: `${groupName} attendance`, exact: true })
}

export function cell(region: Locator, student: string, isoDate: string): Locator {
  return region.getByRole('button', {
    name: new RegExp(`^Attendance for ${escapeRegExp(student).source} on ${sessionLabel(isoDate)}: `),
  })
}

export async function expectCell(region: Locator, student: string, isoDate: string, status: CellStatus) {
  await expect(cell(region, student, isoDate)).toHaveAccessibleName(new RegExp(`: ${status}$`))
}

export function sessionButton(region: Locator, action: string, isoDate: string): Locator {
  return region.getByRole('button', { name: `${action} ${sessionLabel(isoDate)}`, exact: true })
}

export function notesBox(region: Locator, isoDate: string): Locator {
  return region.getByRole('textbox', { name: new RegExp(`\\(${sessionLabel(isoDate)}\\)$`) })
}

export interface ExtraSessionOptions {
  substitute?: string
}

/** Adds this test's own extra session through the grid's "Add Session" dialog. */
export async function addExtraSession(page: Page, region: Locator, isoDate: string, opts: ExtraSessionOptions = {}) {
  await region.getByRole('button', { name: 'Add Session' }).click()
  const dialog = page.getByRole('dialog', { name: 'Add Extra Session' })
  await dialog.locator('#session-date').fill(isoDate)
  if (opts.substitute) {
    const clear = dialog.getByRole('button', { name: /^Clear / })
    const search = dialog.getByPlaceholder('Search instructors...')
    await expect(clear.or(search)).toBeVisible()
    if (await clear.isVisible()) await clear.click()
    await search.fill(opts.substitute)
    await dialog.getByRole('option').filter({ hasText: opts.substitute }).first().click()
    const toggle = dialog.getByRole('switch', { name: 'Toggle substitute instructor' })
    if ((await toggle.getAttribute('aria-checked')) !== 'true') await toggle.click()
  }
  await captureApi(page, 'POST', /\/academics\/groups\/\d+\/sessions\/?$/, () =>
    dialog.getByRole('button', { name: 'Add Session' }).click(),
  )
  await expect(dialog).toBeHidden()
  await expect(sessionButton(region, 'Edit session details', isoDate)).toBeVisible()
}

/** Clicks "Save Changes" in the grid footer and waits for the attendance POST. */
export async function saveGrid(page: Page, region: Locator) {
  await captureApi(page, 'POST', /\/attendance\/session\/\d+\/mark$/, () =>
    region.getByRole('button', { name: 'Save Changes' }).click(),
  )
}
