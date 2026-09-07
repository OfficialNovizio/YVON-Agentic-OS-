// Unit tests for lib/motion-brief.ts (re-engineer Phase 3, 2026-09-05).
// The brief is fixed DATA so the comparison can never be agent-hallucinated —
// these tests pin the facts that must stay honest: cost confidence flags,
// the unverified-dependency flag, the per-need interchange rows, and the
// obligation each decision option carries. Same discipline as caos-v2.test.ts:
// plain node (npx tsx), ck()/PASS/FAIL.
import {
  CODE_COLUMN,
  INTERCHANGE_TABLE,
  MOTION_OPTIONS,
  VIDEO_COLUMN,
  type MotionNeed,
} from '../lib/motion-brief'

let fail = 0
const ck = (name: string, cond: boolean, extra?: unknown) => {
  console.log((cond ? '  PASS  ' : '  FAIL  ') + name)
  if (!cond) { fail++; if (extra !== undefined) console.log('         ', JSON.stringify(extra)) }
}
const H = (s: string) => console.log('\n' + s)

H('[1] the honesty flags — cost confidence + unverified deps')
ck('video cost is an estimate', VIDEO_COLUMN.costConfidence === 'estimated')
ck('video cost carries the ~$27 figure', VIDEO_COLUMN.cost.includes('$27'))
ck('video column carries the unverified-dependency flag', VIDEO_COLUMN.hasUnverifiedDependency === true)
ck('video risks name the krea verification gap',
  VIDEO_COLUMN.risks.some((r) => r.toLowerCase().includes('unverified')))
ck('code cost is verified', CODE_COLUMN.costConfidence === 'verified')
ck('code cost is $0', CODE_COLUMN.cost.includes('$0'))
ck('code column has no unverified deps', CODE_COLUMN.hasUnverifiedDependency === false)

H('[2] the interchange table — per-need substitution analysis')
ck('table covers 6 needs', INTERCHANGE_TABLE.length === 6)
ck('every row has all fields populated',
  INTERCHANGE_TABLE.every((r) => r.need && r.videoPath && r.codePath && r.swapEffect))
ck('winners are valid',
  INTERCHANGE_TABLE.every((r) => ['video', 'code', 'either'].includes(r.defaultWinner)))
ck('scroll narrative is the "either" row (the real interchange)',
  INTERCHANGE_TABLE.find((r) => r.need.startsWith('Scroll-scrubbed'))?.defaultWinner === 'either')
ck('entrances are code-wins (video absurd)',
  INTERCHANGE_TABLE.find((r) => r.need.startsWith('Text and element'))?.defaultWinner === 'code')
ck('hero loop leans video (photoreal case)',
  INTERCHANGE_TABLE.find((r) => r.need.startsWith('Hero / background'))?.defaultWinner === 'video')

H('[3] the four decision options + their obligations')
ck('exactly the four options',
  MOTION_OPTIONS.map((o) => o.id).join(',') === 'reference,code,video,mixed')
ck('every option has title + detail', MOTION_OPTIONS.every((o) => o.title && o.detail))
ck('reference option carries the asset-swap obligation',
  !!MOTION_OPTIONS.find((o) => o.id === 'reference')?.obligation?.includes('asset-swap'))
ck('code option carries no probe obligation',
  !MOTION_OPTIONS.find((o) => o.id === 'code')?.obligation)
ck('video option carries the probe obligation',
  !!MOTION_OPTIONS.find((o) => o.id === 'video')?.obligation?.includes('qualification probe'))
ck('mixed option carries the probe obligation',
  !!MOTION_OPTIONS.find((o) => o.id === 'mixed')?.obligation?.includes('qualification probe'))

H('[4] MotionNeed shape (fence row input) tolerates partial rows')
const partial: MotionNeed = { need: 'hero loop' }
const empty: MotionNeed = {}
ck('partial + empty needs typecheck and render-guard', typeof partial.need === 'string' && empty.need === undefined)

console.log()
if (fail) { console.log(`${fail} FAILURE(S)`); process.exit(1) }
console.log('ALL PASS')
