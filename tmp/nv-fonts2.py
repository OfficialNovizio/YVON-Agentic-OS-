import json
from playwright.sync_api import sync_playwright
with sync_playwright() as pw:
    b = pw.chromium.launch(headless=True)
    pg = b.new_page(viewport={"width": 1440, "height": 900})
    pg.goto("http://novizio.preview.yvon.in/novizio", wait_until="networkidle", timeout=60000)
    pg.wait_for_timeout(600)
    out = pg.evaluate("""() => {
      const pick = sel => { const el = document.querySelector(sel); if (!el) return null;
        const s = getComputedStyle(el); return { font: s.fontFamily.slice(0,50), size: s.fontSize, w: s.fontWeight, color: s.color }; };
      const bgs = Array.from(document.querySelectorAll('section, footer, header')).map(s => ({
        cls: (s.className||'').toString().slice(0,40), bg: getComputedStyle(s).backgroundColor }));
      const paras = Array.from(document.querySelectorAll('.text-section p, section p')).slice(0,3).map(p => {
        const s = getComputedStyle(p); return { font: s.fontFamily.slice(0,50), size: s.fontSize, color: s.color }; });
      // axe button-name nodes: find focusable/icon-only buttons manually
      const noName = Array.from(document.querySelectorAll('button')).filter(b2 => {
        const s = getComputedStyle(b2);
        const named = (b2.getAttribute('aria-label') || b2.getAttribute('aria-labelledby') || b2.textContent.trim() ||
                       (b2.querySelector('img[alt]') && b2.querySelector('img[alt]').alt));
        return !named;
      }).map(b2 => ({ html: b2.outerHTML.slice(0,110), cls: (b2.className||'').toString().slice(0,50) }));
      const inputs = Array.from(document.querySelectorAll('input,textarea,select')).map(i => ({
        tag: i.tagName, type: i.type, id: i.id, ariaLabel: i.getAttribute('aria-label'),
        labeled: !!(i.labels && i.labels.length) }));
      const linksNoName = Array.from(document.querySelectorAll('a')).filter(a => {
        return !(a.textContent.trim() || a.getAttribute('aria-label') || a.getAttribute('aria-labelledby') ||
                 (a.querySelector('img[alt]') && a.querySelector('img[alt]').alt));
      }).map(a => ({ href: a.getAttribute('href'), html: a.outerHTML.slice(0,110) }));
      const nested = Array.from(document.querySelectorAll('a button, button a, a input, button button')).map(x => x.outerHTML.slice(0,100));
      const hasMain = !!document.querySelector('main, [role=main]');
      return { h2: pick('.text-section h2'), p: paras, bgs, noName, inputs, linksNoName, nested, hasMain,
               bodyTag: pick('body') };
    }""")
    print(json.dumps(out, indent=1))
    b.close()
