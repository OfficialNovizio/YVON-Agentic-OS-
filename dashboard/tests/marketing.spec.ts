/**
 * Browser gate for the Marketing Studio composer.
 * Owner: quinn · engineering
 *
 * WHY THIS FILE EXISTS SEPARATELY
 * -------------------------------
 * The first Marketing implementation was derived from the signature of
 * generateMarketingStudioAd() rather than from MarketingStudio.jsx, and shipped
 * as "the video bar with a 2-model roster". It looked plausible and could not
 * express the request: no product slot, no avatar slot, no motion template, so
 * `images_list` and `video_files` were never populated. Every assertion here
 * pins a fact taken from the upstream component, not from the endpoint name.
 *
 *   npm run dev
 *   npx playwright test tests/marketing.spec.ts
 */
import { test, expect, type Page } from '@playwright/test'

const BASE = process.env.GEN_TEST_URL ?? 'http://localhost:3000'
const PNG = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64')

async function openMarketing(page: Page) {
  const res = await page.goto(`${BASE}/generations`, { waitUntil: 'domcontentloaded' })
  expect(res, 'is `npm run dev` running?').toBeTruthy()
  expect(res!.status()).toBeLessThan(400)
  await expect(page.getByTestId('generations')).toBeVisible({ timeout: 15_000 })
  await page.locator('.gen-studio').click()
  await page.locator('.gen-pop.studios .sr', { hasText: 'Marketing' }).first().click()
  await expect(page.getByTestId('marketing-composer')).toBeVisible()
}

test.describe('Marketing Studio', () => {
  test('has its own composer, and no model dropdown', async ({ page }) => {
    await openMarketing(page)
    // Resolution picks the endpoint. A model picker here would be a lie.
    await expect(page.locator('.gen-ctl.model')).toHaveCount(0)
    await expect(page.locator('.gen-prompt'))
      .toHaveAttribute('placeholder', /@image1.*@image2/)
  })

  test('three typed slots, with product marked required', async ({ page }) => {
    await openMarketing(page)
    await expect(page.locator('.mk-slotbtn')).toHaveCount(3)
    await expect(page.locator('.mk-slotbtn.req')).toHaveCount(1)
  })

  test('the six upstream motion templates are all present', async ({ page }) => {
    await openMarketing(page)
    await page.locator('.gen-ctl', { hasText: 'UGC' }).first().click()
    await expect(page.locator('.mk-grid .mkc')).toHaveCount(6)
    const names = await page.locator('.mk-grid .mkn').allInnerTexts()
    for (const n of ['UGC', 'Tutorial', 'Unboxing', 'Hyper Motion', 'Product Review', 'TV Spot']) {
      expect(names, `motion template "${n}" is missing`).toContain(n)
    }
    // They are the conditioning videos, not decorative stills.
    await expect(page.locator('.mk-grid .mkc video')).toHaveCount(6)
  })

  test('the eight upstream avatar presets are all present', async ({ page }) => {
    await openMarketing(page)
    await page.locator('.gen-ctl', { hasText: 'Select avatar' }).first().click()
    await expect(page.locator('.mk-grid .mkc')).toHaveCount(8)
    const names = await page.locator('.mk-grid .mkn').allInnerTexts()
    for (const n of ['Priya', 'Elena', 'Kai', 'Sora', 'Minji', 'Margot', 'Niko', 'Jin']) {
      expect(names, `avatar "${n}" is missing`).toContain(n)
    }
  })

  test('popovers are not clipped by the scrolling control row', async ({ page }) => {
    // .gen-ctls is overflow-x:auto — a clipping context. A popover rendered
    // inside it is cut off and its remnant falls behind .gen-canvas, so clicks
    // land on the canvas. This test is that regression.
    await openMarketing(page)
    await page.locator('.gen-ctl', { hasText: '9:16' }).first().click()
    const opt = page.locator('.gen-pop.opts .orow', { hasText: '16:9' }).first()
    await opt.click({ timeout: 3000 })
    await expect(page.locator('.gen-ctls')).toContainText('16:9')
  })

  test('resolution names the endpoint it selects', async ({ page }) => {
    await openMarketing(page)
    await page.locator('.gen-ctl', { hasText: '1080p' }).first().click()
    const pop = page.locator('.gen-pop.opts')
    await expect(pop).toContainText('seedance-2-vip-omni-reference-1080p')
    await expect(pop).toContainText('seedance-2-vip-omni-reference')
  })

  test('launch stays blocked until script and product both exist, and says why', async ({ page }) => {
    await page.route('**/api/muapi/estimate', (r) => r.fulfill({
      status: 200, contentType: 'application/json', body: JSON.stringify({ cost: 0.412, currency: 'USD' }),
    }))
    await openMarketing(page)

    await expect(page.locator('.gen-go')).toBeDisabled()
    await expect(page.locator('.mk-note')).toContainText(/script/i)

    await page.locator('.gen-prompt').fill('Vertical ad. @image1 is the product.')
    await expect(page.locator('.gen-go'), 'a product image is still missing').toBeDisabled()
    await expect(page.locator('.mk-note')).toContainText(/product image/i)
  })

  test('launch sends upstream\'s payload shape, with the product as @image1', async ({ page }) => {
    await page.route('**/api/muapi/estimate', (r) => r.fulfill({
      status: 200, contentType: 'application/json', body: JSON.stringify({ cost: 0.412, currency: 'USD' }),
    }))
    let uploads = 0
    await page.route('**/api/muapi/upload', (r) => {
      uploads += 1
      return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ url: `https://example.test/u${uploads}.png` }) })
    })
    let sent: Record<string, unknown> | null = null
    await page.route('**/api/muapi/marketing', (r) => {
      sent = JSON.parse(r.request().postData() ?? '{}')
      return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ requestId: 'req_spec' }) })
    })

    await openMarketing(page)
    await page.locator('.mk-slot').first().locator('input[type=file]')
      .setInputFiles({ name: 'product.png', mimeType: 'image/png', buffer: PNG })
    await expect(page.locator('.mk-slotbtn.on')).toHaveCount(1)
    await page.locator('.gen-prompt').fill('Vertical ad. @image1 is the product.')
    await expect(page.locator('.gen-go')).toBeEnabled()
    await page.locator('.gen-go').click()

    await expect.poll(() => sent).not.toBeNull()
    const body = sent as unknown as { endpoint: string; estimateUsd: number; payload: Record<string, unknown> }
    expect(body.endpoint).toBe('seedance-2-vip-omni-reference-1080p')
    expect(body.estimateUsd, 'the fetched estimate must travel with the request').toBe(0.412)
    const payload = body.payload as { images_list: string[]; video_files: string[]; aspect_ratio: string; duration: number }
    expect(payload.images_list[0], 'the product must be @image1').toContain('u1.png')
    expect(payload.video_files, 'the chosen motion template must be sent').toHaveLength(1)
    expect(payload.aspect_ratio).toBe('9:16')
    expect(payload.duration).toBe(5)
  })

  test('the browser never sees a MuAPI key', async ({ page }) => {
    // Upstream stores it in a non-HttpOnly cookie and attaches it client-side.
    // Ours is attached server-side in /api/muapi/*; nothing key-shaped may reach
    // the page, its storage, or an outbound request header.
    const leaked: string[] = []
    page.on('request', (r) => {
      const h = r.headers()
      if (h['x-api-key']) leaked.push(`x-api-key on ${r.url()}`)
    })
    await openMarketing(page)
    const stored = await page.evaluate(() => ({
      cookie: document.cookie,
      ls: JSON.stringify(Object.entries(localStorage)),
    }))
    expect(leaked, 'an api key left the browser').toEqual([])
    expect(stored.cookie).not.toMatch(/muapi_key/i)
    expect(stored.ls).not.toMatch(/muapi|api[_-]?key/i)
  })

  test('no console errors while driving the composer', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
    await openMarketing(page)
    await page.locator('.gen-ctl', { hasText: 'UGC' }).first().click()
    await page.keyboard.press('Escape')
    await page.locator('.gen-ctl', { hasText: 'Select avatar' }).first().click()
    await page.keyboard.press('Escape')
    // Media from the preset CDN may fail to load in CI; that is not a page error.
    expect(errors.filter((e) => !/ERR_|Failed to load resource/.test(e))).toEqual([])
  })
})
