---
name: risk-register
type: custom (merge of 2 marketplace sources + existing script)
status: rebuilt 2026-07-12 — merged Anthropic risk-assessment methodology + Sentinel Stack auto-population + custom risk_score.py
based_on_catalog_entry: none — new; the department's spine (CYBERSECURITY-REDESIGN-PLAN-v2 §1.2)
sources_merged:
  - Anthropic risk-assessment (skillsmp.com/skills/anthropics-knowledge-work-plugins-operations-skills-risk-assessment-skill-md) — official Anthropic skill, 19,987 stars. 6-category risk framework (Operational, Financial, Compliance, Strategic, Reputational, Security). Low/Medium/High methodology. Prioritized register with mitigations.
  - Sentinel Stack risk-register (skillsmp.com/es/creators/aadityaparab/sentinel-stack/skills-risk-register) — by aadityaparab. Living register auto-populated from guardrail detections. 5×5 likelihood-impact matrix. Treatment plans (accept/mitigate/transfer/avoid). Leadership reports. Data Privacy, AI Ethics, Regulatory, Operational, Reputational, Financial categories.
  - Custom risk_score.py — existing tested script for deterministic 5×5 scoring.
note: Marketplace sources are integrated into this custom merge per playbook §4.6 and §4.8. The "acceptance routes to board" and "append-only" disciplines are fleet IP added as custom overlay.
assigned_agent: warden (Cybersecurity / CISO — leader)
portable: true
includes: assets/risk-register-template.md · scripts/risk_score.py (tested)
date_added: 2026-07-10
date_rebuilt: 2026-07-12
---

# Risk Register

## Introduction
The living record of the business's security risks, combining Anthropic's battle-tested risk-assessment methodology with Sentinel Stack's automated guardrail integration and deterministic scoring via risk_score.py. Each risk is an asset × threat × vulnerability, classified into one of 6 risk categories, scored by likelihood × impact, with a treatment decision (mitigate / accept / transfer / avoid) and an owner. It is the department's spine — every posture gap, every finding, every incident lesson lands here as a risk to treat, and **acceptance above a threshold is the operator's/board's call, never warden's.**

Methodology sourced from: **Anthropic risk-assessment** (official, 19,987 stars) for the assessment framework + **Sentinel Stack risk-register** (by aadityaparab) for the auto-population and reporting patterns. The integration and fleet-specific disciplines (board-gated acceptance, append-only tracking, crown-jewel weighting) are custom.

## Purpose
"Are we secure enough?" is unanswerable without a risk register; with one it becomes "here are our top risks, their treatments, and what the operator has explicitly accepted." It turns security from vibes into a prioritized, owned, decision-backed list — and it's the artifact that makes the "every risk is owned, treated, or accepted — never ignored" rule real.

## When to Use
- A new risk surfaces (framework gap, bastion misconfig, cortex incident, third-party finding, threat-intel).
- Prioritizing security work ("what should we fix first").
- A risk-acceptance decision is needed (routes to operator/board).
- Periodic review (config cadence).
- Auto-populated from guardrail detections (DLP flags, 4-eyes violations, behavioral anomalies — per Sentinel Stack pattern).

## Structure / Protocol

```
IDENTIFY (asset × threat × vulnerability — from framework gaps, findings, incidents, intel, guardrail detections)
  → CLASSIFY into 1 of 6 categories: Operational / Financial / Compliance / Strategic / Reputational / Security
    → SCORE (likelihood × impact on defined scale via scripts/risk_score.py)
      → PRIORITIZE (score-ranked × crown-jewel weight; top risks drive department priorities)
        → TREAT (mitigate→owner+control / transfer→insurance/vendor / avoid→stop / ACCEPT→operator|board)
          → OWN (every risk has an owner + review date)
            → TRACK (append-only; treatments and acceptances dated, never silently reversed)
              → REPORT (leadership summary: top risks, trends, risk-appetite drift — per Sentinel Stack pattern)
```

## Instructions

### Phase 1 — Identify & Classify
1. **A risk is asset × threat × vulnerability.** Not "hackers are scary" — "customer PII (asset) exposed via SQL injection (threat) on an unpatched endpoint (vuln)." Concrete risks can be scored and treated; vague fears can't.
2. **Classify into one of 6 categories** (per Anthropic risk-assessment framework):
   - **Operational** — process failures, system outages,供应链 disruptions
   - **Financial** — budget overruns, revenue impact, fraud, treasury
   - **Compliance** — regulatory violations, legal exposure, audit findings
   - **Strategic** — market shifts, competitive threats, M&A risk
   - **Reputational** — brand damage, PR crises, trust erosion
   - **Security** — breaches, vulnerabilities, access incidents, third-party breaches

### Phase 2 — Score
3. **Score consistently.** likelihood × impact on the configured scales; `risk_score.py` computes and ranks so scoring is repeatable, not mood-based. The scales themselves are operator-set (rule 0.5) and flagged reasoning-based (0.6) until the risk-management text lands.
4. **Auto-populate where possible** (per Sentinel Stack pattern). Guardrail detections (DLP flags, 4-eyes violations, behavioral anomalies) automatically create provisional risk entries with suggested scores — warden reviews and confirms, never auto-approves.

### Phase 3 — Treat
5. **Four treatments, one is a decision.** mitigate/transfer/avoid are warden's to recommend and route; **accept is the operator's or board's** — above the `risk_acceptance_threshold` it goes to board (Governance), precedent archives. Silent acceptance is an incident.
6. **Every risk owned, dated, reviewed.** An unowned risk is an ignored risk. Owners drive the treatment; review dates keep the register live (stale risks are re-scored, not trusted).

### Phase 4 — Track & Report
7. **The register is append-only.** Treatments, acceptances, and re-scores are dated entries; a downgraded risk keeps its history (precedent's discipline) so "why did we accept this" is always answerable.
8. **Generate leadership reports** (per Sentinel Stack pattern). Top-N risks by score, trends (risks increasing/decreasing), risk-appetite drift assessments, and treatment-progress summaries — surfaced to warden and the operator on cadence.
9. **Feed and be fed.** Gaps (framework), findings (bastion/cortex/third-party), guardrail detections, and incident lessons (cortex) become risks here; the top risks drive the whole department's priorities.

## Output Format
```
## Risk: [id] — [asset × threat × vuln]
Category: [Operational/Financial/Compliance/Strategic/Reputational/Security]
Likelihood × Impact = Score [scale, flagged] · Crown-jewel: [y/n]
Auto-populated: [y/n — from which guardrail/source]
Treatment: [mitigate→owner+control / transfer / avoid / ACCEPT→operator|board]
Owner · Review date · Status (open/treated/accepted-by-[who]-on-[date])
Leadership report: [top-N rank · trend · risk-appetite flag (if drifting)]
```

## Principles
- **Asset × threat × vulnerability** — concrete risks, not fears.
- **6-category classification** — per Anthropic risk-assessment framework.
- **Scored consistently** (script-computed); scales operator-set + flagged.
- **Auto-populated but never auto-approved** — guardrail detections create provisional entries; warden reviews.
- **Accept is the operator's/board's decision** — above threshold → board; never silent.
- **Every risk owned, dated, reviewed** — unowned = ignored.
- **Append-only** — the acceptance history is the value.
- **Leadership reporting** — register is not a list; it's a decision-support tool.
- **The register drives priorities** — top risks first, crown-jewels weighted.

## Fallback
- No scoring scales configured → use a default 5×5 likelihood×impact matrix, loudly labeled provisional; recommend scales to the operator.
- Too many risks to treat → prioritize by score × crown-jewel; untreated lower risks are explicitly accepted-with-review by the operator, logged — never an untracked backlog.
- No guardrail feeds configured → operate in manual-entry mode (core identification/scoring/treatment workflow still works).

## Boundaries with Other Skills
- **security-policy-framework** (sibling): framework gaps become risks here; controls are the mitigations.
- **third-party-risk / security-exception-process** (siblings): vendor findings and exceptions are risks/accepted-risks tracked here.
- **board (Governance)**: risk acceptance above threshold gates there; precedent archives.
- **bastion / cortex / veil**: their findings and incidents feed the register; their treatments are its mitigations.
- **cortex incidents → anneal**: a realized risk (incident) is a lesson that re-scores the register.
- **Sentinel Stack guardrails** (if deployed): DLP/4-eyes/behavioral detections auto-populate provisional entries.
