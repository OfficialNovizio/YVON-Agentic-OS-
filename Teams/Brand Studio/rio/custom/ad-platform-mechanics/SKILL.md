---
name: ad-platform-mechanics
type: custom
status: built from scratch — catalog listed this slot as MARKETPLACE ("meta-tiktok-mechanics"), converted per the 2026-07-07 static-vs-dynamic hook discussion: platform ad mechanics are the most volatile knowledge in the department, so a static marketplace copy would rot. Rebuilt as durable principles + dated per-platform playbooks (pulse's pattern, paid edition).
fulfills_catalog_entry: meta-tiktok-mechanics (VYON_Skills_Catalog_Full_v2.html, rio/Brand Studio) — genericized off the two hardcoded platforms; any ad platform gets a playbook
assigned_agent: rio (Brand Studio / Ads)
portable: true — platforms come from config; playbooks are per-business, dated, refreshable
includes: assets/ad-platform-playbook-template.md
date_added: 2026-07-07
---

## Introduction

ad-platform-mechanics carries what every ad platform requires *beyond* strategy: tracking hygiene, auction behavior, creative-format specs, learning-phase rules. It splits the knowledge by shelf life, exactly like pulse's hook design: a small set of **durable principles** (below — true across platforms and years) and a **dated playbook per ad platform** (volatile: current specs, auction quirks, policy lines — reviewed on cadence, refreshed from operator observations, kai's data, and eventually the shared research layer).

## Durable Principles (the static layer — platform-agnostic, stable)

1. **Tracking before spending.** Pixel + server-side events (CAPI-class) verified end-to-end before a dollar moves; broken attribution makes every later decision fiction. iOS/cookie erosion means server-side is the default posture, not the upgrade.
2. **Learning phases are real.** Platforms calibrate delivery on fresh campaigns/budgets; edits and budget thrash during calibration reset it. Threshold checks respect this (ad-thresholds cites it).
3. **Creative fatigue is a curve, not an event.** Frequency up + CTR down = rotate; refresh cadence belongs in the playbook, dated.
4. **The platform grades its own homework.** Reported ROAS embeds view-through inflation and cannibalized organic; independent reconciliation (kai) and incrementality thinking are standing practice.
5. **Policy compliance is a gate.** Each platform's ad policies (claims, categories, targeting restrictions) are law for that channel; jurisdiction rules (e.g., Canadian advertising standards) enter as operator-supplied inputs — never asserted from memory.
6. **Structure follows signal.** Consolidate where the platform optimizes broadly, segment only where messaging genuinely differs (the retargeting skill's segmentation logic governs *when* it differs).

## The Volatile Layer

Everything else — current format specs, auction/bidding options, placement quirks, "what works this quarter" — lives in `assets/ad-platform-playbook-template.md` instances, one per platform per brand, every entry dated, reviewed at `playbook_review_cadence`. An undated claim about an ad platform is treated as expired.

## When to Use

Triggers: "platform best practice," "why is delivery weird," "set up tracking right," "specs for [platform]," and as the reference layer inside every rio campaign action.

## Instructions

1. **Setup (once per platform):** run the durable principles as a checklist (tracking verified, policies reviewed with the operator, learning-phase rules noted), then instantiate the playbook from the template — current specs and norms, all dated.
2. **In operation:** campaign actions cite the playbook (formats, refresh cadence, learning-phase windows); anything the playbook doesn't cover gets answered provisionally and *added, dated*.
3. **On cadence:** review the playbook — kai's data and operator observations refresh it; stale entries are re-confirmed or struck. The refresh log is the audit trail.

## Principles

- **Durable and volatile never mix.** Principles don't date; specs always do.
- **Undated platform claims are expired.**
- **Policy and jurisdiction lines are operator-supplied law**, not remembered folklore.
- **Self-annealing**: every surprising delivery behavior becomes a dated playbook entry.

## Fallback

- New platform, no playbook → durable principles + template instantiation before first spend.
- No research capability → operator observations + kai's data are the only refresh sources (stated); the shared web-search layer extends this when built.

## Boundaries with Other Skills

- `ad-thresholds` (sibling) consumes the learning-phase and attribution notes; `sales-retargeting` (sibling) owns strategy and segmentation logic.
- **pulse's** platform playbooks cover organic mechanics; these cover paid — same pattern, separate files (a platform's organic and ad systems drift independently).
- **kai** supplies the reconciliation data that refreshes playbooks. **sentinel/board**: policy-violating ad requests are refused and flagged, not optimized.
