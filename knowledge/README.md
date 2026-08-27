# MemPalace repo knowledge — yvon-os

Semantic knowledge mined from this repo by YVON's onboarding pipeline.
Searchable live via the shared pgvector palace on Supabase Postgres
(namespace `venture-yvon-os`):

    mempalace search "<query>" --wing yvon-os --backend pgvector

A point-in-time copy of the same data is also checked in here, for anyone
without VPS/pgvector access:

- `entities.json` — people/projects/rooms mempalace detected in this repo
- `entries.json` — every mined drawer (id, document, metadata, updated_at — no embedding vectors)
- `manifest.json` — build metadata (entry count, mined-at timestamp)

Do not edit by hand — rebuilt on every mempalace-venture.sh run.

Last mined: 2026-08-27T08:43:47Z
