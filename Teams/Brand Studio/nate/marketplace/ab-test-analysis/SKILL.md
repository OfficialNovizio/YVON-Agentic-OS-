---
name: ab-test-analysis
type: marketplace
status: copied verbatim
source: https://skillsmp.com/creators/phuryn/pm-skills/pm-data-analytics-skills-ab-test-analysis
source_repo: https://github.com/phuryn/pm-skills/tree/main/pm-data-analytics/skills/ab-test-analysis
author: phuryn
copied_verbatim: true
fulfills_catalog_entry: ab-testing-stats (VYON_Skills_Catalog_Full_v2.html, nate/Brand Studio)
assigned_agent: nate (Brand Studio / Growth)
portable: true — pure statistical method, no company specifics
date_added: 2026-07-07
# yvon-compile metadata (auto-derived from skill content 2026-07-20 — review welcome; body verbatim)
tier: 2
description: "Evaluate A/B test results with statistical rigor and translate findings into clear product decisions."
triggers: [ab test analysis]
---

<!--
  Unmodified copy of "ab-test-analysis" (phuryn/pm-skills, 22k★ — the repo already trusted for
  marcus's sources), fulfilling the catalog's ab-testing-stats slot ("sample size, significance,
  peeking discipline: pre-register metric + MDE; no peeking before n; report CI not just p").
  This skill carries all three plus SRM checks, novelty-effect washout, guardrail-metric
  discipline, and the ship/extend/stop/investigate decision table.
  NOTES FOR THIS SYSTEM:
  1. This is the statistical law experiment-backlog's pre-registration phase enforces —
     the two run as one discipline.
  2. It generates and runs Python for the calculations when raw data is provided — one of the
     few Python needs in Brand Studio; noted in nate's tool requirements.
  3. Rule 0.6 note: this is the rare skill that IS formula-grounded (z-tests, power analysis) —
     its outputs are statistics, not rubrics; the rubric flag applies to ICE upstream, not here.
-->

## A/B Test Analysis

Evaluate A/B test results with statistical rigor and translate findings into clear product decisions.

### Context

You are analyzing A/B test results for **$ARGUMENTS**.

If the user provides data files (CSV, Excel, or analytics exports), read and analyze them directly. Generate Python scripts for statistical calculations when needed.

### Instructions

1. **Understand the experiment**:
   - What was the hypothesis?
   - What was changed (the variant)?
   - What is the primary metric? Any guardrail metrics?
   - How long did the test run?
   - What is the traffic split?

2. **Validate the test setup**:
   - **Sample size**: Is the sample large enough for the expected effect size?
     - Use the formula: n = (Z²α/2 × 2 × p × (1-p)) / MDE²
     - Flag if the test is underpowered (<80% power)
   - **Duration**: Did the test run for at least 1-2 full business cycles?
   - **Randomization**: Any evidence of sample ratio mismatch (SRM)?
   - **Novelty/primacy effects**: Was there enough time to wash out initial behavior changes?

3. **Calculate statistical significance**:
   - **Conversion rate** for control and variant
   - **Relative lift**: (variant - control) / control × 100
   - **p-value**: Using a two-tailed z-test or chi-squared test
   - **Confidence interval**: 95% CI for the difference
   - **Statistical significance**: Is p < 0.05?
   - **Practical significance**: Is the lift meaningful for the business?

   If the user provides raw data, generate and run a Python script to calculate these.

4. **Check guardrail metrics**:
   - Did any guardrail metrics (revenue, engagement, page load time) degrade?
   - A winning primary metric with degraded guardrails may not be a true win

5. **Interpret results**:

   | Outcome | Recommendation |
   |---|---|
   | Significant positive lift, no guardrail issues | **Ship it** — roll out to 100% |
   | Significant positive lift, guardrail concerns | **Investigate** — understand trade-offs before shipping |
   | Not significant, positive trend | **Extend the test** — need more data or larger effect |
   | Not significant, flat | **Stop the test** — no meaningful difference detected |
   | Significant negative lift | **Don't ship** — revert to control, analyze why |

6. **Provide the analysis summary**:
   ```
   ## A/B Test Results: [Test Name]

   **Hypothesis**: [What we expected]
   **Duration**: [X days] | **Sample**: [N control / M variant]

   | Metric | Control | Variant | Lift | p-value | Significant? |
   |---|---|---|---|---|---|
   | [Primary] | X% | Y% | +Z% | 0.0X | Yes/No |
   | [Guardrail] | ... | ... | ... | ... | ... |

   **Recommendation**: [Ship / Extend / Stop / Investigate]
   **Reasoning**: [Why]
   **Next steps**: [What to do]
   ```

Think step by step. Save as markdown. Generate Python scripts for calculations if raw data is provided.

---

### Further Reading

- [A/B Testing 101 + Examples](https://www.productcompass.pm/p/ab-testing-101-for-pms)
- [Testing Product Ideas: The Ultimate Validation Experiments Library](https://www.productcompass.pm/p/the-ultimate-experiments-library)
- [Are You Tracking the Right Metrics?](https://www.productcompass.pm/p/are-you-tracking-the-right-metrics)
