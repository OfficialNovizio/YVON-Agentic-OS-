# Pipeline: copy-paste scripts (bash 3.2 safe)

> Adapted from upstream (`github.com/oso95/scroll-world`) for mia's krea.ai install
> (2026-08-10). Structure mirrors the source pipeline.md 1:1 (stills → dives → seam
> frames → connectors → encode → mobile encode); every `higgsfield`/`monid` CLI call is
> replaced with a `curl`+`jq` call against krea.ai's REST API. See `SKILL.md` §Gotchas
> for what's unverified about krea's exact video-endpoint schema — run the qualification
> probe (SKILL.md Step 4) before trusting this on a real batch.

Set these once. `NAMES` is the ordered section ids; the last is the hero/finale.

```bash
WORK=/tmp/scroll-world           # scratch dir for prompts, sources, frames
ASSETS=./assets                  # where the site reads stills (webp) + clips (mp4)
mkdir -p "$WORK" "$ASSETS/vid"
NAMES="farm kitchen shop delivery plaza finale"   # <-- your section ids, in order

# Pull KREA_API_KEY from Vault without hardcoding it anywhere (SKILL.md Step 0.1).
export KREA_API_KEY=$(cd dashboard && npx tsx -e \
  "import('./lib/secrets').then(async m => console.log(await m.getSecret('KREA_API_KEY') ?? ''))")
[ -n "$KREA_API_KEY" ] || { echo "KREA_API_KEY not set — ask the operator, do not proceed"; exit 1; }
KREA_BASE=https://api.krea.ai

# Chain video model — ONE for every chained clip (SKILL.md Step 4 roster).
# Must accept a start-image (and, for connectors, an end-image) — verify against
# docs.krea.ai/api-reference before batching; the roster below is provisional:
VMODEL=bytedance/seedance-pro
case "$VMODEL" in                                          # per-model duration defaults (bash 3.2 safe)
  kling/kling-3-0)              DIVE_DUR=10; CONN_DUR=5 ;;  # NSFW-filter fallback (SKILL.md Gotchas)
  bytedance/seedance-pro-fast)  DIVE_DUR=8;  CONN_DUR=5 ;;  # cheap previz tier
  *)                            DIVE_DUR=8;  CONN_DUR=5 ;;  # bytedance/seedance-pro default
esac
```

krea generations are asynchronous (job submit → poll → download) and can take minutes —
every call below is meant to run inside a **backgrounded** script. Launch the whole
script with your tool's background/detached mode and poll the progress log; never block
the foreground.

## 1. Scene stills (Step 2)

Write one prompt file per section to `$WORK/still_<name>.txt` (see prompts.md), then:

```bash
gen_still() { # name promptfile model
  local name="$1" pf="$2" model="${3:-openai/gpt-image-2}"
  job=$(curl -fsS -X POST "$KREA_BASE/generate/image/${model}" \
    -H "Authorization: Bearer $KREA_API_KEY" -H "Content-Type: application/json" \
    -d "$(jq -n --arg p "$(cat "$pf")" '{prompt:$p, width:1536, height:1024, steps:28}')" \
    | jq -r '.job_id')
  [ -n "$job" ] && [ "$job" != "null" ] || { echo "still $name FAIL: no job_id"; return 1; }
  for _ in $(seq 1 90); do
    st=$(curl -fsS "$KREA_BASE/jobs/$job" -H "Authorization: Bearer $KREA_API_KEY")
    done_at=$(echo "$st" | jq -r '.completed_at // empty')
    [ -n "$done_at" ] && break
    sleep 10
  done
  url=$(echo "$st" | jq -r '.result.urls[0] // empty')
  [ -n "$url" ] && curl -fsSL "$url" -o "$WORK/still_$name.png" && echo "still $name ok" || echo "still $name FAIL: $st"
}
for n in $NAMES; do gen_still "$n" "$WORK/still_$n.txt" & done ; wait
```

Convert to webp for the site (and optionally run knockout.py first for transparency):

```bash
for n in $NAMES; do cwebp -quiet -q 84 -resize 1800 0 "$WORK/still_$n.png" -o "$ASSETS/$n.webp"; done
```

Review the stills for cohesion before continuing. Re-roll any off-style one.

## 2. Dive-in clips (Step 4)

Prompt files at `$WORK/dive_<name>.txt`. Start image = the solid-bg still PNG.

krea's video endpoints likely take the reference image by URL, not inline bytes (common
for async media APIs — unverified for krea specifically, see SKILL.md Gotchas). If so,
stage the still through Supabase Storage first:

```bash
stage_image() { # localpath -> echoes a public URL
  # Placeholder for this repo's actual Storage upload path — confirm the bucket
  # convention with raj/ops before relying on this in a real batch; do not invent one.
  echo "REPLACE_WITH_UPLOADED_URL_FOR:$1" >&2
}
```

```bash
gen_dive() { # name
  local start_url; start_url=$(stage_image "$WORK/still_$1.png")
  body=$(jq -n --arg p "$(cat "$WORK/dive_$1.txt")" --arg s "$start_url" --argjson d "$DIVE_DUR" \
    '{prompt:$p, start_image:$s, duration:$d, ratio:"16:9"}')
  job=$(curl -fsS -X POST "$KREA_BASE/generate/video/${VMODEL}" \
    -H "Authorization: Bearer $KREA_API_KEY" -H "Content-Type: application/json" \
    -d "$body" | jq -r '.job_id')
  [ -n "$job" ] && [ "$job" != "null" ] || { echo "dive $1 FAIL: no job_id"; return 1; }
  for _ in $(seq 1 120); do
    st=$(curl -fsS "$KREA_BASE/jobs/$job" -H "Authorization: Bearer $KREA_API_KEY")
    done_at=$(echo "$st" | jq -r '.completed_at // empty')
    [ -n "$done_at" ] && break
    sleep 10
  done
  url=$(echo "$st" | jq -r '.result.urls[0] // empty')
  [ -n "$url" ] && curl -fsSL "$url" -o "$WORK/dive_$1.mp4" && echo "dive $1 ok" || echo "dive $1 FAIL: $st"
}
for n in $NAMES; do gen_dive "$n" & done ; wait
```

Re-roll individual failures the same way as upstream — transient errors on one clip
don't mean restart the batch: `gen_dive shop` (just that one).

## 3. Extract boundary frames — the seam handoff (Step 5)

Unchanged from upstream — pure ffmpeg, no generation vendor involved. For each adjacent
pair, the connector's start = dive_i's LAST frame, end = dive_{i+1}'s FIRST frame —
extracted from the **rendered videos**, never the stills.

```bash
set -- $NAMES
prev=""
for n in "$@"; do
  ffmpeg -v error -ss 0 -i "$WORK/dive_$n.mp4" -frames:v 1 -q:v 2 "$WORK/first_$n.png"      # establishing
  ffmpeg -v error -sseof -0.15 -i "$WORK/dive_$n.mp4" -frames:v 1 -q:v 2 "$WORK/last_$n.png" # interior
done
```

## 4. Connector clips (Step 5)

Prompt files at `$WORK/conn_<i>.txt` (i = 1..N-1). Iterate adjacent pairs:

```bash
gen_conn() { # i startPng endPng
  local start_url end_url
  start_url=$(stage_image "$2"); end_url=$(stage_image "$3")
  body=$(jq -n --arg p "$(cat "$WORK/conn_$1.txt")" --arg s "$start_url" --arg e "$end_url" --argjson d "$CONN_DUR" \
    '{prompt:$p, start_image:$s, end_image:$e, duration:$d, ratio:"16:9"}')
  job=$(curl -fsS -X POST "$KREA_BASE/generate/video/${VMODEL}" \
    -H "Authorization: Bearer $KREA_API_KEY" -H "Content-Type: application/json" \
    -d "$body" | jq -r '.job_id')
  [ -n "$job" ] && [ "$job" != "null" ] || { echo "conn $1 FAIL: no job_id"; return 1; }
  for _ in $(seq 1 120); do
    st=$(curl -fsS "$KREA_BASE/jobs/$job" -H "Authorization: Bearer $KREA_API_KEY")
    done_at=$(echo "$st" | jq -r '.completed_at // empty')
    [ -n "$done_at" ] && break
    sleep 10
  done
  url=$(echo "$st" | jq -r '.result.urls[0] // empty')
  [ -n "$url" ] && curl -fsSL "$url" -o "$WORK/conn_$1.mp4" && echo "conn $1 ok" || echo "conn $1 FAIL: $st"
}
set -- $NAMES ; i=0 ; prev=""
for n in "$@"; do
  if [ -n "$prev" ]; then i=$((i+1)); gen_conn "$i" "$WORK/last_$prev.png" "$WORK/first_$n.png" & fi
  prev="$n"
done ; wait
```

## 5. Encode everything for scrubbing (Step 6)

Unchanged from upstream — native resolution (encode what ffprobe reports, never
upscale), crf 20, GOP 8, light sharpen, no audio, faststart. Same for dives + connectors.

```bash
enc() { ffmpeg -v error -y -i "$1" -an -vf "unsharp=5:5:0.8:5:5:0.0" \
  -c:v libx264 -preset slow -crf 20 -pix_fmt yuv420p \
  -g 8 -keyint_min 8 -sc_threshold 0 -movflags +faststart "$2"; echo "enc $2 $(du -h "$2"|cut -f1)"; }

for n in $NAMES; do enc "$WORK/dive_$n.mp4" "$ASSETS/vid/$n.mp4"; done
i=0; for f in "$WORK"/conn_*.mp4; do i=$((i+1)); enc "$f" "$ASSETS/vid/conn$i.mp4"; done
```

Now the engine config's `sections[k].clip = assets/vid/<name>.mp4` and
`connectors = [assets/vid/conn1.mp4, …]` (length N-1, in order).

## 6. Mobile encodes (Step 6) — mobile beta, only if the user opted in

**Skip this section unless the user chose the mobile (beta) version in the Step 1
interview.** Scrubbing sets `currentTime` every frame, and a phone decoder's **seek cost
scales with how many frames it must decode from the nearest keyframe** — so a 1080p
`-g 8` master that scrubs fine on a laptop stutters on a phone. A **smaller frame +
tighter GOP** fixes that (and halves the bytes on cellular). Produce a `-m.mp4` sibling
for every clip:

```bash
# 720p, GOP 4 (twice the keyframes = ~half the seek-decode work), crf 23, same sharpen/faststart.
encm() { ffmpeg -v error -y -i "$1" -an -vf "scale=-2:720,unsharp=5:5:0.6:5:5:0.0" \
  -c:v libx264 -preset slow -crf 23 -pix_fmt yuv420p \
  -g 4 -keyint_min 4 -sc_threshold 0 -movflags +faststart "$2"; echo "encm $2 $(du -h "$2"|cut -f1)"; }

for n in $NAMES; do encm "$WORK/dive_$n.mp4" "$ASSETS/vid/$n-m.mp4"; done
i=0; for f in "$WORK"/conn_*.mp4; do i=$((i+1)); encm "$f" "$ASSETS/vid/conn$i-m.mp4"; done
```

Wire the variants in the engine config — the engine serves them automatically on phones,
falling back to the desktop `clip` when a mobile one is absent:

```js
sections[k].clipMobile = 'assets/vid/<name>-m.mp4';
connectorsMobile = ['assets/vid/conn1-m.mp4', …];   // length N-1, in order
```

If phone scrubbing still stutters, tighten the GOP further (`-g 2`, or `-g 1` for all-intra
= instant seeks at the cost of larger files); if cellular weight is the bigger worry, raise
`crf` (24–26) or drop to `scale=-2:600`. All-mobile encodes stay 16:9 — the engine
centre-crops them; see the portrait note in SKILL.md Step 8 / prompts.md.

## Notes

- **`stage_image()` is a placeholder.** Confirm this repo's actual Supabase Storage
  upload convention with `raj` or `ops` before a real batch — don't invent a bucket path.
  If krea's video endpoints turn out to accept inline base64 images after all (unverified
  either way at install time), this whole staging step can be dropped.
- **Schema is unverified.** `start_image`/`end_image`/`ratio` field names are this
  adaptation's best guess at krea's convention (SKILL.md Gotchas) — run the Step 4
  qualification probe on one clip before trusting a full N-scene batch.
- **NSFW/content-filter fallback across models**: if one clip keeps getting flagged after
  re-rolls + prompt scrubbing, regenerate just that clip on `kling/kling-3-0` with the
  SAME start/end frames — then restore your chain model. See SKILL.md Gotchas for the
  trade-off (render-character shift on that one clip).
- **Previz on the cheap**: run the whole chain once with `VMODEL=bytedance/seedance-pro-fast`
  to validate the journey and seams before spending on the standard tier — because it's
  still seamless (once qualified), the previz translates directly to the final render.
- No `krea workspace list`-equivalent exists to check credits/spend mid-run — the Step
  0.5 one-generation calibration in SKILL.md is the substitute; watch for HTTP 402/429
  responses and stop the batch rather than silently retrying into a spend surprise.
- Concurrency: stagger concurrent generations rather than launching all N at once until
  you've seen how krea's API behaves under load for this account — upstream's Higgsfield
  guidance ("~5–6 at once is fine") doesn't necessarily transfer.
