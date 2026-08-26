#!/usr/bin/env node
/**
 * _hermes_probe3.mjs — final, surgical. Probe 2's greps mostly landed in
 * tests/ and its ANSWERS block then reported NONE for three things its own
 * raw output disproves:
 *
 *   max_iterations  — said NONE, but the output shows `agent.max_iterations = 1`
 *                     set directly in a test and a runtime exit reason string
 *                     "max_iterations_reached(1/1)". It is real and settable.
 *   terminal cwd    — said NONE, but there is a test literally named
 *                     test_terminal_cwd_set.
 *   usage           — said NONE, but session_input_tokens / session_total_tokens
 *                     / last_prompt_tokens all appear.
 *
 * And it confirmed the thing that matters most: tool_start_callback and
 * tool_complete_callback ARE the correct attribute names. main.py has been
 * setting the right names all along — so something is SUPPRESSING them.
 *
 * The lead: main.py constructs the agent with quiet_mode=True, and probe 2
 * surfaced tests/cli/test_resume_quiet_stderr.py whose comment reads "must
 * return True (False returns early at line 4743). _install_tool_callbacks".
 * That is consistent with quiet mode short-circuiting the very install step
 * that wires tool callbacks into dispatch — which would explain precisely
 * what we see: thinking and token callbacks fire, tool callbacks never do.
 *
 * This probe reads SOURCE, not tests, to settle it. Read-only.
 *
 * Run:  node dashboard/_hermes_probe3.mjs
 */
import { readFileSync, existsSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const ENV_CANDIDATES = [join(HERE, '.env.local'), join(HERE, 'dashboard', '.env.local'), join(process.cwd(), 'dashboard', '.env.local'), join(process.cwd(), '.env.local')]
function loadEnv() {
  const path = ENV_CANDIDATES.find((p) => existsSync(p))
  if (!path) { console.error('no .env.local found'); process.exit(1) }
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
if (!URL_ || !TOKEN) { console.error('HERMES_URL / HERMES_TOKEN missing'); process.exit(1) }

const ROOM = 'probe3-' + Math.random().toString(36).slice(2, 10)
const USER = 'probe-user'

const PROMPT = `Diagnostic probe 3, read-only. Inspect your OWN runtime source.

CRITICAL RULE: ignore everything under a tests/ directory. Test files prove a
name exists but not how the runtime uses it. Every command below already
excludes tests. If a command returns nothing, write "(no output)" — do not
substitute a test file, and do not answer from memory.

H=/usr/local/lib/hermes-agent
R=$H/run_agent.py

Run each command, paste its RAW output under its number. Keep it under ~250 lines.

1. grep -n "def __init__" $R | head -3

2. sed -n '409,418p' $R

3. grep -n "tool_start_callback\|tool_complete_callback\|tool_progress_callback" $R

4. grep -n "quiet_mode" $R | head -30

5. grep -rn "tool_start_callback" $H --include=*.py | grep -v "/tests/" | head -20

6. grep -n "max_iterations" $R | head -15

7. grep -rn "_install_tool_callbacks" $H --include=*.py | grep -v "/tests/" | head -10

8. grep -rn "session_total_tokens\|session_input_tokens\|last_prompt_tokens" $H --include=*.py | grep -v "/tests/" | head -15

9. grep -rn "cwd" $H/tools/terminal*.py | head -20

10. grep -rn "def set_working_directory\|def set_cwd\|working_directory" $H --include=*.py | grep -v "/tests/" | head -15

Then a final section headed EXACTLY:

ANSWERS
tool_callbacks_suppressed_by_quiet_mode: <YES / NO / UNCLEAR — does the source in #4 show quiet_mode gating the tool callbacks or their install step?>
tool_callback_invoked_at: <file:line in NON-test source where tool_start_callback is actually CALLED, or NOT_IN_SOURCE>
max_iterations_attr: <the attribute name the runtime reads, from #6, or NOT_IN_SOURCE>
usage_attr: <how a caller reads token usage after chat(), from #8, or NOT_IN_SOURCE>
terminal_cwd_control: <how a caller sets the terminal working directory, from #9/#10, or NOT_IN_SOURCE>

Rules for ANSWERS: cite only non-test source you printed above. If your only
evidence was a test file, write TESTS_ONLY. If a command produced no output,
write NOT_IN_SOURCE. Never write NONE — use TESTS_ONLY or NOT_IN_SOURCE so I
can tell the difference between "absent" and "not covered by my search".`

const seen = { kinds: {}, text: '', usage: null, error: null, tools: [] }
const t0 = Date.now()

console.log(`\n── Hermes probe 3 · source-level ─────────────────────────`)
console.log(`host   : ${URL_}\nroom   : ${ROOM} (throwaway)\n`)

let res
try {
  res = await fetch(`${URL_}/v1/chat/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN}`, Accept: 'text/event-stream' },
    body: JSON.stringify({ message: PROMPT, user_id: USER, room_id: ROOM, workspace: 'yvon-os', mentions: ['ops'], department: 'Engineering' }),
    signal: AbortSignal.timeout(600000),
  })
} catch (e) { console.log(`request failed: ${e.message}`); process.exit(2) }
if (!res.ok) { console.log(`HTTP ${res.status}: ${(await res.text()).slice(0, 400)}`); process.exit(2) }

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
    if (ev.kind === 'token') seen.text += ev.text ?? ''
    else if (ev.kind === 'tool_call.start') { seen.tools.push(ev.toolName); process.stdout.write(`  ▸ TOOL ${ev.toolName}\n`) }
    else if (ev.kind === 'done') { seen.text = ev.response ?? seen.text; seen.usage = ev.usage ?? null; break outer }
    else if (ev.kind === 'error') { seen.error = ev.message; break outer }
  }
}
try {
  await fetch(`${URL_}/v1/pool/drop`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN}` }, body: JSON.stringify({ user_id: USER, room_id: ROOM }), signal: AbortSignal.timeout(15000) })
} catch {}

const OUT = join(HERE, '_hermes_probe3_output.txt')
writeFileSync(OUT, seen.text, 'utf8')
console.log(`\n── RESULT ────────────────────────────────────────────────`)
console.log(`elapsed          : ${((Date.now() - t0) / 1000).toFixed(1)}s`)
console.log(`event kinds      : ${JSON.stringify(seen.kinds)}`)
console.log(`tool_call events : ${seen.tools.length}`)
if (seen.error) console.log(`ERROR            : ${seen.error}`)
console.log(`\nfull reply saved to: ${OUT}`)
const a = seen.text.indexOf('ANSWERS')
console.log(`\n── ANSWERS ───────────────────────────────────────────────`)
console.log(a === -1 ? '(none — send me the saved file)' : seen.text.slice(a))
console.log(`\n── FULL REPLY ────────────────────────────────────────────`)
console.log(seen.text || '(empty)')
console.log(`\n──────────────────────────────────────────────────────────\n`)
