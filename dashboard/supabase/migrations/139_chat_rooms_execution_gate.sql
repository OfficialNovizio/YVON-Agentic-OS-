-- 139_chat_rooms_execution_gate.sql — execution-gate unlock RPC (2026-09-04,
-- evidence rail fix ⑤).
--
-- DISCREPANCY THIS FILE REPAIRS (found by live probe, 2026-09-04): the
-- 2026-08-21 "chat_rooms_execution_gate" migration added the
-- chat_rooms.execution_unlocked_at column straight to the live project but
-- was never checked into this repo, AND its chat_room_unlock_execution RPC
-- never landed at all — PostgREST answered PGRST202 for the function and
-- `execution_unlocked_at=not.is.null` matched 0 rows, meaning every
-- task-proposal accept/convert call's best-effort unlock has silently
-- no-opped since launch and no room has ever been unlocked. The column
-- add below is `if not exists` so fresh environments get the whole gate;
-- live, it is a no-op.
--
-- Wrapper side (vps-scripts/yvon-hermes-http/main.py _room_gate_locked):
--   row found + execution_unlocked_at IS NULL  → gate LOCKED (tripwire +
--     repoUrl/PAT withheld by the dashboard until this fires)
--   row found + timestamp set                  → unlocked
--   room missing / read failure / YVON_EVENTS_ENABLED=0 → None → degrade,
--     never cry wolf (a Supabase blip must not brick working rooms)
--
-- Callers (both pre-existing, best-effort):
--   app/api/chat/task-proposal/route.ts   accept  → unlock(taskId)
--   app/api/chat/prd-proposal/route.ts    convert → unlock(result.taskId)

alter table public.chat_rooms
  add column if not exists execution_unlocked_at timestamptz;
alter table public.chat_rooms
  add column if not exists execution_task_id text;

create or replace function public.chat_room_unlock_execution(
  p_room_id uuid,
  p_task_id text default null
)
returns void
language plpgsql security definer set search_path = public
as $$
begin
  -- Security definer on purpose: chat_rooms' only UPDATE RLS policy is
  -- scoped to kind='thread' AND owner_user_id=auth.uid(), so a direct
  -- client update would silently no-op for Workforce/department/agent
  -- rooms (0 rows, no error) — the exact trap the callers' comments
  -- already document.
  update public.chat_rooms
     set execution_unlocked_at = now(),
         execution_task_id = p_task_id
   where id = p_room_id;
end;
$$;

revoke all on function public.chat_room_unlock_execution(uuid, text) from public;
grant execute on function public.chat_room_unlock_execution(uuid, text) to authenticated;
