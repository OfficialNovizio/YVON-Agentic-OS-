---
version: alpha
name: "Detroit-Paris-design-analysis"
description: "Design-system analysis of https://www.detroit.paris/ produced by the YVON reference-build pipeline. Design-system values measured from the YVON capture relay's artifacts (hydrated DOM + stylesheets) on 2026-09-08T06:29:05.973Z. Every value traces to a captured source; unmeasurable areas are declared in Known Gaps."

colors:
  black: "#000000"
  white: "#ffffff"
  primary: "#ff4c24"
  neutral-300: "#e3e1de"
  grey: "#0b0b0b1a"
  grey-bold: "#0009"
  dot-ink: "#0B0B0B"
  rule-grey: "#e2e2e2"
  lightbox-veil: "#fffffffa"

typography:
  body:
    fontFamily: "Barlow"
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0
  display:
    fontFamily: "Mangogrotesque"
    fontSize: 14.375rem
    fontWeight: 700
    lineHeight: 0.8
    letterSpacing: 0
  h1:
    fontFamily: "Mangogrotesque"
    fontSize: 6.75rem
    fontWeight: 700
    lineHeight: 0.85
    letterSpacing: 0
  h2:
    fontFamily: "Mangogrotesque"
    fontSize: 4.5rem
    fontWeight: 700
    lineHeight: 1
    letterSpacing: 0
  h3:
    fontFamily: "Mangogrotesque"
    fontSize: 3rem
    fontWeight: 500
    lineHeight: 0.85
    letterSpacing: 0
  h4:
    fontFamily: "Mangogrotesque"
    fontSize: 2.5rem
    fontWeight: 700
    lineHeight: 0.85
    letterSpacing: 0
  hero-home:
    fontFamily: "Mangogrotesque"
    fontSize: 2rem
    fontWeight: 700
    lineHeight: 0.85
    letterSpacing: 0
  h5:
    fontFamily: "Barlow"
    fontSize: 1.25em
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: 0
  label:
    fontSize: 0.75rem
    fontWeight: 400
    lineHeight: 1
    letterSpacing: 0
  blockquote:
    fontFamily: "Barlow"
    fontSize: 18px
    fontWeight: 400
    lineHeight: 22px
    letterSpacing: 0

rounded:
  dot: 50%
  card: .2rem

components:
  nav-link-dot:
    backgroundColor: "{colors.white}"
    rounded: "{rounded.dot}"
  livre-blanc-card:
    backgroundColor: "{colors.white}"
    rounded: "{rounded.card}"
  transition-curtain:
    backgroundColor: "{colors.black}"
  display-word:
    typography: "{typography.display}"
  hero-home-h1:
    typography: "{typography.hero-home}"
  gallery-caption-tag:
    typography: "{typography.label}"
---

## Overview
Detroit-Paris (https://www.detroit.paris/) — reference analysis for a YVON reference-build targeting the "novizio" venture. Probe taxonomy: **static-editorial**.

**Key Characteristics:**
- Fixed blend-mode top nav — measured: header.nav-boiler{position:fixed
- Nav link rows with dot bullets — measured: div.nav-r > logo-nav (3.125rem SVG) + repeated div.link-w > div.dot-link{10px circle
- Full-screen overlay menu (mobile/tablet) — measured: div.menu_w{background:var(--white)
- Full-viewport fixed hero stage — measured: div.mw.home{height:100vh
- Editorial hero h1 with services sub-line — measured: <h1 data-delay='0.3' op class='h1-home'>Detroit - AI Production House in Paris, Crafting Culture for Luxury Brands.<br><sub>PRINT & FILM. AI. 3D. CGI.</sub></h1
- Giant display words with per-character reveal — measured: div.fat[lt] aria-label='CRAFTING' and 'CULTURE' — 14.375rem/700/0.8 Mango Grotesque, split into .char-parent/.char-child pairs each with GSAP inline transform t
- Horizontal depth-carousel talent/project gallery — measured: section[data-horizontal-scroll].s.center > .c.home > .artist_list_w w-dyn-list (15 artist_item, each data-video-src, transform-origin:bottom left) + .project_li
- Image+video stacked media cards with hover playback — measured: a.media-link{absolute
- Only 2 @keyframes in the whole capture, both spinners: spin (lightbox) and swiper-preloader-spin — consumed at .8s/1s linear infinite. All other motion is JS-dr
- Signature ease-out cubic-bezier(.33,1,.68,1) used for nearly everything: image hover scale(1.03) .6s
- Overshoot spring cubic-bezier(0.34,1.56,0.64,1) on nav dot-link hover: opacity 0->1 and scale 0.8->1 over 0.6s (alternate rule: 0.3s ease scale(0)->scale(1))

## Colors

### Brand & Accent
- **black** (`#000000`): declared as --black: black; page canvas background AND body text (body{background-color:var(--black);color:var(--black)}); also .s.sticky-2 background, .transition-overlay curtain, .dot-link.black
  - Source: page.css :root + body rule (Webflow page stylesheet, HTTP 200)
- **primary** (`#ff4c24`): declared brand accent --color-primary in :root; NO consuming rule found in any fetched CSS or inline HTML (declared-but-unused in static capture — likely consumed by JS-generated styles)
  - Source: page.css :root + body rule (Webflow page stylesheet, HTTP 200) — {--color-primary:#ff4c24}

### Surface & Background
- **white** (`#ffffff`): declared as --white; default section background (.s{background-color:var(--white)}), nav text (.nav-c), .loader background, .dot-link background, ::selection text color; nav readability comes from the nav header mix-blend-mode:difference
  - Source: page.css :root + body rule (Webflow page stylesheet, HTTP 200); inline3.css ::selection
- **neutral-300** (`#e3e1de`): declared --color-neutral-300 (warm greige/off-white token); no consuming rule found in fetched CSS
  - Source: page.css :root + body rule (Webflow page stylesheet, HTTP 200) — {--color-neutral-300:#e3e1de}
- **lightbox-veil** (`#fffffffa`): near-opaque white backdrop of the full-screen artist lightbox (.lightbox-artist)
  - Source: reference.html hydrated DOM (HTTP 200, 118159 B) inline style block #2 .lightbox-artist

### Text & Rules
- **grey** (`#0b0b0b1a`): declared --grey; used as the 1px border of the floating .livre-blanc card
  - Source: page.css :root + body rule (Webflow page stylesheet, HTTP 200) + .livre-blanc rule
- **grey-bold** (`#0009`): --grey-bold declared in :root (no consumer found); #0006 measured as .livre-blanc:hover border-color and lightbox spinner ring color
  - Source: page.css :root + body rule (Webflow page stylesheet, HTTP 200); Webflow shared stylesheet (HTTP 200, 30033 B, CDN original) .w-lightbox-spinner
- **dot-ink** (`#0B0B0B`): fill of the 8x8 SVG dot bullets inside every .tag-home-wrap gallery caption
  - Source: reference.html hydrated DOM (HTTP 200, 118159 B) inline SVG <circle cx=4 cy=4 r=4 fill=#0B0B0B>
- **rule-grey** (`#e2e2e2`): blockquote left border (border-left:5px solid #e2e2e2)
  - Source: Webflow page stylesheet (HTTP 200, 19032 B, CDN original) blockquote rule

### Other measured values
- **3898ec-etc** (`#3898ec (etc.)`): Webflow framework defaults (default button blue #3898ec, swiper #007aff, form error red #ffdede, #999, #ddd, #222) present in the shared stylesheet; no brand usage found in this page markup
  - Source: Webflow shared stylesheet (HTTP 200, 30033 B, CDN original) framework rules

## Typography

### Font Family
- Two-font system: Barlow (Google Fonts, weights 300/400/500/600/700, loaded via <link> + WebFont.load config) for body/UI; Mango Grotesque for display, loaded as @font-face weight 700 woff2 (MangoGrotesque-Bold.woff2, font-display:swap) with fallback stack 'Mangogrotesque,Arial,sans-serif'
  - Source: reference.html hydrated DOM (HTTP 200, 118159 B) <link>+WebFont.load; Webflow shared stylesheet (HTTP 200, 30033 B, CDN original) @font-face

### Hierarchy
| Role | Family | Size | Weight | Line height | Tracking |
|---|---|---:|---:|---:|---:|
| `body` | Barlow | 1rem | 400 | 1.5 | 0 |
| `display` | Mangogrotesque | 14.375rem | 700 | 0.8 | 0 |
| `h1` | Mangogrotesque | 6.75rem | 700 | 0.85 | 0 |
| `h2` | Mangogrotesque | 4.5rem | 700 | 1 | 0 |
| `h3` | Mangogrotesque | 3rem | 500 | 0.85 | 0 |
| `h4` | Mangogrotesque | 2.5rem | 700 | 0.85 | 0 |
| `hero-home` | Mangogrotesque | 2rem | 700 | 0.85 | 0 |
| `h5` | Barlow | 1.25em | 500 | 1.2 | 0 |
| `label` | — | 0.75rem | 400 | 1 | 0 |
| `blockquote` | Barlow | 18px | 400 | 22px | 0 |

### Principles (measured)
- Body: Barlow 1rem/400/1.5, color inherits black
  - Source: Webflow page stylesheet (HTTP 200, 19032 B, CDN original) body rule
- ALL headings uppercase, tight line-heights: h1 6.75rem/700/0.85; h2 4.5rem/700/1; h3 3rem/500/0.85; h4 2.5rem/700/0.85 — all Mangogrotesque,Arial,sans-serif
  - Source: Webflow page stylesheet (HTTP 200, 19032 B, CDN original) h1-h4 rules
- Homepage hero h1 overrides to .h1-home{max-width:22rem; 2rem/700/0.85; left} with a <sub> services line 'PRINT & FILM. AI. 3D. CGI.' styled by Webflow default sub{font-size:75%; bottom:-.25em}
  - Source: Webflow page stylesheet (HTTP 200, 19032 B, CDN original) .h1-home; reference.html hydrated DOM (HTTP 200, 118159 B) <h1 data-delay=0.3 op class=h1-home>; Webflow shared stylesheet (HTTP 200, 30033 B, CDN original) sub,sup
- Display/wordmark .fat: Mangogrotesque 14.375rem/700/0.8 uppercase (site's largest type — hero words 'CRAFTING'/'CULTURE'); variants .fat.center.small/.team 9.375rem, tablet 7.75rem, mobile 6rem-6.875rem, .fat.vw 20vw
  - Source: Webflow page stylesheet (HTTP 200, 19032 B, CDN original) .fat rules + media queries (991/767/479px); reference.html hydrated DOM (HTTP 200, 118159 B) aria-labels
- Fluid root: html{font-size:calc(0rem + 1vw)} — every rem scales with viewport; capped 17.5px for viewports >=1750px; fixed 1rem below 992px. The 14.375rem .fat is ~14.375vw on desktop
  - Source: reference.html hydrated DOM (HTTP 200, 118159 B) inline style block #3
- Label system .l: uppercase, 0.75rem, line-height 1 (nav links, tags); .l.landing 1rem underlined; .menu-link 0.75rem/0.85 expanding to 15vw on tablet, 4.5rem on mobile in the overlay menu
  - Source: Webflow page stylesheet (HTTP 200, 19032 B, CDN original) .l/.menu-link + media queries
- Paragraphs 1rem/1.5 (0.875rem mobile); strong 600; h5 1.25em/500/1.2; h6 12px/700/18px display:none; blockquote 18px/22px
  - Source: Webflow page stylesheet (HTTP 200, 19032 B, CDN original) p/strong/h5/h6/blockquote
- Global uppercase text-transform on nav/tags/menu/links (.l, .nav-c, .tag-home-wrap, .link-w, .menu-*); a{color:inherit;text-decoration:none}; ::selection{background-color:var(--black);color:var(--white)}
  - Source: Webflow page stylesheet (HTTP 200, 19032 B, CDN original) a rule; reference.html inline style block #3 (Osmo variables, 2860 B) ::selection
- Optical heading alignment: headings/.fat/blockquote get display:flow-root with ::before/::after margin calc(-0.5lh + 0.46em)/calc(-0.5lh + 0.3em) to trim leading; antialiased font-smoothing forced everywhere
  - Source: reference.html inline style block #3 (Osmo variables, 2860 B)
- Letter-spacing: none declared anywhere in fetched CSS (no letter-spacing rule in page.css, shared.css brand rules, or inline blocks) — tracking is untouched
  - Source: absence check across all fetched stylesheets

## Motion & Interaction

_Measured from the hydrated DOM and stylesheets. Static-probe labels are overridden by observed behavior._
- Only 2 @keyframes in the whole capture, both spinners: spin (lightbox) and swiper-preloader-spin — consumed at .8s/1s linear infinite. All other motion is JS-driven
  - Source: Webflow shared stylesheet (HTTP 200, 30033 B, CDN original); reference.html inline style block #2 (custom motion layer, 22853 B)
- Signature ease-out cubic-bezier(.33,1,.68,1) used for nearly everything: image hover scale(1.03) .6s; caption tag slide-up .4s; artist link entrance translateY(10%)+opacity 1.2s; clip-path polygon reveals .6s; lightbox slide opacity .6s
  - Source: reference.html inline style block #2 (custom motion layer, 22853 B)
- Overshoot spring cubic-bezier(0.34,1.56,0.64,1) on nav dot-link hover: opacity 0->1 and scale 0.8->1 over 0.6s (alternate rule: 0.3s ease scale(0)->scale(1))
  - Source: reference.html inline style block #3 (Osmo variables, 2860 B) .dot-link; reference.html inline style block #2 (custom motion layer, 22853 B) .link-w .dot-link
- Video player UI easing cubic-bezier(.625,.05,0,1) on .bunny-player__interface (all .6s); hover controls .3s ease-in-out translateY(1em); timeline handle .15s; video sources fade in .2s on hover ([data-video-on-hover])
  - Source: reference.html inline style block #2 (custom motion layer, 22853 B) bunny-player + data-video-on-hover rules; data-video-on-hover x17, data-video-src x15
- Lenis smooth scrolling active: html.lenis classes + shipped CSS (html.lenis body{height:auto}, [data-lenis-prevent]{overscroll-behavior:contain}, .lenis-stopped{overflow:clip})
  - Source: reference.html hydrated DOM (HTTP 200, 118159 B) html tag + inline style block #2
- Page transitions via Taxi.js: main[data-taxi], stage div[data-taxi-view], and .transition-overlay{fixed;inset:0;background:#000;opacity:0;z-index:9} as the black wipe curtain
  - Source: reference.html hydrated DOM (HTTP 200, 118159 B) markup; Webflow page stylesheet (HTTP 200, 19032 B, CDN original) .transition-overlay
- Scroll/entrance reveal system: [line],[line-big],[lt],[op],[op-y]{opacity:0} and [separator]{transform:scaleX(0)} hide elements pre-JS; text split into .char-parent/.char-child and .line-parent/.line-child wrappers; captured DOM shows GSAP-style inline transforms (translate(0%,10%) per char, translateY(20px) + opacity/transform .4s) — GSAP itself is NOT loaded in static HTML, its output is baked into the hydrated DOM via main.js
  - Source: reference.html hydrated DOM (HTTP 200, 118159 B) inline style block #1 + hydrated inline styles on .fat and h1
- Timed hero reveal: h1 carries data-delay='0.3' + op attribute with captured inline opacity:1 — the reveal engine sequences per-element delays
  - Source: reference.html hydrated DOM (HTTP 200, 118159 B) <h1 data-delay="0.3" op class="h1-home" style="opacity: 1;">
- Custom depth-carousel (home gallery): section[data-horizontal-scroll] positions .w-dyn-item absolutely bottom-left with will-change:transform,scale,opacity; JS assigns stepped transforms (translateX 0/216/432/648/864/1080px), scale 0.28675->1.4455, z-index 3->14, per-item parallax var --parallax-x stepping -15%->0%; inner media 110% wide with transform:translate(var(--parallax-x)) .6s and hover scale(1.03)
  - Source: reference.html inline style block #2 (custom motion layer, 22853 B) + captured inline styles on 15 artist_item / 17 project_item elements
- Caption tags animate on hover: .tag-home-wrap{translate:0 100%;opacity:0;transition:.4s cubic-bezier(.33,1,.68,1)} -> hover translate:0 0; tags carry JS-set counter-scales (3.49, 1.93, 18.18 x12, 0.625 x14) to stay legible while parents scale
  - Source: reference.html inline style block #2 (custom motion layer, 22853 B) + captured inline scale values
- Mobile fallback (<=767px) disables the JS carousel: [data-horizontal-scroll] .w-dyn-items becomes native overflow-x:scroll flex row (gap .5rem), items position:relative!important, transform/scale/opacity reset via !important
  - Source: reference.html inline style block #2 (custom motion layer, 22853 B) mobile media query
- Misc transitions: .livre-blanc border .7s ease (+ is-hiding fade); Brevo form opacity .3s; lightbox thumbs opacity .2s (inactive .3); slider arrows opacity .3s; menu overlay opacity .4s; loader (white, fixed, SVG logo 5rem) fades out
  - Source: reference.html inline style block #2 (custom motion layer, 22853 B)/reference.html inline style block #3 (Osmo variables, 2860 B) + captured inline styles on .menu_w/.loader
- will-change used deliberately (transform / transform,scale,opacity / opacity,transform) — 0 in the Webflow base, all in the custom block; scrollbars hidden on all platforms
  - Source: reference.html inline style block #2 (custom motion layer, 22853 B)
- Motion libraries in static HTML: hls.js@1.6.11 (32 <video> autoplay muted loop, stacked under images, revealed on hover), jQuery 3.5.1 + webflow.js; NO GSAP/ScrollTrigger/Swiper JS tags (Swiper CSS only) — motion delivered by custom module detroit-talents.netlify.app/main.js
  - Source: reference.html hydrated DOM (HTTP 200, 118159 B) <script> tags; grep counts gsap:0, ScrollTrigger:0, Swiper:0

## Shapes

### Radius Scale

| Token | Value |
|---|---:|
| `dot` | 50% |
| `card` | .2rem |

## Components

### **`fixed-blend-mode-top-nav`**

header.nav-boiler{position:fixed;inset:0 0 auto;width:100vw;min-height:3.5rem;z-index:99;mix-blend-mode:difference;color:#000;pointer-events:none} > nav.nav-c{color:var(--white);text-transform:uppercase;flex;justify-content:space-between;padding:1rem 1.5rem} — difference blending keeps white nav text visible over black page AND light media

### **`nav-link-rows-with-dot-bullets`**

div.nav-r > logo-nav (3.125rem SVG) + repeated div.link-w > div.dot-link{10px circle;background:var(--white);opacity:0;scale(0)} + a.l "talents"/"PROJECTS"; nav-l holds 6vw-gap links services/insights/contact + "menu" toggle

### **`full-screen-overlay-menu-mobile-tablet`**

div.menu_w{background:var(--white);width:100%;height:100svh;fixed;z-index:99;display:none} with .menu-top (logo+close), .menu-mid links 15vw tablet / 4.5rem mobile Mangogrotesque uppercase, .menu-bottom social links; captured inline display:none;opacity:0;transition:opacity .4s

### **`full-viewport-fixed-hero-stage`**

div.mw.home{height:100vh;position:fixed;inset:0} > div.pv.home{width:100%;height:100vh;position:fixed} — the home is a single locked viewport (measured pageHeight 900px) with galleries layered inside, not a scrolling document

### **`editorial-hero-h1-with-services-sub-line`**

<h1 data-delay='0.3' op class='h1-home'>Detroit - AI Production House in Paris, Crafting Culture for Luxury Brands.<br><sub>PRINT & FILM. AI. 3D. CGI.</sub></h1> — 2rem Mangogrotesque uppercase, max-width 22rem

### **`giant-display-words-with-per-character-reveal`**

div.fat[lt] aria-label='CRAFTING' and 'CULTURE' — 14.375rem/700/0.8 Mango Grotesque, split into .char-parent/.char-child pairs each with GSAP inline transform translate(0%,10%)

### **`horizontal-depth-carousel-talent-project-gallery`**

section[data-horizontal-scroll].s.center > .c.home > .artist_list_w w-dyn-list (15 artist_item, each data-video-src, transform-origin:bottom left) + .project_list_w (17 project_item, display:none default); items min-width:30rem min-height:27.5rem, link to /talents/* and /projects/*

### **`image-video-stacked-media-cards-with-hover-playback`**

a.media-link{absolute;inset:0;overflow:hidden;z-index:20} holding <img media-slider-home> + <video playsinline autoplay muted loop> where [data-video-on-hover] video{opacity:0;transition:.2s} -> [data-video-on-hover=active] video{opacity:1}; 32 <video> + 34 <img> total

### **`hover-caption-tags-with-dot-bullets`**

div.tag-home-wrap{absolute;.75rem;uppercase;inline-flex;gap:.5rem} = 10px SVG dot (fill #0B0B0B) + label e.g. 'Dom Perignon Winter'; slides up + fades on item hover, counter-scaled via JS

### **`floating-livre-blanc-report-card-cta`**

a.livre-blanc{fixed;inset:4rem 1.5rem auto auto;max-width:14rem;background:var(--white);border:1px solid var(--grey);border-radius:.2rem;padding:.5rem;flex;gap:.5rem} > img 4rem x 4.5rem cover + strong text + report title + close; hover border #0006, border .7s; links to a carbon-impact report; desktop list + mobile variant

### **`startup-loader`**

div.loader{fixed;inset:0;100vw/100vh;background:var(--white);z-index:999;flex} > .logo-loader{width:5rem} SVG; captured inline opacity:0;display:none after fade-out

### **`page-transition-curtain`**

div.transition-overlay{fixed;inset:0;100vw/100vh;background-color:#000;opacity:0;pointer-events:none;z-index:9} inside main[data-taxi]

### **`lightbox-with-thumbnail-rail-site-wide-pattern`**

.lightbox-artist{fixed;inset:0;background:#fffffffa;z-index:99999} > .lightbox-slides > .lightbox-slide.is-active (opacity .6s) + bottom rail of 3.5rem square thumbs at opacity .3 -> 1 on hover/active, custom thumb cursor

### **`blog-insights-masonry-staggered-grid-css-present-other-pages`**

[data-masonry-list]{--masonry-col:3;--masonry-gap:1rem} (2 cols/.5rem mobile); .blog_list{grid 6 cols} with .blog_item:nth-child(5n+1)/(5n+2){span 3;min-height:54rem} and 5n+3..5n+5{span 2;min-height:43rem}

### **`drag-slider-with-prev-next-insights`**

.slider_list{flex;gap:1rem;height:53rem;will-change:transform} + .slide-prev/.slide-next{opacity .3s} with .inactive{opacity:.3;cursor:not-allowed}

### **`no-pricing-comparison-table-no-tables-no-footer-on-home`**

measured: 0 <table> elements and zero matches for 'pric' in reference.html; no footer markup (0 'footer' occurrences in body) — .s.footer/.footer-grid CSS exist only for other pages; the page is a single locked-viewport editorial hero + carousel

### **`buttons-text-links-not-button-components`**

no .w-button element in page markup; all CTAs are .link-w text+dot bullets, the .livre-blanc card, and .l.landing underlined link; shared.css .w-button{background:#3898ec;border-radius:0;padding:9px 15px} exists unused

### **`site-credit-stack-markers`**

console.log('Dev by Thomas Carré / Design by Jiinto'); main[data-taxi]; scripts jquery-3.5.1, webflow, hls.js@1.6.11, custom module detroit-talents.netlify.app/main.js

## Do's and Don'ts

### Do
- Use the signature ease-out cubic-bezier(.33,1,.68,1) for hover/entrance transitions — measured on image hover scale, caption slide-up, link entrance, and clip-path reveals.
- Keep all display type uppercase with tight line-height (0.8-1.0) and no letter-spacing — measured across .fat, h1-h4, and labels.
- Stack a muted autoplay video under a still image and reveal the video on hover (opacity .2s) — the measured media-card pattern (32 videos / 34 images).
- Use mix-blend-mode:difference on the fixed nav so white text stays legible over both the black canvas and light media — measured.
- Trim display-type leading with display:flow-root + ::before/::after margin calc(-0.5lh + 0.46em) — measured.
- Animate via JS-assigned transforms with will-change (transform/scale/opacity), not CSS keyframes — measured: 2 @keyframes total, both spinners.

### Don't
- Do not build button components for CTAs — the reference uses text+dot links, an underlined label, and a floating card; no .w-button in markup.
- Do not add scroll/entrance animation as CSS @keyframes — the measured system hides pre-JS via attribute selectors ([line],[lt],[op],[op-y],[separator]) and animates with JS inline transforms.
- Do not letter-space headings — zero letter-spacing rules exist in the captured CSS.
- Do not assume a footer or a pricing table — measured absent on the reference home (0 <table>, no footer markup).
- Do not treat the page as a scrolling document — the home is a fixed 100vh stage with layered galleries.

## Responsive Behavior

### Breakpoints

| Name | Width | Key Changes |
|---|---|---|
| Large Desktop cap | >=1750px | html font-size capped at 17.5px, so vw-scaled display type stops growing |

<sub>Source: reference.html inline style block #3 (Osmo variables, 2860 B)</sub>
| Desktop | 992-1749px | fluid root 1vw; depth-carousel JS active; .fat ~14.375vw |

<sub>Source: reference.html inline style block #3 (Osmo variables, 2860 B)</sub>
| Tablet | 991px | .fat drops to 7.75rem; overlay menu links expand to 15vw |

<sub>Source: Webflow page stylesheet (HTTP 200, 19032 B, CDN original) media queries</sub>
| Mobile | 767px | .fat 6-6.875rem; menu links 4.5rem; depth-carousel DISABLED — native overflow-x:scroll flex row (gap .5rem) with transforms reset via !important; paragraphs 0.875rem |

<sub>Source: reference.html inline style block #2 (custom motion layer, 22853 B) mobile media query; Webflow page stylesheet (HTTP 200, 19032 B, CDN original)</sub>
| Small Mobile | 479px | .fat 6rem |

<sub>Source: Webflow page stylesheet (HTTP 200, 19032 B, CDN original) media query</sub>

## Iteration Guide
1. Reproduce the locked-viewport hero: a full-viewport fixed stage with layered galleries, not a scrolling document (measured pageHeight 900px).
2. Build the depth-carousel as JS-assigned stepped transforms (translateX/scale/z-index/per-item parallax var) with the measured mobile fallback to native horizontal scroll.
3. Implement the reveal system via [line]/[lt]/[op]/[op-y]/[separator] attribute selectors + .char-parent/.char-child split wrappers, sequenced with per-element data-delay.
4. Use cubic-bezier(.33,1,.68,1) as the global ease and the overshoot cubic-bezier(0.34,1.56,0.64,1) for dot-link hovers; smooth scroll via Lenis, route transitions via a Taxi-style curtain.
5. Keep the fluid root (font-size:calc(0rem + 1vw), cap 17.5px, fixed 1rem below 992px) so display sizes scale with the viewport.
6. Honor the user's adapt intent (recorded in the appendix): monochrome palette with ONE violet accent, utility typography, restrained fade/slide motion, all copy replaced with the venture's product-grid content. The reference's #ff4c24 accent is measured but was declared-unused on the page — do not carry it into the build.
7. Build only the measured home anatomy — no pricing table, no footer, no button components exist in the reference.

## Known Gaps
- The motion probe labeled this reference 'static-editorial'; the hydrated DOM contradicts it (Lenis smooth scroll, Taxi transitions, GSAP-output inline styles, JS depth carousel, hover-video). This analysis trusts the DOM, not the static-probe label.
- Declared-but-unused tokens: --color-primary #ff4c24, --color-neutral-300 #e3e1de, --grey-bold #0009 have no consuming rule in fetched CSS (consumers presumably JS-driven).
- --size-container/--size-font are referenced (container max-width calcs) but defined nowhere in fetched material — those rules resolve invalid at computed-value time.
- Computed (rendered) styles were not sampled — all values come from static HTML + stylesheets; runtime JS-applied styles were observed only post-hydration in the captured DOM.
- The user's intent mentions a 'pricing-comparison layout'; the reference home has 0 <table> elements and no pricing text — measured.
- The capture bundle lists asset-manifest.json/inventory.json/reference.png, but only reference.html, scrape-report.md, motion-profile.md and the two Webflow stylesheets + Google Fonts CSS were fetched for this analysis (6/6 succeeded).
- No spacing-token scale is extractable — Webflow uses per-rule rem values, and no spacing tokens are declared.
- No shadows/elevation system measured (the design is flat; lightbox/loader/curtain layering is z-index-based).
- Computed (rendered) styles were not sampled — values come from static HTML + stylesheets.

### Measurement sources
- reference.html hydrated DOM (HTTP 200, 118159 B) — capture id cap-0b7594070b20 of https://www.detroit.paris/
- scrape-report.md (HTTP 200, 1065 B) — page digest + bundle contents
- motion-profile.md (HTTP 200, 2580 B) — static probe (taxonomy label contradicted by DOM, see Known Gaps)
- Webflow shared stylesheet (HTTP 200, 30033 B, CDN original) — detroit-talent.webflow.shared.5e4e184c8.min.css (CDN original)
- Webflow page stylesheet (HTTP 200, 19032 B, CDN original) — detroit-talent.webflow.6916ebf7b464c0b6f452500d.d9de9da73.opt.min.css (CDN original)
- Google Fonts Barlow CSS (HTTP 200, 906 B)
- reference.html inline <style> blocks #1-#4 (58 B + 624 B + 22853 B + 2860 B + 421 B media block) — the site's largest stylesheet is inline, holding the Osmo variables, the entire custom motion layer, Lenis CSS, Swiper CSS, lightbox, masonry, blog grid, Bunny-player styles

---

## Session Appendix — YVON reference-build record
- Session: 945dff05-bb4b-4910-90d8-e283f0c6f2c7 · Room: df757862-e68a-49fb-a208-9cedb66cde73 · Venture: novizio
- Created: 2026-09-08T03:46:37.924Z · Status: briefed

### Capture (stealth-browser relay — measured facts)
- URL: https://www.detroit.paris/
- Preview: https://hermes.yvon.in/artifacts/novizio/877ef7fc-c30d-43ca-834a-72f98619afcd/_reference-capture/reference.html
- Report: https://hermes.yvon.in/artifacts/novizio/877ef7fc-c30d-43ca-834a-72f98619afcd/scrape-report.md
- Round trip: 0.7s
- title: Detroit | AI Production House in Paris for Luxury Brands
- pageHeight: 900
- videos: 32
- images: 34
- stylesheets: 3
- keyframes: 2
- animatedRules: 3
- assetsHarvested: 99
- seconds: 56.6

### User intent (clone or adapt — the user decided)
- Mode: **adapt**
- Changes requested: Keep the editorial structure and pricing-comparison layout, but make it ours: monochrome palette with one violet accent, utility typography, restrained motion (fade/slide entrances and a subtle scroll narrative), and replace all copy with Novizio product-grid content.
- Decided: 2026-09-08T03:55:56.509Z

### Motion decision (video vs code — the user decided)
- Decision: **code**
- Decided: 2026-09-08T03:58:49.679Z

### Brand suggestions (agent proposed, user decided)
- None offered for this reference.

### Build recipe
```json
{
  "home": "workspaces/novizio/",
  "stack": [
    "Next.js App Router + Tailwind (fleet standard)"
  ],
  "motionLibs": [
    "CSS @keyframes / transitions",
    "gsap + ScrollTrigger (installed, MIT)",
    "@gsap/react (installed, MIT)",
    "motion (installed, MIT)"
  ],
  "skills": [
    {
      "path": "Teams/Shared OS/skills/impeccable/SKILL.md",
      "role": "frontend design skill — the build runs under it"
    },
    {
      "path": "Teams/Shared OS/skills/impeccable/reference/animate.md",
      "role": "motion design rules (reveals, scroll choreography, micro-interactions)"
    },
    {
      "path": "Teams/Shared OS/skills/impeccable/reference/brand.md",
      "role": "brand register — redesigning for our venture"
    }
  ],
  "assetPlan": [
    {
      "kind": "copy",
      "what": "all copy — written fresh for our venture",
      "origin": "owned",
      "swapRequired": false
    },
    {
      "kind": "image",
      "what": "imagery — licensed/stock/AI-generated, no reference media",
      "origin": "generated",
      "swapRequired": false,
      "note": "nothing borrowed, nothing to swap"
    }
  ],
  "assetsNeedSwapping": 0,
  "verifyStep": "quinn real-browser gate: load the build and confirm the @keyframes/ScrollTrigger motion actually renders; console clean; prefers-reduced-motion respected; then the design-flow e2e. Runs under Teams/Shared OS/skills/verification-before-completion/.",
  "cost": "$0 — every cited library is MIT/OSS and already installed",
  "costConfidence": "verified",
  "obligations": [],
  "intentNote": "ADAPT — keep the reference's spirit and style, redesign for our venture's brand. Changes requested: Keep the editorial structure and pricing-comparison layout, but make it ours: monochrome palette with one violet accent, utility typography, restrained motion (fade/slide entrances and a subtle scroll narrative), and replace all copy with Novizio product-grid content."
}
```

### History
- 2026-09-08T03:46:37.924Z · session_captured · https://www.detroit.paris/
- 2026-09-08T03:46:44.085Z · motion_profile_published · https://hermes.yvon.in/artifacts/novizio/8e78fc16-8bf3-4604-90d6-80cb95e8d22d/motion-profile.md
- 2026-09-08T03:46:44.086Z · capture_completed · www-detroit-paris-20260908 - round trip 0.6s
- 2026-09-08T03:46:50.328Z · intent_gate_emitted · static-editorial
- 2026-09-08T03:55:56.511Z · intent_recorded · adapt: Keep the editorial structure and pricing-comparison layout, but make it ours: monochrome palette with one violet accent, utility typography, restrained motion (fade/slide entrances and a subtle scroll
- 2026-09-08T03:56:08.226Z · session_reused · a follow-up turn re-mentioned https://www.detroit.paris/ — continued the live gate chain instead of opening a second session
- 2026-09-08T03:56:11.438Z · motion_profile_published · https://hermes.yvon.in/artifacts/novizio/877ef7fc-c30d-43ca-834a-72f98619afcd/motion-profile.md
- 2026-09-08T03:56:11.440Z · capture_completed · www-detroit-paris-20260908 - round trip 0.7s
- 2026-09-08T03:56:38.249Z · motion_gate_emitted · 4 observed motion need(s)
- 2026-09-08T03:58:49.679Z · motion_recorded · code
- 2026-09-08T03:58:49.681Z · recipe_routed · $0 — every cited library is MIT/OSS and already installed · 3 skill(s) · 0 asset(s) to swap
- 2026-09-08T03:58:49.683Z · design_md_written · C:\Users\Novy\Desktop\YVON-Agentic-OS-\store\design-sessions\945dff05-bb4b-4910-90d8-e283f0c6f2c7-design.md
- 2026-09-08T06:28:32.283Z · design_system_measured · backfilled from .git/detroit-facts.json (evidence-agent analysis, 6/6 fetches HTTP 200)
- 2026-09-08T06:29:05.977Z · design_system_measured · backfilled from .git/detroit-facts.json (evidence-agent analysis, 6/6 fetches HTTP 200)