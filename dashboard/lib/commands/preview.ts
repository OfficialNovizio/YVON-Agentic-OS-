// /preview — pushes the current branch, waits for the Vercel preview URL, and
// posts it into chat (YVON-CHAT §6.4). confirm: true (it pushes). Needs a
// Vercel deploy executor like /deploy; degrades loudly otherwise.
//
// Owner: raj + mia · TS-018 WI-7
import type { Command, CommandContext, CommandResult } from './types'
import { issueToken } from './confirm-tokens'
import { hermesConfig } from '@/lib/hermes-client'

export const previewCommand: Command = {
  name: 'preview',
  aliases: ['pvw'],
  summary: 'Push the current branch and return the Vercel preview URL',
  usage: 'preview [branch]',
  confirm: true,
  async run(ctx: CommandContext): Promise<CommandResult> {
    const branch = (ctx.args[0] ?? '').trim() || 'current'
    const cfg = hermesConfig()

    if (!ctx.confirmed) {
      const issued = await issueToken(ctx.supabase, {
        userId: ctx.userId,
        roomId: ctx.roomId,
        command: 'preview',
        args: ctx.args,
      })
      return {
        ok: true,
        message: issued.message,
        effect: { kind: 'none' },
        detail: { pending: true, branch },
      }
    }

    // cli/vercel-watch.sh needs a Vercel token + a checkout; neither exists on
    // Vercel itself. The Hermes VPS can host it — wire through /deploy-style
    // executor when configured.
    if (!cfg.configured) {
      return {
        ok: false,
        message:
          `Preview did NOT run: no executor (${cfg.reason ?? 'HERMES_URL unset'}). ` +
          `Preview needs cli/worktree-gen.py + vercel-watch.sh on a host with the checkout — ` +
          `Appendix C #6. Nothing was pushed.`,
        effect: { kind: 'none' },
        detail: { ran: false, reason: 'no-executor', branch },
      }
    }
    return {
      ok: false,
      message:
        `Preview executor not wired yet (Hermes VPS reachable but no preview harness installed). ` +
        `Nothing was pushed. Tracked in TS-018 WI-7 — pending Appendix C #6.`,
      effect: { kind: 'none' },
      detail: { ran: false, reason: 'harness-unwired', branch },
    }
  },
}
