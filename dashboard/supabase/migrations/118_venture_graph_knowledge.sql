-- 118_venture_graph_knowledge.sql — per-venture graphify + MemPalace repo-knowledge
-- tracking (2026-08-12). New standard onboarding flow, per direct request: whenever a
-- venture gets a GitHub repo linked, graphify builds a structural code graph and
-- MemPalace builds a semantic knowledge layer FROM that repo (not chat — a new
-- capability, distinct from mempalace_drawers which only ever captures live chat
-- turns). Both get committed to a dedicated 'yvon-graph' orphan branch in the
-- CLIENT'S OWN repo (never touches their main), and both get a status row here so
-- the dashboard can show build state without hitting git directly.
--
-- One row per venture (latest state, not history) — simplest useful shape for a
-- status display; re-runs (nightly refresh) upsert in place by venture_slug.

create table if not exists public.venture_graphs (
  id             uuid primary key default gen_random_uuid(),
  venture_slug   text not null unique references public.ventures(slug) on delete cascade,
  repo_url       text not null,
  branch         text not null default 'yvon-graph',
  commit_sha     text,
  node_count     integer,
  edge_count     integer,
  community_count integer,
  status         text not null default 'pending' check (status in ('pending','building','ready','error')),
  error          text,
  built_at       timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table if not exists public.venture_repo_knowledge (
  id             uuid primary key default gen_random_uuid(),
  venture_slug   text not null unique references public.ventures(slug) on delete cascade,
  repo_url       text not null,
  branch         text not null default 'yvon-graph',
  commit_sha     text,
  entry_count    integer,
  status         text not null default 'pending' check (status in ('pending','building','ready','error')),
  error          text,
  built_at       timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists idx_venture_graphs_slug on public.venture_graphs (venture_slug);
create index if not exists idx_venture_repo_knowledge_slug on public.venture_repo_knowledge (venture_slug);

alter table public.venture_graphs enable row level security;
alter table public.venture_repo_knowledge enable row level security;

drop policy if exists venture_graphs_read on public.venture_graphs;
create policy venture_graphs_read on public.venture_graphs
  for select to authenticated using (true);

drop policy if exists venture_graphs_service_write on public.venture_graphs;
create policy venture_graphs_service_write on public.venture_graphs
  for all to service_role using (true) with check (true);

drop policy if exists venture_repo_knowledge_read on public.venture_repo_knowledge;
create policy venture_repo_knowledge_read on public.venture_repo_knowledge
  for select to authenticated using (true);

drop policy if exists venture_repo_knowledge_service_write on public.venture_repo_knowledge;
create policy venture_repo_knowledge_service_write on public.venture_repo_knowledge
  for all to service_role using (true) with check (true);

comment on table public.venture_graphs is
  'Per-venture graphify status (structural code graph, committed to yvon-graph branch in the client repo). One row per venture, upserted on each build. 2026-08-12.';
comment on table public.venture_repo_knowledge is
  'Per-venture MemPalace repo-knowledge status (semantic knowledge extracted from the client repo itself, distinct from mempalace_drawers which only captures live chat). One row per venture, upserted on each build. 2026-08-12.';
