-- 115_ai_provider_keys_schema_repair.sql — reconcile drift (2026-08-11)
-- Same class of bug as 108_ventures_schema_repair.sql: 016_ai_provider_keys.sql
-- was written and tracked, but the LIVE table was never actually migrated to
-- match it — confirmed live (2026-08-11) via information_schema.columns, the
-- real table only had (id, provider, key_name, key_value, is_active,
-- created_at), not the (api_key, base_url, fast_model, synthesis_model,
-- tertiary_model, updated_at) columns dashboard/app/api/ai-keys/route.ts has
-- always assumed. Surfaced by the new Settings > AI Provider card's first
-- real save attempt: "Could not find the 'api_key' column ... in the schema
-- cache". Table is empty (0 rows) — no data migration needed, and nothing in
-- the dashboard reads key_name/key_value (grepped, zero hits), so this is a
-- straight reconciliation to what the code has always expected, matching
-- migration 016's original design.

ALTER TABLE public.ai_provider_keys
  ADD COLUMN IF NOT EXISTS api_key         TEXT,
  ADD COLUMN IF NOT EXISTS base_url        TEXT,
  ADD COLUMN IF NOT EXISTS fast_model      TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS synthesis_model TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS tertiary_model  TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS updated_at      TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.ai_provider_keys
  DROP COLUMN IF EXISTS key_name,
  DROP COLUMN IF EXISTS key_value;

-- provider must be unique for the route's .upsert(..., { onConflict: 'provider' })
-- to work at all — it silently assumed this constraint existed too.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ai_provider_keys_provider_key'
  ) THEN
    ALTER TABLE public.ai_provider_keys ADD CONSTRAINT ai_provider_keys_provider_key UNIQUE (provider);
  END IF;
END $$;

-- Same drift, worse consequence: 028_security_api_keys_rls.sql (which locks
-- this table to service_role only) was ALSO never applied — confirmed live,
-- relrowsecurity was false. With no RLS at all, the anon key could read/write
-- real provider API keys directly via PostgREST, completely bypassing
-- /api/ai-keys's "never return plaintext" contract. Fixed here rather than
-- just flagged, since this is the exact table backing the feature being
-- shipped right now (2026-08-11 Settings > AI Provider card), not an
-- unrelated pre-existing table.
ALTER TABLE public.ai_provider_keys ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access"   ON public.ai_provider_keys;
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.ai_provider_keys;
DROP POLICY IF EXISTS "Allow authenticated update" ON public.ai_provider_keys;
DROP POLICY IF EXISTS "Allow authenticated delete" ON public.ai_provider_keys;
DROP POLICY IF EXISTS ai_provider_keys_service_all  ON public.ai_provider_keys;

CREATE POLICY ai_provider_keys_service_all
  ON public.ai_provider_keys
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
