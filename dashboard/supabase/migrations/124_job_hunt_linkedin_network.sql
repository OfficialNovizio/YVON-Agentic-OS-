-- 124_job_hunt_linkedin_network.sql
-- Job Hunt module, artifacts 3+4 (2026-08-15): Content Lab + Network CRM,
-- folded into Job Hunt per operator instruction. Schema pulled verbatim
-- from the operator's own prior YVON-OS design (supabase/migrations/
-- 025_content_lab.sql + 026_network_crm.sql), adapted to this project's
-- RLS convention (authenticated=read, service_role=write) and gen_random_uuid.
--
-- linkedin_connection holds the OAuth access token for posting on the
-- operator's behalf via LinkedIn's official UGC Posts API (w_member_social
-- scope) — not scraping. Needs a real LinkedIn Developer App (Client ID/
-- Secret) before /connect will do anything; see
-- app/api/job-hunt/linkedin/connect/route.ts.

CREATE OR REPLACE FUNCTION job_hunt_touch_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- ── Content Lab ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS linkedin_connection (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  access_token    TEXT NOT NULL,
  person_id       TEXT NOT NULL,
  person_name     TEXT NOT NULL,
  person_headline TEXT,
  token_expiry    TIMESTAMPTZ,
  connected_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS linkedin_posts (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content          TEXT NOT NULL,
  industry_tag     TEXT NOT NULL, -- Aerospace | IT | Trucking | Drone | Business | Novizio | Hourbour
  venture_slug     TEXT,          -- novizio | hourbour | null (personal)
  tone             TEXT NOT NULL DEFAULT 'story', -- story | insight | hot_take | data | behind_scenes | question | bridging
  format           TEXT NOT NULL DEFAULT 'text',  -- text | carousel | poll
  status           TEXT NOT NULL DEFAULT 'draft', -- draft | ready | scheduled | published
  scheduled_date   DATE,
  published_at     TIMESTAMPTZ,
  linkedin_post_id TEXT,
  impressions      INT NOT NULL DEFAULT 0,
  likes            INT NOT NULL DEFAULT 0,
  comments         INT NOT NULL DEFAULT 0,
  shares           INT NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS post_ideas (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic          TEXT NOT NULL,
  industry_tag   TEXT NOT NULL,
  venture_slug   TEXT,
  rough_idea     TEXT,
  expanded_draft TEXT,
  status         TEXT NOT NULL DEFAULT 'new', -- new | drafted | published
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_linkedin_posts_status    ON linkedin_posts (status);
CREATE INDEX IF NOT EXISTS idx_linkedin_posts_scheduled ON linkedin_posts (scheduled_date);
CREATE INDEX IF NOT EXISTS idx_linkedin_posts_industry  ON linkedin_posts (industry_tag);
CREATE INDEX IF NOT EXISTS idx_post_ideas_industry      ON post_ideas (industry_tag);
CREATE INDEX IF NOT EXISTS idx_post_ideas_status        ON post_ideas (status);

DROP TRIGGER IF EXISTS trg_linkedin_posts_updated_at ON linkedin_posts;
CREATE TRIGGER trg_linkedin_posts_updated_at
  BEFORE UPDATE ON linkedin_posts FOR EACH ROW EXECUTE FUNCTION job_hunt_touch_updated_at();

ALTER TABLE linkedin_connection ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkedin_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_ideas ENABLE ROW LEVEL SECURITY;

-- linkedin_connection holds a live access token — service_role only, no
-- authenticated read policy (same discipline as job_hunt_source_keys).
DROP POLICY IF EXISTS linkedin_connection_write_service ON linkedin_connection;
CREATE POLICY linkedin_connection_write_service
  ON linkedin_connection FOR ALL TO service_role
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS linkedin_posts_read_authenticated ON linkedin_posts;
CREATE POLICY linkedin_posts_read_authenticated
  ON linkedin_posts FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS linkedin_posts_write_service ON linkedin_posts;
CREATE POLICY linkedin_posts_write_service
  ON linkedin_posts FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS post_ideas_read_authenticated ON post_ideas;
CREATE POLICY post_ideas_read_authenticated
  ON post_ideas FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS post_ideas_write_service ON post_ideas;
CREATE POLICY post_ideas_write_service
  ON post_ideas FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Network CRM ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS network_contacts (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                   TEXT NOT NULL,
  title                  TEXT,
  company                TEXT,
  industry_tag           TEXT,
  linkedin_url           TEXT,
  email                  TEXT,
  location               TEXT,
  how_met                TEXT,
  relationship_type      TEXT NOT NULL DEFAULT 'peer',
  relationship_strength  TEXT NOT NULL DEFAULT 'weak',
  venture_slug           TEXT,
  notes                  TEXT,
  last_contacted         DATE,
  next_action            TEXT,
  next_action_date       DATE,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contact_interactions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id       UUID NOT NULL REFERENCES network_contacts(id) ON DELETE CASCADE,
  interaction_date DATE NOT NULL DEFAULT current_date,
  type             TEXT NOT NULL DEFAULT 'other',
  notes            TEXT,
  outcome          TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_network_contacts_industry ON network_contacts (industry_tag);
CREATE INDEX IF NOT EXISTS idx_network_contacts_next_action ON network_contacts (next_action_date) WHERE next_action_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_network_contacts_last_contacted ON network_contacts (last_contacted DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_contact_interactions_contact ON contact_interactions (contact_id);
CREATE INDEX IF NOT EXISTS idx_contact_interactions_date ON contact_interactions (interaction_date DESC);

DROP TRIGGER IF EXISTS trg_network_contacts_updated_at ON network_contacts;
CREATE TRIGGER trg_network_contacts_updated_at
  BEFORE UPDATE ON network_contacts FOR EACH ROW EXECUTE FUNCTION job_hunt_touch_updated_at();

ALTER TABLE network_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_interactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS network_contacts_read_authenticated ON network_contacts;
CREATE POLICY network_contacts_read_authenticated
  ON network_contacts FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS network_contacts_write_service ON network_contacts;
CREATE POLICY network_contacts_write_service
  ON network_contacts FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS contact_interactions_read_authenticated ON contact_interactions;
CREATE POLICY contact_interactions_read_authenticated
  ON contact_interactions FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS contact_interactions_write_service ON contact_interactions;
CREATE POLICY contact_interactions_write_service
  ON contact_interactions FOR ALL TO service_role USING (true) WITH CHECK (true);

COMMENT ON TABLE linkedin_posts IS 'Job Hunt Content Lab — LinkedIn post drafts/schedule, pulled from the operator''s own YVON-OS design.';
COMMENT ON TABLE network_contacts IS 'Job Hunt Network CRM — relationship tracker, pulled from the operator''s own YVON-OS design.';
