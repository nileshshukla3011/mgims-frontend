import type { Page } from '@playwright/test'
import { accessibilityViolations, expect, test } from './fixtures.ts'

// The console's demo sign-in: user IDs `superadmin`, `<department>-admin`, `<department>-approver`, the test build's
// demo password, and a one-time code that demo mode shows on screen.
const PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? 'demo123'

const signIn = async (page: Page, user: string, path = '/') => {
  await page.goto(path)
  await page.getByLabel('Admin role / user ID').fill(user)
  await page.getByLabel('Password', { exact: true }).fill(PASSWORD)
  await page.getByRole('button', { name: 'Sign in' }).click()
  const code = (await page.getByRole('note').locator('strong').innerText()).trim()
  await page.getByLabel('One-time code').fill(code)
  await page.getByRole('button', { name: 'Verify and sign in' }).click()
  await expect(page.getByRole('navigation', { name: 'Console sections' })).toBeVisible()
}
const section = (page: Page, name: string | RegExp) => page.getByRole('navigation', { name: 'Console sections' }).getByRole('link', { name })
const signOut = async (page: Page) => {
  await page.getByRole('button', { name: 'Logout' }).click()
  await expect(page.getByLabel('Admin role / user ID')).toBeVisible()
}

test('sign-in needs a second factor, and a wrong code is refused', async ({ page, errors }) => {
  void errors
  await page.goto('/')
  expect(await accessibilityViolations(page)).toEqual([])
  await page.getByLabel('Admin role / user ID').fill('superadmin')
  await page.getByLabel('Password', { exact: true }).fill(PASSWORD)
  await page.getByRole('button', { name: 'Sign in' }).click()
  await page.getByLabel('One-time code').fill('000000')
  await page.getByRole('button', { name: 'Verify and sign in' }).click()
  await expect(page.getByRole('alert')).toContainText('not correct')
  await expect(page.getByRole('navigation', { name: 'Console sections' })).toHaveCount(0)
})

test('five wrong passwords lock sign-in', async ({ page, errors }) => {
  void errors
  await page.goto('/')
  for (let i = 0; i < 5; i++) {
    await page.getByLabel('Admin role / user ID').fill('superadmin')
    await page.getByLabel('Password', { exact: true }).fill('wrong')
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page.getByRole('alert')).toBeVisible()
  }
  await expect(page.getByRole('alert')).toContainText('locked')
})

test('every section has its own address; Back works; other roles fall back to the dashboard', async ({ page, errors }) => {
  void errors
  await signIn(page, 'superadmin')
  await expect(section(page, /./)).toHaveCount(16)
  await section(page, /^Approvals/).click()
  await expect(page).toHaveURL(/\/approvals$/)
  await expect(section(page, /^Approvals/)).toHaveAttribute('aria-current', 'page')
  await section(page, /Citizen Inquiries/).click()
  await expect(page).toHaveURL(/\/inquiries$/)
  await section(page, 'Data sources').click()
  await page.goBack()
  await expect(page).toHaveURL(/\/inquiries$/)
  expect(await accessibilityViolations(page)).toEqual([])
  await signOut(page)

  await signIn(page, 'medicine-admin', '/reports')
  await expect(page).toHaveURL(/\/$/)
  await expect(section(page, /./)).toHaveCount(10)
})

test('a notice can be published, deleted and restored with Undo', async ({ page, errors }) => {
  void errors
  await signIn(page, 'superadmin', '/tenders')
  await page.getByRole('button', { name: 'Add new entry' }).click()
  await page.getByLabel('Title *').fill('Test tender for hospital linen')
  await page.getByLabel('Notice description / text *').fill('Sealed tenders are invited for the supply of hospital linen.')
  await page.getByRole('dialog').getByRole('button', { name: 'Publish notice' }).click()
  await expect(page.getByRole('status').filter({ hasText: 'Published' })).toBeVisible()
  await page.getByRole('button', { name: 'Delete Test tender for hospital linen' }).click()
  await page.getByRole('status').filter({ hasText: 'Notice deleted.' }).getByRole('button', { name: 'Undo' }).click()
  await expect(page.getByRole('row', { name: /Test tender for hospital linen/ })).toHaveCount(1)
})

test('a department admin submits, only that department’s approver decides, and it is published', async ({ page, errors }) => {
  void errors
  const overview = `Test overview ${Date.now()}`
  await signIn(page, 'medicine-admin', '/departments')
  await page.getByLabel('Overview', { exact: true }).fill(overview)
  await page.getByRole('button', { name: 'Submit for approval' }).click()
  await expect(page.getByText('Sent for approval.')).toBeVisible()
  await signOut(page)

  await signIn(page, 'surgery-approver', '/approvals')
  await expect(page.getByText('Medicine: department profile')).toHaveCount(0)
  await signOut(page)

  await signIn(page, 'medicine-approver', '/approvals')
  const waiting = page.getByRole('region', { name: 'Waiting for approval' })
  await waiting.getByRole('button', { name: /^Approve/ }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Approve and publish' }).click()
  await expect(page.getByRole('status').filter({ hasText: 'Approved and published' })).toBeVisible()
  await expect(page.getByRole('region', { name: 'Recently published' })).toContainText('Medicine: department profile')
})
