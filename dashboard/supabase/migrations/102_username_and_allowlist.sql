-- 102_username_and_allowlist.sql — username-based auth + allowlist trigger
-- Adds username column to profiles and hard-allowlists the 3 BOD emails.
--
-- Runtime password inserts happen via a separate script (execute_sql), NOT
-- via apply_migration, so plaintext passwords never enter git.
-- To rotate: re-run the seed script in scripts/seed-bod-users.sql (see docs).
--
-- Applied to Supabase project cjjllgexiecesgwenpph on 2026-07-29.

alter table public.profiles add column if not exists username text unique;

-- Replace the profile trigger to only create rows for allowlisted emails.
-- Novy (novy738@yvon.internal) is promoted to owner automatically.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
declare
  allowed text[] := array[
    'novy738@yvon.internal',
    'sagar739@yvon.internal',
    'amit740@yvon.internal'
  ];
begin
  if new.email = any(allowed) then
    insert into public.profiles (id, email, username, role)
    values (
      new.id,
      new.email,
      split_part(new.email, '@', 1),
      case when new.email = 'novy738@yvon.internal' then 'owner'::user_role
           else 'bod_member'::user_role end
    )
    on conflict (id) do nothing;
  end if;
  return new;
end; $$;

comment on function public.handle_new_user is
  'Allowlist-gated profile bootstrap. Only 3 BOD emails create profile rows.';
