-- 130_job_hunt_company_leads.sql
-- Job Hunt module (2026-08-15): raw, unverified company leads bulk-pulled
-- from OrgBook BC (orgbook.gov.bc.ca), the BC government's free, public,
-- official corporate-registry API — not scraped, an open API purpose-built
-- for exactly this kind of integration (bcgov.github.io/orgbook-bc-api-docs).
--
-- This is deliberately a SEPARATE table from target_companies. OrgBook only
-- returns a legal entity name, registration ID, status (active/historical),
-- entity type (BC company / sole proprietorship / extra-provincial / etc.)
-- and a keyword match — no industry classification, no city, no size, no
-- description, no website. Mixing that into the curated target_companies
-- table (which has a real profile for every row) would silently degrade its
-- quality. Leads sit here until a human reviews and promotes one into
-- target_companies with the missing fields filled in.
--
-- Populated by dashboard/scripts/fetch-orgbook-leads.mjs, run locally by the
-- operator (OrgBook isn't reachable from this repo's sandboxed dev network).

CREATE TABLE IF NOT EXISTS company_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'orgbook_bc',
  registration_id TEXT NOT NULL,
  entity_status TEXT,           -- OrgBook 'entity_status': ACT, HIS, etc.
  entity_type TEXT,             -- OrgBook 'entity_type': BC, SP, XPRO, etc.
  matched_keyword TEXT,         -- which search keyword surfaced this lead
  industry_guess TEXT,          -- best-effort mapping of matched_keyword -> one of the 5 Job Hunt industries; NOT verified
  province TEXT NOT NULL DEFAULT 'BC',
  promoted BOOLEAN NOT NULL DEFAULT false,
  dismissed BOOLEAN NOT NULL DEFAULT false,
  discovered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (source, registration_id)
);

CREATE INDEX IF NOT EXISTS idx_company_leads_industry_guess ON company_leads (industry_guess);
CREATE INDEX IF NOT EXISTS idx_company_leads_entity_status ON company_leads (entity_status);
CREATE INDEX IF NOT EXISTS idx_company_leads_promoted ON company_leads (promoted);
CREATE INDEX IF NOT EXISTS idx_company_leads_name ON company_leads (name);

ALTER TABLE company_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "company_leads_select_authenticated" ON company_leads
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "company_leads_all_service_role" ON company_leads
  FOR ALL TO service_role USING (true) WITH CHECK (true);
