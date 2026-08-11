// /switch <slug> — the four-part switch (YVON-CHAT §3).
// Part 1 (dashboard scope cookie) is built; Part 2 (events.context_id) is read
// from the cookie by /api/chat/stream on the next message; Parts 3–4 (Hermes
// cwd, Graphify root) are probe-gated. The command reports exactly what took
// effect — a partial switch is reported as partial (§8.2).
//
// Owner: raj · TS-018 WI-1/WI-2
import type { Command, CommandContext, CommandResult } from './types'

// TS-026: valid ventures come from the DB (no hardcoded sub-brands). Resolved
// per-run in the command (ctx.supabase is available).
async function validVentures(ctx: CommandContext): Promise<string[]> {
  const slugs: string[] = ['yvon-os']
  try {
    const { data } = await ctx.supabase.from('ventures').select('slug')
    for (const r of (data as unknown as { slug: string }[] | null) ?? []) slugs.push(r.slug)
  } catch {
    // DB unavailable — yvon-os only
  }
  return slugs
}

export const switchCommand: Command = {
  name: 'switch',
  aliases: ['venture', 'ws'],
  summary: 'Switch dashboard scope + agent context to a venture',
  usage: 'switch <slug>  (yvon-os or a Settings-added venture)',
  async run(ctx: CommandContext): Promise<CommandResult> {
    const valid = await validVentures(ctx)
    const slug = (ctx.args[0] ?? '').trim().toLowerCase()
    if (!slug) {
      return {
        ok: false,
        message: `Usage: /switch <slug> — one of: ${valid.join(', ')}`,
        effect: { kind: 'none' },
      }
    }
    const key = valid.includes(slug) ? slug : null
    if (!key) {
      return {
        ok: false,
        message: `Unknown venture '${slug}'. One of: ${valid.join(', ')}`,
        effect: { kind: 'none' },
      }
    }

    // Part 1 — dashboard scope cookie (mirrors POST /api/set-venture).
    ctx.cookies.set('yvon_active_venture', key, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      httpOnly: false, // readable client-side for VentureSwitcher
      sameSite: 'lax',
    })

    // Parts 2–4 status — reported honestly (§8.2).
    const scope = key === 'yvon-os' ? 'yvon-os' : `${key} (venture ${slug})`
    return {
      ok: true,
      message:
        `Scope switched to **${scope}**. ` +
        `Agent context follows on the next message (stream reads the cookie). ` +
        `Hermes working directory unchanged (not yet wired — Appendix A probe). ` +
        `Graphify retrieval unchanged (chat's context injection doesn't route through CIE/graphify — YVON-CHAT §3.4).`,
      effect: { kind: 'reload' },
      detail: { venture: key, parts: { scope: true, context: true, cwd: false, graphify: false } },
    }
  },
}
