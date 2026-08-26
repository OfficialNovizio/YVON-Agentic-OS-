-- 123_job_hunt_target_companies.sql
-- Job Hunt module, course-correction (2026-08-15): pulled directly from the
-- operator's own prior work, github.com/OfficialNovizio/YVON-OS
-- supabase/migrations/024_career_dashboard.sql (target_companies table +
-- seed), confirmed by the operator as still accurate. Schema adapted to
-- this project's RLS convention (authenticated=read, service_role=write);
-- columns and the 22-company seed list are pulled verbatim, not reinvented.
--
-- This supersedes the AI/tech-company Greenhouse seed list added in
-- 122_job_hunt_discovery.sql for this operator's actual job search, which
-- targets Aerospace, IT, Trucking/Logistics, Drone/UAV, and Business roles
-- in Canada — a materially different company set than career-ops' AI-labs
-- list. That Greenhouse adapter/seed is left in place (harmless, still
-- correct for what it is) but disabled by default in the Discover UI.

CREATE TABLE IF NOT EXISTS target_companies (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  domain       TEXT,
  industry     TEXT NOT NULL, -- Aerospace | IT | Trucking | Drone | Business
  province     TEXT NOT NULL, -- ON | BC | AB | QC | MB | SK | Remote | ...
  size         TEXT NOT NULL DEFAULT 'medium', -- startup | small | medium | large | enterprise
  description  TEXT,
  careers_url  TEXT,
  is_watching  BOOLEAN NOT NULL DEFAULT FALSE,
  open_roles   INT NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_target_companies_industry ON target_companies (industry);
CREATE INDEX IF NOT EXISTS idx_target_companies_watching ON target_companies (is_watching);

COMMENT ON TABLE target_companies IS
  'Job Hunt company watchlist/browser. Schema + 22-company seed pulled verbatim '
  'from the operator''s own prior YVON-OS design (024_career_dashboard.sql), '
  'confirmed accurate 2026-08-15 — real Canadian companies across the operator''s '
  'five target industries, not invented.';

ALTER TABLE target_companies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS target_companies_read_authenticated ON target_companies;
CREATE POLICY target_companies_read_authenticated
  ON target_companies FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS target_companies_write_service ON target_companies;
CREATE POLICY target_companies_write_service
  ON target_companies FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Seed: curated Canadian companies by industry (verbatim from YVON-OS 024_career_dashboard.sql)
INSERT INTO target_companies (name, domain, industry, province, size, description, careers_url) VALUES
  -- Aerospace / Aviation
  ('Bombardier',              'bombardier.com',       'Aerospace',  'QC', 'enterprise', 'Business jets and rail transportation systems.', 'https://jobs.bombardier.com'),
  ('CAE Inc.',                'cae.com',               'Aerospace',  'QC', 'large',      'Flight simulators, defense training systems, civil aviation.', 'https://www.cae.com/careers'),
  ('Pratt & Whitney Canada',  'pwc.ca',                'Aerospace',  'QC', 'large',      'Aircraft engines for regional and business aviation.', 'https://www.pwc.ca/en/careers'),
  ('MDA Space',               'mda.space',             'Aerospace',  'ON', 'large',      'Space robotics, satellites, Canadarm program.', 'https://mda.space/en/careers'),
  ('StandardAero',            'standardaero.com',      'Aerospace',  'MB', 'large',      'Aviation MRO and engine services.', 'https://www.standardaero.com/careers'),
  ('KF Aerospace',            'kfaerospace.com',       'Aerospace',  'BC', 'medium',     'Cargo, charter, and MRO services.', 'https://www.kfaerospace.com/careers'),
  ('Viking Air',              'vikingair.com',         'Aerospace',  'BC', 'small',      'Amphibious and utility aircraft manufacturing.', 'https://www.vikingair.com/about/careers'),
  ('Cascade Aerospace',       'cascadeaerospace.com',  'Aerospace',  'BC', 'medium',     'Military and commercial aircraft MRO.', 'https://www.cascadeaerospace.com/careers'),
  -- Drone / UAV
  ('Draganfly',               'draganfly.com',         'Drone',      'SK', 'startup',    'Commercial drones for public safety and agriculture.', 'https://draganfly.com/careers'),
  ('Percepto',                'percepto.com',          'Drone',      'ON', 'small',      'Autonomous drone operations for industrial inspection.', 'https://percepto.co/careers'),
  -- IT / Software
  ('Shopify',                 'shopify.com',           'IT',         'ON', 'enterprise', 'E-commerce platform, remote-first engineering culture.', 'https://www.shopify.com/careers'),
  ('Cohere',                  'cohere.com',            'IT',         'ON', 'medium',     'Enterprise AI and NLP platform.', 'https://cohere.com/careers'),
  ('Wealthsimple',            'wealthsimple.com',      'IT',         'ON', 'large',      'Fintech platform for investing and banking.', 'https://www.wealthsimple.com/en-ca/careers'),
  ('Hootsuite',               'hootsuite.com',         'IT',         'BC', 'large',      'Social media management platform.', 'https://www.hootsuite.com/careers'),
  ('Lightspeed Commerce',     'lightspeedhq.com',      'IT',         'QC', 'large',      'POS and e-commerce for retail and hospitality.', 'https://www.lightspeedhq.com/careers'),
  ('D2L',                     'd2l.com',               'IT',         'ON', 'medium',     'Learning management platform for education.', 'https://www.d2l.com/careers'),
  -- Trucking / Logistics / Dispatch
  ('TFI International',       'tfiintl.com',           'Trucking',   'QC', 'enterprise', 'Largest transport and logistics company in Canada.', 'https://www.tfiintl.com/careers'),
  ('Mullen Group',            'mullengroup.com',       'Trucking',   'AB', 'large',      'Trucking, logistics, warehousing across western Canada.', 'https://www.mullengroup.com/careers'),
  ('Day & Ross',              'dayross.com',           'Trucking',   'NB', 'large',      'National LTL and logistics, part of FedEx Canada.', 'https://dayross.com/careers'),
  ('Challenger Motor Freight','challenger.com',        'Trucking',   'ON', 'medium',     'Truckload, warehousing, and logistics.', 'https://www.challenger.com/careers'),
  ('Trimac Transportation',   'trimac.com',            'Trucking',   'AB', 'large',      'Bulk liquid and dry bulk transportation.', 'https://www.trimac.com/careers'),
  ('Bison Transport',         'bisontransport.com',    'Trucking',   'MB', 'large',      'Refrigerated and dry van trucking.', 'https://www.bisontransport.com/careers')
ON CONFLICT DO NOTHING;
