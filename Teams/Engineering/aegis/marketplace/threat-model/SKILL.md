---
name: threat-model
type: marketplace
status: imported verbatim 2026-07-09 (Fable build of aegis)
source: anthropics/defending-code-reference-harness — https://github.com/anthropics/defending-code-reference-harness/blob/main/.claude/skills/threat-model/SKILL.md (official Anthropic reference; repo unmaintained but public; plan §5 names it for aegis)
license: per source repo
assigned_agent: aegis (Engineering / Application Security)
role_in_aegis: the threat-modeling machinery — aegis's custom skills decide when models are built/refreshed and how they scope the vuln-pipeline; this skill is how a model is produced
includes: schema.md (copied verbatim alongside); interview.md / bootstrap.md / _lib/checkpoint.py NOT copied — fetch from source repo at deployment (skill reads them at runtime)
note: content below the line is verbatim from source — do not edit; improvements belong in aegis's custom skills. The skill's own Step 0 safety preamble (static analysis only, never execute target code) is charter-aligned and stands as written
# yvon-compile metadata (auto-derived from skill content 2026-07-20 — review welcome; body verbatim)
tier: 2
description: "A threat model answers **'what could go wrong with this system, who would do it, and what should we do about it?'** independently of whether any specific bug has been found yet."
triggers: [threat model]
---

# threat-model

A threat model answers **"what could go wrong with this system, who would do
it, and what should we do about it?"** independently of whether any specific
bug has been found yet. It is the map; vulnerability discovery is the metal
detector. A good threat model tells the pipeline where to look and tells triage
which findings matter.

**Litmus test:** If patching one line of code makes an entry disappear, it was
a vulnerability, not a threat. A threat ("attacker achieves RCE via untrusted
media parsing") still stands after every known bug is fixed; a vulnerability
("`dr_wav.h:412` doesn't bounds-check `chunk_size`") does not. This skill
produces threats. Vulnerabilities appear only as **evidence** that raises a
threat's likelihood score.

**Invocation:** `/threat-model [bootstrap-then-interview|bootstrap|interview] <target-dir> [flags]`

---

## Step 0 — Safety preamble (always runs first)

This skill performs **static analysis only**. It reads source, git history,
and any vulnerability reports the user supplies, and writes a single output
file (`<target-dir>/THREAT_MODEL.md`). It does not build, execute, fuzz, or
modify the target, and does not make network requests against the target's
infrastructure.

Before proceeding, confirm and state in your first response:

1. The target directory exists and is a local checkout you can read.
2. You will not execute any code from the target directory.
3. If `--vulns` points at a URL or you are asked to "fetch CVEs", you will
   query only public advisory databases (NVD, GitHub Security Advisories, the
   project's own issue tracker) and never the target's live deployment.

If the user asks you to validate a threat by running an exploit, decline and
point them at the `vuln-pipeline` (README Step 2) instead.

---

## Step 1 — Route to a mode

Parse `$ARGUMENTS`:

| First token | Route to |
|---|---|
| `interview` | Read `interview.md` in this directory and follow it. |
| `bootstrap` | Read `bootstrap.md` in this directory and follow it. |
| `bootstrap-then-interview` | Bootstrap first, then interview seeded from the draft. See below. |
| anything else, or empty | Ask the user: **"Is someone who owns or built this system available to answer questions in this session?"** Yes and the codebase is checked out → recommend `bootstrap-then-interview`. Yes but no codebase → `interview.md`. No → `bootstrap.md`. |

All modes write the same artifact (`THREAT_MODEL.md`, schema in `schema.md`)
so downstream consumers (pipeline `recon`/`judge`, verifier agents) do not need
to know which mode produced it.

| | `interview` | `bootstrap` |
|---|---|---|
| **Needs** | An application owner present in the session | A local checkout; optionally past vulns |
| **Method** | Four-question framework: conversational walk through *what are we working on → what can go wrong → what are we going to do about it → did we do a good job* | Five stages: parallel research swarm → synthesize sections 1-3 + vuln table → generalize vulns into threat classes → STRIDE gap-fill → emit |
| **Best for** | New systems, design reviews, systems where the risk lives in business logic the code doesn't show | Inherited systems, third-party code, OSS dependencies, anything with a CVE history |
| **Provenance tag** | `interview` | `bootstrap` |

**Context durability.** Interview mode is multi-turn; tool results from early
reads may be evicted before you need them. To stay resilient:

- Do **not** read `interview.md` or `bootstrap.md` in full up front. Read the
  mode file (or the relevant section of it) **at the point you need it**, one
  question or stage at a time.
- If a re-read via the Read tool is refused as "file unchanged", the prior
  result was evicted; reload with `cat <path>` via Bash instead.

**Interview backbone** (so you can proceed even if `interview.md` is
unavailable mid-session):

| Q | Question | Fills schema sections |
|---|---|---|
| Q1 | What are we working on? | section 1 context, section 2 assets, section 3 entry points |
| Q2 | What can go wrong? | section 4 threat rows (id, threat, actor, surface, asset) |
| Q3 | What are we going to do about it? | section 4 impact/likelihood/status/controls; section 5 deprioritized; section 8 recommended mitigations |
| Q4 | Did we do a good job? | validate ranking, coverage check, section 6 open questions |

### `bootstrap-then-interview` mode

When the owner is available *and* the codebase is checked out, this is the
recommended path: the owner's time goes to refining a code-grounded draft
instead of describing the system from scratch.

1. Tell the owner: "I'll read the code first and come back with a draft
   (about 5-10 min), then we'll walk it together. Want that, or would you
   rather start cold?" Only proceed if they opt in; otherwise fall back to
   `interview.md`.
2. Read `bootstrap.md` and follow it end-to-end. Write
   `<target-dir>/THREAT_MODEL.md`.
3. Immediately continue into interview mode: read `interview.md` and follow
   it with `--seed <target-dir>/THREAT_MODEL.md` in effect. The section 6 open
   questions from bootstrap become your Q1-Q4 prompts; the owner confirms,
   corrects, and adds rather than starting from nothing.
4. Overwrite `<target-dir>/THREAT_MODEL.md` with the refined model. Set
   provenance `mode: bootstrap-then-interview`.

The same flow is available manually: run `bootstrap` first, then
`interview --seed <THREAT_MODEL.md>` in a later session.

---

## Step 2 — Shared output contract

All modes MUST emit `<target-dir>/THREAT_MODEL.md` conforming to `schema.md`
in this directory. **Read `schema.md` immediately before you write the file**,
not at routing time; in interview mode the gap between routing and emit can be
many turns, and an early read will be evicted before it's used.

After writing the file, print to the user:

1. The path to `THREAT_MODEL.md`.
2. The top 5 threats by likelihood × impact (id, one-line description, L×I).
3. For `bootstrap`: any open questions the code could not answer (these seed a
   later `interview` pass).
4. For `interview`: any owner statements that could not be verified in code
   (these seed follow-up code review).

---

## References

- [docs/security.md](../../../docs/security.md) and
  [docs/prompting.md](../../../docs/prompting.md) for the engagement-context
  and authorization framing this skill inherits.
