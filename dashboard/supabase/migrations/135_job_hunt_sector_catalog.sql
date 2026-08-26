-- 135_job_hunt_sector_catalog.sql
-- Job Hunt — Sector Explorer (2026-08-25).
-- A curated sector catalog with demand/pay/PR signals. Selecting sectors on
-- the Explorer page writes job_hunt_sync_queries (the single source of truth
-- for sync keywords) — so Discover, the sync engines, resume variants, PR
-- tagging, and filters all follow one selection.

CREATE TABLE IF NOT EXISTS job_hunt_sector_catalog (
  id           TEXT PRIMARY KEY,              -- sector key (e.g. 'software-engineering')
  name         TEXT NOT NULL,                 -- display name ("Software Engineering")
  keywords     JSONB NOT NULL DEFAULT '[]'::jsonb,  -- sync query keywords
  description  TEXT,
  demand       TEXT,                          -- 'high' | 'medium' | 'low' (curated + live-adjusted)
  typical_pay  TEXT,                          -- display range e.g. "$90K–$140K CAD"
  pr_value     TEXT,                          -- 'excellent' | 'good' | 'moderate' (BC PNP / TEER heuristics)
  teer         TEXT,                          -- typical TEER category
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE job_hunt_sector_catalog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "job_hunt_sector_catalog_select_authenticated" ON job_hunt_sector_catalog
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "job_hunt_sector_catalog_all_service_role" ON job_hunt_sector_catalog
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Curated seed — demand/pay/PR signals are best-effort, based on the same
-- heuristics the engine uses; the Explorer page adds LIVE posting counts on
-- top so "demand" reflects what's actually being pulled.
INSERT INTO job_hunt_sector_catalog (id, name, keywords, description, demand, typical_pay, pr_value, teer) VALUES
  ('software-engineering', 'Software Engineering', '["software engineer","full stack developer","backend developer","frontend developer"]', 'Building and maintaining software — the broadest, highest-demand tech sector.', 'high', '$95K–$160K CAD', 'excellent', '1'),
  ('data-ai', 'Data & AI', '["data scientist","machine learning","data engineer","ai engineer"]', 'Data science, ML, and AI engineering — strong BC tech hub demand.', 'high', '$100K–$170K CAD', 'excellent', '1'),
  ('cloud-devops', 'Cloud & DevOps', '["devops","cloud engineer","site reliability","platform engineer"]', 'Infrastructure, cloud, and reliability engineering.', 'high', '$95K–$160K CAD', 'excellent', '1'),
  ('cybersecurity', 'Cybersecurity', '["security engineer","cyber security","infosec","penetration tester"]', 'Security engineering and analysis — consistently in demand.', 'high', '$95K–$165K CAD', 'excellent', '1'),
  ('product-design', 'Product & Design', '["product manager","product designer","ux designer","ui designer"]', 'Product management and UX/UI design.', 'medium', '$80K–$140K CAD', 'good', '1'),
  ('aerospace', 'Aerospace', '["aerospace engineer","aircraft maintenance","aviation","aeronautics"]', 'Aerospace engineering and aviation — a BC signature industry.', 'medium', '$80K–$140K CAD', 'good', '1'),
  ('drone-robotics', 'Drone & Robotics', '["drone operator","uav","robotics engineer","unmanned aerial"]', 'Drones, UAVs, and robotics — niche but high PR value.', 'medium', '$75K–$130K CAD', 'good', '1'),
  ('trucking-logistics', 'Trucking & Logistics', '["truck driver","dispatcher","logistics coordinator","freight"]', 'Driving, dispatch, and logistics — steady demand, PR-relevant trades.', 'high', '$50K–$85K CAD', 'good', '3'),
  ('trades-skilled', 'Skilled Trades', '["electrician","welder","carpenter","plumber","mechanic"]', 'Skilled trades — strong BC PNP relevance, consistently needed.', 'high', '$55K–$95K CAD', 'excellent', '2'),
  ('healthcare', 'Healthcare', '["registered nurse","nurse","medical assistant","healthcare"]', 'Nursing and healthcare support — highest-demand, PR-strong sector.', 'high', '$55K–$95K CAD', 'excellent', '2'),
  ('finance-accounting', 'Finance & Accounting', '["accountant","financial analyst","bookkeeper"]', 'Accounting and financial analysis.', 'medium', '$60K–$110K CAD', 'good', '1'),
  ('business-ops', 'Business & Operations', '["business analyst","operations manager","project manager","account manager"]', 'Business analysis, operations, and project management — the generic catch-all.', 'medium', '$65K–$120K CAD', 'moderate', '1')
ON CONFLICT (id) DO NOTHING;
