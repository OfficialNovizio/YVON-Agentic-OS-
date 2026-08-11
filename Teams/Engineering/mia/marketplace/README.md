# marketplace/

## scroll-world (adopted 2026-08-10)

`scroll-world/SKILL.md` — scroll-scrubbed cinematic landing-page builder, adapted from
`github.com/oso95/scroll-world`. Generation backend swapped from the upstream
Higgsfield/Monid default to **krea.ai** (this repo's existing generation vendor —
`dashboard/lib/krea.ts`, `dashboard/app/api/krea/*`) per operator decision. See the
skill's own frontmatter + Gotchas section for what's adapted vs. verbatim, and what's
still unverified about krea's video-endpoint schema.

Installed for mia (routing table: "Dashboards, web UI, frontend → mia") rather than
Brand Studio's pixel/spark, since the skill's substance is a page-build engine
(vanilla JS scrub engine + ffmpeg encode pipeline assembled into a live page), not
visual-asset production in isolation. `mia-config.md`'s "Marketplace skills" section
cross-references this adoption.

Playbook 6.1/7.0a still applies to every other agent: folder presence never varies,
marketplace-search-first applies before any future skill lands here.
