import { accessibilityViolations, expect, test } from './fixtures.ts'

// Representative pages of every kind: sections, lists, records, forms, persona pages and portal entry points.
const ROUTES = [
  '/', '/about-us/overview', '/about-us/history', '/hospital/charges', '/hospital/blood-bank', '/academics/staff-lists', '/research/theses',
  '/accreditations/nmc', '/departments', '/departments/medicine', '/faculty', '/news', '/notices/115', '/tenders',
  '/search?q=medicine', '/contact', '/feedback', '/alumni', '/alumni/parthak', '/sitemap', '/help', '/patients', '/students',
  '/patient-portal', '/student-portal', '/fee-portal',
]

for (const width of [1280, 375]) {
  test.describe(`at ${width} px`, () => {
    test.use({ viewport: { width, height: 900 } })
    for (const route of ROUTES) {
      test(`${route}: one heading, no sideways scrolling, no accessibility violations`, async ({ page, errors }) => {
        void errors
        await page.goto(route, { waitUntil: 'networkidle' })
        await expect(page.locator('h1')).toHaveCount(1)
        expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(false)
        expect(await accessibilityViolations(page)).toEqual([])
      })
    }
  })
}

test('home: patient and student cards open their portals, and the Fee Portal has its own button', async ({ page, errors }) => {
  void errors
  await page.goto('/')
  const persona = page.locator('section[aria-labelledby="persona-heading"]')
  await expect(persona.getByRole('link', { name: /Patient or visitor/ })).toHaveAttribute('href', '/patient-portal')
  await expect(persona.getByRole('link', { name: /Student or applicant/ })).toHaveAttribute('href', '/student-portal')
  await expect(persona.getByRole('link', { name: /Faculty or staff/ })).toHaveAttribute('href', '/faculty-staff')
  await expect(persona.getByRole('link', { name: /Fee Portal/ })).toHaveAttribute('href', '/fee-portal')
  const services = page.locator('section', { has: page.getByRole('heading', { name: 'Campus & citizen services' }) })
  await expect(services.locator('h3')).toHaveText(['Hospital charges & tariff', 'Tenders & procurement', 'Faculty & staff careers'])
  await persona.getByRole('link', { name: /Patient or visitor/ }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Patient Portal')
  await expect(page.getByText('is being connected to this website')).toBeVisible()
})

test('a portal keeps the rest of its address, and removed routes are not found', async ({ page, errors }) => {
  void errors
  await page.goto('/fee-portal/hostel?ref=1')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Fee Portal')
  await page.goto('/payments')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Page not found')
})

test('"page not found" stays out of search results', async ({ page, errors }) => {
  void errors
  await page.goto('/departments/medicine')
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://www.mgims.ac.in/departments/medicine')
  await page.goto('/no-such-page')
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex')
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0)
})

test('every known page has its title and link-preview tags in the HTML itself', async ({ request }) => {
  const html = await (await request.get('/departments/medicine/')).text()
  expect(html).toContain('<title>Department of Medicine | MGIMS Sevagram</title>')
  expect(html).toContain('<link rel="canonical" href="https://www.mgims.ac.in/departments/medicine" />')
  expect(html).toContain('property="og:title" content="Department of Medicine"')
})

test('search suggests while typing', async ({ page, errors }) => {
  void errors
  await page.goto('/search')
  await page.getByRole('main').getByRole('combobox').fill('anat')
  await expect(page.getByRole('listbox').getByRole('option').first()).toBeVisible()
})
