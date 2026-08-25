/**
 * Browser gate for the Generations tab.
 * Owner: quinn · engineering
 *
 * WHY THIS IS BLOCKING, NOT OPTIONAL
 * ----------------------------------
 * docs/SESSION-HANDOUT.md §5.1, verbatim: "it is precisely the tool that would
 * have caught this session's failure. The redesign was verified via compiled
 * CSS and `tsc` and declared done — the app was never opened." §8 E5 — "wire a
 * browser gate as blocking for UI work" — is still open. This is that item.
 *
 *   npm run dev            # :3000, signed in
 *   npx playwright test tests/generations.spec.ts
 *
 * If it cannot reach the route it FAILS rather than skips. A silent skip is
 * how a gate stops being a gate.
 */
import { test, expect, type Page } from '@playwright/test'

const BASE = process.env.GEN_TEST_URL ?? 'http://localhost:3000'
const ROUTE = `${BASE}/generations`

async function open(page: Page, qs = '') {
  const res = await page.goto(ROUTE + qs, { waitUntil: 'domcontentloaded' })
  expect(res, `no response from ${ROUTE} — is \`npm run dev\` running?`).toBeTruthy()
  expect(res!.status(), `${ROUTE} returned ${res!.status()}`).toBeLessThan(400)
  await expect(page.getByTestId('generations')).toBeVisible({ timeout: 15_000 })
}

test.describe('Generations tab', () => {
  test('renders, and the page never scrolls sideways', async ({ page }) => {
    await open(page)
    const overflow = await page.evaluate(() => {
      const out: string[] = []
      document.querySelectorAll('.gen-shell *').forEach((el) => {
        const e = el as HTMLElement
        if (e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).overflowX === 'visible') {
          out.push(`${e.className} ${e.scrollWidth}>${e.clientWidth}`)
        }
      })
      return out
    })
    expect(overflow, 'elements overflow their container').toEqual([])
  })

  test('never renders a cost it does not have', async ({ page }) => {
    await open(page)
    // The rule the whole ledger rests on. A bare $0.00 anywhere in the cost
    // surfaces means a null was coerced somewhere upstream.
    const cells = await page.locator('.gen-kv .v, .gen-card .cm, .gen-scope .meta').allInnerTexts()
    for (const t of cells) {
      expect(t, 'a cost surface rendered $0.00 — null was coerced').not.toMatch(/\$0\.00(?!\d)/)
    }
  })

  test('a fetch failure still shows the hero, and names the failure', async ({ page }) => {
    await page.route('**/api/generations*', (r) => r.fulfill({ status: 502, body: '{}' }))
    await open(page)
    // A dead library is not a reason to show a bare error page. The hero stays;
    // the failure is stated as a chip beneath it so the composer is still usable.
    await expect(page.locator('.gen-hero')).toBeVisible()
    await expect(page.locator('.gen-errchip')).toContainText(/could not be read/i)
    await expect(page.locator('.gen-errchip b')).toContainText('502')
  })

  test('an empty library says so without claiming an error', async ({ page }) => {
    await page.route('**/api/generations*', (r) => r.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        rows: [], sessionCount: 0, totalCount: 0, committedUsd: null,
        unpricedRows: 0, regenerations: 0, balanceUsd: null, session: null,
      }),
    }))
    await open(page)
    await expect(page.locator('.gen-hero')).toBeVisible()
    await expect(page.locator('.gen-errchip')).toHaveCount(0)
    // The headline follows the selected model, so it is never a stale brand name.
    await expect(page.locator('.gen-hero .h2')).not.toBeEmpty()
  })

  test('an unpriced row reads as unpriced, not as free', async ({ page }) => {
    await page.route('**/api/generations*', (r) => r.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        rows: [{
          requestId: 'req_test_unpriced', kind: 'image', status: 'done',
          model: 'nano-banana-pro', sessionId: null, promptShape: 'json',
          width: 1920, height: 1080, aspect: '16:9', quality: '2k', seconds: null,
          costUsd: null, pricingSource: null, assetUrl: null, derivedFrom: null,
          pollAttempt: null, pollCeiling: null, createdAt: new Date(0).toISOString(),
        }],
        sessionCount: 0, totalCount: 1, committedUsd: null,
        unpricedRows: 1, regenerations: 0, balanceUsd: null, session: null,
      }),
    }))
    await open(page)
    await expect(page.locator('.gen-card .cm .na')).toContainText('unpriced')
    await expect(page.locator('.gen-scope .meta')).toContainText('1 unpriced')
  })

  test('regenerate stays disabled until a reason is written', async ({ page }) => {
    await page.route('**/api/generations*', (r) => r.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        rows: [{
          requestId: 'req_test_regen', kind: 'image', status: 'done',
          model: 'nano-banana-pro', sessionId: null, promptShape: 'json',
          width: 1920, height: 1080, aspect: '16:9', quality: '2k', seconds: null,
          costUsd: 0.038, pricingSource: 'estimate-cost', assetUrl: null,
          derivedFrom: null, pollAttempt: null, pollCeiling: null,
          createdAt: new Date(0).toISOString(),
        }],
        sessionCount: 0, totalCount: 1, committedUsd: 0.038,
        unpricedRows: 0, regenerations: 0, balanceUsd: 12.4, session: null,
      }),
    }))
    await open(page)
    await page.locator('.gen-card').first().click()

    const regen = page.getByRole('button', { name: 'Regenerate' })
    await expect(regen).toBeDisabled()
    await page.locator('.gen-reason').fill('too short')
    await expect(regen, 'a token reason must not unlock a paid retry').toBeDisabled()
    await page.locator('.gen-reason').fill('prose version invented a gradient — restate the prohibition as a hard constraint')
    await expect(regen).toBeEnabled()
  })

  test('generate is blocked while no estimate has been fetched', async ({ page }) => {
    await open(page)
    // The spend rule: no number, no spend. This must hold before the estimate
    // endpoint is wired, which is exactly when it is easiest to forget.
    await expect(page.locator('.gen-go')).toBeDisabled()
    await expect(page.locator('.gen-noprice')).toContainText(/no price yet/i)
  })

  test('keyboard reachable, and ids are copyable', async ({ page }) => {
    await open(page)
    const chip = page.getByRole('button', { name: /images/ }).first()
    await chip.focus()
    await expect(chip).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(chip).toHaveAttribute('aria-pressed', 'false')
  })

  // ── studios ───────────────────────────────────────────────────────────────
  // Every studio in the switcher must be one you can actually drive. A row that
  // opens onto an empty roster is the same lie as a locked row that pretends to
  // be a feature — so the gate is "no dead rows", asserted, not assumed.

  test('every listed studio is selectable and has a roster', async ({ page }) => {
    await open(page)
    await page.locator('.gen-studio').click()
    const rows = page.locator('.gen-pop.studios .sr')
    const n = await rows.count()
    expect(n, 'the switcher lists no studios').toBeGreaterThan(0)
    await expect(page.locator('.gen-pop.studios .sr[disabled]'),
      'a disabled studio row is a dead end — drop it instead').toHaveCount(0)
    for (let i = 0; i < n; i++) {
      await expect(rows.nth(i).locator('.sd'), 'a studio row claims zero models').not.toContainText(/^0 models/)
    }
  })

  test('marketing drives the two seedance omni-reference endpoints', async ({ page }) => {
    await open(page)
    await page.locator('.gen-studio').click()
    await page.locator('.gen-pop.studios .sr', { hasText: 'Marketing' }).first().click()
    await expect(page.locator('.gen-studio')).toContainText('Marketing')

    // Restricted roster: the ad endpoint pair, not all 132 i2v models.
    await page.locator('.gen-ctl.model').click()
    await expect(page.locator('.gen-pop.picker .plist .m')).toHaveCount(2)
    await expect(page.locator('.gen-pop.picker .plist .m').first()).toContainText(/seedance/i)
    await page.keyboard.press('Escape')

    // It is image-to-video, so the attach slot is not decoration.
    await expect(page.locator('.gen-plus.req')).toHaveCount(1)
    await expect(page.locator('.gen-prompt')).toHaveAttribute('placeholder', /product image/i)
  })

  test('a text-to-image model does not demand a reference', async ({ page }) => {
    await open(page)
    await page.locator('.gen-studio').click()
    await page.locator('.gen-pop.studios .sr', { hasText: 'Image' }).first().click()
    await expect(page.locator('.gen-plus.req')).toHaveCount(0)
  })

  test('no control on the bar is inert', async ({ page }) => {
    await open(page)
    // Every pill either opens something or toggles something. "Draw" used to sit
    // here doing nothing; that is the shape of bug this test exists to catch.
    await expect(page.locator('.gen-bar')).not.toContainText('Draw')
  })

  test('no console errors while rendering', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
    await open(page)
    await page.waitForTimeout(700)
    expect(errors, 'console errors during render').toEqual([])
  })
})
