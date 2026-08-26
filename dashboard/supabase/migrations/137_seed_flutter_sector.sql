-- 137_seed_flutter_sector.sql
-- Job Hunt — web-researched seed for the on-the-fly "Flutter" sector (2026-08-25).
-- Research (web, 2026-08-25):
--   Pay: Glassdoor CA — Flutter Engineer avg ~$89K, range $68K–$120K (top ~$161K);
--        ZipRecruiter — $86K–$120K, top ~$136K; Vancouver posted role $80K–$100K.
--   Demand: ~50 Flutter mobile + ~40 Flutter developer jobs active in Canada (Glassdoor, Aug 2026).
--   PR: NOC 21232 (software engineers/designers) → TEER 1, BC PNP Tech eligible.
-- Keep `custom = true` so the UI still labels it as user-created.

INSERT INTO job_hunt_sector_catalog (id, name, keywords, description, demand, typical_pay, pr_value, teer, custom) VALUES
('custom-flutter', 'Flutter',
 '["flutter","flutter developer","flutter engineer","flutter app development","dart","cross-platform mobile"]',
 'Cross-platform mobile development with Flutter/Dart — one codebase for iOS and Android, steady Canadian demand and strong remote-friendliness.',
 'medium', '$85K–$135K CAD', 'good', '1', true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  keywords = EXCLUDED.keywords,
  description = EXCLUDED.description,
  demand = EXCLUDED.demand,
  typical_pay = EXCLUDED.typical_pay,
  pr_value = EXCLUDED.pr_value,
  teer = EXCLUDED.teer,
  custom = EXCLUDED.custom;
