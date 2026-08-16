-- 128_job_hunt_target_companies_city.sql
-- Job Hunt module, seventh artifact (2026-08-15): city-level filtering for
-- Companies. Real city data researched per-company (not invented) via web
-- search, verified against company/news sources:
--   Bombardier -> Dorval QC (bombardier.com worldwide-presence)
--   CAE Inc. -> Saint-Laurent (Montreal) QC (cae.com/contact-us, Apple Maps listing)
--   Cascade Aerospace -> Abbotsford BC (Abbotsford Chamber of Commerce, D&B)
--   KF Aerospace -> Kelowna BC (Wikipedia, founded there 1970)
--   MDA Space -> Brampton ON (mda.space press release on new global HQ)
--   Pratt & Whitney Canada -> Longueuil QC (Wikipedia)
--   StandardAero -> Winnipeg MB (major Canadian hub / founding city; global
--     corporate HQ has since moved to Scottsdale, AZ per 2026 filings, but
--     province in this table is already MB, so city reflects the intended
--     Canadian anchor, not the US corporate address)
--   Viking Air -> North Saanich BC (Wikipedia, Sidney/Victoria area)
--   Draganfly -> Saskatoon SK (draganfly.com press releases, CBC News)
--   Percepto -> left NULL. Actually headquartered in Modiin-Maccabim-Reut,
--     Israel; its only Canadian presence is a drone-inspection partnership
--     with Ontario Power Generation, not an office. Inventing a city would
--     be wrong, so it's blank -- flagged to the operator as a seed-data
--     quality issue (this company arguably doesn't belong on a "Canadian
--     target companies" watchlist at all; left in place, not removed,
--     pending operator direction).
--   Cohere -> Toronto ON
--   D2L -> Kitchener ON
--   Hootsuite -> Vancouver BC (Wikipedia)
--   Lightspeed Commerce -> Montreal QC (Wikipedia)
--   Shopify -> Ottawa ON (official registered head office, 151 O'Connor St —
--     note Shopify shifted to "remote-first" post-2020 and vacated its
--     iconic 150 Elgin St building, but Ottawa remains the registered HQ)
--   Wealthsimple -> Toronto ON
--   Bison Transport -> Winnipeg MB (bisontransport.com contact page)
--   Challenger Motor Freight -> Cambridge ON (challenger.com)
--   Day & Ross -> Hartland NB (dayross.com, BBB listing)
--   Mullen Group -> Okotoks AB (mullen-group.com corporate profile)
--   TFI International -> Saint-Laurent (Montreal) QC (D&B, Wikipedia)
--   Trimac Transportation -> Calgary AB (trimac.com, Bulk Transporter)

ALTER TABLE target_companies ADD COLUMN IF NOT EXISTS city TEXT;

UPDATE target_companies SET city = 'Dorval' WHERE name = 'Bombardier';
UPDATE target_companies SET city = 'Saint-Laurent (Montreal)' WHERE name = 'CAE Inc.';
UPDATE target_companies SET city = 'Abbotsford' WHERE name = 'Cascade Aerospace';
UPDATE target_companies SET city = 'Kelowna' WHERE name = 'KF Aerospace';
UPDATE target_companies SET city = 'Brampton' WHERE name = 'MDA Space';
UPDATE target_companies SET city = 'Longueuil' WHERE name = 'Pratt & Whitney Canada';
UPDATE target_companies SET city = 'Winnipeg' WHERE name = 'StandardAero';
UPDATE target_companies SET city = 'North Saanich' WHERE name = 'Viking Air';
UPDATE target_companies SET city = 'Saskatoon' WHERE name = 'Draganfly';
-- Percepto intentionally left NULL -- see comment above.
UPDATE target_companies SET city = 'Toronto' WHERE name = 'Cohere';
UPDATE target_companies SET city = 'Kitchener' WHERE name = 'D2L';
UPDATE target_companies SET city = 'Vancouver' WHERE name = 'Hootsuite';
UPDATE target_companies SET city = 'Montreal' WHERE name = 'Lightspeed Commerce';
UPDATE target_companies SET city = 'Ottawa' WHERE name = 'Shopify';
UPDATE target_companies SET city = 'Toronto' WHERE name = 'Wealthsimple';
UPDATE target_companies SET city = 'Winnipeg' WHERE name = 'Bison Transport';
UPDATE target_companies SET city = 'Cambridge' WHERE name = 'Challenger Motor Freight';
UPDATE target_companies SET city = 'Hartland' WHERE name = 'Day & Ross';
UPDATE target_companies SET city = 'Okotoks' WHERE name = 'Mullen Group';
UPDATE target_companies SET city = 'Saint-Laurent (Montreal)' WHERE name = 'TFI International';
UPDATE target_companies SET city = 'Calgary' WHERE name = 'Trimac Transportation';

CREATE INDEX IF NOT EXISTS idx_target_companies_city ON target_companies (city);
