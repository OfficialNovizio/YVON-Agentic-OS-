// Unit tests for stagesFromEventRows — the tool.call start/end pairing in
// lib/pipeline.ts. Same discipline as caos-v2.test.ts: plain node (npx tsx),
// no browser, no React. The bug this locks down: Hermes writes every tool
// call to the events table twice (status:"start" row, then a done row with
// ok/ms), and the old row-by-row map rendered the pair as two entries — one
// eternal "started" with pulsing dots, one done — inflating the Work loop
// count 2× and showing calls that never resolve.
import { stagesFromEventRows } from '../lib/pipeline'
import type { TurnEvent } from '../lib/pipeline'

let fail = 0
const ck = (name: string, cond: boolean, extra?: unknown) => {
  console.log((cond ? '  PASS  ' : '  FAIL  ') + name)
  if (!cond) { fail++; if (extra !== undefined) console.log('         ', JSON.stringify(extra)) }
}
const H = (s: string) => console.log('\n' + s)

const row = (ts: string, kind: string, payload: Record<string, unknown>): TurnEvent => ({
  ts, kind, actor: null, payload,
})

// ── fixtures: the real shapes Hermes writes (main.py:1666-1681) ─────────────
const start = (tool: string, ts: string, id?: string) =>
  row(ts, 'tool.call', id ? { tool, status: 'start', tool_call_id: id } : { tool, status: 'start' })
const end = (tool: string, ts: string, ms: number, id?: string, ok = true) =>
  row(ts, 'tool.call', id ? { tool, ok, ms, summary: 'done', tool_call_id: id } : { tool, ok, ms, summary: 'done' })

H('[1] start+end pair merges onto one stage')
{
  const stages = stagesFromEventRows([start('web_search', 't1'), end('web_search', 't2', 161)])
  ck('one stage, not two', stages.length === 1, stages.length)
  ck('resolved to done', stages[0].status === 'done', stages[0].status)
  ck('duration kept', stages[0].detail === '161ms', stages[0].detail)
}

H('[2] two calls of the same tool stay distinct')
{
  const stages = stagesFromEventRows([
    start('web_extract', 't1'), end('web_extract', 't2', 200),
    start('web_extract', 't3'), end('web_extract', 't4', 260),
  ])
  ck('two stages', stages.length === 2, stages.length)
  ck('first keeps its ms', stages[0].detail === '200ms', stages[0].detail)
  ck('second keeps its ms', stages[1].detail === '260ms', stages[1].detail)
}

H('[3] start with no end stays active — honest signal, not a ghost')
{
  const stages = stagesFromEventRows([start('browser_navigate', 't1')])
  ck('one stage', stages.length === 1, stages.length)
  ck('still active', stages[0].status === 'active', stages[0].status)
  ck('reads as started', stages[0].detail === 'started', stages[0].detail)
}

H('[4] end with no start still renders')
{
  const stages = stagesFromEventRows([end('web_search', 't2', 161)])
  ck('one stage', stages.length === 1, stages.length)
  ck('done', stages[0].status === 'done', stages[0].status)
}

H('[5] tool_call_id pairs exactly when Hermes provides it')
{
  const stages = stagesFromEventRows([
    // same tool twice, ids interleaved — name-matching alone would mispair
    start('web_extract', 't1', 'call-A'), start('web_extract', 't2', 'call-B'),
    end('web_extract', 't3', 100, 'call-B'), end('web_extract', 't4', 900, 'call-A'),
  ])
  ck('two stages', stages.length === 2, stages.length)
  ck('call-A resolved to 900ms', stages[0].detail === '900ms', stages.map((s) => s.detail))
  ck('call-B resolved to 100ms', stages[1].detail === '100ms', stages.map((s) => s.detail))
}

H('[6] Work loop count is no longer inflated')
{
  // the exact shape that produced the user-visible "6 tool calls" bug
  const stages = stagesFromEventRows([
    start('web_extract', 't1'), end('web_extract', 't2', 220),
    start('browser_navigate', 't3'), end('browser_navigate', 't4', 7337),
    start('web_search', 't5'), end('web_search', 't6', 161),
  ])
  const toolStages = stages.filter((s) => s.kind === 'tool')
  ck('3 tool stages for 3 real calls', toolStages.length === 3, toolStages.length)
  ck('no stage stuck active', toolStages.every((s) => s.status !== 'active'))
}

H('[7] non-tool rows pass through untouched')
{
  const stages = stagesFromEventRows([
    row('t1', 'input.analysis', { tier: 'build', relation: 'venture' }),
    start('web_search', 't2'), end('web_search', 't3', 50),
    row('t4', 'run.completed', {}),
  ])
  // 4 rows → 3 stages: the tool pair folds onto one
  ck('3 stages total', stages.length === 3, stages.length)
  ck('analyze first', stages[0].kind === 'analyze')
  ck('run-done last', stages[2].id === 'run-done')
}

H('[8] malformed / empty input')
{
  ck('empty rows → empty stages', stagesFromEventRows([]).length === 0)
  const stages = stagesFromEventRows([row('t1', 'tool.call', {})])
  ck('tool.call with no payload does not throw', stages.length === 1)
}

console.log(fail === 0 ? '\nALL PASS' : `\nFAILURES: ${fail}`)
process.exit(fail === 0 ? 0 : 1)
