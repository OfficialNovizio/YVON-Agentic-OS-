// /confirm <token> — the explicit follow-up that executes a pending confirm
// command (YVON-CHAT §2.5). Runs the original command with confirmed: true.
// Owner: raj · TS-018 WI-1
import type { Command, CommandContext, CommandResult } from './types'
import { consumeToken } from './confirm-tokens'

export const confirmCommand: Command = {
  name: 'confirm',
  summary: 'Execute a pending command using its confirm token',
  usage: 'confirm <token>',
  async run(ctx: CommandContext): Promise<CommandResult> {
    const token = (ctx.args[0] ?? '').trim()
    if (!token) {
      return {
        ok: false,
        message: 'Usage: /confirm <token> — the token came with the confirm prompt.',
        effect: { kind: 'none' },
      }
    }
    let binding: { command: string; args: string[] }
    try {
      binding = await consumeToken(ctx.supabase, {
        userId: ctx.userId,
        roomId: ctx.roomId,
        token,
      })
    } catch (e) {
      return {
        ok: false,
        message: e instanceof Error ? e.message : String(e),
        effect: { kind: 'none' },
      }
    }

    const { COMMANDS } = await import('./registry')
    const cmd = COMMANDS.find((c) => c.name === binding.command)
    if (!cmd) {
      return {
        ok: false,
        message: `Pending command '${binding.command}' is no longer registered.`,
        effect: { kind: 'none' },
      }
    }

    const result = await cmd.run({ ...ctx, args: binding.args, confirmed: true })
    // The confirm prompt is NOT re-persisted; only the execution result is.
    return { ...result, effect: result.effect ?? { kind: 'none' } }
  },
}
