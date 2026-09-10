#!/usr/bin/env python3
# verify-clone-proof.py — screenshot the static clone's slides headlessly and
# compose an original-vs-clone proof image (2026-09-06).
#
# The clone is served locally (python http.server) — no bot wall — so plain
# headless chromium is enough here. The stealth/headed requirement only
# applies to the LIVE reference capture.
#
# Usage:
#   python scripts/verify-clone-proof.py                       # brunellocucinelli defaults
#   python scripts/verify-clone-proof.py --clone <dir> --original <png> [--out <dir>]
#     --clone  a directory with index.html - the script serves it itself on an
#              ephemeral localhost port (stdlib http.server, atexit-stopped)
#     --original  the live capture's reference.png to compare against
#     --out       where proof images land (default: <clone>/proof)
# Writes: workspaces/_reference-captures/brunellocucinelli-clone/proof/slide-N.png
#         .../PROOF-original-vs-clone.png + prints a JSON summary
#
# Owner: mia/dev · reference-capture for Akamai-class sites, 2026-09-06

import argparse
import atexit
import json
import pathlib
import sys
import threading

REPO = pathlib.Path(__file__).resolve().parents[1]
CAP = REPO / "workspaces" / "_reference-captures" / "brunellocucinelli"
CLONE = REPO / "workspaces" / "_reference-captures" / "brunellocucinelli-clone"


def path_is_abs(p: str) -> bool:
    return pathlib.Path(p).is_absolute()


def serve_clone(clone_dir: pathlib.Path) -> str:
    "Serve clone_dir over an ephemeral localhost port; returns the index.html URL. Stopped at exit."
    import functools
    from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

    handler = functools.partial(SimpleHTTPRequestHandler, directory=str(clone_dir))
    srv = ThreadingHTTPServer(("127.0.0.1", 0), handler)
    atexit.register(srv.shutdown)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return f"http://127.0.0.1:{srv.server_port}/index.html"

SLIDES = [0, 1, 3]  # hero / new arrivals / seasonal creations


def main() -> int:
    from playwright.sync_api import sync_playwright

    ap = argparse.ArgumentParser()
    ap.add_argument("--url", default="http://localhost:8798/index.html")
    ap.add_argument("--slides", type=int, nargs="+", default=SLIDES)
    ap.add_argument("--original", default=str(CAP / "reference.png"), help="clean full-page capture of the live site")
    ap.add_argument("--clone", default=str(CLONE), help="clone dir with index.html - served on an ephemeral port")
    ap.add_argument("--out", default="", help="proof output dir (default: <clone>/proof)")
    args = ap.parse_args()

    clone_dir = pathlib.Path(args.clone).resolve()
    if not (clone_dir / "index.html").exists():
        print(json.dumps({"ok": False, "error": f"no index.html in clone dir {clone_dir}"}))
        return 2
    url = serve_clone(clone_dir)
    proof = pathlib.Path(args.out).resolve() if args.out else (clone_dir / "proof")
    proof.mkdir(parents=True, exist_ok=True)

    console_errors: list[str] = []
    results = []
    with sync_playwright() as p:
        browser = p.chromium.launch(channel="msedge", headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        page.on("console", lambda m: console_errors.append(m.text) if m.type == "error" else None)
        page.on("pageerror", lambda e: console_errors.append(str(e)))
        page.goto(url, wait_until="networkidle", timeout=60_000)
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
            try:
                results.append(str(path.relative_to(REPO)))
            except ValueError:
                results.append(str(path))
        browser.close()

    # composite: original hero (top 900 of reference.png) vs clone slides
    from PIL import Image, ImageDraw

    W, H, PAD, LABEL = 720, 450, 16, 34
    orig = Image.open(args.original)
    orig_hero = orig.crop((0, 0, orig.width, min(900, orig.height))).resize((W, H))
    shots = [Image.open(r if path_is_abs(r) else REPO / r).resize((W, H)) for r in results]

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

    try:
        composite_rel = str(out.relative_to(REPO))
    except ValueError:
        composite_rel = str(out)
    print(json.dumps({"ok": True, "screenshots": results, "composite": composite_rel, "consoleErrors": console_errors[:5], "consoleErrorCount": len(console_errors)}, indent=1))
    return 0


if __name__ == "__main__":
    sys.exit(main())
