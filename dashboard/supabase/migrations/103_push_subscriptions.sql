-- 103_push_subscriptions.sql — TS-014 WI-1
-- Web Push subscriptions per user + device.
-- Applied to Supabase project cjjllgexiecesgwenpph on 2026-07-29.

create table if not exists public.push_subscriptions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  endpoint     text not null,
  p256dh       text not null,
  auth         text not null,
  user_agent   text,
  created_at   timestamptz not null default now(),
  last_used_at timestamptz,
  unique (user_id, endpoint)
);

create index if not exists push_subs_user on public.push_subscriptions (user_id);

alter table public.push_subscriptions enable row level security;

drop policy if exists "push_subs_self_read" on public.push_subscriptions;
create policy "push_subs_self_read" on public.push_subscriptions
  for select using (user_id = auth.uid() or public.is_owner());

drop policy if exists "push_subs_self_write" on public.push_subscriptions;
create policy "push_subs_self_write" on public.push_subscriptions
  for insert with check (user_id = auth.uid());

drop policy if exists "push_subs_self_update" on public.push_subscriptions;
create policy "push_subs_self_update" on public.push_subscriptions
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "push_subs_self_delete" on public.push_subscriptions;
create policy "push_subs_self_delete" on public.push_subscriptions
  for delete using (user_id = auth.uid() or public.is_owner());

comment on table public.push_subscriptions is
  'Web Push subscriptions per user + device. TS-014 WI-1.';
