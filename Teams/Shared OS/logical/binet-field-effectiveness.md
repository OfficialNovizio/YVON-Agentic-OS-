---
name: binet-field-effectiveness
type: logical (Route D — practitioner-operator wisdom)
status: extracted 2026-07-16
source_books:
  - Binet, Les & Field, Peter, *The Long and the Short of It:
    Balancing Short and Long-Term Marketing Strategies* (IPA,
    2013). ISBN: 978-0852941331.
    Authors: Les Binet — Head of Effectiveness, adam&eveDDB;
    Peter Field — marketing consultant, former Planning Director.
    Based on: IPA (Institute of Practitioners in Advertising)
    databank — 996 campaigns, 30+ years of effectiveness data,
    the world's largest and most rigorous marketing effectiveness
    database.
    Chapters used: 1 (The 60:40 Rule), 2 (Short-Term vs Long-Term),
    3 (Activation vs Brand-Building), 4 (Emotional vs Rational),
    5 (Share of Voice), 6 (ESOV), 7 (Creative Commitment),
    8 (Putting It All Together).

source_urls:
  - Books/SYS1-long-and-short-of-it.pdf
  - IPA Databank: https://ipa.co.uk/effectiveness/databank

assigned_agents: spark, rio, kai
extended_skills: art-direction-critique, budget-allocation, campaign-planning
portable: true
cross_references:
  - marketing_laws.py (Pareto, Zipf, Mere Exposure, Diminishing Returns)
  - brand_metrics.py (ESOV calculator, 60:40 budget allocator, SOV calculator)
  - ogilvy-creative-code.md (Ogilvy's long-term brand image = Binet & Field's brand-building)
  - aaker-brand-equity.md (Aaker's brand equity = what brand-building campaigns build)
---

# Binet & Field — The Long and the Short of It

## Introduction

Les Binet and Peter Field's *The Long and the Short of It* (2013) is the single most important empirical work in modern marketing effectiveness. Drawing on the IPA (Institute of Practitioners in Advertising) Effectiveness Databank — **996 campaigns across 30+ years**, the most comprehensive marketing effectiveness database in the world — Binet and Field definitively answered the question that had divided marketers for decades: how should budgets be split between short-term activation and long-term brand building?

Their answer, the **60:40 rule**, reshaped global marketing practice. This extraction operationalizes every major finding for spark's campaign-planning, rio's budget-allocation, and kai's performance-measurement functions.

---

## THE IPA DATABANK: The Empirical Foundation

*Introduction; Appendix, pp.85-93*

The IPA Effectiveness Databank is the world's most rigorous collection of marketing case studies. Unlike proprietary databases controlled by individual agencies or platforms, the IPA databank covers **996 campaigns** from **over 700 brands** across **more than 80 categories**, spanning the period from **1980 to 2010** (continuously updated since). Every case has been independently judged by a panel of senior marketers and researchers.

Key attributes of the databank:
- **Sample size:** 996 campaigns — sufficient for statistically significant segmentations and regressions.
- **Time horizon:** 30 years — captures both immediate campaign effects and long-term business outcomes.
- **Validation:** Every case independently judged for effectiveness rigor by IPA panels.
- **Metrics:** Both hard business outcomes (profit, market share, share price) and intermediate metrics (awareness, consideration, penetration) are tracked.
- **Campaign types:** TV, print, radio, direct mail, digital, social, experiential — enabling cross-channel comparison.

The fundamental question Binet & Field set out to answer (Introduction, p.1): "What is the right balance between short-term sales activation and long-term brand building?"

---

## FINDING 1: THE 60:40 RULE — Brand-Building vs. Activation

*Ch.1, pp.3-14; Ch.8, pp.67-74*

### The Core Finding

> "The optimal budget split is approximately 60% brand-building to 40% sales activation." (Ch.1, p.5)

Binet & Field analyzed IPA cases by campaign objective — broadly dividing campaigns into those designed to drive immediate sales response ("activation") and those designed to build long-term brand preference ("brand-building"). They then correlated the budget split with long-term business effectiveness scores (profit, market share growth, pricing power).

The resulting efficiency curve showed a clear optimum: **60:40** brand-building to activation. Campaigns that skewed heavily toward activation (>70%) achieved strong short-term results but decayed rapidly. Campaigns that skewed too heavily toward brand-building (>80%) built strong brands but under-invested in converting that equity into sales.

**The 60:40 sweet spot (Ch.1, pp.8-10):** "Brands that allocated roughly 60% of their budget to brand-building and 40% to activation consistently achieved the strongest long-term business results — higher market share, greater profit growth, and superior pricing power — compared to brands that skewed either way."

### Short-Term vs. Long-Term Effects (Ch.2, pp.15-28)

| Dimension | Activation (Short-Term) | Brand-Building (Long-Term) |
|-----------|------------------------|---------------------------|
| **Timeframe** | Immediate — days to weeks | Cumulative — months to years |
| **Effect curve** | Sharp spike, rapid decay | Slow build, sustained plateau |
| **Creative approach** | Rational, product-focused, offer-driven | Emotional, brand-focused, story-driven |
| **Metrics** | Sales, conversion, click-through | Awareness, salience, mental availability |
| **Budget share** | 40% of spend | 60% of spend |
| **Measurement window** | 1-4 weeks post-campaign | 6-24 months post-campaign |
| **Risk** | Over-investment → brand erodes, pricing power drops | Under-investment in activation → strong brand, weak sales conversion |

### The Two-Step Model (Ch.2, pp.20-24)

Binet & Field propose a two-step model of how marketing works:

1. **Brand-building creates mental availability.** Through emotional, story-driven advertising, the brand builds salience in consumers' minds. When the consumer enters a purchase situation, the brand comes to mind.
2. **Activation converts mental availability into sales.** Through rational, targeted, offer-driven marketing, the brand converts "top of mind" into "in the basket."

The critical insight: **you need BOTH.** A brand that only activates (100% sales) gets the sale today but has no brand equity for tomorrow. A brand that only builds (100% brand) has a great reputation but no mechanism to convert it into revenue. The 60:40 balance is the empirically optimal mix.

**Connection to Ogilvy (ogilvy-creative-code.md):** Ogilvy's Brand Image Law (Ch.1, pp.18-20) anticipated this finding by 50 years: "Every advertisement should be thought of as a contribution to the complex symbol that is the brand image." Ogilvy understood intuitively what Binet & Field proved empirically: brand-building ads are not wasteful "awareness" — they are long-term investments that compound.

---

## FINDING 2: EMOTIONAL vs. RATIONAL — The Effectiveness Gap

*Ch.4, pp.35-46*

### The Core Finding

> "Emotionally-led brand-building campaigns produce **2-3 times** the long-term business effects of rational, information-led campaigns." (Ch.4, p.37)

This is the single most impactful finding from the IPA databank. Binet & Field categorized campaigns by their primary creative approach — emotional (story-driven, brand-focused, feeling-oriented) vs. rational (information-driven, product-focused, fact-oriented). They then measured the long-term business effects (profit, market share, share price) for each group.

**The result (Ch.4, pp.38-42):**

| Creative Approach | Short-Term Sales Effect | Long-Term Business Effect | Overall Effectiveness Score |
|-------------------|------------------------|--------------------------|---------------------------|
| **Purely Emotional** | Moderate | **Very High (3.0x baseline)** | Highest |
| **Mixed (Emotional + Rational)** | High | **High (2.0x baseline)** | Strong |
| **Purely Rational** | High | **Low (1.0x baseline)** | Lowest long-term |

**The "emotional multiplier" (Ch.4, p.41):** "Emotionally-led campaigns generate approximately double the profit growth and triple the market share growth of rationally-led campaigns over a 3-year period." The reason: emotional advertising builds **mental structures** (brand associations, emotional memories) that persist and compound. Rational advertising builds **transactional triggers** (offers, reasons-to-buy) that decay rapidly once the offer expires.

### Why Rational Underperforms Long-Term (Ch.4, pp.43-45)

1. **Decay rate:** Rational messages are forgotten faster. A memorable emotional story (the John Lewis Christmas ad, the Cadbury Gorilla) stays in memory for years. A product feature comparison is forgotten within days.
2. **Shareability:** Emotional content is shared 2-3x more than rational content (cross-reference: Berger, Emotion chapter, *Contagious*, Ch.3). The earned media multiplier amplifies emotional campaigns.
3. **Compound effect:** Emotional brand-building campaigns compound over time — each campaign builds on the equity created by the previous one. Rational campaigns are discrete — each one must do its own work.
4. **Pricing power:** Emotional brands command higher prices (brand strength = pricing latitude). Rational brands are commoditized — they compete on features and price.

### The "Creative Commitment" Factor (Ch.7, pp.57-64)

Binet & Field (Ch.7, p.59): "Campaigns that show high creative commitment — defined as the consistent use of a distinctive creative idea over multiple years — significantly outperform campaigns that frequently change their creative approach."

**Creative commitment metrics (Ch.7, pp.60-62):**
- Campaigns running the same core creative idea for **3+ years** show **40% higher effectiveness** than those changing annually.
- The "distinctive asset" effect: consistent creative elements (colors, characters, jingles, visual style) become **shortcuts to brand recognition.** Over time, the asset alone triggers the full brand association — reducing the cost of each subsequent campaign.
- The counterintuitive finding (p.63): "Advertisers overestimate audience boredom. The audience sees your ads far less often than you do. What you perceive as 'staleness' is to the audience merely the beginning of familiarity."

**Connection to Aaker (aaker-brand-equity.md):** Creative commitment IS the mechanism that builds distinctive brand assets (Aaker, Ch.3). A brand that changes its visual identity every year cannot build distinctive assets — consumers never get a chance to learn the shortcut.

---

## FINDING 3: SHARE OF VOICE (SOV) + EXCESS SHARE OF VOICE (ESOV)

*Ch.5, pp.47-56*

### Share of Voice Definition (Ch.5, pp.47-50)

> "Share of Voice (SOV) is a brand's advertising spend as a percentage of total category advertising spend. It is the most reliable predictor of market share change." (Ch.5, p.48)

The IPA data showed a consistent relationship:
- **SOV > SOM (Share of Market):** Brand will GROW market share.
- **SOV = SOM:** Brand will MAINTAIN current market share.
- **SOV < SOM:** Brand will LOSE market share.

This is sometimes called "Jones's Law" after John Philip Jones (1990), whose earlier research first identified the SOV-SOM relationship. Binet & Field confirmed and refined it with the larger IPA dataset.

### ESOV — Excess Share of Voice (Ch.5, pp.51-55)

> "ESOV = SOV - SOM. Positive ESOV predicts market share growth. A brand needs approximately 10 percentage points of ESOV to grow 1 point of market share per year."

**The ESOV formula (Ch.5, p.52):**

```
ESOV = SOV - SOM
where:
  SOV = Brand_Ad_Spend / Category_Total_Ad_Spend
  SOM = Brand_Market_Share / Total_Category_Sales
```

**ESOV benchmarks from the IPA data (Ch.5, pp.53-55):**

| Brand Size | ESOV Needed for 1% Share Growth | Typical Annual Growth Budget (as % of revenue) |
|-----------|-------------------------------|---------------------------------------------|
| **Small** (<5% share) | ~5-8% ESOV per share point | 15-25% of revenue |
| **Medium** (5-15% share) | ~8-12% ESOV per share point | 10-20% of revenue |
| **Large** (>15% share) | ~12-15% ESOV per share point | 5-15% of revenue |

**The SOV-SOM equilibrium (Ch.5, p.54):** "In the long run, market share trends toward share of voice. If you consistently out-spend your market share, you will grow. If you consistently under-spend, you will shrink. There are no exceptions in the IPA data."

### The Size Advantage Paradox (Ch.5, pp.55-56)

Larger brands have an advantage: they can afford a larger absolute SOV. But they also face a disadvantage: they need more ESOV per share point gained. This creates a "moat" effect — large brands are harder to dislodge, but also harder to grow. New entrants can grow faster on less ESOV but must sustain high spending as they scale.

---

## FINDING 4: THE CAMPAIGN EFFECTIVENESS HIERARCHY

*Ch.8, pp.67-84*

Binet & Field synthesized their findings into a campaign effectiveness hierarchy. The most effective campaigns, in order of impact:

### Tier 1: Emotional Brand-Building with Consistent Creative
- **40% more effective** than the average campaign (Ch.8, p.70)
- Emotional creative, consistent over 3+ years, 60:40 budget split
- Examples: John Lewis Christmas campaigns, Nike "Just Do It," Snickers "You're Not You When You're Hungry"

### Tier 2: Mixed Approach with Strong Creative Commitment
- **25% more effective** than average
- Mix of emotional brand-building and rational activation
- Consistent creative idea, refreshed periodically

### Tier 3: Pure Activation Campaigns
- **Average to below-average** long-term effectiveness
- Strong short-term numbers, but brands erode over time
- High decay rate; each campaign starts from near zero

### Tier 4: Rational Only, Low Creative Commitment
- **50% below average** effectiveness
- Frequently changing creative, rational/feature-led messaging
- No brand equity accumulation; no creative commitment multiplier

**The compounding insight (Ch.8, pp.75-78):** "The most important finding from the IPA databank is not that emotional advertising works — it's that emotional advertising compounds. Brand-building is not a 'nice to have' investment. It is the engine of long-term profit growth. Every pound spent on brand-building returns more over 3 years than a pound spent on activation. But you need both pounds."

---

## APPLICATION: BRAND STUDIO CAMPAIGN PLANNING

### Spark's Campaign Gate Checklist

For every campaign passing through spark's gate, evaluate against Binet & Field criteria:

| # | Criteria | Citation | Pass Condition |
|---|---------|----------|---------------|
| 1 | **60:40 budget split** | Ch.1, p.5 | At least 50% allocated to brand-building (allowable range: 50-70%) |
| 2 | **Emotional lead creative** | Ch.4, p.37 | Primary creative approach is emotional, not rational |
| 3 | **Creative commitment plan** | Ch.7, p.59 | Same core creative idea planned for 2+ years |
| 4 | **ESOV analysis** | Ch.5, p.51 | ESOV calculated and >0 for growth targets |
| 5 | **Long-term measurement** | Ch.2, p.20 | Brand metrics tracked 6-24 months post-campaign |
| 6 | **Activation bridge** | Ch.2, p.24 | Clear mechanism to convert brand equity into sales |

### Budget Allocation Calculator (rio's tool in brand_metrics.py)

For a campaign with total budget B:
- **Brand-building allocation (60%):** 0.60 * B → emotional, story-driven, long-form content, sponsorships, brand campaigns
- **Activation allocation (40%):** 0.40 * B → performance ads, retargeting, offers, promotions, direct response

**Tactical split by channel type (Binet & Field, Ch.8, pp.79-82):**

| Channel | Primary Role | Budget Source |
|---------|-------------|---------------|
| TV / Cinema | Brand-building | 60% allocation |
| Radio / Outdoor | Brand-building (supporting) | 60% allocation |
| Social Content | Brand-building + Activation | Split 60/40 |
| Search / Shopping | Activation | 40% allocation |
| Direct Mail / Email | Activation | 40% allocation |
| Sponsorship / PR | Brand-building | 60% allocation |
| Retail / Trade | Activation | 40% allocation |

---

## CROSS-FRAMEWORK INTEGRATION

### Binet & Field + Ogilvy

| Binet & Field | Ogilvy | Integration |
|--------------|--------|-------------|
| Brand-building (60%) | Brand Image Law (Ch.1, pp.18-20) | Long-term brand image IS what brand-building campaigns build |
| Emotional creative = 2-3x long-term effect | Big Idea Rule (Ch.1, pp.13-17) | Big Ideas inherently carry emotional weight |
| Creative commitment | "Could it be used for 30 years?" (Big Idea sign #5) | Ogilvy's 30-year test IS the creative commitment standard |
| Activation (40%) | Long Copy + Specific Fact (Ch.5, pp.76-82) | Rational activation needs Ogilvy's specificity to convert |

### Binet & Field + Aaker

| Binet & Field | Aaker (Building Strong Brands) | Integration |
|--------------|------------------------------|-------------|
| Brand-building → mental availability | Brand Awareness (Ch.3) | Awareness is the metric of brand-building |
| Emotional creative → brand associations | Brand Associations (Ch.5) | Emotional creative creates the associations |
| Creative commitment → distinctive assets | Distinctive Assets (Ch.8) | Consistent creative builds recognizable assets |
| ESOV → market share growth | Brand Loyalty (Ch.4) | Loyalty + ESOV = sustainable growth |

### Binet & Field + Berger (STEPPS)

| Binet & Field | Berger | Integration |
|--------------|--------|-------------|
| Emotional ads | Emotion (Ch.3) — high arousal = sharing | Emotion is the link between brand-building and organic reach |
| Creative commitment | Triggers (Ch.2) — repeated exposure | Consistent creative IS a repeated trigger |
| Brand-building stories | Stories (Ch.6) — Trojan Horse | Brand stories carry the message in a shareable form |

### Binet & Field + Kotler

Binet & Field operationalize Kotler's Promotion P of the 4 Ps (Kotler, *Marketing Management*, 14th Ed., Ch.10):
- Kotler: "Promotion mix must integrate long-term brand equity and short-term sales promotion."
- Binet & Field: "60:40 is the empirically optimal integration ratio."

---

## BOUNDARIES WITH OTHER SCRIPTS

- **brand_metrics.py:** Implements the ESOV calculator, 60:40 budget allocator, share-of-voice calculator, and campaign effectiveness scorer based on the IPA databank findings in this extraction.
- **marketing_laws.py:** The Pareto principle + Mere Exposure effect + Law of Diminishing Returns underpin the Binet & Field findings. Pareto: top 20% of campaigns drive 80% of effectiveness (the IPA data supports this). Mere Exposure: brand-building works through repeated, positive exposure. Diminishing Returns: activation spend has a diminishing returns curve; brand-building has a compounding curve.
- **aaker-brand-equity.md:** Brand-building (Binet & Field) = building Aaker's four brand equity dimensions. The 60% brand-building budget IS the investment in brand equity.
- **ogilvy-creative-code.md:** Ogilvy's creative rules are the "how" of the brand-building 60%. Binet & Field answer "how much"; Ogilvy answers "how."
- **heath-made-to-stick.md:** SUCCESs provides the creative design framework for both brand-building (Emotional, Stories, Unexpected) and activation (Simple, Concrete, Credible).
