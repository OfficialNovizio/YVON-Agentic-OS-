// lib/cie/generation-trio.ts — Layer 7.1: GENERATION trio (§6.2 / §6.3)
//
// MASTER.md described an always-on trio — hermes+claude primary reasoning,
// deepseek adversarial verification, chatgpt creative quality pass — with
// no code anywhere implementing it. Verified 2026-08-09 before building this:
// `builder.ts` only formats already-retrieved context (no LLM call at all),
// `dashboard/lib/providers.ts` is a user-selectable single-provider list for
// a settings UI, and the live dashboard chat route calls exactly one model
// per request via its own stub. Built here as a real, callable mechanism.
//
// GATING: running all 3 models on every generation triples cost/latency for
// no benefit on low-stakes work. Operator decision (2026-08-09): full trio
// only for PRECISION_CRITICAL and ADVERSARIAL_TESTING — the two archetypes
// where a wrong answer is expensive. Everything else is primary-only.
// CREATIVE_PRODUCTION deliberately does NOT use this trio — it already has
// its own built verification mechanism, the C1-C5 gate chain
// (creative-gate-chain.ts, §13.2), which is the real fitness check for that
// archetype; running this trio on top of it would be redundant, not additive.
//
// NO NEW RUNTIME DEPENDENCIES: this repo's root package.json (`yvon-engine`)
// ships with zero runtime dependencies by design (only `typescript` as a
// peer dep) — confirmed by reading it directly before writing this file.
// Adding `@anthropic-ai/sdk` or `openai` here would be the first runtime dep
// this package has ever had. Raw `fetch()` (native since Node 18, this
// package's own `engines` floor) against each provider's REST API instead —
// same "native platform over new dependency" choice `tool-context.ts` and
// friends already made with `fs`/`path`/`crypto`.
//
// OPENAI_API_KEY: checked `dashboard/.env.local` and this process's env
// directly (2026-08-09) — it does not exist anywhere in this repo, only
// ANTHROPIC_API_KEY and DEEPSEEK_API_KEY are configured. The "creative"
// (chatgpt) role is built with the same call shape as the other two but
// returns `available: false` with an explicit reason when it can't run —
// same honesty pattern already established for kai in creative-gate-chain.ts
// (C4: "returns available:false with a reason rather than a fake score"),
// not silently skipped or faked.
//
// VERIFICATION: operator decision (2026-08-09) — mocked HTTP responses only,
// no live smoke-test call against real provider APIs (would spend real
// credit from the keys already in .env.local). `setHttpPost()` below exists
// for exactly that: swap in a fake responder for tests, restore the real
// `fetch` afterward. No verification script is checked in — same pattern as
// this session's earlier cache.ts LRU check (temporary `npx tsx` script,
// run, then deleted).

import type { Archetype } from './archetype'

export type TrioRole = 'primary' | 'adversarial' | 'creative'

export interface TrioCallInput {
  systemPrompt: string
  task: string
  ragContext?: string
}

export interface TrioCallResult {
  role: TrioRole
  available: boolean
  provider: string
  model: string
  content?: string
  reason?: string
}

export interface GenerationTrioResult {
  ranFullTrio: boolean
  archetype: Archetype
  reason: string
  primary: TrioCallResult
  adversarial?: TrioCallResult
  creative?: TrioCallResult
}

// The two archetypes where a wrong answer is expensive enough to justify
// 3x cost/latency. Change this array, not call sites, if the policy shifts.
const FULL_TRIO_ARCHETYPES: Archetype[] = ['PRECISION_CRITICAL', 'ADVERSARIAL_TESTING']

export function shouldRunFullTrio(archetype: Archetype): boolean {
  return FULL_TRIO_ARCHETYPES.includes(archetype)
}

// ─── Injectable HTTP layer (testability without spending real API credit) ──

export interface HttpResponse {
  ok: boolean
  status: number
  json(): Promise<any>
}
export type HttpPost = (url: string, opts: { headers: Record<string, string>; body: string }) => Promise<HttpResponse>

const realHttpPost: HttpPost = (url, opts) =>
  fetch(url, { method: 'POST', headers: opts.headers, body: opts.body }) as unknown as Promise<HttpResponse>

let httpPost: HttpPost = realHttpPost

/** Swap the HTTP layer for tests. Call with no args to restore the real fetch. */
export function setHttpPost(fn?: HttpPost): void {
  httpPost = fn ?? realHttpPost
}

// ─── Provider calls ──────────────────────────────────────────────────────

async function callAnthropicCompatible(
  input: TrioCallInput,
  role: TrioRole,
  opts: { apiKey: string | undefined; baseUrl: string; model: string; provider: string },
): Promise<TrioCallResult> {
  if (!opts.apiKey) {
    return { role, available: false, provider: opts.provider, model: opts.model, reason: `no API key configured for ${opts.provider}` }
  }
  try {
    const res = await httpPost(`${opts.baseUrl}/v1/messages`, {
      headers: {
        'content-type': 'application/json',
        'x-api-key': opts.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: opts.model,
        max_tokens: 1024,
        system: input.systemPrompt + (input.ragContext ? `\n\n${input.ragContext}` : ''),
        messages: [{ role: 'user', content: input.task }],
      }),
    })
    if (!res.ok) {
      return { role, available: false, provider: opts.provider, model: opts.model, reason: `HTTP ${res.status}` }
    }
    const data = await res.json()
    const content = data?.content?.[0]?.text ?? ''
    return { role, available: true, provider: opts.provider, model: opts.model, content }
  } catch (e) {
    return { role, available: false, provider: opts.provider, model: opts.model, reason: e instanceof Error ? e.message : String(e) }
  }
}

async function callOpenAiCompatible(
  input: TrioCallInput,
  role: TrioRole,
  opts: { apiKey: string | undefined; baseUrl: string; model: string; provider: string },
): Promise<TrioCallResult> {
  if (!opts.apiKey) {
    return { role, available: false, provider: opts.provider, model: opts.model, reason: `no API key configured for ${opts.provider}` }
  }
  try {
    const res = await httpPost(`${opts.baseUrl}/v1/chat/completions`, {
      headers: {
        'content-type': 'application/json',
        'authorization': `Bearer ${opts.apiKey}`,
      },
      body: JSON.stringify({
        model: opts.model,
        messages: [
          { role: 'system', content: input.systemPrompt + (input.ragContext ? `\n\n${input.ragContext}` : '') },
          { role: 'user', content: input.task },
        ],
      }),
    })
    if (!res.ok) {
      return { role, available: false, provider: opts.provider, model: opts.model, reason: `HTTP ${res.status}` }
    }
    const data = await res.json()
    const content = data?.choices?.[0]?.message?.content ?? ''
    return { role, available: true, provider: opts.provider, model: opts.model, content }
  } catch (e) {
    return { role, available: false, provider: opts.provider, model: opts.model, reason: e instanceof Error ? e.message : String(e) }
  }
}

/**
 * runGenerationTrio — Layer 7.1. Always calls primary (Anthropic). Calls
 * adversarial (DeepSeek, via its Anthropic-compatible endpoint — same base
 * URL pattern `dashboard/app/api/claude/route.ts` already uses) and creative
 * (OpenAI) only when `shouldRunFullTrio(archetype)` is true.
 */
export async function runGenerationTrio(
  archetype: Archetype,
  input: TrioCallInput,
): Promise<GenerationTrioResult> {
  const primary = await callAnthropicCompatible(input, 'primary', {
    apiKey: process.env.ANTHROPIC_API_KEY,
    baseUrl: 'https://api.anthropic.com',
    model: 'claude-sonnet-5',
    provider: 'anthropic',
  })

  if (!shouldRunFullTrio(archetype)) {
    return {
      ranFullTrio: false,
      archetype,
      reason: `${archetype} is not in FULL_TRIO_ARCHETYPES — primary-only, avoids 3x cost/latency where verification doesn't earn its cost`,
      primary,
    }
  }

  const [adversarial, creative] = await Promise.all([
    callAnthropicCompatible(input, 'adversarial', {
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseUrl: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/anthropic',
      model: 'deepseek-chat',
      provider: 'deepseek',
    }),
    callOpenAiCompatible(input, 'creative', {
      apiKey: process.env.OPENAI_API_KEY,
      baseUrl: 'https://api.openai.com',
      model: 'gpt-4o-mini',
      provider: 'openai',
    }),
  ])

  return {
    ranFullTrio: true,
    archetype,
    reason: `${archetype} is in FULL_TRIO_ARCHETYPES — full verification trio ran`,
    primary,
    adversarial,
    creative,
  }
}
