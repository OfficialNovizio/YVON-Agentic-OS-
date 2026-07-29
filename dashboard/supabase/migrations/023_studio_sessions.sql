-- Studio Sessions — persists Creative Studio output for Load & Remix
-- One row per completed session (auto-saved when prompts/storyline/shot-list first generated)

create table if not exists studio_sessions (
  id                 uuid        primary key default gen_random_uuid(),
  venture_slug       text        not null,
  created_at         timestamptz not null default now(),
  mode               text        not null default 'single', -- single | storyline | shoot
  brief              jsonb       not null,
  moods              jsonb,          -- MoodDirection[]
  selected_mood_name text,           -- name of the chosen direction
  script_data        jsonb,          -- ScriptData
  captions_data      jsonb,          -- CaptionsData
  prompts_data       jsonb,          -- PromptsData (includes prompts[])
  image_urls         jsonb,          -- {index, title, url}[]
  storyline_data     jsonb,          -- StorylineData
  shot_list_data     jsonb           -- ShotListData
);

-- Index for fast per-venture history lookups
create index if not exists studio_sessions_venture_created
  on studio_sessions (venture_slug, created_at desc);

-- RLS: service role only (all calls are server-side)
alter table studio_sessions enable row level security;
