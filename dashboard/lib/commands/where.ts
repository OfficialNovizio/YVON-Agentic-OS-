// /where — states the truth about what is actually pointed where (YVON-CHAT
// Appendix B: deliberately in the first release, while /switch is partial).
// Owner: raj · TS-018 WI-1
import type { Command, CommandContext, CommandResult } from './types'
import { hermesConfig } from '@/lib/hermes-client'

export const whereCommand: Command = {
  name: 'where',
  summary: 'Print active venture, workspace, Hermes cwd, project root',
  usage: 'where',
  async run(ctx: CommandContext): Promise<CommandResult> {
    const active = ctx.cookies.get('yvon_active_venture')?.value ?? 'yvon-os'
    const cfg = hermesConfig()
    const lines = [
      `· venture scope — **${active}** (from the active cookie)`,
      `· workspace key — \`${active}\``,
      `· dashboard root — ${process.cwd()} (Vercel — no repo checkout here)`,
      `· Hermes — ${cfg.configured ? `${cfg.url} (configured)` : `not configured: ${cfg.reason ?? ''}`}`,
      `· Hermes cwd — unknown from dashboard (run Appendix A probe on the VPS)`,
      `· Graphify source — dashboard stub (returns '')`,
    ]
    return {
      ok: true,
      message: ['**Where things point**', ...lines.map((l) => l)].join('\n'),
      effect: { kind: 'none' },
      detail: {
        venture: active,
        workspace: active,
        hermesConfigured: cfg.configured,
        graphify: 'stub',
      },
    }
  },
}
