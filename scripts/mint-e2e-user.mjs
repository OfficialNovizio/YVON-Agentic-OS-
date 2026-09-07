// Mint the dedicated Playwright e2e account + write the env file
// tests/e2e/auth.setup.ts consumes. Run: node scripts/mint-e2e-user.mjs
//
// Why not a BOD account: the three seeded handles (novy738/sagar739/amit740)
// are real people's logins and their passwords are documented nowhere in the
// repo (seed-bod-users.sql ships REPLACE_ME placeholders on purpose). A
// dedicated account never touches them.
//
// What it does (idempotent):
//   1. auth.admin.createUser e2e-runner@yvon.internal (email confirmed) —
//      password generated via crypto.randomBytes, rotated on re-run if the
//      env file is missing.
//   2. Upsert the profiles row (role 'owner') — the allowlist trigger
//      (migration 102) mints profiles ONLY for the three BOD emails, so a
//      non-allowlisted auth user would otherwise exist with no profile and
//      fail every chat_rooms.owner_user_id FK insert.
//   3. Write E2E_USERNAME/E2E_PASSWORD to dashboard/tests/e2e/.auth/e2e-user.env
//      (gitignored — dashboard/.gitignore covers tests/e2e/.auth/).
//
// Secrets policy: the password is written ONLY to that env file and NEVER
// printed. stdout carries statuses and UUIDs only.
//
// Delete the account when no longer wanted:
//   node scripts/mint-e2e-user.mjs --delete
// (or SQL: delete from public.profiles where email = 'e2e-runner@yvon.internal';
//  then remove the auth user in Supabase Studio → Authentication).
import { createRequire } from 'node:module'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { randomBytes } from 'node:crypto'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url))
const REPO = path.resolve(SCRIPT_DIR, '..')
const DASH = path.join(REPO, 'dashboard')
const EMAIL = 'e2e-runner@yvon.internal'
const USERNAME = 'e2e-runner'
const AUTH_DIR = path.join(DASH, 'tests', 'e2e', '.auth')
const ENV_PATH = path.join(AUTH_DIR, 'e2e-user.env')

// ── dashboard/.env.local (names only here; values stay in memory) ──────────
const envText = readFileSync(path.join(DASH, '.env.local'), 'utf8')
const env = Object.fromEntries(
  envText
    .split(/\r?\n/)
    .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => {
      const i = l.indexOf('=')
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]
    }),
)
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE = env.SUPABASE_SERVICE_ROLE_KEY
if (!SUPABASE_URL || !SERVICE_ROLE) {
  console.error('missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in dashboard/.env.local — nothing minted')
  process.exit(1)
}

const require = createRequire(path.join(DASH, 'package.json'))
const { createClient } = require('@supabase/supabase-js')
const admin = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { autoRefreshToken: false, persistSession: false } })

// ── --delete: remove the account + profile, delete the env file ────────────
if (process.argv.includes('--delete')) {
  const list = await admin.auth.admin.listUsers({ page: 1, perPage: 200 })
  const existing = list.data?.users?.find((u) => u.email === EMAIL)
  if (existing) {
    const { error } = await admin.auth.admin.deleteUser(existing.id)
    if (error) {
      console.error('deleteUser failed:', error.message)
      process.exit(1)
    }
    console.log('auth user deleted:', existing.id)
  } else {
    console.log('no auth user found for', EMAIL)
  }
  const { error: profErr } = await admin.from('profiles').delete().eq('email', EMAIL)
  if (profErr) {
    console.error('profile delete failed:', profErr.message)
    process.exit(1)
  }
  console.log('profile row deleted')
  if (existsSync(ENV_PATH)) {
    // also drop the stored browser session — it dies with the account
    for (const f of ['user.json', 'e2e-user.env']) {
      const p = path.join(AUTH_DIR, f)
      if (existsSync(p)) {
        await import('node:fs').then((fs) => fs.rmSync(p))
        console.log('removed', f)
      }
    }
  }
  console.log('DONE — e2e account fully removed')
  process.exit(0)
}

// ── mint (or reuse) ─────────────────────────────────────────────────────────
mkdirSync(AUTH_DIR, { recursive: true })

// keep the previous password when the env file survives, so re-runs never
// rotate a credential another machine/CI already stored
let password = null
if (existsSync(ENV_PATH)) {
  password = /^E2E_PASSWORD=(.*)$/m.exec(readFileSync(ENV_PATH, 'utf8'))?.[1] || null
}

const list = await admin.auth.admin.listUsers({ page: 1, perPage: 200 })
const existing = list.data?.users?.find((u) => u.email === EMAIL)
let userId = null
if (existing) {
  userId = existing.id
  if (!password) {
    password = randomBytes(18).toString('base64url')
    const { error } = await admin.auth.admin.updateUserById(userId, { password })
    if (error) {
      console.error('password rotate failed:', error.message)
      process.exit(1)
    }
    console.log('existing user found; password rotated (env file had been deleted)')
  } else {
    console.log('existing user found; keeping stored password')
  }
} else {
  password = randomBytes(18).toString('base64url')
  const { data, error } = await admin.auth.admin.createUser({ email: EMAIL, password, email_confirm: true })
  if (error) {
    console.error('createUser failed:', error.message)
    process.exit(1)
  }
  userId = data.user.id
  console.log('auth user created:', userId)
}

// profile row — the allowlist trigger skips non-BOD emails, mint it here
const { error: profErr } = await admin.from('profiles').upsert(
  { id: userId, email: EMAIL, username: USERNAME, role: 'owner' },
  { onConflict: 'id' },
)
if (profErr) {
  console.error('profiles upsert failed:', profErr.message)
  process.exit(1)
}
console.log('profile row ensured (role owner)')

writeFileSync(ENV_PATH, `E2E_USERNAME=${USERNAME}\nE2E_PASSWORD=${password}\n`)
console.log('wrote', path.relative(REPO, ENV_PATH), '(gitignored — never committed)')
console.log('DONE — run: npx playwright test tests/e2e/design-flow.spec.ts')
