# Hermes Agent Memory

Persistent memories synced from YVON Engine. Fleet-wide lessons first, then per-agent
sections. `push_lesson(agent_id, lesson)` appends timestamped entries under the agent's
section (or ## Fleet when agent_id is empty). Read back into retrieval context by
rag/core/hermes_memory.py and src/cie/sources/hermes-memory.ts.

Connected 2026-07-23 (TS-002).

## Fleet
- [2026-07-30#loop] Every UI ships MOBILE + TABLET RESPONSIVE from the first commit. Three breakpoints: phone (<768px, rail→drawer, single column, safe-area), tablet (768-1024px, 2-col narrower rail), desktop (≥1024px, full). Test iPhone 15 / iPad / desktop in DevTools before pre-push gate. Playbook §0.9.
- [2026-07-29#loop] Agent-build kickoff: give the SNAPSHOT only (dept: N agents · leader · one-line mission | agent: N skills X marketplace/Y custom · reports-to). Never info-dump the catalog on entry. Playbook §1.3.
- [2026-07-29#loop] Marketplace search: run against ALL 3 canonical marketplaces (skillsmp.com, mcpmarket.com, awesomeskill.ai) — not the first that returns a hit. Same rule when the operator provides URLs directly: research every one. Present one table per skill with all candidates + recommendation. Playbook §4.1a.
- [2026-07-29#loop] Custom skills: plan-then-wait for EACH skill (what/why/how + merge sources if merging + resources). Approval of the custom LIST in §3 is not approval of any DESIGN. Only after all skills done, batch the rest of operational/ in one pass (identity/agent/skill/tool/config) — but logical/ stays deliberate per §8. Playbook §5.4, §5.5.
- [2026-07-29#loop] Book grounding: present books + generated scripts + open-source URLs as ONE bundle. Recognized/peer-reviewed/established authors only; old editions fine when source is authentic. Run §8.8a three-attempt search BEFORE asking the operator for a PDF. Playbook §8.12.
- [2026-07-29#loop] After book approval: NEVER read a summary, no matter the token cost. Full linear read, or ToC-guided smart read (jump to relevant sections + read them IN FULL). Banned: getAbstract, Blinkist, Shortform, book-review blogs, Wikipedia summaries, "chapter summary in bullet points." The 99% deterministic-strict-result target only holds when source is read in native form. Playbook §8.13.
- [2026-07-29#loop] Every script lives in Shared OS; grep before writing. Pre-build check must state: 'Shared OS scan: found N candidates → chose <path>' or 'Shared OS scan: no match, new script needed'. Applies even to one-off scripts. Playbook §13.7.
- [2026-07-28#loop] External verification signals (Vercel builds, Supabase migrations, third-party APIs) do NOT auto-feed the §7.1/§7.3 loops — those loops are defined for internal signals only. Every external system whose failure the operator has to relay manually is a rail gap. Use `cli/deploy.sh` (gate → push → vercel-watch → classify) instead of raw `git push` — it internalizes Vercel's signal. TS-007.
- [2026-07-28#loop] Vercel is NOT our CI. Every git push to a Vercel-tracked branch MUST first pass `cli/verify-deploy.sh` (auto-run by `.git/hooks/pre-push`, installed via `cli/install-hooks.sh`). Four consecutive deploys failed in a row — every one a static bug the gate would have caught — the direct cost of skipping quinn's verify-before-promote gate. Reactive deploy-loops are process violations, not shortcuts. TS-006.
- [2026-07-28#loop] Importing an external app = read its WORKFLOW.md / architecture docs first. Framework/dep-major migrations are structural (GATE 0), not file copies.
- [2026-07-28#loop] Sandbox-first §7.7 now has a no-Docker TIER-1 (cli/quarantine.sh): throwaway box + warden safety-scan + claim check, PASS-before-promote. No Docker is no excuse to skip quarantine.
- [2026-07-23#seed] Tool installs must pass the sandbox-first promotion flow (§7.7) before touching the repo; installing web tools straight into the project is a violation caught repeatedly.
- [2026-07-23#seed] Every build routes through a TASK-SPEC in store/tasks/; ad-hoc builds bypassing task-dispatch are process violations.

## dev
- [2026-07-28#loop] Never run two framework versions in one repo: orphaned root next@14/react@18 shadowed dashboard next@15/react@19 → deploymentId crash + Pages-runtime fallback. A wholesale app import that changes framework/React major IS a GATE 0 change (dev+spec+meta+warden) — do a dev architecture review of node_modules resolution BEFORE running.
- [2026-07-28#loop] test-loop lesson (self-test)
- [2026-07-23#seed] middleware.ts must keep HTTP header values ASCII (an em-dash crashed every request); check headers at review.

## mia
- [2026-07-23#seed] Never ship a dashboard without the design rail (atlas tokens + impeccable). Generic UI = skill was skipped. All product UI is Next.js.

## atlas
- [2026-07-23#seed] Inter is an overused-font tell; pick distinctive faces (IBM Plex for control-plane, SF Pro system stack for Apple aesthetic).

## quinn
- [2026-07-28#loop] `cli/verify-deploy.sh` is your pre-push gate for Vercel-deployed apps. Six static checks (undeclared imports, bare supabase.select, Promise.all arity, duplicate next.config, vercel.json cron limit, .gitignore hygiene), sub-3s, no npm install needed. Extend it whenever a new class of deploy failure gets past — the rule is: caught once, coded forever.
- [2026-07-23#seed] "Agents say done; browsers tell the truth" — gate every feature with a real Chromium render + impeccable detect 0 findings before ship.

## dana
- [2026-07-23#seed] Hermes memory lives in-repo at store/hermes/ (versioned, portable), configured via yvon.config.json.

## spark
- [2026-08-04#loop] Good creative review
- [2026-08-04#loop] Good review
- [2026-08-04#loop] Good creative review
- [2026-08-04#loop] Good review
- [2026-08-04#loop] Good creative review
- [2026-08-04#loop] Good review
- [2026-08-04#loop] Good creative review
- [2026-08-04#loop] Good review