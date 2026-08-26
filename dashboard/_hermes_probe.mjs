#!/usr/bin/env node
/**
 * _hermes_probe.mjs — settles ONE question: does Hermes actually have
 * terminal / file tools loaded, or has it been running toolless?
 *
 * Why this exists: main.py builds its agent by GUESSING the API —
 * it tries AIAgent(platform="cli"), then AIAgent(toolset="cli"), and if both
 * raise TypeError it falls through to building with no explicit toolset at
 * all, logging "terminal tools may be absent" (main.py:741-757). Meanwhile the
 * events table has never recorded a single tool.call row. So either the
 * callbacks don't fire, or there are no tools to fire them. Those two have
 * very different fixes, and this tells us which.
 *
 * Run from the repo root or dashboard/:
 *     node dashboard/_hermes_probe.mjs
 *
 * Reads HERMES_URL / HERMES_TOKEN from dashboard/.env.local. Prints nothing
 * secret. Uses a throwaway room id and drops the pooled agent afterwards, so
 * it leaves no state behind and touches none of your real chat rooms.
 */
import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const ENV_CANDIDATES = [join(HERE, '.env.local'), join(HERE, 'dashboard', '.env.local'), join(process.cwd(), 'dashboard', '.env.local'), join(process.cwd(), '.env.local')]

function loadEnv() {
  const path = ENV_CANDIDATES.find((p) => existsSync(p))
  if (!path) { console.error('could not find .env.local in any of:\n  ' + ENV_CANDIDATES.join('\n  ')); process.exit(1) }
  const out = {}
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z_0-9]+)\s*=\s*(.*)\s*$/)
    if (m) out[m[1]] = m[2].replace(/^['"]|['"]$/g, '').trim()
  }
  return out
}

const env = loadEnv()
const URL_ = (env.HERMES_URL || '').replace(/\/+$/, '')
const TOKEN = env.HERMES_TOKEN || ''
if (!URL_ || !TOKEN) { console.error('HERMES_URL / HERMES_TOKEN missing from .env.local'); process.exit(1) }

const ROOM = 'probe-' + Math.random().toString(36).slice(2, 10)
const USER = 'probe-user'

// A prompt that can ONLY be answered correctly by actually running something.
// If Hermes has no terminal tool it will either refuse, hallucinate a path, or
// describe what it "would" do — all of which are distinguishable from a real
// tool call in the event stream below.
const PROMPT = [
  'Diagnostic probe. Do exactly this and nothing else:',
  '1. Run this shell command and paste its RAW output verbatim: pwd && whoami && echo "PROBE_MARKER_$((6*7))"',
  '2. Then list the names of every tool you currently have available, one per line.',
  'If you cannot run shell commands, say exactly: NO_TERMINAL_TOOL',
].join('\n')

const seen = { kinds: {}, toolCalls: [], notices: [], firstTokenMs: null, text: '', usage: null, error: null }
const t0 = Date.now()

console.log(`\n── Hermes probe ──────────────────────────────────────────`)
console.log(`host   : ${URL_}`)
console.log(`room   : ${ROOM} (throwaway)\n`)

// ── 1. health ────────────────────────────────────────────────────────────
try {
  const r = await fetch(`${URL_}/healthz`, { signal: AbortSignal.timeout(15000) })
  console.log(`[1] /healthz            → HTTP ${r.status}  ${(await r.text()).slice(0, 200)}`)
} catch (e) {
  console.log(`[1] /healthz            → UNREACHABLE: ${e.message}`)
  console.log('\nHermes is not reachable from this machine. Everything below would fail too — stopping.\n')
  process.exit(2)
}

// ── 2. the real probe: does a tool actually run? ──────────────────────────
console.log(`[2] POST /v1/chat/stream → asking it to run a shell command...`)
let res
try {
  res = await fetch(`${URL_}/v1/chat/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN}`, Accept: 'text/event-stream' },
    body: JSON.stringify({
      message: PROMPT,
      user_id: USER,
      room_id: ROOM,
      workspace: 'yvon-os',
      mentions: ['ops'],          // Engineering — the dept most likely to hold terminal skills
      department: 'Engineering',  // added 2026-08-21; harmless if the VPS build predates it
    }),
    signal: AbortSignal.timeout(300000), // 5 min — turns have been observed at 18
  })
} catch (e) {
  console.log(`    request failed: ${e.message}`); process.exit(2)
}
if (!res.ok) { console.log(`    HTTP ${res.status}: ${(await res.text()).slice(0, 400)}`); process.exit(2) }

const reader = res.body.getReader()
const dec = new TextDecoder()
let buf = ''
outer: while (true) {
  const { value, done } = await reader.read()
  if (done) break
  buf += dec.decode(value, { stream: true })
  let sep
  while ((sep = buf.indexOf('\n\n')) !== -1) {
    const raw = buf.slice(0, sep); buf = buf.slice(sep + 2)
    const data = raw.split('\n').filter((l) => l.startsWith('data:')).map((l) => l.slice(5).trim()).join('')
    if (!data) continue
    let ev; try { ev = JSON.parse(data) } catch { continue }
    seen.kinds[ev.kind] = (seen.kinds[ev.kind] || 0) + 1
    if (ev.kind === 'token') { if (seen.firstTokenMs === null) seen.firstTokenMs = Date.now() - t0; seen.text += ev.text ?? '' }
    else if (ev.kind === 'tool_call.start') { seen.toolCalls.push({ phase: 'start', name: ev.toolName, args: String(ev.argsPreview ?? '').slice(0, 160) }); process.stdout.write(`    ▸ TOOL ${ev.toolName}\n`) }
    else if (ev.kind === 'tool_call.end') seen.toolCalls.push({ phase: 'end', name: ev.toolName, ok: ev.ok, summary: String(ev.summary ?? '').slice(0, 160) })
    else if (ev.kind === 'notice') seen.notices.push(`${ev.level}: ${ev.message}`)
    else if (ev.kind === 'done') { seen.text = ev.response ?? seen.text; seen.usage = ev.usage ?? null; break outer }
    else if (ev.kind === 'error') { seen.error = ev.message; break outer }
  }
}
const elapsed = ((Date.now() - t0) / 1000).toFixed(1)

// ── 3. drop the throwaway pooled agent ───────────────────────────────────
try {
  const d = await fetch(`${URL_}/v1/pool/drop`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN}` },
    body: JSON.stringify({ user_id: USER, room_id: ROOM }), signal: AbortSignal.timeout(15000),
  })
  console.log(`\n[3] /v1/pool/drop       → HTTP ${d.status} (cleanup)`)
} catch { console.log('\n[3] /v1/pool/drop       → failed (harmless; it idles out in 30 min)') }

// ── verdict ──────────────────────────────────────────────────────────────
const ranTool   = seen.toolCalls.some((t) => t.phase === 'start')
const sawMarker = /PROBE_MARKER_42/.test(seen.text)
const saidNo    = /NO_TERMINAL_TOOL/.test(seen.text)

console.log(`\n── RESULT ────────────────────────────────────────────────`)
console.log(`elapsed            : ${elapsed}s`)
console.log(`event kinds        : ${JSON.stringify(seen.kinds)}`)
console.log(`tool_call events   : ${seen.toolCalls.length}`)
console.log(`PROBE_MARKER_42    : ${sawMarker ? 'PRESENT (a command really ran)' : 'absent'}`)
console.log(`said NO_TERMINAL   : ${saidNo}`)
console.log(`first token after  : ${seen.firstTokenMs === null ? 'n/a' : seen.firstTokenMs + 'ms'}`)
console.log(`usage              : ${seen.usage ? JSON.stringify(seen.usage) : 'not reported'}`)
if (seen.notices.length) console.log(`notices            :\n  ${seen.notices.join('\n  ')}`)
if (seen.error) console.log(`ERROR              : ${seen.error}`)

console.log(`\n── VERDICT ───────────────────────────────────────────────`)
if (ranTool && sawMarker)        console.log('A · TOOLS WORK, EVENTS WORK — tools ran and the callbacks fired.\n    The zero-tool.call history is then a PERSISTENCE bug, not a toolset bug.')
else if (sawMarker && !ranTool)  console.log('B · TOOLS WORK, EVENTS BLIND — a command really ran, but no tool_call\n    event was emitted. The callbacks in main.py are not being invoked.\n    Fix the instrumentation; the toolset is fine.')
else if (saidNo || (!sawMarker && !ranTool)) console.log('C · NO TOOLS — Hermes could not run a shell command.\n    The AIAgent toolset guess is failing. This is the top priority and it\n    reshuffles the plan: agents have been discussing, never doing.')
else                              console.log('D · INCONCLUSIVE — read the reply below and judge by hand.')

console.log(`\n── REPLY (first 1500 chars) ──────────────────────────────`)
console.log(seen.text.slice(0, 1500) || '(empty)')
console.log(`\n──────────────────────────────────────────────────────────\n`)
