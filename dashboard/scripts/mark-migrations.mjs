/**
 * mark-migrations.mjs — mark existing migrations as already applied.
 *
 * Use when the schema was applied outside this runner (e.g. via the Supabase
 * MCP path) so the _migrations tracking table is empty and the next
 * `node scripts/migrate.mjs` would replay 001.. from scratch and fail on
 * objects that already exist.
 *
 * Usage: node scripts/mark-migrations.mjs [--up-to=<file-prefix>]
 *   default: everything before 132_job_hunt_sync_queries.sql
 */

import { readFileSync, readdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import pg from 'pg'

const { Client } = pg
const __dirname = dirname(fileURLToPath(import.meta.url))
const MIGRATIONS_DIR = join(__dirname, '../supabase/migrations')

function loadEnv() {
  try {
    const envFile = readFileSync(join(__dirname, '../.env.local'), 'utf8')
    for (const line of envFile.split('\n')) {
      if (!line.trim() || line.startsWith('#')) continue
      const idx = line.indexOf('=')
      if (idx === -1) continue
      const key = line.slice(0, idx).trim()
      const val = line.slice(idx + 1).trim()
      if (!process.env[key]) process.env[key] = val
    }
  } catch {
    /* no .env.local */
  }
}

async function main() {
  loadEnv()
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    console.error('⚠️  DATABASE_URL is not set — add it to .env.local')
    process.exit(1)
  }

  const upTo = process.argv.find((a) => a.startsWith('--up-to='))?.split('=')[1] ?? '132_job_hunt_sync_queries.sql'
  const files = readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith('.sql') && f < upTo).sort()

  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } })
  await client.connect()
  await client.query('CREATE TABLE IF NOT EXISTS _migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ DEFAULT NOW())')

  let marked = 0
  for (const f of files) {
    const r = await client.query('INSERT INTO _migrations (name) VALUES ($1) ON CONFLICT (name) DO NOTHING', [f])
    marked += r.rowCount ?? 0
  }
  console.log(`Marked ${marked} migrations as applied (${files.length} files ≤ ${upTo})`)
  await client.end()
}

main().catch((e) => {
  console.error('Fatal:', e.message)
  process.exit(1)
})
