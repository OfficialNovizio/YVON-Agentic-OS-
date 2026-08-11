// Command registry + dispatch — YVON-CHAT.md §2.3/§2.4.
// Interception point: POST /api/chat/send, BEFORE the chat_messages insert.
// Rules enforced here (from the doc, non-negotiable):
//   · unknown command is an ERROR with a suggestion — never a fallthrough
//   · every command has usage; /help is generated from this registry
//   · confirm:true commands return a prompt first, execute only on /confirm
//
// Owner: raj · TS-018 WI-1
import type { Command, CommandContext, CommandResult } from './types'
import { helpCommand } from './help'
import { switchCommand } from './switch'
import { whereCommand } from './where'
import { clearCommand } from './clear'
import { confirmCommand } from './confirm'
import { deployCommand } from './deploy'
import { previewCommand } from './preview'
import { assignTaskCommand } from './assign-task'

export const COMMANDS: Command[] = [
  helpCommand,
  switchCommand,
  whereCommand,
  clearCommand,
  confirmCommand,
  deployCommand,
  previewCommand,
  assignTaskCommand,
]

const BY_NAME = new Map<string, Command>()
for (const c of COMMANDS) {
  BY_NAME.set(c.name, c)
  for (const a of c.aliases ?? []) BY_NAME.set(a, c)
}

function commandNames(): string[] {
  return COMMANDS.map((c) => c.name)
}

/** Levenshtein — used only to suggest a real command on a typo. */
function editDistance(a: string, b: string): number {
  const m = a.length
  const n = b.length
  if (m === 0) return n
  if (n === 0) return m
  const dp: number[] = Array.from({ length: n + 1 }, (_, j) => j)
  for (let i = 1; i <= m; i++) {
    let prev = dp[0]
    dp[0] = i
    for (let j = 1; j <= n; j++) {
      const tmp = dp[j]
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1))
      prev = tmp
    }
  }
  return dp[n]
}

function suggest(name: string): string | null {
  let best: { name: string; d: number } | null = null
  for (const n of commandNames()) {
    const d = editDistance(name, n)
    if (best === null || d < best.d) best = { name: n, d }
  }
  return best && best.d <= 2 ? best.name : null
}

/**
 * Run a command, or return a plain "unknown command" result. Never throws for
 * user input; never falls through to the model.
 */
export async function dispatchCommand(ctx: CommandContext): Promise<CommandResult> {
  const raw = ctx.raw.trim()
  if (!raw.startsWith('/')) {
    return { ok: false, message: 'not a command', effect: { kind: 'none' } }
  }
  const [head, ...rest] = raw.slice(1).split(/\s+/)
  const name = (head ?? '').toLowerCase()
  const cmd = BY_NAME.get(name)

  if (!cmd) {
    const s = suggest(name)
    return {
      ok: false,
      message: s
        ? `Unknown command \`/${name}\` — did you mean \`/${s}\`? Run \`/help\` for the full list.`
        : `Unknown command \`/${name}\`. Run \`/help\` for the full list.`,
      effect: { kind: 'none' },
    }
  }

  // A command is not a conversation — never forwarded to Hermes, never stored
  // as a user message. Its result becomes a system message.
  try {
    return await cmd.run({ ...ctx, args: rest })
  } catch (e) {
    return {
      ok: false,
      message: `Command \`/${cmd.name}\` failed: ${e instanceof Error ? e.message : String(e)}`,
      effect: { kind: 'none' },
    }
  }
}
