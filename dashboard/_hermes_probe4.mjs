#!/usr/bin/env node
/**
 * _hermes_probe4.mjs — cost & behaviour benchmark, two variants.
 *
 *   SIMPLE   a one-line factual question. Should be ONE model round-trip and
 *            no tools. This is the case that was being charged a 30-iteration
 *            budget it never needed.
 *   EXTREME  a multi-step repo task that genuinely needs tools, several
 *            round-trips, and real file reads.
 *
 * Run BOTH before and after deploying main.py, and diff the numbers. That is
 * the whole point: this is a measuring stick, not a fix.
 *
 *   node dashboard/_hermes_probe4.mjs            # both variants
 *   node dashboard/_hermes_probe4.mjs simple     # just one
 *   node dashboard/_hermes_probe4.mjs extreme
 *   node dashboard/_hermes_probe4.mjs --label after-deploy
 *
 * Every run appends one JSON line to dashboard/_hermes_bench.jsonl, so a
 * before/after comparison is just reading that file.
 *
 * WHAT YOU CAN TRUST, AND WHAT YOU CANNOT
 * ---------------------------------------
 * Probe 3 established that hermes-agent exposes NO usage attribute
 * (`usage_attr: NOT_IN_SOURCE`), so `tokensReported` is false and every
 * provider token count is null. Nothing client-side can change that.
 *
 * After main.py is deployed the `done` event carries measured figures instead:
 *   llmCalls        EXACT number of model round-trips this turn cost
 *   estInputTokens  estimated (~4 bytes/token) input actually put on the wire
 *   governorWaitS   seconds spent asleep in the rate-limit governor
 * Before deployment those fields are simply absent and this prints "n/a" —
 * which is itself the before-measurement.
 *
 * For ground truth on input tokens, this prints an exact UTC window per run;
 * read the delta off your provider's usage dashboard for that window.
 */
import { readFileSync, existsSync, appendFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const ENV_CANDIDATES = [join(HERE, '.env.local'), join(HERE, 'dashboard', '.env.local'), join(process.cwd(), 'dashboard', '.env.local'), join(process.cwd(), '.env.local')]
function loadEnv() {
  const p = ENV_CANDIDATES.find((x) => existsSync(x))
  if (!p) { console.error('no .env.local found'); process.exit(1) }
  const out = {}
  for (const line of readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z_0-9]+)\s*=\s*(.*)\s*$/)
    if (m) out[m[1]] = m[2].replace(/^['"]|['"]$/g, '').trim()
  }
  return out
}
const env = loadEnv()
const URL_ = (env.HERMES_URL || '').replace(/\/+$/, '')
const TOKEN = env.HERMES_TOKEN || ''
if (!URL_ || !TOKEN) { console.error('HERMES_URL / HERMES_TOKEN missing'); process.exit(1) }

// ── venture resolution ──────────────────────────────────────────────────
// The EXTREME variant needs a real repo checkout. Hermes does NOT look up
// ventures itself — the dashboard resolves repo_url/github_pat from Supabase
// and forwards them on every turn (stream/route.ts). A probe that talks to
// Hermes directly has to do the same, otherwise the agent correctly reports
// "no repo linked" and never touches a tool, which tells us nothing about the
// tool loop. That is exactly what the first before-deploy run hit.
//
// NOTE: this deliberately bypasses the dashboard's execution gate
// (chat_rooms.execution_unlocked_at). That gate exists so agents cannot touch
// a repo before a chat is approved as a task; here we are benchmarking the
// tool loop on purpose, and the task is strictly read-only.
async function resolveVenture(preferred) {
  const base = (env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/+$/, '')
  const key = env.SUPABASE_SERVICE_ROLE_KEY || ''
  if (!base || !key) return null
  try {
    const r = await fetch(`${base}/rest/v1/ventures?select=slug,repo_url,github_pat`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(15000),
    })
    if (!r.ok) return null
    const rows = await r.json()
    const withRepo = rows.filter((v) => v.repo_url)
    if (!withRepo.length) return null
    // prefer an explicitly requested slug, then one that also has a PAT
    // (private repos need it), then whatever has a repo at all
    return withRepo.find((v) => v.slug === preferred)
        ?? withRepo.find((v) => v.github_pat)
        ?? withRepo[0]
  } catch { return null }
}

const argv = process.argv.slice(2)
const labelIdx = argv.indexOf('--label')
const LABEL = labelIdx !== -1 ? (argv[labelIdx + 1] ?? '') : ''
const wsIdx = argv.indexOf('--workspace')
const WANT_WS = wsIdx !== -1 ? (argv[wsIdx + 1] ?? '') : ''
// Only mask a flag's VALUE when the flag is actually present: an absent
// flag yields index -1, and -1 + 1 === 0 would mask argv[0] — silently
// eating the first positional variant. Caught by argtest before shipping.
const skip = new Set()
if (labelIdx !== -1) skip.add(labelIdx + 1)
if (wsIdx !== -1) skip.add(wsIdx + 1)
const which = argv.filter((a, i) => !a.startsWith('--') && !skip.has(i))
const WANT = which.length ? which : ['simple', 'extreme']

const VARIANTS = {
  simple: {
    tier: 'info',
    mentions: ['raj'],
    department: 'Engineering',
    // Deliberately answerable from the model alone. No repo, no tools, no
    // ambiguity — if this costs more than one round-trip, the loop is running
    // when it has nothing to do, which is the 11M pattern in miniature.
    message: 'In one sentence: what is the difference between a HTTP 502 and a 504?',
    expect: 'one round-trip, zero tools',
  },
  extreme: {
    tier: 'build',
    mentions: ['ops'],
    department: 'Engineering',
    // Genuinely needs tools and several steps, but is bounded and read-only so
    // it is safe to re-run. Asks for a specific artifact so the answer can be
    // checked rather than taken on trust.
    message: [
      'Working in your checked-out repo, do all of the following and report results:',
      '1. Count the total number of .py files and the total number of .ts/.tsx files.',
      '2. Find the 3 largest files by byte size anywhere in the repo (exclude node_modules and .git) and give name + size.',
      '3. Read the largest .py file and summarise in 3 bullets what it does.',
      '4. Report the current git branch and the subject line of the most recent commit.',
      'Show the commands you ran. Do not modify, create, or delete anything.',
    ].join('\n'),
    expect: 'several round-trips, multiple tool calls',
  },
}

async function runVariant(key, venture) {
  const v = VARIANTS[key]
  // simple is deliberately repo-free: it must stay a pure one-round-trip
  // baseline, and forwarding a repo would make Hermes clone/pull first.
  const useRepo = key === 'extreme' && venture && venture.repo_url
  const room = `bench-${key}-` + Math.random().toString(36).slice(2, 8)
  const user = 'probe-user'
  const seen = { kinds: {}, tools: [], text: '', usage: null, error: null, firstTokenMs: null, notices: [] }
  const startedAt = new Date()
  const t0 = Date.now()

  console.log(`\n${'═'.repeat(62)}`)
  console.log(`VARIANT: ${key.toUpperCase()}   (expect: ${v.expect})`)
  console.log(`${'═'.repeat(62)}`)
  console.log(`window start (UTC): ${startedAt.toISOString()}`)
  console.log(useRepo
    ? `repo               : ${venture.slug} (linked — clone/pull may add time on a cold run)`
    : `repo               : none (not needed for this variant)`)

  let res
  try {
    res = await fetch(`${URL_}/v1/chat/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN}`, Accept: 'text/event-stream' },
      body: JSON.stringify({
        message: v.message, user_id: user, room_id: room,
        workspace: useRepo ? venture.slug : 'yvon-os',
        mentions: v.mentions, department: v.department, tier: v.tier,
        ...(useRepo ? { repo_url: venture.repo_url, github_pat: venture.github_pat || undefined } : {}),
      }),
      signal: AbortSignal.timeout(1500000), // 25 min
    })
  } catch (e) { console.log(`  request failed: ${e.message}`); return null }
  if (!res.ok) { console.log(`  HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`); return null }

  const reader = res.body.getReader(); const dec = new TextDecoder(); let buf = ''
  outer: while (true) {
    const { value, done } = await reader.read(); if (done) break
    buf += dec.decode(value, { stream: true })
    let sep
    while ((sep = buf.indexOf('\n\n')) !== -1) {
      const raw = buf.slice(0, sep); buf = buf.slice(sep + 2)
      const data = raw.split('\n').filter((l) => l.startsWith('data:')).map((l) => l.slice(5).trim()).join('')
      if (!data) continue
      let ev; try { ev = JSON.parse(data) } catch { continue }
      seen.kinds[ev.kind] = (seen.kinds[ev.kind] || 0) + 1
      if (ev.kind === 'token') { if (seen.firstTokenMs === null) seen.firstTokenMs = Date.now() - t0; seen.text += ev.text ?? '' }
      else if (ev.kind === 'tool_call.start') { seen.tools.push(ev.toolName); process.stdout.write(`  ▸ TOOL ${ev.toolName}\n`) }
      else if (ev.kind === 'notice') seen.notices.push(`${ev.level}: ${ev.message}`)
      else if (ev.kind === 'done') { seen.text = ev.response ?? seen.text; seen.usage = ev.usage ?? null; break outer }
      else if (ev.kind === 'error') { seen.error = ev.message; break outer }
    }
  }
  const endedAt = new Date()
  const elapsed = (Date.now() - t0) / 1000

  try {
    await fetch(`${URL_}/v1/pool/drop`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN}` },
      body: JSON.stringify({ user_id: user, room_id: room }), signal: AbortSignal.timeout(15000),
    })
  } catch {}

  const u = seen.usage || {}
  const metered = u.llmCalls !== undefined
  const row = {
    ts: endedAt.toISOString(), label: LABEL || null, variant: key,
    workspace: useRepo ? venture.slug : 'yvon-os', repoLinked: !!useRepo,
    windowStartUTC: startedAt.toISOString(), windowEndUTC: endedAt.toISOString(),
    elapsedS: +elapsed.toFixed(1),
    firstTokenMs: seen.firstTokenMs,
    latencyMs: u.latencyMs ?? null,
    model: u.model ?? null,
    toolEvents: seen.tools.length,
    toolNames: [...new Set(seen.tools)],
    outputTokenEvents: seen.kinds.token || 0,
    thinkingEvents: seen.kinds.thinking || 0,
    replyChars: seen.text.length,
    // present only once main.py is deployed
    llmCalls: metered ? u.llmCalls : null,
    firstCallShape: u.firstCallShape ?? null,
    estInputTokens: metered ? u.estInputTokens : null,
    governorWaitS: metered ? u.governorWaitS : null,
    metered,
    error: seen.error,
  }

  const na = (x) => (x === null || x === undefined ? 'n/a (deploy main.py)' : x)
  console.log(`window end   (UTC): ${endedAt.toISOString()}`)
  console.log(`\n  elapsed              ${row.elapsedS}s   (model ${row.latencyMs ?? '?'}ms)`)
  console.log(`  first token after    ${row.firstTokenMs ?? 'n/a'}ms`)
  console.log(`  LLM round-trips      ${na(row.llmCalls)}          ← the loop multiplier`)
  console.log(`  est input tokens     ${na(row.estInputTokens)}`)
  console.log(`  governor sleep       ${na(row.governorWaitS)}${metered ? 's' : ''}`)
  console.log(`  tool events          ${row.toolEvents}${row.toolNames.length ? '  [' + row.toolNames.join(', ') + ']' : ''}`)
  console.log(`  output token events  ${row.outputTokenEvents}`)
  if (u.firstCallShape) {
    const f = u.firstCallShape
    const tk = (c) => Math.round(c / 4).toLocaleString()
    console.log(`\n  ── what the FIRST request was actually made of ──`)
    console.log(`  total                ${f.totalChars.toLocaleString()} chars  (~${tk(f.totalChars)} tokens)`)
    console.log(`  tool schemas         ${f.toolSchemaChars.toLocaleString()} chars  (~${tk(f.toolSchemaChars)} tokens)  ${f.toolSchemaPct}%  · ${f.toolCount} tools`)
    console.log(`  system prompt        ${f.systemChars.toLocaleString()} chars  (~${tk(f.systemChars)} tokens)`)
    console.log(`  all messages         ${f.messageChars.toLocaleString()} chars  (~${tk(f.messageChars)} tokens)  · ${f.messageCount} messages`)
  }
  console.log(`  reply length         ${row.replyChars} chars`)
  if (seen.notices.length) console.log(`  notices              ${seen.notices.slice(0, 4).join(' | ')}`)
  if (seen.error) console.log(`  ERROR                ${seen.error}`)

  console.log(`\n  ── reply (first 900 chars) ──`)
  console.log('  ' + (seen.text.slice(0, 900) || '(empty)').split('\n').join('\n  '))
  return row
}

console.log(`\n── Hermes benchmark ──────────────────────────────────────`)
console.log(`host  : ${URL_}`)
if (LABEL) console.log(`label : ${LABEL}`)

const venture = WANT.includes('extreme') ? await resolveVenture(WANT_WS) : null
if (WANT.includes('extreme')) {
  console.log(venture
    ? `repo  : ${venture.slug}${venture.github_pat ? ' (+PAT)' : ''}`
    : `repo  : NONE RESOLVED — the extreme variant will refuse and measure nothing.\n        Check SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in .env.local,\n        or pass --workspace <slug>.`)
}

const rows = []
for (const k of WANT) {
  if (!VARIANTS[k]) { console.log(`unknown variant "${k}" — use simple | extreme`); continue }
  const r = await runVariant(k, venture)
  if (r) rows.push(r)
}

const OUT = join(HERE, '_hermes_bench.jsonl')
for (const r of rows) appendFileSync(OUT, JSON.stringify(r) + '\n', 'utf8')

console.log(`\n${'═'.repeat(62)}`)
console.log(`SUMMARY${LABEL ? '  ·  ' + LABEL : ''}`)
console.log(`${'═'.repeat(62)}`)
console.log(
  ['variant', 'elapsed', 'llmCalls', 'estInTok', 'tools', 'outTok']
    .map((h, i) => h.padEnd([9, 9, 9, 10, 7, 7][i])).join('')
)
for (const r of rows) {
  console.log(
    [r.variant, r.elapsedS + 's', r.llmCalls ?? 'n/a', r.estInputTokens ?? 'n/a', r.toolEvents, r.outputTokenEvents]
      .map((c, i) => String(c).padEnd([9, 9, 9, 10, 7, 7][i])).join('')
  )
}
if (rows.length && !rows[0].metered) {
  console.log(`\nllmCalls / estInTok are "n/a" because the VPS is still running the`)
  console.log(`old main.py. Deploy it, re-run with --label after-deploy, and diff.`)
}
const ex = rows.find((r) => r.variant === 'extreme')
if (ex && !ex.repoLinked) {
  console.log(`\nWARNING: the extreme variant ran WITHOUT a repo, so it measured nothing.`)
  console.log(`Its refusal is correct behaviour, not a bug. Re-run once a venture with`)
  console.log(`a repo_url resolves, or pass --workspace <slug>.`)
} else if (rows.length && rows.every((r) => r.toolEvents === 0) && ex) {
  console.log(`\nNOTE: the extreme variant produced 0 tool events. If its reply contains`)
  console.log(`real file data, tools ran and the callback is still swallowing — i.e. the`)
  console.log(`arity fix is not deployed yet. That is the single clearest before/after signal.`)
}
console.log(`\nappended ${rows.length} row(s) to ${OUT}\n`)
