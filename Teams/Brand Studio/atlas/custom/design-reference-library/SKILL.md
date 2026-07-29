---
name: design-reference-library
type: custom
owner: atlas (Brand Studio) · consumed by mia (frontend build)
status: installed 2026-07-23; PROMOTED via quarantine box 2026-07-28 (§7.7 TIER-1, PASS — see store/quarantine/awesome-design.log)
license: reference material MIT (catalog); each DESIGN.md is independent analysis of public patterns
description: >
  A curated catalog of 74 production DESIGN.md files extracted from real
  websites (Airbnb, Stripe, Notion, Linear, Figma, Vercel, Apple, …). When the
  operator wants a build to "look like <site>", atlas installs that site's
  DESIGN.md into the project and hands it to mia as the design source of truth.
triggers: ["make it look like", "design like", "reference design", "DESIGN.md", "getdesign", "design system from", "<site>-style UI"]
provenance: VoltAgent/awesome-design-md + getdesign.md · vetted through cli/quarantine.sh (0 safety findings, claim 221≥70)
---

# design-reference-library

atlas owns the project `DESIGN.md`. This skill lets atlas seed it from a catalog
of 74 real-world design systems instead of inventing one — the same move used to
redesign the dashboard from Apple's language, generalized to any listed site.

## Setup / Install (the command)

The catalog lives at [VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md);
full content + the CLI live at [getdesign.md](https://getdesign.md). Install a
specific site's DESIGN.md into the project root with:

```
npx getdesign@latest add <site>
```

Run from the project (or app) root. It drops a real `DESIGN.md`; then mia builds
from it and impeccable's detectors gate the result. No API key.

> **Install discipline (§7.7):** any new external design source is fetched through
> `cli/quarantine.sh <name> git <url>` (or `npm <pkg>`) FIRST — safety-scanned in a
> throwaway box, promoted only on PASS. This catalog was vetted that way.

## When to use

- Operator says "build me a page that looks like <site>" or "reference <site>'s design."
- A new product/tenant needs a starting design language fast, on-brand to a known aesthetic.
- atlas needs a grounded DESIGN.md instead of a from-scratch palette.

## Flow (the rail)

1. **atlas** picks the closest reference from the catalog (below) with the operator.
2. Install it: `npx getdesign@latest add <site>` → `DESIGN.md` at the target root.
   (Offline/blocked network: fetch `https://getdesign.md/<site>/design-md` and its
   preview, or the raw catalog entry, and hand-write the tokens — the Apple-scrape pattern.)
3. atlas reconciles it with any existing brand kit; hardcoded values that fight the
   kit are drift findings.
4. **mia** builds the UI from the DESIGN.md (Next.js, tokens → components, WCAG AA).
5. **impeccable detect** (0 findings) + **quinn** real-browser gate before ship.

## Catalog (74 reference systems)

airbnb · airtable · apple · binance · bmw · bmw-m · bugatti · cal · claude · clay ·
clickhouse · cohere · coinbase · composio · cursor · dell-1996 · elevenlabs · expo ·
ferrari · figma · framer · hashicorp · hp · ibm · intercom · kraken · lamborghini ·
linear.app · lovable · mastercard · meta · minimax · mintlify · miro · mistral.ai ·
mongodb · nike · nintendo-2001 · notion · nvidia · ollama · opencode.ai · pinterest ·
playstation · posthog · raycast · renault · replicate · resend · revolut · runwayml ·
sanity · sentry · shopify · slack · spacex · spotify · starbucks · stripe · supabase ·
superhuman · tesla · theverge · together.ai · uber · vercel · vodafone · voltagent ·
warp · webflow · wired · wise · x.ai · zapier

## Constraints

- The DESIGN.md is a **starting point**, not a clone — reconcile with the operator's brand.
- Each entry is independent analysis of public patterns; not affiliated with the brands.
- atlas owns the resulting `DESIGN.md`; mia consumes, never redefines it.

## Verification

DESIGN.md present at target root → impeccable `detect` runs clean against it → mia's
build passes quinn's browser gate. If a chosen site isn't in the catalog, say so; don't fabricate one.

## References

- [VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md) — the catalog (73+ DESIGN.md)
- [getdesign.md](https://getdesign.md) — full content + `npx getdesign add <site>` CLI
- DESIGN.md concept: Google Stitch (`AGENTS.md` = how to build; `DESIGN.md` = how it looks)
