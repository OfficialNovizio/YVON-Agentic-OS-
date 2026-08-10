#!/usr/bin/env node
// cli/caos-run.mjs — real entry point for the CAOS orchestrator
// (src/pipelines/caos-executor.ts, compiled to dist). Previously the executor
// had ZERO importers (dead code); this is the wiring that makes it runnable.
//
// Usage:
//   node cli/caos-run.mjs                          # sample task, agent dev
//   node cli/caos-run.mjs --task "..." --agent mia --venture yvon-os --mode auto
//   node cli/caos-run.mjs --task "..." --skip-cache
//
// Exit: 0 = ran (gate passed) · 2 = ran but a gate blocked · 1 = failed to run.
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const args = process.argv.slice(2)

function opt(name, def) {
  const i = args.indexOf(name)
  return i >= 0 && args[i + 1] !== undefined ? args[i + 1] : def
}

const task = opt('--task', 'verify the CAOS orchestrator end to end')
const agentId = opt('--agent', 'dev')
const venture = opt('--venture', 'default')
const mode = opt('--mode', 'auto')
const skipCache = args.includes('--skip-cache')

let executeCaosPipeline
try {
  const mod = require('../dist/pipelines/caos-executor.js')
  executeCaosPipeline = mod.executeCaosPipeline ?? mod.default?.executeCaosPipeline
} catch (e) {
  console.error(
    `caos-run: dist/pipelines/caos-executor.js missing — run \`npm run build\` at the repo root. ` +
      `(${e instanceof Error ? e.message : String(e)})`,
  )
  process.exit(1)
}
if (typeof executeCaosPipeline !== 'function') {
  console.error('caos-run: executeCaosPipeline export not found in dist — rebuild the root package.')
  process.exit(1)
}

try {
  const result = await executeCaosPipeline(task, agentId, venture, mode, skipCache)
  const summary = {
    ok: !result.gateBlocked,
    gateBlocked: result.gateBlocked ?? false,
    blockerReason: result.blockerReason ?? null,
    stages: result.plan?.stages?.length ?? 0,
    calls: result.calls?.length ?? 0,
    cacheHits: result.trace?.cacheHits ?? 0,
    retrievalMode: result.trace?.retrievalMode ?? null,
    feedbackLogged: result.trace?.feedbackLogged ?? false,
    finalOutput: (result.finalOutput ?? '').slice(0, 200),
  }
  console.log(JSON.stringify(summary, null, 2))
  process.exit(result.gateBlocked ? 2 : 0)
} catch (e) {
  console.error(`caos-run failed: ${e instanceof Error ? e.message : String(e)}`)
  process.exit(1)
}
