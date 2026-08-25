/**
 * Auth setup for the e2e gates (2026-08-24).
 * Owner: quinn · engineering
 *
 * The dashboard is fully gated (SessionGate wraps every route — a fresh
 * Playwright browser has no session cookie and gets bounced to /login, which
 * is the gate working, not a bug). This setup project signs in once with the
 * app's own password auth and saves the session to tests/e2e/.auth/user.json
 * (storageState); the chromium project then reuses it.
 *
 *   First run (or when the stored session expires):
 *     E2E_USERNAME=<bod username, e.g. novy738> E2E_PASSWORD=<...> \
 *       npx playwright test tests/e2e/e2e-panel.spec.ts
 *
 *   Later runs, no env vars needed (the stored session is reused):
 *     npx playwright test tests/e2e/e2e-panel.spec.ts
 *
 * Credentials come from env only — never committed (handout §10: the BOD
 * passwords were shared in chat once; rotate via seed-bod-users.sql). If
 * neither env creds nor a stored session exist, this FAILS loudly — a silent
 * skip is how a gate stops being a gate.
 */
import { test as setup, expect } from '@playwright/test'
import { existsSync, mkdirSync, readFileSync } from 'fs'
import { join } from 'path'

const AUTH_DIR = join(__dirname, '.auth')
const AUTH_FILE = join(AUTH_DIR, 'user.json')
const SB_COOKIE = /^sb-.*-auth-token$/

setup('authenticate (or reuse a stored session)', async ({ page }) => {
  const username = process.env.E2E_USERNAME
  const password = process.env.E2E_PASSWORD

  if (!username || !password) {
    // No credentials supplied — reuse the stored session, or fail loudly.
    expect(
      existsSync(AUTH_FILE),
      'no E2E_USERNAME/E2E_PASSWORD set AND no stored session at tests/e2e/.auth/user.json — ' +
        're-run with the env vars to sign in',
    ).toBe(true)
    const state = JSON.parse(readFileSync(AUTH_FILE, 'utf-8')) as { cookies?: Array<{ name: string }> }
    expect(
      (state.cookies ?? []).some((c) => SB_COOKIE.test(c.name)),
      'stored session has no sb-*-auth-token cookie — expired or corrupted; re-run with E2E_USERNAME/E2E_PASSWORD',
    ).toBe(true)
    return
  }

  mkdirSync(AUTH_DIR, { recursive: true })
  await page.goto('http://localhost:3000/login', { waitUntil: 'domcontentloaded' })
  await page.fill('#username', username)
  await page.fill('#password', password)
  await page.getByRole('button', { name: 'Sign in' }).click()

  // The session cookie is what SessionGate reads — wait for it, not for a
  // specific navigation (the login page does window.location.replace(next)).
  await expect
    .poll(async () => (await page.context().cookies()).some((c) => SB_COOKIE.test(c.name)), {
      timeout: 20_000,
    })
    .toBe(true)

  await page.context().storageState({ path: AUTH_FILE })
})
