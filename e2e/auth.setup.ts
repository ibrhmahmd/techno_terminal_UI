import { test as setup, expect } from '@playwright/test'
import { authFile, credentials, ROLES } from './support/env'

for (const role of ROLES) {
  setup(`log in as ${role}`, async ({ page }) => {
    const { email, password } = credentials(role)
    await page.goto('/login')
    await page.getByLabel('Email').fill(email)
    await page.getByLabel('Password', { exact: true }).fill(password)
    await page.getByRole('button', { name: 'Sign In' }).click()
    await expect(page).toHaveURL(/\/dashboard$/)
    await page.context().storageState({ path: authFile(role) })
  })
}
