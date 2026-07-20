# Agent Build Playbook

How to build any agent in this system, to a consistent structure and standard. Every rule here reflects something that was actually tested, corrected, or confirmed while building the first agent in this system — not theory. If you're building an agent assigned to you, follow this in order. Don't skip steps, and don't batch steps together even when it feels slow — the order and the stops are the point.

This playbook is self-contained — it doesn't assume you have access to any other agent's folder as a reference. Everything you need is described here directly.

**Companion docs (read alongside this one):** `LOGICAL-SYNTHESIS-PLAN.md` is the detailed process for the logical-grounding pass expanded in §8. Supplied source books go in `Agents/_books/`. Cross-agent capabilities and shared references live in `Shared OS/` (see §13).

---

## 0. Ground Rules (read before doing anything)

These apply across every step below, not just one phase.

**0.1 — Before ANY work, analyze and present your understanding — then wait for approval.** This is not optional and not a one-time thing at the start of the project — it happens before every single artifact, every time:
  - **What** you're about to build (every request to DO something — research, build, search, integrate, or restructure. The only exception is a direct factual question. The rule was broken on 2026-07-14 when the user sent 7 skill links and the agent launched search calls without first analyzing and presenting a plan.).
  - **Why** this particular approach/source/design (the reasoning, the source URL if applicable, what problem it solves).
  - **How** you'll build it (the method, structure, or steps you'll follow).
  Only after laying this out do you ask for sign-off, and only after getting it do you write anything. Ask for sign-off before writing anything. This applies to every buildable artifact without exception: skills, identity docs, operational subfolder content, agent.md, department workflow files, scripts — not just work. Present first, work second.

	**0.1a — What/Why/How for artifact building.** Before writing any file: What is it (name, path, type), Why this approach (source, design decision), How you'll structure it (sections, functions, tests). This is the final check before putting bytes on disk — a subset of the broader analysis rule above. This applies to every buildable artifact without exception: skills, identity docs, operational subfolder content, agent.md, department workflow files, scripts — not just the big stuff.

**0.2 — One artifact at a time, hard stop after each.** Build exactly one skill (or one identity doc, or one operational subfolder's content) at a time, present it, and wait for review before starting the next — even if several items were already approved together in one round of questions. Approval to build several things ≠ approval to batch-build them. This is the single most important rule in this playbook, alongside 0.1 — it was violated once during development of this playbook's process (three skills written in one pass instead of one at a time) and corrected immediately after. Don't repeat that mistake.

**0.3 — Announce scope before starting.** State out loud which department and which agent you're working on before doing anything else, every time — even if it seems obvious from context.

**0.4 — Genericize, don't hardcode.** The whole point of this system is that it's a portable "team-in-a-box" — pluggable into any project, not wired to one company's specific ventures, brand names, or numbers. If a source skill or catalog entry has a company-specific name or hardcoded business unit baked in, flag it and genericize it (parameters/placeholders instead of fixed names) before building.

**0.4a — Drop the company-specific naming prefix automatically.** Catalog skill names carry a company-specific prefix (e.g. a project or org codename attached to every custom skill name). Strip it automatically when naming the built skill — this doesn't need to be asked about each time, it's a standing rule, not a per-skill discussion. `<prefix>-okr-cascade` becomes `okr-cascade`, every time, without a question.

**0.4b — No hardcoded venture names, ever (added 2026-07-06).** No venture, business, or product name (e.g. from the catalog's original venture references) may appear in any skill's instructions, protocol, output format, or operational file. Ventures are always referred to generically ("venture," "initiative," "the business") — the deploying platform (e.g. toongine) binds real names at runtime per business. The only permitted place an original hardcoded name may appear is provenance frontmatter (documenting what the source catalog entry said, for traceability) — never in content the agent executes. When building from a catalog entry that names ventures or other company-specific agents, strip them as part of the build, and note the strip in frontmatter.

**0.5 — Don't invent values.** If a number, contact, threshold, or fact isn't known, don't make one up and present it as real. Either ask for the real value, or build a placeholder template with clear fill-in-later fields and say so explicitly.

**0.6 — Triple-counter verify every response you give (added 2026-07-15, revised 2026-07-16).** This is NOT a user-facing step that requires permission. It runs silently before every response leaves you. The user should never need to ask for verification — it is baked into how you think. The three checks are:

	  1. **Source check:** Does every assertion trace to a real book, standard, or file in this project? If I said "Kahneman says X" — did I cite the chapter and page? If I said "this formula gives 14.4" — did I compute it or just guess? Remove anything that fails this check.
	  2. **Logic check:** Does the reasoning hold? If I claim "this script covers all edge cases" — did I actually test those edge cases? If I claim "X is fully covered by Y script" — did I cross-check the function list in Y against the needs in X? A claim that passes source check but fails logic check is still wrong.
	  3. **Consistency check:** Does this answer match what I said earlier in this conversation? If I said "3 scripts needed" ten minutes ago and now I say "2 scripts needed" — why the change? If the change is real, state it explicitly. If I can't explain the difference, re-check.

	This applies to every response — research results, script outputs, book-mapping plans, agent analysis. The only exception is a direct question where the answer is a single known fact. The triple counter ensures that what enters the conversation has been self-audited before the user has to audit it. **The user should never need to ask for verification, a 3-attempt search, or a script test — these are built into how you operate, not gated behind permission. Run them silently and present the results, not the process.**

**0.7 — No agent finalizes a decision without real logical/numeric backing.**

**0.8 — Toonify before moving to the next agent (added 2026-07-16).** When an agent's build is finalized (all skills built, operational layer complete, logical/book-requirements.md updated), the last step before marking the agent complete is to run TOON conversion on all its .md files. This is non-negotiable — the CIE engine reads .toon files, not raw .md files, for context injection. The procedure:

  - Run `node cli/toonify.js --agent <agent-id>` to convert all .md files in that agent's folder to .toon (TOON Claude format).
  - Verify: the agent now has `.toon` files alongside every `.md` file. If a `.md` file has no `.toon` equivalent, CIE cannot read it — the agent's context is incomplete.
  - A `.toon` file gets ~80-87% token savings vs raw Markdown on Claude models. Without toonification, the agent burns 5× more tokens to deliver the same context — or more likely, receives NO context because CIE prefers the compressed format.
  - The toonify CLI runs automatically: `node cli/toonify.js --all` converts ALL agent .md files. Run this after building multiple agents or departments.
  - A stale `.toon` file is automatically detected and rebuilt — toonify checks mtime and only reconverts when the source `.md` is newer. (Renumbered from §0.6, 2026-07-15). The `logical/` folder isn't a nice-to-have extension — it's where an agent's actual formulas live, and an agent must not present a decision, ranking, or recommendation as settled using reasoning or qualitative judgment alone when a real formula for that domain exists (or should exist) in `logical/`. Two consequences:
	  - **If a relevant logical skill already exists**, run the actual numbers through it before finalizing — don't approximate with reasoning when a real formula is available.
	  - **If no logical skill exists yet for that domain** (the normal state until a book is provided, per section 8), the agent must say so explicitly — flag the output as reasoning-based and not formula-verified, rather than presenting qualitative judgment with the confidence of a computed number. A 1-5 rubric score dressed up in a table is not the same thing as a real formula, and should not be presented as if it were. The `logical/` folder isn't a nice-to-have extension — it's where an agent's actual formulas live, and an agent must not present a decision, ranking, or recommendation as settled using reasoning or qualitative judgment alone when a real formula for that domain exists (or should exist) in `logical/`. Two consequences:
  - **If a relevant logical skill already exists**, run the actual numbers through it before finalizing — don't approximate with reasoning when a real formula is available.
  - **If no logical skill exists yet for that domain** (the normal state until a book is provided, per section 8), the agent must say so explicitly — flag the output as reasoning-based and not formula-verified, rather than presenting qualitative judgment with the confidence of a computed number. A 1-5 rubric score dressed up in a table is not the same thing as a real formula, and should not be presented as if it were.

---

## 1. Choose Scope

**1.1 — Pick the department.** Suggest the next department in the build order and ask the person to confirm (or pick a different one). Don't assume the previously-used order still applies without asking.

**1.2 — Pick the agent within that department.** List the agents in that department (from the org chart / catalog) and ask which one to start with.

Don't move past this step until both are confirmed.

---

## 2. Discuss the Skill List

Before building anything, go through the catalog's listed skills for this agent and discuss them with the person: does anything need to change, get added, or get dropped? Treat the catalog as a starting floor, not a spec to execute verbatim — more skills than what's listed are allowed if it makes sense, but that itself is a discussion, not an assumption.

---

## 3. Sort Marketplace vs. Custom

Once the skill list is settled, split it into two buckets:
- **Marketplace** — a real, existing skill can probably fulfill this.
- **Custom** — needs to be built from scratch or merged from multiple sources.

**Default to marketplace first, every time.** This is now a standing rule, not a per-agent question — real, sourced skills are cheaper to verify and faster to get right than something built from scratch, so exhaust the marketplace search before starting custom work. Only skip straight to custom if the skill list discussion in section 2 already made clear nothing marketplace-sourced could plausibly fit.

---

## 4. Build Marketplace Skills (one at a time)

**4.1 — Search by purpose, not by name.** The catalog's skill names are often aspirational — a real skill with that exact name frequently doesn't exist. Search skillsmp.com, mcpmarket.com, and awesomeskill.ai for what the skill's *purpose* reflects, not a literal name match.

**4.2 — Compare candidates.** If more than one skill fits, compare them honestly. Either pick the single best fit, or — if several are each good on different terms — plan to pull and merge them. (Note: a merge is no longer a pure marketplace copy — it becomes a custom skill, see 4.6.)

**4.3 — Present sources before touching anything (apply rule 0.1 here explicitly).** For each candidate, give the person: what it is (the skill's actual description), why it fits (the reasoning, compared against alternatives if any), and its source URL. Wait for explicit approval before doing anything else.

**4.4 — Stop after presenting. Do not copy yet.** Even after discussing candidates, don't write any file until the person explicitly says to continue.

**4.5 — Translate if needed.** If the source isn't in English, translate it faithfully before use — full translation, nothing cut.

**4.6 — Copy without cutting it down.** Once approved, copy the skill into the agent's `marketplace/<skill-name>/SKILL.md` folder, preserving the original content in full. Add frontmatter documenting the source URL, author, and which catalog entry it fulfills (see template in section 9). If it turned into a merge of multiple sources, it's custom now — build it under section 5 instead, in `custom/`, not `marketplace/`.

**4.7 — One skill, then stop.** Build the file, present it to the person, and wait for review before starting the next marketplace skill.

**4.8 — Never alter a marketplace skill.** A marketplace skill placed in `marketplace/<skill-name>/` must be copied verbatim — the original content, structure, and instructions are preserved without modification. The only exceptions:
  - **Frontmatter additions** only (source URL, author, which catalog entry it fulfills, date added — per §9). These go in the frontmatter block, never in the body.
  - **Merges** (combining 2+ marketplace sources) are not marketplace skills — they become custom skills and live in `custom/` per 4.6's note. The source content is preserved within the merge, but the *file* is custom.
  - **Wraps / Custom + Marketplace** (a marketplace pack referenced by a custom wrapper) keep the marketplace pack as a separate, unaltered artifact — the wrapping skill lives in `custom/`, the unaltered pack stays in `marketplace/` or is adopted-by-reference via runtime install.

  This rule exists because: (a) an altered marketplace skill can't be updated when the source improves — you lose the diff; (b) the whole point of marketplace is proven, tested content — editing it reintroduces the drift the marketplace was meant to eliminate; (c) if the skill genuinely needs different content for your use case, it wasn't a marketplace fit — it should be custom or a merge from the start. When in doubt, don't alter: either adopt it as-is or build it custom.

---

## 5. Build Custom Skills (one at a time)

Custom skills need the most involvement and the most research. Before drafting any of it, apply rule 0.1: tell the person what you're planning to build, why (what gap it fills, what it's based on), and how (the design/method), and get sign-off before writing. Each finished skill must define, at minimum:

- **Introduction** — what it is and where it came from (built from scratch, or merged from which sources).
- **Purpose** — what problem it solves and for whom.
- **Structure/Protocol** — the phases or steps it runs through, shown as a simple flow.
- **Instructions** — the actual step-by-step method, detailed enough that the agent won't drift or guess.
- **Fallback** — what to do when information is missing, a dependency isn't available, or the skill doesn't cleanly apply.
- **Principles** — the non-negotiable rules specific to this skill (no fabrication, escalate ties, etc. — whatever applies).
- **Boundaries with other skills** — how it hands off to or depends on the agent's other skills.

**5.1 — Discuss scoring/criteria/method design explicitly.** If the skill involves scoring, ranking, or any formula, don't invent the criteria unilaterally — propose a design, ask if it should be expanded or changed, and confirm before building.

**5.2 — Discuss tool needs.** If the skill would benefit from external data access ("map access" — i.e. a data source/connector) or needs a Python script (for multi-step math, scoring, or anything better done in code than reasoning), raise it explicitly and get agreement before building. If a script is approved, write it, test it with sample input, and confirm it actually runs correctly before presenting the skill as done.

**5.3 — One skill, then stop.** Same as marketplace: build, present, wait for review.

---

## 6. Folder Structure

Every agent gets this structure (create it up front, even before the first skill is built):

```
<Department>/<agent-name>/
├── agent.md
├── marketplace/
│   └── <skill-name>/SKILL.md
├── custom/
│   └── <skill-name>/SKILL.md   (+ scripts/ if a Python script is needed)
├── operational/
│   ├── principles/
│   ├── commands/
│   ├── agent/
│   ├── skill/
│   └── tool/
├── logical/
└── identity/        <- always present, every agent (see 6.1)
```

**6.1 — Structure is universal; identity is a content exception, not a folder exception.** Every agent gets all five folders — marketplace, custom, operational, logical, identity — with no exceptions, regardless of role or leader status. Folder presence must never vary between agents in a department; an agent missing a whole folder is harder to reason about than one with an intentionally empty folder (same principle as 7.0a below, applied at the top level). What actually varies is identity **content**: only the one agent who leads/heads the department (e.g. an "Orchestrator" role, or whichever role the org chart marks as the department head) gets a real persona document inside `identity/`. Every other agent still gets the `identity/` folder itself, left empty. Confirm who the department's leader actually is before writing identity *content* for anyone — but never skip creating the folder for non-leaders.

**6.2 — Identity holds one persona to start.** Inside `identity/`, build exactly one identity document at first (name the file after both the archetype and its inspiration if there is one, e.g. `<archetype>-<inspiration>.md`). More identities can be added later, letting the operator choose which is locked in — but start with one.

	**6.2a — Identity personas are modeled on real people (added 2026-07-14).** An agent's identity document must be grounded in a real, named individual whose thinking patterns are well-documented through their own books, letters, shareholder letters, interviews, or published speeches. The persona file extracts how that person thought, decided, communicated, and led — their mental models, their principles, their characteristic phrases, their biases. The same rules as §8.8 and §8.9 apply to identity sources:

	  - **Named, verifiable individual.** "A visionary CEO persona" is not a persona — it is a vibe. "Steve Jobs (1955-2011), co-founder and CEO of Apple, as documented in Isaacson's biography, his own public keynotes, and internal communications" is a persona.
	  - **Source material must be published.** Books by the person, biographies of the person, published interviews, annual shareholder letters (e.g., Buffett's letters to Berkshire shareholders), conference transcripts, or documented internal memos. Anecdotes do not count.
	  - **Extract mental models, not hagiography.** The identity document is not a biography summary — it extracts decision patterns: how the person framed problems, what they valued, what they rejected, how they communicated, what they got wrong. If the source person had known blind spots (e.g., Jobs's reality distortion field), those should be noted — identities are not idols.
	  - **Coordination with logical extraction (§8.9).** When a practitioner-operator's book is used both for identity AND for logical grounding, extract once, use twice.
	  - **Identity file format.** Each identity document carries frontmatter documenting the real person, their verifiable achievements, the source materials used (with publication details), and the date of extraction. The body is the extracted thinking style, principles, and decision patterns.

---

## 7. Operational Layer — What Goes in Each Subfolder

**7.0 — Prioritize before building; don't march through in a fixed order.** Look at what this specific agent's skills actually need and build the subfolder that matters most *for this agent* first — don't default to a mechanical principles→commands→agent→skill→tool march just because that's the order they're listed in. For a decision-heavy agent, principles might matter most first; for an agent whose skills barely overlap, skill-routing might matter least. Ask or judge which is most load-bearing for this particular agent and start there.

**7.0a — Check whether a subfolder needs real content before writing any; but always keep the folder itself.** Not every agent needs real content in every one of the five subfolders. Before building any of principles/commands/agent/skill/tool, check: does this agent's actual skill set give you real material to build from? If not, don't pad it out with content copied from another agent's shape just for completeness — but still **create and keep the empty folder** so the overall folder structure stays identical and predictable across every agent (an agent that's missing a whole subfolder is harder to reason about than one with an intentionally empty one). If a subfolder is left empty, that's a decision worth a one-line note (even a stray `.gitkeep`-style placeholder explaining why nothing's there yet) rather than silence. This is the same lesson as the `agent/` config discussion below, generalized to the whole operational layer: derive content, don't default it — but don't derive the folder *structure* away either.

Build whichever subfolders do apply one at a time, same stop-and-review discipline as everywhere else — apply rule 0.1 before each: say what you're about to consolidate, why it's structured that way, and how (which existing sources it's pulled from), before writing it. Each should be sourced from what's *already* defined across the agent's skill files — don't invent new rules here, consolidate existing ones.

- **principles/** — the hard, cross-skill rules the agent always follows regardless of which skill is running (no fabrication, escalate close calls, etc.). **Only the department leader's principles file gets the Universal + Identity-Flavored split.** Every other agent (not the department leader) gets **Universal-only** — no identity-flavored section, since non-leader agents have no identity of their own (see 6.1). Don't reuse the leader's identity-driven tone rules for a non-leader agent by default; if a non-leader agent seems to need its own tone guidance, that's a separate discussion, not an inheritance.
- **commands/** — a consolidated trigger-phrase table (pulled from each skill's own "When to Use" section) mapping natural-language phrases to which skill fires, plus optional slash-style shortcuts as a convenience layer, plus precedence rules for any triggers that overlap across the agent's own skills. **The document's structure/layout is the same for every agent** (same table shape, same sections) — but the actual triggers, shortcuts, and precedence rules inside it are unique to each agent's specific skill set. Don't copy another agent's trigger content, only its shape.
- **agent/** — machine-readable config for things skills reference but shouldn't hardcode: escalation thresholds, escalation contacts/routing, model routing, tool permissions. If real values aren't known yet, build this as an explicit fill-in-later template with placeholder fields — never invent numbers. **Derive the field list from what this specific agent's skills actually reference — don't copy another agent's config shape.** Every field must trace back to a real line in one of this agent's skill files. An agent with fewer external dependencies should get a smaller config, not a padded-out copy of a different agent's structure with empty sections nothing points to. (This is also where 7.0a applies most concretely — if nothing in an agent's skills references a config value at all, this subfolder may not need building.)
- **skill/** — the agent's own skill-routing map: which skill hands off to which, in what order, and what takes precedence when a request could match more than one. Sourced from each skill's own "Boundaries with other skills" section. Note at the top where identity fits for the leader agent (it governs *how*), or explicitly note "no identity layer" for non-leader agents — either way, this file governs *which/when*, not tone.
- **tool/** — a technical requirements table: what each skill actually needs to function (file read/write, script execution, etc.), derived directly from what's written in the skill files — not the governance/policy layer (that's `agent/`'s `tool_permissions`), the *technical* layer. **This file must state explicitly, near the top, that it specifies needs and does not grant them** — listing "Python/shell execution" in this table does not give the agent that capability. Actual tool/file/execution access is a separate runtime-configuration step, set up wherever the agent is actually deployed (a Claude Skills-compatible platform's own permission system, or whatever infrastructure a human operator sets up to run the process manually). This table is the checklist for whoever does that configuration, not a functioning permission grant by itself. Every tool/ file built must carry this disclaimer — it is not optional or implied.

**Cross-agent capabilities (like web search) do not go in any individual skill file.** If a skill would benefit from something that's really a shared, cross-agent capability, don't bake it in locally — note it as a dependency on the shared OS-level skill layer (a separate, not-yet-built layer meant to be shared across every agent) instead.

---

## 8. Logical Folder (the grounding pass)

The `logical/` folder is where an agent's judgments get grounded in a real source — a formula, a rule-set, a framework, or a cited rubric drawn from a book the person provides, **never invented from general knowledge.** **This folder is the actual backbone an agent's decisions must run through — see rule 0.6.** Until it has real content for a given domain, any decision in that domain is flagged reasoning-based, not source-grounded — the standing rule for every agent's decisions.

**The unit of work is one book, not one agent.** A single book (a statistics text, say) grounds ~10 agents. Extract it once and wire it into every skill it touches. The detailed end-to-end process lives in the companion `LOGICAL-SYNTHESIS-PLAN.md`; the essentials are below.

**8.0 — Minimum two books per script (added 2026-07-14).** Every logical script in `Shared OS/logical/` must draw from at least two distinct, authenticated source books. A single book gives one perspective; two books give triangulation. The second source validates, challenges, or extends the first — either by providing an alternative framework (e.g., Porter's five forces + Thiel's monopoly characteristics both inform competitive strategy), or by covering complementary ground (e.g., Brealey & Myers covers capital budgeting formulas, Damodaran covers valuation narrative). The rules:

  - **Two is the floor, not the ceiling.** Three or four books per script is better when the domain is deep. One-book scripts from earlier builds must be retrofitted in a later pass — they are placeholders, not done.
  - **At least one source must be a technical/academic text** if the script touches anything quantifiable (Routes A, B, C). The second source can be practitioner-operator wisdom (§8.9) or a complementary textbook. Route D scripts (pure qualitative) need two practitioner-operator sources minimum.
  - **Books must be from different authors/institutions** — different intellectual traditions, different methodologies. Two books by the same author on the same topic is one source.
  - **Cross-reference in the script docstring.** Each script's header documents both (or all) source books with full author credentials, edition, and chapter/page coverage. The body distinguishes which formula or framework came from which source.
  - **Certification standards count as one source.** CVSS from FIRST.org, WCAG from W3C, OWASP Testing Guide from the OWASP Foundation — these are verifiable institutional standards and count as one source. Pair them with a textbook or practitioner book for the second source.

**8.1 — Logical is a TWO-TOUCH pass; the second touch comes last.**
  - **Touch 1 (during the build, step 9 of §12):** leave a *placeholder*. Once an agent's skills, identity (if applicable), and operational layer are done, write one `logical/book-requirements.md` recording the specific 0.6-flagged judgments this agent makes, what kind of book/source would ground each, and why. Don't build the real logical artifacts early — you can't ground judgments the skills haven't defined yet.
  - **Touch 2 (later, when a book arrives):** run the synthesis pipeline below across every agent the book touches. This is a separate campaign, not part of a single agent's build.

**8.2 — STEP ZERO: classify the book before extracting.** Not every book yields a formula, and forcing one is fake rigor. The first action on any incoming book is to classify what it actually contains — which routes it to the right artifact type. A book may split across routes (different chapters → different routes).

| Route | The book contains… | Produces | Testable? |
|---|---|---|---|
| **A — Math script** | formulas, thresholds, distributions, equations | a numeric Python script (compute + self-tests) | yes — numeric assertions |
| **B — Rule / logic script** | explicit rules, steps, categories, do/don't lists, decision trees | a deterministic rule-engine: classifier · validator/linter · decision-tree (no math) | yes — planted-case assertions |
| **C — Hybrid script** | a scoring *structure* with subjective inputs (framework + aggregation) | a script that computes the roll-up + routing; human/agent supplies the per-item judgment | yes — aggregation + routing assertions |
| **D — Rubric only** | narrative wisdom, philosophy, pure judgment | a book-cited rubric + checklist asset in the skill — NO script | no script; the skill text is the artifact |

**The litmus:** *"Given the same input, would two careful people using this chapter produce the same output?"* Deterministically yes by arithmetic → **A**; by rules/categories → **B**; yes on the aggregation but the inputs are judgment → **C**; genuinely no, it's interpretation → **D** (cite it, don't script it). **Anti-fake-rigor rule:** if a chapter is D, it stays D — we do not wrap judgment in a script to look quantitative. The D win is real anyway: the flag moves from *"reasoning-based, unsourced"* to *"reasoning-based, book-cited."* The fleet already proves B and C run with zero math (`access_review.py` = Route B; `risk_score.py` / `rice.py` = Route C).

**8.3 — The synthesis pipeline (per book).**
```
1. INTAKE     person drops the book in Agents/_books/ ; record title · edition · date
2. CLASSIFY   §8.2 — split the book into A / B / C / D routes (per chapter/method)
3. EXTRACT    pull each formula / rule-set / framework / rubric into a reference file,
              EACH with an exact citation (chapter · section · equation/page). No cite → excluded.
4. MAP        tie each extracted item to the skills, config <FILL_IN>s, and scripts it grounds
5. IMPLEMENT  A→math script · B→rule script · C→hybrid script · D→cited rubric + checklist asset
              (every A/B/C script ships with self-tests, like the existing tested scripts)
6. VERIFY     run all script self-tests + the DE-FLAG AUDIT (§8.5)
```
Build each logical artifact with the same discipline as a custom skill (introduction, purpose, structure, instructions, fallback, principles) and the same one-at-a-time stop-and-review.

**8.4 — Fidelity tiers (how strict the citation is).**
  - **Tier A — book supplied:** exact page/equation citation → artifact built → 0.6 flag **removed**.
  - **Tier B — no book, canonical standard** (z-test, Bayes, EOQ, CVSS, PERT, Cialdini's 6, etc.): built with an authoritative general citation, labeled *"standard method, not page-cited"* → flag **downgraded**, not removed.
  - **Tier C — genuine judgment, no source:** stays reasoning-based, explicitly. Not faked.

  Tiers are orthogonal to routes: a Route-B rule-script can be Tier A (supplied book) or Tier B (well-known framework). Guardrails: no artifact without a citation; encode the book's *method*, cite its judgment as guidance (don't hard-code opinion as derived); business parameters stay `<FILL_IN>` (the book gives the method + cited defaults, the venture's numbers are operator config — per 0.4b/0.5); every forecast ships with its uncertainty (interval, confidence, or explicit route), never a bare point estimate.

**8.5 — The de-flag audit (completion check, per book).** After a book is processed, every item it was meant to ground ends in exactly one honest state: (a) cited + artifact built (A/B/C) → flag removed (Tier A) or downgraded (Tier B); (b) cited rubric (D) → "reasoning-based, book-cited"; or (c) still reasoning-based, with a written reason (no source found). No item is silently unflagged. The audit is a short per-book report: items grounded, artifacts built + tested, items still flagged and why.

**8.6 — If no book yet, the placeholder holds.** Touch-1's `logical/book-requirements.md` is the standing state until a book arrives — it must describe what source is needed, why (what this agent needs it for), and enough context that the gap can be filled later without re-deriving it.

**8.7 — Where extracted artifacts live (updated 2026-07-14).** The output of logical extraction is a Python script. All logical .py scripts live in `Shared OS/logical/` (see §13.5). No .md reference files are kept in logical/ folders; the only .md file in any agent's `logical/` is `book-requirements.md`. Agents import from `Shared OS/logical/` — they never copy scripts. Skills call the scripts directly by path (e.g., `Shared OS/logical/capital_budgeting.py`). Each `book-requirements.md` is updated from "placeholder" to "sourced from [book], script → Shared OS/logical/<script>.py."

	**8.8 — Book sourcing: authenticated authors only (added 2026-07-14).** Every book used for logical grounding must be from a named, verifiable author or institution whose credentials can be stated in one sentence. The litmus: "Would this person or institution be recognized as an authority in their field?" Permitted sources:

	  - **Academic / institutional authors** — named professors, researchers, or intergovernmental bodies (OECD, World Bank, AICPA, ISO).
	  - **Practitioner authors with demonstrated track record** — people who built or ran something significant and wrote about it. Example: Porter (Harvard Business School, five-time McKinsey Award winner), Kahneman (Nobel laureate, Princeton), Damodaran (NYU Stern).
	  - **Practitioner-operator wisdom** — see §8.9 for the separate rules governing books from successful founders, CEOs, and operators.

	  **Absolutely NOT permitted:** unattributed blog posts, marketing reports from SaaS vendors, "thought leadership" with no named author, anonymous GitHub repositories, or summary websites. If you search for a book and the top results are "download PDF free" links from vdoc.pub, kupdf.net, or similar aggregators, that is a signal the book may not be legitimately sourced. Find the official page (publisher site, Project Gutenberg, OpenStax, OECD iLibrary, author's university page) and cite that. Every book in the search phase gets its author's credentials verified before it enters the candidate list.

	  **8.8a — Three-attempt minimum for free-book searches (added 2026-07-14).** Before concluding that a book is not freely available, run at least three distinct search attempts using different strategies. Many books that appear paywalled on the first search are actually freely available — just not at the first URL you tried. The three-attempt protocol is:

	    - **Attempt 1 — Publisher direct.** Search for "[Book Title] [Author] official page PDF free open access." Many authors post their own books for free (Damodaran at NYU, Grigorik at hpbn.co, Google SRE at sre.google). Check the author's personal website, their university page, and the publisher's page.
	    - **Attempt 2 — Public domain / open repositories.** Search for "site:archive.org [Book Title] [Author]" AND "[Book Title] open access OR public domain." Run BOTH queries — archive.org and general open-access search are different things.
	    - **Attempt 3 — Institutional free access.** Search for "[Book Title] [Author] free PDF site:edu OR site:org OR site:gov" and "[Book Title] [Author] Creative Commons OR CC BY." Some books are posted by university libraries, government agencies, or under Creative Commons licenses that the first two attempts miss.
	    - **If all three attempts fail**, the book is genuinely behind a paywall. Document each attempt in the book-requirements.md (URLs searched, results found) so the operator can see the search was thorough. Mark the book as "PAYWALL — needs placement in Agents/_books/" and specify the exact title, edition, ISBN, and publisher.

	**8.8b — Present research results to the user before building (added 2026-07-14).** After completing the 3-attempt research for every book in scope, present the findings in a structured summary BEFORE writing any code. The user must be able to see, at a glance, what was found and what is missing. The summary format is non-negotiable:

	  - **Research results table.** A table with every candidate book: book title, author (with credential: professor/institution/title), search status (FREE with verified URL, PAYWALL with publisher URL + ISBN, or NOT FOUND), and the script it would support.
	  - **Recommendation section.** A clear recommendation: "I can build X scripts today from the Y free sources. Z scripts are blocked until these books are placed in Agents/_books/." Be precise about which scripts and which books.
	  - **User decision point.** Two explicit paths offered to the user: (a) "Proceed with what we have — build the X scripts from free sources now, handle the paywalled books later" OR (b) "I will source the missing books myself and place them in Agents/_books/." The user may also mix — approve the free-built scripts AND commit to sourcing specific paywalled books.
	  - **No building until the user chooses.** The agent must NOT start writing code until the user selects a path. This is rule 0.1 applied at the book-research level. The research phase ends with presentation and a question, not with a first draft.
	  - **If the user sources a book themselves**, the playbook path is: user places PDF in `Agents/_books/` → agent reads it → agent extracts formulas with exact page citations → agent builds script → agent presents it. No skipping steps even if the agent "already knows" the book's content (§8.10 requires the actual text to be open).
	  - **If the research finds fewer than 3 free books per agent**, the summary must explicitly say so and flag the deficit. The user decides whether to proceed with fewer sources or pause until more are acquired.

	**8.9 — Practitioner-operator wisdom: extracting mental models from builders (added 2026-07-14).** Books written by successful founders, CEOs, and operators — people who built significant companies or institutions — are valid sources for the logical layer, even when they contain no mathematical formulas. Their value is different from a textbook: they provide mental models, decision heuristics, point-of-view frameworks, and life lessons battle-tested at scale.

	  Key rules for practitioner-operator sources:

	  - **The author must have actually built something.** "Built something" means: founded or led a company to significant scale, created a new category, turned around a major institution, or generated empirical results at scale. Writing about business without having done it does not qualify. The litmus: "If this person walked into the room, would the operator want their advice on this specific problem?"
	  - **Extraction produces both .py and .md files.** Quantitative material (decision rules, scoring criteria, heuristics that can be formalized) becomes a Python script — same Route B/C discipline as any other logical script. Qualitative material (mental models, leadership philosophy, strategic frameworks that resist formalization) becomes a .md file in Shared OS/logical/ named after the author's core contribution (e.g., thiel-zero-to-one.md, grove-high-output-management.md). The .md file is cited by agents just like a script — it is an asset, not a reference dump.
	  - **Qualitative does not mean unsourced.** Even the .md files carry chapter/page citations. "Thiel says monopoly is good" is useless. "Thiel, Ch.3, pp.39-56: four monopoly characteristics are proprietary technology (10x better), network effects, economies of scale, and branding" is a citable framework.
	  - **Route D with a citation is valid grounding.** Playbook §8.2 Route D says: a book that contains genuine judgment and narrative wisdom produces a cited rubric with NO script. That is fine. The flag moves from "reasoning-based, unsourced" to "reasoning-based, book-cited."
	  - **Coordination with identity (§6.2a).** Practitioner-operator books often double as identity source material. The same book that grounds a logical framework can also inform a department leader's persona. Extract once, use twice: the script or .md grounds decisions, the identity document shapes how the agent thinks and communicates. See §6.2a for the identity side of this rule.
	  - **Not a free pass for internet opinions.** The same authentication rules from §8.8 apply. The author must be named, verifiable, and credibly connected to their claimed achievements. A self-published Kindle book by an unverifiable author with no track record does not qualify.

	**8.10 — Content from the whole book, never from summaries (added 2026-07-14).** Every logical script must be built from the actual content of the source book — the complete work, not a summary, excerpt, blog digest, or third-party Cliff Notes. Summaries strip out the reasoning, the edge cases, the "why" behind the formulas, and the context that makes a framework applicable. A script built from a summary is reasoning-based with extra steps — it inherits the summarizer's judgment, not the author's.

	  The rules are absolute:

	  - **The full book must be accessible during extraction.** Either the agent has the PDF/book open (uploaded to the session, or freely available at a verified URL), or the extraction does NOT proceed. No exceptions. If the book is behind a paywall and hasn't been placed in `Agents/_books/`, the agent stops and asks for it.
	  - **Summary sites are poison.** getAbstract, Shortform, Blinkist, Four Minute Books, book review blog posts, and similar services are explicitly banned as source material. Their content is a second author's interpretation — not the original author's work. If you find yourself reading a summary, stop. You are looking at the wrong thing.
	  - **Free online chapter-by-chapter access counts as the whole book.** Books like Grigorik's *High Performance Browser Networking* (free at hpbn.co) or Google's SRE books (free at sre.google/books) are whole books — just in HTML form. That is fine. Read the chapters, not someone's digest of them.
	  - **Chapter/page citations are mandatory.** Every formula, rule, threshold, or framework extracted into a script carries an exact citation: chapter, section, or page. If you cannot trace a line of the script back to a specific part of the book, the line does not belong in the script. "General recall" of a book is not extraction — it is memory, and memory fails.
	  - **Gutenberg / public domain books are whole books.** Holmes's *The Common Law* on Project Gutenberg is the complete 1881 text. It qualifies. A Wikipedia summary of Holmes's philosophy does not.
	  - **Older editions are fine.** The 4th edition of CLRS is preferred; the 3rd edition is still a whole book by the same authors. Using an older edition because it is freely available is acceptable — the formulas haven't changed. Using a cheat-sheet of CLRS formulas found on a CS student's GitHub is not.
	  - **The litmus test:** If someone who has read the actual book reads the script and says "this captures what's actually in Chapter X, not what some blog said about Chapter X" — you did it right. If they'd recognize the structure, the citations, and the author's actual framework from the code, you extracted from the book. If they'd say "this reads like a Medium post about the book" — you didn't.

	**8.11 — Book-requirements.md must list scripts and source book URLs (added 2026-07-14).** Every agent's `logical/book-requirements.md` serves as the map between the agent's judgments and their source material. It must include, in a format that an operator can scan in 30 seconds:

	  - **Scripts table (dedicated):** A table listing every Shared OS/logical/ script assigned to this agent, with: script filename, source book (full title + author + year), book URL (the official page where the book can be acquired or accessed — publisher site, author's university page, or free-access URL), and the Route (A/B/C/D). If the book is paywalled, the URL is the publisher page + a note: "PAYWALL — place in Agents/_books/."
	  - **Inherited scripts table:** A second table listing every Shared OS/logical/ script this agent inherits (not built for this agent specifically, but used by its skills). Same columns: script, source book, book URL, why this agent needs it.
	  - **Skills → Script Mapping:** A section listing each of the agent's skills and which scripts it imports from Shared OS/logical/, with one-line rationale per import.
	  - **Flag clearance summary:** The existing table mapping each previously-flagged 0.6 judgment to which script cleared it.
	  - **Still pending:** What gaps remain, if any.

	  The litmus for book URLs: Can the operator click one link and see the actual book page (not a summary, not a blog about it)? If no single page exists for a free book, link to the chapter index. The URL must let the operator verify the book is real.

---

## 9. agent.md

One file per agent, at the root of its folder, containing:
- **Summary** — what the agent does, in a few sentences.
- **Purpose** — the specific problems it solves.
- **Position in the org** — department, role, who owns it, how many agents are in the department and their status.
- **Skill roster** — a table per folder (marketplace, custom) showing skill name, status, and source/notes — including anything still pending, named explicitly as pending, not silently omitted.
- **Identity/operational/logical status** — what's built, what's a placeholder, what's not started.
- **Workflow** — the strict, detailed routing logic for how this agent should operate once fully built (which skill handles which kind of request, in what order, escalation points).

Update this file as the agent's build progresses — it should always reflect current reality, not a stale snapshot.

---

## 10. Department Workflow File

One file per department, containing: summary, purpose, working structure, working tree, and working instructions in detail.

**Build this only after every agent in the department is fully built.** Building it early means rewriting it once the rest of the roster exists — wasted work. If asked to build it before the department is done, defer and say why.

---

## 11. Skill File Standard (applies to every SKILL.md, marketplace or custom)

Every skill file needs frontmatter documenting its provenance and clear enough structure that the agent never gets confused about its boundaries. Minimum frontmatter fields:

```yaml
---
name: <skill-name>
type: marketplace | custom
status: <copied verbatim | built by merge | built from scratch | template>
source: <URL, if marketplace>              # omit for from-scratch custom
sources_referenced: <list, if merged>       # omit if single-source or from-scratch
fulfills_catalog_entry: <original catalog name, if it maps to one>
assigned_agent: <agent-name> (<Department> / <role>)
portable: true|false                        # flag any remaining hardcoded specifics
date_added: <date>
# yvon-compile metadata (see §14) — required for marketplace copies, optional
# overrides for custom skills whose sections already carry this information:
tier: 1|2|3|4                               # 1 router · 2 advisory · 3 config-dependent · 4 build/exec
description: "<one line with routing hints>"
triggers: [phrase one, phrase two, ...]
---
```

Body structure for custom skills: Introduction, Purpose, When to Use, Structure/Protocol, Instructions (phase by phase), Output Format, Principles, Fallback, Boundaries with Other Skills. **These headings are parsed by the compiler (§14) — use them exactly**; a skill with creative headings compiles hollow. Marketplace copies keep the source's own structure, with a comment block up top explaining why it was selected and what catalog entry it fulfills — and receive the compile metadata keys above in frontmatter only (body stays verbatim).

---

## 12. Priority Order, Summarized

If you only remember one ordering, remember this:

1. Department → 2. Agent → 3. Discuss skill list → 4. Sort marketplace/custom, **default to marketplace first** → 5. Marketplace skills (search by purpose, present sources, **stop**, then copy, one at a time) → 6. Custom skills (discuss design + tools/scripts, build one at a time) → 7. Identity (leader agent only, one persona) → 8. Operational — **check which of the five subfolders actually apply to this agent, prioritize the most load-bearing one first, skip any that would come out empty**, build one at a time, each with a pre-build discussion → 9. Logical **placeholder** (record the flagged 0.6 judgments + candidate book — see §8's two-touch note) → 10. agent.md (kept current throughout) → 11. Department workflow file (only once the whole department is done) → **12. Compile + reindex (§14): `node cli/skillgen.js <agent>` — zero FILL_INs — then `cd rag && python3 core/chunkify.py --all`; add the routing row to root `CLAUDE.md` §2** → repeat for the next agent.

**Skills come first; logical is a later pass.** You cannot ground judgments that don't exist yet — a skill defines the decisions the agent makes, and only then can §8 know what needs a formula. So during the build, logical is just a placeholder (step 9). The real grounding — Step-Zero classification, extraction, and A/B/C/D artifacts — runs later, when a source book arrives, across every agent that book touches (see §8 and `LOGICAL-SYNTHESIS-PLAN.md`). The one exception: if the source is already in hand at build time, the script can be built *with* the skill (per 5.2), the way van Westendorp and risk-score scripts were.

At every arrow: present what's about to be built, wait for approval, build exactly one thing, present it, wait for review. Speed is not the goal — a structure your friends can trust and extend without guessing is the goal.

---

## 13. The Shared OS / Global Layer

`Shared OS/` holds capabilities that belong to *no single agent* because every agent needs them. The rule of thumb is one line: **agent-specific → lives in the agent's own `custom/`; cross-agent → lives in `Shared OS/` and is cited, not copied.** Building the same capability into ten agents means ten copies to drift and fix; building it once and citing it keeps one source of truth.

**13.1 — Inherited, not owned.** An agent never copies a shared capability into its folder. Its operational `skill/` routing (or the relevant skill file) names the dependency by reference — e.g. *"Shared OS layer (inherited, not owned): verification-before-completion"* — the same way §7's closing note already routes cross-agent capabilities like web search to this layer instead of baking them in locally. The capability is real; the ownership is central.

**13.2 — What lives here.**
  - **Shared skills** — cross-agent capabilities: `verification-before-completion`, `web-search`, `memory-practices`, and similar. Built once, cited by every agent that needs them.
  - **Shared scripts** — a script used fleet-wide lives in `Shared OS/` and is cited by the many skills that call it, rather than duplicated into each.
  - **Shared logical scripts** — the highest-leverage case (see §8.7 and §13.5): a book used by many agents is extracted once as a Python script in `Shared OS/logical/`; agents import from there. The scripts are pure formula libraries — no .md reference files. Extract once, import many.

**13.3 — How an agent uses it.** At build time, when a skill would benefit from something that's really cross-agent, do NOT build it locally (§7's rule). Instead: (a) confirm whether the shared capability exists in `Shared OS/` yet; (b) if it does, cite it from the agent's operational `skill/` file as an inherited dependency; (c) if it doesn't yet, note it as a dependency on the shared layer so it's built there once and inherited — never quietly reproduced inside the agent.

**13.4 — Same build discipline.** Shared artifacts are still built one at a time under rules 0.1/0.2 — the difference is only *where* they live and that they're referenced rather than duplicated. A change to a shared artifact propagates to every agent that cites it, which is the whole point: fix once, fixed everywhere.

**13.5 — Logical scripts live in Shared OS/logical/ (added 2026-07-14).** All logical .py scripts go in `Shared OS/logical/` — one flat folder, no subfolders. Each script is a formula library sourced from a real book with self-tests. The rules:

  - **One flat folder, no nesting.** `Shared OS/logical/` contains .py and .md files. No subfolders, no per-agent subfolders. .md files are permitted only for practitioner-operator wisdom extractions (§8.9) — qualitative mental models extracted from builder-authored books. All other logical artifacts are .py scripts.
  - **Agent logical/ folders are minimal.** Each agent's `logical/` folder contains ONLY `book-requirements.md` (which records what books ground that agent's judgments and where the scripts live). No .py files in agent logical/ folders — they import from `Shared OS/logical/`.
  - **Skills call scripts by import.** An agent's skill file references a logical script as a dependency — e.g., "Financial formulas: import from Shared OS/logical/capital_budgeting.py." The skill owns the domain logic; the script owns the math.
  - **Books produce scripts or cited .md files.** The synthesis pipeline (§8.3) produces Python scripts with self-tests for anything with formulas (Routes A/B/C). Route D (practitioner-operator wisdom, §8.9) may produce a cited .md file instead — qualitative extracts with chapter/page references. The script IS the documentation for mathematical extractions — inline docstrings carry book/section/page citations.
  - **Cross-agent scripts don't get copied.** If vista's roadmap-sync needs forecasting formulas, it imports `Shared OS/logical/forecasting.py` — it does not get its own copy. This is the same rule as §13.1 applied to the logical layer.
  - **Shared OS/logical/ is the system of record.** When a script is updated (bug fix, new edition of the book), every agent that imports it gets the fix automatically. This was the original intent of §8.7's "extract once, cite many" — now enforced at the file level.

---

## 14. The Compile Layer (added 2026-07-20)

Teams/ is the single source of truth; `dist/skills/` is compiled, disposable output. The compiler (`cli/skillgen.js`) reads each agent's sources and emits runtime skills with uniform frontmatter, tier-matched preambles (scope announcement, ground rules, config checks, retrieval), Voice from identity, and a Completion postamble that logs outcomes to `store/telemetry/`. Template + preamble fragments live in `Shared OS/skills/skill-template/`.

**14.1 — Never edit dist/. Never put compiled files in Teams/.** dist/ is overwritten on every compile. Compiled copies inside Teams/ would double-index in the RAG store and create false Gate-3 conflicts. Edit the source, recompile.

**14.2 — Exact headings are contract.** The compiler parses `## Purpose`, `## When to Use`, `## Structure / Protocol`, `## Output Format` literally (§11). Marketplace copies are exempt (their whole body compiles as protocol) but must carry the compile metadata keys in frontmatter: `tier`, `description`, `triggers`.

**14.3 — Tier declaration.** `tier:` in source frontmatter wins; omitted → custom=3, marketplace=2. Tiers: 1 router (scope+log) · 2 advisory (+ground rules, confusion protocol) · 3 config-dependent (+loud `<FILL_IN>` detection) · 4 build/exec (+CAOS retrieval, TASK-SPEC slice, owns-paths).

**14.4 — Tool-requirements table format is fixed.** `| Skill | Required | Optional | Source line |`, the Skill cell matching the skill's directory name (a parenthetical suffix is tolerated). Recognized phrases: "File read", "File write", "File read/write", "Python/shell execution", "web search", "second model". Anything else compiles as a loud `FILL_IN` tools entry — which means the skill ships without its tools until the table is fixed.

**14.5 — Routing files end with the machine-readable block.** Every `operational/skill/<agent>-skill-routing.md` closes with a fenced yaml block opening `# yvon-compile:` listing each skill's `handoffs:` line. Prose above stays canonical for humans; the block is what compiles exactly. Without it the compiler falls back to line-matching heuristics — working, but luck.

**14.6 — Identity compiles from `## Core Traits`.** Department-leader-only rule unchanged (§7). That exact heading in the identity file is what becomes the compiled Voice section across all the leader's skills.

**14.7 — Config `<FILL_IN>`s are debts.** Tier-3+ preambles announce every unfilled config field on every invocation until it is filled or marked `n/a` with a one-line reason. Do not ship an agent and forget its config.

**14.8 — The build loop ends with compile + reindex + toonify.** After any change to a skill, routing, tool, or identity file: `node cli/skillgen.js <agent>` and confirm zero unresolved placeholders and no unexpected FILL_INs, then `cd rag && python3 core/chunkify.py --all` so retrieval indexes the new source, then `node cli/toonify.js --agent <agent-id>` per §0.8 so CIE can read the updated sources. A skill that has not compiled clean is not built (this extends the §12 checklist).

**14.9 — New department checklist.** Department folder + `DEPARTMENT-WORKFLOW.md` + standard agent structure (§6) as before, PLUS: a routing row in root `CLAUDE.md` §2 (an agent missing from the rail is invisible at runtime), and if the department leader holds identity, the `## Core Traits` heading per 14.6.

**14.10 — Orchestration touchpoints.** Multi-agent work routes through meta's `task-dispatch` skill: discovery once, work items as contracts (consumes/produces/owns_paths), DAG not blind-parallel, per-item FAST/BALANCE budgets, sharding (a worker sees only its slice). Spec instances live in `store/tasks/` per `TEMPLATE.yaml`. Compiled skills log invocations and outcomes automatically; honest `partial`/`blocked` outcomes are how anneal improves your skill later — a false "done" poisons the loop.

---

## 15. Metrics & Health (added 2026-07-20)

What "performing well" means, what to measure, which tools measure it, and the exact commands. Builders' duty is small: log honest outcomes, keep compile and config debt at zero. The measurement machinery below does the rest — gauge measures, anneal proposes (Monday scheduled run), the operator approves.

**15.1 — Per-skill runtime metrics.** Source: `store/telemetry/skill-invocations.jsonl` — every compiled skill logs an invocation event (preamble) and a completion event with outcome `done | partial | blocked` (postamble). What the numbers mean:

  - **Invocations high, completions `partial`/`blocked`** → the skill's protocol is broken or its config is unfilled. Anneal finding: fix the source.
  - **Never invoked** → trigger problem (description/triggers don't match how the operator actually asks) or dead weight. Anneal finding: rewrite triggers or retire.
  - **Completion ratio trend** is the skill's health line over weeks — visible per agent on the dashboard `/agents` page.
  - Honest `partial`/`blocked` outcomes are how skills improve; a false `done` poisons the loop (§14.10).

**15.2 — Retrieval metrics.** Source: chunk quality scores in the vector store, updated by the feedback loop (`quality_new = quality_old × 0.95 + outcome × 0.05`). If an agent's sources never surface in retrieval, the content is unreachable no matter how good it is — check after every chunkify rebuild that the agent's key files appear for its own domain queries (retriever test, command below). The agent bonus (+0.15 for own files) makes an agent's skills compete with book wisdom — if they still don't surface, triggers/content need work.

**15.3 — Quality evaluation.** Three layers, in order of formality:

  - **Acceptance criteria** — per work item in the TASK-SPEC (`acceptance:` list). gauge sets the bar; quinn (or the department's verifier) holds the exit gate. Nothing ships on self-assessment.
  - **LLM-as-judge** — `rag/eval/judge.py` scores an output on 6 metrics; `rag/eval/flywheel.py` runs the 5-stage improvement loop (score → cluster failures → propose → retest). A department isn't "done" until its skills have been through at least one judged run.
  - **Field monitoring** — `rag/monitor/watcher.py` watches for attractors (over-retrieved chunks), degradation, coverage gaps, and drift; `rag/monitor/improver.py` runs the weekly analyze → propose → sandbox-test → deploy cycle for pipeline settings (auto-deploys only if all tests pass; anything failing → hold + report).

**15.4 — Mechanical health checks.** Run these; do not eyeball:

  - **Compile cleanliness** — zero unresolved placeholders, no unexpected FILL_IN tool entries (skillgen prints per skill).
  - **Config debt** — count of `<FILL_IN>` fields per agent config; announced by every tier-3+ preamble, shown fleet-wide on `/agents`. Debt of 0 or explicit `n/a` is the only acceptable steady state.
  - **Toonify coverage** — every .md has a .toon (§0.8) or CIE reads nothing.
  - **Index freshness** — chunks.json rebuilt after any source change (§14.8); stale index = agents reasoning on old versions of their own skills.
  - **Fleet pulse** — `yvon doctor` for the all-up check; `verify-caos.py --quick` for the pipeline end-to-end.

**15.5 — Capabilities & command reference (verified against the CLIs):**

| Capability | Command | What it tells you |
|---|---|---|
| Fleet health check | `node cli/yvon.js doctor` | All-up ✅/❌ across engine components |
| List the fleet | `node cli/yvon.js agents` | 46 agents × 7 departments roster |
| Knowledge graphs | `node cli/yvon.js graph` | Rebuilds code + Teams graph reports |
| Live dashboard | `node cli/yvon.js dashboard` (or `cd dashboard && npm run dev`) | Brands, `/agents` observability, Monitor |
| Compile an agent's skills | `node cli/skillgen.js <agent>` | Per-skill tier/version/tools + FILL_IN warnings |
| Rebuild the index | `cd rag && python3 core/chunkify.py --all` (`--status` to inspect) | Chunk counts per file; index freshness |
| Retrieval spot-check | `cd rag && python3 -c "...retrieve('<task>', agent_id='<a>', agent_dept='<d>')..."` (full snippet in root `CLAUDE.md` §4) | Which sources actually surface for a query |
| Pipeline end-to-end | `python3 cli/verify-caos.py --quick` | 5-point smoke: retrieval, injection, formulas, feedback |
| Full test suite | `npm test` / `cd rag && python3 test_runner.py` | 285+ tests across 15 modules |
| Judge an output | `cd rag && python3 eval/judge.py --grade <json>` (`--test` self-tests) | 6-metric quality score |
| Improvement flywheel | `cd rag && python3 eval/flywheel.py` | Score → cluster failures → propose → retest |
| Field monitor report | `cd rag && python3 monitor/watcher.py --report` | Attractors, degradation, coverage gaps, drift |
| Weekly self-improvement | `cd rag && python3 monitor/improver.py --run` | Pipeline-setting proposals; sandbox-tested deploys |
| Feedback loop ops | `cd rag && python3 core/feedback.py <cmd>` | Log/inspect outcome-driven quality updates |
| TOON compression | `node cli/toonify.js --agent <agent-id>` | .toon coverage for CIE (§0.8) |
| Telemetry raw | `cat store/telemetry/skill-invocations.jsonl` | Every invocation + outcome, JSONL |
| Weekly improvement review | scheduled task `yvon-anneal-weekly` (Mon 9am) | anneal's evidence-based proposals, `store/telemetry/anneal-report-<date>.md` |

**15.6 — Reading the numbers is a role, not a habit.** gauge owns thresholds and benchmarks; anneal owns proposals from evidence; scout owns replacing weak skills with better sourced ones; meta approves structural changes; the operator approves everything that touches a source file. A builder who ships a skill, watches its first week of telemetry, and files one honest observation has done their part.
