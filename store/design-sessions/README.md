# store/design-sessions/

Disk-backed records for `cli/design.py`'s design-first workflow MVP
(docs/PRD-design-first-workflow.md). Same convention as `store/tasks/.pending/`:
ephemeral pre-PRD state, not a governed record, not committed.

- `{uuid}.json` — one design-session record per run of the state machine.
- `{uuid}-design.md` — the drafted design.md once `draft` has run.
- `{uuid}-handoff.md` — the discussion transcript `handoff` produces for
  `dashboard/lib/prd-generator.ts`'s `generatePrd()` to consume. Not a PRD.
- `pricing.example.json` — tracked template. Copy to `pricing.json` (gitignored)
  and fill in real per-call costs before trusting `estimate`'s output for a
  paid deployment; until then every estimate is honestly $0 with a warning.
- `curated-references.json` — Stage 2's curated reference tier (F2b/F2c).
  Tracked directly (not a template to copy) — it's shared catalog content,
  not a secret. `reference`'s live tier (F2a) layers the open-design
  daemon's own catalog on top when `OPEN_DESIGN_URL` is reachable.

All three record file patterns above are gitignored. This README,
`pricing.example.json`, and `curated-references.json` are explicitly
exempted so the directory's shape and config/catalog content survive in
git even though session records don't.
