// Live real-browser verification for TS-054 (novizio landing page) — closes
// the two verifier-environment gaps the in-chat verify loop flagged:
//   1. reduced-motion  — emulated here for real (playwright reducedMotion).
//   2. pixel inspection — real screenshots (desktop + mobile) from a real
//      Chromium, plus console capture.
// Standalone script (not a @playwright/test spec) so it can run against a
// production `next start` server without the test-runner fixtures.
// Run: node dashboard/tests/e2e/novizio-live-verify.mjs [baseURL]
import { chromium } from '@playwright/test'
import fs from 'fs'
import path from 'path'

const BASE = process.argv[2] || 'http://localhost:3311'
const OUT = path.resolve(process.cwd(), '..', 'workspaces', 'novizio',
  'OfficialNovizio-Novizio-Web', 'site-review')
fs.mkdirSync(OUT, { recursive: true })

let fail = 0
const ck = (name, cond, extra) => {
  console.log((cond ? '  PASS  ' : '  FAIL  ') + name)
  if (!cond) { fail++; if (extra !== undefined) console.log('        ', JSON.stringify(extra)?.slice(0, 300)) }
}

const browser = await chromium.launch()
const results = { base: BASE, at: new Date().toISOString(), checks: [] }

// ── 1. Reduced motion, emulated for real ──────────────────────────────────
{
  const ctx = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1366, height: 900 } })
  const page = await ctx.newPage()
  const errors = []
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
  page.on('pageerror', (e) => errors.push(String(e)))
  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(2500) // let entrance/scroll listeners settle
  // Under prefers-reduced-motion: reduce, entrance animations must not be
  // running — every animation should be absent or already finished, and the
  // hero must be fully visible (no opacity-0 trap).
  const anims = await page.evaluate(() => document.getAnimations().map((a) => ({
    state: a.playState, name: a.animationName ?? a.transitionProperty ?? '?',
  })))
  ck('reduced-motion: no running animations', anims.every((a) => a.state !== 'running'), anims)
  const heroVisible = await page.evaluate(() => {
    const el = document.querySelector('main > section, main > div')
    if (!el) return null
    const cs = getComputedStyle(el)
    return { opacity: cs.opacity, transform: cs.transform }
  })
  ck('reduced-motion: hero visible (opacity 1)', heroVisible?.opacity === '1', heroVisible)
  await page.screenshot({ path: path.join(OUT, 'ts054-reduced-motion.png'), fullPage: false })
  ck('reduced-motion: console clean', errors.length === 0, errors)
  results.reducedMotion = { animations: anims, heroVisible, consoleErrors: errors }
  await ctx.close()
}

// ── 2. Desktop, default motion — screenshot + structure ───────────────────
{
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 } })
  const page = await ctx.newPage()
  const errors = []
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
  page.on('pageerror', (e) => errors.push(String(e)))
  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(2500)
  const structure = await page.evaluate(() => {
    const main = document.querySelector('main')
    const ids = main ? [...main.querySelectorAll('[id]')].map((c) => c.id) : []
    return {
      mainChildren: main ? main.children.length : 0,
      heroPresent: !!main?.querySelector('section, h1, [class*="hero"]'),
      ids,
      navLinks: [...document.querySelectorAll('nav a, header a')].map((a) => a.textContent.trim()).filter(Boolean).slice(0, 8),
      wordmark: document.body.innerText.toLowerCase().includes('novizio'),
      manifestoText: !!document.querySelector('#manifesto'),
    }
  })
  ck('structure: hero section present in main', structure.heroPresent, structure)
  ck('structure: manifesto section present', structure.manifestoText)
  ck('brand: Novizio wordmark present', structure.wordmark)
  await page.screenshot({ path: path.join(OUT, 'ts054-desktop.png'), fullPage: true })
  ck('desktop: console clean', errors.length === 0, errors)
  // motion actually runs under default preferences (scroll reveals wired)
  const animsDefault = await page.evaluate(() => document.getAnimations().length)
  ck('default-motion: animations present (scroll/entrance wired)', animsDefault > 0, animsDefault)
  results.desktop = { structure, consoleErrors: errors, animationCount: animsDefault }
  await ctx.close()
}

// ── 3. Mobile 375×812 — screenshot + no horizontal overflow ───────────────
{
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } })
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', (e) => errors.push(String(e)))
  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(2500)
  const overflow = await page.evaluate(() => ({
    scrollW: document.documentElement.scrollWidth, clientW: document.documentElement.clientWidth,
  }))
  ck('mobile: no horizontal overflow', overflow.scrollW <= overflow.clientW + 1, overflow)
  const menuBtn = page.locator('header button, nav button').first()
  ck('mobile: menu control present', await menuBtn.count() > 0)
  await page.screenshot({ path: path.join(OUT, 'ts054-mobile.png'), fullPage: true })
  ck('mobile: console clean', errors.length === 0, errors)
  results.mobile = { overflow, consoleErrors: errors }
  await ctx.close()
}

await browser.close()
results.fail = fail
fs.writeFileSync(path.join(OUT, 'ts054-live-verify.json'), JSON.stringify(results, null, 2))
console.log(`\nevidence → ${path.relative(process.cwd(), OUT)}`)
if (fail) { console.log(`${fail} FAILURE(S)`); process.exit(1) }
console.log('ALL PASS')
