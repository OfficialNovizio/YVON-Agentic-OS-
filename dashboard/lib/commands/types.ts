// Command layer contract — YVON-CHAT.md §2.4. Do not diverge from this file
// without updating the doc: it is the single contract every command ships to.
//
// Owner: raj · TS-018 WI-1
import type { cookies } from 'next/headers'

/**
 * Minimal structural Supabase client — commands only ever `.from()` and
 * `.rpc()`. Structural typing keeps this contract version-proof against the
 * ssr/supabase-js type churn that full `SupabaseClient` generics cause.
 */
export interface DbClient {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- structural seam; query chains are the caller's business
  from(table: string): any
  rpc(fn: string, args?: Record<string, unknown>): Promise<{
    data: unknown
    error: { message: string } | null
  }>
}

/** Matches whatever `cookies()` from next/headers returns in this Next version. */
export type RequestCookies = Awaited<ReturnType<typeof cookies>>

export interface CommandContext {
  userId: string
  roomId: string
  args: string[]
  raw: string
  supabase: DbClient
  cookies: RequestCookies
  /** true when this run is the explicit follow-up after a confirm prompt */
  confirmed?: boolean
}

export interface CommandResult {
  ok: boolean
  /** rendered into chat as an author_kind='system' message */
  message: string
  /** client-side follow-up: 'reload' | 'navigate' | 'none' */
  effect?: { kind: 'reload' } | { kind: 'navigate'; href: string } | { kind: 'none' }
  /** structured detail for the pipeline panel */
  detail?: Record<string, unknown>
}

export interface Command {
  name: string
  aliases?: string[]
  summary: string
  usage: string
  /** commands that touch infrastructure require an explicit confirm step */
  confirm?: boolean
  run(ctx: CommandContext): Promise<CommandResult>
}

/** A pending confirm token, as returned by issueToken(). */
export interface IssuedToken {
  token: string
  /** human prompt rendered into chat; contains the token for /confirm */
  message: string
  /** how long the token stays valid, seconds */
  ttlSeconds: number
}
