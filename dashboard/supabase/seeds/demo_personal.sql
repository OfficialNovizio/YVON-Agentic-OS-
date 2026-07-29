-- ─────────────────────────────────────────────────────────────────────────────
-- Personal Dashboard — Demo Seed Data
-- Run this in Supabase SQL Editor (one paste, one click)
-- Safe to re-run: clears existing rows first, then inserts fresh demo data
-- ─────────────────────────────────────────────────────────────────────────────

-- Clear existing data (order matters for FK constraints)
DELETE FROM contact_interactions;
DELETE FROM network_contacts;
DELETE FROM post_ideas;
DELETE FROM linkedin_posts;
DELETE FROM job_applications;
DELETE FROM resumes;

-- ── Resumes ───────────────────────────────────────────────────────────────────
INSERT INTO resumes (name, industry_tag, file_url, version, created_at) VALUES
  ('Aerospace Engineer — Systems Focus',  'Aerospace', 'https://storage.example.com/resumes/aerospace-v2.pdf', 2, now() - interval '60 days'),
  ('Software Developer — Full Stack',     'IT',        'https://storage.example.com/resumes/sw-dev-v3.pdf',   3, now() - interval '30 days'),
  ('MBA / Strategy & Product',            'Business',  'https://storage.example.com/resumes/mba-v1.pdf',     1, now() - interval '45 days'),
  ('Drone & UAV Systems',                 'Drone',     'https://storage.example.com/resumes/drone-v1.pdf',   1, now() - interval '15 days');


-- ── Job Applications ──────────────────────────────────────────────────────────
INSERT INTO job_applications
  (title, company, industry, province, location_type, salary_min, salary_max, source, status, applied_at, match_score, notes, created_at)
VALUES
  ('Aircraft Systems Engineer',         'CAE Inc.',              'Aerospace', 'QC', 'hybrid',  90000, 120000, 'LinkedIn',      'interview',  (now() - interval '18 days')::timestamptz, 88, '2nd round scheduled. Great cultural fit — simulation background is strong match.',   now() - interval '25 days'),
  ('Flight Simulation Developer',       'L3Harris Canada',       'Aerospace', 'QC', 'onsite',  85000, 115000, 'Indeed',        'applied',    (now() - interval '12 days')::timestamptz, 79, 'Role posted last week. Tailored resume sent.',                                        now() - interval '12 days'),
  ('Systems Engineering Specialist',    'MDA Space',             'Aerospace', 'ON', 'hybrid', 110000, 145000, 'LinkedIn',      'saved',      NULL,                                      85, 'Dream role — need to tailor resume and get a warm intro through Ryan Thompson.',       now() - interval '3 days'),
  ('Aviation Safety Analyst',           'Transport Canada',      'Aerospace', 'ON', 'hybrid',  78000, 105000, 'Government',   'closed',     (now() - interval '45 days')::timestamptz, 74, 'Rejected — preferred bilingual candidate. Good experience for future GC apps.',        now() - interval '50 days'),
  ('Senior Software Engineer',          'Shopify',               'IT',        'ON', 'remote', 130000, 170000, 'LinkedIn',      'applied',    (now() - interval '7 days')::timestamptz,  72, 'Recruiter Priya Sharma confirmed application is with the hiring team.',               now() - interval '7 days'),
  ('Full Stack Engineer',               'Cohere',                'IT',        'ON', 'remote', 140000, 185000, 'LinkedIn',      'saved',      NULL,                                      68, 'Would need to brush up on ML. Could be worth a moonshot application.',                now() - interval '5 days'),
  ('Product Engineer',                  'Wealthsimple',          'IT',        'ON', 'hybrid', 120000, 155000, 'LinkedIn',      'closed',     (now() - interval '60 days')::timestamptz, 65, 'Not selected after final round. Good process experience, asked for feedback.',         now() - interval '65 days'),
  ('Logistics Platform Developer',      'TFI International',     'Trucking',  'QC', 'hybrid',  95000, 125000, 'Referral',      'interview',  (now() - interval '20 days')::timestamptz, 91, 'Referred by James Wilson. Panel interview next week with CTO.',                        now() - interval '28 days'),
  ('Dispatch Systems Engineer',         'Bison Transport',       'Trucking',  'MB', 'remote',  90000, 120000, 'Indeed',        'applied',    (now() - interval '10 days')::timestamptz, 76, NULL,                                                                                  now() - interval '10 days'),
  ('Platform Software Developer',       'Percepto',              'Drone',     'ON', 'remote',  95000, 130000, 'Referral',      'interview',  (now() - interval '15 days')::timestamptz, 86, 'Referred by Marcus Lee. Passed technical screen — culture fit round pending.',         now() - interval '20 days'),
  ('UAV Systems Engineer',              'Draganfly',             'Drone',     'SK', 'remote',  85000, 110000, 'LinkedIn',      'applied',    (now() - interval '3 days')::timestamptz,  82, NULL,                                                                                  now() - interval '3 days'),
  ('Engineering Manager',               'StandardAero',          'Aerospace', 'MB', 'onsite', 105000, 140000, 'LinkedIn',      'applied',    (now() - interval '8 days')::timestamptz,  70, 'Stretch role — management track. Mentor Michael Torres encouraged applying.',          now() - interval '8 days');


-- ── LinkedIn Posts ─────────────────────────────────────────────────────────────
-- 11 published (spread across 8 weeks), 2 scheduled, 2 drafts
INSERT INTO linkedin_posts
  (content, industry_tag, tone, format, status, scheduled_date, published_at, impressions, likes, comments, shares, created_at)
VALUES

  -- ── W8 (current week) ──────────────────────────────────────────────────────
  (
    E'3 years ago I could barely read a dispatch manifest.\n\nNow I''m building the software that runs operations for 400+ trucks.\n\nThe engineering degree taught me systems thinking.\nThe trucking job taught me that real systems run on humans under pressure — not flowcharts.\n\nHere''s what I wish someone told me on day one:',
    'Trucking', 'story', 'text', 'published', NULL,
    (now() - interval '2 days')::timestamptz, 3240, 187, 42, 18, now() - interval '3 days'
  ),
  (
    E'Hot take: most "AI-powered logistics" startups are just dashboards with a ChatGPT API call.\n\nReal logistics optimization needs:\n→ Live GPS + traffic feeds\n→ HOS compliance rules by province\n→ Driver behaviour patterns\n→ Fuel cost models\n→ Customer SLA contracts\n\nThe AI is the easy part. The data pipeline is the moat.',
    'IT', 'hot_take', 'text', 'published', NULL,
    (now() - interval '4 days')::timestamptz, 5870, 312, 89, 67, now() - interval '5 days'
  ),

  -- ── W7 ──────────────────────────────────────────────────────────────────────
  (
    E'I spent 6 months in my MBA thinking finance was the "real" part of business.\n\nThen I built Hourbour and realized: the real part is who picks up the phone.\n\nRevenue forecasting is easy. Collecting cash from small business clients in a credit crunch? That''s the MBA they don''t teach you.',
    'Business', 'insight', 'text', 'published', NULL,
    (now() - interval '9 days')::timestamptz, 2890, 143, 31, 12, now() - interval '10 days'
  ),

  -- ── W6 ──────────────────────────────────────────────────────────────────────
  (
    E'The Canadarm revolutionized space robotics in 1981.\n\nMDA Space is building Canadarm3 right now — for the Gateway lunar station.\n\nAs a Canadian engineer this makes me irrationally proud. We punch far above our weight in space robotics and most people have no idea.\n\nWhat''s your favourite underrated Canadian engineering achievement?',
    'Aerospace', 'question', 'text', 'published', NULL,
    (now() - interval '16 days')::timestamptz, 4120, 228, 74, 33, now() - interval '17 days'
  ),
  (
    E'Data point that changed how I think about sustainable fashion:\n\n47% of "eco-friendly" clothing claims in Canada have no verifiable certification backing them.\n\nAt Novizio we made a hard call early: no claim without documentation. It slows us down. It also means every product page we publish is defensible.',
    'Business', 'data', 'text', 'published', NULL,
    (now() - interval '18 days')::timestamptz, 1870, 98, 19, 8, now() - interval '19 days'
  ),

  -- ── W5 ──────────────────────────────────────────────────────────────────────
  (
    E'Behind the scenes of building a fintech in Canada:\n\nMonth 1: Read FINTRAC requirements (150+ pages)\nMonth 2: Find a bank willing to open a business account\nMonth 3: Payment processor flags you as "high risk"\nMonth 4: Rebuild onboarding from scratch for compliance\n\nNobody talks about this part. It''s very real.',
    'IT', 'behind_scenes', 'text', 'published', NULL,
    (now() - interval '23 days')::timestamptz, 7340, 441, 112, 89, now() - interval '24 days'
  ),

  -- ── W4 ──────────────────────────────────────────────────────────────────────
  (
    E'The drone delivery race isn''t about the drones.\n\nIt''s about airspace management software.\n\nTransport Canada''s RPAS regulations are actually more advanced than the FAA''s on several key dimensions. Canada has a quiet first-mover advantage most people in the industry are sleeping on.',
    'Drone', 'insight', 'text', 'published', NULL,
    (now() - interval '30 days')::timestamptz, 3650, 201, 57, 24, now() - interval '31 days'
  ),
  (
    E'A mentor told me once: "Your engineering brain will fight your business instincts. Let them fight. The best decisions come from that tension."\n\nBest advice I''ve received in 10 years.\n\nWho gave you advice that took years to fully understand?',
    'Business', 'story', 'text', 'published', NULL,
    (now() - interval '33 days')::timestamptz, 6210, 389, 97, 41, now() - interval '34 days'
  ),

  -- ── W2 ──────────────────────────────────────────────────────────────────────
  (
    E'Aircraft engineering taught me to never trust a single point of failure.\n\nI apply that same mental model to every software system I build.\n\nRedundancy isn''t expensive. Downtime is.',
    'Aerospace', 'bridging', 'text', 'published', NULL,
    (now() - interval '46 days')::timestamptz, 2340, 121, 28, 15, now() - interval '47 days'
  ),

  -- ── Older published ─────────────────────────────────────────────────────────
  (
    E'6 things I learned building software at a trucking company:\n\n1. The "user" is a dispatcher managing 30 calls/hour\n2. Every field you add is a field they fill under pressure\n3. GPS data is messy. Very messy.\n4. Drivers and dispatchers have completely different mental models\n5. Your uptime SLA means nothing during a holiday weekend blizzard\n6. The best feature you can ship is fewer clicks',
    'Trucking', 'data', 'text', 'published', NULL,
    (now() - interval '55 days')::timestamptz, 9840, 612, 178, 134, now() - interval '56 days'
  ),
  (
    E'I''m building two companies while job hunting in aerospace.\n\nMost people think that''s unfocused. I think it''s leverage.\n\nEvery venture decision informs how I evaluate employers. Every aerospace interview refines how I think about product-market fit.\n\nThe cross-pollination is the strategy.',
    'Business', 'insight', 'text', 'published', NULL,
    (now() - interval '62 days')::timestamptz, 4780, 267, 61, 29, now() - interval '63 days'
  ),

  -- ── Scheduled ───────────────────────────────────────────────────────────────
  (
    E'The moment I realized sustainable fashion wasn''t a niche — it was the only direction retail was heading (and most brands aren''t ready)',
    'Business', 'story', 'text', 'scheduled',
    (now() + interval '3 days')::date, NULL, 0, 0, 0, 0, now() - interval '1 day'
  ),
  (
    E'Why fintech in Canada is harder than the US — and why that''s actually great for founders who survive it',
    'IT', 'hot_take', 'text', 'scheduled',
    (now() + interval '8 days')::date, NULL, 0, 0, 0, 0, now() - interval '2 days'
  ),

  -- ── Drafts ──────────────────────────────────────────────────────────────────
  (
    E'The three engineering principles I apply to every business decision...',
    'Aerospace', 'insight', 'text', 'draft', NULL, NULL, 0, 0, 0, 0, now() - interval '1 day'
  ),
  (
    E'RPAS regulation changes coming in Q3 — what drone operators need to know before the deadline',
    'Drone', 'data', 'text', 'draft', NULL, NULL, 0, 0, 0, 0, now() - interval '4 days'
  );


-- ── Post Ideas ────────────────────────────────────────────────────────────────
INSERT INTO post_ideas (topic, industry_tag, rough_idea, status, created_at) VALUES
  ('The hidden cost of ghost jobs in Canadian aerospace hiring',
   'Aerospace',
   'Many aerospace postings stay live months after being filled internally. From my job hunt + inside perspective on hiring freezes at major OEMs.',
   'new', now() - interval '5 days'),

  ('Why Canadian fintech founders face 3x more compliance friction than US peers',
   'IT',
   'FINTRAC + PIPEDA + provincial securities law — the regulatory stack that kills early-stage fintech velocity. Personal Hourbour experience.',
   'new', now() - interval '8 days'),

  ('What 2 years of dispatch software taught me about human-computer interaction',
   'Trucking',
   'Dispatchers as power users: UX lessons from watching pros navigate high-stakes interfaces under time pressure.',
   'drafted', now() - interval '15 days'),

  ('Transport Canada RPAS 2024 changes: what operators are getting wrong',
   'Drone',
   'New drone reg updates and the 3 most common compliance mistakes I see operators making.',
   'new', now() - interval '3 days'),

  ('The MBA moment that changed how I think about product',
   'Business',
   'A specific case study where the "right" financial answer was wrong from a customer perspective. Tension between IRR and NPS.',
   'new', now() - interval '20 days'),

  ('Building sustainable supply chains: what fashion can learn from aerospace',
   'Business',
   'Aerospace has strict traceability requirements (AS9100). Fashion has almost none. Cross-industry thinking for Novizio.',
   'new', now() - interval '12 days'),

  ('Why I''m betting on Canada for aerospace innovation (despite the brain drain)',
   'Aerospace',
   'Counter-narrative. Brain drain is real but so is the talent that stays + government investment in MDA, CAE, Pratt. Data-driven.',
   'drafted', now() - interval '25 days'),

  ('The 5 dispatch tools I wish existed when I was building trucking software',
   'Trucking',
   'Tool gap analysis from an engineer''s perspective. Attracts trucking tech audience + potential Hourbour customers.',
   'new', now() - interval '7 days');


-- ── Network Contacts ──────────────────────────────────────────────────────────
-- Using fixed UUIDs so interactions can reference them reliably
INSERT INTO network_contacts
  (id, name, title, company, industry_tag, linkedin_url, email, location, how_met,
   relationship_type, relationship_strength, venture_slug, notes,
   last_contacted, next_action, next_action_date, created_at)
VALUES

  ('a1000000-0000-0000-0000-000000000001',
   'Sarah Chen', 'Senior Aircraft Systems Engineer', 'CAE Inc.', 'Aerospace',
   'https://linkedin.com/in/sarah-chen-cae', 'sarah.chen@example.com',
   'Montreal, QC', 'Conference', 'peer', 'building', NULL,
   'Met at AIAC conference. Works on similar simulation systems. Offered to put in a word with the hiring manager.',
   (now() - interval '5 days')::date,
   'Send thank-you after CAE 2nd round interview',
   (now() + interval '2 days')::date,
   now() - interval '45 days'),

  ('a1000000-0000-0000-0000-000000000002',
   'Michael Torres', 'Engineering Manager', 'Bombardier', 'Aerospace',
   'https://linkedin.com/in/michael-torres-bombardier', NULL,
   'Montreal, QC', 'LinkedIn', 'mentor', 'strong', NULL,
   'Monthly mentorship sessions. Helped reshape resume for aerospace+SW hybrid profile. Extremely generous with his network.',
   (now() - interval '12 days')::date,
   'Monthly coffee check-in',
   (now() + interval '5 days')::date,
   now() - interval '90 days'),

  ('a1000000-0000-0000-0000-000000000003',
   'Priya Sharma', 'Senior Technical Recruiter', 'Shopify', 'IT',
   'https://linkedin.com/in/priya-sharma-shopify', 'priya.sharma@example.com',
   'Toronto, ON', 'LinkedIn', 'recruiter', 'building', NULL,
   'Reached out about SW Engineer role. Very responsive. Has 3 open roles. Application now with hiring team.',
   (now() - interval '3 days')::date,
   'Follow up on Shopify application status',
   (now() + interval '1 days')::date,
   now() - interval '30 days'),

  ('a1000000-0000-0000-0000-000000000004',
   'James Wilson', 'VP Engineering', 'TFI International', 'Trucking',
   'https://linkedin.com/in/james-wilson-tfi', NULL,
   'Quebec City, QC', 'Work', 'peer', 'strong', 'hourbour',
   'Former client from trucking SW days. Big Hourbour champion — pushing internally for a pilot. Referred me for TFI engineering role.',
   (now() - interval '8 days')::date,
   'Follow up on TFI pilot proposal',
   (now() + interval '4 days')::date,
   now() - interval '60 days'),

  ('a1000000-0000-0000-0000-000000000005',
   'Emma Dubois', 'Co-founder & CTO', 'AirVenture Drone Tech', 'Drone',
   'https://linkedin.com/in/emma-dubois-drone', 'emma@airventure.ca',
   'Vancouver, BC', 'Conference', 'peer', 'building', NULL,
   'Met at Drone Canada Summit. Working on BVLOS applications for mining inspection. Exploring potential tech partnership on RPAS compliance tooling.',
   (now() - interval '20 days')::date,
   'Send RPAS compliance tool proposal',
   (now() + interval '10 days')::date,
   now() - interval '35 days'),

  ('a1000000-0000-0000-0000-000000000006',
   'Alex Kim', 'Staff Software Engineer', 'Cohere', 'IT',
   'https://linkedin.com/in/alex-kim-cohere', NULL,
   'Toronto, ON', 'LinkedIn', 'peer', 'weak', NULL,
   'Commented on my LLM integration post. Brief exchange about enterprise AI patterns. No follow-through yet.',
   (now() - interval '35 days')::date,
   NULL, NULL,
   now() - interval '40 days'),

  ('a1000000-0000-0000-0000-000000000007',
   'David Okafor', 'MBA Career Mentor', 'Independent', 'Business',
   'https://linkedin.com/in/david-okafor-mba', 'david@mbamentors.ca',
   'Ottawa, ON', 'School', 'mentor', 'strong', NULL,
   'My MBA program mentor. Quarterly calls ongoing. He framed the "dual-track" approach (aerospace + ventures) that I''m now executing.',
   (now() - interval '22 days')::date,
   'Quarterly mentorship session — OVERDUE',
   (now() - interval '2 days')::date,
   now() - interval '120 days'),

  ('a1000000-0000-0000-0000-000000000008',
   'Sophie Martin', 'Investment Director', 'BDC Capital', 'Business',
   'https://linkedin.com/in/sophie-martin-bdc', NULL,
   'Montreal, QC', 'Conference', 'investor', 'building', 'hourbour',
   'Interested in fintech B2B SaaS. Hourbour fits their thesis exactly. Wants updated traction metrics before formal investment committee intro.',
   (now() - interval '18 days')::date,
   'Send Hourbour deck with Q1 metrics',
   (now() + interval '3 days')::date,
   now() - interval '55 days'),

  ('a1000000-0000-0000-0000-000000000009',
   'Ryan Thompson', 'Director of Engineering', 'MDA Space', 'Aerospace',
   'https://linkedin.com/in/ryan-thompson-mda', NULL,
   'Brampton, ON', 'LinkedIn', 'recruiter', 'building', NULL,
   'Reached out on LinkedIn about my aerospace+SW hybrid profile. Sent resume. Potential role in Canadarm3 software team.',
   (now() - interval '10 days')::date,
   NULL, NULL,
   now() - interval '20 days'),

  ('a1000000-0000-0000-0000-000000000010',
   'Aisha Hassan', 'Talent Partner', 'Wealthsimple', 'IT',
   'https://linkedin.com/in/aisha-hassan-ws', 'aisha@example.com',
   'Toronto, ON', 'LinkedIn', 'recruiter', 'weak', NULL,
   'Reached out after fintech content. Wealthsimple role wasn''t the right fit — more equity trading than B2B fintech.',
   (now() - interval '55 days')::date,
   NULL, NULL,
   now() - interval '65 days'),

  ('a1000000-0000-0000-0000-000000000011',
   'Carlos Rodriguez', 'Dispatch Operations Manager', 'Challenger Motor Freight', 'Trucking',
   NULL, 'carlos.r@example.com',
   'Cambridge, ON', 'Work', 'peer', 'strong', 'hourbour',
   'Key user from my trucking days. Invaluable product feedback for Hourbour dispatch features. Will be first paid pilot customer.',
   (now() - interval '6 days')::date,
   'Call re: new dispatch optimization module',
   (now() + interval '3 days')::date,
   now() - interval '80 days'),

  ('a1000000-0000-0000-0000-000000000012',
   'Jennifer Wong', 'Senior Product Manager', 'Hootsuite', 'IT',
   'https://linkedin.com/in/jen-wong-hootsuite', NULL,
   'Vancouver, BC', 'Conference', 'peer', 'building', 'novizio',
   'Met at MicroConf. Great perspective on social media analytics tooling. Potential advisor for Novizio content strategy.',
   (now() - interval '28 days')::date,
   NULL, NULL,
   now() - interval '50 days'),

  ('a1000000-0000-0000-0000-000000000013',
   'Marcus Lee', 'CEO', 'Draganfly Inc.', 'Drone',
   'https://linkedin.com/in/marcus-lee-draganfly', NULL,
   'Saskatoon, SK', 'LinkedIn', 'peer', 'building', NULL,
   'Connected after my drone regulation post went viral in his network. He referred me to their VP Engineering for the platform role.',
   (now() - interval '14 days')::date,
   NULL, NULL,
   now() - interval '25 days'),

  ('a1000000-0000-0000-0000-000000000014',
   'Natalie Bergeron', 'Head of Growth', 'Everlane Canada', 'Business',
   'https://linkedin.com/in/natalie-bergeron-everlane', NULL,
   'Montreal, QC', 'Conference', 'peer', 'weak', 'novizio',
   'Competitor landscape intelligence. Met at Fashion Sustainability Summit. Friendly — shares industry insights openly.',
   (now() - interval '60 days')::date,
   NULL, NULL,
   now() - interval '70 days'),

  ('a1000000-0000-0000-0000-000000000015',
   'Tom Andrews', 'CTO', 'Dispatch Labs (Stealth)', 'Trucking',
   'https://linkedin.com/in/tom-andrews-cto', NULL,
   'Toronto, ON', 'LinkedIn', 'peer', 'building', 'hourbour',
   'Building in adjacent space to Hourbour — more logistics analytics, less dispatch. Good market intel. Friendly non-competitor.',
   (now() - interval '32 days')::date,
   NULL, NULL,
   now() - interval '45 days');


-- ── Contact Interactions ──────────────────────────────────────────────────────
INSERT INTO contact_interactions
  (contact_id, interaction_date, type, notes, outcome)
VALUES

  -- Sarah Chen
  ('a1000000-0000-0000-0000-000000000001', (now() - interval '5 days')::date,
   'dm', 'She offered to put in a good word with the CAE hiring manager. Incredible gesture — genuine connection.', 'positive'),
  ('a1000000-0000-0000-0000-000000000001', (now() - interval '20 days')::date,
   'coffee', 'Met at AIAC conference over coffee. Shared technical challenges in simulation systems. Instant rapport.', 'positive'),
  ('a1000000-0000-0000-0000-000000000001', (now() - interval '42 days')::date,
   'dm', 'Brief LinkedIn exchange after I posted the Canadarm content. She shared a Bombardier insider perspective.', 'positive'),

  -- Michael Torres
  ('a1000000-0000-0000-0000-000000000002', (now() - interval '12 days')::date,
   'call', 'Monthly mentorship call. Discussed pivot from pure engineering to engineering management track. Challenged my timeline.', 'positive'),
  ('a1000000-0000-0000-0000-000000000002', (now() - interval '42 days')::date,
   'call', 'Resume review focused on Bombardier + CAE targeting. Made 6 key changes based on his feedback.', 'positive'),
  ('a1000000-0000-0000-0000-000000000002', (now() - interval '75 days')::date,
   'coffee', 'First meeting. He agreed to mentor me after reading my LinkedIn posts. Set the dual-track strategy.', 'positive'),

  -- Priya Sharma
  ('a1000000-0000-0000-0000-000000000003', (now() - interval '3 days')::date,
   'dm', 'Confirmed my application is with the hiring team. Said they find the fintech+aerospace background interesting.', 'followup_needed'),
  ('a1000000-0000-0000-0000-000000000003', (now() - interval '7 days')::date,
   'email', 'Submitted application and sent personal note about my fintech angle. She replied within 24 hours.', 'positive'),

  -- James Wilson
  ('a1000000-0000-0000-0000-000000000004', (now() - interval '8 days')::date,
   'call', 'Demo of Hourbour v2 dispatch optimization. He loved it — said he would push for a 3-month pilot internally.', 'positive'),
  ('a1000000-0000-0000-0000-000000000004', (now() - interval '35 days')::date,
   'meeting', 'In-person in Quebec City. He introduced me to their CTO over lunch. Also submitted my name for the TFI engineering role.', 'positive'),

  -- Emma Dubois
  ('a1000000-0000-0000-0000-000000000005', (now() - interval '20 days')::date,
   'dm', 'Exploring RPAS compliance tooling collaboration. She''s interested — wants to see a one-pager.', 'followup_needed'),
  ('a1000000-0000-0000-0000-000000000005', (now() - interval '35 days')::date,
   'coffee', 'Drone Canada Summit. 90-minute conversation. Her BVLOS technical depth is impressive. Instant alignment on regulatory challenges.', 'positive'),

  -- Alex Kim
  ('a1000000-0000-0000-0000-000000000006', (now() - interval '35 days')::date,
   'dm', 'Brief exchange about LLM integration patterns in enterprise settings. Shared some Cohere docs. Weak signal so far.', 'neutral'),

  -- David Okafor
  ('a1000000-0000-0000-0000-000000000007', (now() - interval '22 days')::date,
   'call', 'Quarterly session. Focused on balancing ventures with job search pacing. He challenged my timeline assumptions hard.', 'positive'),
  ('a1000000-0000-0000-0000-000000000007', (now() - interval '85 days')::date,
   'call', 'Career strategy session. He framed the dual-track approach that I''m now executing. Pivotal conversation.', 'positive'),

  -- Sophie Martin
  ('a1000000-0000-0000-0000-000000000008', (now() - interval '18 days')::date,
   'meeting', 'BDC pitch meeting — 45 mins. Went well. She asked for updated traction metrics for the investment committee.', 'followup_needed'),
  ('a1000000-0000-0000-0000-000000000008', (now() - interval '55 days')::date,
   'coffee', 'Intro call through David Okafor. She tracks Canadian fintech B2B closely. Very excited about Hourbour''s niche.', 'positive'),

  -- Ryan Thompson
  ('a1000000-0000-0000-0000-000000000009', (now() - interval '10 days')::date,
   'dm', 'He reached out about a systems engineering role on the Canadarm3 software team. Sent tailored resume same day.', 'followup_needed'),

  -- Carlos Rodriguez
  ('a1000000-0000-0000-0000-000000000011', (now() - interval '6 days')::date,
   'call', '45-min product feedback session on new dispatch module. Gold mine — documented 8 feature requests. He''s our champion.', 'positive'),
  ('a1000000-0000-0000-0000-000000000011', (now() - interval '30 days')::date,
   'email', 'Sent early beta access to dispatch module. He replied in 10 minutes with excitement and 3 immediate bugs.', 'positive'),
  ('a1000000-0000-0000-0000-000000000011', (now() - interval '65 days')::date,
   'meeting', 'On-site at Challenger for half a day. Watched live dispatch ops. Game-changing for our product roadmap.', 'positive'),

  -- Jennifer Wong
  ('a1000000-0000-0000-0000-000000000012', (now() - interval '28 days')::date,
   'coffee', 'MicroConf hallway chat became a 90-min product strategy session. She offered to review Novizio''s content roadmap.', 'positive'),

  -- Marcus Lee
  ('a1000000-0000-0000-0000-000000000013', (now() - interval '14 days')::date,
   'dm', 'He made a warm intro to Draganfly''s VP Engineering. Interview process started same week.', 'positive'),
  ('a1000000-0000-0000-0000-000000000013', (now() - interval '25 days')::date,
   'dm', 'He DM''d after commenting on my drone regulation post. 20-min conversation about RPAS future in Canada.', 'positive'),

  -- Tom Andrews
  ('a1000000-0000-0000-0000-000000000015', (now() - interval '32 days')::date,
   'call', 'Market intel call. He''s seeing the same dispatch pain points. Compared roadmaps at a high level — no IP shared.', 'neutral');
