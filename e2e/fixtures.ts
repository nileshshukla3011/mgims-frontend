import { test as base, expect, type Page } from '@playwright/test'
import { AxeBuilder } from '@axe-core/playwright'

/** Fails the test if the page logged a console error or threw; also stubs the old site's photos. */
// A 1×1 PNG served for photos that still load from the old website, so tests do not depend on it being reachable.
const PIXEL = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64')

export const test = base.extend<{ errors: string[] }>({
  errors: async ({ page }, use) => {
    await page.route(/^https?:\/\/(www\.)?mgims\.ac\.in\//, (route) => route.fulfill({ status: 200, contentType: 'image/png', body: PIXEL }))
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
    await use(errors)
    expect(errors, 'console errors').toEqual([])
  },
})
export { expect }

/** WCAG 2.1 A and AA violations on the page (none expected). */
export const accessibilityViolations = async (page: Page) =>
  (await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations.map((v) => `${v.id}: ${v.nodes[0]?.target}`)
