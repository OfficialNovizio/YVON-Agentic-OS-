// Unit tests for the CAOS v2 reducer.
//
// These run in plain node (npx tsx), no browser, no React. That is the point:
// docs/SESSION-HANDOUT.md §5.1 records a /chat redesign verified by `tsc`
// alone and rolled back in full. Type-checking proves shapes compile; these
// prove the panel decides the right things.
import { buildCaosView, parseMs, fmt } from '../lib/caos-v2'
import type { BuildInput } from '../lib/caos-v2'
import type { PipelineStage } from '../lib/pipeline'

let fail = 0
const ck = (name: string, cond: boolean, extra?: unknown) => {
  console.log((cond ? '  PASS  ' : '  FAIL  ') + name)
  if (!cond) { fail++; if (extra !== undefined) console.log('         ', JSON.stringify(extra)) }
}
const H = (s: string) => console.log('\n' + s)

// ── fixtures: the real shapes lib/pipeline.ts produces ──────────────────────
const analyzeStage: PipelineStage = {
  id: 'input-analysis', kind: 'analyze', label: 'input analysis · build · venture',
  detail: 'what: count files', status: 'done', ts: 1000,
  analysis: {
    tier: 'build', relation: 'venture', what: 'inspect the repo',
    mustHaves: ['file counts reported', 'nothing modified'],
    targetAgents: {
      primary: 'ops', team: ['ops', 'quinn'], reason: 'infra/devops',
      scores: [
        { agent: 'ops', score: 7, hits: ['repo', 'git', 'files'] },
        { agent: 'dana', score: 2, hits: ['files'] },
      ],
    },
  },
}
const disclosureStage: PipelineStage = {
  id: 'skill-disclosure', kind: 'disclosure', label: 'skill disclosure · 1 active',
  status: 'done', ts: 1050,
  disclosure: { active: [{ name: 'x', summary: '', reason: '' }], inactiveCount: 5, totalSkills: 6, savingsPct: 83 },
}
const resolveStage: PipelineStage = {
  id: 'venture-context', kind: 'resolve', label: 'venture memory attached', status: 'done', ts: 1080,
}
const toolStart: PipelineStage = {
  id: 'tool-terminal', kind: 'tool', label: 'terminal', detail: 'find . -name "*.py"',
  status: 'active', ts: 2000,
}
const toolEnd: PipelineStage = {
  id: 'tool-terminal', kind: 'tool', label: 'terminal', detail: '1240ms', status: 'done', ts: 3000,
}
const runDone: PipelineStage = { id: 'run-done', kind: 'run', label: 'completed', status: 'done', ts: 4000 }
const runFailed: PipelineStage = { id: 'run-failed', kind: 'run', label: 'failed', detail: 'rate limit', status: 'error', ts: 4000 }

const base = (over: Partial<BuildInput> = {}): BuildInput => ({
  stages: [analyzeStage, disclosureStage, resolveStage, toolEnd], source: 'past', ...over,
})

// ── 1. NO STALE NUMBERS — the operator's hard requirement ───────────────────
H('[1] absent measurements stay absent, never 0')
{
  const v = buildCaosView(base({ usage: null }))
  ck('llmCalls null when unreported', v.cost.llmCalls === null, v.cost.llmCalls)
  ck('estInputTokens null', v.cost.estInputTokens === null)
  ck('fixedPerCall null without a shape', v.cost.fixedPerCall === null)
  ck('providerTokens null', v.cost.providerTokens === null)
  ck('room turns null without poolTurns', v.room.turns === null)
  ck('fmt() renders null as text, not 0', fmt(null) === 'not measured')
}
{
  // tokensReported:false is the REAL state for this runtime (probe 3).
  // A totalTokens of 0 alongside it must not become a displayed zero.
  const v = buildCaosView(base({ usage: { tokensReported: false, totalTokens: 0 } }))
  ck('tokensReported:false ⇒ providerTokens null', v.cost.providerTokens === null, v.cost.providerTokens)
}
{
  const v = buildCaosView(base({ usage: { tokensReported: true, totalTokens: 1234 } }))
  ck('tokensReported:true ⇒ real value passes through', v.cost.providerTokens === 1234)
}

// ── 2. real measurements pass through ───────────────────────────────────────
H('[2] measured values survive intact')
{
  const v = buildCaosView(base({
    usage: { llmCalls: 6, estInputTokens: 154852, governorWaitS: 0, llmCallsExact: true, latencyMs: 22415 },
  }))
  ck('llmCalls 6', v.cost.llmCalls === 6)
  ck('estInputTokens 154,852', v.cost.estInputTokens === 154852)
  ck('exact flag true', v.cost.exact === true)
  ck('elapsed from latencyMs', v.elapsedMs === 22415)
}
{
  const v = buildCaosView(base({ usage: { llmCalls: 3, llmCallsExact: false } }))
  ck('overlapping turns marked inexact', v.cost.exact === false)
}

// ── 3. the fixed-payload derivation ─────────────────────────────────────────
H('[3] fixed per-call derives from the composition shape')
{
  const v = buildCaosView(base({
    usage: { firstCallShape: { totalChars: 89624, toolSchemaChars: 61000, toolCount: 31 } },
  }))
  ck('~22,406 tokens from 89,624 chars', v.cost.fixedPerCall === 22406, v.cost.fixedPerCall)
  const env = v.steps.find((s) => s.id === 'envelope')!
  ck('envelope reports tool schemas', env.detail.some((d) => d.value.includes('31 tools')))
  ck('envelope status ok when measured', env.status === 'ok')
}
{
  const env = buildCaosView(base({ usage: {} })).steps.find((s) => s.id === 'envelope')!
  ck('envelope warns when unmeasured', env.status === 'warn')
  ck('envelope says so explicitly', env.detail[0].muted === true)
}

// ── 4. ROUTE renders the scoring — the misroute-legibility fix ──────────────
H('[4] route scores are surfaced')
{
  const r = buildCaosView(base()).steps.find((s) => s.id === 'route')!
  ck('summary names the winner + score', r.summary === '→ ops · score 7', r.summary)
  ck('detail lists every scored bucket', r.detail.length === 2)
  ck('ops row shows its hits', r.detail[0].value.includes('repo, git, files'))
  ck('winner keywords marked on', (r.chips ?? []).filter((c) => c.on).length === 3)
  ck('loser keywords marked off', (r.chips ?? []).some((c) => !c.on))
}
{
  // an older build that does not forward scores must degrade, not crash
  const noScores = JSON.parse(JSON.stringify(analyzeStage)) as PipelineStage
  delete (noScores.analysis!.targetAgents as { scores?: unknown }).scores
  const r = buildCaosView(base({ stages: [noScores] })).steps.find((s) => s.id === 'route')!
  ck('degrades without scores', r.status === 'ok')
  ck('says scores absent', r.detail[0].muted === true, r.detail[0])
}

// ── 5. ASSEMBLE is the single retrieval step ────────────────────────────────
H('[5] assemble accounts for every memory source')
{
  const a = buildCaosView(base()).steps.find((s) => s.id === 'assemble')!
  const labels = a.detail.map((d) => d.label)
  ck('lists skills', labels.includes('skills'))
  ck('lists venture memory', labels.includes('venture memory'))
  ck('lists MemPalace', labels.includes('MemPalace'))
  ck('lists venture graph', labels.includes('venture graph'))
  ck('lists history', labels.includes('history'))
  ck('warns while sources are unwired', a.status === 'warn')
  ck('counts live vs total', a.summary === '2 of 6 sources available', a.summary)
}

// ── 6. step/stage integrity ─────────────────────────────────────────────────
H('[6] seven steps in three stages, every one accounted for')
{
  const v = buildCaosView(base())
  ck('8 rows (7 steps + envelope)', v.steps.length === 8, v.steps.length)
  ck('ids unique', new Set(v.steps.map((s) => s.id)).size === v.steps.length)
  ck('prepare holds 6', v.steps.filter((s) => s.stage === 'prepare').length === 6)
  ck('settle holds 2', v.steps.filter((s) => s.stage === 'settle').length === 2)
  ck('verify is explicitly skipped', v.steps.find((s) => s.id === 'verify')!.status === 'skip')
  ck('no step lacks a summary', v.steps.every((s) => s.summary.length > 0))
}

// ── 7. modes ────────────────────────────────────────────────────────────────
H('[7] live / past / none')
{
  ck('none when source none', buildCaosView(base({ source: 'none' })).mode === 'none')
  ck('live while awaiting', buildCaosView(base({ source: 'live', awaiting: true })).mode === 'live')
  ck('past when finished', buildCaosView(base({ source: 'past' })).mode === 'past')
}

// ── 8. failure path still reports cost ──────────────────────────────────────
H('[8] a failed turn still accounts for what it spent')
{
  const v = buildCaosView(base({
    stages: [analyzeStage, runFailed], usage: { llmCalls: 4, estInputTokens: 98000 },
  }))
  const rec = v.steps.find((s) => s.id === 'record')!
  ck('record flags the failure', rec.status === 'warn')
  ck('error surfaced', rec.detail[0].value === 'rate limit')
  ck('cost still reported', v.cost.estInputTokens === 98000)
}

// ── 9. tool calls ───────────────────────────────────────────────────────────
H('[9] tool calls become loop rows')
{
  const v = buildCaosView(base({ stages: [analyzeStage, toolEnd] }))
  ck('one row per tool stage', v.calls.length === 1)
  ck('numbered from 1', v.calls[0].n === 1)
  ck('tool name carried', v.calls[0].tool === 'terminal')
  ck('duration parsed from detail', v.calls[0].ms === 1240, v.calls[0].ms)
  ck('toolCalls count matches', v.cost.toolCalls === 1)
  ck('in-flight tool reads as run', buildCaosView(base({ stages: [toolStart] })).calls[0].status === 'run')
  ck('parseMs ignores junk', parseMs('started') === null)
}

// ── 10. the room strip ──────────────────────────────────────────────────────
H('[10] recycle countdown')
{
  const v = buildCaosView(base({ usage: { poolTurns: 4 } }))
  ck('turns forwarded', v.room.turns === 4)
  ck('counts down from 12', v.room.turnsUntilRecycle === 8, v.room.turnsUntilRecycle)
  const over = buildCaosView(base({ usage: { poolTurns: 15 } }))
  ck('never negative', over.room.turnsUntilRecycle === 0)
  ck('room tokens null until the ledger exists', v.room.estInputTokens === null)
}

// ── 11. degenerate input must never throw ───────────────────────────────────
H('[11] empty and malformed input')
{
  let ok = true
  try {
    buildCaosView({ stages: [], source: 'none' })
    buildCaosView({ stages: [], source: 'live', awaiting: true, usage: {} })
    buildCaosView(base({ stages: [{ id: 'x', kind: 'analyze', label: '', status: 'done' }] }))
  } catch (e) { ok = false; console.log('   threw:', e) }
  ck('no throw on empty/partial', ok)
  const v = buildCaosView({ stages: [], source: 'none' })
  ck('still returns 8 rows', v.steps.length === 8)
  ck('steps read pending', v.steps.filter((s) => s.status === 'pending').length >= 2)
}

console.log('\nFAILURES: ' + fail)
process.exit(fail ? 1 : 0)
