# [Brand Name] Image Style — TEMPLATE

> Derived from the brand kit's imagery section (atlas), approved by the operator on a real
> test set, then frozen. Saved at pixel's config `image_style_path`, one per brand.
> Amendments are operator-approved and versioned. AI-imagery policy: [from kit §5 —
> allowed / restricted / banned; if banned, this file parameterizes briefs for human
> designers instead].

**Brand:** [name] · **Version:** [v1.0] · **Kit version derived from:** [atlas kit vX]
**Test set approved:** [date, by operator]

## 1. Style Constants (apply to every generation)

- **Treatment:** [e.g., editorial photography / flat illustration / 3D render — from kit]
- **Lighting default:** [e.g., natural window light, soft shadows]
- **Palette anchors:** [kit tokens permitted in imagery, e.g., color-brand-primary as accent only]
- **Composition defaults:** [e.g., negative space left third for copy overlay; eye-level]
- **Mood range:** [the 2–3 moods this brand's imagery lives in]

## 2. Per-Use-Case Prompt Templates

(Parameterize content-image's patterns with the constants above.)

- **Product:** `[product] on [approved surface], [angle], [lighting default], [treatment]`
- **People:** `[subject per audience reality] [action] in [approved setting], [treatment], [lighting], [mood]`
- **Abstract/concept:** `[metaphor vocabulary this brand uses], [treatment], [palette anchors], [mood]`
- **Environment:** `[place types], [time of day default], [treatment], [camera default]`

## 3. Negative / Reject Rules (each one checkable)

- Off-palette beyond §1 anchors → reject
- [Rejected aesthetics from the kit, e.g., "stock-photo handshakes," "neon gradients"] → reject
- [Text/watermark rules] → reject
- Series inconsistency (mixed treatments/lighting within one batch) → reject as set

## 4. Aspect/Format Defaults per Channel

| Channel | Ratio | Notes |
|---|---|---|
| [web hero] | 16:9 | |
| [social feed] | 1:1 / 4:5 | pulse's platform table governs specifics |

## 5. Amendment Log

| Date | v | What changed | Why | Approved by |
|---|---|---|---|---|
