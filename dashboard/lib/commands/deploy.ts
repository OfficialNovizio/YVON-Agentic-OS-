// /deploy [--full] — runs the deploy pipeline and streams the result into chat
// (YVON-CHAT §6.3). confirm: true. Executor-gated: Vercel cannot run
// cli/deploy.sh (Appendix C #6), so the command needs YVON_DEPLOY_EXECUTOR
// (ssh host) or a CI trigger. Until then it degrades loudly — a deterministic
// action never silently no-ops (§8.2).
//
// Owner: raj + mia · TS-018 WI-7
import type { Command, CommandContext, CommandResult } from './types'
import { issueToken } from './confirm-tokens'

/** Deterministic executor resolution — env-driven, explicit, never guessed. */
function executor(): { kind: 'ssh'; host: string; full: boolean } | { kind: 'none' } {
  const host = process.env.YVON_DEPLOY_EXECUTOR?.trim()
  if (host) return { kind: 'ssh', host, full: false }
  return { kind: 'none' }
}

export const deployCommand: Command = {
  name: 'deploy',
  aliases: ['release'],
  summary: 'Run the deploy pipeline (static gate + full tier)',
  usage: 'deploy [--full]',
  confirm: true,
  async run(ctx: CommandContext): Promise<CommandResult> {
    const full = ctx.args.includes('--full')
    const exe = executor()

    if (!ctx.confirmed) {
      const issued = await issueToken(ctx.supabase, {
        userId: ctx.userId,
        roomId: ctx.roomId,
        command: 'deploy',
        args: ctx.args,
      })
      return {
        ok: true,
        message: issued.message + (full ? ' (--full tier: next build + Playwright smoke)' : ''),
        effect: { kind: 'none' },
        detail: { pending: true, full, executor: exe.kind },
      }
    }

    if (exe.kind === 'none') {
      return {
        ok: false,
        message:
          `Deploy did NOT run: no executor is configured (Vercel cannot run cli/deploy.sh — ` +
          `Appendix C #6). Set \`YVON_DEPLOY_EXECUTOR\` (ssh host) or wire a CI trigger. ` +
          `Nothing was pushed, built, or released.`,
        effect: { kind: 'none' },
        detail: { ran: false, reason: 'no-executor', full },
      }
    }

    // Executor present — run cli/deploy.sh remotely (streamed back as one result).
    try {
      const cmd = `cd /opt/Agents && bash cli/deploy.sh${full ? ' --full' : ''} 2>&1 | tail -40`
      const res = await fetch(`http://${exe.host}/__yvon_exec`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cmd }),
        signal: AbortSignal.timeout(120_000),
      }).catch(() => null)
      if (!res) {
        return {
          ok: false,
          message: `Executor ${exe.host} unreachable — deploy did NOT run. Check YVON_DEPLOY_EXECUTOR.`,
          effect: { kind: 'none' },
          detail: { ran: false, reason: 'executor-unreachable' },
        }
      }
      const text = (await res.text()).slice(0, 4000)
      return {
        ok: res.ok,
        message: `Deploy ${res.ok ? 'completed' : 'FAILED'} on ${exe.host}:\n\n${text}`,
        effect: { kind: 'reload' },
        detail: { ran: true, ok: res.ok, host: exe.host, full },
      }
    } catch (e) {
      return {
        ok: false,
        message: `Deploy failed: ${e instanceof Error ? e.message : String(e)}`,
        effect: { kind: 'none' },
        detail: { ran: false, reason: 'error' },
      }
    }
  },
}
