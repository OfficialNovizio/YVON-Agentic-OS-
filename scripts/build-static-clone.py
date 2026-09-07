#!/usr/bin/env python3
# build-static-clone.py — offline static clone from a capture-reference.py
# capture directory (2026-09-06).
#
# INPUT  <capture>/reference.html + asset-manifest.json + inventory.json
# OUTPUT <out>/index.html (+ assets/ copied lean from the capture dir)
#        --standalone also writes <out>/index-standalone.html: every asset
#        inlined as a data: URI — one file, opens from anywhere (no assets/
#        sibling needed), for sandboxed viewers / sharing.
#
# WHAT IT DOES (generic, no site-specific logic):
#   · drop <script>, <iframe>, <noscript> and the consent-SDK subtree —
#     the page keeps its full hydrated DOM, inline <style> blocks (the real
#     CSS, keyframes, @font-face) and content
#   · rewrite every src/poster/href/srcset and CSS url() reference to the
#     local harvested asset; unresolved refs are blanked (data:,) so the
#     page never touches the network
#   · <link> handling: only asset-role rels (stylesheet/icon/manifest/
#     preload/...) are localized; page-role links (rel=alternate, canonical,
#     ...) are dropped — they are documents, not assets (harvesting them
#     pulls the site's locale homepages as 0.5MB "assets")
#   · assets/ is copied LEAN: only files the built DOM actually references
#   · append a small behavior shim: wheel / touch / arrow-key navigation for
#     full-viewport slide decks (swiper-style translate + pagination sync)
#     and a play() nudge for the hero video
#
# PIPELINE NOTE: the exact clone is the design/preview phase artifact. The
# pipeline's asset-swap gate still applies before any real delivery
# (reference media -> venture-owned assets).
#
# Usage:
#   python scripts/build-static-clone.py --capture <dir> --out <dir> [--standalone]
#
# Owner: mia/dev · reference-capture for Akamai-class sites, 2026-09-06

import argparse
import base64
import json
import mimetypes
import pathlib
import re
import shutil
import sys
import urllib.parse

from bs4 import BeautifulSoup

DROP_TAGS = ("script", "iframe", "noscript")
# onetrust = consent SDK leftovers; chakra-portal = the React portal layer
# (modals/toasts — interactive chrome whose visibility is JS-controlled, not
# page content; a modal captured mid-close would otherwise blanket the page)
DROP_SELECTORS = ("#onetrust-consent-sdk", "#onetrust-banner-sdk", ".chakra-portal")

# <link> rels that point at downloadable ASSETS. Anything else (alternate,
# canonical, author, ...) is a page URL — dropped, never localized.
ASSET_LINK_RELS = (
    "stylesheet", "icon", "apple-touch-icon", "manifest",
    "preload", "prefetch", "dns-prefetch",
)

ASSET_REF_RE = re.compile(r"assets/[A-Za-z0-9._-]+")

SWIPER_SHIM = """<script>
/* static-clone behavior shim: full-viewport slide navigation (swiper-style)
   + hero video autoplay nudge. Clone-local; replaces the site's own bundles. */
(() => {
  const wrapper =
    document.querySelector('.swiper-vertical .swiper-wrapper, .swiper-container-vertical .swiper-wrapper') ||
    document.querySelector('.swiper-wrapper');
  const slides = wrapper ? [...wrapper.querySelectorAll(':scope > .swiper-slide')] : [];
  const deck = wrapper ? wrapper.closest('.swiper-vertical, .swiper-container-vertical, [class*="swiper"]') : null;
  const bullets = deck ? [...deck.querySelectorAll('.swiper-pagination-bullet')] : [];
  // swiper-creative/3d bakes per-slide transforms (and opacity) into inline
  // styles at capture time — they freeze the slides into their captured
  // positions. Clear them so the deck is a plain vertical stack the shim
  // can translate as a whole.
  slides.forEach((s) => {
    s.style.transform = '';
    s.style.opacity = '';
    s.classList.remove('swiper-slide-visible', 'swiper-slide-fully-visible');
  });
  if (wrapper && slides.length > 1) {
    let i = 0, lock = false;
    // Swiper computes slide height from the viewport at runtime; the capture
    // froze those px (e.g. 866 @ 1440x900). Refit to the live viewport on
    // load + resize so the deck fills the screen at any size.
    const fit = () => {
      if (!deck) return;
      const top = deck.getBoundingClientRect().top; // page scroll is locked
      const h = Math.max(320, window.innerHeight - Math.max(0, top));
      slides.forEach((s) => (s.style.height = h + 'px'));
      wrapper.style.transition = 'none';
      wrapper.style.transform = `translate3d(0, ${-slides[i].offsetTop}px, 0)`;
    };
    slides.forEach((s) => (s.style.height = ''));
    fit();
    addEventListener('resize', fit);
    const set = (n) => {
      i = Math.max(0, Math.min(slides.length - 1, n));
      // translate to the slide's real offset — slide heights are not 100vh
      // (header/banner subtract) and change as images load
      const y = slides[i].offsetTop;
      wrapper.style.transition = 'transform .85s cubic-bezier(.4,0,.2,1)';
      wrapper.style.transform = `translate3d(0, ${-y}px, 0)`;
      slides.forEach((s, k) => s.classList.toggle('swiper-slide-active', k === i));
      bullets.forEach((b, k) => b.classList.toggle('swiper-pagination-bullet-active', k === i));
    };
    addEventListener('wheel', (e) => {
      if (lock || Math.abs(e.deltaY) < 8) return;
      lock = true; set(i + (e.deltaY > 0 ? 1 : -1));
      setTimeout(() => (lock = false), 950);
    }, { passive: true });
    let ty = null;
    addEventListener('touchstart', (e) => (ty = e.touches[0].clientY), { passive: true });
    addEventListener('touchend', (e) => {
      if (ty === null) return;
      const dy = ty - e.changedTouches[0].clientY;
      if (Math.abs(dy) > 40) set(i + (dy > 0 ? 1 : -1));
      ty = null;
    }, { passive: true });
    addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown') set(i + 1);
      if (e.key === 'ArrowUp' || e.key === 'PageUp') set(i - 1);
    });
    if (!getComputedStyle(document.documentElement).overflow.includes('hidden'))
      document.documentElement.style.overflow = 'hidden';
  }
  // everything is local — lazy loading only fights transform-based decks
  document.querySelectorAll('img[loading="lazy"]').forEach((im) => (im.loading = 'eager'));
  document.querySelectorAll('video').forEach((v) => {
    v.muted = true;
    v.play().catch(() => {});
  });
})();
</script>"""


def _localize(value: str, manifest: dict[str, str], base_url: str, resolve: bool = True) -> str | None:
    """Map a URL-ish attribute value to its local harvested path (or None)."""
    url = value.strip()
    if not url:
        return None
    if resolve and not url.startswith(("http://", "https://", "data:", "#")):
        url = urllib.parse.urljoin(base_url, url)
    return manifest.get(url)


class Inliner:
    """Maps local asset paths to data: URIs (standalone mode). Caches per file."""

    def __init__(self, root: pathlib.Path):
        self.root = root
        self.cache: dict[str, str] = {}
        self.missing = 0

    def uri(self, ref: str) -> str:
        if ref in self.cache:
            return self.cache[ref]
        path = self.root / ref
        if not path.exists():
            self.missing += 1
            return ref  # leave as-is rather than emit a dead data: URI
        mime = mimetypes.guess_type(path.name)[0] or "application/octet-stream"
        b64 = base64.b64encode(path.read_bytes()).decode("ascii")
        self.cache[ref] = f"data:{mime};base64,{b64}"
        return self.cache[ref]


def _make_resolver(manifest: dict[str, str], base_url: str, final) :
    """raw value -> final string. Unresolved refs become data:, (or stay data:
    URIs); resolved ones pass through `final` (identity, or data-URI inline)."""
    def res(raw: str) -> str:
        local = _localize(raw, manifest, base_url)
        if local is None:
            return raw if raw.startswith("data:") else "data:,"
        return final(local)
    return res


def _rewrite_srcset(value: str, res) -> str | None:
    parts = []
    # candidates separate on comma+whitespace — bare commas occur INSIDE urls
    # (cloudinary transforms like f_auto,q_auto) and must not split
    for cand in re.split(r",\s+", value):
        bits = cand.strip().split()
        if bits:
            parts.append(" ".join([res(bits[0])] + bits[1:]))
    return ", ".join(parts) or None


def _rewrite_css_urls(css: str, res) -> str:
    def repl(m: re.Match) -> str:
        quote, raw = m.group(1), m.group(2)
        if raw.startswith("data:"):
            return m.group(0)
        return f"url({quote}{res(raw)}{quote})"

    return re.sub(r"url\(\s*(['\"]?)([^'\")]+)\1\s*\)", repl, css)


def _transform(soup: BeautifulSoup, res, manifest: dict[str, str], base_url: str, final) -> None:
    """Rewrite every remote reference in-place to its local form."""
    for tag in soup.find_all(DROP_TAGS):
        tag.decompose()
    for sel in DROP_SELECTORS:
        for node in soup.select(sel):
            node.decompose()

    # link tags: asset-role rels get localized/kept; page-role links
    # (rel=alternate/canonical/...) and unharvested asset links are dropped —
    # the page must never touch the network or reference a harvested document
    for link in soup.find_all("link"):
        href = link.get("href", "")
        rels = [str(r).lower() for r in (link.get("rel") or [])]
        local = _localize(href, manifest, base_url)
        if local and (not rels or any(r in ASSET_LINK_RELS for r in rels)):
            link["href"] = final(local)
        else:
            link.decompose()

    for attr in ("src", "poster"):
        for el in soup.find_all(attrs={attr: True}):
            local = _localize(el[attr], manifest, base_url)
            if local:
                el[attr] = final(local)
            else:
                del el[attr]

    for el in soup.find_all(attrs={"srcset": True}):
        rewritten = _rewrite_srcset(el["srcset"], res)
        if rewritten:
            el["srcset"] = rewritten
        else:
            del el["srcset"]

    for style in soup.find_all("style"):
        if style.string:
            style.string.replace_with(_rewrite_css_urls(style.string, res))

    for el in soup.find_all(attrs={"style": True}):
        el["style"] = _rewrite_css_urls(el["style"], res)


def build(capture: pathlib.Path, out: pathlib.Path, standalone: bool = False) -> dict:
    html = (capture / "reference.html").read_text(encoding="utf-8")
    manifest: dict[str, str] = json.loads((capture / "asset-manifest.json").read_text(encoding="utf-8"))
    inventory = json.loads((capture / "inventory.json").read_text(encoding="utf-8"))
    base_url = inventory["url"]

    out.mkdir(parents=True, exist_ok=True)

    # plain clone (identity resolve) — its DOM defines the lean asset set
    identity = lambda ref: ref  # noqa: E731
    soup = BeautifulSoup(html, "html.parser")
    _transform(soup, _make_resolver(manifest, base_url, identity), manifest, base_url, identity)
    if soup.body:
        soup.body.append(BeautifulSoup(SWIPER_SHIM, "html.parser"))
    plain_html = str(soup)
    (out / "index.html").write_text(plain_html, encoding="utf-8")

    # lean assets/: only what the built DOM actually references
    used_refs = sorted(set(ASSET_REF_RE.findall(plain_html)))
    copied = 0
    assets_out = out / "assets"
    if (capture / "assets").is_dir():
        if assets_out.exists():
            shutil.rmtree(assets_out)
        assets_out.mkdir()
        for ref in used_refs:
            src = capture / ref
            if src.exists():
                shutil.copy2(src, out / ref)
                copied += 1

    result = {
        "ok": True,
        "index": str(out / "index.html"),
        "manifestEntries": len(manifest),
        "assetsReferenced": len(used_refs),
        "assetsCopied": copied,
        "htmlKb": len(plain_html) // 1024,
    }

    if standalone:
        inliner = Inliner(out)
        soup2 = BeautifulSoup(html, "html.parser")
        _transform(soup2, _make_resolver(manifest, base_url, inliner.uri), manifest, base_url, inliner.uri)
        if soup2.body:
            soup2.body.append(BeautifulSoup(SWIPER_SHIM, "html.parser"))
        single = str(soup2)
        (out / "index-standalone.html").write_text(single, encoding="utf-8")
        result["standaloneKb"] = len(single) // 1024
        result["standaloneInlined"] = len(inliner.cache)
        result["standaloneMissing"] = inliner.missing

    return result


def main() -> int:
    ap = argparse.ArgumentParser(description="Build an offline static clone from a capture directory")
    ap.add_argument("--capture", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--standalone", action="store_true", help="also emit a single-file index-standalone.html (all assets inlined)")
    args = ap.parse_args()
    result = build(pathlib.Path(args.capture).resolve(), pathlib.Path(args.out).resolve(), args.standalone)
    print(json.dumps(result, indent=1))
    return 0 if result.get("ok") else 1


if __name__ == "__main__":
    sys.exit(main())
