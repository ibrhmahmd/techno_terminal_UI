import { test as base, expect } from '@playwright/test'
import { authFile, isAllowedRequestUrl, type Role } from './env'
import { cairoDate, createScenario, destroyScenario, type Scenario } from './scenario'

interface TestFixtures {
  /** Which logged-in account the test's page uses. */
  role: Role
  /**
   * A date for this test's own extra session: today + N days, never a multiple
   * of 7, so it never shares a date (or column label) with the weekly sessions
   * or another test's extra session in the same worker.
   */
  extraSessionDate: string
}

interface WorkerFixtures {
  /** Course, one group per instructor (sessions today), enrolled students. Built and torn down via the UI as admin. */
  scenario: Scenario
  dateCounter: { next: () => number }
}

export const test = base.extend<TestFixtures, WorkerFixtures>({
  role: ['admin', { option: true }],
  // Defense in depth: a request to any other origin fails the test instead of reaching another backend.
  context: async ({ context }, use) => {
    await context.route('**/*', (route) => {
      const url = route.request().url()
      if (isAllowedRequestUrl(url)) return route.fallback()
      console.error(`E2E blocked request to disallowed origin: ${url}`)
      return route.abort('blockedbyclient')
    })
    await use(context)
  },
  storageState: async ({ role }, use) => {
    await use(authFile(role))
  },

  dateCounter: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use) => {
      let n = 0
      await use({
        next: () => {
          n += 1
          if (n % 7 === 0) n += 1
          return n
        },
      })
    },
    { scope: 'worker' },
  ],
  extraSessionDate: async ({ dateCounter }, use) => {
    await use(cairoDate(dateCounter.next()))
  },

  scenario: [
    async ({ browser }, use, workerInfo) => {
      const context = await browser.newContext({
        baseURL: workerInfo.project.use.baseURL,
        storageState: authFile('admin'),
        viewport: { width: 1440, height: 900 },
        timezoneId: 'Africa/Cairo',
        locale: 'en-US',
      })
      await context.route('**/*', (route) =>
        isAllowedRequestUrl(route.request().url()) ? route.fallback() : route.abort('blockedbyclient'),
      )
      const page = await context.newPage()
      const scenario = await createScenario(page, workerInfo.workerIndex)
      await use(scenario)
      await destroyScenario(page, scenario)
      await context.close()
    },
    { scope: 'worker', timeout: 15 * 60_000 },
  ],
})

export { expect }
