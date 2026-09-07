"""Server-side motion probe for reference URLs (re-engineer Phase 1, 2026-09-05).

WHY THIS EXISTS — the Novizio autopsy: a reference with videos, scroll
animation and CSS motion produced a fully static rebuild, because the capture
chain (Jina Reader text + HeadlessX screenshot) physically carries zero motion
information. The static output was faithful to its evidence. This probe runs
server-side (zero agent turns, zero tokens) and grounds the turn in what the
reference actually animates:

  * <video>/<canvas> machinery + autoplay hints      -> video-led rebuilds
  * @keyframes / animation / transition declarations -> code-motion rebuilds
  * scroll-library fingerprints (gsap, lenis, three) -> recipe routing later
  * CSS anatomy (fonts, palette, radii, type scale)  -> faithful styling
  * a media asset inventory with absolute URLs       -> the hybrid asset plan

Stdlib only (no fastapi/httpx import here) so tests import it directly.
Loud-degrade discipline: every failure mode returns {"ok": False, "reason"} —
callers must surface the failure, never let a turn assume the page is static.
"""
from __future__ import annotations

import re
import time
import urllib.parse
import urllib.request

# ── URL detection ────────────────────────────────────────────────────────────
# Same contract as the dashboard's refUrls helper (stream route): the FIRST
# external https URL in the message is the reference for this turn.
_URL_RE = re.compile(r"https?://[^\s<>\"')\]]+", re.IGNORECASE)


def detect_reference_urls(text: str) -> list[str]:
    """External URLs in a user message, deduped, trailing punctuation stripped."""
    if not text:
        return []
    urls: list[str] = []
    for m in _URL_RE.finditer(text):
        u = m.group(0).rstrip(".,;:!?")
        if u not in urls:
            urls.append(u)
    return urls


# ── Fingerprint tables ───────────────────────────────────────────────────────
# (label, regex). Script fingerprints are matched against the full HTML — both
# src attributes and inline bodies, so bundlers/inliners don't hide them.
_SCROLL_LIBS: list[tuple[str, str]] = [
    ("gsap/ScrollTrigger", r"gsap(?:\.min)?\.js|window\.gsap|TweenMax|TweenLite|ScrollTrigger"),
    ("lenis", r"lenis(?:\.min)?\.js|window\.lenis|data-lenis"),
    ("locomotive", r"locomotive-scroll|data-scroll-container"),
    ("three.js", r"three(?:\.min)?\.js|window\.THREE\b|THREE\.WebGLRenderer"),
    ("scrollmagic", r"scrollmagic(?:\.min)?\.js|ScrollMagic"),
    ("fullpage.js", r"fullpage(?:\.min)?\.js|fullPage\.js"),
    ("barba", r"barba(?:\.min)?\.js|window\.barba"),
    ("rellax", r"rellax(?:\.min)?\.js"),
    ("AOS", r"\baos(?:\.min)?\.js\b|data-aos="),
    ("sal.js", r"\bsal(?:\.min)?\.js\b"),
    ("skrollr", r"skrollr(?:\.min)?\.js"),
    ("marquee", r"data-marquee|\.marquee\b"),
    ("lottie", r"lottie(?:\.min)?\.js|lottie-web"),
]
_ANIM_LIBS: list[tuple[str, str]] = [
    ("lottie", r"lottie(?:\.min)?\.js|lottie-web"),
    ("swiper", r"swiper(?:\.min)?\.js|class=\"swiper"),
    ("splide", r"splide(?:\.min)?\.js|class=\"splide"),
    ("matter-js", r"matter(?:\.min)?\.js|Matter\.Engine"),
    ("particles", r"particles\.js|particlesJS"),
]
# CSS property counters — each is a plain count of declarations/occurrences.
_CSS_COUNTERS: list[tuple[str, str]] = [
    ("animation_decls", r"(?<![\w-])animation\s*:"),
    ("transition_decls", r"(?<![\w-])transition\s*:"),
    ("sticky", r"position\s*:\s*sticky"),
    ("fixed", r"position\s*:\s*fixed"),
    ("will_change", r"will-change\s*:"),
    ("backdrop_filter", r"backdrop-filter\s*:"),
    ("blend_modes", r"mix-blend-mode\s*:"),
    ("scroll_snap", r"scroll-snap"),
]

# WAF/challenge markers: if these appear, what we fetched is a block page —
# treat as a fetch failure, never as evidence of a static site.
_CHALLENGE_MARKERS = (
    "just a moment", "cf-browser-verification", "cf_chl", "attention required",
    "access denied", "request unsuccessful", "incapsula", "akamai reference",
    "perimeterx", "px-captcha", "datadome", "are you a robot",
)


def _css_attr(css: str, pattern: str, cap: int = 14) -> list[str]:
    """Distinct values of a CSS value pattern, most-frequent first."""
    vals: dict[str, int] = {}
    for m in re.finditer(pattern, css, re.IGNORECASE):
        v = m.group(1).strip().lower()
        if v:
            vals[v] = vals.get(v, 0 + 1)  # counting distinct values with frequency
    return [v for v, _ in sorted(vals.items(), key=lambda kv: -kv[1])[:cap]]


def _absolutize(u: str, base: str) -> str:
    try:
        return urllib.parse.urljoin(base or "", u.strip())
    except Exception:  # noqa: BLE001
        return u


# ── HTML probe (fixture-friendly: no fetching) ───────────────────────────────
def probe_html(html: str, base_url: str = "") -> dict:
    """Extract motion signals from raw HTML (+ any CSS already inlined).

    `base_url` absolutizes asset URLs. Never raises; degenerate input yields
    a static-editorial profile with zero signals rather than an error."""
    html = html or ""
    lower = html.lower()

    # -- videos --------------------------------------------------------------
    video_inventory: list[str] = []
    video_autoplay = False
    for vm in re.finditer(r"<video\b([^>]*)>(.*?)</video\s*>", html, re.IGNORECASE | re.DOTALL):
        attrs, inner = vm.group(1), vm.group(2)
        a = attrs.lower()
        if "autoplay" in a or "autoplay" in inner.lower()[:200]:
            video_autoplay = True
        srcs = re.findall(r"""(?:src|data-src|data-video-src)\s*=\s*["']([^"']+)["']""", attrs, re.IGNORECASE)
        srcs += re.findall(r"""<source\b[^>]*\bsrc\s*=\s*["']([^"']+)["']""", inner, re.IGNORECASE)
        for s in srcs:
            if s and not s.startswith("data:") and s not in video_inventory:
                video_inventory.append(s)
    # poster-less single-tag <video … src> (rare but real)
    for vm in re.finditer(r"<video\b[^>]*\bsrc\s*=\s*[\"']([^\"']+)[\"']", html, re.IGNORECASE):
        if not vm.group(1).startswith("data:") and vm.group(1) not in video_inventory:
            video_inventory.append(vm.group(1))

    canvas_count = len(re.findall(r"<canvas\b", html, re.IGNORECASE))
    webgl = bool(re.search(r"webgl|WebGLRenderer|getContext\([\"']webgl", html))

    # -- script / markup fingerprints ----------------------------------------
    scroll_libs = [label for label, pat in _SCROLL_LIBS if re.search(pat, html, re.IGNORECASE)]
    anim_libs = [label for label, pat in _ANIM_LIBS if re.search(pat, html, re.IGNORECASE)]
    intersection_observer = "intersectionobserver" in lower

    # -- CSS corpus: inline <style> blocks + style="" attributes (+ optionally
    # fetched sheets later) — hero media often hides in inline attributes.
    css = "\n".join(re.findall(r"<style\b[^>]*>(.*?)</style\s*>", html, re.IGNORECASE | re.DOTALL))
    css += "\n" + "\n".join(re.findall(r"""style\s*=\s*"([^"]*)""", html, re.IGNORECASE))
    css += "\n" + "\n".join(re.findall(r"""style\s*=\s*'([^']*)'""", html, re.IGNORECASE))
    keyframe_names: list[str] = []
    seen_kf: set[str] = set()
    for m in re.finditer(r"@keyframes\s+([\w-]+)", css, re.IGNORECASE):
        n = m.group(1)
        if n not in seen_kf:
            seen_kf.add(n)
            keyframe_names.append(n)
    counters = {name: len(re.findall(pat, css, re.IGNORECASE)) for name, pat in _CSS_COUNTERS}

    # -- CSS anatomy ----------------------------------------------------------
    fonts = _css_attr(css, r"font-family\s*:\s*([^;}]+)")
    colors = _css_attr(css, r"(?<![\w-])(?:color|background(?:-color)?)\s*:\s*(#[0-9a-f]{3,8}|rgba?\([^)]+\))")
    radii = _css_attr(css, r"border-radius\s*:\s*([^;}]+)")
    sizes = _css_attr(css, r"(?<![\w-])font-size\s*:\s*([\d.]+(?:px|rem|em))")
    spacing = _css_attr(css, r"(?<![\w-])(?:margin|padding|gap)\s*:\s*([\d.]+(?:px|rem|em))")

    # -- media inventory -------------------------------------------------------
    images: list[str] = []
    for m in re.finditer(r"""<img\b[^>]*\b(?:src|data-src)\s*=\s*["']([^"']+)["']""", html, re.IGNORECASE):
        u = m.group(1)
        if u.startswith("data:") or u in images:
            continue
        images.append(u)
    for m in re.finditer(r"""background-image\s*:\s*url\(\s*["']?([^"')]+)["']?\s*\)""", css, re.IGNORECASE):
        u = m.group(1)
        if u.startswith("data:") or u in images:
            continue
        images.append(u)

    # inputs/tables for the dashboard heuristic
    inputs = len(re.findall(r"<input\b|<select\b|<textarea\b", html, re.IGNORECASE))
    tables = len(re.findall(r"<table\b", html, re.IGNORECASE))

    stylesheet_urls = []
    for m in re.finditer(r"""<link\b[^>]*rel\s*=\s*["']?stylesheet["']?[^>]*>""", html, re.IGNORECASE):
        lm = re.search(r"""href\s*=\s*["']([^"']+)["']""", m.group(0), re.IGNORECASE)
        if lm and not lm.group(1).startswith("data:"):
            stylesheet_urls.append(lm.group(1))

    signals: dict = {
        "video_count": len(video_inventory),
        "video_autoplay": video_autoplay,
        "video_inventory": [_absolutize(v, base_url) for v in video_inventory[:12]],
        "canvas_count": canvas_count,
        "webgl": webgl,
        "scroll_libs": scroll_libs,
        "anim_libs": [l for l in anim_libs if l not in scroll_libs],
        "keyframes": len(keyframe_names),
        "keyframe_names": keyframe_names[:12],
        **counters,
        "intersection_observer": intersection_observer,
        "fonts": fonts,
        "colors": colors,
        "radii": radii,
        "font_sizes": sizes,
        "spacing": spacing,
        "image_inventory": [_absolutize(i, base_url) for i in images[:30]],
        "stylesheet_urls": [_absolutize(s, base_url) for s in stylesheet_urls[:8]],
        "inputs": inputs,
        "tables": tables,
    }
    taxonomy, why = classify_taxonomy(signals)
    return {"ok": True, "url": base_url, "taxonomy": taxonomy, "taxonomy_why": why,
            "signals": signals, "stylesheets_fetched": 0, "elapsed_s": 0.0}


# ── Taxonomy ─────────────────────────────────────────────────────────────────
def classify_taxonomy(s: dict) -> tuple[str, str]:
    """Map probe signals -> reference taxonomy. Ordered: strongest signal wins."""
    if s.get("webgl") or s.get("canvas_count", 0) >= 1 and "three.js" in (s.get("scroll_libs") or []):
        return "immersive-3d", "WebGL/canvas + three.js machinery present"
    if s.get("video_count", 0) >= 1:
        return ("video-led",
                f"{s['video_count']} <video> element(s)"
                + (" autoplaying" if s.get("video_autoplay") else ""))
    libs = s.get("scroll_libs") or []
    if libs or s.get("keyframes", 0) >= 3 or s.get("animation_decls", 0) >= 5:
        why = []
        if libs:
            why.append(f"scroll/anim libs: {', '.join(libs)}")
        if s.get("keyframes", 0):
            why.append(f"{s['keyframes']} @keyframes")
        return "motion-marketing", "; ".join(why)
    if s.get("inputs", 0) >= 5 or s.get("tables", 0) >= 2:
        return "dashboard", f"{s['inputs']} form controls, {s['tables']} tables — app-like density"
    return "static-editorial", "no motion machinery in fetched HTML/CSS"


# ── Live fetch (probe_url) ───────────────────────────────────────────────────
def _fetch(url: str, timeout: float) -> tuple[int, str]:
    req = urllib.request.Request(url, headers={
        "User-Agent": ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                       "(KHTML, like Gecko) Chrome/126.0 Safari/537.36"),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
    })
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return resp.status, resp.read(1_500_000).decode("utf-8", errors="replace")


def _looks_like_challenge(body: str) -> str | None:
    low = body[:4000].lower()
    for marker in _CHALLENGE_MARKERS:
        if marker in low:
            return marker
    return None


def probe_url(url: str, budget: float = 10.0) -> dict:
    """Fetch + probe a live reference. Total time-budgeted (page fetch + up to
    4 same-page stylesheets within what remains), so the chat turn never stalls."""
    t0 = time.monotonic()
    try:
        status, html = _fetch(url, timeout=max(3.0, min(8.0, budget)))
    except Exception as exc:  # noqa: BLE001 — loud-degrade contract
        return {"ok": False, "url": url, "reason": f"fetch failed: {exc}"}
    challenge = _looks_like_challenge(html)
    if challenge:
        return {"ok": False, "url": url, "reason": f"block page (matched challenge marker: {challenge!r})"}
    profile = probe_html(html, base_url=url)

    # Stylesheets within the remaining budget — @keyframes/animation live there
    # on most production sites (inline <style> is rare). All sheet CSS is
    # ACCUMULATED and re-probed in ONE pass: per-sheet re-probes would make each
    # scalar count reflect only page+that-sheet, so a keyframe-free last sheet
    # would erase earlier sheets' counts (the bug the aceternity run exposed).
    deadline = t0 + budget
    corpus: list[str] = []
    for sheet_url in profile["signals"]["stylesheet_urls"][:4]:
        remaining = deadline - time.monotonic()
        if remaining < 1.5:
            break
        try:
            _status, css = _fetch(sheet_url, timeout=min(4.0, remaining))
            if _looks_like_challenge(css):
                continue
            corpus.append(css)
        except Exception:  # noqa: BLE001 — a dead sheet never fails the probe
            continue
    fetched = len(corpus)
    if corpus:
        profile = probe_html(html + "<style>" + "\n".join(corpus) + "</style>", base_url=url)
    profile["stylesheets_fetched"] = fetched
    profile["elapsed_s"] = round(time.monotonic() - t0, 2)
    return profile


# ── Markdown rendering ───────────────────────────────────────────────────────
def render_markdown(profile: dict) -> str:
    s = profile.get("signals", {})
    lines: list[str] = []
    lines.append(f"- Reference: {profile.get('url', '(fixture)')}")
    lines.append(f"- Taxonomy: **{profile.get('taxonomy', 'unknown')}** — {profile.get('taxonomy_why', '')}")
    lines.append(f"- Probe: server-side static-HTML analysis, "
                 f"{profile.get('stylesheets_fetched', 0)} stylesheet(s) fetched, "
                 f"{profile.get('elapsed_s', 0)}s")
    lines.append("")
    lines.append("## Motion machinery")
    lines.append(f"- `<video>` elements: **{s.get('video_count', 0)}**"
                 + (" (autoplaying)" if s.get("video_autoplay") else ""))
    for v in (s.get("video_inventory") or [])[:8]:
        lines.append(f"  - video asset: {v}")
    if s.get("canvas_count"):
        lines.append(f"- `<canvas>`: {s['canvas_count']}" + (" + WebGL" if s.get("webgl") else ""))
    libs = (s.get("scroll_libs") or []) + (s.get("anim_libs") or [])
    lines.append(f"- Motion libraries detected: **{', '.join(libs) if libs else 'none in static HTML'}**")
    lines.append(f"- `@keyframes` definitions: **{s.get('keyframes', 0)}**"
                 + (f" (e.g. {', '.join(s['keyframe_names'][:6])})" if s.get("keyframe_names") else ""))
    lines.append(f"- animation declarations: {s.get('animation_decls', 0)} · "
                 f"transition declarations: {s.get('transition_decls', 0)} · "
                 f"sticky: {s.get('sticky', 0)} · fixed: {s.get('fixed', 0)} · "
                 f"will-change: {s.get('will_change', 0)}")
    lines.append(f"- IntersectionObserver: {'yes' if s.get('intersection_observer') else 'not in static HTML'}")
    lines.append("")
    lines.append("## CSS anatomy")
    if s.get("fonts"):
        lines.append(f"- Fonts: {', '.join(s['fonts'][:6])}")
    if s.get("colors"):
        lines.append(f"- Palette (top): {', '.join(s['colors'][:10])}")
    if s.get("radii"):
        lines.append(f"- Radii: {', '.join(s['radii'][:6])}")
    if s.get("font_sizes"):
        lines.append(f"- Type scale: {', '.join(s['font_sizes'][:8])}")
    if s.get("spacing"):
        lines.append(f"- Spacing rhythm: {', '.join(s['spacing'][:8])}")
    lines.append("")
    lines.append("## Asset inventory (hybrid asset plan input)")
    imgs = s.get("image_inventory") or []
    lines.append(f"- Images: {len(imgs)} (first 10)")
    for u in imgs[:10]:
        lines.append(f"  - {u}")
    lines.append("")
    lines.append("## Limitations (read before building)")
    lines.append("- Static-HTML probe: JS-injected motion (runtime-added keyframes, "
                 "client-rendered video) may be undercounted — verify with the "
                 "HeadlessX full-page screenshot and browser_snapshot DOM before "
                 "declaring a reference static.")
    lines.append("- A static rebuild of an animated reference is a FAILED build. "
                 "If the reference animates, the build must too.")
    return "\n".join(lines)


# ── CLI dry-run ──────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import argparse
    import sys

    ap = argparse.ArgumentParser(description="Reference motion probe (dry-run)")
    ap.add_argument("url", nargs="?", help="Live URL to probe")
    ap.add_argument("--file", help="Probe a saved HTML fixture instead of fetching")
    ap.add_argument("--budget", type=float, default=10.0)
    args = ap.parse_args()
    if args.file:
        with open(args.file, encoding="utf-8", errors="replace") as fh:
            prof = probe_html(fh.read(), base_url="https://fixture.example/")
    elif args.url:
        prof = probe_url(args.url, budget=args.budget)
    else:
        ap.error("give a URL or --file")
    if prof.get("ok"):
        print(render_markdown(prof))
    else:
        print(f"PROBE FAILED: {prof.get('reason')}", file=sys.stderr)
        raise SystemExit(2)
