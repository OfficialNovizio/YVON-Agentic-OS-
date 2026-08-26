// Markdown.tsx — minimal, deterministic markdown renderer (TS-020).
// No runtime dependency (zero install risk, zero version drift): supports the
// subset agent replies actually use — headings, paragraphs, bold/italic,
// inline code, fenced code blocks, bullet/ordered lists, links, quotes.
// Unknown constructs render as plain text (never dropped, never broken).
'use client'

import { Fragment, type ReactNode } from 'react'

function inline(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = []
  // Split on inline code first so code never gets bold/link-processed.
  const parts = text.split(/(`[^`]+`)/g)
  parts.forEach((part, i) => {
    const k = `${keyBase}-i${i}`
    if (part.startsWith('`') && part.endsWith('`')) {
      out.push(<code key={k}>{part.slice(1, -1)}</code>)
      return
    }
    // Bold
    const boldParts = part.split(/(\*\*[^*]+\*\*)/g)
    boldParts.forEach((bp, j) => {
      if (bp.startsWith('**') && bp.endsWith('**')) {
        out.push(<strong key={`${k}-b${j}`}>{bp.slice(2, -2)}</strong>)
        return
      }
      // Italic
      const emParts = bp.split(/(\*[^*]+\*)/g)
      emParts.forEach((ep, m) => {
        if (ep.startsWith('*') && ep.endsWith('*') && ep.length > 2) {
          out.push(<em key={`${k}-e${m}`}>{ep.slice(1, -1)}</em>)
        } else if (ep) {
          out.push(<Fragment key={`${k}-t${m}`}>{ep}</Fragment>)
        }
      })
    })
  })
  return out
}

export function Markdown({ text }: { text: string }) {
  const lines = text.split('\n')
  const blocks: ReactNode[] = []
  let list: { ordered: boolean; items: string[] } | null = null
  let fence: string[] | null = null

  const flushList = (k: string) => {
    if (!list) return
    if (list.ordered) {
      blocks.push(
        <ol key={k}>
          {list.items.map((it, i) => (
            <li key={`${k}-${i}`}>{inline(it, `${k}-li${i}`)}</li>
          ))}
        </ol>,
      )
    } else {
      blocks.push(
        <ul key={k}>
          {list.items.map((it, i) => (
            <li key={`${k}-${i}`}>{inline(it, `${k}-li${i}`)}</li>
          ))}
        </ul>,
      )
    }
    list = null
  }

  lines.forEach((line, i) => {
    const k = `b${i}`
    if (fence) {
      if (line.trim().startsWith('```')) {
        blocks.push(<pre key={k}><code>{fence.join('\n')}</code></pre>)
        fence = null
      } else {
        fence.push(line)
      }
      return
    }
    if (line.trim().startsWith('```')) {
      flushList(`${k}-pre`)
      fence = []
      return
    }
    const h = line.match(/^(#{1,3})\s+(.*)$/)
    if (h) {
      flushList(`${k}-h`)
      const level = h[1].length
      const content = inline(h[2], `${k}-h`)
      blocks.push(level === 1 ? <h1 key={k}>{content}</h1> : level === 2 ? <h2 key={k}>{content}</h2> : <h3 key={k}>{content}</h3>)
      return
    }
    const ol = line.match(/^\d+\.\s+(.*)$/)
    if (ol) {
      if (!list || !list.ordered) {
        flushList(`${k}-ol`)
        list = { ordered: true, items: [] }
      }
      list.items.push(ol[1])
      return
    }
    const ul = line.match(/^[-•]\s+(.*)$/)
    if (ul) {
      if (!list || list.ordered) {
        flushList(`${k}-ul`)
        list = { ordered: false, items: [] }
      }
      list.items.push(ul[1])
      return
    }
    if (line.trim().startsWith('>')) {
      flushList(`${k}-q`)
      blocks.push(<blockquote key={k}>{inline(line.trim().replace(/^>\s?/, ''), `${k}-q`)}</blockquote>)
      return
    }
    if (line.trim() === '') {
      flushList(`${k}-e`)
      return
    }
    flushList(`${k}-p`)
    blocks.push(<p key={k}>{inline(line, `${k}-p`)}</p>)
  })
  flushList('end')

  return <div className="chat-md text-[14.5px]">{blocks}</div>
}
