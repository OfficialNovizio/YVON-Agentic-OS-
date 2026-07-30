-- 104_workforce_and_rooms.sql — TS-015 WI-1
-- Adds 'agent' + 'assigned_scope' room kinds for drill-down chats.
-- Applied to Supabase project cjjllgexiecesgwenpph on 2026-07-30.
--
-- NOTE: enum ADD VALUE requires a commit before use, so this shipped as
-- two separate MCP migrations in the DB history:
--   104a_workforce_enum_add   — the two `alter type ... add value` lines
--   104b_workforce_drilldown  — everything below
-- Kept in one file here for clarity; local devs re-running should run each
-- statement in a separate transaction.

alter type room_kind add value if not exists 'agent';
alter type room_kind add value if not exists 'assigned_scope';

alter table public.chat_rooms
  add column if not exists agent_id text,
  add column if not exists owner_user_id uuid references public.profiles(id) on delete cascade;

create unique index if not exists chat_rooms_agent_unique
  on public.chat_rooms (owner_user_id, agent_id) where kind = 'agent';

create unique index if not exists chat_rooms_assigned_scope_unique
  on public.chat_rooms (owner_user_id) where kind = 'assigned_scope';

create or replace function public.can_see_room(target uuid)
returns boolean language sql stable security definer as $$
  select
    exists (select 1 from public.chat_rooms r where r.id = target and r.kind = 'whole_team')
    or public.is_owner()
    or exists (
      select 1 from public.chat_rooms r
      join public.department_assignments d on d.department = r.department
      where r.id = target and d.assigned_to = auth.uid()
    )
    or exists (
      select 1 from public.chat_rooms r
      where r.id = target and r.owner_user_id = auth.uid() and r.kind in ('agent', 'assigned_scope')
    );
$$;

comment on column public.chat_rooms.agent_id is 'Fleet handle (e.g. atlas) for kind=agent rooms.';
comment on column public.chat_rooms.owner_user_id is 'Profile that owns the personal room (kind IN agent, assigned_scope).';
