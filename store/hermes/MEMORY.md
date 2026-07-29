# Hermes Agent Memory

Persistent memories synced from YVON Engine. Fleet-wide lessons first, then per-agent
sections. `push_lesson(agent_id, lesson)` appends timestamped entries under the agent's
section (or ## Fleet when agent_id is empty). Read back into retrieval context by
rag/core/hermes_memory.py and src/cie/sources/hermes-memory.ts.

Connected 2026-07-23 (TS-002).

## Fleet
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