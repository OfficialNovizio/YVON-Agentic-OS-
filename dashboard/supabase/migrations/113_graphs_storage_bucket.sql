-- 113_graphs_storage_bucket.sql
-- docs/YVON-GRAPH.md §3 Q9 / §4.4 — the Storage bucket the Graphify VPS cron uploads to and the
-- browser reads from via a short-lived signed URL. Checked live against project
-- cjjllgexiecesgwenpph 2026-08-09: only `chat-uploads` existed; `graphs` had never been created,
-- so §4.4's pipeline had nowhere to upload to even once the cron script existed. Created here,
-- policy shape copied from `chat-uploads`' real live policies (authenticated SELECT, scoped
-- writes) — see verification query at the bottom.
--
-- Private bucket (not public): the browser never fetches the object URL directly, only ever a
-- signed URL with a short TTL (Q9's code uses 300s). `authenticated` gets SELECT so
-- `createSignedUrl()` succeeds from the anon-key browser client (same RLS shape as `events` /
-- `venture_agents` — doc §6.5, "anon key + RLS in the browser"). Only `service_role` may write —
-- the VPS cron holds SUPABASE_SERVICE_ROLE_KEY, never shipped to the browser.

INSERT INTO storage.buckets (id, name, public)
VALUES ('graphs', 'graphs', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS graphs_read_authenticated ON storage.objects;
CREATE POLICY graphs_read_authenticated
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'graphs');

DROP POLICY IF EXISTS graphs_write_service ON storage.objects;
CREATE POLICY graphs_write_service
  ON storage.objects FOR ALL TO service_role
  USING (bucket_id = 'graphs') WITH CHECK (bucket_id = 'graphs');

-- Verification after applying:
-- SELECT id, name, public FROM storage.buckets WHERE id = 'graphs';
-- SELECT policyname, cmd, roles FROM pg_policies
--   WHERE schemaname='storage' AND tablename='objects' AND policyname LIKE 'graphs_%';
