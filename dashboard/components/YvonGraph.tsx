"use client";

import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { supabaseSource } from "@/lib/events/supabase-source";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { applyEvent, bubbleUp, DECAY_MS } from "@/lib/events";
import { useWorkspace } from "@/lib/WorkspaceContext";
import { graphDataToDepartments, type RawGraphData } from "@/lib/graph/venture-code-graph";
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
function buildLayout(DEPARTMENTS: Dept[], seed = 20260803): { placed: Placed[]; stars: { x: number; y: number; r: number; o: number }[] } {
  const rnd = rngFrom(seed);
  const n = DEPARTMENTS.length || 1;

  const placed: Placed[] = DEPARTMENTS.map((dep, i) => {
    const ang = (i / n) * Math.PI * 2 - Math.PI / 2 + (rnd() - 0.5) * 0.06;
    const band = i % 2 === 0 ? 430 : 570;
    return {
      ...dep,
      x: CX + Math.cos(ang) * band * 1.44,
      y: CY + Math.sin(ang) * band * 0.98,
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

/* ── L3 — satellite ring layout (doc §2.3) ──────────────────────────
   Positions come from a ring pass over contexts sorted by (kind, sort_order,
   slug) — the same "sorted stable ids, never array index" rule as buildLayout,
   so satellites never reshuffle on a status change. Each satellite's seed is
   derived from its own context slug, so one brand's internal churn never
   perturbs another's layout (doc §2.5.5). */
const SAT_R = 980;      // outer ring radius — beyond the department ring (ORB_R + ~600)
const SAT_ORB = 70;     // satellite orb diameter baseline
const SUB_OFFSET = 118; // nested client sub-orb distance from its parent satellite

interface Placed3 { ctx: Context; x: number; y: number; r: number; agentCount: number; deptCount: number; children: Placed3[] }

function seedFromSlug(slug: string): number {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return h || 1;
}

function buildSatelliteLayout(
  contexts: Context[],
  ringFor: (slug: string) => { deptCount: number; agentCount: number },
): Placed3[] {
  const roots = contexts
    .filter((c) => c.kind !== "core" && !c.parentId)
    .sort((a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99) || a.slug.localeCompare(b.slug));
  const childrenOf = (id?: string) =>
    contexts.filter((c) => c.parentId && c.parentId === id)
      .sort((a, b) => a.slug.localeCompare(b.slug));

  const n = Math.max(roots.length, 1);
  return roots.map((ctx, i) => {
    const rnd = rngFrom(seedFromSlug(ctx.slug));
    const ang = (i / n) * Math.PI * 2 - Math.PI / 2 + (rnd() - 0.5) * 0.08;
    const x = CX + Math.cos(ang) * SAT_R * 1.42;
    const y = CY + Math.sin(ang) * SAT_R * 0.97;
    const { deptCount, agentCount } = ringFor(ctx.slug);

    const kids = childrenOf(ctx.id).map((child, j): Placed3 => {
      const crnd = rngFrom(seedFromSlug(child.slug));
      const cang = ang + (j + 1) * 0.7 + (crnd() - 0.5) * 0.2;
      const { deptCount: cd, agentCount: ca } = ringFor(child.slug);
      return {
        ctx: child,
        x: x + Math.cos(cang) * SUB_OFFSET,
        y: y + Math.sin(cang) * SUB_OFFSET,
        r: SAT_ORB * 0.55,
        deptCount: cd,
        agentCount: ca,
        children: [],
      };
    });

    // Ring size scales with active-department count (doc §2.3 consequences table) —
    // never padded to a fixed 7. A single-department brand is a legal, smaller orb.
    const r = SAT_ORB * (0.62 + Math.min(deptCount, 7) * 0.09);
    return { ctx, x, y, r, deptCount, agentCount, children: kids };
  });
}

export default function YvonGraph({ embedded = false }: { embedded?: boolean }) {
  const [DEPARTMENTS, setDepartments] = useState<Dept[]>([]);
  const [open, setOpen] = useState<Placed | null>(null);
  const [status, setStatus] = useState<Record<string, Status>>({});
  const [q, setQ] = useState("");
  // Real activity comes from the events table (below). `demo` is an explicitly
  // labelled simulator for screenshots — never on by default.
  const [demo, setDemo] = useState(false);
  // Scope = context_path (doc §6.1: "context_id = ventures.context_path" — the bare slug is
  // NOT the join key once nesting exists). TS-026/030: real ventures from the SHARED store —
  // yvon-os + DB rows only; new ventures appear without refresh.
  const [scope, setScope] = useState("yvon-os");
  const [scopes, setScopes] = useState<Array<[string, string]>>([["yvon-os", "YVON"]]);
  const { ventures } = useWorkspace();
  const contexts = ventures as Context[];

  useEffect(() => {
    if (ventures.length > 0) {
      setScopes(ventures.map((v) => [v.contextPath ?? v.slug, (v.name ?? v.slug).toUpperCase()]));
    }
  }, [ventures]);

  // L3 — one satellite the operator has zoomed into (doc §2.3). null = universe view
  // (core ring + all satellite orbs at once).
  const [openSatellite, setOpenSatellite] = useState<Context | null>(null);
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
  const drag = useRef({ on: false, px: 0, py: 0 });
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
      .then((s: Structure) => setDepartments(s.departments))
      .catch(() => setDepartments([]));
  }, []);

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
      if (kind === "core") return DEPARTMENTS;
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

  // Layout computed ONCE per structure, from stable sorted ids → never reshuffles.
  const { placed } = useMemo(() => buildLayout(DEPARTMENTS), [DEPARTMENTS]);

  // L3 satellite positions — recomputed only when contexts or grants change, not on every
  // status tick (doc §2.5.1).
  const satellites = useMemo(
    () => buildSatelliteLayout(contexts, ringSummary),
    [contexts, ringSummary],
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

  useEffect(() => {
    if (!demo || !DEPARTMENTS.length) return;
    const all = [
      ...DEPARTMENTS.map((x) => x.id),
      ...DEPARTMENTS.flatMap((x) => x.agents.map((a) => a.id)),
    ];
    const t = setInterval(() => {
      const id = all[Math.floor(Math.random() * all.length)];
      const err = Math.random() < 0.08;
      setStatus((p) => ({ ...p, [id]: err ? "error" : "active" }));
      setTimeout(
        () => setStatus((p) => ({ ...p, [id]: "idle" })),
        err ? 3200 : 1600 + Math.random() * 2600
      );
    }, 700);
    return () => clearInterval(t);
  }, [demo, DEPARTMENTS]);

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setView((v) => {
      const f = e.deltaY < 0 ? 1.1 : 1 / 1.1;
      const ns = Math.min(2.2, Math.max(0.16, v.s * f));
      return { s: ns, x: e.clientX - (e.clientX - v.x) * (ns / v.s), y: e.clientY - (e.clientY - v.y) * (ns / v.s) };
    });
  }, []);

  useEffect(() => {
    const mv = (e: MouseEvent) => {
      if (!drag.current.on) return;
      if (!dragMoved.current && Math.hypot(e.clientX - dragStart.current.x, e.clientY - dragStart.current.y) > 6) {
        dragMoved.current = true;
      }
      setView((v) => ({ ...v, x: v.x + e.clientX - drag.current.px, y: v.y + e.clientY - drag.current.py }));
      drag.current.px = e.clientX; drag.current.py = e.clientY;
    };
    const up = () => (drag.current.on = false);
    window.addEventListener("mousemove", mv);
    window.addEventListener("mouseup", up);
    return () => {
      window.removeEventListener("mousemove", mv);
      window.removeEventListener("mouseup", up);
    };
  }, []);

  const activeCount = Object.values(status).filter((s) => s === "active").length;
  const dim = (name: string) => !!q && !name.toLowerCase().includes(q.toLowerCase());

  return (
    <div style={embedded ? S.rootEmbedded : S.root}>
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
            {open ? `${open.name.toUpperCase()} · ${open.agents.length} ${codeGraphMode ? "NODES" : "AGENTS"}`
              : openSatellite && satelliteRing
                ? codeGraphMode
                  ? `${openSatellite.name.toUpperCase()} · CODE GRAPH · ${satelliteRing.placed.length} CLUSTERS · ${satelliteRing.placed.reduce((n, x) => n + x.agents.length, 0)} NODES`
                  : `${openSatellite.name.toUpperCase()} · ${satelliteRing.placed.length} ACTIVE DEPTS · ${satelliteRing.placed.reduce((n, x) => n + x.agents.length, 0)} GRANTED AGENTS`
                : `${DEPARTMENTS.length} DEPARTMENTS · ${DEPARTMENTS.reduce((n, x) => n + x.agents.length, 0)} AGENTS${demo ? ` · ${activeCount} ACTIVE` : ""}`}
          </div>
        </div>
        <div style={{ display: "flex", gap: 5, pointerEvents: "auto" }}>
          {/* doc §16.1 — one app, N scopes (TS-026: real ventures only). Tab id is
              context_path (doc §6.1), and doubles as the L3 satellite entry point:
              picking a non-core venture opens its scoped ring; YVON returns to the
              universe view. */}
          {scopes.map(([id, label]) => (
            <button key={id} style={{ ...S.tab, ...(scope === id ? S.tabOn : {}) }}
              onClick={() => {
                punchZoom();
                setScope(id);
                setStatus({});
                setOpen(null);
                const ctx = contexts.find((c) => (c.contextPath ?? c.slug) === id);
                setOpenSatellite(ctx && ctx.kind !== "core" ? ctx : null);
              }}>{label}</button>
          ))}
          <button style={{ ...S.tab, ...(demo ? S.tabOn : {}), opacity: 0.7 }}
            onClick={() => { setDemo((v) => !v); if (demo) setStatus({}); }}
            title="Simulated pulse — for screenshots only, not real activity">
            {demo ? "demo ON" : "demo"}
          </button>
        </div>
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
          graphify structural graph (lib/graph/venture-code-graph.ts). */}
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
          onMouseDown={(e) => {
            drag.current = { on: true, px: e.clientX, py: e.clientY };
            dragStart.current = { x: e.clientX, y: e.clientY };
            dragMoved.current = false;
          }}>
          <div style={{ position: "absolute", transformOrigin: "0 0",
            transform: `translate(${view.x}px,${view.y}px) scale(${view.s})` }}>

            <svg style={{ position: "absolute", overflow: "visible", pointerEvents: "none" }} width={3600} height={2400}>
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
                  stroke="rgba(200,195,255,0.34)" strokeWidth={1.8}
                  style={{ filter: "drop-shadow(0 0 3px rgba(180,170,255,.35))" }} />
              ))}
              {/* Grant edges (doc §2.4) — thin, static, low opacity, visually distinct (dashed,
                  violet-tinted) from department spokes. Membership, not execution. */}
              {satellites.map((s) => (
                <line key={"sat-edge-" + s.ctx.slug} x1={CX} y1={CY} x2={s.x} y2={s.y}
                  stroke="rgba(160,140,255,0.4)" strokeWidth={1.8} strokeDasharray="2 5"
                  style={{ filter: "drop-shadow(0 0 3px rgba(160,140,255,.4))" }} />
              ))}
              {satellites.flatMap((s) => s.children.map((c) => (
                <line key={"sub-edge-" + c.ctx.slug} x1={s.x} y1={s.y} x2={c.x} y2={c.y}
                  stroke="rgba(160,140,255,0.45)" strokeWidth={1.4} strokeDasharray="1.5 4" />
              )))}
              {/* Nerve pulses (2026-08-14) — traveling dots along every spoke/edge above,
                  "info flowing along a nerve." Stable per-index timing (not Math.random() at
                  render time) so status/activity re-renders don't reset them mid-flight. */}
              {placed.map((p, i) => (
                <NerveLinePulse key={"pulse-dept-" + p.id} x1={CX} y1={CY} x2={p.x} y2={p.y}
                  color="rgba(190,180,255,.85)" duration={2.6 + (i % 4) * 0.35} delay={(i % 7) * 0.22} />
              ))}
              {satellites.map((s, i) => (
                <NerveLinePulse key={"pulse-sat-" + s.ctx.slug} x1={CX} y1={CY} x2={s.x} y2={s.y}
                  color="rgba(170,150,255,.9)" duration={3.2 + (i % 3) * 0.4} delay={(i % 5) * 0.3} />
              ))}
            </svg>

            <div data-yg-card="1" style={{ ...S.orbWrap, left: CX, top: CY }}>
              <div style={S.orbGlow} />
              <div className="yg-breathe" style={S.orbBody}>
                <div style={S.orbSheen} />
                <span style={S.orbLabel}>YVON</span>
              </div>
            </div>

            {placed.map((p) => {
              const st = rolled[p.id] ?? "idle";
              return (
                <div key={p.id} data-yg-card="1" onClick={() => zoomIntoCard(p, () => setOpen(p))}
                  style={{ ...S.deptCardPos, left: p.x, top: p.y, opacity: dim(p.name) ? 0.2 : 1 }}>
                  <div className="yg-breathe" style={S.deptCard}>
                    <div style={S.deptHead}>
                      <span style={S.deptName}>{p.name}</span>
                      <Pip status={st} />
                    </div>
                    <div style={S.bigNum}>{p.metric}</div>
                    <div style={S.numLabel}>{p.metricLabel}</div>
                    <div style={S.sparkRow}>
                      {p.bars.map((h, i) => (
                        <i key={i} style={{ flex: 1, height: `${h}%`, background: "rgba(255,255,255,.32)", borderRadius: 0.5 }} />
                      ))}
                    </div>
                    <div style={S.deptFoot}>{p.agents.length} AGENTS</div>
                  </div>
                </div>
              );
            })}

            {/* ══ L3 — satellite orbs (doc §2.3) ══
                Ring size scales with active-department count; zero-node rings are legal
                (single-department brand); zero-grant brands render dimmed with an explicit
                affordance rather than being hidden. */}
            {satellites.map((s) => {
              const empty = s.agentCount === 0;
              const openThis = () => {
                punchZoom();
                setOpenSatellite(s.ctx); setScope(s.ctx.contextPath ?? s.ctx.slug); setStatus({});
              };
              return (
                <React.Fragment key={s.ctx.slug}>
                  <div data-yg-card="1" onClick={openThis}
                    style={{ ...S.satOrbPos, left: s.x, top: s.y, width: s.r * 2, height: s.r * 2, opacity: empty ? 0.55 : 1 }}>
                    <div className="yg-breathe" style={{
                      ...S.satOrbInner,
                      borderColor: empty ? "rgba(255,255,255,.14)" : `${s.ctx.color}66`,
                      background: empty
                        ? "rgba(255,255,255,.03)"
                        : `radial-gradient(circle at 36% 30%, ${s.ctx.color}55, ${s.ctx.color}18 60%, transparent 100%)`,
                    }}>
                      <span style={S.satLabel}>{s.ctx.name}</span>
                      <span style={S.satSub}>
                        {empty ? "NO AGENTS GRANTED" : `${s.deptCount} DEPT · ${s.agentCount} AGENTS`}
                      </span>
                    </div>
                  </div>
                  {s.children.map((c) => {
                    const cEmpty = c.agentCount === 0;
                    return (
                      <div key={c.ctx.slug} data-yg-card="1"
                        onClick={() => {
                          punchZoom();
                          setOpenSatellite(c.ctx); setScope(c.ctx.contextPath ?? c.ctx.slug); setStatus({});
                        }}
                        style={{ ...S.satOrbPos, left: c.x, top: c.y, width: c.r * 2, height: c.r * 2, opacity: cEmpty ? 0.5 : 0.92 }}>
                        <div className="yg-breathe" style={{
                          ...S.satOrbInner, ...S.satChild,
                          borderColor: cEmpty ? "rgba(255,255,255,.14)" : `${c.ctx.color}66`,
                          background: cEmpty ? "rgba(255,255,255,.03)" : `${c.ctx.color}30`,
                        }}>
                          <span style={S.satLabelSm}>{c.ctx.name}</span>
                        </div>
                      </div>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}

      {/* ══ LEVEL 3 — one satellite's scoped ring: active departments, granted agents only ══ */}
      {openSatellite && !open && satelliteRing && (
        <div style={S.stage} onWheel={onWheel} onClick={goBackFromSatellite}
          onMouseDown={(e) => {
            drag.current = { on: true, px: e.clientX, py: e.clientY };
            dragStart.current = { x: e.clientX, y: e.clientY };
            dragMoved.current = false;
          }}>
          <div style={{ position: "absolute", transformOrigin: "0 0",
            transform: `translate(${view.x}px,${view.y}px) scale(${view.s})` }}>

            <svg style={{ position: "absolute", overflow: "visible", pointerEvents: "none" }} width={3600} height={2400}>
              {/* Local star cluster removed here too — see L1 note above. */}
              {satelliteRing.placed.map((p) => (
                <line key={p.id} x1={CX} y1={CY} x2={p.x} y2={p.y}
                  stroke={codeGraphMode ? "rgba(140,225,235,0.34)" : "rgba(200,195,255,0.34)"} strokeWidth={1.8}
                  style={{ filter: `drop-shadow(0 0 3px ${codeGraphMode ? "rgba(140,225,235,.35)" : "rgba(180,170,255,.35)"})` }} />
              ))}
              {satelliteRing.placed.map((p, i) => (
                <NerveLinePulse key={"pulse-" + p.id} x1={CX} y1={CY} x2={p.x} y2={p.y}
                  color={codeGraphMode ? "rgba(140,225,235,.9)" : "rgba(190,180,255,.85)"}
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

            {satelliteRing.placed.map((p) => {
              const st = rolled[p.id] ?? "idle";
              return (
                <div key={p.id} data-yg-card="1" onClick={() => zoomIntoCard(p, () => setOpen(p))}
                  style={{ ...S.deptCardPos, left: p.x, top: p.y, opacity: dim(p.name) ? 0.2 : 1 }}>
                  <div className="yg-breathe" style={S.deptCard}>
                    <div style={S.deptHead}>
                      <span style={S.deptName}>{p.name}</span>
                      {!codeGraphMode && <Pip status={st} />}
                    </div>
                    <div style={S.bigNum}>{p.agents.length}</div>
                    <div style={S.numLabel}>{codeGraphMode ? "FILE NODES" : "GRANTED AGENTS"}</div>
                    <div style={S.sparkRow}>
                      {p.bars.map((h, i) => (
                        <i key={i} style={{ flex: 1, height: `${h}%`, background: "rgba(255,255,255,.32)", borderRadius: 0.5 }} />
                      ))}
                    </div>
                    <div style={S.deptFoot}>{p.agents.length} {codeGraphMode ? "NODES" : "AGENTS"}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══ LEVEL 2 ══ */}
      {open && (
        <DetailView dept={open} status={rolled} embedded={embedded} codeGraphMode={codeGraphMode}
          onBack={() => { zoomOutOfCard(); setOpen(null); }} />
      )}

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
function DetailView({ dept, status, embedded, codeGraphMode, onBack }: {
  dept: Dept; status: Record<string, Status>; embedded: boolean; codeGraphMode: boolean; onBack: () => void;
}) {
  const n = dept.agents.length;

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

  const HUB = { x: 880, y: 500 };
  // Anchor for the department summary card, in the SAME viewBox-space
  // coordinate system as HUB/rows below — see detailDept position fix.
  const DEPT_ANCHOR = { x: 470, y: 500 };
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

  // Click empty space to go back (2026-08-15) — same convention as L1/L3's
  // stage handler, no drag exists here so no dragMoved check needed. A
  // click while the agent panel is open closes the panel first (one level
  // of "back" at a time) rather than jumping straight out of the department.
  const handleStageClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("[data-yg-card]")) return;
    if (selected) { setSelected(null); return; }
    onBack();
  };

  return (
    <div ref={stageRef} style={S.detailStage} onClick={handleStageClick}>
      <div style={S.edgeGlow} />

      <svg style={S.detailSvg} viewBox="0 0 1900 1000" preserveAspectRatio="xMidYMid slice">
        {Array.from({ length: 70 }).map((_, i) => {
          const r = rngFrom(9000 + i * 37);
          const x = 250 + r() * 720, y = 50 + r() * 900;
          return <circle key={i} cx={x} cy={y} r={3 + r() * 6.5} fill={`rgba(210,216,228,${0.14 + r() * 0.32})`} />;
        })}

        {/* Trunk connector — dept summary card into HUB. Was missing entirely
            before (the card floated at a raw CSS % unrelated to viewBox
            space, see detailDept below), which read as "disconnected". */}
        <path d={`M ${DEPT_ANCHOR.x + 165} ${DEPT_ANCHOR.y} L ${HUB.x - 4} ${HUB.y}`}
          stroke="rgba(190,195,210,.55)" strokeWidth={2.4}
          style={{ filter: "drop-shadow(0 0 5px rgba(190,195,210,.4))" }} />

        {rows.map((r) => {
          const on = (status[r.id] ?? "idle") === "active";
          return (
            <path key={r.id} id={`nerve-hub-${r.id}`}
              d={`M ${HUB.x} ${HUB.y} C ${HUB.x + 120} ${HUB.y}, ${r.x - 160} ${r.y}, ${r.x - 20} ${r.y}`}
              fill="none"
              stroke={on ? "rgba(140,225,235,.65)" : "rgba(190,195,210,.4)"}
              strokeWidth={on ? 2.2 : 1.6}
              style={{ filter: on ? "drop-shadow(0 0 6px rgba(140,225,235,.6))" : "drop-shadow(0 0 2.5px rgba(190,195,210,.3))" }} />
          );
        })}

        {activeRows.map((r, i) => {
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
        {rows.map((r, i) => {
          const on = (status[r.id] ?? "idle") === "active";
          return (
            <NervePathPulse key={"np-" + r.id} pathId={`nerve-hub-${r.id}`}
              color={on ? "rgba(140,225,235,.95)" : "rgba(160,165,175,.45)"}
              duration={on ? 1.05 : 2.6} delay={(i % 6) * 0.28} />
          );
        })}
      </svg>

      <div data-yg-card="1" className="yg-breathe" style={{
        ...S.detailDept,
        left: `${(DEPT_ANCHOR.x / 1900) * 100}%`,
        top: `${(DEPT_ANCHOR.y / 1000) * 100}%`,
      }}>
        <div style={S.deptHead}>
          <span style={{ ...S.deptName, fontSize: 22 }}>{dept.name}</span>
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

      {rows.map((r) => {
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
                : st === "error" ? "rgba(255,107,96,.42)" : "rgba(255,255,255,.10)",
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

      {/* Agent detail panel (2026-08-14, first pass) — real fields only:
          id/name/tag/live status is all the frontend has today (see
          discussion — full Purpose/Skill Roster/Books needs agent.md
          parsed into an API route, not yet built). Slides in from the
          right so it never covers the fan itself. */}
      {selected && (
        <AgentDetailPanel agent={selected} dept={dept} embedded={embedded} codeGraphMode={codeGraphMode}
          status={status[selected.id] ?? "idle"} onClose={() => setSelected(null)} />
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

function bareAgentId(agentId: string, deptId: string): string {
  return agentId.startsWith(deptId + "-") ? agentId.slice(deptId.length + 1) : agentId;
}

type ReaderDoc = { title: string; meta: string; content: string };

function AgentDetailPanel({ agent, dept, status, embedded, codeGraphMode, onClose }: {
  agent: Agent; dept: Dept; status: Status; embedded: boolean; codeGraphMode: boolean; onClose: () => void;
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
            <>
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
              <div style={S.agentPanelNote}>
                This is a structural node from this venture&rsquo;s code graph (graphify) — a file or
                symbol clustered under &ldquo;{dept.name}&rdquo;, not a YVON fleet agent. It has no
                purpose, skills, or Books; that only applies to real agents in Team mode.
              </div>
            </>
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
  root: {
    position: "fixed", inset: 0, background: "#0a0a0c", overflow: "hidden",
    fontFamily: "-apple-system,BlinkMacSystemFont,'SF Pro Text','Segoe UI',Inter,sans-serif",
    color: "#d8dae0", WebkitFontSmoothing: "antialiased",
  },
  rootEmbedded: {
    position: "absolute", inset: 0, background: "#0a0a0c", overflow: "hidden",
    fontFamily: "-apple-system,BlinkMacSystemFont,'SF Pro Text','Segoe UI',Inter,sans-serif",
    color: "#d8dae0", WebkitFontSmoothing: "antialiased",
  },
  starfield: {
    position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
    backgroundImage: STARFIELD_BG, backgroundRepeat: "repeat", backgroundSize: "340px 340px",
  },
  stage: { position: "absolute", inset: 0, cursor: "grab" },
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

  /* L3 — satellite orbs (doc §2.3) — Pos/Inner split, see deptCardPos note above. */
  satOrbPos: { position: "absolute", transform: "translate(-50%,-50%)", borderRadius: "50%", cursor: "pointer" },
  satOrbInner: {
    width: "100%", height: "100%", borderRadius: "50%",
    border: "1.5px solid", display: "flex", flexDirection: "column", alignItems: "center",
    justifyContent: "center", textAlign: "center", padding: 6,
    backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
    boxShadow: "0 10px 30px rgba(0,0,0,.4)", transition: "opacity .25s",
  },
  satChild: { boxShadow: "0 6px 18px rgba(0,0,0,.35)" },
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

  legend: { position: "fixed", bottom: 20, left: 28, zIndex: 20, display: "flex", gap: 16 },
  lg: { display: "flex", alignItems: "center", gap: 6, fontSize: 9.5, color: "#7b7f87", letterSpacing: "0.06em" },
  hint: { position: "fixed", bottom: 20, right: 28, zIndex: 20, fontSize: 9.5, color: "#7b7f87", letterSpacing: "0.06em" },
};
