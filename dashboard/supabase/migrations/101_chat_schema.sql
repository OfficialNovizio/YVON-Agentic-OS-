-- 101_chat_schema.sql — TS-009 WI-1
-- Chat rooms + messages + department assignments, with RLS enforced visibility.
--
-- Rooms:
--   1 room of kind='whole_team'  — everyone can read/post
--   7 rooms of kind='department' — one per real Teams/ department
-- Access:
--   owner  → every room
--   others → whole_team + rooms whose department is assigned to them
--
-- Depends on: 100_auth_profiles.sql (profiles table + is_owner() function)

-- ── Enums ───────────────────────────────────────────────────────────────────
do $$ begin
  create type room_kind as enum ('whole_team', 'department');
exception when duplicate_object then null; end $$;

do $$ begin
  create type message_author_kind as enum ('user', 'agent');
exception when duplicate_object then null; end $$;

-- ── Tables ──────────────────────────────────────────────────────────────────
create table if not exists public.chat_rooms (
  id         uuid primary key default gen_random_uuid(),
  kind       room_kind not null,
  department text,                -- null when kind='whole_team'
  created_at timestamptz not null default now()
);

-- A department can only have one room; only one whole_team room.
create unique index if not exists chat_rooms_dept_unique
  on public.chat_rooms (department) where kind = 'department';
create unique index if not exists chat_rooms_whole_team_unique
  on public.chat_rooms ((true)) where kind = 'whole_team';

create table if not exists public.chat_messages (
  id           uuid primary key default gen_random_uuid(),
  room_id      uuid not null references public.chat_rooms(id) on delete cascade,
  author_kind  message_author_kind not null,
  author_id    text not null,                    -- profiles.id for users, agent id ('atlas' etc.) for agents
  author_name  text not null,
  content      text not null,
  mentions     text[] not null default array[]::text[],
  created_at   timestamptz not null default now()
);

create index if not exists chat_messages_room_created
  on public.chat_messages (room_id, created_at desc);

create table if not exists public.department_assignments (
  department  text primary key,
  assigned_to uuid not null references public.profiles(id) on delete cascade,
  updated_at  timestamptz not null default now()
);

-- ── Seed 8 rooms (idempotent) ──────────────────────────────────────────────
insert into public.chat_rooms (kind, department)
values ('whole_team', null)
on conflict do nothing;

insert into public.chat_rooms (kind, department)
select 'department', d from unnest(array[
  'Executive Office', 'Governance', 'AI & Agents',
  'Engineering', 'Brand Studio', 'Cybersecurity', 'Product'
]) as d
on conflict do nothing;

-- ── Owner gets all 7 departments assigned by default ───────────────────────
-- When a profile is created with role='owner', auto-insert one row per dept.
-- (Existing rows are left alone — Novy can reassign in Settings, WI-4.)
create or replace function public.seed_owner_assignments()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if new.role = 'owner' then
    insert into public.department_assignments (department, assigned_to)
    select d, new.id from unnest(array[
      'Executive Office', 'Governance', 'AI & Agents',
      'Engineering', 'Brand Studio', 'Cybersecurity', 'Product'
    ]) as d
    on conflict (department) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists on_owner_profile_created on public.profiles;
create trigger on_owner_profile_created
  after insert on public.profiles
  for each row execute function public.seed_owner_assignments();

-- ── Visibility helper: can the current auth.uid() see this room? ───────────
create or replace function public.can_see_room(target uuid)
returns boolean
language sql stable security definer
as $$
  select
    -- whole_team rooms are open to any logged-in user
    exists (select 1 from public.chat_rooms r where r.id = target and r.kind = 'whole_team')
    -- owners see every room
    or public.is_owner()
    -- department rooms visible only to the assigned bod_member
    or exists (
      select 1
      from public.chat_rooms r
      join public.department_assignments d on d.department = r.department
      where r.id = target and d.assigned_to = auth.uid()
    );
$$;

-- ── RLS ─────────────────────────────────────────────────────────────────────
alter table public.chat_rooms              enable row level security;
alter table public.chat_messages           enable row level security;
alter table public.department_assignments  enable row level security;

drop policy if exists "chat_rooms_read" on public.chat_rooms;
create policy "chat_rooms_read" on public.chat_rooms
  for select using (public.can_see_room(id));

drop policy if exists "chat_messages_read" on public.chat_messages;
create policy "chat_messages_read" on public.chat_messages
  for select using (public.can_see_room(room_id));

drop policy if exists "chat_messages_insert" on public.chat_messages;
create policy "chat_messages_insert" on public.chat_messages
  for insert with check (public.can_see_room(room_id));

drop policy if exists "assignments_read" on public.department_assignments;
create policy "assignments_read" on public.department_assignments
  for select using (assigned_to = auth.uid() or public.is_owner());

drop policy if exists "assignments_write" on public.department_assignments;
create policy "assignments_write" on public.department_assignments
  for all using (public.is_owner()) with check (public.is_owner());

comment on table public.chat_rooms is 'Team chat rooms. Whole team + one per department. TS-009 WI-1.';
comment on table public.chat_messages is 'Individual messages (user + agent). RLS via can_see_room. TS-009 WI-1.';
comment on table public.department_assignments is 'Which BOD member owns each department for chat visibility. Owner-only writes. TS-009 WI-1.';
