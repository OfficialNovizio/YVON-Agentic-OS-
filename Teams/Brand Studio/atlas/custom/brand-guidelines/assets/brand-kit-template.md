# [Brand Name] Brand Kit — TEMPLATE

> **This is a template, not a brand.** Nothing here is enforceable until the operator fills it
> in and saves it at the path configured in atlas's config (`brand_kit_path`, one per brand).
> Populate it by hand if the identity already exists, or run atlas's `brand-identity` skill to
> create the system and fill this from its output. Structural references: Anthropic's official
> brand-guidelines skill (the canonical filled-in example) and rampstackco's identity-system-spec
> (the deeper working spec — use it when this template feels too small).

**Brand:** [name]
**Version:** [v1.0] · **Date:** [YYYY-MM-DD] · **Owner:** [name]
**Amendment rule:** [who may change this kit and how — e.g., "operator sign-off, version bump, one-line rationale." Unamendable-in-practice kits rot; undocumented changes are drift.]

---

## 1. Logo

- **Primary mark:** [file/description] · **Variants:** [horizontal / stacked / mark-only / wordmark — file per variant]
- **Minimum size:** [px digital / mm print] · **Clear space:** [e.g., "1× cap height on all sides"]
- **Color versions:** [full color / single color / reversed]
- **Misuse rules (each one auditable):**
  - Do not stretch, rotate, or skew
  - Do not recolor outside §2's palette
  - Do not place on busy imagery without [scrim rule]
  - [add/remove per brand — max ~10]

## 2. Color

| Token | Hex | Usage | Text-safe variant (if signature fails WCAG AA) |
|---|---|---|---|
| color-brand-primary | [#……] | [where] | [#…… or "passes as-is"] |
| color-brand-secondary | [#……] | [where] | |
| color-neutral-… | [#……] | [80% of surface area — define the scale] | |

- **Accessibility bar:** [WCAG AA (4.5:1 body / 3:1 large) — or stricter. This line makes contrast an auditable brand rule.]
- **Disallowed pairings:** [list]
- **Dark-mode variants:** [defined / not yet — if not, say so]

## 3. Typography

| Role | Family | Weights | Fallback stack | License note |
|---|---|---|---|---|
| Display | | | | |
| Body | | | | |

- **Scale:** [the steps in use, e.g., 32/24/18/16/14]
- **Rules:** [display weights at display sizes only; line-height 1.5–1.65 body; max 2 families; …]

## 4. Spacing & Layout

- **Base unit:** [e.g., 8px multiples]
- **Clear-space and margin rules:** [what this kit legislates; finer craft belongs to layout-composition]

## 5. Imagery

- **Photography direction:** [subject / composition / lighting / color treatment]
- **Illustration/iconography style:** [if applicable]
- **Rejected aesthetics:** [named, auditable — e.g., "no generic stock-photo handshakes"]
- **Stock / AI-generated policy:** [allowed / banned / case-by-case]

## 6. Voice pointer

Voice and tone live in **lena's voice-guide file for this brand** — not here. This section only records visual-voice interactions (e.g., "voice is quiet → typography is never loud").

## 7. Multi-brand note (if the operator runs multiple brands)

Separation rules live in atlas's `multi-brand-system` skill config — this kit governs this brand alone. Record here only this brand's ID for the separation matrix: [brand-id]

---

## Audit log pointer

Brand audits (PASS/fix lists) and drift notes are recorded per atlas's process — location: [where audits get logged]. Repeat violations of one rule mean the rule or the process needs review at: [cadence].
