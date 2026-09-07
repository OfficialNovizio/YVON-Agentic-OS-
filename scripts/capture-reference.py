#!/usr/bin/env python3
# capture-reference.py — local deep-capture of a reference website for the
# design->build pipeline (2026-09-06).
#
# WHY THIS EXISTS: Akamai-class bot walls deny every server-side path the
# fleet has (Jina Reader, HeadlessX, crawl4ai, the motion probe — all proven
# against shop.brunellocucinelli.com). The one session that passes is a real
# browser on a residential IP — PROVEN with Playwright + undetected-playwright's
# Malenia stealth patches, HEADED, on the local machine (headless is still
# denied). This tool wraps that proven core and produces the evidence the
# pipeline's gate chain consumes:
#
#   <out>/reference.png    full-page screenshot (post-consent, post-scroll)
#   <out>/reference.html   hydrated DOM at final state
#   <out>/inventory.json   videos, images, stylesheets, keyframes, fonts,
#                          consent-widget leftovers, page height
#   <out>/downloads.json   asset manifest (media URLs -> suggested local paths)
#   <out>/assets/          every remote asset localized (harvest step)
#   <out>/asset-manifest.json  url -> local relative path (feeds the clone builder)
#
# HARVEST: assets on the page's own (bot-walled) origin 403 plain downloads,
# so every URL is first tried as a direct request; anything refused is fetched
# IN-PAGE through the still-open stealth session (same-origin fetch carries
# the session's cookies and fingerprint). The clone builder therefore needs
# no network and no stealth at all.
#
# Usage:
#   python scripts/capture-reference.py --url <url> --out <dir> \
#       [--dismiss "Continue without accepting" --dismiss "Accept All"] \
#       [--width 1440] [--height 900]
#
# A visible browser window opens for the duration (~30-60s) — headed is what
# passes Akamai; do not close the window. Requires: playwright +
# undetected-playwright (pip), a Chromium-based browser installed locally.
# The tool is generic: no site-specific logic beyond the consent-button labels
# passed via --dismiss.
#
# Owner: mia/dev · reference-capture for Akamai-class sites, 2026-09-06

import argparse
import asyncio
import base64
import hashlib
import json
import pathlib
import re
import sys
import urllib.parse
import urllib.request

DEFAULT_DISMISS = ["Continue without accepting", "Accept All"]

# <link> rels that point at downloadable ASSETS. Anything else (alternate,
# canonical, author, ...) is a page URL — harvesting it pulls every locale's
# homepage as a 0.5MB "asset" (mirrors ASSET_LINK_RELS in build-static-clone.py)
ASSET_LINK_RELS = (
    "stylesheet", "icon", "apple-touch-icon", "manifest",
    "preload", "prefetch", "dns-prefetch",
)

UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36"
)

# Every remote URL the DOM references (src / poster / link href / srcset
# candidates / url() inside inline <style> and style="" attrs). data: URIs
# stay inline — nothing to download.
_EXTRACT_URLS_JS = """() => {
    const abs = (u) => { try { return new URL(u, location.href).href } catch { return null } };
    const urls = new Set();
    const add = (u) => {
        if (!u) return;
        const a = abs(String(u).trim());
        if (a && /^https?:/.test(a)) urls.add(a);
    };
    for (const el of document.querySelectorAll('[src]')) add(el.getAttribute('src'));
    for (const el of document.querySelectorAll('[poster]')) add(el.getAttribute('poster'));
    for (const el of document.querySelectorAll('link[href]')) add(el.getAttribute('href'));
    for (const el of document.querySelectorAll('[srcset]'))
        for (const part of el.getAttribute('srcset').split(/,\\s+/))
            add(part.trim().split(/\\s+/)[0]);
    const cssUrl = (text) => {
        for (const m of text.matchAll(/url\\(\\s*(['"]?)([^'")]+)\\1\\s*\\)/g)) add(m[2]);
    };
    for (const style of document.querySelectorAll('style')) cssUrl(style.textContent);
    for (const el of document.querySelectorAll('[style]')) cssUrl(el.getAttribute('style') || '');
    return [...urls];
}"""

_FETCH_INPAGE_JS = """async (url) => {
    const r = await fetch(url, { credentials: 'include' });
    if (!r.ok) return null;
    const bytes = new Uint8Array(await r.arrayBuffer());
    let binary = '';
    for (let i = 0; i < bytes.length; i += 0x8000)
        binary += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(binary);
}"""


def _local_name(url: str, used: set[str]) -> str:
    """Readable, collision-free asset filename."""
    path = urllib.parse.urlparse(url).path
    base = re.sub(r"[^A-Za-z0-9._-]", "_", path.rstrip("/").split("/")[-1] or "asset")
    if len(base) > 80:
        base = base[-80:]
    name, dot, ext = base.rpartition(".")
    stem = name or base
    ext = dot + ext if dot else ""
    for n in range(300):
        candidate = f"{stem}-{n}{ext}" if n else f"{stem}{ext}"
        if candidate not in used:
            used.add(candidate)
            return candidate
    candidate = hashlib.sha1(url.encode()).hexdigest()[:12] + ext
    used.add(candidate)
    return candidate


def _direct_download(url: str, dest: pathlib.Path) -> bool:
    try:
        req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "*/*"})
        with urllib.request.urlopen(req, timeout=45) as r:
            if r.status != 200:
                return False
            dest.write_bytes(r.read())
        return True
    except Exception:
        return False


async def _inpage_fetch(page, url: str, dest: pathlib.Path) -> bool:
    try:
        b64 = await page.evaluate(_FETCH_INPAGE_JS, url)
        if not b64:
            return False
        dest.write_bytes(base64.b64decode(b64))
        return True
    except Exception:
        return False


def _urls_from_html(html: str, base_url: str) -> list[str]:
    """Every remote URL the SAVED dom references. Parsing the saved html (not
    the live page) matters: personalization scripts keep mutating the live dom
    after the snapshot, injecting relative paths that resolve wrong and miss
    the harvest. The saved dom is exactly what the clone builder consumes."""
    from bs4 import BeautifulSoup

    urls: list[str] = []

    def add(raw: str) -> None:
        raw = (raw or "").strip()
        if not raw:
            return
        absu = urllib.parse.urljoin(base_url, raw)
        if absu.startswith(("http://", "https://")):
            urls.append(absu)

    soup = BeautifulSoup(html, "html.parser")
    for el in soup.find_all(attrs={"src": True}):
        add(el["src"])
    for el in soup.find_all(attrs={"poster": True}):
        add(el["poster"])
    for el in soup.find_all("link", href=True):
        rels = [str(r).lower() for r in (el.get("rel") or [])]
        if rels and not any(r in ASSET_LINK_RELS for r in rels):
            continue  # page-role link (alternate/canonical/...) — not an asset
        add(el["href"])
    for el in soup.find_all(attrs={"srcset": True}):
        # candidates separate on comma+whitespace — bare commas occur INSIDE
        # urls (cloudinary transforms like f_auto,q_auto) and must not split
        for cand in re.split(r",\s+", el["srcset"]):
            bits = cand.strip().split()
            if bits:
                add(bits[0])
    for style in soup.find_all("style"):
        for m in re.finditer(r"url\(\s*(['\"]?)([^'\")]+)\1\s*\)", style.get_text()):
            add(m.group(2))
    for el in soup.find_all(attrs={"style": True}):
        for m in re.finditer(r"url\(\s*(['\"]?)([^'\")]+)\1\s*\)", el["style"]):
            add(m.group(2))
    seen: set[str] = set()
    ordered = []
    for u in urls:
        if u not in seen:
            seen.add(u)
            ordered.append(u)
    return ordered


async def harvest_assets(page, out: pathlib.Path, html: str) -> dict[str, str]:
    """Localize every referenced asset. Direct request first; anything the
    CDN/bot-wall refuses is fetched in-page through the stealth session."""
    base_url = page.url
    urls = _urls_from_html(html, base_url)
    assets_dir = out / "assets"
    assets_dir.mkdir(parents=True, exist_ok=True)
    used: set[str] = set()
    manifest: dict[str, str] = {}
    misses: list[str] = []
    for url in urls:
        name = _local_name(url, used)
        dest = assets_dir / name
        if _direct_download(url, dest) or await _inpage_fetch(page, url, dest):
            manifest[url] = f"assets/{name}"
        else:
            used.discard(name)
            misses.append(url)
    (out / "asset-manifest.json").write_text(json.dumps(manifest, indent=1), encoding="utf-8")
    if misses:
        (out / "asset-misses.json").write_text(json.dumps(misses, indent=1), encoding="utf-8")
    return manifest


async def capture(url: str, out: pathlib.Path, dismiss: list[str], width: int, height: int) -> dict:
    from playwright.async_api import async_playwright
    from undetected_playwright import Malenia

    out.mkdir(parents=True, exist_ok=True)
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            channel="msedge", headless=False, args=[f"--window-size={width},{height + 40}"]
        )
        try:
            context = await browser.new_context(viewport={"width": width, "height": height})
            await Malenia.apply_stealth(context)
            page = await context.new_page()
            await page.goto(url, wait_until="domcontentloaded", timeout=60_000)
            await page.wait_for_timeout(8_000)

            for label in dismiss:
                try:
                    await page.get_by_role("button", name=label).first.click(timeout=4_000)
                    break
                except Exception:
                    continue
            await page.wait_for_timeout(3_000)

            # consent banners can mount later than the first dismiss window
            # (OneTrust lazy-loads) — retry the dismiss labels after settling
            for label in dismiss:
                try:
                    await page.get_by_role("button", name=label).first.click(timeout=2_500)
                    break
                except Exception:
                    continue

            # slow scroll to the bottom and back — triggers lazy sections,
            # video loads, and reveal systems before evidence is taken. Some
            # sites mount whole sections asynchronously after consent (client-
            # rendered commerce pages), so keep nudging (scroll + resize
            # events) until the page height stops growing or the settle
            # budget is spent.
            await page.evaluate(
                """async (maxMs) => {
                    const t0 = Date.now();
                    let last = -1, stable = 0;
                    while (Date.now() - t0 < maxMs && stable < 3) {
                        const h = document.body.scrollHeight;
                        if (h === last) stable++; else stable = 0;
                        last = h;
                        window.dispatchEvent(new Event('resize'));
                        for (let y = 0; y <= h; y += 600) {
                            window.scrollTo(0, y);
                            await new Promise(r => setTimeout(r, 200));
                        }
                        window.scrollTo(0, 0);
                        await new Promise(r => setTimeout(r, 1_500));
                    }
                }""",
                45_000,
            )
            await page.wait_for_timeout(3_000)

            inventory = await page.evaluate(
                """() => {
                    const abs = (u) => { try { return new URL(u, location.href).href; } catch { return u; } };
                    let keyframes = [], animatedRules = 0, fonts = new Set(), colors = new Set();
                    for (const ss of document.styleSheets) {
                        let rules; try { rules = [...ss.cssRules]; } catch { continue; }
                        for (const r of rules) {
                            if (r.type === CSSRule.KEYFRAMES_RULE) keyframes.push(r.name);
                            if (r.style) {
                                if (r.style.animation || r.style.animationName) animatedRules++;
                                for (const fam of (r.style.fontFamily || '').split(',')) {
                                    const f = fam.trim().replace(/["']/g, '');
                                    if (f) fonts.add(f);
                                }
                                for (const c of [r.style.color, r.style.backgroundColor, r.style.borderColor]) {
                                    if (c && c !== 'initial' && c !== 'inherit') colors.add(c);
                                }
                            }
                        }
                    }
                    return {
                        url: location.href,
                        title: document.title,
                        pageHeight: document.body.scrollHeight,
                        videos: [...document.querySelectorAll('video')].map(v => ({
                            src: abs(v.currentSrc || v.src || ''), poster: abs(v.poster || ''),
                            autoplay: v.autoplay, muted: v.muted, loop: v.loop,
                        })),
                        videoSources: [...document.querySelectorAll('video source, source')].map(s => abs(s.src)).filter(Boolean),
                        images: [...document.querySelectorAll('img')].map(i => ({
                            src: abs(i.currentSrc || i.src), alt: i.alt || '',
                        })).filter(x => x.src),
                        backgrounds: [...document.querySelectorAll('*')]
                            .map(el => getComputedStyle(el).backgroundImage)
                            .filter(bg => bg && bg !== 'none' && bg.includes('url(')).length,
                        stylesheets: [...document.querySelectorAll('link[rel="stylesheet"]')].map(l => abs(l.href)),
                        inlineStyleTags: document.querySelectorAll('style').length,
                        keyframes: [...new Set(keyframes)],
                        animatedRules,
                        fonts: [...fonts],
                        colors: [...colors].slice(0, 40),
                    };
                }"""
            )

            await page.screenshot(path=str(out / "reference.png"), full_page=True)
            html = await page.content()
            (out / "reference.html").write_text(html, encoding="utf-8")
            (out / "inventory.json").write_text(json.dumps(inventory, indent=1), encoding="utf-8")

            # asset manifest — every remote asset the clone builder should localize
            downloads = []
            for v in inventory["videos"]:
                downloads.append({"url": v["src"], "kind": "video"})
                if v["poster"]:
                    downloads.append({"url": v["poster"] + ".jpg", "kind": "image", "source_url": v["poster"]})
            for s in inventory["videoSources"]:
                downloads.append({"url": s, "kind": "video"})
            for i in inventory["images"]:
                downloads.append({"url": i["src"], "kind": "image"})
            (out / "downloads.json").write_text(json.dumps(downloads, indent=1), encoding="utf-8")

            manifest = await harvest_assets(page, out, html)

            summary = {
                "ok": True,
                "url": inventory["url"],
                "title": inventory["title"],
                "pageHeight": inventory["pageHeight"],
                "html_kb": len(html) // 1024,
                "videos": len(inventory["videos"]),
                "images": len(inventory["images"]),
                "stylesheets": len(inventory["stylesheets"]),
                "keyframes": len(inventory["keyframes"]),
                "animatedRules": inventory["animatedRules"],
                "fonts": inventory["fonts"][:12],
                "assetsHarvested": len(manifest),
            }
            return summary
        finally:
            await browser.close()


def main() -> int:
    ap = argparse.ArgumentParser(description="Local stealth deep-capture of a reference website")
    ap.add_argument("--url", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--dismiss", action="append", default=None, help="consent button label to click; repeatable")
    ap.add_argument("--width", type=int, default=1440)
    ap.add_argument("--height", type=int, default=900)
    args = ap.parse_args()

    out = pathlib.Path(args.out).resolve()
    summary = asyncio.run(
        capture(args.url, out, args.dismiss if args.dismiss else DEFAULT_DISMISS, args.width, args.height)
    )
    print(json.dumps(summary, indent=1))
    return 0 if summary.get("ok") else 1


if __name__ == "__main__":
    sys.exit(main())
