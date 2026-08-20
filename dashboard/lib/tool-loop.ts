/**
 * lib/tool-loop.ts — Anthropic Messages API tool_use loop with streaming.
 *
 * Mirrors what Claude Code (Agent SDK) does internally, but runs on the Client SDK
 * so it works with any Anthropic-wire-compatible endpoint (incl. DeepSeek /anthropic).
 *
 * Yields a typed event stream:
 *   { kind: 'text', text }             — forward to client
 *   { kind: 'tool_call', name, input } — agent decided to call a tool
 *   { kind: 'tool_result', name, summary, is_error } — tool finished
 *   { kind: 'iteration', n }           — new turn of the loop
 *   { kind: 'done', reason }           — loop ended
 *   { kind: 'error', message }         — fatal error
 */

import type Anthropic from '@anthropic-ai/sdk'
import { executeTool, type ToolContext } from './agent-tools'
import type { ThinkingConfig } from './ai-client'

export type ToolLoopEvent =
  | { kind: 'text';        text: string }
  | { kind: 'tool_call';   name: string; input: unknown; tool_use_id: string }
  | { kind: 'tool_result'; name: string; summary: string; is_error: boolean; tool_use_id: string; todoItems?: Array<{ content: string; status: string; activeForm: string }> | null }
  | { kind: 'iteration';   n: number }
  | { kind: 'done';        reason: string }
  | { kind: 'error';       message: string }

export interface ToolLoopOptions {
  client:        Anthropic
  model:         string
  maxTokens:     number
  system?:       string
  /** Extended/Adaptive thinking config (Claude models only). */
  thinking?:     ThinkingConfig
  tools:         Anthropic.Messages.Tool[]
  initialMessages: Anthropic.Messages.MessageParam[]
  /** Cap on how many tool_use rounds. Prevents runaway loops. Default 8. */
  maxIterations?: number
  /** Per-session context for tools that need it (e.g. ventureSlug for Github tool). */
  toolContext?:  ToolContext
}

const DEFAULT_MAX_ITERATIONS = 30
const CACHE_MIN_CHARS = 2000

/**
 * Anthropic allows at most 4 blocks with `cache_control` per request.
 *
 * The previous implementation stamped `cache_control` on the system prompt PLUS
 * every large tool result, and those breakpoints persisted in the message array
 * across iterations. A read-heavy turn (e.g. CEO verification reading 5+ files)
 * accumulated >4 breakpoints and the API rejected the ENTIRE request — killing
 * the loop mid-task with an error ("stops at 'let me verify…'").
 *
 * Fix: keep stored tool results clean (no cache_control) and, at send time,
 * place a SINGLE breakpoint on the most recent large tool result. Anthropic
 * caches the entire prefix up to a breakpoint, so one trailing breakpoint
 * (plus the system breakpoint = 2 total) preserves the token savings while
 * never exceeding the 4-block ceiling, regardless of how many tools run.
 */
function withTrailingCacheBreakpoint(
  messages: Anthropic.Messages.MessageParam[],
): Anthropic.Messages.MessageParam[] {
  for (let mi = messages.length - 1; mi >= 0; mi--) {
    const msg = messages[mi]
    if (msg.role !== 'user' || !Array.isArray(msg.content)) continue

    let placed = false
    const newContent = msg.content.map(block => {
      if (placed || typeof block !== 'object' || block.type !== 'tool_result') return block
      const c = block.content
      const text = typeof c === 'string'
        ? c
        : Array.isArray(c)
          ? c.filter(b => b.type === 'text').map(b => (b as { text: string }).text).join('')
          : ''
      if (text.length <= CACHE_MIN_CHARS) return block
      placed = true
      return {
        ...block,
        content: [{ type: 'text' as const, text, cache_control: { type: 'ephemeral' as const } }],
      }
    })

    if (placed) {
      const cloned = [...messages]
      cloned[mi] = { ...msg, content: newContent }
      return cloned
    }
  }
  return messages
}

export async function* runToolLoop(opts: ToolLoopOptions): AsyncGenerator<ToolLoopEvent> {
  const messages: Anthropic.Messages.MessageParam[] = [...opts.initialMessages]
  const maxIter = opts.maxIterations ?? DEFAULT_MAX_ITERATIONS

  for (let i = 1; i <= maxIter; i++) {
    yield { kind: 'iteration', n: i }

    const stream = opts.client.messages.stream({
      model:      opts.model,
      max_tokens: opts.maxTokens,
      ...(opts.thinking ? { thinking: opts.thinking } : {}),
      tools:      opts.tools,
      // Single trailing cache breakpoint — see withTrailingCacheBreakpoint.
      // Never exceeds Anthropic's 4-block cache_control ceiling.
      messages:   withTrailingCacheBreakpoint(messages),
      // Cache system prompt across all iterations — specialist system prompts are
      // 15-30 KB. Without caching, each of 20 iterations pays the full input cost.
      // With caching, iterations 2-20 skip system prompt processing entirely.
      ...(opts.system ? {
        system: [{ type: 'text' as const, text: opts.system, cache_control: { type: 'ephemeral' as const } }],
      } : {}),
    })

    // Stream text deltas to the caller while the model produces its response.
    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        yield { kind: 'text', text: event.delta.text }
      }
    }

    let finalMessage: Anthropic.Messages.Message
    try {
      finalMessage = await stream.finalMessage()
    } catch (e) {
      yield { kind: 'error', message: e instanceof Error ? e.message : String(e) }
      return
    }

    // Append assistant message (including any tool_use blocks) to history.
    messages.push({ role: 'assistant', content: finalMessage.content })

    if (finalMessage.stop_reason !== 'tool_use') {
      yield { kind: 'done', reason: finalMessage.stop_reason ?? 'end_turn' }
      return
    }

    // Execute each tool_use block and collect tool_results for the next turn.
    const toolResults: Anthropic.Messages.ToolResultBlockParam[] = []
    for (const block of finalMessage.content) {
      if (block.type !== 'tool_use') continue
      yield { kind: 'tool_call', name: block.name, input: block.input, tool_use_id: block.id }

      const result = await executeTool(block.name, block.input, opts.toolContext ?? {})
      // For TodoWrite, include parsed todo items so the UI can render them visually
      const todoItems = block.name === 'TodoWrite' && !result.is_error
        ? (block.input as { todos?: Array<{ content: string; status: string; activeForm: string }> })?.todos ?? null
        : null
      yield {
        kind: 'tool_result',
        name: block.name,
        summary: result.summary,
        is_error: result.is_error,
        tool_use_id: block.id,
        todoItems,
      }

      // Store tool results WITHOUT cache_control — the breakpoint is applied
      // dynamically at send time (withTrailingCacheBreakpoint) so we never
      // accumulate more than the 4-block cache_control limit across iterations.
      toolResults.push({
        type:        'tool_result',
        tool_use_id: block.id,
        content:     result.content,
        is_error:    result.is_error,
      })
    }

    messages.push({ role: 'user', content: toolResults })
  }

  yield { kind: 'done', reason: 'max_iterations_reached' }
}

// ─── OpenAI-compatible tool_use loop ────────────────────────────────────────
// Added 2026-08-20. Until now, streamWithTools() (ai-client.ts) stripped
// ALL tools — Read/Glob/Grep/Bash/Write/Edit/Github, everything — for any
// provider that wasn't Anthropic-protocol (or one of the handful of
// endpoints detected as exposing an Anthropic-compatible /anthropic route),
// falling back to a text-only reply. That's a real gap in THIS codebase,
// not a fact about the model or the provider: OpenAI's own chat.completions
// API (and anything that mirrors it — DeepSeek, OpenRouter, local vLLM/
// llama.cpp servers) supports real function/tool calling on its own native
// wire format. Confirmed live: the venture's active provider row is
// provider='openai', model='gpt-5.6-luna' via api.openai.com — exactly the
// case this was blocking. Mirrors runToolLoop's structure and event shape
// (same ToolLoopEvent union) so streamWithTools() can pick either loop and
// callers never know the difference. Reuses the same executeTool import
// already at the top of this file.

export interface OpenAiToolLoopOptions {
  baseUrl:   string
  apiKey:    string
  model:     string
  maxTokens: number
  system?:   string
  tools:     Anthropic.Messages.Tool[]
  initialMessages: { role: string; content: string }[]
  maxIterations?: number
  toolContext?: ToolContext
}

interface OaiToolCallAccum {
  id: string
  name: string
  args: string
}

function toolsToOpenAiSchema(tools: Anthropic.Messages.Tool[]) {
  return tools.map(t => ({
    type: 'function' as const,
    function: { name: t.name, description: t.description, parameters: t.input_schema },
  }))
}

// Mirrors ai-client.ts's maxTokensParamName — kept local (not imported) so
// this file has no dependency cycle back onto ai-client.ts, which imports
// FROM this file.
function oaiMaxTokensParam(baseUrl: string): 'max_completion_tokens' | 'max_tokens' {
  return baseUrl.toLowerCase().includes('api.openai.com') ? 'max_completion_tokens' : 'max_tokens'
}

type OaiMsg = {
  role: string
  content: string | null
  tool_calls?: Array<{ id: string; type: 'function'; function: { name: string; arguments: string } }>
  tool_call_id?: string
}

export async function* runToolLoopOpenAI(opts: OpenAiToolLoopOptions): AsyncGenerator<ToolLoopEvent> {
  const messages: OaiMsg[] = []
  if (opts.system) messages.push({ role: 'system', content: opts.system })
  for (const m of opts.initialMessages) messages.push({ role: m.role, content: m.content })

  const maxIter = opts.maxIterations ?? DEFAULT_MAX_ITERATIONS
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (opts.apiKey) headers['Authorization'] = `Bearer ${opts.apiKey}`
  const oaiTools = toolsToOpenAiSchema(opts.tools)

  for (let i = 1; i <= maxIter; i++) {
    yield { kind: 'iteration', n: i }

    let res: Response
    try {
      res = await fetch(`${opts.baseUrl}/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: opts.model,
          [oaiMaxTokensParam(opts.baseUrl)]: opts.maxTokens,
          messages,
          tools: oaiTools,
          stream: true,
        }),
      })
    } catch (e) {
      yield { kind: 'error', message: e instanceof Error ? e.message : String(e) }
      return
    }
    if (!res.ok || !res.body) {
      yield { kind: 'error', message: `${opts.baseUrl} ${res.status}: ${await res.text().catch(() => '')}` }
      return
    }

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buf = ''
    let textOut = ''
    const toolCallsByIndex = new Map<number, OaiToolCallAccum>()
    let finishReason: string | undefined

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buf += decoder.decode(value, { stream: true })
      const lines = buf.split('\n')
      buf = lines.pop() ?? ''
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        const raw = line.slice(6).trim()
        if (raw === '[DONE]') continue
        let chunk: {
          choices: Array<{
            delta: {
              content?: string
              tool_calls?: Array<{ index: number; id?: string; function?: { name?: string; arguments?: string } }>
            }
            finish_reason?: string | null
          }>
        }
        try {
          chunk = JSON.parse(raw)
        } catch {
          continue // skip malformed SSE lines rather than aborting the whole turn
        }
        const choice = chunk.choices?.[0]
        if (!choice) continue
        if (choice.delta?.content) {
          textOut += choice.delta.content
          yield { kind: 'text', text: choice.delta.content }
        }
        if (choice.delta?.tool_calls) {
          for (const tc of choice.delta.tool_calls) {
            const existing = toolCallsByIndex.get(tc.index) ?? { id: '', name: '', args: '' }
            if (tc.id) existing.id = tc.id
            if (tc.function?.name) existing.name += tc.function.name
            if (tc.function?.arguments) existing.args += tc.function.arguments
            toolCallsByIndex.set(tc.index, existing)
          }
        }
        if (choice.finish_reason) finishReason = choice.finish_reason
      }
    }

    if (finishReason !== 'tool_calls' || toolCallsByIndex.size === 0) {
      yield { kind: 'done', reason: finishReason ?? 'stop' }
      return
    }

    const orderedCalls = Array.from(toolCallsByIndex.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([, v]) => v)

    messages.push({
      role: 'assistant',
      content: textOut || null,
      tool_calls: orderedCalls.map(c => ({ id: c.id, type: 'function', function: { name: c.name, arguments: c.args } })),
    })

    for (const call of orderedCalls) {
      let input: unknown = {}
      try {
        input = call.args ? JSON.parse(call.args) : {}
      } catch {
        // Malformed arguments from the model — pass an empty object through
        // rather than crashing the loop; the tool executor reports its own
        // validation error, which the model sees and can correct on retry.
      }
      yield { kind: 'tool_call', name: call.name, input, tool_use_id: call.id }
      const result = await executeTool(call.name, input, opts.toolContext ?? {})
      const todoItems = call.name === 'TodoWrite' && !result.is_error
        ? (input as { todos?: Array<{ content: string; status: string; activeForm: string }> })?.todos ?? null
        : null
      yield { kind: 'tool_result', name: call.name, summary: result.summary, is_error: result.is_error, tool_use_id: call.id, todoItems }
      messages.push({ role: 'tool', tool_call_id: call.id, content: result.content })
    }
  }

  yield { kind: 'done', reason: 'max_iterations_reached' }
}
