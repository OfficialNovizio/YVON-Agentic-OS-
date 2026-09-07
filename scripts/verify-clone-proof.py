#!/usr/bin/env python3
# verify-clone-proof.py — screenshot the static clone's slides headlessly and
# compose an original-vs-clone proof image (2026-09-06).
#
# The clone is served locally (python http.server) — no bot wall — so plain
# headless chromium is enough here. The stealth/headed requirement only
# applies to the LIVE reference capture.
#
# Usage: python scripts/verify-clone-proof.py [--url http://localhost:8798/index.html]
# Writes: workspaces/_reference-captures/brunellocucinelli-clone/proof/slide-N.png
#         .../PROOF-original-vs-clone.png + prints a JSON summary
#
# Owner: mia/dev · reference-capture for Akamai-class sites, 2026-09-06

import argparse
import json
import pathlib
import sys

REPO = pathlib.Path(__file__).resolve().parents[1]
CAP = REPO / "workspaces" / "_reference-captures" / "brunellocucinelli"
CLONE = REPO / "workspaces" / "_reference-captures" / "brunellocucinelli-clone"

SLIDES = [0, 1, 3]  # hero / new arrivals / seasonal creations


def main() -> int:
    from playwright.sync_api import sync_playwright

    ap = argparse.ArgumentParser()
    ap.add_argument("--url", default="http://localhost:8798/index.html")
    ap.add_argument("--slides", type=int, nargs="+", default=SLIDES)
    ap.add_argument("--original", default=str(CAP / "reference.png"), help="clean full-page capture of the live site")
    args = ap.parse_args()

    proof = CLONE / "proof"
    proof.mkdir(parents=True, exist_ok=True)

    console_errors: list[str] = []
    results = []
    with sync_playwright() as p:
        browser = p.chromium.launch(channel="msedge", headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        page.on("console", lambda m: console_errors.append(m.text) if m.type == "error" else None)
        page.on("pageerror", lambda e: console_errors.append(str(e)))
        page.goto(args.url, wait_until="networkidle", timeout=60_000)
        page.wait_for_timeout(4_000)
        page.evaluate(
            """() => {
                const w = document.querySelector('.swiper-vertical .swiper-wrapper, .swiper-container-vertical .swiper-wrapper');
                window.__slides = [...w.querySelectorAll(':scope > .swiper-slide')];
                window.__go = (n) => {
                    w.style.transition = 'none';
                    w.style.transform = `translate3d(0, ${-window.__slides[n].offsetTop}px, 0)`;
                    window.__slides.forEach((s, k) => s.classList.toggle('swiper-slide-active', k === n));
                };
                const v = document.querySelector('video'); v.muted = true; v.play().catch(() => {});
            }"""
        )
        page.wait_for_timeout(1_500)
        for n in args.slides:
            page.evaluate(f"() => window.__go({n})")
            page.wait_for_timeout(1_800)
            path = proof / f"slide-{n}.png"
            page.screenshot(path=str(path))
            results.append(str(path.relative_to(REPO)))
        browser.close()

    # composite: original hero (top 900 of reference.png) vs clone slides
    from PIL import Image, ImageDraw

    W, H, PAD, LABEL = 720, 450, 16, 34
    orig = Image.open(args.original)
    orig_hero = orig.crop((0, 0, orig.width, min(900, orig.height))).resize((W, H))
    shots = [Image.open(REPO / r).resize((W, H)) for r in results]

    cols, rows = 2, 2
    canvas = Image.new("RGB", (cols * W + PAD * 3, rows * (H + LABEL) + PAD * 3), "#111111")
    d = ImageDraw.Draw(canvas)
    cells = [("ORIGINAL — live site (capture)", orig_hero)] + [
        (f"CLONE — slide {n + 1}", s) for n, s in zip(args.slides, shots)
    ]
    for i, (label, img) in enumerate(cells[: cols * rows]):
        x = PAD + (i % cols) * (W + PAD)
        y = PAD + (i // cols) * (H + LABEL + PAD)
        canvas.paste(img, (x, y + LABEL))
        d.text((x + 2, y + 8), label, fill="#ffffff")
    out = proof / "PROOF-original-vs-clone.png"
    canvas.save(out)

    print(json.dumps({"screenshots": results, "composite": str(out.relative_to(REPO)), "consoleErrors": console_errors[:5], "consoleErrorCount": len(console_errors)}, indent=1))
    return 0


if __name__ == "__main__":
    sys.exit(main())
