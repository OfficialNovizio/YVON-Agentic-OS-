---
name: funnel-analysis
type: marketplace
status: copied verbatim
source: https://skillsmp.com/creators/productfculty-aipm/pm-copilot-by-product-faculty/skills-funnel-analysis
source_repo: https://github.com/Productfculty-aipm/PM-Copilot-by-Product-Faculty/tree/main/skills/funnel-analysis
author: Productfculty-aipm (Product Faculty)
copied_verbatim: true
fulfills_catalog_entry: funnel-analysis (VYON_Skills_Catalog_Full_v2.html, nate/Brand Studio)
assigned_agent: nate (Brand Studio / Growth)
portable: true — diagnostic method, no company specifics
date_added: 2026-07-07
# yvon-compile metadata (auto-derived from skill content 2026-07-20 — review welcome; body verbatim)
tier: 2
description: "You are analyzing a conversion funnel to identify where users drop off, why they drop off, and what actions would most improve overall conversion."
triggers: [funnel analysis]
---

<!--
  Unmodified copy of "funnel-analysis" (Product Faculty PM-Copilot, v2.0.0), fulfilling the
  catalog's funnel-analysis slot ("instrument stages; find largest drop; hypothesize + test").
  Chosen for its leaky-bucket prioritization (absolute drop × recovery value × actionability),
  the per-drop diagnosis table, and its Step 7 output ending in RECOMMENDED EXPERIMENTS —
  which feed directly into experiment-backlog's intake, making the two skills one loop.
  NOTES FOR THIS SYSTEM:
  1. Step 1's "memory/user-profile.md" and "context/company/analytics-baseline.md" are the
     source repo's second-brain layout — in this system they resolve to kai's brand-context
     baselines and the configured metrics sources.
  2. Funnel data comes from kai (instrumented) or operator exports; unmeasurable stages are
     an instrumentation finding for kai, not a guess.
-->

# Funnel Analysis

You are analyzing a conversion funnel to identify where users drop off, why they drop off, and what actions would most improve overall conversion.

Framework: AARRR (Pirate Metrics — Acquisition, Activation, Retention, Revenue, Referral), Dave McClure's funnel stages.

## Step 1 — Load Context

Read `memory/user-profile.md` for product stage and business model. Read `context/company/analytics-baseline.md` for existing conversion benchmarks.

## Step 2 — Funnel Data Input

Ask the user to provide the funnel data. Accept in any format:
- Step names and conversion rates at each step
- Raw numbers (absolute users at each step)
- A description of the funnel steps and approximate drop-off

If the user describes the funnel without numbers, help them estimate or identify where to find the data.

## Step 3 — Calculate Key Metrics

From the funnel data, calculate:
- **Step-by-step conversion rate:** Users at step N ÷ users at step N-1
- **Overall funnel conversion:** Users at the final step ÷ users at the first step
- **Absolute drop-off:** Users lost at each step (in absolute numbers, not just %)
- **Revenue impact of each step:** Absolute drop-off × revenue per converted user = value of fixing this step

## Step 4 — Identify the Biggest Opportunity

Find the step with the highest combination of:
1. Large absolute drop-off (many users lost here)
2. High recovery value (if conversion improved by 10%, how much total revenue or engagement would that add?)
3. Actionability (is there a known reason for the drop? Is there a plausible fix?)

This is the "leaky bucket" — the one step that, if fixed, would most improve the entire funnel.

## Step 5 — Diagnose Each Major Drop

For each step with > 20% drop-off:

**What happens at this step?** (What does the user have to do?)
**Why do users drop here?** (Likely causes — look for patterns in: UX friction, value perception, trust signals, cognitive load, technical issues)
**What would you need to know to fix it?** (Qualitative insight from interviews? Quantitative data from heatmaps or session recordings? An A/B test?)

**Common funnel drop diagnoses:**

| Drop Location | Likely Cause | Diagnostic |
|---|---|---|
| Landing page → signup | Value prop unclear; sign-up friction | Session recording; copy test |
| Signup → first action | Onboarding too long; time to value too slow | Time to first action analysis; session replay |
| First action → second action | Not seeing value from first action | Interview: "what did you expect to happen?" |
| Free → paid | Paywall too early; wrong trigger; poor value communication | Behavioral analysis before upgrade prompt |
| Paid → renewal | Product not becoming habit; poor ongoing value | Cohort analysis; engagement depth |

## Step 6 — Prioritization Matrix

For each major drop:
- Volume of impact (absolute users × value per conversion)
- Effort to fix (quick UX fix vs. major engineering)
- Confidence that the fix will work (high evidence vs. hypothesis)

Recommend the top 1–2 improvements to try in the next sprint.

## Step 7 — Output

Produce:
- Funnel visualization (text table with step names, conversion rates, absolute drop-off)
- Revenue/engagement impact per step (if baseline data is available)
- Diagnosis for each major drop with most likely cause
- Prioritized fix recommendations
- Recommended experiments (one per top-priority step)
