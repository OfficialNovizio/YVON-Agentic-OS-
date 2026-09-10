"""Quinn real-browser gate — TS-001 Novizio (usavionix clone) preview.

Checks the 8 acceptance criteria against http://novizio.preview.yvon.in/
with the measured usavionix tokens (Geist, #000 base, pill 9999px,
h0 5rem desktop / 2.6875rem mobile).
"""
import json
import re
import sys

from playwright.sync_api import sync_playwright

BASE = "http://novizio.preview.yvon.in/"
OUT = {}

def js_num(page, sel, prop):
    return page.evaluate(
        "([sel, prop]) => { const el = document.querySelector(sel); if (!el) return null;"
        " return getComputedStyle(el)[prop]; }",
        [sel, prop],
    )

with sync_playwright() as pw:
    b = pw.chromium.launch(headless=True)

    # ---------- desktop 1440 ----------
    pg = b.new_page(viewport={"width": 1440, "height": 900})
    errors = []
    pg.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
    pg.on("pageerror", lambda e: errors.append(str(e)))
    r = pg.goto(BASE, wait_until="networkidle", timeout=60000)
    OUT["root_status"] = r.status
    OUT["landed_url"] = pg.url
    pg.wait_for_timeout(1500)

    OUT["title"] = pg.title()
    # headings + sections
    OUT["h1"] = pg.evaluate("() => Array.from(document.querySelectorAll('h1,h2')).slice(0,10).map(h => h.textContent.trim().slice(0,80))")
    OUT["sections"] = pg.evaluate(
        "() => Array.from(document.querySelectorAll('main section, main > div > section, body section')).slice(0,12)"
        ".map(s => ({id: s.id || null, cls: (s.className||'').toString().slice(0,60), h: s.querySelector('h1,h2,h3')?.textContent?.trim()?.slice(0,60) || null}))"
    )
    # measured tokens
    OUT["body_font"] = js_num(pg, "body", "fontFamily")
    OUT["body_bg"] = js_num(pg, "body", "backgroundColor")
    OUT["h1_font"] = js_num(pg, "h1", "fontFamily")
    OUT["h1_size"] = js_num(pg, "h1", "fontSize")
    OUT["h1_weight"] = js_num(pg, "h1", "fontWeight")
    OUT["h1_color"] = js_num(pg, "h1", "color")
    OUT["pill_radius"] = pg.evaluate(
        "() => { const els = Array.from(document.querySelectorAll('a,button'));"
        " const pills = els.filter(e => { const r = getComputedStyle(e).borderRadius; return parseFloat(r) >= 90; });"
        " return { count: pills.length, sample: pills.slice(0,3).map(e => e.textContent.trim().slice(0,30)) }; }"
    )
    OUT["accent_scan"] = pg.evaluate(
        "() => { const bad = new Set(); document.querySelectorAll('body *').forEach(e => {"
        " const c = getComputedStyle(e).color; const m = c.match(/rgba?\\((\\d+), (\\d+), (\\d+)/);"
        " if (m) { const [r,g,bl] = [+m[1],+m[2],+m[3]]; const mx = Math.max(r,g,bl), mn = Math.min(r,g,bl);"
        " if (mx - mn > 60 && !(mx > 200 && mn < 80)) bad.add(c); } }); return Array.from(bad).slice(0,8); }"
    )
    # reference-site leakage
    OUT["usavionix_leak"] = pg.evaluate(
        "() => (document.body.innerText.toLowerCase().includes('usavionix') || !!document.body.innerHTML.toLowerCase().includes('usavionix'))"
    )
    # motion probes
    OUT["anim_names"] = pg.evaluate(
        "() => { const names = new Set(); document.querySelectorAll('body *').forEach(e => {"
        " const a = getComputedStyle(e).animationName; if (a && a !== 'none') names.add(a + ':' + getComputedStyle(e).animationDuration); });"
        " return Array.from(names).slice(0, 10); }"
    )
    # scroll to bottom for reveals
    pg.evaluate("() => window.scrollTo(0, document.body.scrollHeight)")
    pg.wait_for_timeout(1200)
    OUT["overflow_1440"] = pg.evaluate("() => ({sw: document.documentElement.scrollWidth, iw: window.innerWidth})")
    pg.screenshot(path="tmp/nv-desktop.png", full_page=True)

    # ---------- boundary widths ----------
    for w in (1280, 768, 600, 480, 390):
        pg.set_viewport_size({"width": w, "height": 900})
        pg.wait_for_timeout(600)
        ov = pg.evaluate("() => ({sw: document.documentElement.scrollWidth, iw: window.innerWidth})")
        h1 = js_num(pg, "h1", "fontSize")
        OUT[f"ov_{w}"] = {**ov, "h1": h1, "ok": ov["sw"] <= ov["iw"]}

    pg.close()

    # ---------- mobile 390 fresh ----------
    pm = b.new_page(viewport={"width": 390, "height": 844}, reduced_motion="no-preference")
    pm.goto(BASE, wait_until="networkidle", timeout=60000)
    pm.wait_for_timeout(1200)
    pm.screenshot(path="tmp/nv-mobile.png", full_page=True)
    pm.close()

    # ---------- reduced motion ----------
    pr = b.new_page(viewport={"width": 390, "height": 844}, reduced_motion="reduce")
    pr.goto(BASE, wait_until="networkidle", timeout=60000)
    pr.wait_for_timeout(800)
    OUT["reduced_anim"] = pr.evaluate(
        "() => { const durs = new Set(); document.querySelectorAll('body *').forEach(e => {"
        " const a = getComputedStyle(e).animationName; if (a && a !== 'none') durs.add(getComputedStyle(e).animationDuration); });"
        " const arr = Array.from(durs); return { durations: arr.slice(0,5), allClamped: arr.every(d => parseFloat(d) < 0.01) }; }"
    )
    pr.evaluate("() => window.scrollTo(0, document.body.scrollHeight/2)")
    pr.wait_for_timeout(500)
    OUT["reduced_visible"] = pr.evaluate(
        "() => { const el = document.querySelector('h1'); if (!el) return false;"
        " const s = getComputedStyle(el); return s.visibility !== 'hidden' && parseFloat(s.opacity) > 0.5; }"
    )
    pr.close()

    # ---------- axe-core a11y ----------
    pa = b.new_page(viewport={"width": 1440, "height": 900})
    pa.goto(BASE, wait_until="networkidle", timeout=60000)
    pa.wait_for_timeout(1000)
    axe_src = open("dashboard/node_modules/axe-core/axe.min.js", encoding="utf-8").read()
    pa.evaluate(axe_src)
    OUT["axe"] = pa.evaluate(
        "async () => { const r = await window.axe.run(document, { resultTypes: ['violations'] });"
        " return { violations: r.violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.length })),"
        " passes: r.passes.length }; }"
    )
    pa.close()
    b.close()

OUT["console_errors"] = errors[:10]
print(json.dumps(OUT, indent=1))
