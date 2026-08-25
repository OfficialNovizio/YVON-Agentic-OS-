// Browser gate for the CAOS v2 panel.
//
// WHY THIS FILE IS NOT OPTIONAL
// -----------------------------
// docs/SESSION-HANDOUT.md §5.1, verbatim: "it is precisely the tool that would
// have caught this session's failure. The redesign was verified via compiled
// CSS and `tsc` and declared done — the app was never opened." §1 records the
// outcome: the 2026-07-30 redesign was rolled back in full, 72 files restored.
// §8 E5 — "wire a browser gate as blocking for UI work" — is still open.
//
// The reducer has unit tests (tests/caos-v2.test.ts) and the component
// type-checks and server-renders, but none of that opens a page. This does.
//
//   npx playwright test tests/caos-panel.spec.ts
//
// Requires `npm run dev` on :3000 and a signed-in session, since /chat is
// behind auth. If it cannot reach the route it FAILS rather than skipping —
// a silent skip is how a gate stops being a gate.
import { test, expect, type Page } from '@playwright/test'

const CHAT = process.env.CAOS_TEST_URL ?? 'http://localhost:3000/chat'

async function gotoChat(page: Page) {
  const res = await page.goto(CHAT, { waitUntil: 'domcontentloaded' })
  expect(res, `no response from ${CHAT} — is \`npm run dev\` running?`).toBeTruthy()
  expect(res!.status(), `${CHAT} returned ${res!.status()}`).toBeLessThan(400)
  await expect(page.locator('.caos2').first()).toBeVisible({ timeout: 15_000 })
}

test.describe('CAOS v2 panel', () => {
  test('renders in the rail and fits 312px', async ({ page }) => {
    await gotoChat(page)
    const panel = page.locator('.caos2').first()
    await expect(panel).toBeVisible()

    // The operator declined widening the rail during a live turn, so the panel
    // must live inside 312px. Anything wider is a horizontal scrollbar in the
    // sidebar, which is the specific failure this asserts against.
    const overflow = await page.evaluate(() => {
      const out: string[] = []
      document.querySelectorAll('.caos2 *').forEach((el) => {
        const e = el as HTMLElement
        if (e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).overflowX === 'visible') {
          out.push(`${e.className} ${e.scrollWidth}>${e.clientWidth}`)
        }
      })
      return out
    })
    expect(overflow, 'elements overflow the rail').toEqual([])
  })

  test('every step row expands to show its decision', async ({ page }) => {
    await gotoChat(page)
    const rows = page.locator('.caos2-step')
    const n = await rows.count()
    expect(n, 'no step rows rendered').toBeGreaterThan(0)

    for (let i = 0; i < n; i++) {
      const row = rows.nth(i)
      const head = row.locator('.caos2-head')
      await expect(head).toHaveAttribute('aria-expanded', 'false')
      await head.click()
      await expect(head).toHaveAttribute('aria-expanded', 'true')
      // an expansion that opens onto nothing is worse than no expansion
      await expect(row.locator('.caos2-body')).toBeVisible()
      const text = (await row.locator('.caos2-body').innerText()).trim()
      expect(text.length, `step ${i} expanded but showed nothing`).toBeGreaterThan(0)
      await head.click()
      await expect(head).toHaveAttribute('aria-expanded', 'false')
    }
  })

  test('never renders a measurement it does not have', async ({ page }) => {
    await gotoChat(page)
    // The operator's rule: no stale numbers. With no turn yet, cost cells must
    // read "not measured" — a 0 here would be a claim the runtime never made.
    const cells = page.locator('.caos2-cost .v')
    const count = await cells.count()
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const t = (await cells.nth(i).innerText()).trim()
        expect(t, 'a cost cell rendered a bare 0').not.toBe('0')
      }
    }
  })

  test('stage pills navigate to their card', async ({ page }) => {
    await gotoChat(page)
    const pills = page.locator('.caos2-stg')
    await expect(pills).toHaveCount(3)
    await pills.nth(2).click()          // Settle
    await expect(page.locator('.caos2-card-settle')).toBeVisible()
  })

  test('keyboard reachable', async ({ page }) => {
    await gotoChat(page)
    const head = page.locator('.caos2-head').first()
    await head.focus()
    await expect(head).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(head).toHaveAttribute('aria-expanded', 'true')
  })

  test('survives reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await gotoChat(page)
    await expect(page.locator('.caos2').first()).toBeVisible()
    // the wash is the panel's only ambient motion and must be absent entirely
    const washShown = await page.evaluate(() => {
      const w = document.querySelector('.caos2-wash')
      return w ? getComputedStyle(w).display !== 'none' : false
    })
    expect(washShown, 'ambient wash rendered under prefers-reduced-motion').toBe(false)
  })

  test('no console errors while rendering', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
    await gotoChat(page)
    await page.locator('.caos2-head').first().click()
    await page.waitForTimeout(600)
    expect(errors, 'console errors during render').toEqual([])
  })
})
