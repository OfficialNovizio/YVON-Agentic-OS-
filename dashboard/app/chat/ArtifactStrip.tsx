// ArtifactStrip — evidence rail fix ② (2026-09-04): the screenshots, scraped
// data files and other artifacts the agent saved into the turn's artifacts
// dir on the VPS, shown inline in the chat above the task-proposal card they
// evidence. Fed live by `artifact` SSE frames (wrapper main.py
// _publish_new_artifacts, enqueued BEFORE the done frame — the browser reader
// loop breaks on done) and rehydrated from the events table for past turns
// (page.tsx's past-turn effect), so the strip survives a reload.
//
// Images render as thumbnails straight from
// https://hermes.yvon.in/artifacts/... (CSP img-src allows https:). Anything
// that fails to load, or isn't an image at all, falls back to a file card —
// same link, no broken-image icon ever shown.
//
// Owner: dev · chat-as-task evidence rail
'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, ExternalLink, FileText, ImageIcon } from 'lucide-react'
import type { ProposalArtifact } from './TaskProposalPrompt'

const IMAGE_EXT_RE = /\.(png|jpe?g|webp|gif)(\?|#|$)/i

function ArtifactCard({ artifact }: { artifact: ProposalArtifact }) {
  const [broken, setBroken] = useState(false)
  const isImage = (artifact.kind === 'image' || IMAGE_EXT_RE.test(artifact.url)) && !broken

  return (
    <a
      href={artifact.url}
      target="_blank"
      rel="noreferrer"
      className="group block w-[220px] shrink-0 overflow-hidden rounded-[14px] border border-[var(--chat-hairline)] bg-white transition hover:border-[var(--chat-accent)]"
    >
      {isImage ? (
        <img
          src={artifact.url}
          alt={artifact.label}
          className="h-[132px] w-full object-cover object-top"
          onError={() => setBroken(true)}
        />
      ) : (
        <div className="flex h-[132px] w-full flex-col items-center justify-center gap-2 text-[var(--chat-text-dim)]">
          <FileText size={26} strokeWidth={1.5} />
          <span className="px-3 text-center text-[10px] uppercase tracking-[0.14em]">
            {artifact.kind ?? 'file'}
          </span>
        </div>
      )}
      <div className="flex items-center gap-1.5 border-t border-[var(--chat-hairline)] px-3 py-2">
        <span className="truncate text-[12.5px] text-[var(--chat-body)]">{artifact.label}</span>
        <ExternalLink
          size={12}
          className="ml-auto shrink-0 text-[var(--chat-text-dim)] transition group-hover:text-[var(--chat-accent)]"
        />
      </div>
    </a>
  )
}

export function ArtifactStrip({ artifacts }: { artifacts: ProposalArtifact[] }) {
  // Collapsible (2026-09-05): a long evidence turn (one COS turn produced
  // eight cards across two capture passes) buried the chat under thumbnails.
  // Header is the toggle — same chevron + grid-rows animation as
  // PipelineHud's PillExpand, aria-expanded per CaosPanel. Open by default so
  // the behavior change is only "you can fold it away", never "evidence
  // hides".
  const [open, setOpen] = useState(true)
  if (artifacts.length === 0) return null

  return (
    <div className="relative z-10 px-4 pb-2 sm:px-8">
      <div className="adora-rise mx-auto w-full max-w-[780px] rounded-[24px] border border-[var(--chat-hairline)] bg-white px-5 py-4">
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--chat-text-dim)] transition hover:text-[var(--chat-accent)]"
        >
          <ImageIcon className="h-3.5 w-3.5" />
          Evidence{artifacts.length > 1 ? ` · ${artifacts.length}` : ''}
          <span className="ml-auto" />
          {open ? (
            <ChevronDown className="h-3.5 w-3.5 shrink-0" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          )}
        </button>
        <div
          className={`grid transition-[grid-template-rows] duration-200 ease-out ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
        >
          <div className="overflow-hidden">
            <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
              {artifacts.map((a) => (
                <ArtifactCard key={a.url} artifact={a} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
