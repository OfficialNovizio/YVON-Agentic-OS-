-- 107_chat_rooms_insert_policy.sql — TS-024 (live fix 2026-08-06)
-- Fixes: "new row violates row-level security policy for table 'chat_rooms'"
-- when selecting an agent to open a 1:1 chat.
--
-- Root cause: migration 101 only ever created the READ policy on chat_rooms;
-- no INSERT policy existed, so with RLS enabled every insert was denied for
-- everyone (owner included). Seeded rooms worked only because migrations run
-- as the table owner (bypasses RLS).
--
-- Policy shape:
--   · agent / assigned_scope → any signed-in user may create THEIR OWN room
--     (owner_user_id = auth.uid()) — the TS-015 1:1 drill-down design.
--   · whole_team / department → only is_owner() may create (no fabricated
--     rooms); these already exist from seeding anyway.
-- Idempotent: safe to re-run.

drop policy if exists "chat_rooms_insert_own" on public.chat_rooms;
create policy "chat_rooms_insert_own" on public.chat_rooms
  for insert
  with check (
    (kind in ('agent', 'assigned_scope') and owner_user_id = auth.uid())
    or (kind in ('whole_team', 'department') and public.is_owner())
  );

comment on policy "chat_rooms_insert_own" on public.chat_rooms is
  'Users create their own 1:1/assigned_scope rooms; only the owner creates whole_team/department rooms. TS-024.';
