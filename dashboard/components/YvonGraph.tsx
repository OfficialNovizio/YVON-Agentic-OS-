"use client";

import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { supabaseSource } from "@/lib/events/supabase-source";
import { applyEvent, bubbleUp, DECAY_MS } from "@/lib/events";

/* ═══════════════════════════════════════════════════════════════════════
   YVON GRAPH VIEWER  —  two levels

   LEVEL 1  overview   ·  core orb + DEPARTMENT cards (collision-free ring)
   LEVEL 2  detail     ·  one department + its AGENTS fanned out

   DATA IS REAL: /structure.json, generated from the Teams/ directory tree by
   scripts/build-structure.mjs (runs as `prebuild`, so every deploy regenerates).
   Agent ids are stable — slug(dept)-dirname — and are the contract with the
   run-event pipeline. Layout is computed once from sorted ids and never
   recomputes on state change, so nodes never reshuffle.
   ═══════════════════════════════════════════════════════════════════════ */

interface Agent { id: string; name: string; tag: string }
interface Dept {
  id: string;
  name: string;
  metric: string;
  metricLabel: string;
  agents: Agent[];
}

/* Real structure, generated from Teams/ by scripts/build-structure.mjs. */
interface Structure { version: number; departments: Dept[] }

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

/* ── ring layout + AABB relaxation → guaranteed no overlap ─────────── */
function buildLayout(DEPARTMENTS: Dept[]): { placed: Placed[]; stars: { x: number; y: number; r: number; o: number }[] } {
  const rnd = rngFrom(20260803);
  const n = DEPARTMENTS.length;

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

export default function YvonGraph() {
  const [DEPARTMENTS, setDepartments] = useState<Dept[]>([]);
  const [open, setOpen] = useState<Placed | null>(null);
  const [status, setStatus] = useState<Record<string, Status>>({});
  const [q, setQ] = useState("");
  // Real activity comes from the events table via Supabase Realtime (below).
  // `demo` is an explicitly-labelled simulator for screenshots — never on by default.
  const [demo, setDemo] = useState(false);
  // The four scopes of §12.1 — same components, filtered by context_id.
  const [scope, setScope] = useState("yvon-os");

  const [view, setView] = useState({ x: 0, y: 0, s: 0.52 });
  const drag = useRef({ on: false, px: 0, py: 0 });

  useEffect(() => {
    fetch("/structure.json")
      .then((r) => r.json())
      .then((s: Structure) => setDepartments(s.departments))
      .catch(() => setDepartments([]));
  }, []);

  // Layout computed ONCE per structure, from stable sorted ids → never reshuffles.
  const { placed, stars } = useMemo(() => buildLayout(DEPARTMENTS), [DEPARTMENTS]);

  useEffect(() => {
    setView({ x: window.innerWidth / 2 - CX * 0.52, y: window.innerHeight / 2 - CY * 0.52, s: 0.52 });
  }, []);

  /* ── LIVE ACTIVITY ─────────────────────────────────────────────────────
     Browser ⇄ Supabase Realtime directly. Vercel is never in this path — it
     cannot hold a live connection (§10.1). run.completed decays rather than
     switching off, so the map shows *recent* work (§12.2).                */
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

  // Departments inherit the strongest state of their agents (§12.2 bubble-up).
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
    <div style={S.root}>
      <style>{CSS}</style>

      <div style={S.hud}>
        <div>
          <div style={S.brand}>YVON</div>
          <div style={S.sub}>
            {open ? `${open.name.toUpperCase()} · ${open.agents.length} AGENTS`
                  : `${DEPARTMENTS.length} DEPARTMENTS · ${DEPARTMENTS.reduce((n, d) => n + d.agents.length, 0)} AGENTS${demo ? ` · ${activeCount} ACTIVE` : ""}`}
          </div>
        </div>
        <div style={{ display: "flex", gap: 5, pointerEvents: "auto" }}>
          {/* §12.1 — one app, four scopes; same components filtered by context_id */}
          {[["yvon-os", "YVON"], ["novizio", "Novizio"], ["hourbour", "Hourbour"], ["agentx", "AgentX"]].map(([id, label]) => (
            <button key={id} style={{ ...S.tab, ...(scope === id ? S.tabOn : {}) }}
              onClick={() => { setScope(id); setStatus({}); }}>{label}</button>
          ))}
          <button style={{ ...S.tab, ...(demo ? S.tabOn : {}), opacity: 0.7 }}
            onClick={() => { setDemo(d => !d); if (demo) setStatus({}); }}
            title="Simulated pulse — for screenshots only, not real activity">
            {demo ? "demo ON" : "demo"}
          </button>
        </div>
      </div>

      {!open && (
        <input style={S.search} placeholder="Search departments…" value={q}
          onChange={(e) => setQ(e.target.value)} />
      )}
      {open && <button style={S.back} onClick={() => setOpen(null)}>← All departments</button>}

      {/* ══ LEVEL 1 ══ */}
      {!open && (
        <div style={S.stage} onWheel={onWheel}
          onMouseDown={(e) => (drag.current = { on: true, px: e.clientX, py: e.clientY })}>
          <div style={{ position: "absolute", transformOrigin: "0 0",
            transform: `translate(${view.x}px,${view.y}px) scale(${view.s})` }}>

            <svg style={{ position: "absolute", overflow: "visible", pointerEvents: "none" }} width={3200} height={2100}>
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
                      <i key={i} style={{ flex: 1, height: `${h}%`, background: "rgba(255,255,255,.19)", borderRadius: 0.5 }} />
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
            return <i key={i} style={{ flex: 1, height: `${12 + r * 84}%`, background: "rgba(255,255,255,.22)", borderRadius: 0.5 }} />;
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
  brand: { fontSize: 12.5, fontWeight: 600, letterSpacing: "0.18em", color: "#c8cbd2" },
  sub: { fontSize: 10, color: "#4d5057", marginTop: 5, letterSpacing: "0.1em" },
  tab: {
    background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.09)",
    color: "#7b7f87", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase",
    padding: "6px 13px", borderRadius: 999, cursor: "pointer", fontFamily: "inherit", backdropFilter: "blur(10px)",
  },
  tabOn: { background: "rgba(142,123,240,.17)", borderColor: "rgba(142,123,240,.42)", color: "#c5bef6" },
  search: {
    position: "fixed", top: 22, left: "50%", transform: "translateX(-50%)", zIndex: 20,
    width: 250, padding: "8px 15px", borderRadius: 999,
    background: "rgba(255,255,255,.045)", border: "1px solid rgba(255,255,255,.09)",
    color: "#d8dae0", fontSize: 11.5, fontFamily: "inherit", outline: "none", backdropFilter: "blur(12px)",
  },
  back: {
    position: "fixed", top: 74, left: 28, zIndex: 22,
    background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.11)",
    color: "#a8acb4", fontSize: 11, padding: "7px 15px", borderRadius: 999,
    cursor: "pointer", fontFamily: "inherit", backdropFilter: "blur(12px)",
  },

  orbWrap: { position: "absolute", transform: "translate(-50%,-50%)" },
  orbGlow: {
    position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)",
    width: 620, height: 620, borderRadius: "50%", filter: "blur(22px)",
    background: "radial-gradient(circle, rgba(142,123,240,.18) 0%, rgba(142,123,240,.05) 40%, transparent 70%)",
  },
  orbBody: {
    position: "relative", width: 264, height: 264, borderRadius: "50%",
    background: "radial-gradient(circle at 36% 30%, #bcb6f7 0%, #9f97ec 26%, #857ada 48%, #6e64bf 70%, #4f4b88 100%)",
    boxShadow: "0 0 100px rgba(142,123,240,.3), inset -24px -28px 66px rgba(20,16,50,.55), inset 15px 13px 44px rgba(255,255,255,.15)",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  orbSheen: { position: "absolute", inset: 0, borderRadius: "50%", background: "radial-gradient(circle at 34% 26%, rgba(255,255,255,.32), transparent 46%)" },
  orbLabel: { position: "relative", zIndex: 2, fontSize: 21, fontWeight: 500, letterSpacing: "0.15em", color: "rgba(255,255,255,.92)" },

  deptCard: {
    position: "absolute", transform: "translate(-50%,-50%)", width: 232,
    background: "rgba(255,255,255,0.055)", border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 20, padding: "16px 18px 14px",
    backdropFilter: "blur(22px)", WebkitBackdropFilter: "blur(22px)",
    boxShadow: "0 14px 44px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.09)",
    cursor: "pointer", transition: "opacity .25s",
  },
  deptHead: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 },
  deptName: { fontSize: 13.5, fontWeight: 500, color: "#e8eaee" },
  bigNum: { fontSize: 40, fontWeight: 200, color: "#f0f2f5", lineHeight: 1, marginTop: 12, letterSpacing: "-0.02em" },
  numLabel: { fontSize: 10.5, color: "#83888f", marginTop: 6 },
  sparkRow: { display: "flex", alignItems: "flex-end", gap: 1.5, height: 30, marginTop: 14 },
  deptFoot: { fontSize: 8.5, color: "#4f545c", letterSpacing: "0.14em", marginTop: 10 },

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
    background: "rgba(255,255,255,0.062)", border: "1px solid rgba(255,255,255,0.13)",
    borderRadius: 26, padding: "24px 26px 22px",
    backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
    boxShadow: "0 20px 60px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,255,255,.10)",
  },
  agentPill: {
    position: "absolute", transform: "translate(-50%,-50%)",
    display: "flex", alignItems: "center", gap: 12, minWidth: 210,
    background: "rgba(255,255,255,0.052)", border: "1px solid rgba(255,255,255,.10)",
    borderRadius: 14, padding: "9px 16px 9px 11px",
    backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)",
    boxShadow: "0 8px 26px rgba(0,0,0,.42), inset 0 1px 0 rgba(255,255,255,.07)",
    transition: "border-color .3s",
  },
  avatar: { width: 30, height: 30, borderRadius: "50%", flex: "none", display: "block" },
  agentText: { display: "flex", flexDirection: "column", flex: 1 },
  agentName: { fontSize: 14, fontWeight: 450, color: "#eef0f3" },
  agentTag: { fontSize: 11, color: "#82878f", fontStyle: "normal", marginTop: 1 },
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
  lg: { display: "flex", alignItems: "center", gap: 6, fontSize: 9.5, color: "#4d5057", letterSpacing: "0.06em" },
  hint: { position: "fixed", bottom: 20, right: 28, zIndex: 20, fontSize: 9.5, color: "#4d5057", letterSpacing: "0.06em" },
};
