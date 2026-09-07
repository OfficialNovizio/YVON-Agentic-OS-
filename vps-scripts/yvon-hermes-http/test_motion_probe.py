"""Tests for motion_probe.py (re-engineer Phase 1, 2026-09-05).

Plain-script convention of this directory (no pytest dependency): ck()/PASS/FAIL,
nonzero exit on any failure. Run:  python test_motion_probe.py
"""
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

from motion_probe import (  # noqa: E402
    classify_taxonomy,
    detect_reference_urls,
    probe_html,
    render_markdown,
)

fail = 0


def ck(n, c):
    global fail
    print(("  PASS  " if c else "  FAIL  ") + n)
    if not c:
        fail += 1


# A fixture shaped like a real motion-marketing landing page: hero video,
# inline keyframes, scroll-lib fingerprints, anatomy values, lazy images.
FIXTURE = """
<!doctype html><html><head>
<link rel="stylesheet" href="/assets/main.css">
<style>
  @keyframes fadeUp { from { opacity:0; transform: translateY(24px); } to { opacity:1; } }
  @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
  @keyframes pulse { 0% {opacity:.6} 50% {opacity:1} 100% {opacity:.6} }
  .hero { animation: fadeUp 1.2s ease-out both; transition: opacity .4s ease; }
  .nav { position: sticky; top: 0; backdrop-filter: blur(12px); }
  body { font-family: 'Inter', sans-serif; color: #111318; background: #faf9f6;
         font-size: 16px; margin: 0; padding: 0; border-radius: 12px; }
  .btn { border-radius: 999px; font-size: 1.25rem; padding: 24px; }
  .card { background: rgba(89, 46, 255, 0.08); will-change: transform; }
</style>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12/dist/ScrollTrigger.min.js"></script>
<script>document.addEventListener('DOMContentLoaded', function(){
  new IntersectionObserver(function(){}).observe(document.body);
  gsap.to('.hero', {scrollTrigger: {trigger: '.hero'}});
});</script>
</head><body>
<video autoplay muted playsinline loop poster="/img/hero-poster.jpg">
  <source src="/media/hero-loop.mp4" type="video/mp4">
</video>
<canvas id="gl"></canvas>
<img src="/img/face-1.jpg" alt=""><img data-src="/img/face-2.webp" alt="">
<section style="background-image:url(/img/pattern.svg)"></section>
<div class="lenis-root" data-lenis-prevent></div>
</body></html>
"""

print("\n[1] URL detection")
urls = detect_reference_urls(
    "build me a site like https://example.com/studio, then check http://b.com/x. ok?"
)
ck("first URL wins", urls[0] == "https://example.com/studio")
ck("trailing punctuation stripped", urls[0].endswith("studio"))
ck("second URL found", "http://b.com/x" in urls)
ck("dedupe", len(detect_reference_urls("see https://a.com and https://a.com")) == 1)
ck("empty message", detect_reference_urls("") == [])
ck("no URLs", detect_reference_urls("hello world") == [])

print("\n[2] fixture probe — motion machinery")
p = probe_html(FIXTURE, base_url="https://ref.example/")
s = p["signals"]
ck("ok", p["ok"] is True)
ck("video found", s["video_count"] == 1)
ck("autoplay detected", s["video_autoplay"] is True)
ck("video asset absolutized", s["video_inventory"][0] == "https://ref.example/media/hero-loop.mp4")
ck("canvas counted", s["canvas_count"] == 1)
ck("gsap+ScrollTrigger fingerprinted", "gsap/ScrollTrigger" in s["scroll_libs"])
ck("lenis fingerprinted", "lenis" in s["scroll_libs"])
ck("IntersectionObserver seen", s["intersection_observer"] is True)
ck("keyframes counted", s["keyframes"] == 3)
ck("keyframe names captured", "fadeUp" in s["keyframe_names"])
ck("animation decls", s["animation_decls"] >= 1)
ck("transition decls", s["transition_decls"] >= 1)
ck("sticky found", s["sticky"] >= 1)
ck("will-change found", s["will_change"] >= 1)
ck("backdrop-filter found", s["backdrop_filter"] >= 1)

print("\n[3] fixture probe — CSS anatomy + assets")
ck("font captured", any("inter" in f for f in s["fonts"]))
ck("colors captured", "#111318" in s["colors"] and "rgba(89, 46, 255, 0.08)" in s["colors"])
ck("radii captured", "999px" in s["radii"] and "12px" in s["radii"])
ck("type scale captured", "1.25rem" in s["font_sizes"] and "16px" in s["font_sizes"])
ck("spacing captured", "24px" in s["spacing"])
imgs = s["image_inventory"]
ck("img src found", "https://ref.example/img/face-1.jpg" in imgs)
ck("lazy data-src found", "https://ref.example/img/face-2.webp" in imgs)
ck("css background-image found", any(u.endswith("pattern.svg") for u in imgs))
ck("stylesheet link collected", s["stylesheet_urls"] == ["https://ref.example/assets/main.css"])

print("\n[4] taxonomy classification")
t, why = classify_taxonomy(s)
ck("video-led (autoplay video beats libs)", t == "video-led")
t2, _ = classify_taxonomy({**s, "video_count": 0, "video_autoplay": False})
ck("motion-marketing without video", t2 == "motion-marketing")
t3, _ = classify_taxonomy({"video_count": 0, "canvas_count": 1, "webgl": True,
                           "scroll_libs": ["three.js"], "inputs": 0, "tables": 0,
                           "keyframes": 0, "animation_decls": 0})
ck("immersive-3d", t3 == "immersive-3d")
t4, _ = classify_taxonomy({"video_count": 0, "canvas_count": 0, "webgl": False,
                           "scroll_libs": [], "inputs": 9, "tables": 3,
                           "keyframes": 0, "animation_decls": 0})
ck("dashboard", t4 == "dashboard")
t5, _ = classify_taxonomy({"video_count": 0, "canvas_count": 0, "webgl": False,
                           "scroll_libs": [], "inputs": 0, "tables": 0,
                           "keyframes": 0, "animation_decls": 0})
ck("static-editorial", t5 == "static-editorial")

print("\n[5] markdown rendering")
md = render_markdown(p)
ck("has taxonomy line", "**video-led**" in md)
ck("has machinery section", "## Motion machinery" in md)
ck("lists video asset", "hero-loop.mp4" in md)
ck("lists libs", "gsap/ScrollTrigger" in md)
ck("has anatomy section", "## CSS anatomy" in md)
ck("has asset inventory", "## Asset inventory" in md)
ck("has limitations", "FAILED build" in md)

print("\n[6] degenerate input never raises")
p0 = probe_html("")
ck("empty html ok", p0["ok"] is True)
ck("empty html is static-editorial", p0["taxonomy"] == "static-editorial")
ck("markdown renders", "static-editorial" in render_markdown(p0))
p1 = probe_html("<video src='x.mp4'>")
ck("unclosed video still counted", p1["signals"]["video_inventory"] == ["x.mp4"])

print("\n[7] live fetch failure is loud, not silent-static")
import motion_probe as mp
bad = mp.probe_url("http://127.0.0.1:9/", budget=3.0)
ck("unreachable -> ok False", bad["ok"] is False)
ck("reason present", bool(bad.get("reason")))

print()
if fail:
    print(f"{fail} FAILURE(S)")
    sys.exit(1)
print("ALL PASS")
