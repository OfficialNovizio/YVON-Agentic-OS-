# price — Command Triggers

| Trigger phrases | Skill | Shortcut |
|---|---|---|
| "what should we charge", "willingness to pay", "WTP", "van westendorp", "price this" | pricing-research | /wtp |
| "tiers", "packaging", "good better best", "which plan", "feature gating", "fences" | packaging-tiers | /package |
| "test a price", "pricing experiment", "A/B the price", "revenue test" | pricing-experiment-discipline | /price-test |
| "change the price", "raise prices", "reprice", "grandfathering", "migrate customers" | price-change-governance | /price-change |

## Precedence
1. A price is never set on survey WTP alone — pricing-research proposes, pricing-experiment-discipline confirms with behavior before a real change.
2. Any change to existing-customer prices routes to price-change-governance (never an experiment variable); locked-commitment-touching changes → board.
3. Revenue experiments inherit loom's freeze-before-data rigor + revenue guardrails; a conversion win that drops revenue-per-user bounces.
