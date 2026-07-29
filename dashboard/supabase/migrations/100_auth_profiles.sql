-- 100_auth_profiles.sql — TS-009 WI-0
-- Profiles + role-based visibility foundation for magic-link chat access.
--
-- Model:
--   auth.users (Supabase Auth) ←1:1→ public.profiles (role: owner | bod_member)
-- On insert to auth.users, we auto-create a profile.
-- The seed email (Novy) is promoted to 'owner' automatically on first login.

-- ── Role enum ───────────────────────────────────────────────────────────────
do $$ begin
  create type user_role as enum ('owner', 'bod_member');
exception when duplicate_object then null; end $$;

-- ── Profiles table ──────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text unique not null,
  display_name text,
  role         user_role not null default 'bod_member',
  created_at   timestamptz not null default now()
);

-- ── Auto-create profile on signup; auto-promote Novy to owner ──────────────
-- If we ever need to change the owner email, update this function and re-run.
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  seed_owner text := 'chat.gpt73890@gmail.com';
begin
  insert into public.profiles (id, email, role)
  values (
    new.id,
    new.email,
    case when new.email = seed_owner then 'owner'::user_role
         else 'bod_member'::user_role end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Row Level Security ─────────────────────────────────────────────────────
alter table public.profiles enable row level security;

-- Users read their own row; owners read every row.
drop policy if exists "profiles_read" on public.profiles;
create policy "profiles_read" on public.profiles
  for select using (
    id = auth.uid()
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'owner')
  );

-- Only owners can change roles or update other users.
drop policy if exists "profiles_owner_update" on public.profiles;
create policy "profiles_owner_update" on public.profiles
  for update
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'owner'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'owner'));

-- ── Helper: is caller the owner? (used by other tables' policies) ──────────
create or replace function public.is_owner()
returns boolean
language sql stable security definer
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'owner');
$$;

comment on table public.profiles is
  'Per-user profile with role. Auto-created on auth.users insert. TS-009 WI-0.';
