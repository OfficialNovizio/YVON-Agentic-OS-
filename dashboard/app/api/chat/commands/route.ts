// GET /api/chat/commands — the command registry, exposed for the composer
// popover. Generated from dashboard/lib/commands/registry — the single source
// of truth — so the popover can never drift from what /help lists.
// Owner: raj · TS-020
import { COMMANDS } from '@/lib/commands/registry'

export interface CommandInfo {
  name: string
  aliases: string[]
  summary: string
  usage: string
  confirm: boolean
}

export async function GET(): Promise<Response> {
  const commands: CommandInfo[] = COMMANDS.map((c) => ({
    name: c.name,
    aliases: c.aliases ?? [],
    summary: c.summary,
    usage: c.usage,
    confirm: c.confirm ?? false,
  }))
  return Response.json({ commands })
}
