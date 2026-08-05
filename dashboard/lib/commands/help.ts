// /help — generated from the registry, so a command cannot exist without being
// discoverable (YVON-CHAT §2.4). Non-confirm commands listed first.
// Owner: raj · TS-018 WI-1
import type { Command, CommandContext, CommandResult } from './types'

export const helpCommand: Command = {
  name: 'help',
  aliases: ['h'],
  summary: 'List every command, generated from the registry',
  usage: 'help',
  async run(ctx: CommandContext): Promise<CommandResult> {
    // Lazy import avoids a registry ↔ commands cycle.
    const { COMMANDS } = await import('./registry')
    const lines = COMMANDS.map((c) => {
      const confirmTag = c.confirm ? ' (confirm)' : ''
      return `/${c.name} ${c.usage} — ${c.summary}${confirmTag}`
    })
    return {
      ok: true,
      message: ['**Commands**', ...lines.map((l) => `· ${l}`)].join('\n'),
      effect: { kind: 'none' },
      detail: { commands: COMMANDS.map((c) => c.name) },
    }
  },
}
