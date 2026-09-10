# TS-001 FIDELITY SPEC — clone usavionix.com 1:1 (operator ruling 2026-09-10)

The previous build invented a brand ("Novizio"). THIS SPEC IS SUPREME for content:
replace ALL invented copy, brand names, and section content with the reference's
verbatim content below. This is a private clone-fidelity test build — reproduce the
reference exactly. Keep the measured design system (Geist, #000 base, white/#D9D9D9
text, pill radii 9999px, mono micro-labels, alternating full-bleed/centered grammar,
768px mobile switch). Route stays /novizio (preview DNS depends on it).

## 1. Nav (fixed, top)
Left: logo mark + wordmark "USAVIONIX". Right: text links — Specs, Swarm, Mission,
Sync, Detection — then a pill button "Contact". Mobile: same items in a burger panel.

## 2. Hero (full-bleed, cinematic)
- Background: dark terrain — slow-panning canvas terrain (procedural, monochrome
  dark greens/greys) with a top-down jet drone rendered in canvas gliding over it
  (the reference drives this with a canvas animation; implement in code, no video).
- HUD detection overlay (mono font, small, corners): left block "Thermal Sensor"
  with a scale "0°C — 148°C"; right block "Threat Area" with the detection list,
  each row label + percent: road block 80%, power line 79%, car 79%, person 79%,
  antenna 79%, motorcycle 79%, road obstruction 79%, campfire 79% (percentages
  jitter ±3% live).
- Boot-sequence terminal lines cycling bottom-left (mono, typewriter reveal):
  BOOT SEQUENCE INITIALIZED / THERMAL / LIDAR / RGB / IR [ONLINE] /
  AI: 2 AGENTS / DUAL GPU [ACTIVE] / LINK: PHALANX SYSTEM [ESTABLISHED] /
  SCAN MODE: ACTIVE / COORD: [37.4419°N / 119.8772°W] / ALT 1,240M | SPEED 74 KM/H /
  32 CAR / 4 TRUCK / 1 PERSON / 2 UAV / ALERT: THERMAL ANOMALY /
  TARGET ZONE LOCKED / EMERGENCY AGENCIES NOTIFIED / SIG INTENSITY: 87% /
  CLASSIFICATION: POTENTIAL THREAT / SURVEY AREA / 2 DRONES ASSIGNED TO TARGET AREA /
  2 WILDFIRES / 1 ROADBLOCK DETECTED / AUTHORITIES CONTACTED / AREA STATUS: SECURED /
  WILDFIRE NEAR ELECTRICAL STATION / FIREFIGHTER UNITS ALERTED / RISK LEVEL: REDUCED
- Headline (display, Geist 500): "Securing the skies with autonomous intelligence"
- Sub (body): "The first agent in the air, built with the speed, range, and onboard
  intelligence to search vast areas on its own."
- Pill: "Scroll To Explore ↓"

## 3. Missions (centered text intro + 3 cards)
H2: "One platform, many missions."
Card 1 title: "Wildfire Cascade" — body: "Delta drones rapidly detect ignition
points, suppress advancing fires, secure nearby neighborhoods, and keep evacuation
routes open until the situation is contained."
Card 2 title: "Border Storm" — body: "Autonomous surveillance units track
cross-border movement, monitor hazardous conditions, and stabilize critical areas
to maintain control under extreme pressure."
Card 3 title: "Critical Infrastructure in Crisis" — body: "Delta drones safeguard
essential facilities by isolating threats, protecting surrounding areas, and
supporting recovery efforts to restore critical infrastructure."
Outcome chips (pill outline, mono): Power Restored / Flood Area Secured / Evacuation
Supported / Missing Person Found / Road Block Cleared / Wildfire Contained

## 4. Statement (centered, full-bleed)
H2 (display scale): "USAvionix covers vast areas and long distances across
real-world missions, proving its versatility in critical operations."

## 5. Demo
H2: "Autonomy in real operations"
Body: "See the full system fly a live mission. Demo access is limited, so request a
slot and we will reach out."
Button (pill): "Request Access"

## 6. Founders (centered)
Body paragraph: "Founded by leaders from SpaceX, Apple, Tesla, Palantir, JPL, and
elite military units, USAvionix drives breakthroughs across aerospace, defense, and
frontier tech."

## 7. Contact
H2: "Ready to talk to us?"
Pill: "Contact Us"

## 8. Footer
"© USAvionix Inc. 2026" left; links: Notes, Privacy Policy, Terms of Use.

## 9. Captured reference assets (USE THESE — do not recreate)
Available in the checkout at `dashboard/public/usavionix-ref/`:
- `USAVX_logoMark_white.svg` — the actual logo mark (nav + footer)
- `desktop.1b373cc8.webp` / `mobile.8107afe0.webp` — terrain hero ground plates
- `wildfire-cascade.5579c082.webp`, `border-storm.31d3c346.webp`,
  `critical-infrastructure-in-crisis.d7587763.webp` — mission card key art
- `loading-delta.glb` — Delta drone model (optional: render as canvas sprite)

Reference `/usavionix-ref/<file>` from public. The design.md in this task's payload
is the full measured reference design system — follow its components and tokens
exactly (it names these assets too).

## Acceptance for this fix
- Zero invented brand words remain ("Novizio" must not appear in visible copy;
  wordmark/footer read USAvionix; hello@novizio.ai → a Contact Us action, no email).
- Section order + all copy match this spec verbatim.
- Canvas terrain + jet + HUD + boot terminal implemented in code; reduced-motion
  clamps them; axe 0 serious/critical on the public route.
- No overflow at 390/600/768/1280; h1 5rem desktop / 2.6875rem mobile.
