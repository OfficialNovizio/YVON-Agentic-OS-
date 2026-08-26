-- 120_venture_graph_data_columns.sql — store the actual graph/knowledge content
-- in Postgres, not just build status (2026-08-14).
--
-- 118_venture_graph_knowledge.sql gave venture_graphs/venture_repo_knowledge a
-- status row each (counts, commit_sha, error) but never the payload itself —
-- the real graph.json / entries.json / entities.json only ever landed on
-- GitHub's yvon-graph branch. That's fine as the durable/portable copy, but it
-- means the dashboard has no way to render a venture's graph without a live
-- GitHub API round-trip (auth + rate limits + latency) on every page load.
--
-- Same precedent as 113_graphs_storage_bucket.sql (built for the internal
-- fleet's own graphify-cron pipeline) — just inline jsonb here instead of a
-- Storage bucket, since one venture's graph is small (Novizio: 108 nodes,
-- graph.json well under 1MB) rather than the internal repo's 9MB scale that
-- justified a bucket.
--
-- graphify-venture.sh / mempalace-venture.sh upsert these columns alongside
-- their existing status fields on every build; the git push stays as-is.

alter table public.venture_graphs
  add column if not exists graph_data jsonb;

comment on column public.venture_graphs.graph_data is
  'graphify''s graph.json for this venture (nodes/links, each node tagged with a community) — same content pushed to graph/graph.json on the yvon-graph branch. Written by graphify-venture.sh on every successful build. 2026-08-14.';

alter table public.venture_repo_knowledge
  add column if not exists entries jsonb;

alter table public.venture_repo_knowledge
  add column if not exists entities jsonb;

comment on column public.venture_repo_knowledge.entries is
  'MemPalace''s mined drawers for this venture (id/document/metadata/updated_at, no embedding vectors) — same content pushed to knowledge/entries.json on the yvon-graph branch. Written by mempalace-venture.sh on every successful build. 2026-08-14.';
comment on column public.venture_repo_knowledge.entities is
  'entities.json from `mempalace init` (detected people/projects/rooms) — same content pushed to knowledge/entities.json on the yvon-graph branch. 2026-08-14.';
