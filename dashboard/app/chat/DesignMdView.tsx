// DesignMdView.tsx — the human rendering of a design.md document (2026-09-07).
// design.md is machine+human dual-purpose: renderDesignMd writes YAML
// frontmatter (the PRD generator and builder consume it) over a markdown body
// (the getdesign-catalog shape — Overview → Colors → Typography → … → Known
// Gaps). The panel must show the DOCUMENT, not the serialization: frontmatter
// becomes a compact metadata header (name/version/description + measured
// color swatches), the body renders as markdown. Raw YAML in the panel was
// the operator's complaint — SESSION-HANDOUT §16.
'use client'

import { splitDesignMd } from '@/lib/design-md'
import { Markdown } from './Markdown'

export function DesignMdView({ text }: { text: string }) {
  const { frontmatter, body } = splitDesignMd(text)
  const colors = frontmatter?.colors ? Object.entries(frontmatter.colors) : []
  const hasMeta = !!(frontmatter?.name || frontmatter?.description || colors.length > 0)
  return (
    <div>
      {frontmatter && hasMeta && (
        <div className="mb-3 rounded-[12px] border border-[var(--chat-hairline)] bg-[var(--chat-surface-strong)] p-3.5">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-[13px] font-semibold text-[var(--chat-text)]">
              {frontmatter.name || 'design.md'}
            </span>
            {frontmatter.version && (
              <span className="chat-mono rounded-full border border-[var(--chat-hairline)] px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] text-[var(--chat-text-faint)]">
                {frontmatter.version}
              </span>
            )}
          </div>
          {frontmatter.description && (
            <p className="mt-1.5 text-[11.5px] leading-[1.55] text-[var(--chat-text-faint)]">{frontmatter.description}</p>
          )}
          {colors.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {colors.map(([key, value]) => (
                <span
                  key={key}
                  className="chat-mono inline-flex items-center gap-1.5 rounded-full border border-[var(--chat-hairline)] py-0.5 pl-0.5 pr-2 text-[10px] text-[var(--chat-text-faint)]"
                  title={`${key} ${value}`}
                >
                  <span
                    className="inline-block h-3.5 w-3.5 rounded-full border border-[var(--chat-hairline-soft)]"
                    style={{ background: value }}
                  />
                  {key} {value}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
      <Markdown text={body} />
    </div>
  )
}
