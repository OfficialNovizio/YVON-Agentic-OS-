// Unit tests for lib/token-cost.ts — the sourced pricing table (2026-09-07).
// Same discipline as design-session.test.ts: plain node (npx tsx), no browser.
// The contract under test: real prices from the sourced table, honest null
// for unknown models, and cache handling that can never understate a cost.
//
// Owner: dev · provider-true token cost, 2026-09-07
import { calcCostUsd, formatCost, getModelDisplay } from '../lib/token-cost'

let fail = 0
const ck = (name: string, cond: boolean, extra?: unknown) => {
  console.log((cond ? '  PASS  ' : '  FAIL  ') + name)
  if (!cond) { fail++; if (extra !== undefined) console.log('         ', JSON.stringify(extra)) }
}
const H = (s: string) => console.log('\n' + s)
const eq = (a: unknown, b: unknown) => Math.abs((a as number) - (b as number)) < 1e-9

async function main() {
  H('[1] unknown model → null (never a guessed price)')
  ck('unknown model returns null', calcCostUsd({ model: 'gpt-9.9-imaginary', inputTokens: 1000, outputTokens: 1000 }) === null)
  ck('empty model returns null', calcCostUsd({ model: '', inputTokens: 1000, outputTokens: 1000 }) === null)

  H('[2] known models price at the sourced rows')
  // luna $0.20 in / $1.20 out per 1M → 1M in + 1M out = $1.40
  ck('luna 1M/1M = 1.40', eq(calcCostUsd({ model: 'gpt-5.6-luna', inputTokens: 1_000_000, outputTokens: 1_000_000 }) ?? -1, 1.40))
  // sol $4/$20 → 1M/1M = $24
  ck('sol 1M/1M = 24.00', eq(calcCostUsd({ model: 'gpt-5.6-sol', inputTokens: 1_000_000, outputTokens: 1_000_000 }) ?? -1, 24.00))
  // opus $15/$75, cache write $18.75, cache read $1.50
  const opus = calcCostUsd({
    model: 'claude-opus-4-6',
    inputTokens: 100_000,
    outputTokens: 10_000,
    cacheReadTokens: 200_000,
    cacheCreationTokens: 50_000,
  }) ?? -1
  const opusExpected =
    (100_000 / 1e6) * 15 + (10_000 / 1e6) * 75 + (200_000 / 1e6) * 1.5 + (50_000 / 1e6) * 18.75
  ck('opus with cache splits matches hand math', eq(opus, opusExpected), { got: opus, want: opusExpected })

  H('[3] OpenAI cache policy: no write fee, cached input never billed twice')
  // luna: cacheWritePerM 0 → cacheCreationTokens never add cost
  const lunaNoWrite = calcCostUsd({ model: 'gpt-5.6-luna', inputTokens: 0, outputTokens: 0, cacheCreationTokens: 500_000 }) ?? -1
  ck('luna cache-write adds nothing', eq(lunaNoWrite, 0))
  // 2026-09-08 double-count fix: OpenAI prompt_tokens INCLUDES cached_tokens —
  // the cached portion must be billed ONCE (at cacheReadPerM), not twice.
  const lunaRead = calcCostUsd({ model: 'gpt-5.6-luna', inputTokens: 300_000, outputTokens: 0, cacheReadTokens: 300_000 }) ?? -1
  ck('luna cached input not double-billed (all-cached turn)', eq(lunaRead, (300_000 / 1e6) * 0.20))
  const lunaMixed = calcCostUsd({ model: 'gpt-5.6-luna', inputTokens: 500_000, outputTokens: 0, cacheReadTokens: 300_000 }) ?? -1
  ck('luna mixed turn bills only fresh input at inputPerM', eq(lunaMixed, ((500_000 - 300_000) / 1e6) * 0.20 + (300_000 / 1e6) * 0.20))
  ck('luna cacheRead > input clamps at 0 input', eq(
    calcCostUsd({ model: 'gpt-5.6-luna', inputTokens: 100_000, outputTokens: 0, cacheReadTokens: 300_000 }) ?? -1,
    (300_000 / 1e6) * 0.20,
  ))

  H('[4] rounding to 6 decimals')
  const tiny = calcCostUsd({ model: 'gpt-5.6-luna', inputTokens: 1, outputTokens: 1 })
  ck('tiny usage rounds cleanly', tiny !== null && tiny >= 0 && tiny < 0.00001)

  H('[5] formatCost + getModelDisplay')
  ck('sub-tenth-cent formats in cents', formatCost(0.00002).includes('¢'))
  ck('small formats 4dp', formatCost(0.1234) === '$0.1234')
  ck('large formats 2dp', formatCost(12.5) === '$12.50')
  ck('display names resolve', getModelDisplay('gpt-5.6-luna') === 'Luna' && getModelDisplay('claude-opus-4-6') === 'Opus')
  ck('unknown falls back to last segment', getModelDisplay('mistral-large-2') === '2')
}

main()
  .catch((e) => { console.error('  FAIL  test crashed:', e); fail++ })
  .finally(() => {
    console.log()
    if (fail) { console.log(`${fail} FAILURE(S)`); process.exit(1) }
    console.log('ALL PASS')
  })
