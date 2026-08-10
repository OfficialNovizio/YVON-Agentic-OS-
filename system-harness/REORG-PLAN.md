# system-harness/ reorg — plan only, nothing moved yet

Requested: consolidate the engine/runtime side of the repo — pipelines, `graphify-out/`, `cli/`,
`rag/`, and the functions named in `docs/MASTER.md` §6.2's Canonical CAOS pipeline — under one
`system-harness/` folder, separate from `docs/` (which now holds only narrative/reference
material). Already done as part of this pass: `docs/adr/` → `system-harness/adr/`,
`docs/graph-brain/` → `system-harness/graph-brain/`, all cross-references fixed and verified
(see git history / the conversation this plan came from).

Everything below is **plan only** — explicitly not executed, per instruction, because the
remaining candidates have real reference counts and moving them wrong breaks a live pipeline.
Each section states what exists today, the real risk, and a recommendation.

---

## 1. `pipelines/` (top-level) and `src/pipelines/`

Two different things share the name:

| Path | Contents | What it is |
|---|---|---|
| `pipelines/input-analysis/` | `analyze.ts`, `extract.ts`, `routing.ts`, `must-haves.ts`, `types.ts`, `classify.ts`, `index.ts` | Standalone input-analysis pipeline (7 files) |
| `src/pipelines/` | `caos-executor.ts`, `content-pipeline.ts`, `governance-gate.ts` | CAOS execution + content + governance-gate pipelines (3 files) |

**Recommendation:** merge both into `system-harness/pipelines/{input-analysis,caos}/` — but
`src/pipelines/*.ts` almost certainly has relative imports (`../cie/...`, `../adapters/...`) that
break the moment the file moves out of `src/`. Needs an import-path pass, not just a directory
move. Low file count (10 total) makes this the cheapest of the four to actually execute once
approved — recommend doing this one first if you want a concrete win before tackling `cli/`/`rag/`.

## 2. `graphify-out/`

21 MB (`graph.json`, `graph.html`, `manifest.json`, `GRAPH_REPORT.md`, `cache/`). Only **8**
references repo-wide (`cli/graph-sync.sh`, `cli/graph-publish.py`, `src/cie/sources/graphify.ts`,
a couple of docs). Lowest risk of the four. `graphify` itself (the CLI tool) writes to
`graphify-out/` at the repo root by its own convention — moving the *output* directory means
either reconfiguring graphify's output path (check its config/flags for this) or moving the
directory and adding a symlink at the root so graphify keeps writing where it expects while
everything else reads from `system-harness/graphify-out/`. Recommend: confirm graphify supports
an output-path override before moving; if not, symlink rather than fight the tool.

## 3. `cli/`

23 files, **~292 references** across the repo — npm scripts in `package.json` (`node cli/yvon.js
...`), other scripts calling `cli/*.sh`/`cli/*.py`, and `docs/MASTER.md`'s own documented operator
commands (`node cli/yvon.js doctor|agents|graph`). This is the highest-risk move by far. A partial
list of what would need updating: root `package.json` scripts, every shell script that
cross-calls another (`cli/deploy.sh` → `cli/verify-deploy.sh` etc. — check for hardcoded `cli/`
prefixes in the scripts themselves, not just external callers), `docs/MASTER.md`'s command
references, `CLAUDE.md` if it names any `cli/` path directly.

**Recommendation:** do not move in one shot. If moving, do it as `system-harness/cli/` with a
transition period: move the directory, then add a root-level `package.json` script alias so
`node cli/yvon.js` keeps working during migration, OR do the full reference sweep in one
sitting with a scripted grep-replace + a full `node cli/yvon.js doctor` run immediately after to
catch what grep missed. Budget this as its own session, not a rider on other work.

## 4. `rag/`

~30 files, 7.9 MB (7.1 MB of that is `rag/chunks/chunks.json` — cached embeddings/chunks, not
logic), **~75 references**. Includes the CAOS pipeline's own `RETRIEVE`/`GATE` stages
(`rag/core/bridge.py`, `rag/harness/gates.py`) that `CLAUDE.md` tells every session to invoke
directly via `cd rag && python3 -c "..."`. Moving this means updating `CLAUDE.md` itself (the
file governing how every future session in this repo operates) plus every Python import that
assumes `rag/` sits at repo root (Python's import resolution is path-sensitive in a way `git mv`
alone does not fix — check `rag/__init__.py` and every `sys.path.insert` call across the repo
before moving, not after).

**Recommendation:** riskiest single item here because it's both heavily referenced AND
load-bearing for the harness's own operating instructions (`CLAUDE.md` §4). If this moves,
`CLAUDE.md`'s retrieval-pipeline command block must be updated in the same change, verified with
a real `python3 cli/verify-caos.py --quick` run afterward, not just a grep-count.

## 5. MASTER.md §6.2 "Canonical CAOS pipeline" — file-by-file reality check

Verified live against the actual repo (not the diagram's own path notation, which omits some
prefixes):

| §6.2 stage | Diagram says | Actually at | Status |
|---|---|---|---|
| CLASSIFY | `src/cie/classifier.ts` | `src/cie/classifier.ts` | matches |
| RESOLVE | `src/cie/graph-resolver.ts` | `src/cie/graph-resolver.ts` | matches |
| RETRIEVE | `rag/core/bridge.py` | `rag/core/bridge.py` | matches |
| GATE | `rag/harness/gates.py` | `rag/harness/gates.py` | matches |
| STRATEGY ROUTING + COMPRESSION | `unified_pipeline.py` (no prefix shown) | `rag/core/unified_pipeline.py` | exists, diagram's bare filename is ambiguous — worth a one-line fix in MASTER.md itself, separate from any physical move |
| GENERATION | `src/cie/builder.ts` | `src/cie/builder.ts` | matches |
| POST-HOC VERIFICATION | `rag/verify/` | `rag/verify/` (`grounded.py`, `__init__.py`) | matches |
| FEEDBACK LOOP — `feedback.py` | `feedback.py` (no prefix) | `rag/core/feedback.py` | exists, same ambiguous-prefix issue as unified_pipeline.py |
| FEEDBACK LOOP — field monitor | implied module | `rag/monitor/watcher.py` (best match) | **name drift** — MASTER.md says "field monitor," the live file is `watcher.py` inside `rag/monitor/` |
| FEEDBACK LOOP — self-improver | implied module | `rag/monitor/improver.py` (best match) | **name drift** — same pattern; a bare `rag/self_improver.py` also exists in git history but is **currently staged for deletion** in this working tree (pre-existing, unrelated to this session's work — confirmed via `git log -- rag/self_improver.py` and `git status`) |

**Net finding:** every stage in §6.2 is real and present — nothing in the canonical pipeline is
vaporware. Two issues worth a small, separate doc fix (not a code move): the diagram's bare
`unified_pipeline.py`/`feedback.py` filenames should read `rag/core/unified_pipeline.py` /
`rag/core/feedback.py`, and "field monitor"/"self-improver" should be named as their real files
(`rag/monitor/watcher.py`, `rag/monitor/improver.py`) so a future session greps for the right
thing.

If/when items 1–4 above execute, this table's right-hand paths all shift under
`system-harness/rag/...` — update this table in the same change so it never goes stale like the
retired docs this repo has already caught twice this session.

---

## Suggested order, if you want to proceed

1. `pipelines/` + `src/pipelines/` merge (cheapest, 10 files, needs an import-path pass)
2. `graphify-out/` (low reference count, but confirm graphify's output-path config first)
3. `cli/` (high reference count — budget its own pass)
4. `rag/` (highest risk — touches `CLAUDE.md` itself, needs a real `verify-caos.py` run to confirm)

Say which one (if any) to execute and I'll treat it as its own scoped task — same discipline as
the `docs/adr` + `docs/graph-brain` move that's already done: physically move, grep-fix every
reference, verify, report exact counts.
