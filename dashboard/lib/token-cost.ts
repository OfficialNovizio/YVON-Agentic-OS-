// ── Model pricing (USD per million tokens) ────────────────────────────────────
// Anthropic rows: https://www.anthropic.com/pricing (March 2026)
// OpenAI rows:   https://developers.openai.com/api/docs/pricing (Sept 2026,
// standard short-context tier; long-context costs more — not modeled here).
// OpenAI cache columns: there is NO cache-write fee on OpenAI; cached INPUT is
// billed at a discount, but the gpt-5.6 discount rate was not verifiable at
// write time, so cached input is billed at the full input rate (overstates
// slightly, never understates — honest > flattering).
// 2026-09-08: OpenAI's prompt_tokens ALREADY INCLUDES prompt_tokens_details
// .cached_tokens, so those rows carry inputIncludesCache and calcCostUsd
// subtracts the cached portion before applying inputPerM — otherwise the
// cached portion was billed twice. Anthropic's input_tokens EXCLUDES its
// cache fields, so those rows stay additive (no flag).

interface ModelPricing {
  inputPerM: number
  outputPerM: number
  cacheWritePerM: number
  cacheReadPerM: number
  /** OpenAI shape: inputTokens already includes cacheReadTokens */
  inputIncludesCache?: boolean
}

const PRICING: Record<string, ModelPricing> = {
  'gpt-5.6-luna': {
    inputPerM:       0.20,
    outputPerM:      1.20,
    cacheWritePerM:  0.00,
    cacheReadPerM:   0.20,
    inputIncludesCache: true,
  },
  'gpt-5.6-sol': {
    inputPerM:       4.00,
    outputPerM:     20.00,
    cacheWritePerM:  0.00,
    cacheReadPerM:   4.00,
    inputIncludesCache: true,
  },
  'gpt-5.6-terra': {
    inputPerM:       2.00,
    outputPerM:     12.00,
    cacheWritePerM:  0.00,
    cacheReadPerM:   2.00,
    inputIncludesCache: true,
  },
  'claude-opus-4-6': {
    inputPerM:      15.00,
    outputPerM:     75.00,
    cacheWritePerM:  18.75,
    cacheReadPerM:    1.50,
  },
  'claude-sonnet-4-6': {
    inputPerM:       3.00,
    outputPerM:     15.00,
    cacheWritePerM:   3.75,
    cacheReadPerM:    0.30,
  },
  'claude-haiku-4-5-20251001': {
    inputPerM:       0.80,
    outputPerM:       4.00,
    cacheWritePerM:   1.00,
    cacheReadPerM:    0.08,
  },

  // ── deepseek-flash (DeepSeek-V4.1-Flash) ────────────────────────────────
  // Source: https://api-docs.deepseek.com/quick_start/pricing/ (retrieved
  // 2026-09-11). Added because the CAOS panel was rendering "price not in
  // table (deepseek-flash)" on every turn once the provider moved to DeepSeek.
  //
  // DeepSeek bills on a PEAK / OFF-PEAK tier that this flat table cannot
  // express: off-peak is exactly HALF of peak. Peak = 01:00-04:00 and
  // 06:00-10:00 UTC, Mon-Fri; everything else is off-peak.
  //
  // These are the PEAK (upper-bound) rates deliberately, so a displayed cost is
  // never an UNDERstatement — at off-peak the true bill is ~half. Averaging the
  // two would be a guess, and this file's rule is no guessed pricing. If the
  // numbers matter for decisions, resolve the tier from the UTC hour (that is
  // the honest next step, not a flat rate).
  'deepseek-flash': {
    inputPerM:       0.30,    // cache MISS, peak
    outputPerM:      1.20,    // peak
    cacheWritePerM:  0.00,    // DeepSeek charges no cache-write premium
    cacheReadPerM:   0.006,   // cache HIT, peak
    inputIncludesCache: true, // OpenAI shape: prompt_tokens already includes cached
  },
  // Same page: these legacy ids are RETIRED but still accepted, served by
  // V4.1-Flash and billed at the Flash rates above. Mapped rather than left
  // unknown so a stale id cannot silently disable cost reporting again.
  'deepseek-v4-flash': {
    inputPerM: 0.30, outputPerM: 1.20, cacheWritePerM: 0.00,
    cacheReadPerM: 0.006, inputIncludesCache: true,
  },
  'deepseek-v4-flash-vision-exp': {
    inputPerM: 0.30, outputPerM: 1.20, cacheWritePerM: 0.00,
    cacheReadPerM: 0.006, inputIncludesCache: true,
  },
}

// 2026-09-07: NO silent fallback pricing. Pricing an unknown model with a
// guessed row hallucinated a cost — exactly what the metrics contract forbids.
// Unknown model → null → the UI says "price not in table", never a number.
export function calcCostUsd(params: {
  model: string
  inputTokens: number
  outputTokens: number
  cacheReadTokens?: number
  cacheCreationTokens?: number
}): number | null {
  const p = PRICING[params.model]
  if (!p) return null
  // 2026-09-08: OpenAI's prompt_tokens already includes cached_tokens, so on
  // rows flagged inputIncludesCache the cached portion is subtracted from the
  // input bill — previously it was billed twice (input rate + cache rate).
  // Anthropic rows are unflagged: their input_tokens excludes cache fields.
  const cached = params.cacheReadTokens ?? 0
  const billableInput = p.inputIncludesCache
    ? Math.max(0, params.inputTokens - cached)
    : params.inputTokens
  const cost =
    (billableInput                 / 1_000_000) * p.inputPerM +
    (params.outputTokens           / 1_000_000) * p.outputPerM +
    (cached                        / 1_000_000) * p.cacheReadPerM +
    ((params.cacheCreationTokens ?? 0) / 1_000_000) * p.cacheWritePerM
  return Math.round(cost * 1_000_000) / 1_000_000  // 6 decimal places
}

export function formatCost(usd: number): string {
  if (usd < 0.001) return `$${(usd * 100).toFixed(4)}¢`
  if (usd < 1)     return `$${usd.toFixed(4)}`
  return `$${usd.toFixed(2)}`
}

export function getModelDisplay(model: string): string {
  const map: Record<string, string> = {
    'claude-opus-4-6':           'Opus',
    'claude-sonnet-4-6':         'Sonnet',
    'claude-haiku-4-5-20251001': 'Haiku',
    'gpt-5.6-luna':              'Luna',
    'gpt-5.6-sol':               'Sol',
    'gpt-5.6-terra':             'Terra',
  }
  return map[model] ?? model.split('-').pop() ?? model
}
