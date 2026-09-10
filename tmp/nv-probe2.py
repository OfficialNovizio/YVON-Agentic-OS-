import json
from playwright.sync_api import sync_playwright
with sync_playwright() as pw:
    b = pw.chromium.launch(headless=True)
    pg = b.new_page(viewport={"width": 1440, "height": 900})
    errs = []
    pg.on("console", lambda m: errs.append(m.text[:120]) if m.type == "error" else None)
    pg.goto("http://novizio.preview.yvon.in/novizio", wait_until="networkidle", timeout=60000)
    pg.wait_for_timeout(2500)
    out = pg.evaluate("""() => {
      const txt = document.body.innerText;
      const has = p => txt.toLowerCase().includes(p.toLowerCase());
      return {
        title: document.title,
        h1: Array.from(document.querySelectorAll('h1,h2')).slice(0,8).map(h => h.textContent.trim().slice(0,60)),
        probes: Object.fromEntries(['Securing the skies','One platform, many missions','Wildfire Cascade','Border Storm','Critical Infrastructure','Scroll To Explore','Request Access','Ready to talk to us','USAvionix Inc','Autonomy in real operations','Power Restored'].map(p => [p, has(p)])),
        imgs: Array.from(document.querySelectorAll('img')).map(i => ({src: (i.currentSrc||i.src).split('/').pop().slice(0,40), w: i.naturalWidth})).slice(0,10),
        canvas: document.querySelectorAll('canvas').length,
        novizioLeft: (txt.match(/novizio/gi) || []).length,
        overflow: {sw: document.documentElement.scrollWidth, iw: innerWidth}
      };
    }""")
    pg.screenshot(path="tmp/nv-clone-desktop.png", full_page=True)
    pg.set_viewport_size({"width": 390, "height": 844})
    pg.wait_for_timeout(800)
    out["ov390"] = pg.evaluate("() => ({sw: document.documentElement.scrollWidth, iw: innerWidth})")
    out["console_errors"] = errs[:6]
    print(json.dumps(out, indent=1))
    b.close()
