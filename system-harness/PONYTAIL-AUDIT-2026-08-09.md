# Ponytail audit — 2026-08-09

Whole-project over-engineering scan, per `Teams/Shared OS/skills/ponytail-audit/SKILL.md`
(registry: `Teams/Shared OS/tools/shared-tool-registry.md`, `@dietrichgebert/ponytail` 4.8.4).
Read-only, one-shot, ranked biggest-cut-first. Scope per the skill's own boundary: complexity and
bloat only — correctness bugs, security holes, and performance are explicitly out of scope and
not reported here. Nothing in this file has been fixed; it's a findings list to act on
selectively.

Covered: `src/cie/`, `src/pipelines/` + `pipelines/`, `rag/core|harness|monitor|verify|eval|
experiments`, `cli/`, `dashboard/lib/` + `dashboard/app/api/`. Not covered: `Teams/` (prose, not
code), `node_modules/`, `dist/`, `.next/`, `graphify-out/`, `store/`.

---

## 1. `src/cie/` (30 TS files, ~4,350 lines)

1. `shrink:` `getCached`/`setCached` hand-roll LRU eviction with an O(n) scan for the oldest entry
   every write. Replacement: exploit `Map` insertion order — `cache.delete(key); cache.set(key,
   val)` on touch, evict via `cache.delete(cache.keys().next().value)`. Drops ~15 lines and the
   O(n) scan. `[src/cie/cache.ts:69-80]`
2. Rest of the directory: lean already. Ship. `index.ts`'s re-exports are verbose (240 lines) but
   every export has a real caller; no factories-with-one-product or dead flags in `builder.ts`,
   `ranker.ts`, `algorithms.ts`, `graph-resolver.ts`.

## 2. `src/pipelines/` + `pipelines/`

1. `delete:` `src/pipelines/content-pipeline.ts` (134 ln) and `governance-gate.ts` (145 ln) —
   simulated pipelines. Comments admit "In production, this would call the LLM. For now, mark
   ready"; returns are hardcoded `status: 'PASS'` regardless of input. No real callers (not
   exported from `src/index.ts`, not imported outside themselves/`dist/`). Replacement: nothing,
   until a real LLM-calling caller exists.
2. `yagni:` `src/pipelines/caos-executor.ts` (320 ln) — same fake-output pattern (`` `[${stage.
   agentId} agent output — in production this is the LLM response]` ``). Its only consumer,
   `cli/caos-run.mjs`, says in its own header that the executor "previously had ZERO importers
   (dead code); this is the wiring that makes it runnable" — the CLI exists to exercise the dead
   code, not because a real workflow needs it.
3. `pipelines/input-analysis/` (7 files) — wired into `dashboard/app/api/chat/*`. Lean already.

## 3. `rag/core|harness|monitor|verify|eval|experiments` (~30 files, ~12,488 lines)

1. `delete:` `rag/core/strategy.py` (447 ln) — a second, parallel multi-strategy compression
   engine (5 strategies). The live retrieval path (`retriever.py`, `optimizer.py`, `bridge.py`,
   `unified_pipeline.py`) never imports it — only the barrel `rag/__init__.py` and
   `rag/test_runner.py` touch it. Production actually uses `destructor.py` + `injector.py`
   (confirmed import in `unified_pipeline.py:35`).
2. Everything else checked (`gates.py`, the `watcher.py`/`improver.py` split, `destructor.py`'s
   budget math, `embed.py`'s sqlite-vec-with-pure-Python fallback) is deliberate, documented, and
   has real callers — `embed.py`'s numpy-avoidance is a good minimal-deps choice, not bloat. Lean
   already for the rest of the tree.

## 4. `cli/` (23 files)

1. `delete:` `cli/toonify.py` (277 ln, "v2 — Aggressive compression") — a full duplicate
   reimplementation of `cli/toonify.js` (212 ln) for the same job. Only `toonify.js` is wired into
   `yvon.js`'s `toonify` command; `toonify.py` has no caller anywhere.
2. `yagni:` `cli/fleet-graph.py` (84 ln) and `cli/graph-build.py` (76 ln) — ~90% duplicate
   (identical parsing helpers), each emitting a separate JSON to `dashboard/public/`. Both headers
   claim "the Brain tab reads this," but neither JSON filename is referenced by
   `dashboard/app/brain/page.tsx`, `brain-wiki/page.tsx`, or anywhere else — both outputs are
   orphaned.
3. Rest of `cli/` — proportionate, single-purpose, no dead flags found. Lean already.

## 5. `dashboard/lib/` + `dashboard/app/api/` (144 lib files, 203 route.ts files)

1. `delete:` `dashboard/lib/cie/` (12 files, 1,458 lines) — an abandoned v1 fork of the CIE engine
   sitting next to the real, maintained `src/cie/` (v3, 4,350 lines, used by `src/pipelines/*`).
   Confirmed diverged (different comment headers/version markers/task taxonomies). Two files are
   permanently-empty stubs that say so themselves (`sources/agent-memory.ts`,
   `sources/codegraph.ts`). Exactly one live caller in the whole repo:
   `dashboard/app/api/claude/route.ts:110` — could point at `src/cie` instead, same pattern
   `src/pipelines/*` already uses.
2. `delete:` `dashboard/lib/supabase-client.ts` (9 ln) — plain anon-key `createClient()` wrapper,
   zero importers; superseded by `supabase-browser.ts` (the `@supabase/ssr` cookie-synced version
   actually used by 4 files).
3. `delete:` `dashboard/lib/db/jobs.ts` and `dashboard/lib/db/network.ts` (13 ln combined) —
   literal empty placeholders ("table not yet implemented"), no exports, an eslint-disabled unused
   import.
4. `shrink:` 70 `route.ts` files repeat the identical inline ternary `err instanceof Error ?
   err.message : String(err)` instead of one shared helper. Replacement: `export const errMsg =
   (e: unknown) => e instanceof Error ? e.message : String(e)` in `dashboard/lib/errors.ts`, call
   from all 70 sites. Real duplication/maintenance win, modest line-count effect.
5. Noted, not ranked as a cut: 10 `route.ts` files (`projects`, `consulting`, `people`,
   `idea-feed`, etc.) return hardcoded `MOCK = [...]` arrays — reads as intentional stub for
   unbuilt features, not over-engineering.
6. Not flagged: the `supabase.ts` / `supabase-server.ts` / `supabase-browser.ts` split
   (service-role / RSC-cookie / browser-cookie clients) — three genuinely different execution
   contexts, legitimate architecture. Same for `db/index.ts` + `db.ts`'s thin barrel re-export —
   each `db/*.ts` behind it is a real, appropriately-sized module.

---

## Combined net estimate

High-confidence deletions: `dashboard/lib/cie/` (1,458) + `rag/core/strategy.py` (447) +
`cli/toonify.py` (277) + `src/pipelines/content-pipeline.ts` + `governance-gate.ts` (279) +
`dashboard/lib/supabase-client.ts` (9) + `dashboard/lib/db/jobs.ts` + `network.ts` (13) +
`cli/fleet-graph.py`/`graph-build.py` consolidation (~90 of ~160 duplicate lines) +
`cie/cache.ts` shrink (~15) ≈ **2,588 lines**. Add `caos-executor.ts` + `cli/caos-run.mjs`
(382 lines, `yagni` not hard `delete` — it was deliberately re-wired earlier this session, so
worth a deliberate decision rather than reflexive deletion) for **2,970 lines** if cut too.

```
net: -2,588 lines (-2,970 if caos-executor is also cut), -0 deps possible.
```

No dependency-level bloat found — both `package.json`s are already lean (no lodash/moment/
uuid-class hand-rolling), and the multi-client Supabase split is legitimate multi-context
architecture per the skill's own boundary, not padding.

## Suggested next step

Nothing here has been applied — this is a findings list, not a change. If you want any of these
actioned, say which ones; the `dashboard/lib/cie/` and `cli/toonify.py`/`fleet-graph.py`/
`graph-build.py` items look like the safest, highest-value first cuts (confirmed zero or
near-zero real callers). `content-pipeline.ts`/`governance-gate.ts`/`caos-executor.ts` are
worth a deliberate keep-or-cut call since they were touched this session, not blind deletion.
