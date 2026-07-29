-- 017_token_usage_table.sql
-- Ensures the token_usage table exists for LLM cost tracking.
-- Safe to run on an already-migrated database — CREATE IF NOT EXISTS is idempotent.

create table if not exists token_usage (
  id                    uuid primary key default gen_random_uuid(),
  agent_id              text,
  route                 text,
  model                 text not null,
  input_tokens          integer not null default 0,
  output_tokens         integer not null default 0,
  cache_read_tokens     integer not null default 0,
  cache_creation_tokens integer not null default 0,
  cost_usd              numeric(12, 8) not null default 0,
  venture_id            text,
  created_at            timestamptz not null default now()
);

-- Index for the 30-day rolling queries used by /api/token-usage
create index if not exists token_usage_created_at_idx
  on token_usage (created_at desc);

create index if not exists token_usage_venture_idx
  on token_usage (venture_id, created_at desc);

-- RLS: service role has full access; anon has none
alter table token_usage enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'token_usage' and policyname = 'service_role_all'
  ) then
    execute $policy$
      create policy service_role_all on token_usage
        for all to service_role using (true) with check (true)
    $policy$;
  end if;
end $$;
