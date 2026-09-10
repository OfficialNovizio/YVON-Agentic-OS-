import json
from playwright.sync_api import sync_playwright

with sync_playwright() as pw:
    b = pw.chromium.launch(headless=True)
    pg = b.new_page(viewport={"width": 1440, "height": 900})
    pg.goto("http://novizio.preview.yvon.in/novizio", wait_until="networkidle", timeout=60000)
    pg.wait_for_timeout(800)
    axe = open("dashboard/node_modules/axe-core/axe.min.js", encoding="utf-8").read()
    pg.evaluate(axe)
    out = pg.evaluate("""async () => {
      const r = await window.axe.run(document, { resultTypes: ['violations'] });
      const detail = r.violations.map(v => ({
        id: v.id, impact: v.impact,
        nodes: v.nodes.slice(0,10).map(n => {
          const el = n.element || {};
          return { tag: el.tagName, cls: (el.className||'').toString().slice(0,50),
                   txt: ((el.textContent)||'').toString().trim().slice(0,30),
                   html: (el.outerHTML||'').toString().slice(0,120) };
        })
      }));
      // font truth
      const geistLoaded = document.fonts.check('1rem Geist');
      const interLoaded = document.fonts.check('1rem Inter');
      const heroEl = document.querySelector('.hero') || document.querySelector('#top');
      const heroBg = heroEl ? getComputedStyle(heroEl).backgroundColor : null;
      const bodySample = document.querySelector('p');
      return { detail, geistLoaded, interLoaded,
               fonts: Array.from(document.fonts).map(f => f.family).filter((v,i,a) => a.indexOf(v)===i).slice(0,12),
               heroBg, bodySampleFont: bodySample ? getComputedStyle(bodySample).fontFamily.slice(0,60) : null,
               bodySampleSize: bodySample ? getComputedStyle(bodySample).fontSize : null };
    }""")
    print(json.dumps(out, indent=1))
    b.close()
