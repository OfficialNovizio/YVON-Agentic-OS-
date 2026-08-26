-- 129_job_hunt_target_companies_expand.sql
-- Job Hunt module (2026-08-15): expands the target_companies watchlist from
-- the original 22-company hand-picked seed (which had ZERO "Business"
-- industry companies and only 2 "Drone" companies) to a broader, still
-- entirely real/sourced set. This is NOT a comprehensive "thousands of
-- companies" directory — no free/legitimate API provides that for Canada
-- (checked: OpenCorporates free tier is 50 req/day and isn't browsable by
-- industry; Statistics Canada's open "Canadian Business Counts" dataset is
-- aggregate counts only, no company names). This batch is manually
-- researched via web search against public sources (Wikipedia's "Aerospace
-- companies of Canada" category, AIAC member directory, Built In industry
-- lists, Truck News/Statista trucking rankings, and general public
-- knowledge of well-known Canadian companies), same non-fabrication
-- standard as the original 22.
--
-- Known gaps, left NULL rather than guessed (matches the Percepto pattern
-- from migration 128):
--   - domain / careers_url: left NULL for every row in this batch. Verifying
--     an exact live domain + careers page URL for ~70 companies wasn't done
--     to a confidence bar worth shipping; flagged here as a follow-up
--     enrichment pass rather than invented.
--   - NordSpace (Aerospace) and Volatus Aerospace (Drone): province is
--     confident (ON) but the specific HQ city wasn't confidently sourced,
--     so city is left NULL.
--
-- Sources consulted: en.wikipedia.org/wiki/Category:Aerospace_companies_of_Canada,
-- aiac.ca/membership/member-directory, builtin.com "Aerospace/IT Companies
-- in Canada" lists, trucknews.com "Canada's biggest truck fleets", public
-- company knowledge for major banks/insurers/consultancies (RBC, TD, BMO,
-- Scotiabank, CIBC, Manulife, Sun Life, Deloitte/EY/KPMG/PwC Canada, etc.)

-- ── AEROSPACE (+15) ──────────────────────────────────────────────────────
INSERT INTO target_companies (name, industry, province, city, size, description, is_watching) VALUES
('Héroux-Devtek', 'Aerospace', 'QC', 'Longueuil', 'large', 'Landing gear and actuation systems manufacturer, TSX-listed.', false),
('Magellan Aerospace', 'Aerospace', 'ON', 'Mississauga', 'large', 'Aerostructures, engine and defence components manufacturer.', false),
('CMC Electronics', 'Aerospace', 'QC', 'Saint-Laurent (Montreal)', 'medium', 'Avionics and flight deck systems manufacturer.', false),
('Thales Canada', 'Aerospace', 'ON', 'Ottawa', 'large', 'Defence, aerospace and rail electronics; Canadian HQ of the French multinational.', false),
('Airbus Defence and Space Canada', 'Aerospace', 'ON', 'Ottawa', 'medium', 'Airbus''s Canadian defence and space division.', false),
('Airbus Helicopters Canada', 'Aerospace', 'ON', 'Fort Erie', 'medium', 'Airbus''s Canadian helicopter support and completions centre.', false),
('Diamond Aircraft Industries', 'Aerospace', 'ON', 'London', 'medium', 'General aviation and trainer aircraft manufacturer.', false),
('IMP Aerospace & Defence', 'Aerospace', 'NS', 'Halifax', 'large', 'Aircraft MRO and in-service support, part of IMP Group.', false),
('Avcorp Industries', 'Aerospace', 'BC', 'Delta', 'medium', 'Aerostructures manufacturer for commercial and defence aircraft.', false),
('Bristol Aerospace (Magellan Aerospace)', 'Aerospace', 'MB', 'Winnipeg', 'medium', 'Magellan Aerospace''s Winnipeg aerostructures and space division.', false),
('Boeing Canada', 'Aerospace', 'MB', 'Winnipeg', 'large', 'Boeing''s Canadian composite manufacturing operations.', false),
('Maritime Launch Services', 'Aerospace', 'NS', 'Halifax', 'small', 'Commercial orbital launch services company; spaceport near Canso, NS.', false),
('Honeywell Aerospace Cambridge', 'Aerospace', 'ON', 'Cambridge', 'medium', 'Honeywell''s Canadian aerospace manufacturing facility.', false),
('Mission Control Space Services', 'Aerospace', 'ON', 'Ottawa', 'startup', 'Space robotics and AI / mission operations software.', false),
('NordSpace', 'Aerospace', 'ON', NULL, 'startup', 'Canadian launch vehicle and space systems startup.', false);

-- ── IT (+16) ─────────────────────────────────────────────────────────────
INSERT INTO target_companies (name, industry, province, city, size, description, is_watching) VALUES
('OpenText', 'IT', 'ON', 'Waterloo', 'enterprise', 'Enterprise information management software.', false),
('BlackBerry', 'IT', 'ON', 'Waterloo', 'large', 'Cybersecurity and embedded software (QNX), formerly the smartphone maker.', false),
('CGI Inc.', 'IT', 'QC', 'Montreal', 'enterprise', 'IT and business consulting services; one of the world''s largest independent IT firms.', false),
('Constellation Software', 'IT', 'ON', 'Toronto', 'enterprise', 'Acquires and operates vertical market software businesses.', false),
('Kinaxis', 'IT', 'ON', 'Ottawa', 'large', 'Supply chain management and planning software (RapidResponse).', false),
('Nuvei', 'IT', 'QC', 'Montreal', 'large', 'Payment technology and processing platform.', false),
('Coveo', 'IT', 'QC', 'Quebec City', 'medium', 'AI-powered search and relevance software.', false),
('Vidyard', 'IT', 'ON', 'Kitchener', 'medium', 'Video hosting and sales engagement platform.', false),
('Auvik Networks', 'IT', 'ON', 'Waterloo', 'medium', 'Cloud-based network management software.', false),
('FreshBooks', 'IT', 'ON', 'Toronto', 'medium', 'Cloud accounting software for small businesses.', false),
('Klue', 'IT', 'BC', 'Vancouver', 'small', 'Competitive intelligence software.', false),
('Clio', 'IT', 'BC', 'Vancouver', 'large', 'Legal practice management software.', false),
('Trulioo', 'IT', 'BC', 'Vancouver', 'medium', 'Identity verification and KYC platform.', false),
('1Password', 'IT', 'ON', 'Toronto', 'large', 'Password manager and secrets management platform.', false),
('Wattpad', 'IT', 'ON', 'Toronto', 'medium', 'Online storytelling and reading platform, owned by Naver''s WEBTOON.', false),
('Ada', 'IT', 'ON', 'Toronto', 'medium', 'AI-powered customer service automation platform.', false);

-- ── TRUCKING (+11) ───────────────────────────────────────────────────────
INSERT INTO target_companies (name, industry, province, city, size, description, is_watching) VALUES
('Manitoulin Transport', 'Trucking', 'ON', 'Gogama', 'medium', 'Less-than-truckload and logistics carrier, part of the Manitoulin Group of Companies.', false),
('Kriska Transportation Group', 'Trucking', 'ON', 'Prescott', 'medium', 'Truckload and dedicated freight carrier.', false),
('Erb Transport', 'Trucking', 'ON', 'New Hamburg', 'medium', 'Refrigerated and dry van trucking, part of the Erb Group.', false),
('Groupe Robert', 'Trucking', 'QC', 'Boucherville', 'large', 'Freight transportation and logistics, one of Quebec''s largest carriers.', false),
('Canada Cartage', 'Trucking', 'ON', 'Mississauga', 'large', 'Dedicated fleet, LTL and logistics services.', false),
('Yanke Group of Companies', 'Trucking', 'SK', 'Saskatoon', 'medium', 'Prairie-based trucking and logistics carrier.', false),
('Big Freight Systems', 'Trucking', 'MB', 'Winnipeg', 'medium', 'Truckload carrier, part of TFI International.', false),
('Kindersley Transport', 'Trucking', 'SK', 'Kindersley', 'medium', 'Refrigerated and dry freight carrier.', false),
('Vedder Transport', 'Trucking', 'BC', 'Abbotsford', 'medium', 'Bulk liquid and food-grade tank truck carrier.', false),
('XTL Transport', 'Trucking', 'QC', 'Delson', 'medium', 'Trucking and transportation holding company.', false),
('Paul''s Hauling', 'Trucking', 'AB', 'Acheson', 'medium', 'Heavy haul and specialized trucking.', false);

-- ── DRONE (+7) ───────────────────────────────────────────────────────────
INSERT INTO target_companies (name, industry, province, city, size, description, is_watching) VALUES
('Aeryon Labs', 'Drone', 'ON', 'Waterloo', 'small', 'Small unmanned aircraft systems maker, now part of Teledyne FLIR.', false),
('Tyto Robotics', 'Drone', 'QC', 'Gatineau', 'startup', 'Propulsion testing hardware/software for drones (formerly RCbenchmark).', false),
('ARA Robotics', 'Drone', 'QC', 'Montreal', 'startup', 'Drone and robotics technology developer.', false),
('Volatus Aerospace', 'Drone', 'ON', NULL, 'medium', 'Drone services, training and BVLOS operations.', false),
('AirMatrix', 'Drone', 'ON', 'Toronto', 'startup', 'Airspace management software for urban drone operations.', false),
('SkyX', 'Drone', 'ON', 'Toronto', 'startup', 'Long-range autonomous drone inspection systems.', false),
('MicroPilot', 'Drone', 'MB', 'Stony Mountain', 'small', 'Autopilot systems for fixed-wing UAVs.', false);

-- ── BUSINESS (+20, was 0) ────────────────────────────────────────────────
INSERT INTO target_companies (name, industry, province, city, size, description, is_watching) VALUES
('Royal Bank of Canada', 'Business', 'ON', 'Toronto', 'enterprise', 'Canada''s largest bank by market capitalization.', false),
('Toronto-Dominion Bank', 'Business', 'ON', 'Toronto', 'enterprise', 'Major Canadian bank.', false),
('Bank of Montreal', 'Business', 'QC', 'Montreal', 'enterprise', 'Canada''s oldest bank; registered head office in Montreal.', false),
('Scotiabank', 'Business', 'ON', 'Toronto', 'enterprise', 'Major Canadian bank with large international presence.', false),
('CIBC', 'Business', 'ON', 'Toronto', 'enterprise', 'Major Canadian bank.', false),
('Manulife', 'Business', 'ON', 'Toronto', 'enterprise', 'Insurance and financial services.', false),
('Sun Life Financial', 'Business', 'ON', 'Toronto', 'enterprise', 'Insurance and asset management.', false),
('Great-West Lifeco', 'Business', 'MB', 'Winnipeg', 'enterprise', 'Insurance and financial services holding company.', false),
('Deloitte Canada', 'Business', 'ON', 'Toronto', 'large', 'Professional services and consulting.', false),
('EY Canada', 'Business', 'ON', 'Toronto', 'large', 'Professional services and consulting.', false),
('KPMG Canada', 'Business', 'ON', 'Toronto', 'large', 'Professional services and consulting.', false),
('PwC Canada', 'Business', 'ON', 'Toronto', 'large', 'Professional services and consulting.', false),
('George Weston Limited', 'Business', 'ON', 'Toronto', 'enterprise', 'Food processing and distribution holding company (Loblaw parent).', false),
('Power Corporation of Canada', 'Business', 'QC', 'Montreal', 'enterprise', 'Diversified international management and holding company.', false),
('Canadian Tire Corporation', 'Business', 'ON', 'Toronto', 'enterprise', 'Retail, financial services and automotive.', false),
('Loblaw Companies', 'Business', 'ON', 'Toronto', 'enterprise', 'Canada''s largest food and pharmacy retailer.', false),
('Magna International', 'Business', 'ON', 'Aurora', 'enterprise', 'Automotive parts and mobility technology manufacturer.', false),
('Brookfield Corporation', 'Business', 'ON', 'Toronto', 'enterprise', 'Global alternative asset management.', false),
('Onex Corporation', 'Business', 'ON', 'Toronto', 'large', 'Private equity and asset management.', false),
('Canadian National Railway (CN)', 'Business', 'QC', 'Montreal', 'enterprise', 'Class I freight railway.', false);
