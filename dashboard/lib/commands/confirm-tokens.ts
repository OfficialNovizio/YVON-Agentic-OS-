// Confirm-token store — YVON-CHAT.md §2.5.
// Tokens are bound to (userId, roomId, command, args), expire, and are single-use.
// Only the sha256 hash ever reaches the database (chat_command_tokens.token_hash).
//
// Owner: raj · TS-018 WI-1
import { createHash, randomBytes } from 'crypto'
import type { DbClient, IssuedToken } from './types'

export const CONFIRM_TTL_SECONDS = 10 * 60 // 10 minutes

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex')
}

/**
 * Issue a confirm token for a pending destructive command. Returns the
 * plaintext token (shown to the operator in chat) after storing only its hash.
 * A second token for the same (user, room, command, args) supersedes the first.
 */
export async function issueToken(
  supabase: DbClient,
  opts: { userId: string; roomId: string; command: string; args: string[] },
): Promise<IssuedToken> {
  const token = randomBytes(18).toString('base64url')
  const expiresAt = new Date(Date.now() + CONFIRM_TTL_SECONDS * 1000)

  // Invalidate any prior pending token for this exact binding (idempotent).
  await supabase
    .from('chat_command_tokens')
    .update({ consumed_at: new Date().toISOString() })
    .eq('user_id', opts.userId)
    .eq('room_id', opts.roomId)
    .eq('command', opts.command)
    .is('consumed_at', null)

  const { error } = await supabase.from('chat_command_tokens').insert({
    user_id: opts.userId,
    room_id: opts.roomId,
    command: opts.command,
    args: opts.args,
    token_hash: sha256(token),
    expires_at: expiresAt.toISOString(),
  })
  if (error) throw new Error(`confirm token insert failed: ${error.message}`)

  return {
    token,
    ttlSeconds: CONFIRM_TTL_SECONDS,
    message:
      `⚠️ **Confirm required** — this command touches infrastructure and has not run yet. ` +
      `Send \`/confirm ${token}\` within ${CONFIRM_TTL_SECONDS / 60} minutes to execute. ` +
      `The token is single-use and bound to this room and command.`,
  }
}

/**
 * Verify + consume a plaintext token. Returns the original command binding on
 * success, or throws with a plain reason. Idempotent on expiry/consume —
 * a stale token can never fire yesterday's deploy (YVON-CHAT §8.1 failure #4).
 */
export async function consumeToken(
  supabase: DbClient,
  opts: { userId: string; roomId: string; token: string },
): Promise<{ command: string; args: string[] }> {
  const hash = sha256(opts.token)
  const { data, error } = await supabase
    .from('chat_command_tokens')
    .select('id, command, args, expires_at, consumed_at')
    .eq('user_id', opts.userId)
    .eq('room_id', opts.roomId)
    .eq('token_hash', hash)
    .single()

  if (error || !data) throw new Error('unknown or already-used confirm token')
  const row = data as unknown as {
    id: string
    command: string
    args: string[]
    expires_at: string
    consumed_at: string | null
  }
  if (row.consumed_at) throw new Error('confirm token already used — re-issue the command')
  if (new Date(row.expires_at).getTime() < Date.now()) {
    throw new Error('confirm token expired — re-issue the command')
  }

  const { error: consumeErr } = await supabase
    .from('chat_command_tokens')
    .update({ consumed_at: new Date().toISOString() })
    .eq('id', row.id)
    .eq('user_id', opts.userId)
  if (consumeErr) throw new Error(`confirm token consume failed: ${consumeErr.message}`)

  return { command: row.command, args: row.args }
}
