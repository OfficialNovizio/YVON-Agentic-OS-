// run-task-suite.mjs — the company loop's mechanical half (re-engineer Phase 8,
// 2026-09-06). Spun by POST /api/task-spec/[id]/suite (and runnable by hand):
//
//   node scripts/run-task-suite.mjs --task TS-NNN [--product <dir>]
//
// Closes review→done for the first time mechanically:
//   1. Pre-flight via `task.py list` (the only read interface): the task must
//      be in `review`, must have exit_gate.owner (task.py suite refuses pass
//      without it — fail here with a message that names the actual problem).
//   2. Mechanical checks, each honestly recorded as ran / skipped-with-reason:
//        produces-exists  every work item's produces path is on disk
//        product-build    `npm run build` in the product checkout
//        product-spec     the product's Playwright suite, if it has one
//        task-spec        a task-scoped dashboard spec (TS-<n>.spec.ts), if written
//      The result is pass ONLY if every executed check passed and at least one
//      check actually ran — an empty mechanical scope is a hard fail, never a
//      manufactured pass. Skipped checks stay visible in the run record; the
//      record also carries the alignment loop's recorded acceptance evidence
//      (set-acceptance, Phase 7) so one file tells the whole story.
//   3. Write store/runs/run-<N>.md (the proof IS the run record — task.py's
//      cmd_suite contract), then `task.py suite <id> --result pass|fail --run
//      <path> --actor suite` and report the transition.
//
// Reads the task YAML only to regex flat metadata (design_session_id) the list
// row doesn't expose — same discipline as cmd_gate's own regex reads. Writes
// go through task.py exclusively.
//
// Owner: dev · re-engineer Phase 8 company loop, 2026-09-06

import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const TASK_PY = path.join(ROOT, 'cli', 'task.py')
const RUNS_DIR = path.join(ROOT, 'store', 'runs')
const WIN = process.platform === 'win32'

// ── args ─────────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2)
function opt(name) {
  const i = argv.indexOf(name)
  return i >= 0 ? (argv[i + 1] ?? '') : ''
}
const taskId = opt('--task').trim()
const productFlag = opt('--product').trim()
if (!/^TS-\d+$/.test(taskId)) {
  console.error(JSON.stringify({ ok: false, error: `--task must be TS-NNN, got ${taskId}` }))
  process.exit(1)
}
if (productFlag && (productFlag.includes('..') || path.isAbsolute(productFlag))) {
  console.error(JSON.stringify({ ok: false, error: '--product must be a repo-relative directory' }))
  process.exit(1)
}

function sh(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, {
    cwd: opts.cwd ?? ROOT,
    // npm/npx only resolve as .cmd on Windows through a shell; python3/node
    // resolve fine without one (and shell:true merely concatenates args).
    shell: opts.shellWin === true && WIN,
    env: { ...process.env, ...(opts.env ?? {}) },
    encoding: 'utf8',
    timeout: opts.timeout ?? 20_000,
    maxBuffer: 8 * 1024 * 1024,
  })
  return { ok: r.status === 0, out: (r.stdout ?? '') + (r.stderr ?? ''), status: r.status }
}

// ── 1. pre-flight: the only read interface ───────────────────────────────────
let row
try {
  const { ok, out } = sh('python3', [TASK_PY, 'list'], { timeout: 20_000 })
  if (!ok) throw new Error(`task.py list failed: ${out.slice(0, 300)}`)
  row = (JSON.parse(out)).find((r) => r.id === taskId)
} catch (e) {
  console.error(JSON.stringify({ ok: false, error: e instanceof Error ? e.message : String(e) }))
  process.exit(1)
}
if (!row) {
  console.error(JSON.stringify({ ok: false, error: `${taskId} not found` }))
  process.exit(1)
}
if (row.status !== 'review') {
  console.error(JSON.stringify({ ok: false, error: `${taskId} is ${row.status}, not review — open review before running the suite` }))
  process.exit(1)
}
if (!row.exitOwner) {
  console.error(JSON.stringify({ ok: false, error: `${taskId} has no exit_gate.owner — task.py suite refuses a pass without one; fix the record first` }))
  process.exit(1)
}

// ── 2. mechanical checks ─────────────────────────────────────────────────────
const checks = []
function record(name, state, detail, ms) {
  checks.push({ name, state, detail: (detail ?? '').slice(0, 2000), ...(ms != null ? { ms } : {}) })
}
const nowMs = () => Date.now()

// produces-exists — re-proves, on disk, what the gate asserted at pass→review.
{
  const produces = (row.workItems ?? [])
    .flatMap((w) => (w.produces ? [String(w.produces).replace(/^"|"$/g, '')] : []))
    .filter((p) => p.includes('/'))
  if (produces.length === 0) {
    record('produces-exists', 'skipped', 'no produces paths declared on any work item')
  } else {
    const missing = produces.filter((p) => !existsSync(path.join(ROOT, p)))
    record(
      'produces-exists',
      missing.length === 0 ? 'pass' : 'fail',
      missing.length === 0 ? `${produces.length} path(s) on disk: ${produces.join(', ')}` : `missing: ${missing.join(', ')}`,
    )
  }
}

// product root — explicit flag wins; else the workspaces/<venture> common root
// of the produces paths (decision 3: product home is workspaces/<venture>/).
let productRoot = ''
if (productFlag) {
  productRoot = existsSync(path.join(ROOT, productFlag)) ? productFlag : ''
  if (!productRoot) record('product-root', 'fail', `--product ${productFlag} does not exist on disk`)
} else {
  const fromProduces = (row.workItems ?? [])
    .map((w) => String(w.produces ?? '').replace(/^"|"$/g, ''))
    .find((p) => /^workspaces\/[^/]+\//.test(p))
  if (fromProduces) {
    const venture = fromProduces.split('/')[1]
    productRoot = `workspaces/${venture}`
    if (!existsSync(path.join(ROOT, productRoot))) {
      record('product-root', 'fail', `derived ${productRoot} from produces paths but it does not exist on disk`)
      productRoot = ''
    } else {
      // The VPS convention is two-level: workspaces/<venture>/<org-repo>/
      // (REPO_WORKSPACES_DIR/<venture>/<_repo_slug(repo_url)>, main.py's
      // _ensure_repo_clone). A venture root without its own package.json
      // isn't buildable — descend to its single buildable child; more than
      // one is ambiguous, so fail loud instead of guessing.
      const venturePkg = path.join(ROOT, productRoot, 'package.json')
      if (!existsSync(venturePkg)) {
        const children = existsSync(path.join(ROOT, productRoot))
          ? readdirSync(path.join(ROOT, productRoot), { withFileTypes: true })
              .filter((d) => d.isDirectory() && !d.name.startsWith('.'))
              .map((d) => d.name)
              .filter((n) => existsSync(path.join(ROOT, productRoot, n, 'package.json')))
          : []
        if (children.length === 1) {
          productRoot = `${productRoot}/${children[0]}`
        } else if (children.length > 1) {
          record('product-root', 'fail', `${productRoot} has no package.json and ${children.length} buildable children (${children.join(', ')}) — pass --product explicitly`)
          productRoot = ''
        }
      }
    }
  }
}

// product-build — the artifact must actually compile.
if (!productRoot) {
  record('product-build', 'skipped', 'no product checkout derivable (no workspaces/ produces path, no --product)')
} else {
  const pkgPath = path.join(ROOT, productRoot, 'package.json')
  if (!existsSync(pkgPath)) {
    record('product-build', 'skipped', `${productRoot} has no package.json — not a buildable checkout`)
  } else {
    let scripts = {}
    try { scripts = JSON.parse(readFileSync(pkgPath, 'utf8')).scripts ?? {} } catch { /* treated as no scripts */ }
    if (!scripts.build) {
      record('product-build', 'skipped', `${productRoot}/package.json has no build script`)
    } else {
      // NODE_ENV must be pinned here: the runner is usually spawned by the
      // dashboard DEV server, whose NODE_ENV=development leaks through the
      // suite route into `next build` — the app then compiles React in dev
      // mode and crashes prerendering /_global-error (live E2E 2026-09-06,
      // runs 2651/2653/2654 — reproduced manually with NODE_ENV=development).
      const r = sh(WIN ? 'npm.cmd' : 'npm', ['run', 'build'], {
        cwd: path.join(ROOT, productRoot),
        timeout: 300_000,
        shellWin: true,
        env: { NODE_ENV: 'production' },
      })
      const t0 = nowMs()
      record('product-build', r.ok ? 'pass' : 'fail', r.ok ? 'npm run build exited 0' : `build failed (exit ${r.status}):\n${r.out.slice(-1500)}`, nowMs() - t0)
    }
  }
}

// task-spec — a task-scoped dashboard spec, if the task wrote one.
// product-spec — the product's own Playwright suite, if the product has one.
const scopedSpec = path.join(ROOT, 'dashboard', 'tests', 'e2e', `${taskId}.spec.ts`)
if (existsSync(scopedSpec)) {
  const t0 = nowMs()
  const r = sh(WIN ? 'npx.cmd' : 'npx', ['playwright', 'test', scopedSpec, '--project=chromium'], {
    cwd: path.join(ROOT, 'dashboard'),
    timeout: 300_000,
    shellWin: true,
  })
  record('task-spec', r.ok ? 'pass' : 'fail', r.ok ? `${taskId}.spec.ts passed` : `spec failed (exit ${r.status}):\n${r.out.slice(-1500)}`, nowMs() - t0)
} else {
  record('task-spec', 'skipped', `no dashboard/tests/e2e/${taskId}.spec.ts written for this task`)
}

if (productRoot) {
  const hasPw = existsSync(path.join(ROOT, productRoot, 'playwright.config.ts')) ||
    existsSync(path.join(ROOT, productRoot, 'playwright.config.js'))
  if (!hasPw) {
    record('product-spec', 'skipped', `${productRoot} has no playwright config — no product-local browser suite`)
  } else {
    const t0 = nowMs()
    const r = sh(WIN ? 'npx.cmd' : 'npx', ['playwright', 'test', '--project=chromium'], {
      cwd: path.join(ROOT, productRoot),
      timeout: 300_000,
      shellWin: true,
    })
    record('product-spec', r.ok ? 'pass' : 'fail', r.ok ? 'product e2e suite passed' : `suite failed (exit ${r.status}):\n${r.out.slice(-1500)}`, nowMs() - t0)
  }
}

// clone-proof - the original-vs-clone screenshot proof (scripts/
// verify-clone-proof.py), for STATIC clones: runs when the task's design
// session recorded a reference capture and the capture has a clone dir
// (workspaces/_reference-captures/<out>-clone with index.html). Dynamic
// products (workspaces/<venture>/ Next.js builds) are proven by product-spec
// instead - this check skips loudly for them, it never pretends to run.
{
  let sessionId = ''
  try {
    const yaml = readFileSync(path.join(ROOT, 'store', 'tasks', `${taskId}.yaml`), 'utf8')
    sessionId = (/design_session_id:\s*"?([a-f0-9-]{36})"?/.exec(yaml)?.[1]) ?? ''
  } catch { /* no yaml - no session */ }
  let captureOut = ''
  if (sessionId) {
    try {
      const sess = JSON.parse(readFileSync(path.join(ROOT, 'store', 'design-sessions', `${sessionId}.json`), 'utf8'))
      captureOut = typeof sess.capture?.out === 'string' ? sess.capture.out : ''
    } catch { /* unreadable session - no capture */ }
  }
  const capDir = captureOut ? path.join(ROOT, 'workspaces', '_reference-captures', captureOut) : ''
  const cloneDir = captureOut ? path.join(ROOT, 'workspaces', '_reference-captures', `${captureOut}-clone`) : ''
  if (!captureOut) {
    record('clone-proof', 'skipped', 'no reference capture recorded on this task design session')
  } else if (!existsSync(path.join(capDir, 'reference.png'))) {
    record('clone-proof', 'skipped', `capture ${captureOut} has no reference.png on disk`)
  } else if (!existsSync(path.join(cloneDir, 'index.html'))) {
    record('clone-proof', 'skipped', `capture ${captureOut} has no static clone dir (${captureOut}-clone with index.html) - a dynamic product is proven by product-spec`)
  } else {
    const t0 = nowMs()
    const r = sh('python3', [
      path.join(ROOT, 'scripts', 'verify-clone-proof.py'),
      '--clone', cloneDir,
      '--original', path.join(capDir, 'reference.png'),
    ], { timeout: 240_000 })
    const okFlag = r.ok && /"ok": true/.test(r.out)
    record('clone-proof', okFlag ? 'pass' : 'fail', okFlag
      ? `original-vs-clone proof composed for ${captureOut}`
      : `proof failed (exit ${r.status}):\n${r.out.slice(-1200)}`, nowMs() - t0)
  }
}

const executed = checks.filter((c) => c.state === 'pass' || c.state === 'fail')
const failed = checks.filter((c) => c.state === 'fail')
const skipped = checks.filter((c) => c.state === 'skipped')
const result = executed.length > 0 && failed.length === 0 ? 'pass' : 'fail'

// ── 3. the run record — the proof IS the file ────────────────────────────────
const nums = readdirSync(RUNS_DIR)
  .map((f) => Number(/^run-(\d+)\.md$/.exec(f)?.[1]))
  .filter((n) => Number.isFinite(n))
const runN = (nums.length ? Math.max(...nums) : 0) + 1
const runRel = `store/runs/run-${runN}.md`

const criteriaRows = (row.workItems ?? []).flatMap((w) =>
  (w.acceptance ?? []).map((a, i) => {
    const text = typeof a === 'string' ? a : (a?.text ?? '')
    const status = typeof a === 'string' ? 'not_run' : (a?.status ?? 'not_run')
    const evidence = typeof a === 'string' ? '' : (a?.evidence ?? '')
    const ref = `${w.id ?? 'WI'}:${i + 1}`
    return { ref, text, status, evidence }
  }),
)

const date = new Date().toISOString()
const lines = []
lines.push(`# Run record · run-${runN}`)
lines.push('')
lines.push(`- task: ${taskId}`)
lines.push(`- suite: mechanical company-loop suite (scripts/run-task-suite.mjs) · produces-exists · product-build · task-spec · product-spec · clone-proof`)
lines.push(`- result: ${result.toUpperCase()} · ${executed.filter((c) => c.state === 'pass').length} of ${executed.length} executed checks passed${skipped.length ? ` · ${skipped.length} skipped` : ''}`)
lines.push(`- date: ${date}`)
lines.push(`- checks:`)
for (const c of checks) {
  const dur = c.ms != null ? ` (${(c.ms / 1000).toFixed(1)}s)` : ''
  lines.push(`  - [${c.state}] ${c.name}${dur}${c.detail ? ` — ${c.detail.replace(/\n/g, ' · ')}` : ''}`)
}
if (skipped.length) {
  lines.push('')
  lines.push(`## Scope (loud, not silent)`)
  lines.push('')
  for (const s of skipped) lines.push(`- ${s.name}: ${s.detail}`)
  lines.push(`- Skipped checks were NOT asserted by this run. The alignment loop's recorded evidence (below) and the operator read this record knowing the difference.`)
}
if (criteriaRows.length) {
  lines.push('')
  lines.push(`## Acceptance criteria — recorded by the alignment loop (verify pass)`)
  lines.push('')
  for (const c of criteriaRows) {
    lines.push(`  - [${c.status}] ${c.ref} ${c.text}${c.evidence ? ` — evidence: ${c.evidence}` : ''}`)
  }
}
lines.push('')
lines.push(`Mechanical proof: ${executed.length} executed, ${failed.length} failed. Result: ${result.toUpperCase()}.`)
lines.push('')

writeFileSync(path.join(ROOT, runRel), lines.join('\n'), 'utf8')

// ── 4. task.py suite — the state machine owns the transition ─────────────────
const suiteRun = sh('python3', [
  TASK_PY, 'suite', taskId,
  '--result', result,
  '--run', runRel,
  '--actor', 'suite',
], { timeout: 20_000 })
if (!suiteRun.ok) {
  console.error(JSON.stringify({
    ok: false,
    error: `task.py suite refused: ${suiteRun.out.slice(-500)}`,
    result,
    run: runRel,
    checks,
  }))
  process.exit(1)
}

console.log(JSON.stringify({
  ok: true,
  taskId,
  result,
  run: runRel,
  checks,
  nextStatus: result === 'pass' ? 'done' : 'review',
}))
