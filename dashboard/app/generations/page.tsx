'use client'

/**
 * Generations — asset library + generation surface.
 * Owner: mia · design.motion
 *
 * LAYOUT CONTRACT
 * ---------------
 * Shell renders `<main className="flex-1 overflow-hidden">` and hands full-bleed
 * pages a plain `height:100%` div. This page is therefore a normal height:100%
 * flex column. It must NEVER be `position:absolute; inset:0` — that escapes to
 * the viewport and paints over the sidebar and the TopBar. There is exactly one
 * app header (the dashboard TopBar); everything here sits below it.
 *
 * The controls are driven by lib/generation-models.ts — 439 real models across
 * 8 categories — so switching studio changes the roster, and switching model
 * changes which aspect ratios / quality steps / durations exist. A model with
 * no declared quality shows no quality pill rather than a fake default.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  ArrowLeft, Image as ImageIcon, Video, Upload, Plus, Scale, Ratio, Gem,
  Search, Check, Minus, Clock, Info, X, LayoutGrid,
} from 'lucide-react'
import { useShellFullBleed } from '@/components/Shell'
import {
  GEN_MODELS, STUDIOS, PROVIDER_LOGOS, INVERT_LOGOS, HERO_IMAGES,
  DEFAULT_IMAGE_MODEL, byId, providerHue, modelsForStudio,
  type GenModel,
} from '@/lib/generation-models'
import MarketingComposer from './MarketingComposer'
import './generations.css'

export type GenKind = 'image' | 'video' | 'upload'
export type GenStatus = 'running' | 'done' | 'failed' | 'discarded'

export interface GenerationRow {
  requestId: string; kind: GenKind; status: GenStatus; model: string
  sessionId: string | null; promptShape: 'json' | 'prose' | null
  width: number | null; height: number | null; aspect: string | null
  quality: string | null; seconds: number | null
  costUsd: number | null; pricingSource: string | null
  assetUrl: string | null; derivedFrom: string | null
  pollAttempt: number | null; pollCeiling: number | null; createdAt: string
}

interface ApiPayload {
  rows: GenerationRow[]; sessionCount: number; totalCount: number
  committedUsd: number | null; unpricedRows: number; regenerations: number
  balanceUsd: number | null
  session: { id: string; kind: string; gate: string; ceilingUsd: number | null; spec: string | null } | null
}

const money = (n: number | null | undefined) =>
  typeof n === 'number' && Number.isFinite(n) ? `$${n.toFixed(3).replace(/0$/, '')}` : null

type Pop = null | 'studio' | 'model' | 'aspect' | 'quality' | 'duration' | 'ab'
type PickerTab = 'all' | 'text' | 'image'

/** Brand logo with a lettered fallback — a blocked CDN degrades, never breaks. */
function Logo({ pk, name, size = 26, radius = 8 }: { pk?: string; name: string; size?: number; radius?: number }) {
  const [failed, setFailed] = useState(false)
  const src = pk ? PROVIDER_LOGOS[pk] : undefined
  if (src && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        className={`gen-logo${pk && INVERT_LOGOS.has(pk) ? ' inv' : ''}`}
        src={src} alt="" width={size} height={size}
        style={{ borderRadius: radius }}
        onError={() => setFailed(true)} loading="lazy"
      />
    )
  }
  const hue = providerHue(name)
  return (
    <span className="gen-logo disc" style={{
      width: size, height: size, borderRadius: radius,
      background: `linear-gradient(135deg, hsl(${hue} 70% 58%), hsl(${(hue + 48) % 360} 70% 46%))`,
    }}>{name.slice(0, 1).toUpperCase()}</span>
  )
}

export default function GenerationsPage() {
  const router = useRouter()
  const params = useSearchParams()
  const sessionId = params.get('session')
  const { setFullBleed } = useShellFullBleed()
  useEffect(() => { setFullBleed(true); return () => setFullBleed(false) }, [setFullBleed])

  const [data, setData] = useState<ApiPayload | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [scope, setScope] = useState<'session' | 'all'>(sessionId ? 'session' : 'all')
  const [kinds, setKinds] = useState<Set<GenKind>>(new Set(['image', 'video', 'upload']))
  const [selected, setSelected] = useState<string | null>(null)
  const [reason, setReason] = useState('')

  const [studioId, setStudioId] = useState('image')
  const studio = useMemo(() => STUDIOS.find((s) => s.id === studioId) ?? STUDIOS[0], [studioId])
  const studioModels = useMemo(() => modelsForStudio(studio), [studio])

  const [modelId, setModelId] = useState(DEFAULT_IMAGE_MODEL)
  const model = useMemo(() => byId(modelId) ?? studioModels[0] ?? GEN_MODELS[0], [modelId, studioModels])
  const [aspect, setAspect] = useState<string | null>(null)
  const [quality, setQuality] = useState<string | null>(null)
  const [seconds, setSeconds] = useState<number | null>(null)
  const [count, setCount] = useState(1)
  const [prompt, setPrompt] = useState('')
  const [abPair, setAbPair] = useState(false)
  const [pop, setPop] = useState<Pop>(null)
  const [pickerTab, setPickerTab] = useState<PickerTab>('all')
  const [pickerQ, setPickerQ] = useState('')
  const [pickerProv, setPickerProv] = useState<string | null>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const scopeRef = useRef<HTMLDivElement>(null)

  // Changing studio moves you to a model that studio can actually drive.
  useEffect(() => {
    if (!studioModels.length) return
    if (!studioModels.some((m) => m.id === modelId)) setModelId(studioModels[0].id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studioId])

  // Changing model resets every dependent control to THAT model's defaults.
  useEffect(() => {
    setAspect(model?.arDef ?? model?.ar?.[0] ?? null)
    setQuality(model?.qDef ?? model?.q?.[0] ?? null)
    setSeconds(model?.dur?.def ?? model?.dur?.min ?? null)
  }, [model])

  useEffect(() => {
    if (!pop) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setPop(null) }
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node
      if (barRef.current?.contains(t) || scopeRef.current?.contains(t)) return
      setPop(null)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onDown)
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('mousedown', onDown) }
  }, [pop])

  const load = useCallback(async () => {
    try {
      const qs = new URLSearchParams()
      if (scope === 'session' && sessionId) qs.set('session', sessionId)
      const res = await fetch(`/api/generations?${qs}`, { cache: 'no-store' })
      if (!res.ok) throw new Error(`/api/generations returned ${res.status}`)
      setData((await res.json()) as ApiPayload)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'could not reach /api/generations')
      setData(null)
    } finally { setLoading(false) }
  }, [scope, sessionId])

  useEffect(() => { void load() }, [load])
  useEffect(() => {
    if (!data?.rows.some((r) => r.status === 'running')) return
    const t = setInterval(() => { void load() }, 4000)
    return () => clearInterval(t)
  }, [data, load])

  const rows = useMemo(() => (data?.rows ?? []).filter((r) => kinds.has(r.kind)), [data, kinds])
  const active = useMemo(() => rows.find((r) => r.requestId === selected) ?? null, [rows, selected])
  const sess = data?.session ?? null
  const showHero = !loading && rows.length === 0        // empty OR failed — either way, the hero

  const pickerList = useMemo(() => {
    const q = pickerQ.trim().toLowerCase()
    return studioModels.filter((m) => {
      if (pickerTab === 'text' && !m.cat.startsWith('t2')) return false
      if (pickerTab === 'image' && !(m.cat.startsWith('i2') || m.cat === 'recast')) return false
      if (pickerProv && m.pk !== pickerProv) return false
      if (q && !`${m.name} ${m.prov ?? ''} ${m.id}`.toLowerCase().includes(q)) return false
      return true
    })
  }, [studioModels, pickerTab, pickerQ, pickerProv])

  const railProviders = useMemo(() => {
    const c = new Map<string, { pk: string; name: string; n: number }>()
    studioModels.forEach((m) => {
      if (!m.pk) return
      const e = c.get(m.pk) ?? { pk: m.pk, name: m.prov ?? m.pk, n: 0 }
      e.n++; c.set(m.pk, e)
    })
    return [...c.values()].sort((a, b) => b.n - a.n)
  }, [studioModels])

  const toggleKind = (k: GenKind) => setKinds((prev) => {
    const n = new Set(prev)
    if (n.has(k)) { if (n.size > 1) n.delete(k) } else n.add(k)
    return n
  })
  const copyId = (id: string) => { void navigator.clipboard?.writeText(id) }
  // Image-conditioned models cannot run on prose alone — say so on the control
  // rather than letting Generate fail at the API.
  const needsRef = Boolean(model && (model.cat.startsWith('i2') || model.cat === 'recast' || model.cat === 'lipsync'))
  const placeholder =
    needsRef ? `Describe the motion — ${model?.name} works from an attached image`
    : model?.cat === 't2v' ? 'Describe the shot you want to create'
    : 'Describe the image you want to create'

  const estimate: number | null = null   // no estimate endpoint wired yet — never guessed
  const total = abPair ? 2 : count

  return (
    <div className="gen-shell" data-testid="generations">

      {sess ? (
        <div className="gen-ctx">
          <span className="badge">session</span>
          <span className="nm">{sess.kind}</span>
          <span className="st">
            {sess.gate} · <b>waiting on your selection</b>
            {sess.ceilingUsd !== null && <> · ceiling <b>{money(sess.ceilingUsd)} strict</b></>}
          </span>
          <span className="sp" />
          <button className="back" onClick={() => router.push('/chat')}>
            <ArrowLeft size={13} /> back to chat
          </button>
        </div>
      ) : (
        <div className="gen-ctx idle">
          <span className="badge">library</span>
          <span className="st">every generation, all sessions · open this tab from a session to select into one</span>
        </div>
      )}

      {/* ── scope + studio switcher ── */}
      <div className="gen-scope" ref={scopeRef}>
        <button className="gen-studio" aria-expanded={pop === 'studio'}
                onClick={() => setPop(pop === 'studio' ? null : 'studio')}>
          <LayoutGrid size={14} />
          <span>{studio.label}</span>
          <span className="caret">⌄</span>
        </button>

        {pop === 'studio' && (
          <div className="gen-pop studios" role="dialog" aria-label="Choose a studio">
            <p className="pl">studios · {STUDIOS.length} connected</p>
            {STUDIOS.map((s) => (
              <button key={s.id} className={`sr ${s.id === studioId ? 'on' : ''}`}
                      onClick={() => { setStudioId(s.id); setPop(null); setPickerQ(''); setPickerProv(null) }}>
                <span className="sn">{s.label}</span>
                <span className="sd">
                  {modelsForStudio(s).length} models · {s.note ?? s.cats.join(' · ')}
                </span>
                {s.id === studioId && <Check size={14} className="sc" />}
              </button>
            ))}
          </div>
        )}

        <span className="div" />

        <div className="gen-seg" role="group" aria-label="Scope">
          <button aria-pressed={scope === 'session'} disabled={!sessionId} onClick={() => setScope('session')}>
            This session <span className="c">{data?.sessionCount ?? '—'}</span>
          </button>
          <button aria-pressed={scope === 'all'} onClick={() => setScope('all')}>
            All <span className="c">{data?.totalCount ?? '—'}</span>
          </button>
        </div>

        <button className="gen-chip" aria-pressed={kinds.has('image')} onClick={() => toggleKind('image')}>
          <ImageIcon size={13} /> images
        </button>
        <button className="gen-chip" aria-pressed={kinds.has('video')} onClick={() => toggleKind('video')}>
          <Video size={13} /> video
        </button>
        <button className="gen-chip" aria-pressed={kinds.has('upload')} onClick={() => toggleKind('upload')}>
          <Upload size={13} /> uploads
        </button>

        <span className="sp" />
        <span className="meta">
          keyed by <b>request_id</b> ·{' '}
          {money(data?.committedUsd ?? null)
            ? <b>{money(data!.committedUsd)}</b>
            : <span className="na">nothing spent</span>}
          {(data?.unpricedRows ?? 0) > 0 && <> · <span className="na">{data!.unpricedRows} unpriced</span></>}
        </span>
      </div>

      {/* ── body ── */}
      <div className={`gen-body${active ? ' with-drawer' : ''}`}>
        <div className="gen-canvas">
          {loading ? (
            <p className="gen-msg">loading…</p>
          ) : showHero ? (
            <div className="gen-hero">
              <div className="gen-fan" aria-hidden="true">
                {HERO_IMAGES.map((src, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={src} className={`f f${i + 1}`} src={src} alt="" loading="lazy"
                       onError={(e) => {
                         // Swap to a transparent pixel so a blocked CDN leaves a clean
                         // tinted plate rather than the browser's broken-image glyph.
                         const el = e.currentTarget as HTMLImageElement
                         el.classList.add('fallback')
                         el.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
                       }} />
                ))}
              </div>
              <p className="h1">Start creating with</p>
              <p className="h2">{studioId === 'marketing' ? 'Marketing Studio' : (model?.name ?? 'a model')}</p>
              <p className="hsub">
                {sess?.spec
                  ? 'The session has approved a spec. It is loaded below and locked — change it only by reopening the gate.'
                  : studioId === 'marketing'
                    ? 'Write the script, upload your product, pick a motion template — and watch the ad come to life.'
                    : 'Describe a scene, character, mood, or style — and watch it come to life.'}
              </p>
              {error && (
                <p className="gen-errchip" role="status">
                  the library could not be read — <b>{error}</b>
                </p>
              )}
            </div>
          ) : (
            <div className="gen-grid">
              {rows.map((r) => (
                <button key={r.requestId}
                        className={`gen-card${r.status === 'discarded' ? ' discarded' : ''}`}
                        aria-selected={r.requestId === selected}
                        onClick={() => setSelected(r.requestId === selected ? null : r.requestId)}
                        onDoubleClick={() => copyId(r.requestId)}
                        title="click to select · double-click to copy request_id">
                  {r.promptShape && <span className={`tag ${r.promptShape}`}>{r.promptShape} prompt</span>}
                  {r.status === 'running' ? (
                    <div className="pending">
                      rendering…<br />
                      {r.pollAttempt !== null && r.pollCeiling !== null
                        ? <><b>poll {r.pollAttempt} of {r.pollCeiling}</b><br /></>
                        : <>poll position not reported<br /></>}
                      <span className="warn">not persisted — a refresh loses this</span>
                    </div>
                  ) : r.assetUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img className="thumb" src={r.assetUrl} alt={`${r.kind} ${r.requestId}`} loading="lazy" />
                  ) : <div className="pending">no asset url returned</div>}
                  <div className="cb">
                    <div className="cid">
                      <span className="id">{r.requestId}</span>
                      <span className={`gen-status ${r.status}`}>{r.status}</span>
                    </div>
                    <p className="cm">
                      {r.model}<br />
                      {[r.width && r.height ? `${r.width}×${r.height}` : null, r.aspect, r.quality,
                        r.seconds ? `${r.seconds}s` : null].filter(Boolean).join(' · ') || 'params not recorded'}<br />
                      {money(r.costUsd) ?? <span className="na">unpriced</span>}
                      {r.derivedFrom && <><br />from {r.derivedFrom}</>}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Drawer exists only when something is selected. */}
        {active && (
          <aside className="gen-drawer">
            <div className="dh">
              <div><p className="t">Selected</p><p className="s">{active.requestId}</p></div>
              <button className="dclose" onClick={() => setSelected(null)} aria-label="Close"><X size={15} /></button>
            </div>
            <div className="dsec">
              <p className="dl">what made it</p>
              <div className="gen-kv"><span className="k">model</span><span className="v">{active.model}</span></div>
              <div className="gen-kv"><span className="k">prompt shape</span>
                <span className={`v${active.promptShape ? ' accent' : ' na'}`}>{active.promptShape ?? 'not recorded'}</span></div>
              <div className="gen-kv"><span className="k">aspect</span>
                <span className={`v${active.aspect ? '' : ' na'}`}>{active.aspect ?? 'not recorded'}</span></div>
              <div className="gen-kv"><span className="k">quality</span>
                <span className={`v${active.quality ? '' : ' na'}`}>{active.quality ?? 'not recorded'}</span></div>
              {active.seconds !== null && (
                <div className="gen-kv"><span className="k">duration</span><span className="v">{active.seconds}s</span></div>
              )}
            </div>
            <div className="dsec">
              <p className="dl">cost</p>
              <div className="gen-kv"><span className="k">this asset</span>
                <span className={`v${money(active.costUsd) ? '' : ' na'}`}>{money(active.costUsd) ?? 'unpriced'}</span></div>
              <div className="gen-kv"><span className="k">source</span>
                <span className={`v${active.pricingSource ? '' : ' na'}`}>{active.pricingSource ?? 'no rate'}</span></div>
            </div>
            <div className="dsec">
              <p className="dl">actions</p>
              <button className="gen-btn primary" disabled={!sess || active.status !== 'done'}>Use in session →</button>
              <button className="gen-btn" onClick={() => copyId(active.requestId)}>Copy request_id</button>
              <textarea className="gen-reason" placeholder="What changed in the prompt? Required before a regeneration."
                        value={reason} onChange={(e) => setReason(e.target.value)} />
              <button className="gen-btn" disabled={reason.trim().length < 12}>Regenerate</button>
              <button className="gen-btn danger" disabled={active.status === 'discarded'}>Discard</button>
              <p className="gen-note">
                <b>Regenerate needs a reason.</b> Not a mood — a change to the request. A discard
                is <b>not a refund</b>: the row stays on the ledger.
              </p>
            </div>
          </aside>
        )}

        {/* ── composer ──
            Marketing is not this bar with a different roster. It has no model
            dropdown (resolution picks the endpoint), three typed upload slots
            whose order IS the prompt's @image1/@image2, and a motion-template
            picker. It gets its own composer rather than a pile of conditionals
            in this one. */}
        <div className="gen-barwrap">
          {studioId === 'marketing' ? (
            <MarketingComposer spec={sess?.spec ?? null} onSubmitted={() => { void load() }} />
          ) : (
          <div className="gen-bar" ref={barRef}>

            {pop === 'model' && (
              <div className="gen-pop picker" role="dialog" aria-label="Choose a model">
                <div className="prail">
                  <button className={`pr ${pickerProv === null ? 'on' : ''}`} onClick={() => setPickerProv(null)} title="All providers">
                    <span className="gen-logo disc all">★</span>
                  </button>
                  {railProviders.map((p) => (
                    <button key={p.pk} className={`pr ${pickerProv === p.pk ? 'on' : ''}`} title={`${p.name} · ${p.n}`}
                            onClick={() => setPickerProv(pickerProv === p.pk ? null : p.pk)}>
                      <Logo pk={p.pk} name={p.name} size={28} radius={999} />
                    </button>
                  ))}
                </div>
                <div className="ppan">
                  <div className="pf">
                    <button className={pickerTab === 'all' ? 'on' : ''} onClick={() => setPickerTab('all')}>All</button>
                    <button className={pickerTab === 'text' ? 'on' : ''} onClick={() => setPickerTab('text')}>From text</button>
                    <button className={pickerTab === 'image' ? 'on' : ''} onClick={() => setPickerTab('image')}>From image</button>
                    <span className="sp" />
                    <button className="close" onClick={() => setPop(null)} aria-label="Close"><X size={14} /></button>
                  </div>
                  <label className="psearch">
                    <Search size={13} />
                    <input value={pickerQ} onChange={(e) => setPickerQ(e.target.value)}
                           placeholder={`Search ${studioModels.length} ${studio.label.toLowerCase()} models…`} autoFocus />
                  </label>
                  <p className="plab">{pickerList.length} model{pickerList.length === 1 ? '' : 's'}</p>
                  <div className="plist">
                    {pickerList.slice(0, 200).map((m) => (
                      <button key={`${m.cat}-${m.id}`} className={`m ${m.id === modelId ? 'on' : ''}`}
                              onClick={() => { setModelId(m.id); setPop(null); setPickerQ('') }}>
                        <Logo pk={m.pk} name={m.prov ?? m.name} size={26} radius={8} />
                        <span className="mm">
                          <span className="mn">{m.name}</span>
                          <span className="mp">{m.prov ?? '—'}</span>
                        </span>
                        {m.id === modelId && <Check size={14} className="mc" />}
                      </button>
                    ))}
                    {pickerList.length === 0 && <p className="pnone">nothing matches “{pickerQ}”</p>}
                  </div>
                </div>
              </div>
            )}

            {pop === 'aspect' && model?.ar && (
              <div className="gen-pop list" role="dialog" aria-label="Aspect ratio">
                <p className="pl">aspect ratio · {model.ar.length} for {model.name}</p>
                {model.ar.map((a) => (
                  <button key={a} className={a === aspect ? 'on' : ''} onClick={() => { setAspect(a); setPop(null) }}>
                    {a}{a === aspect && <Check size={13} />}
                  </button>
                ))}
              </div>
            )}

            {pop === 'quality' && model?.q && (
              <div className="gen-pop list" role="dialog" aria-label="Quality">
                <p className="pl">{model.qf ?? 'quality'} · from the registry</p>
                {model.q.map((q) => (
                  <button key={q} className={q === quality ? 'on' : ''} onClick={() => { setQuality(q); setPop(null) }}>
                    {q}{q === quality && <Check size={13} />}
                  </button>
                ))}
              </div>
            )}

            {pop === 'duration' && model?.dur && (
              <div className="gen-pop list" role="dialog" aria-label="Duration">
                <p className="pl">duration · min {model.dur.min}s · max {model.dur.max}s</p>
                {durationSteps(model).map((d) => (
                  <button key={d} className={d === seconds ? 'on' : ''} onClick={() => { setSeconds(d); setPop(null) }}>
                    {d}s{d === seconds && <Check size={13} />}
                  </button>
                ))}
              </div>
            )}

            {pop === 'ab' && (
              <div className="gen-pop explain" role="dialog" aria-label="What A/B does">
                <p className="pl">what this button does</p>
                <p>It sends your intent <b>twice, as two separate requests</b> — once as a structured
                  JSON prompt, once as the same thing written as a paragraph. Two assets come back,
                  each tagged with the shape that made it.</p>
                <p>It is not asking which image is prettier. It asks one thing:
                  <b> is the spec tight enough that the wording does not change the result?</b> If the
                  two disagree badly, the spec is underspecified and a bigger budget will not fix it.</p>
                <p className="warn"><b>{model?.name ?? 'This model'} has no seed input</b>, so the two
                  runs differ by prompt <i>and</i> by noise. That is a real limit on what it proves.</p>
                {!sess?.spec && <p className="warn">Disabled here because there is no approved spec to
                  express two ways. Open this tab from a session to use it.</p>}
                <button className="gen-btn" onClick={() => setPop(null)}>Got it</button>
              </div>
            )}

            {sess?.spec && (
              <div className="gen-spec">
                <span className="tag">from spec</span>
                <span className="tx">approved by the session · <b>edits reopen the spec gate</b></span>
              </div>
            )}

            <div className="gen-prow">
              <button className={`gen-plus${needsRef ? ' req' : ''}`}
                      aria-label={needsRef ? 'Attach the product image (required)' : 'Attach an image'}
                      title={needsRef ? `${model?.name} is image-to-video — it needs a reference image` : 'Attach an image'}>
                <Plus size={17} />
              </button>
              <textarea className="gen-prompt" readOnly={Boolean(sess?.spec)}
                        value={sess?.spec ?? prompt} onChange={(e) => setPrompt(e.target.value)}
                        placeholder={placeholder} aria-label="Prompt" rows={1} />
            </div>

            {/* One row. Controls shrink and scroll; the button never wraps away. */}
            <div className="gen-ctrl">
              <div className="gen-ctls">
                <button className="gen-ctl model" aria-expanded={pop === 'model'}
                        onClick={() => setPop(pop === 'model' ? null : 'model')}>
                  <Logo pk={model?.pk} name={model?.prov ?? model?.name ?? '?'} size={17} radius={5} />
                  <span className="lbl">{model?.name ?? 'Model'}</span><span className="caret">⌄</span>
                </button>

                {model?.ar && (
                  <button className="gen-ctl" aria-expanded={pop === 'aspect'} onClick={() => setPop(pop === 'aspect' ? null : 'aspect')}>
                    <span className="ic"><Ratio size={13} /></span>{aspect ?? '—'}
                  </button>
                )}
                {model?.q && (
                  <button className="gen-ctl" aria-expanded={pop === 'quality'} onClick={() => setPop(pop === 'quality' ? null : 'quality')}>
                    <span className="ic"><Gem size={13} /></span>{quality ?? '—'}
                  </button>
                )}
                {model?.dur && (
                  <button className="gen-ctl" aria-expanded={pop === 'duration'} onClick={() => setPop(pop === 'duration' ? null : 'duration')}>
                    <span className="ic"><Clock size={13} /></span>{seconds ?? '—'}s
                  </button>
                )}

                <span className="gen-ctl stepper">
                  <button onClick={() => setCount((c) => Math.max(1, c - 1))} aria-label="Fewer"><Minus size={12} /></button>
                  <span className="n">{count}/4</span>
                  <button onClick={() => setCount((c) => Math.min(4, c + 1))} aria-label="More"><Plus size={12} /></button>
                </span>

                <button className="gen-ctl ab" aria-pressed={abPair} disabled={!sess?.spec}
                        onClick={() => { if (sess?.spec) setAbPair((v) => !v) }}>
                  <span className="ic"><Scale size={13} /></span><span className="lbl">A/B</span>
                </button>
                <button className="gen-ctl icon" aria-label="What does A/B do?"
                        onClick={() => setPop(pop === 'ab' ? null : 'ab')}><Info size={13} /></button>

                </div>

              <div className="gen-fire">
                {estimate === null && (
                  <span className="gen-noprice" title="Nothing is generated until POST /models/{id}/estimate-cost returns a number. That call is not wired yet.">
                    no price yet
                  </span>
                )}
                <button className="gen-go" disabled={estimate === null}
                        title="Blocked until the estimate endpoint returns a number">
                  Generate{total > 1 && <span className="n">{total}</span>}
                  {estimate !== null && <span className="p">{money(estimate)}</span>}
                </button>
              </div>
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  )
}

function durationSteps(m: GenModel): number[] {
  const d = m.dur
  if (!d || d.min === null || d.max === null) return []
  const step = d.step && d.step > 0 ? d.step : 1
  const out: number[] = []
  for (let s = d.min; s <= d.max && out.length < 24; s += step) out.push(s)
  return out
}
