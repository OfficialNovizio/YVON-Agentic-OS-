---
name: scroll-world
type: marketplace
status: adapted from source — generation backend swapped Higgsfield/Monid → krea.ai per
  operator decision (2026-08-10); scroll-scrub mechanics (engine, seam method, encoding)
  copied verbatim, unchanged from upstream
source: https://github.com/oso95/scroll-world
source_repo: https://github.com/oso95/scroll-world
author: oso95 (cyw)
adapted_by: mia install, yvon-fleet session 2026-08-10
fulfills_catalog_entry: none found — first cinematic-landing-page skill in the fleet;
  not yet cross-referenced against VYON_Skills_Catalog_Full_v2.html
assigned_agent: mia (Engineering / Frontend Web)
portable: partially — the scrub engine (references/scrub-engine.js) is framework-agnostic
  and unchanged; the generation pipeline (references/pipeline.md) is now specific to this
  repo's krea.ai integration (dashboard/lib/secrets.ts + dashboard/app/api/krea/*)
credential: KREA_API_KEY — already registered in dashboard/lib/secrets.ts MOVABLE_SECRETS
  (Supabase Vault-backed). Not set by this install; operator sets the value directly.
date_added: 2026-08-10
toon: pending — no yvon-compile pass run against this file yet (tool not present in repo
  at install time); do not treat an absent SKILL.toon as a build defect
description: >
  Build an immersive scroll-scrubbed "fly through the world" landing page for any
  industry or brand using krea.ai. As the visitor scrolls, a pre-rendered camera flies
  from outside each scene into its interior, then flows on to the next scene with NO
  cuts — one continuous connected flight. The skill interviews the user for the topic,
  the story beats/sections, and brand kit, then generates cohesive scenes + seamless
  camera clips via krea.ai's unified generation API and wires a portable,
  framework-agnostic scroll-scrub engine. Use when the user wants a "3D world" /
  "browse-through-the-industry" hero, a scroll cinematic, a diorama landing, or to
  turn a business into a scrollable world.
allowed-tools: Bash, Read, Write, Edit, AskUserQuestion, Skill
---

# scroll-world

Produces a landing page where **scroll drives a camera**: it dives from outside a scene
into its interior, then flies out and into the next scene, continuously, with no visible
cuts. The visuals are AI-generated — stills and the video chain both via **krea.ai**'s
unified REST API (`docs.krea.ai`) — and the page just scrubs pre-rendered video by scroll
position. This is the same technique behind Apple's scroll-through product pages — the
camera genuinely moves, scroll only drives time.

**What you generate:** N scene stills → N "dive-in" camera clips → N-1 "connector" clips
that join consecutive scenes seamlessly → a portable scrub engine that plays the whole
chain as one flight.

**The one rule that makes or breaks it:** seams must be *frame-identical*. Read
[The seamless chain](#step-5--connectors-architecture-b-only) before generating any
connector. Getting this wrong is the single most common failure and produces a visible
"pop" between scenes. This rule is provider-independent — it held for the source skill's
Higgsfield/Monid pipeline and holds identically here.

Do not assume a frontend framework. The scrub engine in `references/scrub-engine.js` is
self-contained vanilla JS (it builds its own DOM + injects its own CSS into a container
you give it) — copied verbatim from upstream, unchanged. The value of this adaptation is
the krea.ai pipeline, the prompts, and the seam method — not the framework.

**What changed from upstream, and why:** the source skill (`github.com/oso95/scroll-world`)
renders through Higgsfield (CLI, credit-billed) with Monid as an optional USD-billed
backend. This install replaces both with **krea.ai**, this repo's existing image/video
generation vendor (`dashboard/lib/krea.ts`, `dashboard/app/api/krea/*`,
`KREA_API_KEY` already in `dashboard/lib/secrets.ts`'s Vault-backed secret list). krea.ai's
catalog covers the same underlying video families the source skill's roster already
targeted — Kling and a Seedance-class model — via `/generate/video/{provider}/{model}`,
plus stills via `/generate/image/{provider}/{model}` (Flux, Seedream, gpt-image-2). The
generation calls below are written against krea's documented async job pattern
(`POST` → `job_id` → poll `GET /jobs/{jobId}`), matching this repo's own
`dashboard/app/api/krea/generate` + `krea/status` routes. **One thing is NOT yet verified
against live traffic:** whether krea's video endpoints expose start/end-image
conditioning under the exact field names used below (modeled on the pattern krea's own
docs describe, not confirmed against a real response). Treat every model in the roster
(Step 4) as provisional until you've run the qualification probe in Step 4 once, the same
discipline the source skill applies to its own roster (`higgsfield model get <model>`) —
don't batch a full N-scene chain on an unqualified model.

---

## Step 0 — Bootstrap

1. **`KREA_API_KEY` must resolve.** This repo reads it via Vault
   (`dashboard/lib/secrets.ts` → `getSecret('KREA_API_KEY')`, `MOVABLE_SECRETS` already
   lists it) with a `process.env.KREA_API_KEY` fallback during cutover. **This skill does
   not set the value** — that's the operator's action (Supabase Vault directly, or
   `dashboard/.env.local` for local dev, matching the pattern in `.env.local.example`).
   To pull it into a bash pipeline script's environment without hardcoding it anywhere:
   ```bash
   export KREA_API_KEY=$(cd dashboard && npx tsx -e \
     "import('./lib/secrets').then(async m => console.log(await m.getSecret('KREA_API_KEY') ?? ''))")
   [ -n "$KREA_API_KEY" ] || { echo "KREA_API_KEY not set in Vault or .env.local — stop and ask the operator"; exit 1; }
   ```
   Requires the same `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` the dashboard itself
   needs to boot. If those aren't in the shell env either, ask the operator rather than
   guessing at a fallback.
2. **`curl` and `jq`** on `$PATH` (the pipeline drives krea's REST API directly, no CLI
   exists for krea.ai as of this writing).
3. **ffmpeg / ffprobe** on `$PATH` (frame extraction + encoding — unchanged from upstream).
4. **An image tool** for background knockout if you want floating scenes: PIL
   (`python3 -c "import PIL"`), or `cwebp`/`sips`. Optional — see Step 3.
5. **Confirm krea account has budget.** krea.ai bills per generation; there is no
   pre-flight balance-check endpoint documented at install time. Run ONE still and ONE
   video generation first (Step 1.7), check the response/invoice, extrapolate to the
   full N-scene run, and get the operator's go before batching — same discipline the
   source skill applies to Higgsfield credits, just without a `workspace list` balance
   call to automate it.
6. Caveats carried over from upstream, still true: macOS ships **bash 3.2** (no
   `declare -A`) — don't use associative arrays in scripts. krea generations are
   asynchronous and can take minutes — always poll `GET /jobs/{jobId}` in a **backgrounded**
   script, never a blocking foreground call. Video models differ in whether they accept
   start/end-image conditioning at all — before batching, verify the chosen model's
   input schema against `docs.krea.ai/api-reference` (see Step 4 roster note above).

---

## Step 1 — Interview the user

Unchanged from upstream — this part of the skill has nothing to do with the generation
backend. Full detail in `references/prompts.md`'s intake checklist; summary:

1. **Subject** (ask openly, never multiple-choice) — the business/idea + one-line pitch.
2. **Brand kit** — palette (4–6 named hexes), display name, tone word(s). In this repo,
   check first whether `atlas`'s brand kit already covers the venture (per CLAUDE.md
   routing: atlas is Brand Studio's design-tokens source of truth) before asking the user
   to restate it.
3. **Art direction** — default "soft matte low-poly clay diorama, isometric, tilt-shift
   miniature, warm light." Offer alternatives (flat papercraft, glossy toy, claymation,
   neon night, photoreal architectural). Becomes the shared **style preamble**, reused
   verbatim across every scene prompt.
4. **Camera style — always ask.** "Fly through the world" (Architecture B, dive + aerial
   connector, the flagship diorama look) vs. "one continuous walkthrough" (Architecture A,
   forward-only, grounded/photoreal) vs. "locked isometric glide" (Architecture A +
   fixed-angle clause). State the seam-reversal trade-off (B reverses direction at every
   seam — charming in miniature, jarring in realism).
5. **The journey (sections)** — 5–7 ordered scenes derived from the subject's value
   chain; user edits. Each needs a subject description, eyebrow, headline, one body line,
   0–3 tags. Last section = hero product + CTA.
6. **Mobile version — always ask, never silently generate both.** Native 9:16 portrait
   chain (roughly doubles generation spend) vs. desktop-only. State the estimated extra
   cost before the user decides.
7. **Budget — shown by cost, decided before anything renders.** See Step 4 for the video
   model roster and Step 0.5 for the calibration approach (krea has no balance-check
   endpoint, so this step leans more on the one-generation-first calibration than the
   source skill's `workspace list` diffing).

Keep the scroll mechanic fixed (continuous fly-through) — that's the point of the skill.

---

## Step 2 — Generate the scene stills

One image per section, all sharing the same style preamble for cohesion. Default model:
**`bfl/flux-1-dev`** (fast, cheap — this repo's existing `krea/generate` route already
defaults to it) for draft/previz; **`openai/gpt-image-2`** for final stills needing crisp
isometric-illustration line quality and a clean solid/white background (ideal for
floating diorama "islands," matching the source skill's still-model choice). Confirm
`gpt-image-2`'s exact krea route id with `docs.krea.ai` before the first real batch — the
provider-prefixed id (`openai/gpt-image-2` vs `openai/gpt-image-2-2`, etc.) is exactly the
kind of thing that drifts as krea adds catalog entries.

Prompt shape (full templates in `references/prompts.md` — unchanged from upstream, the
prompt craft is provider-independent):

```
<STYLE PREAMBLE, identical every time>. On a plain solid <bg> background with a soft
contact shadow. <PALETTE hexes>. No text, no letters, no logos, centered, 3:2.
Subject: <what is in THIS diorama>.
```

Batch script (async job pattern — POST, poll, download):

```bash
gen_still() { # name promptfile model
  local name="$1" pf="$2" model="${3:-openai/gpt-image-2}"
  job=$(curl -fsS -X POST "https://api.krea.ai/generate/image/${model}" \
    -H "Authorization: Bearer $KREA_API_KEY" -H "Content-Type: application/json" \
    -d "$(jq -n --arg p "$(cat "$pf")" '{prompt:$p, width:1536, height:1024, steps:28}')" \
    | jq -r '.job_id')
  [ -n "$job" ] && [ "$job" != "null" ] || { echo "still $name: no job_id"; return 1; }
  for _ in $(seq 1 90); do   # poll up to ~15 min at 10s
    st=$(curl -fsS "https://api.krea.ai/jobs/$job" -H "Authorization: Bearer $KREA_API_KEY")
    done_at=$(echo "$st" | jq -r '.completed_at // empty')
    [ -n "$done_at" ] && break
    sleep 10
  done
  url=$(echo "$st" | jq -r '.result.urls[0] // empty')
  [ -n "$url" ] && curl -fsSL "$url" -o "$WORK/still_$name.png" && echo "still $name ok" || echo "still $name FAIL: $st"
}
for n in $NAMES; do gen_still "$n" "$WORK/still_$n.txt" & done; wait
```

Convert to webp for the site (unchanged from upstream):

```bash
for n in $NAMES; do cwebp -quiet -q 84 -resize 1800 0 "$WORK/still_$n.png" -o "$ASSETS/$n.webp"; done
```

**Review the stills before continuing** — same cohesion check as upstream (same angle,
palette, light). Re-roll any off-style one.

See `references/pipeline.md` for the full batch script including the video chain.

---

## Step 3 — (Optional) Float the scenes

Unchanged from upstream, fully provider-independent: `references/knockout.py`
(border-connected flood fill, copied verbatim) knocks the flat background to
transparency if you want the dioramas floating over an atmospheric page background.
These stills double as video posters and lazy-load fallbacks — keep them regardless.

---

## Step 4 — Camera architecture (implements the Step 1.4 choice)

The seam mechanics are unchanged from upstream — only the model roster and API surface
differ. Two architectures, same as source:

- **B) Dive-in + aerial connector** — diorama/miniature worlds, the flagship look. Each
  scene gets a dive-in clip; connectors fly up-and-out then into the next scene. Reverses
  camera direction at every seam (intentional in a miniature world, jarring in a grounded
  one).
- **A) Continuous forward take** — grounded/photoreal/walkthrough. Legs chained
  sequentially, each starting from the previous leg's actual last extracted frame, no
  `--end-image` equivalent, camera never reverses. No connectors (skip Step 5).

Full grammar table (mid-leg moves per concept, locked-iso variant, motion-handoff
contract) is provider-independent — see upstream `SKILL.md` Step 4 prose, reproduced
as-is in `references/prompts.md`'s leg-prompt section.

### Video model roster — krea.ai

**This skill only ships seamless output**, so the only usable krea video models are ones
whose input schema accepts a start (and, for connectors, end) reference image — the
capability that lets a generation *continue* a shot instead of merely being *conditioned*
by one. Verify with `docs.krea.ai/api-reference` before batching; the table below is the
starting roster, modeled on krea's documented catalog (`/generate/video/{provider}/{model}`)
and the source skill's own model choices, not yet confirmed against a live response:

| Model (krea route id) | Expected role | Notes |
|---|---|---|
| `bytedance/seedance-pro` | Default — full chain (legs + connectors) | Seedance-class, same family the source skill defaults to (`seedance_2_0`); confirm 1080p support and frame-lock params. |
| `kling/kling-3-0` | NSFW-filter fallback for a single stubborn clip | Source skill's sanctioned fallback when Seedance's content filter false-positives on interiors/bedrooms/pools — different filter, often passes what Seedance blocks. |
| `bytedance/seedance-pro-fast` | Cheap draft/previz tier | Run the whole chain here first to validate the journey and seams before spending on the standard tier — same previz pattern as upstream's `seedance_2_0_mini`. |

**Qualification probe (run once per model before a real batch):** one prompt + one start
image → the output's first frame should match the input to visual inspection (this repo
has no PSNR tooling wired up; eyeball it, or extract frame 0 with `ffmpeg -frames:v 1` and
diff by hand). For connector duty, add an end image and confirm the last frame lands on
that composition. This mirrors the source skill's `higgsfield model get` + qualification
discipline — krea just doesn't have an equivalent introspection command, so the probe
*is* the introspection.

**One model for the whole chain** (unchanged rule) — mixing render engines mid-chain
keeps position continuity (frames still hand off) but the render-character shift reads
as a subtle pop. The one exception is the NSFW-filter fallback for a single stubborn
clip, same as upstream.

Generation call shape (async job, same pattern as stills):

```bash
gen_video() { # name promptfile model startpng [endpng] [duration]
  local name="$1" pf="$2" model="$3" start="$4" end="${5:-}" dur="${6:-8}"
  # NOTE: field names below (start_image/end_image) are krea's documented convention for
  # image-conditioned generation but UNVERIFIED for the specific video route — confirm
  # against docs.krea.ai before the first real batch (Step 0.5 / this section's roster note).
  body=$(jq -n --arg p "$(cat "$pf")" --arg s "$start" --arg e "$end" --argjson d "$dur" \
    'if $e == "" then {prompt:$p, start_image:$s, duration:$d, ratio:"16:9"}
     else {prompt:$p, start_image:$s, end_image:$e, duration:$d, ratio:"16:9"} end')
  job=$(curl -fsS -X POST "https://api.krea.ai/generate/video/${model}" \
    -H "Authorization: Bearer $KREA_API_KEY" -H "Content-Type: application/json" \
    -d "$body" | jq -r '.job_id')
  [ -n "$job" ] && [ "$job" != "null" ] || { echo "video $name: no job_id"; return 1; }
  for _ in $(seq 1 120); do   # poll up to ~20 min at 10s — video jobs run longer than stills
    st=$(curl -fsS "https://api.krea.ai/jobs/$job" -H "Authorization: Bearer $KREA_API_KEY")
    done_at=$(echo "$st" | jq -r '.completed_at // empty')
    [ -n "$done_at" ] && break
    sleep 10
  done
  url=$(echo "$st" | jq -r '.result.urls[0] // empty')
  [ -n "$url" ] && curl -fsSL "$url" -o "$WORK/$name.mp4" && echo "video $name ok" || echo "video $name FAIL: $st"
}
```

krea video generation almost certainly needs the reference images reachable by URL, not
inline bytes (this was true of the Monid backend upstream swapped to, and is the common
shape for async media APIs generally) — verify against `docs.krea.ai`; if so, upload the
extracted PNG frames somewhere krea can fetch them (this repo's Supabase Storage is the
natural place — ask `raj` or `ops` for the bucket convention rather than inventing one)
before the `gen_video` call, and pass that URL as `$start`/`$end`.

For **B**, one dive-in flight per scene: `--start-image` = the scene's solid-background
still, `--duration 8`, `16:9`. Prompt template unchanged, in `references/prompts.md`.

---

## Step 5 — Connectors (architecture B only)

Unchanged mechanics from upstream — this is the load-bearing part of the whole skill and
is entirely provider-independent:

```
For each connector between dive_i and dive_{i+1}:
  start-image = the LAST frame extracted from dive_i's rendered video
  end-image   = the FIRST frame extracted from dive_{i+1}'s rendered video
```

Both endpoints must be the **actual rendered frames** of the neighbouring clips, never
the original diorama still — every generation renders slightly differently, so a
connector ending on a fresh render of "the kitchen diorama" won't match the next dive
clip's own different render of that same diorama.

```bash
ffmpeg -sseof -0.15 -i "$WORK/dive_i.mp4"     -frames:v 1 -q:v 2 "$WORK/dive_i_last.png"
ffmpeg -ss 0      -i "$WORK/dive_next.mp4"    -frames:v 1 -q:v 2 "$WORK/dive_next_first.png"
gen_video "conn_i" "$WORK/connector_i.txt" "$VMODEL" "$WORK/dive_i_last.png" "$WORK/dive_next_first.png" 5
```

Insurance: krea's video models — like Higgsfield/Seedance upstream — likely land *close*
to the end-image but not always pixel-perfect (unverified for krea specifically; assume
the same behavior until proven otherwise). The engine still applies a short crossfade at
each seam (`crossfade` config, ~0.08–0.12) as insurance. Never skip the actual-frame
handoff and rely on the crossfade alone.

---

## Step 6 — Encode for smooth scrubbing

**Completely unchanged from upstream** — this step has nothing to do with the generation
backend, only with what you do to the downloaded mp4s. Native resolution, `crf ~20`,
`-g 8` (not all-intra — the engine's blob-URL playback makes seekability, not keyframe
density, the thing that matters), strip audio, faststart, light `unsharp`:

```bash
ffmpeg -i src.mp4 -an -vf "unsharp=5:5:0.8:5:5:0.0" \
  -c:v libx264 -preset slow -crf 20 -pix_fmt yuv420p \
  -g 8 -keyint_min 8 -sc_threshold 0 -movflags +faststart out.mp4
```

Mobile encodes (only if the user opted into the mobile version, Step 1.6): native 9:16
portrait chain, 720-wide, `-g 4`, crf 23 — see `references/pipeline.md` §6b, unchanged
from upstream.

---

## Step 7 — Assemble the page

Unchanged from upstream. Copy `references/scrub-engine.js` (verbatim) and
`references/index-template.html` (verbatim) into the user's project, or adapt into
mia's actual framework (Next.js — mount from a client component's `useEffect`, per
mia's own conventions). Config-driven, self-contained — see the header comment in
`scrub-engine.js` for the full config shape. If wiring this into a page mia owns end to
end, run it through mia's own **design-tokens** skill for the theme CSS variables
(`--sw-bg`, `--sw-ink`, `--sw-accent`, …) sourced from atlas's brand kit rather than
hand-picked hexes — that keeps a scroll-world page from drifting off-brand the way any
other mia-built page would.

---

## Step 8 — QA the seams (don't skip)

Unchanged from upstream, and this repo already has the tooling for it: route this
through **quinn**'s Reticle/Playwright real-browser verification (mia's
`frontend-verification` skill, `Teams/Engineering/mia/operational/skill/`) rather than a
one-off headless script — "agents say done; browsers tell the truth" applies here exactly
as it does to any other mia page. Screenshot just before/after each seam, confirm
composition match; check `video.seekable.end(0) > 0` (blob loading working); check
`prefers-reduced-motion` falls back to stills only. Full mobile checklist (only if mobile
was built) in the upstream Gotchas section, unchanged.

---

## Gotchas

All of upstream's seam/encoding/mobile gotchas carry over unchanged (frame-locking
mistakes, `seekable=[0,0]` frozen video, all-intra bloat, iOS blank-video priming,
URL-bar resize jumps, safe-area insets) — see the source `SKILL.md` for the full list;
they're mechanics of the scrub engine and video codec, not the generation vendor.

**New gotchas from the krea.ai swap, not present upstream:**

- **Unverified schema.** Every field name in Step 4's `gen_video()` (`start_image`,
  `end_image`, `ratio`) is this adaptation's best guess at krea's convention, not a
  confirmed response shape. Run the Step 4 qualification probe before trusting a full
  batch — if the schema differs, this file needs a correction pass, and that correction
  should land back in this SKILL.md, not just live in someone's memory of "oh yeah krea
  actually wants X."
- **No balance/credit introspection.** Unlike `higgsfield workspace list`, krea.ai (per
  the docs surveyed at install time) doesn't expose a pre-flight balance check. The
  one-generation calibration in Step 0.5 is the substitute — don't skip it before a full
  N-scene batch.
- **Two krea clients already exist in this codebase** (`dashboard/lib/krea.ts` +
  `/api/krea-generate`, vs. `/api/krea/generate` + `/api/krea/status`) and they don't
  agree on the endpoint shape — the first hits a sync `/v1/generate`, the second (and
  this skill) uses the async `/generate/image/{model}` → `/jobs/{id}` pattern that
  matches krea's real docs. Flagged at install time (2026-08-10), not fixed as part of
  this skill's install — if you hit inconsistent behavior calling krea from elsewhere in
  the dashboard, that's why.
- **Frame images likely need to be URLs, not inline bytes**, for the video endpoints
  (common for async media APIs, and true of the Monid backend the source skill also
  supports) — verify, and if so, stage extracted PNG frames through Supabase Storage (or
  whatever bucket convention `ops`/`raj` point you to) before calling `gen_video`.

## References

- `references/prompts.md` — intake checklist, style-preamble pattern, every prompt
  template (scene still, dive, connector). Copied from upstream with Higgsfield-specific
  CLI flag call-outs removed; the prompt text itself is provider-independent and
  unchanged.
- `references/pipeline.md` — copy-paste batch scripts for the whole run, rewritten
  against krea.ai's REST API (curl + jq) in place of the Higgsfield/Monid CLI calls.
- `references/scrub-engine.js` — the portable, config-driven scrub engine. **Copied
  verbatim from upstream, byte-for-byte unchanged** — it only ever consumes asset URLs,
  so it has no dependency on the generation vendor.
- `references/index-template.html` — a minimal standalone page that mounts the engine.
  Copied verbatim from upstream.
- `references/knockout.py` — border-connected background knockout for floating scenes.
  Copied verbatim from upstream.
