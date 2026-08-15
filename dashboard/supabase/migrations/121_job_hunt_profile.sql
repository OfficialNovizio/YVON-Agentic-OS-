-- 121_job_hunt_profile.sql
-- New personal "Job Hunt" module (operator-only — not a Teams/ agent-fleet feature).
--
-- Schema is a direct adaptation of two real, MIT-licensed open-source job-search
-- systems the operator asked me to pull from and modify rather than design from
-- scratch (2026-08-15):
--   - santifer/career-ops config/profile.example.yml  → candidate/target_roles/
--     narrative/compensation/location/culture_screen sections
--   - MadsLorentzen/ai-job-search .claude/skills/job-application-assistant/
--     01-candidate-profile.md  → education/experience/projects/skills/publications/
--     awards/references sections
--     02-behavioral-profile.md → behavioral section (drives, fit/friction keywords)
--     04-job-evaluation.md     → evaluation_prefs.weights + thresholds (career-ops
--     and ai-job-search converge on materially the same 5-dimension weighting;
--     ai-job-search's numbers are used verbatim as the seed default: Technical
--     30%, Experience 25%, Behavioral 15%, Career Alignment 30%, Location pass/fail)
--
-- Both source schemas are YAML/Markdown files edited by hand or via a CLI /setup
-- interview. Adapted here to a single JSONB-sectioned Postgres row (singleton,
-- like ai_provider_keys' one-row-per-key pattern in 016/115, but this module has
-- exactly one profile — the operator's own) so the dashboard's intake form and
-- the future discovery/scoring/tailoring routes all read one source of truth.

CREATE TABLE IF NOT EXISTS job_hunt_profile (
  id                TEXT PRIMARY KEY DEFAULT 'operator',

  -- career-ops candidate: + location.timezone/visa fields not covered by ai-job-search's Identity
  identity          JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- career-ops target_roles: {primary: [], archetypes: [{name, level, fit}]}
  target_roles      JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- career-ops narrative: {headline, exit_story, superpowers: [], proof_points: [{name, url, hero_metric}]}
  narrative         JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- career-ops compensation: {target_range, currency, minimum, location_flexibility}
  compensation      JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- career-ops location: {country, city, timezone, visa_status, authorized_in: [], needs_sponsorship, onsite_availability}
  location          JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- ai-job-search 01-candidate-profile.md Education table
  education         JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- ai-job-search 01-candidate-profile.md Professional Experience
  experience        JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- ai-job-search 01-candidate-profile.md Independent Projects
  projects          JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- ai-job-search 01-candidate-profile.md Technical Skills: {programming: [], domain: [], tools: []}
  skills            JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- ai-job-search 01-candidate-profile.md Publications/Awards/References
  publications      JSONB NOT NULL DEFAULT '[]'::jsonb,
  awards            JSONB NOT NULL DEFAULT '[]'::jsonb,
  "references"      JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- ai-job-search 02-behavioral-profile.md: {profile_type, summary, drives: [{name, level, meaning}],
  -- strongest_behaviors: [], environment_prefs: [], growth_areas: [], fit_keywords: [],
  -- friction_keywords: [], management_style: []}
  behavioral        JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- career-ops culture_screen + ai-job-search's deal-breakers/career goals/energizing-draining
  -- tasks (04-job-evaluation.md §5) merged into one evaluation-input section.
  evaluation_prefs  JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Scoring weights, seeded from ai-job-search 04-job-evaluation.md's "Weighting" section
  -- verbatim. User-editable later; this default is the pulled, not invented, value.
  weights           JSONB NOT NULL DEFAULT
    '{"technical_skills": 30, "experience_match": 25, "behavioral_fit": 15, "career_alignment": 30}'::jsonb,

  setup_complete    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE job_hunt_profile IS
  'Operator-only personal job-search master profile. Singleton row (id=''operator''). '
  'Schema pulled and adapted from santifer/career-ops (config/profile.example.yml) and '
  'MadsLorentzen/ai-job-search (job-application-assistant skill files), both MIT-licensed. '
  'Drives keyword generation for job discovery, fit scoring, and resume/cover-letter tailoring '
  '— never auto-applies (queue-and-review model, per operator instruction 2026-08-15).';

ALTER TABLE job_hunt_profile ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS job_hunt_profile_read_authenticated ON job_hunt_profile;
CREATE POLICY job_hunt_profile_read_authenticated
  ON job_hunt_profile FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS job_hunt_profile_write_service ON job_hunt_profile;
CREATE POLICY job_hunt_profile_write_service
  ON job_hunt_profile FOR ALL TO service_role
  USING (true) WITH CHECK (true);
