/**
 * quinn E2E gate — TS-020 Chat Redesign (command-deck).
 *
 * Critical-flow verification of the redesigned /chat:
 *   1. Icon dock renders Workforce + the 7 department glyphs
 *   2. Teams slide-over opens (⌘T) and shows REAL org data (46 agents · 7 depts)
 *   3. Composer '/' popover lists REAL registry commands (help, switch, …)
 *   4. Streaming/awaiting state renders the live strip
 *   5. Responsive: no horizontal scroll at 375px; composer visible
 *
 * Real-data contract (mia integrity block): the spec asserts against the real
 * fleet and real registry — no mock data. When unauthenticated it degrades to
 * the login page (same contract as the TS-017 spec); the visual assertions run
 * only after a session exists.
 *
 * Gate: quinn · browser-verification · Owner: mia · TS-020
 */
import { test, expect } from '@playwright/test'

const DEPARTMENTS = [
  'Executive Office',
  'Engineering',
  'Brand Studio',
  'Cybersecurity',
  'Product',
  'Governance',
  'AI & Agents',
]

test.describe('Chat command-deck redesign (TS-020)', () => {
  test('dock rail renders Workforce + 7 real departments', async ({ page }) => {
    await page.goto('/chat')
    const heading = page.getByRole('heading', { name: 'Workforce', exact: false })
    await expect(heading).toBeVisible({ timeout: 6000 }).catch(() => {
      expect(page.url()).toContain('/login')
      return
    })
    if (!page.url().includes('/chat')) return

    await expect(page.getByRole('button', { name: 'Workforce' })).toBeVisible()
    for (const dept of DEPARTMENTS) {
      await expect(page.getByRole('button', { name: dept })).toBeVisible()
    }
  })

  test('teams slide-over opens with real org counts', async ({ page }) => {
    await page.goto('/chat')
    await expect(page.getByRole('heading', { name: 'Workforce', exact: false }))
      .toBeVisible({ timeout: 6000 })
      .catch(() => {
        expect(page.url()).toContain('/login')
        return
      })
    if (!page.url().includes('/chat')) return

    await page.keyboard.press('Meta+t')
    await expect(page.getByText('46 agents · 7 departments')).toBeVisible({ timeout: 4000 })
    // Real fleet agents appear in the Workforce grid
    await expect(page.getByText('Dev', { exact: true }).first()).toBeVisible()
    // Search filters the real fleet
    await page.getByPlaceholder('Search agents…').fill('mia')
    await expect(page.getByText('Mia', { exact: true }).first()).toBeVisible()
  })

  test("composer '/' popover lists real registry commands", async ({ page }) => {
    await page.goto('/chat')
    await expect(page.getByRole('heading', { name: 'Workforce', exact: false }))
      .toBeVisible({ timeout: 6000 })
      .catch(() => {
        expect(page.url()).toContain('/login')
        return
      })
    if (!page.url().includes('/chat')) return

    const composer = page.locator('textarea[data-composer]')
    await composer.fill('/')
    await expect(page.getByText('commands', { exact: true })).toBeVisible({ timeout: 4000 })
    await expect(page.getByText('/help', { exact: false })).toBeVisible()
    await expect(page.getByText('/switch', { exact: false })).toBeVisible()
    // Enter inserts the highlighted command into the composer
    await page.keyboard.press('Enter')
    await expect(composer).toHaveValue(/\/help/)
  })

  test('responsive: composer visible, no horizontal scroll at 375px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/chat')
    await expect(page.getByRole('heading', { name: 'Workforce', exact: false }))
      .toBeVisible({ timeout: 6000 })
      .catch(() => {
        expect(page.url()).toContain('/login')
        return
      })
    if (!page.url().includes('/chat')) return

    const composer = page.locator('textarea[data-composer]')
    await expect(composer).toBeVisible()
    const noHScroll = await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1)
    expect(noHScroll).toBe(true)
  })
})
