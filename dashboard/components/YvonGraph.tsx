"use client";

import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { supabaseSource } from "@/lib/events/supabase-source";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { applyEvent, bubbleUp, DECAY_MS } from "@/lib/events";
import { useWorkspace } from "@/lib/WorkspaceContext";

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

interface Agent { id: string; name: string; tag: string }
interface Dept {
  id: string;
  name: string;
  metric: string;
  metricLabel: string;
  agents: Agent[];
}

/* Real structure, generated from Teams/ by scripts/build-structure.mjs (doc §1.1). */
interface Structure { version: number; departments: Dept[] }

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
    stars.push({ x, y, r: 1.4 + rnd() * 2.8, o: 0.05 + rnd() * 0.24 });
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

  const [view, setView] = useState({ x: 0, y: 0, s: 0.52 });
  const drag = useRef({ on: false, px: 0, py: 0 });

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
  const { placed, stars } = useMemo(() => buildLayout(DEPARTMENTS), [DEPARTMENTS]);

  // L3 satellite positions — recomputed only when contexts or grants change, not on every
  // status tick (doc §2.5.1).
  const satellites = useMemo(
    () => buildSatelliteLayout(contexts, ringSummary),
    [contexts, ringSummary],
  );

  // The scoped ring for whichever satellite is currently open — its own filtered department
  // list, re-laid-out with a seed derived from its own slug (doc §2.3).
  const satelliteRing = useMemo(() => {
    if (!openSatellite) return null;
    const depts = ringFor(openSatellite.slug, openSatellite.kind);
    return buildLayout(depts, seedFromSlug(openSatellite.slug));
  }, [openSatellite, ringFor]);

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

      <div style={S.hud}>
        <div>
          <div style={S.brand}>YVON</div>
          <div style={S.sub}>
            {open ? `${open.name.toUpperCase()} · ${open.agents.length} AGENTS`
              : openSatellite && satelliteRing
                ? `${openSatellite.name.toUpperCase()} · ${satelliteRing.placed.length} ACTIVE DEPTS · ${satelliteRing.placed.reduce((n, x) => n + x.agents.length, 0)} GRANTED AGENTS`
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
        <input style={S.search} placeholder="Search departments…" value={q}
          onChange={(e) => setQ(e.target.value)} />
      )}
      {open && (
        <button style={S.back} onClick={() => setOpen(null)}>
          ← {openSatellite ? openSatellite.name.toUpperCase() : "All departments"}
        </button>
      )}
      {openSatellite && !open && (
        <button style={S.back}
          onClick={() => { setOpenSatellite(null); setScope("yvon-os"); setStatus({}); }}>
          ← Universe
        </button>
      )}

      {/* ══ LEVEL 1 — universe: core ring + every satellite at once (doc §2.3) ══ */}
      {!open && !openSatellite && (
        <div style={S.stage} onWheel={onWheel}
          onMouseDown={(e) => (drag.current = { on: true, px: e.clientX, py: e.clientY })}>
          <div style={{ position: "absolute", transformOrigin: "0 0",
            transform: `translate(${view.x}px,${view.y}px) scale(${view.s})` }}>

            <svg style={{ position: "absolute", overflow: "visible", pointerEvents: "none" }} width={3600} height={2400}>
              {[300, 400, 500, 620].map((r, i) => (
                <ellipse key={r} cx={CX} cy={CY} rx={r * 1.45} ry={r * 0.99} fill="none"
                  stroke={`rgba(255,255,255,${0.038 - i * 0.006})`} strokeWidth={1} />
              ))}
              {stars.map((s, i) => (
                <circle key={i} cx={s.x} cy={s.y} r={s.r} fill={`rgba(205,210,222,${s.o})`} />
              ))}
              {placed.map((p) => (
                <line key={p.id} x1={CX} y1={CY} x2={p.x} y2={p.y}
                  stroke="rgba(255,255,255,0.045)" strokeWidth={1} />
              ))}
              {/* Grant edges (doc §2.4) — thin, static, low opacity, visually distinct (dashed,
                  violet-tinted) from department spokes. Membership, not execution. */}
              {satellites.map((s) => (
                <line key={"sat-edge-" + s.ctx.slug} x1={CX} y1={CY} x2={s.x} y2={s.y}
                  stroke="rgba(142,123,240,0.16)" strokeWidth={1.2} strokeDasharray="2 5" />
              ))}
              {satellites.flatMap((s) => s.children.map((c) => (
                <line key={"sub-edge-" + c.ctx.slug} x1={s.x} y1={s.y} x2={c.x} y2={c.y}
                  stroke="rgba(142,123,240,0.22)" strokeWidth={1} strokeDasharray="1.5 4" />
              )))}
            </svg>

            <div style={{ ...S.orbWrap, left: CX, top: CY }}>
              <div style={S.orbGlow} />
              <div style={S.orbBody}>
                <div style={S.orbSheen} />
                <span style={S.orbLabel}>YVON</span>
              </div>
            </div>

            {placed.map((p) => {
              const st = rolled[p.id] ?? "idle";
              return (
                <div key={p.id} onClick={() => setOpen(p)}
                  style={{ ...S.deptCard, left: p.x, top: p.y, opacity: dim(p.name) ? 0.2 : 1 }}>
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
              );
            })}

            {/* ══ L3 — satellite orbs (doc §2.3) ══
                Ring size scales with active-department count; zero-node rings are legal
                (single-department brand); zero-grant brands render dimmed with an explicit
                affordance rather than being hidden. */}
            {satellites.map((s) => {
              const empty = s.agentCount === 0;
              const openThis = () => { setOpenSatellite(s.ctx); setScope(s.ctx.contextPath ?? s.ctx.slug); setStatus({}); };
              return (
                <React.Fragment key={s.ctx.slug}>
                  <div onClick={openThis}
                    style={{
                      ...S.satOrb,
                      left: s.x, top: s.y, width: s.r * 2, height: s.r * 2,
                      borderColor: empty ? "rgba(255,255,255,.14)" : `${s.ctx.color}66`,
                      background: empty
                        ? "rgba(255,255,255,.03)"
                        : `radial-gradient(circle at 36% 30%, ${s.ctx.color}55, ${s.ctx.color}18 60%, transparent 100%)`,
                      opacity: empty ? 0.55 : 1,
                    }}>
                    <span style={S.satLabel}>{s.ctx.name}</span>
                    <span style={S.satSub}>
                      {empty ? "NO AGENTS GRANTED" : `${s.deptCount} DEPT · ${s.agentCount} AGENTS`}
                    </span>
                  </div>
                  {s.children.map((c) => {
                    const cEmpty = c.agentCount === 0;
                    return (
                      <div key={c.ctx.slug}
                        onClick={() => { setOpenSatellite(c.ctx); setScope(c.ctx.contextPath ?? c.ctx.slug); setStatus({}); }}
                        style={{
                          ...S.satOrb, ...S.satChild,
                          left: c.x, top: c.y, width: c.r * 2, height: c.r * 2,
                          borderColor: cEmpty ? "rgba(255,255,255,.14)" : `${c.ctx.color}66`,
                          background: cEmpty ? "rgba(255,255,255,.03)" : `${c.ctx.color}30`,
                          opacity: cEmpty ? 0.5 : 0.92,
                        }}>
                        <span style={S.satLabelSm}>{c.ctx.name}</span>
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
        <div style={S.stage} onWheel={onWheel}
          onMouseDown={(e) => (drag.current = { on: true, px: e.clientX, py: e.clientY })}>
          <div style={{ position: "absolute", transformOrigin: "0 0",
            transform: `translate(${view.x}px,${view.y}px) scale(${view.s})` }}>

            <svg style={{ position: "absolute", overflow: "visible", pointerEvents: "none" }} width={3600} height={2400}>
              {satelliteRing.stars.map((s, i) => (
                <circle key={i} cx={s.x} cy={s.y} r={s.r} fill={`rgba(205,210,222,${s.o})`} />
              ))}
              {satelliteRing.placed.map((p) => (
                <line key={p.id} x1={CX} y1={CY} x2={p.x} y2={p.y}
                  stroke="rgba(255,255,255,0.045)" strokeWidth={1} />
              ))}
            </svg>

            <div style={{ ...S.orbWrap, left: CX, top: CY }}>
              <div style={{ ...S.orbGlow, background: `radial-gradient(circle, ${openSatellite.color}30 0%, ${openSatellite.color}0d 40%, transparent 70%)` }} />
              <div style={{ ...S.orbBody, background: `radial-gradient(circle at 36% 30%, ${openSatellite.color}dd 0%, ${openSatellite.color}99 48%, ${openSatellite.color}55 100%)` }}>
                <div style={S.orbSheen} />
                <span style={S.orbLabel}>{openSatellite.name.toUpperCase()}</span>
              </div>
            </div>

            {satelliteRing.placed.length === 0 && (
              <div style={{ ...S.satEmptyNote, left: CX, top: CY + 260 }}>
                No agents granted to {openSatellite.name} yet — grant access in Settings.
              </div>
            )}

            {satelliteRing.placed.map((p) => {
              const st = rolled[p.id] ?? "idle";
              return (
                <div key={p.id} onClick={() => setOpen(p)}
                  style={{ ...S.deptCard, left: p.x, top: p.y, opacity: dim(p.name) ? 0.2 : 1 }}>
                  <div style={S.deptHead}>
                    <span style={S.deptName}>{p.name}</span>
                    <Pip status={st} />
                  </div>
                  <div style={S.bigNum}>{p.agents.length}</div>
                  <div style={S.numLabel}>GRANTED AGENTS</div>
                  <div style={S.sparkRow}>
                    {p.bars.map((h, i) => (
                      <i key={i} style={{ flex: 1, height: `${h}%`, background: "rgba(255,255,255,.32)", borderRadius: 0.5 }} />
                    ))}
                  </div>
                  <div style={S.deptFoot}>{p.agents.length} AGENTS</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══ LEVEL 2 ══ */}
      {open && <DetailView dept={open} status={rolled} />}

      <div style={S.legend}>
        {([["ACTIVE", MINT], ["ERROR", CORAL], ["IDLE", "#5a5f68"], ["CORE", VIOLET]] as [string, string][]).map(([l, c]) => (
          <div key={l} style={S.lg}>
            <i style={{ width: 7, height: 7, borderRadius: "50%", background: c, display: "block" }} />{l}
          </div>
        ))}
      </div>
      {!open && <div style={S.hint}>CLICK A DEPARTMENT · SCROLL TO ZOOM · DRAG TO PAN</div>}
      <div style={S.vig} />
    </div>
  );
}

/* ══ DETAIL VIEW ══ */
function DetailView({ dept, status }: { dept: Dept; status: Record<string, Status> }) {
  const n = dept.agents.length;
  const rowH = Math.min(94, 720 / n);
  const startY = 500 - ((n - 1) * rowH) / 2;

  const rows = dept.agents.map((a, i) => {
    const t = n > 1 ? i / (n - 1) : 0.5;
    const bow = Math.sin(t * Math.PI) * 78;
    return { ...a, x: 1120 + bow, y: startY + i * rowH };
  });

  const HUB = { x: 880, y: 500 };
  const activeRows = rows.filter((r) => (status[r.id] ?? "idle") === "active");

  return (
    <div style={S.detailStage}>
      <div style={S.edgeGlow} />

      <svg style={S.detailSvg} viewBox="0 0 1900 1000" preserveAspectRatio="xMidYMid slice">
        {Array.from({ length: 70 }).map((_, i) => {
          const r = rngFrom(9000 + i * 37);
          const x = 250 + r() * 720, y = 50 + r() * 900;
          return <circle key={i} cx={x} cy={y} r={2 + r() * 5} fill={`rgba(200,206,218,${0.05 + r() * 0.15})`} />;
        })}

        {rows.map((r) => {
          const on = (status[r.id] ?? "idle") === "active";
          return (
            <path key={r.id}
              d={`M ${HUB.x} ${HUB.y} C ${HUB.x + 120} ${HUB.y}, ${r.x - 160} ${r.y}, ${r.x - 20} ${r.y}`}
              fill="none"
              stroke={on ? "rgba(140,225,235,.55)" : "rgba(255,255,255,.13)"}
              strokeWidth={on ? 2 : 1}
              style={on ? { filter: "drop-shadow(0 0 6px rgba(140,225,235,.6))" } : undefined} />
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
      </svg>

      <div style={S.detailDept}>
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
          <div key={r.id} style={{
            ...S.agentPill,
            left: `${(r.x / 1900) * 100}%`,
            top: `${(r.y / 1000) * 100}%`,
            borderColor: st === "active" ? "rgba(61,220,151,.34)"
              : st === "error" ? "rgba(255,107,96,.42)" : "rgba(255,255,255,.10)",
          }}>
            {st === "active" && <><span style={S.halo1} /><span style={S.halo2} /></>}
            <span style={{
              ...S.avatar,
              background: st === "active" ? MINT : "rgba(255,255,255,.08)",
              border: st === "error" ? `2.5px solid ${CORAL}` : "none",
              boxShadow: st === "active" ? `0 0 18px ${MINT}aa` : "none",
            }} />
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
        );
      })}
    </div>
  );
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

  deptCard: {
    position: "absolute", transform: "translate(-50%,-50%)", width: 232,
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

  /* L3 — satellite orbs (doc §2.3) */
  satOrb: {
    position: "absolute", transform: "translate(-50%,-50%)", borderRadius: "50%",
    border: "1.5px solid", display: "flex", flexDirection: "column", alignItems: "center",
    justifyContent: "center", textAlign: "center", cursor: "pointer", padding: 6,
    backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
    boxShadow: "0 10px 30px rgba(0,0,0,.4)", transition: "opacity .25s, transform .2s",
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
    position: "absolute", left: "24%", top: "50%", transform: "translate(-50%,-50%)", width: 330,
    background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.22)",
    borderRadius: 26, padding: "24px 26px 22px",
    backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
    boxShadow: "0 20px 60px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.18)",
  },
  agentPill: {
    position: "absolute", transform: "translate(-50%,-50%)",
    display: "flex", alignItems: "center", gap: 12, minWidth: 210,
    background: "rgba(255,255,255,0.09)", border: "1px solid rgba(255,255,255,.18)",
    borderRadius: 14, padding: "9px 16px 9px 11px",
    backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)",
    boxShadow: "0 8px 26px rgba(0,0,0,.38), inset 0 1px 0 rgba(255,255,255,.12)",
    transition: "border-color .3s",
  },
  avatar: { width: 30, height: 30, borderRadius: "50%", flex: "none", display: "block" },
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

  legend: { position: "fixed", bottom: 20, left: 28, zIndex: 20, display: "flex", gap: 16 },
  lg: { display: "flex", alignItems: "center", gap: 6, fontSize: 9.5, color: "#7b7f87", letterSpacing: "0.06em" },
  hint: { position: "fixed", bottom: 20, right: 28, zIndex: 20, fontSize: 9.5, color: "#7b7f87", letterSpacing: "0.06em" },
};
