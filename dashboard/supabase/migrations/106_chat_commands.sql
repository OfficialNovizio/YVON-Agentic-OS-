-- 106_chat_commands.sql — TS-018 WI-0/WI-1
-- Supabase foundation for the /chat command layer (YVON-CHAT.md §2) and the
-- pipeline panel (§5). Adds:
--   1. 'system' to message_author_kind  — command results render as system rows
--   2. chat_command_log                  — append-only audit of command runs
--   3. chat_command_tokens               — confirm-token store (YVON-CHAT §2.5)
--   4. chat_messages.correlation         — links a message to its events turn
--                                          (one correlation per turn, §5.2)
--   5. chat_insert_system_message()      — security-definer writer for system
--                                          rows (the ONLY path that may write
--                                          author_kind='system')
--
-- Direct client inserts of author_kind='system' are now rejected by policy;
-- 'user' and 'agent' rows keep their existing behavior (the agent-reply flow
-- in /api/chat/stream runs under the user session — pre-existing gap, noted
-- at the bottom, to be closed by a service-role write path in a later task).
--
-- Depends on: 101_chat_schema.sql (message_author_kind, can_see_room()),
--             052_events.sql (events table — phase kinds ride it unchanged).

-- ── 1. 'system' author kind ────────────────────────────────────────────────
do $$ begin
  alter type message_author_kind add value if not exists 'system';
exception when duplicate_object then null; end $$;

-- ── 2. Command audit log (append-only) ─────────────────────────────────────
create table if not exists public.chat_command_log (
  id          bigserial primary key,
  room_id     uuid not null references public.chat_rooms(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  command     text not null,
  args        jsonb not null default '[]'::jsonb,
  ok          boolean not null,
  message     text not null default '',
  created_at  timestamptz not null default now()
);

create index if not exists chat_command_log_room_created
  on public.chat_command_log (room_id, created_at desc);

alter table public.chat_command_log enable row level security;

-- Logs are readable by anyone who can see the room; written only by the
-- actor (server writes under the user's session). No UPDATE/DELETE policies
-- → append-only by construction.
drop policy if exists "chat_command_log_read" on public.chat_command_log;
create policy "chat_command_log_read" on public.chat_command_log
  for select using (public.can_see_room(room_id));

drop policy if exists "chat_command_log_insert_own" on public.chat_command_log;
create policy "chat_command_log_insert_own" on public.chat_command_log
  for insert with check (user_id = auth.uid() and public.can_see_room(room_id));

comment on table public.chat_command_log is
  'Append-only audit of /chat command runs. TS-018. Never UPDATE/DELETE.';

-- ── 3. Confirm tokens (YVON-CHAT §2.5) ────────────────────────────────────
-- A pending destructive command (deploy, restart, …) returns a prompt and a
-- token. Only the follow-up POST with a matching, unexpired, unconsumed token
-- executes. Token hash is sha256 hex; the plaintext never touches the DB.
create table if not exists public.chat_command_tokens (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  room_id      uuid not null references public.chat_rooms(id) on delete cascade,
  command      text not null,
  args         jsonb not null default '[]'::jsonb,
  token_hash   text not null,
  expires_at   timestamptz not null,
  consumed_at  timestamptz
);

create index if not exists chat_command_tokens_user_expiry
  on public.chat_command_tokens (user_id, expires_at desc);

alter table public.chat_command_tokens enable row level security;

drop policy if exists "chat_command_tokens_own" on public.chat_command_tokens;
create policy "chat_command_tokens_own" on public.chat_command_tokens
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ── 4. chat_messages.correlation — links a turn to its events ──────────────
-- Set by /api/chat/stream when the first SSE event carrying a correlation
-- arrives. The pipeline panel reconstructs a past turn with one indexed query
-- (YVON-CHAT §5.2). Column is nullable — pre-rollout rows have no turn.
alter table public.chat_messages
  add column if not exists correlation uuid;

create index if not exists chat_messages_correlation
  on public.chat_messages (correlation);

-- ── 5. System-message writer (security definer) ────────────────────────────
-- The ONLY path that may write author_kind='system'. Verifies the caller can
-- see the room, then inserts under the table owner (bypasses RLS safely).
create or replace function public.chat_insert_system_message(
  p_room_id    uuid,
  p_content    text,
  p_author_id  text,
  p_author_name text,
  p_mentions   text[] default array[]::text[],
  p_correlation uuid default null
)
returns public.chat_messages
language plpgsql security definer set search_path = public
as $$
declare
  v_row public.chat_messages;
begin
  if not public.can_see_room(p_room_id) then
    raise exception 'cannot_see_room';
  end if;
  insert into public.chat_messages
    (room_id, author_kind, author_id, author_name, content, mentions, correlation)
  values
    (p_room_id, 'system', p_author_id, p_author_name, p_content, coalesce(p_mentions, array[]::text[]), p_correlation)
  returning * into v_row;
  return v_row;
end;
$$;

revoke all on function public.chat_insert_system_message(uuid, text, text, text, text[], uuid) from public;
grant execute on function public.chat_insert_system_message(uuid, text, text, text, text[], uuid) to authenticated;

-- ── Tighten direct inserts: clients may never forge system rows ────────────
drop policy if exists "chat_messages_insert" on public.chat_messages;
create policy "chat_messages_insert" on public.chat_messages
  for insert with check (
    author_kind <> 'system' and public.can_see_room(room_id)
  );

-- ── 6. command.run events (YVON-CHAT §2.4) ────────────────────────────────
-- The events table is service-role-only for inserts (052); the dashboard runs
-- under the user session, so command events ride a security-definer writer.
-- context_id comes from the active venture cookie, resolved by the caller.
create or replace function public.chat_emit_command_event(
  p_context_id  text,
  p_correlation uuid,
  p_command     text,
  p_args        jsonb,
  p_ok          boolean,
  p_message     text
)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.events (source, context_id, kind, actor, payload, correlation)
  values (
    'yvon',
    p_context_id,
    'command.run',
    'system',
    jsonb_build_object(
      'command', p_command,
      'args', coalesce(p_args, '[]'::jsonb),
      'ok', p_ok,
      'message', p_message
    ),
    p_correlation
  );
end;
$$;

revoke all on function public.chat_emit_command_event(text, uuid, text, jsonb, boolean, text) from public;
grant execute on function public.chat_emit_command_event(text, uuid, text, jsonb, boolean, text) to authenticated;

-- ── 7. chat.conversation events (TS-023 #2) ───────────────────────────────
-- Normal (non-command) chat messages emit a 'chat.conversation' event so the
-- graph (/brain) and the pipeline panel can see conversational history per
-- venture, linked by correlation. Same security-definer pattern as command.run.
create or replace function public.chat_emit_conversation_event(
  p_context_id  text,
  p_correlation uuid,
  p_room_id     uuid,
  p_author_id   text,
  p_preview     text,
  p_kind        text default 'chat.conversation'   -- last param: defaults after defaults is not allowed
)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.events (source, context_id, kind, actor, payload, correlation)
  values (
    'yvon',
    p_context_id,
    coalesce(p_kind, 'chat.conversation'),
    p_author_id,
    jsonb_build_object(
      'room_id', p_room_id,
      'preview', left(coalesce(p_preview, ''), 120)
    ),
    p_correlation
  );
end;
$$;

revoke all on function public.chat_emit_conversation_event(text, uuid, uuid, text, text, text) from public;
grant execute on function public.chat_emit_conversation_event(text, uuid, uuid, text, text, text) to authenticated;

-- ── 7b. input.analysis events (TS-030) ─────────────────────────────────────
-- /api/chat/stream emits the input-analysis breakdown live (tier/relation/
-- fields/must-haves/routing) but never persisted it, so past turns showed no
-- analysis in the pipeline panel. Same security-definer writer pattern as the
-- two above; the payload carries the full structured InputAnalysis so past
-- turns render the same breakdown as live ones. Caller sets kind by payload;
-- events.kind is fixed to 'input.analysis' (stream-side concern).
create or replace function public.chat_emit_input_analysis_event(
  p_context_id  text,
  p_correlation uuid,
  p_room_id     uuid,
  p_author_id   text,
  p_payload     jsonb
)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.events (source, context_id, kind, actor, payload, correlation)
  values (
    'yvon',
    p_context_id,
    'input.analysis',
    p_author_id,
    coalesce(p_payload, '{}'::jsonb),
    p_correlation
  );
end;
$$;

revoke all on function public.chat_emit_input_analysis_event(text, uuid, uuid, text, jsonb) from public;
grant execute on function public.chat_emit_input_analysis_event(text, uuid, uuid, text, jsonb) to authenticated;

-- ── Documented gap (pre-existing) ─────────────────────────────────────────
-- /api/chat/stream saves agent replies under the user's session, so any
-- authenticated user can still write author_kind='agent' rows with arbitrary
-- author_id (impersonation window). Closing it needs a service-role write
-- path (or a definer writer like the system path above) — tracked as
-- follow-up; NOT silently fixed here because it would break the stream flow.
comment on policy "chat_messages_insert" on public.chat_messages is
  'User/agent inserts as before; system rows only via chat_insert_system_message(). TS-018.';
