// /clear — drops the pooled Hermes session for this room (YVON-CHAT Appendix B).
// The pool lives on the VPS; the dashboard has no pool-drop surface today, so
// the command degrades loudly instead of pretending (YVON-CHAT §8.2).
// Owner: raj · TS-018 WI-1
import type { Command, CommandContext, CommandResult } from './types'
import { hermesConfig } from '@/lib/hermes-client'

export const clearCommand: Command = {
  name: 'clear',
  aliases: ['reset'],
  summary: 'Drop the pooled Hermes session for this room',
  usage: 'clear',
  async run(ctx: CommandContext): Promise<CommandResult> {
    const cfg = hermesConfig()
    if (!cfg.configured || !cfg.url || !cfg.token) {
      return {
        ok: false,
        message:
          `Hermes session pool is not reachable from this environment ` +
          `(${cfg.reason ?? 'HERMES_URL/HERMES_TOKEN unset'}) — nothing dropped here. ` +
          `No Hermes session exists for this room until a turn runs.`,
        effect: { kind: 'none' },
      }
    }
    try {
      const res = await fetch(`${cfg.url}/v1/pool/drop`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${cfg.token}`,
        },
        body: JSON.stringify({ user_id: ctx.userId, room_id: ctx.roomId }),
      })
      if (!res.ok) {
        return {
          ok: false,
          message: `Pool drop failed: HTTP ${res.status} — session kept.`,
          effect: { kind: 'none' },
        }
      }
      return {
        ok: true,
        message: `Pooled Hermes session for this room dropped. Next message starts fresh.`,
        effect: { kind: 'none' },
      }
    } catch (e) {
      return {
        ok: false,
        message: `Pool drop unreachable: ${e instanceof Error ? e.message : String(e)}`,
        effect: { kind: 'none' },
      }
    }
  },
}
