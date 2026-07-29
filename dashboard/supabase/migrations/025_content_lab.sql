-- Migration 025: Content Lab
-- Tables: linkedin_connection, linkedin_posts, post_ideas

-- Shared trigger function (idempotent — safe to re-run)
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- LinkedIn OAuth token storage (single row — upsert on connect)
create table if not exists linkedin_connection (
  id              uuid primary key default gen_random_uuid(),
  access_token    text not null,
  person_id       text not null,
  person_name     text not null,
  person_headline text,
  token_expiry    timestamptz,
  connected_at    timestamptz not null default now()
);

-- LinkedIn posts (drafts, scheduled, published)
create table if not exists linkedin_posts (
  id               uuid primary key default gen_random_uuid(),
  content          text not null,
  industry_tag     text not null,  -- Aerospace | IT | Trucking | Drone | Business | Novizio | Hourbour
  venture_slug     text,           -- novizio | hourbour | null (personal)
  tone             text not null default 'story', -- story | insight | hot_take | data | behind_scenes | question | bridging
  format           text not null default 'text',  -- text | carousel | poll
  status           text not null default 'draft', -- draft | ready | scheduled | published
  scheduled_date   date,
  published_at     timestamptz,
  linkedin_post_id text,           -- ID returned from LinkedIn API after publishing
  impressions      int not null default 0,
  likes            int not null default 0,
  comments         int not null default 0,
  shares           int not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- Post ideas (idea bank)
create table if not exists post_ideas (
  id             uuid primary key default gen_random_uuid(),
  topic          text not null,
  industry_tag   text not null,
  venture_slug   text,
  rough_idea     text,
  expanded_draft text,
  status         text not null default 'new', -- new | drafted | published
  created_at     timestamptz not null default now()
);

-- Indexes
create index if not exists idx_linkedin_posts_status        on linkedin_posts(status);
create index if not exists idx_linkedin_posts_scheduled     on linkedin_posts(scheduled_date);
create index if not exists idx_linkedin_posts_industry      on linkedin_posts(industry_tag);
create index if not exists idx_post_ideas_industry          on post_ideas(industry_tag);
create index if not exists idx_post_ideas_status            on post_ideas(status);

-- updated_at trigger
drop trigger if exists trg_linkedin_posts_updated_at on linkedin_posts;
create trigger trg_linkedin_posts_updated_at
  before update on linkedin_posts for each row execute function update_updated_at();
