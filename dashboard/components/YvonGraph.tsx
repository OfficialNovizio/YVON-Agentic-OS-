"use client";

import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { supabaseSource } from "@/lib/events/supabase-source";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { applyEvent, bubbleUp, DECAY_MS } from "@/lib/events";
import { useWorkspace } from "@/lib/WorkspaceContext";
import {
  graphDataToDepartments, modulesToDepartments, connectionsFor, buildNodesById,
  type RawGraphData, type CodeGraphNode, type CodeGraphLink,
} from "@/lib/graph/venture-code-graph";
import { AgentAvatar } from "@/app/chat/AgentAvatar";

/* ── Nerve pulse (2026-08-14) — a small glowing dot traveling repeatedly
   along a line or path: "info traveling along a nerve," per operator
   request. Two variants:
     NerveLinePulse — straight line, plain lerp between two points. No DOM
       measurement needed, used for the orb→card spokes.
     NervePathPulse — reads a real rendered <path>'s geometry via
       getPointAtLength (by id, since these paths live inside a mapped
       list — an id lookup is simpler than threading a ref array through).
       Used for DetailView's curved bezier connections, where linear
       interpolation would visibly cut the corner.
   Both drive a plain {t} proxy object with gsap.to(..., {onUpdate}) and
   write straight to the circle's cx/cy/opacity attributes via a ref —
   never touching React-controlled style/props — so there's no fight with
   React re-rendering this component's own position. */
function NerveLinePulse({ x1, y1, x2, y2, color = "rgba(200,220,255,.9)", duration = 2.2, delay = 0 }: {
  x1: number; y1: number; x2: number; y2: number; color?: string; duration?: number; delay?: number;
}) {
  const dotRef = useRef<SVGCircleElement | null>(null);
  useEffect(() => {
    const proxy = { t: 0 };
    const tw = gsap.to(proxy, {
      t: 1, duration, delay, repeat: -1, ease: "power1.inOut",
      onUpdate: () => {
        const el = dotRef.current;
        if (!el) return;
        el.setAttribute("cx", String(x1 + (x2 - x1) * proxy.t));
        el.setAttribute("cy", String(y1 + (y2 - y1) * proxy.t));
        el.setAttribute("opacity", String(Math.sin(proxy.t * Math.PI)));
      },
    });
    return () => { tw.kill(); };
  }, [x1, y1, x2, y2, duration, delay]);
  return <circle ref={dotRef} r={2.6} fill={color} style={{ filter: `drop-shadow(0 0 4px ${color})` }} />;
}

function NervePathPulse({ pathId, color = "rgba(150,230,240,.9)", duration = 1.8, delay = 0 }: {
  pathId: string; color?: string; duration?: number; delay?: number;
}) {
  const dotRef = useRef<SVGCircleElement | null>(null);
  useEffect(() => {
    const proxy = { t: 0 };
    const tw = gsap.to(proxy, {
      t: 1, duration, delay, repeat: -1, ease: "power1.inOut",
      onUpdate: () => {
        const path = document.getElementById(pathId) as unknown as SVGPathElement | null;
        const dot = dotRef.current;
        if (!path || !dot) return;
        const len = path.getTotalLength();
        const pt = path.getPointAtLength(proxy.t * len);
        dot.setAttribute("cx", String(pt.x));
        dot.setAttribute("cy", String(pt.y));
        dot.setAttribute("opacity", String(Math.sin(proxy.t * Math.PI)));
      },
    });
    return () => { tw.kill(); };
  }, [pathId, duration, delay]);
  return <circle ref={dotRef} r={3} fill={color} style={{ filter: `drop-shadow(0 0 5px ${color})` }} />;
}

/* ═══════════════════════════════════════════════════════════════════════
   YVON GRAPH VIEWER  —  three levels

   LEVEL 1  overview   ·  core orb + DEPARTMENT cards (collision-free ring)
                          + satellite orbs, one per real brand (L3, below)
   LEVEL 2  detail     ·  one department + its AGENTS fanned out
   LEVEL 3  satellite   ·  one brand's ring — active departments only, and
                          within each, only the agents granted to that brand

   DATA IS REAL — see system-harness/graph-brain/YVON-GRAPH.md
     structure  /structure.json, generated from the Teams/ tree by
                scripts/build-structure.mjs (runs as `prebuild`, so every
                deploy regenerates it).            → doc §1.1
     contexts   Supabase `ventures` (kind/status/tier/context_path/parent_id/
                sort_order — migrations 109/111/112), fetched via
                useWorkspace()/`/api/ventures`.     → doc §1.2, §3 Q2
     grants     Supabase `venture_agents` (enabled=true), fetched directly
                from the browser client below.      → doc §1.3, §3 Q3
     activity   Supabase Realtime on the append-only `events` table; the
                browser holds the socket, Vercel is never in the live
                path.                              → doc §1.4, §4.5
     code graph /yvon-graph.json — the complete repo graph (every module,
                graphify → scripts/build-code-graph.mjs), merged into the
                universe ring alongside the org tree (2026-08-30).
     ids        slug(dept)-dirname. Contract with events.actor — if it
                drifts, nodes silently stop lighting. → doc §6.1
     layout     computed once from stable sorted ids and never recomputed
                on a state change, so nodes never reshuffle. → doc §2.5

   L3 built 2026-08-09 — see system-harness/graph-brain/YVON-GRAPH.md §2.3 for the rendering rule
   this implements (active-departments-only, granted-agents-only, dimmed +
   explicit affordance for zero-grant brands, one-level client sub-orb
   nesting, grant edge vs run edge visually distinct).
   ═══════════════════════════════════════════════════════════════════════ */

// sourceFile/fileType/community are only ever set for code-graph nodes
// (lib/graph/venture-code-graph.ts's CodeGraphAgent) — undefined for every
// real YVON fleet agent. AgentDetailPanel uses their presence to tell the
// two apart (2026-08-15).
interface Agent {
  id: string; name: string; tag: string;
  sourceFile?: string; fileType?: string; community?: string | number;
  memberIds?: string[];
}
interface Dept {
  id: string;
  name: string;
  metric: string;
  metricLabel: string;
  agents: Agent[];
}

/* Real structure, generated from Teams/ by scripts/build-structure.mjs (doc §1.1). */
interface Structure { version: number; departments: Dept[] }

/* Agent detail tree, generated from each Teams/<Dept>/<agent>/agent.md by
   scripts/build-agent-details.mjs (2026-08-15) — Purpose, Skill Roster (with
   the actual SKILL.md content each row points at), Operational Layer's 5
   files (with content), Logical Layer. Fetched lazily from
   /agent-details.json, keyed by the same id scheme as structure.json. */
interface SkillRosterEntry {
  skill: string; location: string; purpose: string;
  kind: "own" | "shared" | "unresolved"; path: string | null; content: string | null;
}
interface OperationalLayerEntry { subfolder: string; file: string; summary: string; content: string | null }
interface LogicalLayer { summary: string; content: string | null }
interface AgentDetail {
  id: string; purpose: string; skillRoster: SkillRosterEntry[];
  skillChain: string; operationalLayer: OperationalLayerEntry[]; logicalLayer: LogicalLayer | null;
}

/* Context graph — Supabase `ventures` (doc §1.2), shape as returned by /api/ventures. */
interface Context {
  slug: string;
  name: string;
  color: string;
  kind?: "core" | "venture" | "client";
  status?: string;
  contextPath?: string;
  parentId?: string;
  id?: string;
  sortOrder?: number;
}

const MINT = "#3ddc97";
const CORAL = "#ff6b60";
const VIOLET = "#8e7bf0";

type Status = "idle" | "active" | "error";

function rngFrom(seed: number) {
  let s = seed;
  return () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296);
}

const CX = 1500, CY = 980;
const CARD_W = 232, CARD_H = 176;
const ORB_R = 132;

/* ── infinite starfield (2026-08-14) ──────────────────────────────────
   The per-view `stars` arrays below are baked into world coordinates
   inside each transformed layer, so they only cover a fixed island
   around CX,CY — pan far enough and you fall off the edge into flat
   black. This is a separate layer entirely: a small tile of randomly
   scattered dots, CSS-repeated to infinity, rendered fixed behind
   everything so it covers the viewport no matter where you pan or how
   far you zoom. A touch of parallax (tied to `view.x/y`, not `view.s` —
   real starfields don't scale with camera zoom) sells the depth without
   coupling it to world space. Built once at module scope, never
   recomputed per render. */
const STARFIELD_BG = (() => {
  const rnd = rngFrom(77123);
  const layers: string[] = [];
  for (let i = 0; i < 70; i++) {
    const x = (rnd() * 100).toFixed(1);
    const y = (rnd() * 100).toFixed(1);
    const size = (0.7 + rnd() * 2.1).toFixed(2);
    const o = (0.12 + rnd() * 0.5).toFixed(2);
    layers.push(`radial-gradient(${size}px ${size}px at ${x}% ${y}%, rgba(255,255,255,${o}) 0%, rgba(255,255,255,0) 100%)`);
  }
  return layers.join(",");
})();

interface Placed extends Dept { x: number; y: number; bars: number[] }

/* ── ring layout + AABB relaxation → guaranteed no overlap ───────────
   `seed` defaults to the original fixed date-seed (L1's exact historical
   layout, unchanged). L3 satellite rings pass a seed derived from the
   context slug instead, so one brand's internal arrangement is stable
   across reloads and independent of every other brand (doc §2.3, §2.5.5). */
/* `origin` (2026-08-30) lets a venture cluster reuse this EXACT algorithm at a
   local origin of {0,0}, so its ring is YVON's ring — same two bands, same
   ellipse, same relaxation — expressed as offsets that get added to that
   venture's own hub at render time and uniformly scaled there. Operator:
   "make cluster look like yvon structure, not a vertical tree". Because the
   render applies ONE uniform scale to both offsets and cards, the result is a
   true similarity transform of YVON's layout — so it cannot overlap-fail the
   way an independently-tuned mini-layout did. Defaults keep every existing
   caller (L1 core ring, L3 satellite ring) byte-identical. */
function buildLayout(
  DEPARTMENTS: Dept[], seed = 20260803, origin = { x: CX, y: CY },
): { placed: Placed[]; stars: { x: number; y: number; r: number; o: number }[] } {
  const rnd = rngFrom(seed);
  const n = DEPARTMENTS.length || 1;
  const OX = origin.x, OY = origin.y;

  const placed: Placed[] = DEPARTMENTS.map((dep, i) => {
    const ang = (i / n) * Math.PI * 2 - Math.PI / 2 + (rnd() - 0.5) * 0.06;
    const band = i % 2 === 0 ? 430 : 570;
    return {
      ...dep,
      x: OX + Math.cos(ang) * band * 1.44,
      y: OY + Math.sin(ang) * band * 0.98,
      bars: Array.from({ length: 26 }, () => 10 + rnd() * 82),
    };
  });

  const PAD_X = 48, PAD_Y = 42;
  for (let iter = 0; iter < 360; iter++) {
    for (let i = 0; i < placed.length; i++) {
      for (let j = i + 1; j < placed.length; j++) {
        const a = placed[i], b = placed[j];
        const dx = b.x - a.x, dy = b.y - a.y;
        const ox = CARD_W + PAD_X - Math.abs(dx);
        const oy = CARD_H + PAD_Y - Math.abs(dy);
        if (ox > 0 && oy > 0) {
          if (ox / (CARD_W + PAD_X) < oy / (CARD_H + PAD_Y)) {
            const s = (ox / 2) * (dx >= 0 ? 1 : -1);
            a.x -= s; b.x += s;
          } else {
            const s = (oy / 2) * (dy >= 0 ? 1 : -1);
            a.y -= s; b.y += s;
          }
        }
      }
    }
    for (const p of placed) {
      const dx = (p.x - OX) / 1.44, dy = (p.y - OY) / 0.98;
      const dist = Math.hypot(dx, dy) || 1;
      const min = ORB_R + 205;
      if (dist < min) {
        const k = min / dist;
        p.x = OX + dx * k * 1.44;
        p.y = OY + dy * k * 0.98;
      }
    }
  }

  const stars: { x: number; y: number; r: number; o: number }[] = [];
  for (let i = 0; i < 460; i++) {
    const ang = rnd() * Math.PI * 2;
    const rad = 260 + Math.pow(rnd(), 0.55) * 540;
    const x = CX + Math.cos(ang) * rad * 1.46;
    const y = CY + Math.sin(ang) * rad * 1.0;
    const dx = (x - CX) / 1.46, dy = (y - CY) / 1.0;
    if (Math.hypot(dx, dy) < 215) continue;
    stars.push({ x, y, r: 2.2 + rnd() * 4.6, o: 0.14 + rnd() * 0.42 });
  }
  return { placed, stars };
}

/* ── Saturn rings (2026-08-30) ─────────────────────────────────────────
   Operator: "two saturn rings — inner circle all departments, outer
   codebase files." The merged universe ring is laid out in two tiers:
   org departments stay on their historical 430/570 bands (identical to
   buildLayout's first-19 arrangement), code modules get a dedicated outer
   band (760) with room to breathe instead of being shoved off the shared
   bands into a blob. One shared AABB relaxation pass keeps inner and
   outer cards from ever touching. Satellites (L3) still use buildLayout.
   Random stream: same call order as the old single-list layout (org cards
   first, then modules — merged DEPARTMENTS order), so the org ring's
   exact historical arrangement survives. */
function buildTieredLayout(
  innerDepts: Dept[],
  outerDepts: Dept[],
  seed = 20260803,
): { placed: Placed[]; stars: { x: number; y: number; r: number; o: number }[] } {
  const rnd = rngFrom(seed);
  const place = (dept: Dept, i: number, n: number, band: number, jitter: number): Placed => {
    const ang = (i / n) * Math.PI * 2 - Math.PI / 2 + (rnd() - 0.5) * jitter;
    return {
      ...dept,
      x: CX + Math.cos(ang) * band * 1.44,
      y: CY + Math.sin(ang) * band * 0.98,
      bars: Array.from({ length: 26 }, () => 10 + rnd() * 82),
    };
  };
  const inner = innerDepts.map((dep, i) => place(dep, i, innerDepts.length || 1, i % 2 === 0 ? 430 : 570, 0.06));
  const outer = outerDepts.map((dep, i) => place(dep, i, outerDepts.length || 1, 760, 0.08));
  const placed = [...inner, ...outer];

  const PAD_X = 48, PAD_Y = 42;
  for (let iter = 0; iter < 360; iter++) {
    for (let i = 0; i < placed.length; i++) {
      for (let j = i + 1; j < placed.length; j++) {
        const a = placed[i], b = placed[j];
        const dx = b.x - a.x, dy = b.y - a.y;
        const ox = CARD_W + PAD_X - Math.abs(dx);
        const oy = CARD_H + PAD_Y - Math.abs(dy);
        if (ox > 0 && oy > 0) {
          if (ox / (CARD_W + PAD_X) < oy / (CARD_H + PAD_Y)) {
            const s = (ox / 2) * (dx >= 0 ? 1 : -1);
            a.x -= s; b.x += s;
          } else {
            const s = (oy / 2) * (dy >= 0 ? 1 : -1);
            a.y -= s; b.y += s;
          }
        }
      }
    }
    for (const p of placed) {
      const dx = (p.x - CX) / 1.44, dy = (p.y - CY) / 0.98;
      const dist = Math.hypot(dx, dy) || 1;
      const min = ORB_R + 205;
      if (dist < min) {
        const k = min / dist;
        p.x = CX + dx * k * 1.44;
        p.y = CY + dy * k * 0.98;
      }
    }
  }

  const stars: { x: number; y: number; r: number; o: number }[] = [];
  for (let i = 0; i < 460; i++) {
    const ang = rnd() * Math.PI * 2;
    const rad = 260 + Math.pow(rnd(), 0.55) * 540;
    const x = CX + Math.cos(ang) * rad * 1.46;
    const y = CY + Math.sin(ang) * rad * 1.0;
    const dx = (x - CX) / 1.46, dy = (y - CY) / 1.0;
    if (Math.hypot(dx, dy) < 215) continue;
    stars.push({ x, y, r: 2.2 + rnd() * 4.6, o: 0.14 + rnd() * 0.42 });
  }
  return { placed, stars };
}

/* ── Code-graph orbit layout (2026-08-30, DetailView code-node fan) ─────
   Three rounds with the operator:
     Round 1: the old column/row fan "looks weird and confused" at hundreds
       of nodes.
     Round 2: switched to concentric rings — operator: "too dense and looks
       collapsed" (ring gap was smaller than a card's own diameter, so rings
       physically overlapped).
     Round 3, after seeing rings fixed: "why do they all re-align in a
       circle... should be at random places" — even non-overlapping
       concentric rings still read as gridded, not organic, and don't pack
       space efficiently (empty gaps between ring bands).
   This version drops discrete rings entirely for a continuous scattered
   disc: a phyllotaxis/"sunflower" packing (radius(k) ∝ √k, angle(k) = k ×
   golden angle) — the standard even-density, no-visible-pattern way to
   scatter N equal circles in a disc (it's why sunflower seeds and daisy
   petals look randomly packed rather than gridded — golden angle is
   irrational, so no two points ever share a radial line). A jitter on top
   of both angle and radius breaks any remaining regularity, then the same
   circle-circle relaxation pass as before still runs as the actual overlap
   guarantee (packing formula gets it close; relaxation closes the gap to
   exact). Verified numerically at n=31/100/335: minimum pairwise distance
   converges to the required clearance in every case, and max radius used is
   SMALLER than round 2's ring layout at every node count — literally saves
   space, not just looks like it.
   Team mode (real agents, ≤11 per department) is untouched — this path only
   runs when codeGraphMode is true, and DetailView gives that mode its own
   pan/zoom so a big cluster is explored rather than crammed into one frame. */
interface OrbitPlaced extends Agent { x: number; y: number }

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5)); // ≈137.5°, the phyllotaxis constant

// Generic so the same packer serves DetailView's code-node fan (small circle
// cards, big R_INNER clearing the central "planet" summary) AND the universe
// view's per-venture mini-galaxy ring (rect dept-cards, small R_INNER
// clearing only the venture's own small orb) — see buildOrbitLayout below.
// Defaults match the original DetailView tuning exactly, so that call site
// is unaffected by this generalization.
interface OrbitLayoutOpts { cardR?: number; minGap?: number; rInner?: number; scale?: number }

function buildOrbitLayout<T extends { id: string }>(
  items: T[], hub: { x: number; y: number }, seed: number, opts: OrbitLayoutOpts = {},
): { placed: (T & { x: number; y: number })[] } {
  const rnd = rngFrom(seed);
  const CARD_R = opts.cardR ?? 58;
  const MIN_GAP = opts.minGap ?? 26;
  const MIN_D = CARD_R * 2 + MIN_GAP;
  const R_INNER = opts.rInner ?? 280;
  const SCALE = opts.scale ?? 32;   // packing density — tuned so √k spacing ≈ MIN_D early on
  const out: (T & { x: number; y: number })[] = items.map((a, i) => {
    const k = i + 1;
    const radius = R_INNER + SCALE * Math.sqrt(k);
    const angle = k * GOLDEN_ANGLE + (rnd() - 0.5) * 0.4;
    const jitteredRadius = radius + (rnd() - 0.5) * MIN_D * 0.5;
    return { ...a, x: hub.x + Math.cos(angle) * jitteredRadius, y: hub.y + Math.sin(angle) * jitteredRadius };
  });

  // Circle-circle relaxation — the packing formula gets cards close to
  // MIN_D apart on average; this closes any remaining overlap exactly.
  // 400 iterations (not 120) — verified at n=335 this needs the extra
  // sweeps to fully converge (measured 141.85px vs a 142px target, where
  // 120 iterations left it at ~132px, a visible residual overlap).
  for (let iter = 0; iter < 400; iter++) {
    let moved = false;
    for (let i = 0; i < out.length; i++) {
      for (let j = i + 1; j < out.length; j++) {
        const a = out[i], b = out[j];
        const dx = b.x - a.x, dy = b.y - a.y;
        const d = Math.hypot(dx, dy) || 0.001;
        if (d < MIN_D - 0.05) {
          moved = true;
          const push = (MIN_D - d) / 2;
          const ux = dx / d, uy = dy / d;
          a.x -= ux * push; a.y -= uy * push;
          b.x += ux * push; b.y += uy * push;
        }
      }
    }
    if (!moved) break;
  }

  return { placed: out };
}

/* ── L3 — satellite ring layout (doc §2.3) ──────────────────────────
   Positions come from a ring pass over contexts sorted by (kind, sort_order,
   slug) — the same "sorted stable ids, never array index" rule as buildLayout,
   so satellites never reshuffle on a status change. Each satellite's seed is
   derived from its own context slug, so one brand's internal churn never
   perturbs another's layout (doc §2.5.5). */
const SAT_ORB = 70;     // venture hub orb diameter baseline

function seedFromSlug(slug: string): number {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return h || 1;
}

/* ── Venture aura — atlas brand_separation_matrix (2026-08-30) ──────────
   Resolves one venture's EXCLUSIVE visual elements. Every value here traces
   to Teams/Brand Studio/atlas/operational/agent/brand-separation-matrix.md
   (operator-approved), not to a builder's taste — mia never improvises brand
   (mia-skill-routing: "Any brand-value change → atlas (kit), then tokens").

   Matrix rules implemented:
     palette    exclusive — the venture's OWN stored color, applied through its
                whole subtree (borders, numerals, sparklines, branches, halo).
                Previously the bug the operator hit: mini cards rendered with
                the hardcoded cyan code-card style, so every venture inherited
                YVON's code-module look and its own color never appeared.
     silhouette exclusive — a stable pick from the matrix's approved 4-member
                set, keyed on venture identity (never random per render).
     glow       exclusive — stable pick across the matrix's approved 0.28–0.64
                range, floor keeps every venture visible, ceiling keeps a
                venture from out-glowing the core mark.
   Derivation (not art direction) is the matrix's documented "Known gap": no
   per-venture brand kits exist yet, so identity-derived stands in until they
   do. Deliberately deterministic so a venture's look never shifts underneath
   the operator between sessions. */
const SILHOUETTES = [
  { radius: 18, borderWidth: 1.6 },
  { radius: 6, borderWidth: 1.2 },
  { radius: 12, borderWidth: 2.0 },
  { radius: 22, borderWidth: 1.0 },
];
interface VentureAura { color: string; radius: number; borderWidth: number; glow: number }
// murmur3's fmix32 finalizer. seedFromSlug is a plain rolling hash whose LOW
// bits barely move between similar slugs — deriving silhouette from `h % 4`
// and glow from `(h >> 3) % 5` gave BOTH live ventures the identical glow
// step, i.e. the matrix's "exclusive" rule silently not applying. Avalanching
// first makes independent element classes actually independent. Fixed by
// mixing properly rather than by hunting a shift that happened to separate
// today's two slugs — that would just break on the next venture added.
function fmix32(h: number): number {
  h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b) >>> 0;
  h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35) >>> 0;
  h ^= h >>> 16; return h >>> 0;
}
function ventureAura(ctx: Context): VentureAura {
  const h = seedFromSlug(ctx.slug);
  const sil = SILHOUETTES[fmix32(h) % SILHOUETTES.length];
  // Separate mixing constant per element class, so silhouette and glow are
  // drawn independently instead of correlating off the same bits.
  const glow = 0.28 + (fmix32(h ^ 0x9e3779b9) % 5) * 0.09; // 0.28 … 0.64, matrix-approved range
  return { color: ctx.color, radius: sil.radius, borderWidth: sil.borderWidth, glow };
}

/* ── Venture galaxies (2026-08-30, from the operator's hand sketch) ─────
   The sketch: YVON's cluster on the left, curved branches arcing out to each
   venture, and each venture is ITS OWN cluster shaped exactly like YVON's —
   not the vertical card column the previous pass built ("make cluster look
   like yvon structure, not in a vertical tree"). Plus a third branch to
   "Upcoming" for ventures that don't really exist yet.

   Implemented as a true similarity transform of YVON's own ring: a venture's
   cards come from buildLayout (same function, same bands, same relaxation) at
   a local origin, then render at hub + offset*VENTURE_SCALE with the cards
   themselves at the same VENTURE_SCALE. One uniform scale on both geometry
   and cards means a venture cluster literally IS YVON's layout, 10% smaller —
   so it can never overlap-fail the way an independently-tuned mini-layout did.

   "Exists" is decided by real data, never by the row merely being present
   (operator: "hourbour not existed yet, why you include it… don't you read
   the venture data?"). Verified live: hourbour has no repo, 0 agents, 0 graph
   nodes, 0 mempalace entries — a registered name with nothing behind it. Such
   ventures render on the Upcoming branch as placeholders; only ventures with
   real content get a galaxy. Nothing is fabricated to fill a slot. */
const VENTURE_R = 2600;      // core → venture hub. Must exceed YVON's reach (~1210) + a venture cluster's own reach.
const VENTURE_SCALE = 0.9;   // "10% smaller than YVON" (operator)
const UPCOMING_R = 1750;     // the Upcoming branch sits closer in — it carries no cluster to clear
const MAX_CLUSTER_CARDS = 24;

interface VentureLeaf extends Dept { x: number; y: number; bars: number[]; more?: number }
interface VentureGalaxy {
  ctx: Context; x: number; y: number; r: number;
  agentCount: number; deptCount: number;
  mode: "team" | "code" | "none";
  leaves: VentureLeaf[];          // positions are LOCAL offsets, pre-scale
  footprint: number;              // real reach, already scaled
  children: { ctx: Context; x: number; y: number; r: number }[];
}
interface UpcomingSlot { ctxs: Context[]; x: number; y: number }

function buildVentureGalaxies(
  contexts: Context[],
  ringFor: (slug: string) => { deptCount: number; agentCount: number },
  leavesFor: (slug: string) => { depts: Dept[]; mode: "team" | "code" | "none" },
): { galaxies: VentureGalaxy[]; upcoming: UpcomingSlot | null } {
  const roots = contexts
    .filter((c) => c.kind !== "core" && !c.parentId)
    .sort((a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99) || a.slug.localeCompare(b.slug));
  const childrenOf = (id?: string) =>
    contexts.filter((c) => c.parentId && c.parentId === id)
      .sort((a, b) => a.slug.localeCompare(b.slug));

  // Real content, from real data — not the existence of a ventures row.
  const real: Context[] = [];
  const empty: Context[] = [];
  for (const ctx of roots) {
    (leavesFor(ctx.slug).depts.length > 0 ? real : empty).push(ctx);
  }

  // Fan the real ventures out to the right, as the sketch draws them.
  const n = real.length;
  const FAN = Math.PI * 0.55;
  const hubs = real.map((ctx, i) => {
    const ang = n === 1 ? -0.34 : -FAN / 2 + (i * FAN) / (n - 1);
    return {
      ctx,
      x: CX + Math.cos(ang) * VENTURE_R * 1.12,
      y: CY + Math.sin(ang) * VENTURE_R * 0.92,
    };
  });

  const galaxies: VentureGalaxy[] = hubs.map(({ ctx, x, y }) => {
    const { depts, mode } = leavesFor(ctx.slug);
    const { deptCount, agentCount } = ringFor(ctx.slug);

    const shown = depts.slice(0, MAX_CLUSTER_CARDS);
    const restCount = depts.length - shown.length;
    const cards: Dept[] = [...shown];
    if (restCount > 0) {
      cards.push({
        id: `${ctx.slug}-more`, name: `+${restCount} more`,
        metric: String(restCount), metricLabel: mode === "code" ? "CLUSTERS" : "DEPTS",
        agents: [],
      });
    }

    // YVON's own algorithm, at a local origin → offsets we scale at render.
    const local = buildLayout(cards, seedFromSlug(ctx.slug), { x: 0, y: 0 }).placed;
    const leaves: VentureLeaf[] = local.map((p) => ({
      ...p,
      more: p.id === `${ctx.slug}-more` ? restCount : undefined,
    }));

    let maxR = 0;
    for (const p of leaves) maxR = Math.max(maxR, Math.hypot(p.x, p.y));
    const footprint = (maxR + CARD_W / 2) * VENTURE_SCALE;

    const kids = childrenOf(ctx.id).map((child, j) => ({
      ctx: child, x, y: y + SAT_ORB * 1.6 + j * (SAT_ORB * 1.4), r: SAT_ORB * 0.55,
    }));

    const r = SAT_ORB * (0.62 + Math.min(Math.max(deptCount, cards.length), 7) * 0.09);
    return { ctx, x, y, r, agentCount, deptCount, mode, leaves, footprint, children: kids };
  });

  // Footprint-aware relaxation — galaxies push apart by their real reach, so
  // adding ventures later never crowds the existing ones.
  const PAD = 260;
  for (let iter = 0; iter < 220; iter++) {
    let moved = false;
    for (let i = 0; i < galaxies.length; i++) {
      for (let j = i + 1; j < galaxies.length; j++) {
        const a = galaxies[i], b = galaxies[j];
        const dx = b.x - a.x, dy = b.y - a.y;
        const d = Math.hypot(dx, dy) || 0.001;
        const minD = a.footprint + b.footprint + PAD;
        if (d < minD) {
          moved = true;
          const push = (minD - d) / 2, ux = dx / d, uy = dy / d;
          a.x -= ux * push; a.y -= uy * push;
          b.x += ux * push; b.y += uy * push;
        }
      }
    }
    if (!moved) break;
  }

  const upcoming: UpcomingSlot | null = empty.length
    ? { ctxs: empty, x: CX + Math.cos(1.15) * UPCOMING_R * 1.05, y: CY + Math.sin(1.15) * UPCOMING_R }
    : null;

  return { galaxies, upcoming };
}

export default function YvonGraph({ embedded = false }: { embedded?: boolean }) {
  const [structureDepts, setStructureDepts] = useState<Dept[]>([]);
  const [open, setOpen] = useState<Placed | null>(null);
  const [status, setStatus] = useState<Record<string, Status>>({});
  const [q, setQ] = useState("");
  // Scope = context_path (doc §6.1: "context_id = ventures.context_path" — the bare slug is
  // NOT the join key once nesting exists). TS-026/030: real ventures from the SHARED store —
  // yvon-os + DB rows only; new ventures appear without refresh. 2026-08-26:
  // the scope HUD tabs were removed per operator — venture switching happens
  // by clicking satellite orbs; `scope` remains internal for the events feed.
  const [scope, setScope] = useState("yvon-os");
  const { ventures } = useWorkspace();
  const contexts = ventures as Context[];

  // L3 — one satellite the operator has zoomed into (doc §2.3). null = universe view
  // (core ring + all satellite orbs at once).
  const [openSatellite, setOpenSatellite] = useState<Context | null>(null);
  /* Which venture a card opened straight from the universe view belongs to
     (2026-08-30). Clicking a card in a venture's galaxy used to call the same
     handler as clicking its orb, so it re-opened the whole venture — showing
     the identical cluster again at a different zoom (operator: "why is there
     a clone graph inside the nodes?"). A card must open ITS OWN contents, and
     to do that DetailView needs to know which venture's graph the card came
     from, since `openSatellite` is still null in that path. */
  const [openVenture, setOpenVenture] = useState<{ ctx: Context; mode: "team" | "code" | "none" } | null>(null);
  // Grants (doc §1.3/§3 Q3) — venture_slug → Set<agent_id>, enabled=true only.
  const [grants, setGrants] = useState<Record<string, Set<string>>>({});
  // Mirror for the satellite-open default-mode effect below — reading grants
  // via this ref (rather than putting `grants` in that effect's deps) means
  // a background grants refresh never overwrites a mode the operator already
  // picked by hand; it only informs the decision the FIRST time a satellite
  // opens (2026-08-15).
  const grantsRef = useRef(grants);
  useEffect(() => { grantsRef.current = grants; }, [grants]);

  /* ── Code Graph mode (2026-08-14) ─────────────────────────────────────
     A satellite normally shows "which YVON agents are granted to this
     brand" (ringFor, below). This is a second data source for the same
     ring/detail rendering: a venture's own graphify structural graph
     (venture_graphs.graph_data, migration 120), communities standing in
     for departments and file-nodes for agents — see
     lib/graph/venture-code-graph.ts. Direct Supabase read, not an API
     route: venture_graphs already ships RLS allowing any `authenticated`
     select (migration 118), same trust boundary as the venture_agents
     fetch below. */
  const [codeGraphMode, setCodeGraphMode] = useState(false);
  const [graphDataBySlug, setGraphDataBySlug] = useState<Record<string, RawGraphData | null>>({});
  const [graphDataLoading, setGraphDataLoading] = useState(false);

  // Default mode on open (2026-08-15) — Team mode used to be the unconditional
  // default, which for most ventures today means opening straight into an
  // empty "no agents granted" dead end (nothing has a grants UI to populate
  // it from — until this same change added one, see Settings > Team). Default
  // to whichever mode actually has something to show: Code Graph if this
  // venture has zero granted agents, Team otherwise.
  useEffect(() => {
    // Back to universe: codeGraphMode must not leak into L1's department
    // cards (always real YVON agents, never code nodes) if the operator's
    // last satellite visit happened to leave it true.
    if (!openSatellite) { setCodeGraphMode(false); return; }
    const hasTeam = (grantsRef.current[openSatellite.slug]?.size ?? 0) > 0;
    setCodeGraphMode(!hasTeam);
  }, [openSatellite]);

  useEffect(() => {
    if (!openSatellite || !codeGraphMode) return;
    const slug = openSatellite.slug;
    if (slug in graphDataBySlug) return; // cached (incl. explicit null = "checked, none found")
    let cancelled = false;
    setGraphDataLoading(true);
    supabaseBrowser()
      .from("venture_graphs")
      .select("graph_data")
      .eq("venture_slug", slug)
      .maybeSingle()
      .then(({ data }: { data: { graph_data: RawGraphData | null } | null }) => {
        if (cancelled) return;
        setGraphDataBySlug((prev) => ({ ...prev, [slug]: data?.graph_data ?? null }));
        setGraphDataLoading(false);
      });
    return () => { cancelled = true; };
  }, [openSatellite, codeGraphMode, graphDataBySlug]);

  const [view, setView] = useState({ x: 0, y: 0, s: 0.52 });
  const drag = useRef({ on: false, px: 0, py: 0, id: -1 });
  // Distance-from-mousedown tracker (2026-08-14) — a native click event still
  // fires after a drag-pan (mousedown/mouseup land on the same element
  // regardless of how far the pointer traveled between them), so the
  // background "click empty space to go back" handler below needs its own
  // signal to tell a real click apart from a drag that happened to end where
  // it started. dragStart is the mousedown point; dragMoved flips once total
  // travel crosses a small threshold, checked in the mousemove loop below.
  const dragStart = useRef({ x: 0, y: 0 });
  const dragMoved = useRef(false);
  // Mirror of `view` for reading the latest value inside stable (empty-deps)
  // callbacks — animateView/punchZoom below don't want to be recreated (and
  // re-passed to every card's onClick) every time the user pans/zooms.
  const viewRef = useRef(view);
  useEffect(() => { viewRef.current = view; }, [view]);

  /* ── GSAP zoom-in/out transition (2026-08-14) ────────────────────────
     Requested: "great zooming in animation" on navigation. A full
     coordinate-matched camera move isn't coherent here — L1/L2/L3 each
     recenter their own content on the same CX,CY rather than sharing one
     continuous world space (L2's HUB, for instance, lives in a totally
     different local coordinate system, 0..1900/0..1000, not CX/CY at
     all) — so this is a "zoom breath" cue instead: punch the scale up,
     then ease it back down, right as the view swaps. Consistent, cheap,
     and reads as "diving into the node" without a geometrically-fake pan. */
  const punchZoom = useCallback(() => {
    const proxy = { ...viewRef.current };
    const baseS = proxy.s;
    gsap.killTweensOf(proxy);
    gsap.timeline()
      .to(proxy, {
        s: Math.min(2.2, baseS * 1.18), duration: 0.26, ease: "power2.out",
        onUpdate: () => setView({ x: proxy.x, y: proxy.y, s: proxy.s }),
      })
      .to(proxy, {
        s: baseS, duration: 0.5, ease: "power3.inOut",
        onUpdate: () => setView({ x: proxy.x, y: proxy.y, s: proxy.s }),
      });
  }, []);

  /* ── Real zoom-toward-card camera (2026-08-14, replaces punchZoom for the
     specific "open a card" / "close a card" transitions) ────────────────
     Unlike the level-swap transitions above (satellite open/close, scope
     tabs), L1's department cards and L3's satellite-ring cards live in the
     SAME shared world space as `view` — CX,CY-centered, same transform —
     so a click can drive a genuine directed pan+zoom onto that card's own
     (p.x, p.y), not just a symmetric scale pulse in place. We fly the
     camera in, and only swap to DetailView once the card fills the frame
     (onComplete), so the cut lands inside the zoom instead of interrupting
     it. Closing reverses it: DetailView unmounts, the canvas remounts
     already framed on the zoomed-in shot (view was never reset while
     DetailView was open), then eases back out to the pre-zoom framing
     stashed in preOpenViewRef — "emerging out of the node." */
  const preOpenViewRef = useRef(view);
  const zoomIntoCard = useCallback((p: { x: number; y: number }, andThen: () => void) => {
    const proxy = { ...viewRef.current };
    preOpenViewRef.current = { ...viewRef.current };
    gsap.killTweensOf(proxy);
    const targetS = Math.min(3.6, proxy.s * 3.1);
    const targetX = window.innerWidth / 2 - p.x * targetS;
    const targetY = window.innerHeight / 2 - p.y * targetS;
    gsap.to(proxy, {
      x: targetX, y: targetY, s: targetS, duration: 0.5, ease: "power2.in",
      onUpdate: () => setView({ x: proxy.x, y: proxy.y, s: proxy.s }),
      onComplete: andThen,
    });
  }, []);
  const zoomOutOfCard = useCallback(() => {
    const proxy = { ...viewRef.current };
    const target = preOpenViewRef.current;
    gsap.killTweensOf(proxy);
    gsap.to(proxy, {
      x: target.x, y: target.y, s: target.s, duration: 0.6, ease: "power3.out",
      onUpdate: () => setView({ x: proxy.x, y: proxy.y, s: proxy.s }),
    });
  }, []);

  /* ── Click-empty-space-to-go-back (2026-08-15, replaces the fixed "←"
     buttons) ────────────────────────────────────────────────────────────
     Those buttons sat at a raw viewport offset (top:74/left:28) that, in
     embedded mode, landed on top of the real dashboard's own sidebar and
     blocked its nav links. Operator's ask: no button, click anywhere in
     the open canvas to zoom out a level. `data-yg-card` marks every real
     clickable (cards/orbs) so the ancestor check below only fires on
     genuine background, and dragMoved (tracked in the mousemove loop
     above) filters out the native click a drag-pan still emits when
     mousedown/mouseup land on the same element. */
  const goBackFromSatellite = useCallback((e: React.MouseEvent) => {
    if (dragMoved.current) return;
    if ((e.target as HTMLElement).closest("[data-yg-card]")) return;
    punchZoom();
    setOpenSatellite(null);
    setScope("yvon-os");
    setStatus({});
  }, [punchZoom]);

  useEffect(() => {
    fetch("/structure.json")
      .then((r) => r.json())
      .then((s: Structure) => setStructureDepts(s.departments))
      .catch(() => setStructureDepts([]));
  }, []);

  /* ── Fleet Code Graph (2026-08-27) ────────────────────────────────────
     The complete YVON graph — every module of this repo (Teams, dashboard,
     docs, rag, cli, …), not just the Teams/ org tree. /yvon-graph.json is
     generated from graphify-out/graph.json by scripts/build-code-graph.mjs
     (prebuild + nightly graph-sync); absent file = org tree alone (HUD
     reads 0 MODULES) rather than an error. 2026-08-30: fetched on mount
     and MERGED into the universe ring with the org tree — one venture,
     both graphs, no Fleet/Code Graph tabs (operator). */
  const [fleetGraphData, setFleetGraphData] = useState<RawGraphData | null | undefined>(undefined);
  const [fleetGraphLoading, setFleetGraphLoading] = useState(false);

  useEffect(() => {
    if (fleetGraphData !== undefined) return;
    let cancelled = false;
    setFleetGraphLoading(true);
    fetch("/yvon-graph.json")
      .then((r) => (r.ok ? r.json() : null))
      .then((g: RawGraphData | null) => {
        if (cancelled) return;
        setFleetGraphData(g);
        setFleetGraphLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setFleetGraphData(null);
        setFleetGraphLoading(false);
      });
    return () => { cancelled = true; };
  }, [fleetGraphData]);

  /* ── Fleet links, lazy (2026-08-30) ───────────────────────────────────
     /yvon-graph-links.json (scripts/build-code-graph.mjs) is fetched only
     once a fleet code-module's DetailView actually opens — not on every
     Brain & Wiki load — same reasoning as loadAgentDetails below: the base
     graph payload (nodes) shouldn't grow just because the detail panel now
     resolves "connects to" from the full edge set. Module-scope cache so
     switching between modules never re-fetches. */
  const [fleetLinks, setFleetLinks] = useState<CodeGraphLink[] | null>(null);
  useEffect(() => {
    if (!open || !open.id.startsWith("module-") || fleetLinks) return;
    loadFleetLinks().then(setFleetLinks);
  }, [open, fleetLinks]);

  const codeGraphDepts = useMemo(() => modulesToDepartments(fleetGraphData), [fleetGraphData]);
  // 2026-08-30 — one venture, both graphs (operator): the universe ring is
  // the org tree PLUS the complete repo graph as one merged list — org
  // departments first, then code modules. Code modules keep their `module-`
  // id prefix; isCodeModule (below) is how per-card rendering — cluster
  // counts, no status pip, the code-node detail panel — tells the two apart.
  // Every downstream consumer (layout, deptOf, ringFor, bubbleUp, HUD
  // counts) follows this merged list unchanged.
  const DEPARTMENTS = useMemo(() => [...structureDepts, ...codeGraphDepts], [structureDepts, codeGraphDepts]);
  const isCodeModule = (d: Dept) => d.id.startsWith("module-");

  /* ── L3 grants fetch (doc §3 Q3) ──────────────────────────────────────
     Same browser client + RLS shape as the events Realtime subscription
     (authenticated SELECT, service_role write — migration 111). Empty result
     under an unauthenticated session is expected, not an error — the ring
     for every brand then legitimately renders "no agents granted". */
  useEffect(() => {
    let cancelled = false;
    supabaseBrowser()
      .from("venture_agents")
      .select("venture_slug, agent_id")
      .eq("enabled", true)
      .then(({ data }: { data: { venture_slug: string; agent_id: string }[] | null }) => {
        if (cancelled || !data) return;
        const byVenture: Record<string, Set<string>> = {};
        for (const row of data) {
          (byVenture[row.venture_slug] ??= new Set()).add(row.agent_id);
        }
        setGrants(byVenture);
      });
    return () => { cancelled = true; };
  }, []);

  /* ── Which satellites have a code graph at all (2026-08-30) ────────────
     Operator: Novizio's orb showed "NO AGENTS GRANTED" and looked identical
     to Hourbour's — misleading, since Novizio genuinely has a graphify code
     graph on file (venture_graphs, confirmed via SQL: Novizio has_graph=true,
     Hourbour has_graph=false — both have zero Team grants). The universe-view
     orb only ever checked agentCount (Team grants), never whether there was
     a code graph to fall into instead. Fetches just the slug column — not
     graph_data itself, which can be multiple MB per venture — so this is
     cheap enough to load for every venture up front, unlike the full
     per-venture graph fetch below which stays lazy (only on satellite open). */
  const [codeGraphSlugs, setCodeGraphSlugs] = useState<Set<string>>(new Set());
  useEffect(() => {
    let cancelled = false;
    supabaseBrowser()
      .from("venture_graphs")
      .select("venture_slug")
      .then(({ data }: { data: { venture_slug: string }[] | null }) => {
        if (cancelled || !data) return;
        setCodeGraphSlugs(new Set(data.map((r) => r.venture_slug)));
      });
    return () => { cancelled = true; };
  }, []);

  /* ── Eager per-venture graph fetch, for the universe-view mini-galaxy
     (2026-08-30) ─────────────────────────────────────────────────────────
     Operator: "make Novizio a galaxy next to YVON, not a planet you click
     into" — every venture with real content needs its own mini-ring visible
     directly in the universe view, which means its graph_data has to be on
     hand for ALL such ventures up front, not fetched lazily the first time
     someone opens that one satellite (the existing behavior a few lines
     below, still used for the full zoomed-in L3 view). One batched `.in()`
     query, not N round trips. Kept safe by size: each venture's graph_data
     is typically tiny (Novizio: ~9KB for 108 nodes) — if a venture's graph
     ever grows large enough for this eager load to matter, that's a real
     tradeoff to revisit, not something to guess about now. */
  useEffect(() => {
    const need = [...codeGraphSlugs].filter((slug) => !(slug in graphDataBySlug));
    if (need.length === 0) return;
    let cancelled = false;
    supabaseBrowser()
      .from("venture_graphs")
      .select("venture_slug, graph_data")
      .in("venture_slug", need)
      .then(({ data }: { data: { venture_slug: string; graph_data: RawGraphData | null }[] | null }) => {
        if (cancelled || !data) return;
        setGraphDataBySlug((prev) => {
          const next = { ...prev };
          for (const row of data) next[row.venture_slug] = row.graph_data;
          for (const slug of need) if (!(slug in next)) next[slug] = null;
          return next;
        });
      });
    return () => { cancelled = true; };
  }, [codeGraphSlugs, graphDataBySlug]);

  // agent id → department id, built once per structure (doc §3 Q3 — "never recover the
  // department by string-splitting agent_id"; always join through structure.json).
  const deptOf = useMemo(
    () => new Map(DEPARTMENTS.flatMap((d) => d.agents.map((a): [string, string] => [a.id, d.id]))),
    [DEPARTMENTS],
  );

  // Doc §3 Q3's ringFor, plus §2.3's rendering rule: YVON (kind=core) gets every department,
  // every agent — the full 7/46. A brand gets only departments with ≥1 granted+enabled agent.
  const ringFor = useCallback(
    (slug: string, kind?: Context["kind"]): Dept[] => {
      if (kind === "core") return structureDepts; // core rings stay the real org tree; code modules live only in the universe ring
      const ids = grants[slug] ?? new Set<string>();
      return DEPARTMENTS
        .map((d) => ({ ...d, agents: d.agents.filter((a) => ids.has(a.id)) }))
        .filter((d) => d.agents.length > 0);
    },
    [DEPARTMENTS, grants],
  );

  const ringSummary = useCallback(
    (slug: string) => {
      const r = ringFor(slug);
      return { deptCount: r.length, agentCount: r.reduce((n, d) => n + d.agents.length, 0) };
    },
    [ringFor],
  );

  /* ── Venture leaf source (2026-08-30) ──────────────────────────────────
     What hangs off a venture's trunk: its real departments if it has Team
     grants, else its own graphify clusters, else nothing. Same "whichever is
     alive" rule the L3 Team/Code-Graph default-mode toggle already uses, so
     the universe preview never disagrees with what clicking in shows.
     Sorted biggest-first so the MAX_LEAVES preview cut keeps the most
     substantial clusters and folds the tail into one honest "+N more". */
  const leavesFor = useCallback(
    (slug: string): { depts: Dept[]; mode: "team" | "code" | "none" } => {
      const ctx = contexts.find((c) => c.slug === slug);
      const teamDepts = ringFor(slug, ctx?.kind);
      if (teamDepts.length > 0) return { depts: teamDepts, mode: "team" };
      const gd = graphDataBySlug[slug];
      if (gd) {
        const codeDepts = graphDataToDepartments(gd);
        if (codeDepts.length > 0) {
          return { depts: [...codeDepts].sort((a, b) => Number(b.metric) - Number(a.metric)), mode: "code" };
        }
      }
      return { depts: [], mode: "none" };
    },
    [contexts, ringFor, graphDataBySlug],
  );

  // Layout computed ONCE per structure, from stable sorted ids → never reshuffles.
  // Two Saturn tiers (2026-08-30): org departments on the inner bands, code
  // modules on the outer band — see buildTieredLayout above.
  const { placed } = useMemo(
    () => buildTieredLayout(structureDepts, codeGraphDepts),
    [structureDepts, codeGraphDepts],
  );

  // Venture galaxies — recomputed only when contexts, grants, or a venture's
  // own graph changes, not on every status tick (doc §2.5.1).
  const { galaxies: satellites, upcoming } = useMemo(
    () => buildVentureGalaxies(contexts, ringSummary, leavesFor),
    [contexts, ringSummary, leavesFor],
  );

  // The scoped ring for whichever satellite is currently open — its own filtered department
  // list, re-laid-out with a seed derived from its own slug (doc §2.3).
  // codeGraphMode swaps the source list from grants (ringFor) to this venture's
  // own graphify communities — same buildLayout, different seed suffix so the
  // two modes never share a frozen layout (doc §2.5 layout-stability rule).
  const satelliteRing = useMemo(() => {
    if (!openSatellite) return null;
    if (codeGraphMode) {
      const gd = graphDataBySlug[openSatellite.slug];
      const depts = graphDataToDepartments(gd);
      return buildLayout(depts, seedFromSlug(openSatellite.slug + "-code"));
    }
    const depts = ringFor(openSatellite.slug, openSatellite.kind);
    return buildLayout(depts, seedFromSlug(openSatellite.slug));
  }, [openSatellite, ringFor, codeGraphMode, graphDataBySlug]);

  /* ── Breathing (2026-08-14) — orb + cards + satellite orbs + agent pills
     get a slow, staggered, randomized-phase scale pulse ("life") whenever
     the set of rendered .yg-breathe elements changes (view level, mode
     toggle, satellite switch). gsap.to on a class selector batches every
     current match into one tween group; re-running it on the relevant
     deps below picks up newly mounted elements after React commits them —
     effects fire after the DOM update, so this is never racing the render. */
  useEffect(() => {
    const tw = gsap.to(".yg-breathe", {
      scale: 1.035,
      duration: 2.4,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      stagger: { each: 0.15, from: "random" },
    });
    return () => { tw.kill(); };
  }, [open, openSatellite, codeGraphMode, placed.length, satellites.length, satelliteRing?.placed.length]);

  useEffect(() => {
    setView({ x: window.innerWidth / 2 - CX * 0.52, y: window.innerHeight / 2 - CY * 0.52, s: 0.52 });
  }, []);

  /* ── LIVE ACTIVITY (doc §1.4, §16.2) ────────────────────────────────────
     Browser ⇄ Supabase Realtime directly. Vercel cannot hold a live
     connection. run.completed decays rather than switching off, so the map
     shows *recent* work. */
  useEffect(() => {
    const timers: Record<string, ReturnType<typeof setTimeout>> = {};
    const unsub = supabaseSource(scope).subscribe((e) => {
      setStatus((prev) => applyEvent(prev, e));
      if (e.kind === "run.completed") {
        clearTimeout(timers[e.actor]);
        timers[e.actor] = setTimeout(
          () => setStatus((p) => ({ ...p, [e.actor]: "idle" })),
          DECAY_MS,
        );
      }
    });
    return () => {
      unsub();
      Object.values(timers).forEach(clearTimeout);
    };
  }, [scope]);

  // Departments inherit the strongest state of their agents (doc §16.2).
  const rolled = useMemo(() => bubbleUp(status, DEPARTMENTS), [status, DEPARTMENTS]);

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setView((v) => {
      const f = e.deltaY < 0 ? 1.1 : 1 / 1.1;
      const ns = Math.min(2.2, Math.max(0.16, v.s * f));
      return { s: ns, x: e.clientX - (e.clientX - v.x) * (ns / v.s), y: e.clientY - (e.clientY - v.y) * (ns / v.s) };
    });
  }, []);

  useEffect(() => {
    const mv = (e: PointerEvent) => {
      // Only the pointer that started the drag may pan it (extra touch
      // fingers are ignored, 2026-08-27 pointer-events rewrite).
      if (!drag.current.on || e.pointerId !== drag.current.id) return;
      if (!dragMoved.current && Math.hypot(e.clientX - dragStart.current.x, e.clientY - dragStart.current.y) > 6) {
        dragMoved.current = true;
      }
      // 2026-08-27: capture dx/dy BEFORE advancing the ref. React 18 flushes
      // setState updaters after the native listener returns — reading
      // drag.current.px inside the updater saw the already-advanced value,
      // so every pan computed dx = 0 and the view never moved (zoom worked
      // because its updater reads only its event + v).
      const dx = e.clientX - drag.current.px, dy = e.clientY - drag.current.py;
      drag.current.px = e.clientX; drag.current.py = e.clientY;
      setView((v) => ({ ...v, x: v.x + dx, y: v.y + dy }));
    };
    const up = () => (drag.current.on = false);
    window.addEventListener("pointermove", mv);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", mv);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, []);

  const dim = (name: string) => !!q && !name.toLowerCase().includes(q.toLowerCase());

  // The open venture's aura (atlas separation matrix) — drives L3's cards,
  // spokes and pulses, and the accent DetailView inherits, so a venture's
  // palette carries all the way down instead of stopping at the orb.
  const satAura = openSatellite ? ventureAura(openSatellite) : { color: VIOLET, radius: 16, borderWidth: 1, glow: 0.4 };

  return (
    <div style={embedded ? S.rootEmbedded : S.root}
      onPointerDown={(e) => {
        // 2026-08-27: pointer events replace mouse events for drag-pan —
        // mousedown/mousemove never fire for touch (operator's Windows
        // touchscreen / phone), so the canvas was un-draggable there and a
        // touch drag fell through to native text selection. Pointer events
        // cover mouse + touch + pen uniformly. Drag binds to the ROOT
        // container (2026-08-26) so panning works from anywhere in the
        // canvas; interactive elements (search input, links) keep their own
        // behavior — never start a pan on them.
        if (e.pointerType === "mouse" && e.button !== 0) return; // left button only
        if (!e.isPrimary) return; // ignore extra touch fingers
        if ((e.target as HTMLElement).closest("input, button, a, textarea, select")) return;
        // preventDefault also suppresses the compat mousedown, which is what
        // starts native text selection on desktop (paired with the
        // user-select:none roots above).
        e.preventDefault();
        drag.current = { on: true, px: e.clientX, py: e.clientY, id: e.pointerId };
        dragStart.current = { x: e.clientX, y: e.clientY };
        dragMoved.current = false;
      }}>
      <style>{CSS}</style>

      <div style={{
        ...S.starfield,
        position: embedded ? "absolute" : "fixed",
        backgroundPosition: `${view.x * 0.05}px ${view.y * 0.05}px`,
      }} />

      <div style={{ ...S.hud, position: embedded ? "absolute" : "fixed" }}>
        <div>
          <div style={S.brand}>YVON</div>
          <div style={S.sub}>
            {open ? `${open.name.toUpperCase()} · ${isCodeModule(open) || codeGraphMode ? `${open.metric} FILE NODES` : `${open.agents.length} AGENTS`}`
              : openSatellite && satelliteRing
                ? codeGraphMode
                  ? `${openSatellite.name.toUpperCase()} · CODE GRAPH · ${satelliteRing.placed.length} CLUSTERS · ${satelliteRing.placed.reduce((n, x) => n + x.agents.length, 0)} NODES`
                  : `${openSatellite.name.toUpperCase()} · ${satelliteRing.placed.length} ACTIVE DEPTS · ${satelliteRing.placed.reduce((n, x) => n + x.agents.length, 0)} GRANTED AGENTS`
                : `${structureDepts.length} DEPARTMENTS · ${codeGraphDepts.length} MODULES · ${codeGraphDepts.reduce((n, x) => n + Number(x.metric), 0)} FILE NODES`}
          </div>
        </div>
        {/* 2026-08-26: scope tabs (YVON/HOURBOUR/NOVIZIO) + demo toggle removed
            per operator — venture switching happens by clicking satellite orbs;
            the demo pulse was screenshots-only and never on by default. */}
      </div>

      {!open && !openSatellite && (
        <input style={{ ...S.search, position: embedded ? "absolute" : "fixed" }} placeholder="Search departments…" value={q}
          onChange={(e) => setQ(e.target.value)} />
      )}
      {/* Back navigation (2026-08-15 rewrite) — was a fixed-position button
          top-left; in embedded mode that sat at a raw viewport offset that
          landed on top of the dashboard's own sidebar, blocking its nav
          links (reported: "sidebar tabs not work"). Replaced per operator
          request: click empty space anywhere in the canvas to zoom out a
          level, no button. See the stage onClick handlers below (L3) and
          DetailView's onBack (L2). */}

      {/* Team / Code Graph toggle (2026-08-14) — same satellite, two data
          sources: YVON agents granted to this brand, vs. this brand's own
          graphify structural graph (lib/graph/venture-code-graph.ts).
          2026-08-30: the universe view's Fleet/Code Graph tabs are gone —
          both graphs are merged into one ring there (see DEPARTMENTS). */}
      {openSatellite && !open && (
        <div style={{ ...S.modeToggle, position: embedded ? "absolute" : "fixed" }}>
          <button style={{ ...S.tab, ...(!codeGraphMode ? S.tabOn : {}) }}
            onClick={() => setCodeGraphMode(false)}>Team</button>
          <button style={{ ...S.tab, ...(codeGraphMode ? S.tabOn : {}) }}
            onClick={() => setCodeGraphMode(true)}>Code Graph</button>
        </div>
      )}

      {/* ══ LEVEL 1 — universe: core ring + every satellite at once (doc §2.3) ══ */}
      {!open && !openSatellite && (
        <div style={S.stage} onWheel={onWheel}
          onPointerDown={(e) => {
            if (e.pointerType === "mouse" && e.button !== 0) return;
            if (!e.isPrimary) return;
            e.preventDefault(); // see root handler note (2026-08-27) — stops text selection on drag
            drag.current = { on: true, px: e.clientX, py: e.clientY, id: e.pointerId };
            dragStart.current = { x: e.clientX, y: e.clientY };
            dragMoved.current = false;
          }}>
          <div style={{ position: "absolute", transformOrigin: "0 0",
            transform: `translate(${view.x}px,${view.y}px) scale(${view.s})` }}>

            <svg style={{ position: "absolute", overflow: "visible", pointerEvents: "none" }} width={3600} height={2400}>
              <defs>
                {/* Galaxy bridge gradients (2026-08-30, operator: "the bridge...
                    glowing in gradient of mixing colors of both ventures") —
                    one per satellite, core violet fading into that venture's
                    own aura color, in real world-space coordinates (userSpaceOnUse)
                    so the blend actually runs along the true CX,CY→orb line. */}
                {satellites.map((s) => (
                  <linearGradient key={"grad-" + s.ctx.slug} id={"sat-grad-" + s.ctx.slug}
                    gradientUnits="userSpaceOnUse" x1={CX} y1={CY} x2={s.x} y2={s.y}>
                    <stop offset="0%" stopColor={VIOLET} stopOpacity={0.55} />
                    <stop offset="100%" stopColor={s.ctx.color} stopOpacity={0.85} />
                  </linearGradient>
                ))}
              </defs>
              {[300, 400, 500, 620].map((r, i) => (
                <ellipse key={r} cx={CX} cy={CY} rx={r * 1.45} ry={r * 0.99} fill="none"
                  stroke={`rgba(255,255,255,${0.038 - i * 0.006})`} strokeWidth={1} />
              ))}
              {/* Local star cluster removed (2026-08-14) — the global starfield
                  below now covers the whole box; this array visibly "clumped"
                  around the orb and dragged with it as one group when panning,
                  which read as a bounded blob rather than open space. */}
              {placed.map((p) => (
                <line key={p.id} x1={CX} y1={CY} x2={p.x} y2={p.y}
                  stroke={isCodeModule(p) ? "rgba(140,225,235,0.30)" : "rgba(200,195,255,0.34)"} strokeWidth={1.8}
                  style={{ filter: `drop-shadow(0 0 3px ${isCodeModule(p) ? "rgba(140,225,235,.3)" : "rgba(180,170,255,.35)"})` }} />
              ))}
              {/* Trunk — core → venture hub, a smooth horizontal branch
                  carrying the gradient bridge (YVON's violet blending into
                  the venture's own palette, per the matrix's shared-core /
                  exclusive-venture split). Curve, not a straight spoke, so it
                  reads as a branch growing out of the core rather than one
                  more radial line. */}
              {satellites.map((s) => {
                const midX = (CX + s.x) / 2;
                return (
                  <path key={"trunk-" + s.ctx.slug} id={`trunk-path-${s.ctx.slug}`}
                    d={`M ${CX} ${CY} C ${midX} ${CY}, ${midX} ${s.y}, ${s.x} ${s.y}`}
                    fill="none" stroke={`url(#sat-grad-${s.ctx.slug})`} strokeWidth={3.2}
                    style={{ filter: `drop-shadow(0 0 5px ${s.ctx.color}88)` }} />
                );
              })}
              {/* Cluster spokes — venture hub → each of its cards, exactly
                  like YVON's own straight department spokes (the sketch's
                  venture clusters mirror the core's shape), in that venture's
                  OWN palette (matrix: palette exclusive throughout the
                  subtree, branch lines included). */}
              {satellites.flatMap((s) => s.leaves.map((lf) => (
                <line key={"spoke-" + s.ctx.slug + "-" + lf.id}
                  x1={s.x} y1={s.y}
                  x2={s.x + lf.x * VENTURE_SCALE} y2={s.y + lf.y * VENTURE_SCALE}
                  stroke={`${s.ctx.color}b3`} strokeWidth={2}
                  style={{ filter: `drop-shadow(0 0 6px ${s.ctx.color}) drop-shadow(0 0 12px ${s.ctx.color}80)` }} />
              )))}
              {/* Travelling pulses on the venture spokes — the universe view's
                  core spokes have carried these since 2026-08-14; venture
                  galaxies were drawn without them, which is what made their
                  lines read as flat/unlit next to YVON's (operator: the glow
                  was wanted here, in the main space where all venture graphs
                  live). Stable per-index timing, same as the core's. */}
              {satellites.flatMap((s) => s.leaves.map((lf, i) => (
                <NerveLinePulse key={"spulse-" + s.ctx.slug + "-" + lf.id}
                  x1={s.x} y1={s.y}
                  x2={s.x + lf.x * VENTURE_SCALE} y2={s.y + lf.y * VENTURE_SCALE}
                  color={s.ctx.color} duration={2.5 + (i % 4) * 0.35} delay={(i % 7) * 0.22} />
              )))}
              {/* Upcoming branch — the sketch's third arc. Dashed + unlabelled
                  by palette because these ventures have no content to colour. */}
              {upcoming && (
                <path d={`M ${CX} ${CY} C ${(CX + upcoming.x) / 2} ${CY}, ${(CX + upcoming.x) / 2} ${upcoming.y}, ${upcoming.x} ${upcoming.y}`}
                  fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth={2} strokeDasharray="6 8" />
              )}
              {satellites.flatMap((s) => s.children.map((c) => (
                <line key={"sub-edge-" + c.ctx.slug} x1={s.x} y1={s.y} x2={c.x} y2={c.y}
                  stroke={`${s.ctx.color}70`} strokeWidth={1.4} strokeDasharray="1.5 4" />
              )))}
              {/* Nerve pulses (2026-08-14) — traveling dots along every spoke/edge above,
                  "info flowing along a nerve." Stable per-index timing (not Math.random() at
                  render time) so status/activity re-renders don't reset them mid-flight. */}
              {placed.map((p, i) => (
                <NerveLinePulse key={"pulse-dept-" + p.id} x1={CX} y1={CY} x2={p.x} y2={p.y}
                  color={isCodeModule(p) ? "rgba(140,225,235,.85)" : "rgba(190,180,255,.85)"} duration={2.6 + (i % 4) * 0.35} delay={(i % 7) * 0.22} />
              ))}
              {/* Trunk pulse — rides the real curved trunk path (id above)
                  rather than a straight lerp, so the dot tracks the branch. */}
              {satellites.map((s, i) => (
                <NervePathPulse key={"pulse-sat-" + s.ctx.slug} pathId={`trunk-path-${s.ctx.slug}`}
                  color={`${s.ctx.color}e6`} duration={3.2 + (i % 3) * 0.4} delay={(i % 5) * 0.3} />
              ))}
            </svg>

            <div data-yg-card="1" style={{ ...S.orbWrap, left: CX, top: CY }}>
              <div style={S.orbGlow} />
              <div className="yg-breathe" style={S.orbBody}>
                <div style={S.orbSheen} />
                <span style={S.orbLabel}>YVON</span>
              </div>
            </div>

            {placed.length === 0 && fleetGraphLoading && (
              <div style={{ ...S.satEmptyNote, left: CX, top: CY + 260 }}>
                Loading the YVON graph…
              </div>
            )}
            {placed.length === 0 && !fleetGraphLoading && (
              <div style={{ ...S.satEmptyNote, left: CX, top: CY + 260 }}>
                No structure or code-graph data — run scripts/build-structure.mjs and scripts/build-code-graph.mjs.
              </div>
            )}

            {placed.map((p) => {
              const st = rolled[p.id] ?? "idle";
              const cg = isCodeModule(p);
              return (
                <div key={p.id} data-yg-card="1" onClick={() => zoomIntoCard(p, () => setOpen(p))}
                  style={{ ...S.deptCardPos, ...(cg ? S.codeCardPos : {}), left: p.x, top: p.y, opacity: dim(p.name) ? 0.2 : 1 }}>
                  <div className="yg-breathe" style={cg ? S.codeCard : S.deptCard}>
                    <div style={S.deptHead}>
                      <span style={S.codeHead}>
                        {cg && <span style={S.codeGlyph}>{"</>"}</span>}
                        <span style={cg ? S.codeName : S.deptName}>{p.name}</span>
                      </span>
                      {!cg && <Pip status={st} />}
                    </div>
                    <div style={cg ? S.codeBigNum : S.bigNum}>{p.metric}</div>
                    <div style={cg ? { ...S.numLabel, color: "#7fc9d4" } : S.numLabel}>{cg ? "FILES" : p.metricLabel}</div>
                    {!cg && (
                      <div style={S.sparkRow}>
                        {p.bars.map((h, i) => (
                          <i key={i} style={{ flex: 1, height: `${h}%`, background: "rgba(255,255,255,.32)", borderRadius: 0.5 }} />
                        ))}
                      </div>
                    )}
                    <div style={S.deptFoot}>{p.agents.length} {cg ? "CLUSTERS" : "AGENTS"}</div>
                  </div>
                </div>
              );
            })}

            {/* ══ Venture trees (2026-08-30) ══
                Each venture is a horizontal branch off the core: hub orb, then
                its real departments/clusters as leaves. Every visual below
                resolves through ventureAura() — atlas's approved separation
                matrix — so a venture's palette, card silhouette and halo are
                its own throughout its subtree. The bug this replaces: leaves
                rendered with the hardcoded cyan code-card style, so every
                venture inherited YVON's look and its own color never showed. */}
            {satellites.map((s) => {
              const aura = ventureAura(s.ctx);
              const noTeam = s.agentCount === 0;
              const hasGraph = codeGraphSlugs.has(s.ctx.slug);
              const trulyEmpty = s.mode === "none" && !hasGraph;
              const alive = !trulyEmpty;
              const isCode = s.mode === "code";
              const openThis = () => {
                punchZoom();
                setOpenSatellite(s.ctx); setScope(s.ctx.contextPath ?? s.ctx.slug); setStatus({});
              };
              return (
                <React.Fragment key={s.ctx.slug}>
                  {/* Hub — halo intensity is matrix-exclusive per venture */}
                  <div data-yg-card="1" onClick={openThis}
                    style={{ ...S.satOrbPos, left: s.x, top: s.y, width: s.r * 2, height: s.r * 2, opacity: alive ? 1 : 0.55 }}>
                    {alive && (
                      <div style={{
                        position: "absolute", inset: -s.r * 0.9, borderRadius: "50%", pointerEvents: "none",
                        background: `radial-gradient(circle, ${aura.color}${Math.round(aura.glow * 255).toString(16).padStart(2, "0")} 0%, transparent 70%)`,
                        filter: "blur(14px)",
                      }} />
                    )}
                    <div className="yg-breathe" style={{
                      ...S.satOrbInner,
                      borderWidth: aura.borderWidth,
                      borderColor: alive ? `${aura.color}88` : "rgba(255,255,255,.14)",
                      background: alive
                        ? `radial-gradient(circle at 36% 30%, ${aura.color}66, ${aura.color}1f 60%, transparent 100%)`
                        : "rgba(255,255,255,.03)",
                    }}>
                      {isCode && <span style={{ ...S.satCodeBadge, color: aura.color }}>{"</>"}</span>}
                      <span style={S.satLabel}>{s.ctx.name}</span>
                      <span style={{ ...S.satSub, color: alive ? `${aura.color}dd` : "#9aa0a8" }}>
                        {trulyEmpty ? "NO AGENTS GRANTED"
                          : noTeam ? `${s.leaves.length ? s.deptCount || s.leaves.length : 0} CLUSTERS · CODE GRAPH`
                          : `${s.deptCount} DEPT · ${s.agentCount} AGENTS`}
                      </span>
                    </div>
                  </div>

                  {s.children.map((c) => {
                    const cAura = ventureAura(c.ctx);
                    return (
                      <div key={c.ctx.slug} data-yg-card="1"
                        onClick={() => {
                          punchZoom();
                          setOpenSatellite(c.ctx); setScope(c.ctx.contextPath ?? c.ctx.slug); setStatus({});
                        }}
                        style={{ ...S.satOrbPos, left: c.x, top: c.y, width: c.r * 2, height: c.r * 2, opacity: 0.92 }}>
                        <div className="yg-breathe" style={{
                          ...S.satOrbInner, ...S.satChild,
                          borderWidth: cAura.borderWidth,
                          borderColor: `${cAura.color}88`, background: `${cAura.color}30`,
                        }}>
                          <span style={S.satLabelSm}>{c.ctx.name}</span>
                        </div>
                      </div>
                    );
                  })}

                  {/* Leaves — same card anatomy as YVON's own department cards
                      (operator: "keep the original design as resemblance to
                      yvon"), but wearing this venture's exclusive palette and
                      silhouette instead of the core's or the code-cyan. */}
                  {s.leaves.map((lf) => (
                    <div key={"leaf-" + s.ctx.slug + "-" + lf.id} data-yg-card="1"
                      onClick={() => {
                        // "+N more" means "show me the rest" → open the venture.
                        // Any real card opens ITS OWN contents, not the venture
                        // again (that re-showed the same cluster — the "clone").
                        if (lf.more) { openThis(); return; }
                        const card: Placed = {
                          ...lf,
                          x: s.x + lf.x * VENTURE_SCALE,
                          y: s.y + lf.y * VENTURE_SCALE,
                        };
                        setOpenVenture({ ctx: s.ctx, mode: s.mode });
                        zoomIntoCard(card, () => setOpen(card));
                      }}
                      style={{
                        ...S.deptCardPos,
                        left: s.x + lf.x * VENTURE_SCALE,
                        top: s.y + lf.y * VENTURE_SCALE,
                        transform: `translate(-50%,-50%) scale(${VENTURE_SCALE})`,
                      }}>
                      <div className="yg-breathe" style={{
                        ...S.deptCard,
                        borderRadius: aura.radius,
                        border: `${aura.borderWidth}px solid ${aura.color}4d`,
                        background: `linear-gradient(160deg, ${aura.color}1a, rgba(12,12,16,.72) 62%)`,
                        boxShadow: `0 10px 30px rgba(0,0,0,.45), inset 0 1px 0 ${aura.color}26`,
                      }}>
                        <div style={S.deptHead}>
                          <span style={S.codeHead}>
                            {isCode && <span style={{ ...S.codeGlyph, color: aura.color }}>{"</>"}</span>}
                            <span style={S.deptName}>{lf.name}</span>
                          </span>
                        </div>
                        <div style={{ ...S.bigNum, color: aura.color }}>{lf.metric}</div>
                        <div style={{ ...S.numLabel, color: `${aura.color}b3` }}>
                          {lf.more ? lf.metricLabel : isCode ? "FILES" : lf.metricLabel}
                        </div>
                        {!lf.more && (
                          <div style={S.sparkRow}>
                            {lf.bars.map((h, i) => (
                              <i key={i} style={{ flex: 1, height: `${h}%`, background: `${aura.color}59`, borderRadius: 0.5 }} />
                            ))}
                          </div>
                        )}
                        <div style={S.deptFoot}>
                          {lf.more ? "OPEN TO SEE ALL" : `${lf.agents.length} ${isCode ? "NODES" : "AGENTS"}`}
                        </div>
                      </div>
                    </div>
                  ))}
                </React.Fragment>
              );
            })}

            {/* Upcoming — ventures registered in `ventures` but with nothing
                behind them yet (no repo, no graph, no agents, no knowledge).
                They get a placeholder here instead of a fabricated galaxy, so
                the map never implies content that does not exist. Clicking
                still opens the venture, which shows its real empty state. */}
            {upcoming && (
              <div style={{ ...S.satOrbPos, left: upcoming.x, top: upcoming.y, width: 210, height: 210 }}>
                <div style={S.upcomingBox}>
                  <span style={S.upcomingTitle}>UPCOMING</span>
                  {upcoming.ctxs.map((c) => (
                    <button key={c.slug} data-yg-card="1" style={S.upcomingChip}
                      onClick={() => {
                        punchZoom();
                        setOpenSatellite(c); setScope(c.contextPath ?? c.slug); setStatus({});
                      }}>
                      {c.name}
                    </button>
                  ))}
                  <span style={S.upcomingNote}>no repo or graph yet</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══ LEVEL 3 — one satellite's scoped ring: active departments, granted agents only ══ */}
      {openSatellite && !open && satelliteRing && (
        <div style={S.stage} onWheel={onWheel} onClick={goBackFromSatellite}
          onPointerDown={(e) => {
            if (e.pointerType === "mouse" && e.button !== 0) return;
            if (!e.isPrimary) return;
            e.preventDefault(); // see root handler note (2026-08-27) — stops text selection on drag
            drag.current = { on: true, px: e.clientX, py: e.clientY, id: e.pointerId };
            dragStart.current = { x: e.clientX, y: e.clientY };
            dragMoved.current = false;
          }}>
          <div style={{ position: "absolute", transformOrigin: "0 0",
            transform: `translate(${view.x}px,${view.y}px) scale(${view.s})` }}>

            <svg style={{ position: "absolute", overflow: "visible", pointerEvents: "none" }} width={3600} height={2400}>
              {/* Local star cluster removed here too — see L1 note above. */}
              {satelliteRing.placed.map((p) => (
                <line key={p.id} x1={CX} y1={CY} x2={p.x} y2={p.y}
                  stroke={`${satAura.color}6b`} strokeWidth={2}
                  style={{ filter: `drop-shadow(0 0 5px ${satAura.color}99)` }} />
              ))}
              {satelliteRing.placed.map((p, i) => (
                <NerveLinePulse key={"pulse-" + p.id} x1={CX} y1={CY} x2={p.x} y2={p.y}
                  color={`${satAura.color}e6`}
                  duration={2.4 + (i % 4) * 0.35} delay={(i % 7) * 0.22} />
              ))}
            </svg>

            <div data-yg-card="1" style={{ ...S.orbWrap, left: CX, top: CY }}>
              <div style={{ ...S.orbGlow, background: `radial-gradient(circle, ${openSatellite.color}30 0%, ${openSatellite.color}0d 40%, transparent 70%)` }} />
              <div className="yg-breathe" style={{ ...S.orbBody, background: `radial-gradient(circle at 36% 30%, ${openSatellite.color}dd 0%, ${openSatellite.color}99 48%, ${openSatellite.color}55 100%)` }}>
                <div style={S.orbSheen} />
                <span style={S.orbLabel}>{openSatellite.name.toUpperCase()}</span>
              </div>
            </div>

            {satelliteRing.placed.length === 0 && codeGraphMode && graphDataLoading && (
              <div style={{ ...S.satEmptyNote, left: CX, top: CY + 260 }}>
                Loading {openSatellite.name}&rsquo;s code graph…
              </div>
            )}
            {satelliteRing.placed.length === 0 && codeGraphMode && !graphDataLoading && (
              <div style={{ ...S.satEmptyNote, left: CX, top: CY + 260 }}>
                No code graph built for {openSatellite.name} yet — trigger a build from Settings → Technical.
              </div>
            )}
            {satelliteRing.placed.length === 0 && !codeGraphMode && (
              <div style={{ ...S.satEmptyNote, left: CX, top: CY + 260 }}>
                No agents granted to {openSatellite.name} yet — grant access in Settings.
              </div>
            )}

            {/* Cards wear THIS venture's aura (atlas separation matrix —
                palette is exclusive and must appear throughout the venture's
                subtree). Previously hardcoded to the generic dept card + cyan
                spokes, so a venture's own colour never reached this view. */}
            {satelliteRing.placed.map((p) => {
              const st = rolled[p.id] ?? "idle";
              return (
                <div key={p.id} data-yg-card="1" onClick={() => zoomIntoCard(p, () => setOpen(p))}
                  style={{ ...S.deptCardPos, left: p.x, top: p.y, opacity: dim(p.name) ? 0.2 : 1 }}>
                  <div className="yg-breathe" style={{
                    ...S.deptCard,
                    borderRadius: satAura.radius,
                    border: `${satAura.borderWidth}px solid ${satAura.color}4d`,
                    background: `linear-gradient(160deg, ${satAura.color}1a, rgba(12,12,16,.72) 62%)`,
                    boxShadow: `0 10px 30px rgba(0,0,0,.45), inset 0 1px 0 ${satAura.color}26`,
                  }}>
                    <div style={S.deptHead}>
                      <span style={S.deptName}>{p.name}</span>
                      {!codeGraphMode && <Pip status={st} />}
                    </div>
                    <div style={{ ...S.bigNum, color: satAura.color }}>{p.agents.length}</div>
                    <div style={{ ...S.numLabel, color: `${satAura.color}b3` }}>
                      {codeGraphMode ? "FILE NODES" : "GRANTED AGENTS"}
                    </div>
                    <div style={S.sparkRow}>
                      {p.bars.map((h, i) => (
                        <i key={i} style={{ flex: 1, height: `${h}%`, background: `${satAura.color}59`, borderRadius: 0.5 }} />
                      ))}
                    </div>
                    {/* Footer repeated the same count the big numeral already
                        shows ("15 FILE NODES" then "15 NODES"); it now carries
                        the action instead of restating the metric. */}
                    <div style={S.deptFoot}>OPEN</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══ LEVEL 2 ══
          Three ways a card gets here, each needing a different graph source:
            · a fleet code module (isCodeModule)      → the fleet graph
            · a card inside an opened satellite (L3)  → that satellite's graph
            · a card clicked straight from a venture galaxy in the universe
              view (openVenture) → that venture's graph, with openSatellite
              still null. That third path is new (2026-08-30); without it the
              card had no graph to resolve against, which is why it used to
              just re-open the whole venture instead. */}
      {open && (() => {
        const vSlug = openSatellite?.slug ?? openVenture?.ctx.slug;
        const vGraph = vSlug ? graphDataBySlug[vSlug] : null;
        const inVentureCode = openVenture?.mode === "code";
        const accentCtx = openSatellite ?? openVenture?.ctx ?? null;
        return (
          <DetailView dept={open} status={rolled} embedded={embedded}
            codeGraphMode={isCodeModule(open) || codeGraphMode || inVentureCode}
            accent={accentCtx ? ventureAura(accentCtx).color : VIOLET}
            graphLinks={
              isCodeModule(open) ? (fleetLinks ?? undefined)
                : (codeGraphMode || inVentureCode) ? vGraph?.links
                : undefined
            }
            graphNodes={
              isCodeModule(open) ? fleetGraphData?.nodes
                : (codeGraphMode || inVentureCode) ? vGraph?.nodes
                : undefined
            }
            onBack={() => { zoomOutOfCard(); setOpen(null); setOpenVenture(null); }} />
        );
      })()}

      <div style={{ ...S.legend, position: embedded ? "absolute" : "fixed" }}>
        {([["ACTIVE", MINT], ["ERROR", CORAL], ["IDLE", "#5a5f68"], ["CORE", VIOLET]] as [string, string][]).map(([l, c]) => (
          <div key={l} style={S.lg}>
            <i style={{ width: 7, height: 7, borderRadius: "50%", background: c, display: "block" }} />{l}
          </div>
        ))}
      </div>
      {!open && (
        <div style={{ ...S.hint, position: embedded ? "absolute" : "fixed" }}>
          CLICK A DEPARTMENT · SCROLL TO ZOOM · DRAG TO PAN · CLICK EMPTY SPACE TO GO BACK
        </div>
      )}
      <div style={{ ...S.vig, position: embedded ? "absolute" : "fixed" }} />
    </div>
  );
}

/* ══ DETAIL VIEW ══ */
function DetailView({ dept, status, embedded, codeGraphMode, graphLinks, graphNodes, accent = VIOLET, onBack }: {
  dept: Dept; status: Record<string, Status>; embedded: boolean; codeGraphMode: boolean;
  graphLinks?: CodeGraphLink[]; graphNodes?: CodeGraphNode[]; accent?: string; onBack: () => void;
}) {
  const n = dept.agents.length;
  const nodesById = useMemo(() => buildNodesById(graphNodes), [graphNodes]);

  /* ── row layout (2026-08-14 rewrite) ──────────────────────────────────
     Old formula (`Math.min(94, 720/n)`) let rowH shrink below the pill's
     actual rendered height once a department passed ~9-10 agents, so
     cards started touching/overlapping. Fix: enforce a real minimum row
     height, and once a single column can no longer fit everyone inside
     the usable vertical band, fan out into a second column instead of
     letting rows compress further. */
  const AVAIL_TOP = 40, AVAIL_BOTTOM = 960;
  const AVAIL_H = AVAIL_BOTTOM - AVAIL_TOP;
  const MIN_ROW_H = 74;
  const cols = n > 0 ? Math.max(1, Math.ceil((n * MIN_ROW_H) / AVAIL_H)) : 1;
  const perCol = Math.ceil(n / cols);
  const COL_GAP = 300;

  const rows = dept.agents.map((a, i) => {
    const col = Math.floor(i / perCol);
    const idxInCol = i - col * perCol;
    const countInCol = Math.min(perCol, n - col * perCol);
    const rowH = countInCol > 1 ? Math.min(96, AVAIL_H / countInCol) : 0;
    const colStartY = AVAIL_TOP + (AVAIL_H - (countInCol - 1) * rowH) / 2;
    const t = countInCol > 1 ? idxInCol / (countInCol - 1) : 0.5;
    const bow = Math.sin(t * Math.PI) * 78;
    return { ...a, x: 1120 + col * COL_GAP + bow, y: colStartY + idxInCol * rowH };
  });

  // Team mode's HUB sits right-of-center with the summary card at
  // DEPT_ANCHOR to its left (the original right-side fan). codeGraphMode
  // (2026-08-30, operator: "main card... should always be on center, other
  // should orbit around it") uses a dead-center hub instead, in the SAME
  // 1900×1000 viewBox — the "planet" summary card renders exactly there
  // (see detailDept position below), so orbit cards genuinely surround it on
  // every side rather than fanning off to one edge.
  const HUB = codeGraphMode ? { x: 950, y: 500 } : { x: 880, y: 500 };
  // Anchor for the department summary card in Team mode only.
  const DEPT_ANCHOR = { x: 470, y: 500 };

  // Code-graph fan (2026-08-30) — scattered-disc orbit instead of the column
  // fan above; see buildOrbitLayout's doc comment. Team mode (codeGraphMode
  // false) never computes this — `rows` above is untouched.
  const orbit = useMemo(
    () => (codeGraphMode ? buildOrbitLayout(dept.agents, HUB, seedFromSlug(dept.id)) : { placed: [] }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [codeGraphMode, dept],
  );
  const orbitRows = orbit.placed;
  const fanRows: (Agent & { x: number; y: number })[] = codeGraphMode ? orbitRows : rows;

  const activeRows = rows.filter((r) => (status[r.id] ?? "idle") === "active");
  const [selected, setSelected] = useState<Agent | null>(null);
  useEffect(() => { setSelected(null); }, [dept.id]);

  // Entrance animation (2026-08-14) — the whole view fades/scales in on mount,
  // then agent pills stagger in behind it. Runs once per dept.id (a new
  // DetailView instance per department since it's swapped in/out by the
  // parent, not re-parented — dept.id is enough to key a fresh mount).
  const stageRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(stageRef.current, { opacity: 0, scale: 0.94 }, { opacity: 1, scale: 1, duration: 0.5, ease: "power3.out" });
      gsap.fromTo(".yg-agent-pill", { opacity: 0, x: -18 }, { opacity: 1, x: 0, duration: 0.4, delay: 0.12, stagger: 0.045, ease: "power2.out" });
    }, stageRef);
    return () => ctx.revert();
  }, [dept.id]);

  /* ── Code-graph pan/zoom camera (2026-08-30) ─────────────────────────
     The old static frame assumed ≤11 real agents fanned to the right; a
     code cluster can have hundreds of orbit cards across many rings (see
     buildOrbitLayout above), so codeGraphMode gets its own small camera —
     same wheel-zoom / drag-pan pattern the universe view already uses.
     Team mode's `dView` never leaves identity, so its frame is unchanged. */
  const [dView, setDView] = useState({ x: 0, y: 0, s: 1 });
  const dDrag = useRef({ on: false, px: 0, py: 0 });
  const dDragStart = useRef({ x: 0, y: 0 });
  const dDragMoved = useRef(false);

  // Start zoomed out further the more nodes there are, so a big cluster
  // opens with its outer rings already in view instead of needing an
  // immediate manual zoom-out.
  useEffect(() => {
    if (!codeGraphMode) { setDView({ x: 0, y: 0, s: 1 }); return; }
    const initS = n > 220 ? 0.3 : n > 120 ? 0.4 : n > 50 ? 0.55 : n > 20 ? 0.75 : 1;
    setDView({ x: 0, y: 0, s: initS });
  }, [dept.id, codeGraphMode, n]);

  const onDWheel = useCallback((e: React.WheelEvent) => {
    if (!codeGraphMode) return;
    e.preventDefault();
    setDView((v) => {
      const f = e.deltaY < 0 ? 1.1 : 1 / 1.1;
      const ns = Math.min(2.4, Math.max(0.18, v.s * f));
      return { s: ns, x: e.clientX - (e.clientX - v.x) * (ns / v.s), y: e.clientY - (e.clientY - v.y) * (ns / v.s) };
    });
  }, [codeGraphMode]);

  useEffect(() => {
    if (!codeGraphMode) return;
    const mv = (e: PointerEvent) => {
      if (!dDrag.current.on) return;
      if (!dDragMoved.current && Math.hypot(e.clientX - dDragStart.current.x, e.clientY - dDragStart.current.y) > 6) {
        dDragMoved.current = true;
      }
      const dx = e.clientX - dDrag.current.px, dy = e.clientY - dDrag.current.py;
      dDrag.current.px = e.clientX; dDrag.current.py = e.clientY;
      setDView((v) => ({ ...v, x: v.x + dx, y: v.y + dy }));
    };
    const up = () => { dDrag.current.on = false; };
    window.addEventListener("pointermove", mv);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", mv);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [codeGraphMode]);

  const handleStagePointerDown = (e: React.PointerEvent) => {
    if (!codeGraphMode) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if (!e.isPrimary) return;
    if ((e.target as HTMLElement).closest("[data-yg-card]")) return;
    e.preventDefault();
    dDrag.current = { on: true, px: e.clientX, py: e.clientY };
    dDragStart.current = { x: e.clientX, y: e.clientY };
    dDragMoved.current = false;
  };

  // Click empty space to go back (2026-08-15) — same convention as L1/L3's
  // stage handler. codeGraphMode's drag-pan (above) needs the same
  // drag-vs-click disambiguation the root canvas uses, or every pan would
  // also fire a spurious "go back". A click while the agent panel is open
  // closes the panel first (one level of "back" at a time) rather than
  // jumping straight out of the department.
  const handleStageClick = (e: React.MouseEvent) => {
    if (codeGraphMode && dDragMoved.current) return;
    if ((e.target as HTMLElement).closest("[data-yg-card]")) return;
    if (selected) { setSelected(null); return; }
    onBack();
  };

  return (
    <div ref={stageRef} style={S.detailStage} onClick={handleStageClick}
      onWheel={onDWheel} onPointerDown={handleStagePointerDown}>
      <div style={S.edgeGlow} />

      <div style={{
        position: "absolute", inset: 0, transformOrigin: "50% 50%",
        transform: codeGraphMode ? `translate(${dView.x}px,${dView.y}px) scale(${dView.s})` : undefined,
      }}>

      <svg style={S.detailSvg} viewBox="0 0 1900 1000" preserveAspectRatio="xMidYMid slice">
        {Array.from({ length: 70 }).map((_, i) => {
          const r = rngFrom(9000 + i * 37);
          const x = 250 + r() * 720, y = 50 + r() * 900;
          return <circle key={i} cx={x} cy={y} r={3 + r() * 6.5} fill={`rgba(210,216,228,${0.14 + r() * 0.32})`} />;
        })}

        {/* Trunk connector — dept summary card into HUB, Team mode only.
            codeGraphMode's summary card sits exactly AT the hub (see
            detailDept below), so there's nothing to connect. */}
        {!codeGraphMode && (
          <path d={`M ${DEPT_ANCHOR.x + 165} ${DEPT_ANCHOR.y} L ${HUB.x - 4} ${HUB.y}`}
            stroke="rgba(190,195,210,.55)" strokeWidth={2.4}
            style={{ filter: "drop-shadow(0 0 5px rgba(190,195,210,.4))" }} />
        )}

        {/* HUB → node connectors — a straight spoke for the orbit fan
            (any-direction radial layout), the original curved bezier for
            Team mode's right-side column fan. */}
        {fanRows.map((r) => {
          const on = !codeGraphMode && (status[r.id] ?? "idle") === "active";
          return (
            <path key={r.id} id={`nerve-hub-${r.id}`}
              d={codeGraphMode
                ? `M ${HUB.x} ${HUB.y} L ${r.x} ${r.y}`
                : `M ${HUB.x} ${HUB.y} C ${HUB.x + 120} ${HUB.y}, ${r.x - 160} ${r.y}, ${r.x - 20} ${r.y}`}
              fill="none"
              stroke={on ? "rgba(140,225,235,.65)" : codeGraphMode ? "rgba(140,225,235,.28)" : "rgba(190,195,210,.4)"}
              strokeWidth={on ? 2.2 : codeGraphMode ? 1.1 : 1.6}
              style={{ filter: on ? "drop-shadow(0 0 6px rgba(140,225,235,.6))" : "drop-shadow(0 0 2.5px rgba(190,195,210,.3))" }} />
          );
        })}

        {!codeGraphMode && activeRows.map((r, i) => {
          const nx = activeRows[i + 1];
          if (!nx) return null;
          const mx = Math.max(r.x, nx.x) + 220;
          return (
            <path key={"arc" + r.id}
              d={`M ${r.x + 195} ${r.y} C ${mx} ${r.y}, ${mx} ${nx.y}, ${nx.x + 195} ${nx.y}`}
              fill="none" stroke="rgba(150,230,240,.40)" strokeWidth={1.6}
              style={{ filter: "drop-shadow(0 0 7px rgba(150,230,240,.5))" }} />
          );
        })}

        {/* Nerve pulses — one per HUB→agent connection, always running (dim/slow
            when idle, bright/fast when active) so the "info traveling" feel
            doesn't disappear the moment nothing's actually running. Stable
            per-row-index delay, not Math.random(), so a status change elsewhere
            doesn't reset every pulse's position mid-flight on re-render. */}
        {fanRows.map((r, i) => {
          const on = !codeGraphMode && (status[r.id] ?? "idle") === "active";
          return (
            <NervePathPulse key={"np-" + r.id} pathId={`nerve-hub-${r.id}`}
              color={on ? "rgba(140,225,235,.95)" : "rgba(160,165,175,.45)"}
              duration={on ? 1.05 : 2.6} delay={(i % 6) * 0.28} />
          );
        })}
      </svg>

      {/* Centre of the opened node.
          codeGraphMode: an ORB, not a card. It used to render S.detailDept —
          a larger copy of the very card you just clicked, with the same name,
          metric, label and sparkline (operator: "when i click on a card why
          does it show another same design inside it?"). Repeating the card
          told you nothing new and made the drill-down feel like a loop. An orb
          reads as "you are inside this node" and matches the hub language the
          universe and satellite views already use. Team mode keeps its
          left-anchored summary card, which sits beside the fan rather than
          duplicating a clicked card. */}
      {codeGraphMode ? (
        <div data-yg-card="1" style={{
          ...S.orbWrap,
          left: `${(HUB.x / 1900) * 100}%`,
          top: `${(HUB.y / 1000) * 100}%`,
        }}>
          <div style={{ ...S.orbGlow, background: `radial-gradient(circle, ${accent}3d 0%, ${accent}14 40%, transparent 70%)` }} />
          <div className="yg-breathe" style={{
            ...S.orbBody, flexDirection: "column",
            background: `radial-gradient(circle at 36% 30%, ${accent}dd 0%, ${accent}99 48%, ${accent}55 100%)`,
          }}>
            <div style={S.orbSheen} />
            <span style={S.detailOrbName}>{dept.name}</span>
            <span style={S.detailOrbMeta}>{dept.metric} {dept.metricLabel}</span>
          </div>
        </div>
      ) : (
        <div data-yg-card="1" className="yg-breathe" style={{
          ...S.detailDept,
          left: `${(DEPT_ANCHOR.x / 1900) * 100}%`,
          top: `${(DEPT_ANCHOR.y / 1000) * 100}%`,
        }}>
          <div style={S.deptHead}>
            <span style={S.codeHead}>
              <span style={{ ...S.deptName, fontSize: 22 }}>{dept.name}</span>
            </span>
            <Pip status={status[dept.id] ?? "idle"} big />
          </div>
          <div style={{ ...S.bigNum, fontSize: 62, marginTop: 14 }}>{dept.metric}</div>
          <div style={{ ...S.numLabel, fontSize: 14 }}>{dept.metricLabel}</div>
          <div style={{ ...S.sparkRow, height: 54, marginTop: 22 }}>
            {Array.from({ length: 34 }).map((_, i) => {
              const r = rngFrom(400 + i * 91)();
              return <i key={i} style={{ flex: 1, height: `${12 + r * 84}%`, background: "rgba(255,255,255,.36)", borderRadius: 0.5 }} />;
            })}
          </div>
        </div>
      )}

      {/* Code-graph orbit cards (2026-08-30) — small circles, one per ring
          position from buildOrbitLayout; replaces the rectangular pill for
          codeGraphMode so far more nodes fit legibly. Team mode keeps the
          original rectangular agent pill below, untouched. */}
      {codeGraphMode && orbitRows.map((r) => (
        <div key={r.id} data-yg-card="1" style={{
          ...S.agentPillPos,
          left: `${(r.x / 1900) * 100}%`,
          top: `${(r.y / 1000) * 100}%`,
        }}>
          <div className="yg-breathe yg-agent-pill" onClick={() => setSelected(r)} style={{
            ...S.codeOrbitCard,
            borderColor: selected?.id === r.id ? "rgba(158,140,255,.8)" : "rgba(140,225,235,.26)",
          }}>
            <span style={S.codeOrbitGlyph}>{"</>"}</span>
            <span style={S.codeOrbitName}>{r.name}</span>
            <span style={S.codeOrbitTag}>{r.tag}</span>
          </div>
        </div>
      ))}

      {!codeGraphMode && rows.map((r) => {
        const st = status[r.id] ?? "idle";
        return (
          <div key={r.id} data-yg-card="1" style={{
            ...S.agentPillPos,
            left: `${(r.x / 1900) * 100}%`,
            top: `${(r.y / 1000) * 100}%`,
          }}>
            <div className="yg-breathe yg-agent-pill" onClick={() => setSelected(r)} style={{
              ...S.agentPill,
              cursor: "pointer",
              borderColor: selected?.id === r.id ? "rgba(158,140,255,.75)"
                : st === "active" ? "rgba(61,220,151,.34)"
                : st === "error" ? "rgba(255,107,96,.42)"
                : "rgba(255,255,255,.10)",
            }}>
              {st === "active" && <><span style={S.halo1} /><span style={S.halo2} /></>}
              <span style={{
                ...S.avatar, padding: 0, overflow: "hidden",
                border: st === "error" ? `2.5px solid ${CORAL}` : "none",
                boxShadow: st === "active" ? `0 0 18px ${MINT}aa` : "none",
              }}>
                <AgentAvatar id={bareAgentId(r.id, dept.id)} name={r.name} size={30} />
              </span>
              <span style={S.agentText}>
                <b style={S.agentName}>{r.name}</b>
                <i style={S.agentTag}>{r.tag}</i>
              </span>
              <span style={{
                ...S.agentPip,
                background: st === "active" ? MINT : st === "error" ? CORAL : "rgba(255,255,255,.2)",
                boxShadow: st === "active" ? `0 0 10px ${MINT}` : "none",
              }} />
            </div>
          </div>
        );
      })}

      </div> {/* end codeGraphMode pan/zoom transform wrapper */}

      {/* Agent detail panel — real fields only for Team mode (id/name/tag/
          live status; full Purpose/Skill Roster/Books needs agent.md parsed
          into an API route, not yet built). codeGraphMode resolves real
          connections from graphLinks/nodesById (2026-08-30, see
          connectionsFor in lib/graph/venture-code-graph.ts). Slides in from
          the right so it never covers the fan itself. */}
      {selected && (
        <AgentDetailPanel agent={selected} dept={dept} embedded={embedded} codeGraphMode={codeGraphMode}
          status={status[selected.id] ?? "idle"} graphLinks={graphLinks} nodesById={nodesById}
          onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

/* ── Agent-details cache (2026-08-15) ────────────────────────────────────
   /agent-details.json (scripts/build-agent-details.mjs) is ~1.7MB across
   all 46 agents — fetched once, lazily, on the FIRST time any panel opens
   in this browser session (not on every DetailView mount), then kept in a
   module-level variable so switching between agents/departments never
   re-fetches. Module scope (not React state) because the fetch needs to
   survive DetailView unmounting when the user backs out to the universe
   view and opens a different department. */
let agentDetailsCache: Record<string, AgentDetail> | null = null;
let agentDetailsPromise: Promise<Record<string, AgentDetail>> | null = null;
function loadAgentDetails(): Promise<Record<string, AgentDetail>> {
  if (agentDetailsCache) return Promise.resolve(agentDetailsCache);
  if (!agentDetailsPromise) {
    agentDetailsPromise = fetch("/agent-details.json")
      .then((r) => r.json())
      .then((d: { agents: Record<string, AgentDetail> }) => (agentDetailsCache = d.agents))
      .catch(() => (agentDetailsCache = {}));
  }
  return agentDetailsPromise;
}

/* ── Fleet links cache (2026-08-30) ──────────────────────────────────────
   Same lazy/module-scope pattern as loadAgentDetails above: fetched the
   first time any fleet code-module DetailView opens, then kept for the
   session so switching between modules doesn't re-fetch the ~5.5MB file. */
let fleetLinksCache: CodeGraphLink[] | null = null;
let fleetLinksPromise: Promise<CodeGraphLink[]> | null = null;
function loadFleetLinks(): Promise<CodeGraphLink[]> {
  if (fleetLinksCache) return Promise.resolve(fleetLinksCache);
  if (!fleetLinksPromise) {
    fleetLinksPromise = fetch("/yvon-graph-links.json")
      .then((r) => (r.ok ? r.json() : { links: [] }))
      .then((d: { links?: CodeGraphLink[] }) => (fleetLinksCache = d.links ?? []))
      .catch(() => (fleetLinksCache = []));
  }
  return fleetLinksPromise;
}

function bareAgentId(agentId: string, deptId: string): string {
  return agentId.startsWith(deptId + "-") ? agentId.slice(deptId.length + 1) : agentId;
}

type ReaderDoc = { title: string; meta: string; content: string };

/** Heuristic, clearly-labeled "kind" tag from a file's extension — graphify
 *  never emits a real description/docstring field (checked: node shape is
 *  only id/label/community/file_type/source_file/source_location), so this
 *  is presented in the panel as an inferred guess, not an asserted fact. */
function inferFileKind(sourceFile?: string, fileType?: string): string {
  const ext = (sourceFile ?? "").split(".").pop()?.toLowerCase();
  const byExt: Record<string, string> = {
    tsx: "TypeScript React component", jsx: "JavaScript React component",
    ts: "TypeScript module", js: "JavaScript module",
    py: "Python script", md: "Markdown document", mdx: "MDX document",
    json: "JSON config/data", yaml: "YAML config", yml: "YAML config",
    sh: "Shell script", html: "HTML file", css: "Stylesheet",
    sql: "SQL", toml: "TOML config",
  };
  if (ext && byExt[ext]) return byExt[ext];
  return fileType || "File";
}

function AgentDetailPanel({ agent, dept, status, embedded, codeGraphMode, graphLinks, nodesById, onClose }: {
  agent: Agent; dept: Dept; status: Status; embedded: boolean; codeGraphMode: boolean;
  graphLinks?: CodeGraphLink[]; nodesById?: Map<string, CodeGraphNode>; onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [detail, setDetail] = useState<AgentDetail | null>(agentDetailsCache?.[agent.id] ?? null);
  // Distinguishes "still fetching" from "fetched, genuinely nothing found" —
  // detail===null used to mean both, so a code-graph file node (which will
  // NEVER have an agent-details.json entry — it isn't a YVON agent) got
  // stuck showing "Loading skills tree…" forever (2026-08-15 fix).
  const [loaded, setLoaded] = useState(!!agentDetailsCache?.[agent.id]);
  const [reading, setReading] = useState<ReaderDoc | null>(null);

  useEffect(() => {
    let cancelled = false;
    setReading(null);
    // Code-graph nodes are files, not YVON agents — they have no agent.md,
    // so don't even try; the honest code-node view below needs nothing from
    // agent-details.json.
    if (codeGraphMode) { setDetail(null); setLoaded(true); return; }
    setLoaded(false);
    loadAgentDetails().then((all) => {
      if (cancelled) return;
      setDetail(all[agent.id] ?? null);
      setLoaded(true);
    });
    return () => { cancelled = true; };
  }, [agent.id, codeGraphMode]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(panelRef.current, { opacity: 0, x: 24 }, { opacity: 1, x: 0, duration: 0.32, ease: "power2.out" });
    }, panelRef);
    return () => ctx.revert();
  }, [agent.id]);

  const bareId = bareAgentId(agent.id, dept.id);

  // Real "connects to" (2026-08-30) — resolved from the raw graphify edges
  // touching every node this card aggregates (memberIds), not invented.
  // Empty when the caller has no link data yet (e.g. fleet links still
  // fetching) — see the loading/empty copy below, never silently blank.
  const memberIds = agent.memberIds ?? [agent.id];
  const connections = useMemo(
    () => (codeGraphMode && nodesById ? connectionsFor(graphLinks, nodesById, memberIds) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [codeGraphMode, graphLinks, nodesById, agent.id],
  );
  const isAggregate = memberIds.length > 1;

  return (
    <div ref={panelRef} data-yg-card="1" style={{ ...S.agentPanel, position: embedded ? "absolute" : "fixed" }}>
      <button style={S.agentPanelClose} onClick={reading ? () => setReading(null) : onClose}>
        {reading ? "←" : "✕"}
      </button>

      {reading ? (
        <>
          <div style={S.readerTitle}>{reading.title}</div>
          <div style={S.readerMeta}>{reading.meta}</div>
          <div style={S.readerBody}><Markdownish text={reading.content} /></div>
        </>
      ) : (
        <>
          {codeGraphMode ? (
            <span style={{ ...S.avatar, ...S.codeNodeGlyph, width: 46, height: 46 }}>{"</>"}</span>
          ) : (
            <span style={{
              ...S.avatar, width: 46, height: 46, padding: 0, overflow: "hidden",
              border: status === "error" ? `2.5px solid ${CORAL}` : "none",
              boxShadow: status === "active" ? `0 0 18px ${MINT}aa` : "none",
            }}>
              <AgentAvatar id={bareId} name={agent.name} size={46} />
            </span>
          )}
          <div style={S.agentPanelName}>{agent.name}</div>
          <div style={S.agentPanelTag}>{agent.tag || (codeGraphMode ? "Code node" : "")}</div>

          {codeGraphMode ? (
            <div style={S.treeScroll}>
              <div style={S.agentPanelRow}>
                <span style={S.agentPanelLabel}>Cluster</span>
                <span style={S.agentPanelVal}>{dept.name}</span>
              </div>
              {agent.community !== undefined && (
                <div style={S.agentPanelRow}>
                  <span style={S.agentPanelLabel}>Community</span>
                  <span style={S.agentPanelVal}>{String(agent.community)}</span>
                </div>
              )}
              {agent.fileType && (
                <div style={S.agentPanelRow}>
                  <span style={S.agentPanelLabel}>File Type</span>
                  <span style={S.agentPanelVal}>{agent.fileType}</span>
                </div>
              )}
              {agent.sourceFile && (
                <div style={S.agentPanelRow}>
                  <span style={S.agentPanelLabel}>Source File</span>
                  <span style={{ ...S.agentPanelVal, fontFamily: "'SF Mono',Menlo,monospace", fontSize: 11 }}>{agent.sourceFile}</span>
                </div>
              )}

              {/* "What this represents" (2026-08-30) — honest framing only:
                  graphify has no description/docstring field, so this states
                  what's actually true of the data (single node vs an
                  aggregated cluster of N nodes) plus a clearly-labeled
                  heuristic file-kind guess, never an invented purpose. */}
              <div style={S.treeSection}>
                <div style={S.treeSectionLabel}>Represents</div>
                <div style={S.treeSummary}>
                  {isAggregate
                    ? `A cluster of ${memberIds.length} related file/symbol nodes graphify grouped together — dominant path shown above, not one single file.`
                    : "One real file or symbol node from the code graph."}
                  {" "}Inferred kind: <b>{inferFileKind(agent.sourceFile, agent.fileType)}</b> (guessed from the extension, not asserted by the data).
                </div>
              </div>

              {/* "Connects to" (2026-08-30) — real edges from graphify, not
                  invented. Aggregated per (other node, relation, direction)
                  with a count, since a cluster card can have thousands of raw
                  edges to the same external file. */}
              <div style={S.treeSection}>
                <div style={S.treeSectionLabel}>Connects To{connections.length > 0 ? ` (${connections.length})` : ""}</div>
                {!nodesById || !graphLinks ? (
                  <div style={S.treeSummary}>Loading connection data…</div>
                ) : connections.length === 0 ? (
                  <div style={S.treeSummary}>No recorded connections for this node in the code graph.</div>
                ) : (
                  connections.map((c, i) => (
                    <div key={`${c.otherId}-${c.relation}-${c.direction}-${i}`} style={S.skillCard}>
                      <div style={S.skillCardHead}>
                        <span style={S.skillCardName}>{c.direction === "out" ? "→" : "←"} {c.otherLabel}</span>
                        <span style={S.skillBadge}>{c.relation.toUpperCase()}{c.count > 1 ? ` ×${c.count}` : ""}</span>
                      </div>
                      {c.otherSourceFile && (
                        <div style={{ ...S.skillCardPurpose, fontFamily: "'SF Mono',Menlo,monospace" }}>{c.otherSourceFile}</div>
                      )}
                    </div>
                  ))
                )}
              </div>

              <div style={S.agentPanelNote}>
                This is a structural node from the code graph (graphify) — a file or
                symbol clustered under &ldquo;{dept.name}&rdquo;, not a YVON fleet agent. It has no
                hand-written purpose, skills, or Books; that only applies to real agents in Team mode.
              </div>
            </div>
          ) : (
            <>
              <div style={S.agentPanelRow}>
                <span style={S.agentPanelLabel}>Department</span>
                <span style={S.agentPanelVal}>{dept.name}</span>
              </div>
              <div style={S.agentPanelRow}>
                <span style={S.agentPanelLabel}>Status</span>
                <span style={{ ...S.agentPanelVal, textTransform: "capitalize" }}>{status}</span>
              </div>
            </>
          )}

          {!codeGraphMode && !loaded && (
            <div style={S.agentPanelNote}>Loading skills tree…</div>
          )}

          {!codeGraphMode && loaded && !detail && (
            <div style={S.agentPanelNote}>
              This agent has no agent.md on file, so there&rsquo;s no skills tree to show.
            </div>
          )}

          {!codeGraphMode && detail && (
            <div style={S.treeScroll}>
              {detail.purpose && (
                <div style={S.treeSection}>
                  <div style={S.treeSectionLabel}>Purpose</div>
                  <div style={S.treeSummary}>{detail.purpose}</div>
                </div>
              )}

              {detail.skillRoster.length > 0 && (
                <div style={S.treeSection}>
                  <div style={S.treeSectionLabel}>Skills ({detail.skillRoster.length})</div>
                  {detail.skillRoster.map((sk) => (
                    <div key={sk.skill}
                      style={{ ...S.skillCard, cursor: sk.content ? "pointer" : "default", opacity: sk.content ? 1 : 0.55 }}
                      onClick={() => sk.content && setReading({
                        title: sk.skill,
                        meta: sk.kind === "shared" ? "Shared OS skill" : "Skill",
                        content: sk.content,
                      })}>
                      <div style={S.skillCardHead}>
                        <span style={S.skillCardName}>{sk.skill}</span>
                        {sk.kind === "shared" && <span style={S.skillBadge}>SHARED</span>}
                      </div>
                      <div style={S.skillCardPurpose}>{sk.purpose || sk.location}</div>
                    </div>
                  ))}
                </div>
              )}

              {detail.operationalLayer.length > 0 && (
                <div style={S.treeSection}>
                  <div style={S.treeSectionLabel}>Operational Layer</div>
                  {detail.operationalLayer.map((op) => (
                    <div key={op.subfolder}
                      style={{ ...S.skillCard, cursor: op.content ? "pointer" : "default", opacity: op.content ? 1 : 0.55 }}
                      onClick={() => op.content && setReading({ title: op.subfolder, meta: op.file, content: op.content })}>
                      <div style={S.skillCardHead}>
                        <span style={{ ...S.skillCardName, textTransform: "capitalize" }}>{op.subfolder}</span>
                      </div>
                      <div style={S.skillCardPurpose}>{op.summary}</div>
                    </div>
                  ))}
                </div>
              )}

              {detail.logicalLayer && (
                <div style={S.treeSection}>
                  <div style={S.treeSectionLabel}>Logical Layer · Books</div>
                  <div
                    style={{ ...S.skillCard, cursor: detail.logicalLayer.content ? "pointer" : "default", opacity: detail.logicalLayer.content ? 1 : 0.55 }}
                    onClick={() => detail.logicalLayer?.content && setReading({
                      title: "Book requirements", meta: "Logical Layer", content: detail.logicalLayer.content,
                    })}>
                    <div style={S.skillCardPurpose}>{detail.logicalLayer.summary}</div>
                  </div>
                </div>
              )}

              {!detail.purpose && detail.skillRoster.length === 0 && detail.operationalLayer.length === 0 && !detail.logicalLayer && (
                <div style={S.agentPanelNote}>
                  This agent&rsquo;s agent.md didn&rsquo;t parse into any of the sections this
                  panel understands yet — the doc may use a different template.
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ── Minimal markdown-ish reader (2026-08-15) ────────────────────────────
   No markdown dependency in this project — these files mix prose, bullet
   lists, ASCII pipeline diagrams (fenced ``` blocks), and the occasional
   heading, so a full parser isn't warranted. This handles just those four
   shapes: fenced code (monospace block), #-headings, -/* bullet lists, and
   plain paragraphs — enough to make a skill's real file genuinely readable
   instead of a wall of raw text. */
function Markdownish({ text }: { text: string }) {
  const lines = text.split("\n");
  const blocks: React.ReactNode[] = [];
  let i = 0, key = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === "") { i++; continue; }
    if (line.startsWith("```")) {
      const code: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) { code.push(lines[i]); i++; }
      i++;
      blocks.push(<pre key={key++} style={S.skillCode}>{code.join("\n")}</pre>);
      continue;
    }
    const heading = line.match(/^(#{1,4})\s+(.*)$/);
    if (heading) {
      blocks.push(<div key={key++} style={{ ...S.skillHeading, fontSize: 16 - heading[1].length }}>{heading[2]}</div>);
      i++;
      continue;
    }
    if (/^[-*]\s+/.test(line.trim())) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) { items.push(lines[i].trim().replace(/^[-*]\s+/, "")); i++; }
      blocks.push(
        <ul key={key++} style={S.skillList}>
          {items.map((it, j) => <li key={j} style={S.skillListItem}>{it}</li>)}
        </ul>
      );
      continue;
    }
    const para: string[] = [];
    while (i < lines.length && lines[i].trim() !== "" && !lines[i].startsWith("```") &&
      !/^#{1,4}\s/.test(lines[i]) && !/^[-*]\s+/.test(lines[i].trim())) {
      para.push(lines[i]); i++;
    }
    blocks.push(<p key={key++} style={S.skillPara}>{para.join(" ")}</p>);
  }
  return <>{blocks}</>;
}

function Pip({ status, big }: { status: Status; big?: boolean }) {
  const c = status === "active" ? MINT : status === "error" ? CORAL : "rgba(255,255,255,.22)";
  const s = big ? 15 : 11;
  return (
    <span style={{
      width: s, height: s, borderRadius: "50%", background: c, display: "block", flex: "none",
      boxShadow: status === "active" ? `0 0 16px ${MINT}` : status === "error" ? `0 0 14px ${CORAL}` : "none",
    }} />
  );
}

const CSS = `
@keyframes halo{
  0%{transform:translate(-50%,-50%) scale(.7);opacity:.9}
  70%{transform:translate(-50%,-50%) scale(2.3);opacity:0}
  100%{transform:translate(-50%,-50%) scale(2.3);opacity:0}
}`;

const S: Record<string, React.CSSProperties> = {
  // 2026-08-27: user-select:none on both roots — the canvas is a pan
  // surface, not a document; drag-panning used to sweep up native
  // text-selection highlights over every label ("i can't drag the graph,
  // it selects the text"). The agent panel re-enables selection for its
  // own content (see agentPanel below) so skill text stays copyable.
  root: {
    position: "fixed", inset: 0, background: "#0a0a0c", overflow: "hidden",
    fontFamily: "-apple-system,BlinkMacSystemFont,'SF Pro Text','Segoe UI',Inter,sans-serif",
    color: "#d8dae0", WebkitFontSmoothing: "antialiased",
    userSelect: "none", WebkitUserSelect: "none",
    // 2026-08-27: touchAction on the ROOT too — a touch starting on the HUD
    // or canvas padding (outside the stage) must not be claimed by the
    // browser as a scroll gesture, or the pan dies via pointercancel.
    touchAction: "none", WebkitTouchCallout: "none",
  },
  rootEmbedded: {
    position: "absolute", inset: 0, background: "#0a0a0c", overflow: "hidden",
    fontFamily: "-apple-system,BlinkMacSystemFont,'SF Pro Text','Segoe UI',Inter,sans-serif",
    color: "#d8dae0", WebkitFontSmoothing: "antialiased",
    userSelect: "none", WebkitUserSelect: "none",
    touchAction: "none", WebkitTouchCallout: "none",
  },
  starfield: {
    position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
    backgroundImage: STARFIELD_BG, backgroundRepeat: "repeat", backgroundSize: "340px 340px",
  },
  // touchAction:none (2026-08-27) — lets pointer-drag pan on touch screens
  // instead of the browser's native scroll/select. Scoped to the stage so
  // the agent panel's own scroll region keeps touch scrolling.
  stage: { position: "absolute", inset: 0, cursor: "grab", touchAction: "none", WebkitTouchCallout: "none" },
  vig: {
    position: "fixed", inset: 0, pointerEvents: "none", zIndex: 5,
    background: "radial-gradient(120% 92% at 50% 50%, transparent 34%, rgba(0,0,0,.5) 100%)",
  },
  hud: {
    position: "fixed", top: 0, left: 0, right: 0, zIndex: 20, padding: "22px 28px",
    display: "flex", justifyContent: "space-between", alignItems: "flex-start", pointerEvents: "none",
    background: "linear-gradient(180deg,rgba(10,10,12,.92),transparent)",
  },
  brand: { fontSize: 12.5, fontWeight: 700, letterSpacing: "0.18em", color: "#ffffff" },
  sub: { fontSize: 10, color: "#7b7f87", marginTop: 5, letterSpacing: "0.1em" },
  tab: {
    background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.14)",
    color: "#aeb2ba", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase",
    padding: "6px 13px", borderRadius: 999, cursor: "pointer", fontFamily: "inherit", backdropFilter: "blur(10px)",
  },
  tabOn: { background: "rgba(158,140,255,.24)", borderColor: "rgba(158,140,255,.55)", color: "#e4dfff" },
  search: {
    position: "fixed", top: 22, left: "50%", transform: "translateX(-50%)", zIndex: 20,
    width: 250, padding: "8px 15px", borderRadius: 999,
    background: "rgba(255,255,255,.045)", border: "1px solid rgba(255,255,255,.09)",
    color: "#d8dae0", fontSize: 11.5, fontFamily: "inherit", outline: "none", backdropFilter: "blur(12px)",
  },
  back: {
    position: "fixed", top: 74, left: 28, zIndex: 22,
    background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.16)",
    color: "#d3d6db", fontSize: 11, padding: "7px 15px", borderRadius: 999,
    cursor: "pointer", fontFamily: "inherit", backdropFilter: "blur(12px)",
  },
  modeToggle: {
    position: "fixed", top: 118, left: 28, zIndex: 22,
    display: "flex", gap: 5, pointerEvents: "auto",
  },

  orbWrap: { position: "absolute", transform: "translate(-50%,-50%)" },
  orbGlow: {
    position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)",
    width: 620, height: 620, borderRadius: "50%", filter: "blur(22px)",
    background: "radial-gradient(circle, rgba(158,140,255,.32) 0%, rgba(158,140,255,.10) 40%, transparent 70%)",
  },
  orbBody: {
    position: "relative", width: 264, height: 264, borderRadius: "50%",
    background: "radial-gradient(circle at 36% 30%, #e4e0ff 0%, #c3baff 22%, #a99cf5 44%, #8f7fe8 66%, #6c5fc7 100%)",
    boxShadow: "0 0 130px rgba(158,140,255,.42), inset -24px -28px 66px rgba(20,16,50,.45), inset 15px 13px 44px rgba(255,255,255,.24)",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  orbSheen: { position: "absolute", inset: 0, borderRadius: "50%", background: "radial-gradient(circle at 34% 26%, rgba(255,255,255,.46), transparent 46%)" },
  orbLabel: { position: "relative", zIndex: 2, fontSize: 21, fontWeight: 600, letterSpacing: "0.15em", color: "#ffffff" },

  // 2026-08-14: split into a positioning wrapper (React-owned — left/top/
  // dim-opacity change every render, this is what setOpen(p)'s click target
  // sizing needs) and an inner visual style (GSAP-owned via .yg-breathe —
  // React never touches transform/scale here, so the breathing tween never
  // gets fought by a re-render). Same split applied to satOrb and agentPill
  // below, same reason.
  deptCardPos: { position: "absolute", transform: "translate(-50%,-50%)", width: 232 },
  deptCard: {
    background: "rgba(255,255,255,0.09)", border: "1px solid rgba(255,255,255,0.20)",
    borderRadius: 20, padding: "16px 18px 14px",
    backdropFilter: "blur(22px)", WebkitBackdropFilter: "blur(22px)",
    boxShadow: "0 14px 44px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.16)",
    cursor: "pointer", transition: "opacity .25s",
  },
  deptHead: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 },
  deptName: { fontSize: 13.5, fontWeight: 600, color: "#ffffff" },
  bigNum: { fontSize: 40, fontWeight: 300, color: "#ffffff", lineHeight: 1, marginTop: 12, letterSpacing: "-0.02em" },
  numLabel: { fontSize: 10.5, color: "#b3b8c2", marginTop: 6 },
  sparkRow: { display: "flex", alignItems: "flex-end", gap: 1.5, height: 30, marginTop: 14 },
  deptFoot: { fontSize: 8.5, color: "#82878f", letterSpacing: "0.14em", marginTop: 10 },

  /* Outer Saturn band — code modules (2026-08-30, operator: "inner circle
     all departments, outer codebase files"). Compact cyan cards: same
     skeleton as org cards, smaller, mono, `</>` glyph, no spark bars
     (bars read as live activity — code doesn't pulse) and no status pip
     (a module is not an agent). */
  codeHead: { display: "flex", alignItems: "center", gap: 8, minWidth: 0 },
  codeCardPos: { position: "absolute", transform: "translate(-50%,-50%)", width: 220 },
  codeCard: {
    background: "rgba(14,30,36,0.58)", border: "1px solid rgba(140,225,235,0.38)",
    borderRadius: 18, padding: "14px 16px 12px",
    backdropFilter: "blur(22px)", WebkitBackdropFilter: "blur(22px)",
    boxShadow: "0 14px 40px rgba(0,0,0,.45), 0 0 24px rgba(140,225,235,.12), inset 0 1px 0 rgba(140,225,235,.16)",
    cursor: "pointer", transition: "opacity .25s",
  },
  codeGlyph: { fontSize: 13, fontWeight: 700, color: "#8ce1eb", fontFamily: "'SF Mono','Cascadia Code',Consolas,monospace", letterSpacing: "-0.03em", flex: "none" },
  codeName: {
    fontSize: 12.5, fontWeight: 600, color: "#e6fbff",
    fontFamily: "'SF Mono','Cascadia Code',Consolas,monospace", letterSpacing: "0.02em",
    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
  },
  codeBigNum: { fontSize: 34, fontWeight: 300, color: "#e6fbff", lineHeight: 1, marginTop: 12, letterSpacing: "-0.02em", fontFamily: "'SF Mono','Cascadia Code',Consolas,monospace" },
  // 30px circle holding the `</>` glyph on code pills (DetailView fan-out) —
  // same footprint as S.avatar so the pill layout doesn't shift.
  codeAvatar: {
    width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 10.5, fontWeight: 700, color: "#8ce1eb",
    fontFamily: "'SF Mono','Cascadia Code',Consolas,monospace",
    background: "rgba(140,225,235,.10)",
  },

  /* L3 — satellite orbs (doc §2.3) — Pos/Inner split, see deptCardPos note above. */
  satOrbPos: { position: "absolute", transform: "translate(-50%,-50%)", borderRadius: "50%", cursor: "pointer" },
  satOrbInner: {
    position: "relative", width: "100%", height: "100%", borderRadius: "50%",
    border: "1.5px solid", display: "flex", flexDirection: "column", alignItems: "center",
    justifyContent: "center", textAlign: "center", padding: 6,
    backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
    boxShadow: "0 10px 30px rgba(0,0,0,.4)", transition: "opacity .25s",
  },
  satChild: { boxShadow: "0 6px 18px rgba(0,0,0,.35)" },
  // Corner glyph for a venture with zero Team grants but a real code graph
  // on file (2026-08-30) — see the satellites.map note above.
  satCodeBadge: {
    position: "absolute", top: 6, right: 10, fontSize: 10, color: "#7fc9d4",
    opacity: 0.85, fontFamily: "'SF Mono',Menlo,monospace",
  },
  // Centre orb labels for DetailView's opened node (replaces the duplicated card).
  detailOrbName: {
    position: "relative", zIndex: 2, fontSize: 15, fontWeight: 700, color: "#fff",
    letterSpacing: "0.02em", textAlign: "center", padding: "0 18px", lineHeight: 1.2,
    textShadow: "0 2px 10px rgba(0,0,0,.5)", wordBreak: "break-word",
  },
  detailOrbMeta: {
    position: "relative", zIndex: 2, marginTop: 6, fontSize: 10.5, fontWeight: 600,
    color: "rgba(255,255,255,.82)", letterSpacing: "0.1em", textTransform: "uppercase",
    textShadow: "0 2px 8px rgba(0,0,0,.5)",
  },
  // Upcoming slot — ventures with no real content yet (see the render note).
  upcomingBox: {
    width: "100%", height: "100%", borderRadius: 18,
    border: "1.5px dashed rgba(255,255,255,.18)", background: "rgba(255,255,255,.02)",
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    gap: 7, padding: 14, textAlign: "center",
    backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
  },
  upcomingTitle: { fontSize: 10, fontWeight: 700, color: "#8b909a", letterSpacing: "0.16em" },
  upcomingChip: {
    fontSize: 11, fontWeight: 600, color: "#c9ced6", cursor: "pointer",
    borderRadius: 999, padding: "4px 12px",
    border: "1px solid rgba(255,255,255,.16)", background: "rgba(255,255,255,.05)",
  },
  upcomingNote: { fontSize: 8.5, color: "#6c717a", letterSpacing: "0.06em" },
  satLabel: { fontSize: 11, fontWeight: 700, color: "#ffffff", letterSpacing: "0.04em" },
  satLabelSm: { fontSize: 8.5, fontWeight: 700, color: "#ffffff", letterSpacing: "0.03em" },
  satSub: { fontSize: 8, color: "#d6d0ff", letterSpacing: "0.06em", marginTop: 3 },
  satEmptyNote: {
    position: "absolute", transform: "translate(-50%,-50%)", fontSize: 11.5,
    color: "#83888f", letterSpacing: "0.03em", whiteSpace: "nowrap",
  },

  detailStage: { position: "absolute", inset: 0 },
  detailSvg: { position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" },
  edgeGlow: {
    position: "absolute", left: -320, top: "50%", transform: "translateY(-50%)",
    width: 660, height: 660, borderRadius: "50%", pointerEvents: "none",
    background: "radial-gradient(circle, rgba(142,123,240,.30) 0%, rgba(142,123,240,.10) 42%, transparent 72%)",
    filter: "blur(30px)",
  },
  detailDept: {
    position: "absolute", transform: "translate(-50%,-50%)", width: 330,
    background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.22)",
    borderRadius: 26, padding: "24px 26px 22px",
    backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
    boxShadow: "0 20px 60px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.18)",
  },
  agentPillPos: { position: "absolute", transform: "translate(-50%,-50%)" },
  agentPill: {
    position: "relative", // halo1/halo2 anchor to this (was the outer, positioned div before the split)
    display: "flex", alignItems: "center", gap: 12, minWidth: 210,
    background: "rgba(255,255,255,0.09)", border: "1px solid rgba(255,255,255,.18)",
    borderRadius: 14, padding: "9px 16px 9px 11px",
    backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)",
    boxShadow: "0 8px 26px rgba(0,0,0,.38), inset 0 1px 0 rgba(255,255,255,.12)",
    transition: "border-color .3s",
  },
  // Code-graph orbit card (2026-08-30) — circle instead of the agent pill's
  // rectangle, sized to hold far more nodes per screen than the row/column
  // fan it replaces for codeGraphMode (see buildOrbitLayout doc comment).
  codeOrbitCard: {
    position: "relative", width: 112, height: 112, borderRadius: "50%",
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    gap: 3, padding: "8px 12px", textAlign: "center", cursor: "pointer",
    background: "radial-gradient(circle at 35% 30%, rgba(140,225,235,.14), rgba(12,22,26,.62) 70%)",
    border: "1px solid rgba(140,225,235,.26)",
    backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
    boxShadow: "0 8px 22px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.08)",
    transition: "border-color .3s",
  },
  codeOrbitGlyph: { fontSize: 11, color: "#7fc9d4", opacity: 0.75 },
  codeOrbitName: {
    fontSize: 10.5, fontWeight: 600, color: "#e8f7f8", lineHeight: 1.2,
    display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
    overflow: "hidden", wordBreak: "break-word", maxWidth: "94%",
  },
  codeOrbitTag: { fontSize: 8.5, color: "#7fc9d4", opacity: 0.8 },
  avatar: { width: 30, height: 30, borderRadius: "50%", flex: "none", display: "block" },
  // Code-graph nodes get a file glyph instead of AgentAvatar (2026-08-15) —
  // a generated-art "person" avatar for a source file would be dishonest in
  // the same way the old fake skills tree was.
  codeNodeGlyph: {
    borderRadius: 12, background: "rgba(140,225,235,.12)", border: "1px solid rgba(140,225,235,.3)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "'SF Mono',Menlo,monospace", fontSize: 15, color: "#9de3ea", fontWeight: 600,
  },
  agentText: { display: "flex", flexDirection: "column", flex: 1 },
  agentName: { fontSize: 14, fontWeight: 550, color: "#ffffff" },
  agentTag: { fontSize: 11, color: "#a3a8b0", fontStyle: "normal", marginTop: 1 },
  agentPip: { width: 8, height: 8, borderRadius: "50%", flex: "none" },
  halo1: {
    position: "absolute", left: 26, top: "50%", width: 42, height: 42, borderRadius: "50%",
    border: `2px solid ${MINT}`, animation: "halo 2.6s cubic-bezier(.2,.7,.4,1) infinite", pointerEvents: "none",
  },
  halo2: {
    position: "absolute", left: 26, top: "50%", width: 42, height: 42, borderRadius: "50%",
    border: `1.5px solid ${MINT}`, animation: "halo 2.6s cubic-bezier(.2,.7,.4,1) .9s infinite", pointerEvents: "none",
  },

  agentPanel: {
    position: "fixed", top: 90, right: 28, bottom: 60, zIndex: 24, width: 380,
    background: "rgba(18,18,23,0.78)", border: "1px solid rgba(255,255,255,0.16)",
    borderRadius: 22, padding: "26px 22px 22px",
    backdropFilter: "blur(26px)", WebkitBackdropFilter: "blur(26px)",
    boxShadow: "0 20px 60px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,255,255,.14)",
    display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 4,
    overflow: "hidden",
    // Re-enable selection here (2026-08-27) — the root canvas is
    // user-select:none for drag-pan, but panel text (skills, reader) must
    // stay copyable.
    userSelect: "text",
  },
  agentPanelClose: {
    position: "absolute", top: 16, right: 16, background: "rgba(255,255,255,.08)",
    border: "1px solid rgba(255,255,255,.14)", color: "#d3d6db", width: 26, height: 26,
    borderRadius: "50%", cursor: "pointer", fontSize: 11, lineHeight: 1, fontFamily: "inherit", flex: "none",
  },
  agentPanelName: { fontSize: 18, fontWeight: 650, color: "#ffffff", marginTop: 14 },
  agentPanelTag: { fontSize: 12, color: "#a3a8b0", marginBottom: 16 },
  agentPanelRow: { display: "flex", justifyContent: "space-between", width: "100%", padding: "9px 0", borderTop: "1px solid rgba(255,255,255,.08)", flex: "none" },
  agentPanelLabel: { fontSize: 10.5, color: "#82878f", letterSpacing: "0.08em", textTransform: "uppercase" },
  agentPanelVal: { fontSize: 12.5, color: "#e2e4e9", fontWeight: 500 },
  agentPanelNote: { fontSize: 11, color: "#83888f", lineHeight: 1.5, marginTop: 16, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,.08)" },

  // Skills tree (2026-08-15) — scrolls independently inside the fixed-height panel.
  treeScroll: { width: "100%", overflowY: "auto", marginTop: 6, paddingRight: 4, flex: 1 },
  treeSection: { marginTop: 18 },
  treeSectionLabel: { fontSize: 10.5, color: "#9e8cff", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 700, marginBottom: 8 },
  treeSummary: { fontSize: 12, color: "#c3c6cd", lineHeight: 1.55 },
  skillCard: {
    background: "rgba(255,255,255,.045)", border: "1px solid rgba(255,255,255,.10)",
    borderRadius: 12, padding: "10px 12px", marginBottom: 7, transition: "background .2s, border-color .2s",
  },
  skillCardHead: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 },
  skillCardName: { fontSize: 12.5, fontWeight: 600, color: "#ffffff" },
  skillBadge: {
    fontSize: 8.5, letterSpacing: "0.08em", color: "#c9beff", background: "rgba(158,140,255,.18)",
    border: "1px solid rgba(158,140,255,.4)", borderRadius: 999, padding: "1.5px 7px", flex: "none",
  },
  skillCardPurpose: { fontSize: 11, color: "#9a9fa8", lineHeight: 1.45, marginTop: 4 },

  // Skill reader (2026-08-15) — replaces the tree body in-place when a card is clicked.
  readerTitle: { fontSize: 17, fontWeight: 650, color: "#ffffff", marginTop: 14 },
  readerMeta: { fontSize: 11, color: "#9e8cff", letterSpacing: "0.04em", marginBottom: 14 },
  readerBody: { width: "100%", overflowY: "auto", flex: 1, paddingRight: 4 },
  skillHeading: { fontWeight: 700, color: "#ffffff", marginTop: 14, marginBottom: 4 },
  skillPara: { fontSize: 12, color: "#c3c6cd", lineHeight: 1.6, marginBottom: 10 },
  skillList: { margin: "0 0 10px", paddingLeft: 18 },
  skillListItem: { fontSize: 12, color: "#c3c6cd", lineHeight: 1.55, marginBottom: 5 },
  skillCode: {
    fontFamily: "'SF Mono',Menlo,Consolas,monospace", fontSize: 10.5, color: "#a9e8dd", lineHeight: 1.5,
    background: "rgba(0,0,0,.35)", border: "1px solid rgba(255,255,255,.08)", borderRadius: 10,
    padding: "10px 12px", marginBottom: 10, overflowX: "auto", whiteSpace: "pre",
  },

  legend: { position: "fixed", bottom: 20, left: 28, zIndex: 20, display: "flex", gap: 16, pointerEvents: "none" },
  lg: { display: "flex", alignItems: "center", gap: 6, fontSize: 9.5, color: "#7b7f87", letterSpacing: "0.06em" },
  hint: { position: "fixed", bottom: 20, right: 28, zIndex: 20, fontSize: 9.5, color: "#7b7f87", letterSpacing: "0.06em", pointerEvents: "none" },
};
