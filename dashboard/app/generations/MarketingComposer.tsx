'use client'

/**
 * Marketing Studio composer — port of Open-Generative-AI's MarketingStudio.jsx.
 * Owner: mia · design.motion
 *
 * WHAT THIS IS
 * ------------
 * Marketing is NOT the generic composer with a filtered model list. It has no
 * model dropdown at all: resolution picks the endpoint. What it has instead is
 * three typed upload slots whose ORDER is the prompt's @image1 / @image2, a
 * motion-template picker whose selection is sent as `video_files`, and an
 * avatar preset grid. Rebuilding it as "video studio with 2 models" produces a
 * bar that cannot express the request — that was the first attempt, and it was
 * wrong.
 *
 * WHAT CHANGED FROM UPSTREAM, AND WHY
 * -----------------------------------
 * · Uploads POST to our own /api/muapi/upload rather than carrying an
 *   `x-api-key` in the browser. Upstream keeps the MuAPI key client-side in a
 *   non-HttpOnly cookie; we do not, and this composer must not reintroduce it.
 * · localStorage is namespaced under `yvon.marketing.v1` rather than upstream's
 *   `hg_marketing_studio_persistent`, and stores only text/urls — never a key.
 * · `alert()` on a failed upload is replaced by an inline error line.
 * · Cyan #22d3ee becomes Adora violet; the composer inherits generations.css.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { Check, X, Package, User, Images, Ratio, Gem, Clock, Loader2, Play } from 'lucide-react'
import {
  AVATAR_PRESETS, FORMAT_PRESETS, MARKETING_RATIOS, MARKETING_RES, MARKETING_DURATIONS,
  MARKETING_MAX_REFS, marketingEndpoint, marketingBlocker, marketingPayload,
  type MarketingRatio, type MarketingRes, type MarketingParams,
} from '@/lib/marketing-presets'

const STORE = 'yvon.marketing.v1'
type Slot = 'product' | 'avatar' | 'additional'
type Pop = null | 'format' | 'avatar' | 'ratio' | 'res' | 'duration'

export interface MarketingComposerProps {
  /** Locked script from an approved session spec, if any. */
  spec?: string | null
  /** Fired with the submitted request_id so the library can start polling. */
  onSubmitted?: (requestId: string) => void
}

/** One typed upload slot. Shows a thumbnail once filled, a % while uploading. */
function UploadSlot({ label, icon, url, pct, required, onPick, onClear }: {
  label: string; icon: React.ReactNode; url: string | null; pct: number
  required?: boolean; onPick: (f: FileList) => void; onClear: () => void
}) {
  const input = useRef<HTMLInputElement>(null)
  const busy = pct > 0 && pct < 100
  return (
    <div className="mk-slot">
      <button type="button" className={`mk-slotbtn${url ? ' on' : ''}${required && !url ? ' req' : ''}`}
              title={url ? `${label} — click to replace` : `Upload ${label}${required ? ' (required)' : ''}`}
              aria-label={`Upload ${label}`} onClick={() => input.current?.click()}>
        {busy ? <span className="pct">{pct}%</span>
          : url ? <img src={url} alt={label} className="thumb" />
          : icon}
      </button>
      <input ref={input} type="file" accept="image/*" hidden
             multiple={label === 'References'}
             onChange={(e) => { if (e.target.files?.length) onPick(e.target.files); e.target.value = '' }} />
      {url && (
        <button type="button" className="mk-clear" aria-label={`Remove ${label}`}
                onClick={onClear}><X size={9} /></button>
      )}
    </div>
  )
}

/**
 * One preset tile. The media is hotlinked from upstream's CDN, so it can fail
 * for reasons that have nothing to do with the preset being valid: the network
 * is down, the host is unreachable, or the browser lacks the H.264 decoder
 * (headless Chromium does not have it). A failed tile must still be selectable
 * and still say what it is — the preset works regardless of whether we could
 * show you a moving picture of it — so failure falls back to a labelled plate
 * rather than an empty box or a broken-image glyph.
 */
function PresetTile({ item, selected, video, onSelect }: {
  item: { id: string | number; name: string; url: string }
  selected: boolean; video?: boolean; onSelect: () => void
}) {
  const [broken, setBroken] = useState(false)
  return (
    <button type="button" className={`mkc${selected ? ' on' : ''}${broken ? ' broken' : ''}`}
            onClick={onSelect} title={item.name}>
      {broken ? (
        <span className="mkfall" aria-hidden="true">
          {video ? <Play size={17} /> : <User size={17} />}
        </span>
      ) : video ? (
        <video src={item.url} autoPlay loop muted playsInline preload="metadata"
               onError={() => setBroken(true)} />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.url} alt="" loading="lazy" onError={() => setBroken(true)} />
      )}
      <span className="mkn">{item.name}</span>
      {selected && <span className="mkck"><Check size={12} /></span>}
    </button>
  )
}

/** Grid popover of preset media — videos for formats, stills for avatars. */
function PresetGrid({ title, items, selected, video, onSelect }: {
  title: string
  items: { id: string | number; name: string; url: string }[]
  selected: string | null; video?: boolean; onSelect: (url: string, name: string) => void
}) {
  return (
    <div className="gen-pop mk-grid" role="dialog" aria-label={title}>
      <p className="pl">{title}</p>
      <div className="mkg">
        {items.map((it) => (
          <PresetTile key={it.id} item={it} video={video} selected={selected === it.url}
                      onSelect={() => onSelect(it.url, it.name)} />
        ))}
      </div>
    </div>
  )
}

export default function MarketingComposer({ spec, onSubmitted }: MarketingComposerProps) {
  const [prompt, setPrompt] = useState('')
  const [productImage, setProductImage] = useState<string | null>(null)
  const [avatarImage, setAvatarImage] = useState<string | null>(null)
  const [additionalImages, setAdditionalImages] = useState<string[]>([])
  const [format, setFormat] = useState(FORMAT_PRESETS[0])
  const [ratio, setRatio] = useState<MarketingRatio>('9:16')
  const [res, setRes] = useState<MarketingRes>('1080p')
  const [duration, setDuration] = useState(5)

  const [pct, setPct] = useState<Record<Slot, number>>({ product: 0, avatar: 0, additional: 0 })
  const [pop, setPop] = useState<Pop>(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [estimate, setEstimate] = useState<number | null>(null)
  const [estErr, setEstErr] = useState<string | null>(null)
  const barRef = useRef<HTMLDivElement>(null)

  const script = spec ?? prompt
  const params: MarketingParams = {
    prompt: script, ratio, res, duration,
    productImage, avatarImage, additionalImages, formatUrl: format?.url ?? null,
  }
  const blocker = marketingBlocker(params)

  // ── restore / persist (text and urls only — never a key) ──────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE)
      if (!raw) return
      const d = JSON.parse(raw)
      if (typeof d.prompt === 'string') setPrompt(d.prompt)
      if (typeof d.productImage === 'string') setProductImage(d.productImage)
      if (typeof d.avatarImage === 'string') setAvatarImage(d.avatarImage)
      if (Array.isArray(d.additionalImages)) setAdditionalImages(d.additionalImages.slice(0, MARKETING_MAX_REFS))
      if (MARKETING_RATIOS.includes(d.ratio)) setRatio(d.ratio)
      if (MARKETING_RES.includes(d.res)) setRes(d.res)
      if (MARKETING_DURATIONS.includes(d.duration)) setDuration(d.duration)
      const f = FORMAT_PRESETS.find((x) => x.url === d.formatUrl)
      if (f) setFormat(f)
    } catch { /* a corrupt draft is not worth a crash */ }
  }, [])

  useEffect(() => {
    const t = setTimeout(() => {
      try {
        localStorage.setItem(STORE, JSON.stringify({
          prompt, productImage, avatarImage, additionalImages,
          ratio, res, duration, formatUrl: format?.url ?? null,
        }))
      } catch { /* quota or private mode — the draft is a convenience, not state */ }
    }, 500)
    return () => clearTimeout(t)
  }, [prompt, productImage, avatarImage, additionalImages, ratio, res, duration, format])

  useEffect(() => {
    if (!pop) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setPop(null) }
    const onDown = (e: MouseEvent) => { if (!barRef.current?.contains(e.target as Node)) setPop(null) }
    document.addEventListener('keydown', onKey); document.addEventListener('mousedown', onDown)
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('mousedown', onDown) }
  }, [pop])

  // ── cost: resolution + duration decide it, so re-ask whenever they move ────
  useEffect(() => {
    let dead = false
    const ctl = new AbortController()
    setEstimate(null); setEstErr(null)
    const t = setTimeout(async () => {
      try {
        const r = await fetch('/api/muapi/estimate', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: ctl.signal,
          body: JSON.stringify({ endpoint: marketingEndpoint(res), payload: { duration, aspect_ratio: ratio } }),
        })
        if (!r.ok) throw new Error(`estimate returned ${r.status}`)
        const d = await r.json()
        if (typeof d?.cost !== 'number' || !Number.isFinite(d.cost)) throw new Error('estimate returned no cost')
        if (!dead) setEstimate(d.cost)
      } catch (e) {
        if (!dead && (e as Error).name !== 'AbortError') setEstErr((e as Error).message)
      }
    }, 250)
    return () => { dead = true; ctl.abort(); clearTimeout(t) }
  }, [res, duration, ratio])

  const upload = useCallback(async (slot: Slot, files: FileList) => {
    setErr(null)
    const room = slot === 'additional' ? MARKETING_MAX_REFS - additionalImages.length : 1
    for (const file of Array.from(files).slice(0, Math.max(0, room))) {
      try {
        setPct((p) => ({ ...p, [slot]: 1 }))
        const fd = new FormData()
        fd.append('file', file)
        const r = await fetch('/api/muapi/upload', { method: 'POST', body: fd })
        if (!r.ok) throw new Error(`upload failed — ${r.status}`)
        const { url } = await r.json()
        if (!url) throw new Error('upload returned no url')
        if (slot === 'product') setProductImage(url)
        else if (slot === 'avatar') setAvatarImage(url)
        else setAdditionalImages((prev) => [...prev, url].slice(0, MARKETING_MAX_REFS))
      } catch (e) {
        setErr((e as Error).message)
      } finally {
        setPct((p) => ({ ...p, [slot]: 0 }))
      }
    }
  }, [additionalImages.length])

  const launch = useCallback(async () => {
    if (blocker || estimate === null || busy) return
    setBusy(true); setErr(null)
    try {
      const r = await fetch('/api/muapi/marketing', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: marketingEndpoint(res),
          payload: marketingPayload(params),
          estimateUsd: estimate,
        }),
      })
      if (!r.ok) throw new Error(`launch failed — ${r.status} ${(await r.text()).slice(0, 120)}`)
      const { requestId } = await r.json()
      if (!requestId) throw new Error('no request_id returned')
      onSubmitted?.(requestId)
    } catch (e) {
      setErr((e as Error).message)
    } finally { setBusy(false) }
  }, [blocker, estimate, busy, res, params, onSubmitted])

  const avatarName = AVATAR_PRESETS.find((a) => a.url === avatarImage)?.name
  const money = (n: number) => `$${n.toFixed(3).replace(/0$/, '')}`

  return (
    <div className="gen-bar mk-bar" ref={barRef} data-testid="marketing-composer">
      {additionalImages.length > 0 && (
        <div className="mk-refs">
          {additionalImages.map((img, i) => (
            <span key={img + i} className="mk-ref">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img} alt={`Reference ${i + 1}`} />
              <button type="button" aria-label={`Remove reference ${i + 1}`}
                      onClick={() => setAdditionalImages((p) => p.filter((_, j) => j !== i))}><X size={9} /></button>
              <em>@image{i + 3}</em>
            </span>
          ))}
        </div>
      )}

      <div className="gen-prow">
        <textarea className="gen-prompt" rows={1} readOnly={Boolean(spec)}
                  value={script} onChange={(e) => setPrompt(e.target.value)} aria-label="Ad script"
                  placeholder="Describe your ad script… Use @image1 for product, @image2 for avatar." />
      </div>

      <div className="gen-ctrl">
        <div className="gen-ctls">
          {/* Typed slots. Order is the prompt's @imageN — hence three, not one. */}
          <span className="mk-slots">
            <UploadSlot label="Product" required icon={<Package size={15} />} url={productImage}
                        pct={pct.product} onPick={(f) => upload('product', f)}
                        onClear={() => setProductImage(null)} />
            <UploadSlot label="Avatar" icon={<User size={15} />} url={avatarImage}
                        pct={pct.avatar} onPick={(f) => upload('avatar', f)}
                        onClear={() => setAvatarImage(null)} />
            <UploadSlot label="References" icon={<Images size={15} />} url={additionalImages[0] ?? null}
                        pct={pct.additional} onPick={(f) => upload('additional', f)}
                        onClear={() => setAdditionalImages([])} />
          </span>
          <span className="mk-div" />

          <button className="gen-ctl" aria-expanded={pop === 'format'}
                  onClick={() => setPop(pop === 'format' ? null : 'format')}>
            <span className="mk-badge">U</span>
            <span className="lbl">{format?.name ?? 'Format'}</span><span className="caret">⌄</span>
          </button>

          <button className="gen-ctl" aria-expanded={pop === 'avatar'}
                  onClick={() => setPop(pop === 'avatar' ? null : 'avatar')}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="mk-face" src={avatarImage ?? AVATAR_PRESETS[0].url} alt="" />
            <span className="lbl">{avatarName ?? (avatarImage ? 'Custom avatar' : 'Select avatar')}</span>
            <span className="caret">⌄</span>
          </button>

          <button className="gen-ctl" aria-expanded={pop === 'ratio'}
                  onClick={() => setPop(pop === 'ratio' ? null : 'ratio')}>
            <span className="ic"><Ratio size={13} /></span>{ratio}
          </button>

          <button className="gen-ctl" aria-expanded={pop === 'res'}
                  onClick={() => setPop(pop === 'res' ? null : 'res')}>
            <span className="ic"><Gem size={13} /></span>{res}
          </button>

          <button className="gen-ctl" aria-expanded={pop === 'duration'}
                  onClick={() => setPop(pop === 'duration' ? null : 'duration')}>
            <span className="ic"><Clock size={13} /></span>{duration}s
          </button>
        </div>

        <div className="gen-fire">
          {estimate === null
            ? <span className="gen-noprice" title={estErr ?? 'asking the endpoint what this costs'}>
                {estErr ? 'no price' : 'pricing…'}
              </span>
            : null}
          <button className="gen-go" onClick={launch}
                  disabled={Boolean(blocker) || estimate === null || busy}
                  title={blocker ?? (estimate === null ? 'waiting on a cost estimate' : `Launch · ${money(estimate)}`)}>
            {busy ? <><Loader2 size={14} className="spin" /> Launching</> : 'Launch'}
            {estimate !== null && !busy && <span className="p">{money(estimate)}</span>}
          </button>
        </div>
      </div>

      {/* POPOVERS LIVE HERE, NOT IN .gen-ctls.
          .gen-ctls is `overflow-x: auto` — a clipping context. A popover
          rendered inside it is cut off at the row's edge and the visible
          remnant falls behind .gen-canvas, so clicks land on the canvas
          instead. Every popover anchors to .mk-bar, which is position:relative,
          exactly as the generic composer does. */}
      {pop === 'format' && (
        <PresetGrid title="Video format presets" items={FORMAT_PRESETS} video
                    selected={format?.url ?? null}
                    onSelect={(url, name) => {
                      const f = FORMAT_PRESETS.find((x) => x.url === url)
                      setFormat(f ?? { id: -1, name, url })
                      setPop(null)
                    }} />
      )}
      {pop === 'avatar' && (
        <PresetGrid title="Avatar presets" items={AVATAR_PRESETS} selected={avatarImage}
                    onSelect={(url) => { setAvatarImage(url); setPop(null) }} />
      )}
      {pop === 'ratio' && (
        <div className="gen-pop opts" role="dialog" aria-label="Aspect ratio">
          <p className="pl">aspect ratio</p>
          {MARKETING_RATIOS.map((r) => (
            <button key={r} className={`orow${r === ratio ? ' on' : ''}`}
                    onClick={() => { setRatio(r); setPop(null) }}>
              {r}{r === ratio && <Check size={13} />}
            </button>
          ))}
        </div>
      )}
      {pop === 'res' && (
        <div className="gen-pop opts wide" role="dialog" aria-label="Resolution">
          <p className="pl">resolution · picks the endpoint</p>
          {MARKETING_RES.map((r) => (
            <button key={r} className={`orow${r === res ? ' on' : ''}`}
                    onClick={() => { setRes(r); setPop(null) }}>
              <span>{r}</span><code>{marketingEndpoint(r)}</code>
              {r === res && <Check size={13} />}
            </button>
          ))}
        </div>
      )}
      {pop === 'duration' && (
        <div className="gen-pop opts dur" role="dialog" aria-label="Duration">
          <p className="pl">duration</p>
          {MARKETING_DURATIONS.map((d) => (
            <button key={d} className={`orow${d === duration ? ' on' : ''}`}
                    onClick={() => { setDuration(d); setPop(null) }}>
              {d}s{d === duration && <Check size={13} />}
            </button>
          ))}
        </div>
      )}

      {(err || blocker) && (
        <p className={`mk-note${err ? ' bad' : ''}`} role="status">{err ?? blocker}</p>
      )}
    </div>
  )
}
