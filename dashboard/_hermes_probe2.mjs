#!/usr/bin/env node
/**
 * _hermes_probe2.mjs — probe 1 proved Hermes really has tools (it ran a shell
 * command) but emitted ZERO tool_call events, while thinking/token callbacks
 * fired normally. So the tool callback ATTRIBUTE NAMES in main.py are wrong
 * for this build. They can't be discovered from the repo: hermes-agent lives
 * only on the VPS at /usr/local/lib/hermes-agent.
 *
 * But Hermes has read_file/search_files/terminal and runs as root — so it can
 * read its own source and tell us. This probe asks it to, which replaces four
 * separate guesses in main.py with facts:
 *
 *   1. the real tool start/complete callback names   → fixes the blind loop
 *   2. AIAgent.__init__'s true signature             → main.py currently
 *                                                       guesses platform/toolset
 *   3. whether `max_iterations` is really read       → my per-tier cap uses
 *                                                       setattr, which NEVER
 *                                                       raises, so it may be a
 *                                                       silent no-op today
 *   4. what chat() exposes about token usage         → tokensReported is false
 *                                                       and every count is null
 *
 * Plus one correctness question probe 1 surfaced by accident: pwd came back as
 * /opt/yvon-hermes-http, the wrapper's own folder — NOT a repo checkout. If
 * the terminal tool can't be pointed at a working directory per call, then
 * "cd into the repo first" is only prompt steering and agents may be editing
 * files in the wrong place entirely.
 *
 * Run:  node dashboard/_hermes_probe2.mjs
 * Reads HERMES_URL / HERMES_TOKEN from dashboard/.env.local. Prints nothing
 * secret. Throwaway room, pool dropped afterwards. READ-ONLY on the VPS —
 * every command below inspects, none of them writes.
 */
import { readFileSync, existsSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const ENV_CANDIDATES = [join(HERE, '.env.local'), join(HERE, 'dashboard', '.env.local'), join(process.cwd(), 'dashboard', '.env.local'), join(process.cwd(), '.env.local')]

function loadEnv() {
  const path = ENV_CANDIDATES.find((p) => existsSync(p))
  if (!path) { console.error('could not find .env.local in:\n  ' + ENV_CANDIDATES.join('\n  ')); process.exit(1) }
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

const ROOM = 'probe2-' + Math.random().toString(36).slice(2, 10)
const USER = 'probe-user'

const PROMPT = `Diagnostic probe, read-only. You are inspecting your OWN runtime source.

Run each numbered command below with your terminal tool, then paste its RAW
output under a heading of the same number. Do not summarize. Do not explain.
Do not skip a command because it looks redundant. If a command errors, paste
the error verbatim and move to the next. Keep total output under ~250 lines.

H=/usr/local/lib/hermes-agent

1. ls $H && python3 -c "import sys;print(sys.version)"

2. grep -rn "class AIAgent" $H --include=*.py | head -5

3. python3 -c "
import sys, inspect
sys.path.insert(0, '$H')
mod = None
for name in ('agent','ai_agent','core.agent','hermes.agent','main','run_agent'):
    try:
        mod = __import__(name, fromlist=['AIAgent']); break
    except Exception: pass
print('module:', mod)
if mod:
    A = getattr(mod, 'AIAgent', None)
    print('signature:', inspect.signature(A.__init__))
"

4. grep -rn "callback" $H --include=*.py | grep -iE "tool" | head -30

5. grep -rnoE "self\\.[a-z_]*callback[a-z_]*" $H --include=*.py | sort -u -t: -k3 | head -40

6. grep -rn "max_iterations" $H --include=*.py | head -20

7. grep -rn "prompt_tokens|completion_tokens|total_tokens|\\.usage" $H --include=*.py -E | head -25

8. grep -rn "cwd" $H --include=*.py | grep -iE "terminal|shell|bash|subprocess|popen" | head -25

After the raw output, add a final section headed EXACTLY:

ANSWERS
callback_tool_start: <the real attribute name a caller sets to be notified a tool is starting, or NONE>
callback_tool_end: <same for completion, or NONE>
max_iterations_attr: <the attribute the agent actually READS to bound its loop, or NONE>
usage_available: <how a caller reads token usage after chat() returns, or NONE>
terminal_cwd_control: <how a caller sets the terminal tool's working directory per call, or NONE>

Base every answer only on what the command output above actually shows. If the
output does not show it, write NONE rather than guessing.`

const seen = { kinds: {}, text: '', usage: null, error: null, tools: [] }
const t0 = Date.now()

console.log(`\n── Hermes probe 2 · runtime introspection ────────────────`)
console.log(`host   : ${URL_}`)
console.log(`room   : ${ROOM} (throwaway)\n`)
console.log(`asking Hermes to read its own source — this may take a few minutes...\n`)

let res
try {
  res = await fetch(`${URL_}/v1/chat/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN}`, Accept: 'text/event-stream' },
    body: JSON.stringify({
      message: PROMPT, user_id: USER, room_id: ROOM,
      workspace: 'yvon-os', mentions: ['ops'], department: 'Engineering',
    }),
    signal: AbortSignal.timeout(600000), // 10 min
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
  await fetch(`${URL_}/v1/pool/drop`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN}` },
    body: JSON.stringify({ user_id: USER, room_id: ROOM }), signal: AbortSignal.timeout(15000),
  })
} catch {}

const elapsed = ((Date.now() - t0) / 1000).toFixed(1)
const OUT = join(HERE, '_hermes_probe2_output.txt')
writeFileSync(OUT, seen.text, 'utf8')

console.log(`\n── RESULT ────────────────────────────────────────────────`)
console.log(`elapsed          : ${elapsed}s`)
console.log(`event kinds      : ${JSON.stringify(seen.kinds)}`)
console.log(`tool_call events : ${seen.tools.length}   (still expected to be 0 — that IS the bug)`)
console.log(`usage            : ${seen.usage ? JSON.stringify(seen.usage) : 'not reported'}`)
if (seen.error) console.log(`ERROR            : ${seen.error}`)
console.log(`\nfull reply saved to: ${OUT}`)

const ans = seen.text.indexOf('ANSWERS')
console.log(`\n── ANSWERS ───────────────────────────────────────────────`)
console.log(ans === -1 ? '(no ANSWERS section — paste the saved file instead)' : seen.text.slice(ans))
console.log(`\n── FULL REPLY ────────────────────────────────────────────`)
console.log(seen.text || '(empty)')
console.log(`\n──────────────────────────────────────────────────────────\n`)
