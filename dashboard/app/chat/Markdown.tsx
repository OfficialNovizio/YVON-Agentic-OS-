// Markdown.tsx — minimal, deterministic markdown renderer (TS-020).
// No runtime dependency (zero install risk, zero version drift): supports the
// subset agent replies actually use — headings, paragraphs, bold/italic,
// inline code, fenced code blocks, bullet/ordered lists, quotes — plus, since
// 2026-09-07, pipe tables and horizontal rules, which the design.md document
// shape (getdesign catalog) uses heavily.
// Unknown constructs render as plain text (never dropped, never broken).
// Documented limitation: escaped pipes (\|) inside table cells are not
// supported — cells split on every `|`.
'use client'

import { Fragment, type CSSProperties, type ReactNode } from 'react'

const TABLE_DELIM_CELL_RE = /^:?-{1,}:?$/

function splitRow(line: string): string[] {
  let t = line.trim()
  if (t.startsWith('|')) t = t.slice(1)
  if (t.endsWith('|')) t = t.slice(0, -1)
  return t.split('|').map((c) => c.trim())
}

function isTableDelimiter(line: string): boolean {
  const t = line.trim()
  if (!t.includes('|')) return false
  const cells = splitRow(t)
  return cells.length > 0 && cells.every((c) => TABLE_DELIM_CELL_RE.test(c))
}

type Align = 'left' | 'center' | 'right'

function cellAlign(delim: string): Align {
  const left = delim.startsWith(':')
  const right = delim.endsWith(':')
  return left && right ? 'center' : right ? 'right' : 'left'
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

  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    const k = `b${i}`

    if (fence) {
      if (line.trim().startsWith('```')) {
        blocks.push(
          <pre key={k}>
            <code>{fence.join('\n')}</code>
          </pre>,
        )
        fence = null
      } else {
        fence.push(line)
      }
      i++
      continue
    }
    if (line.trim().startsWith('```')) {
      flushList(`${k}-pre`)
      fence = []
      i++
      continue
    }

    // Table: a pipe line whose next line is a delimiter row consumes the run.
    if (/^\s*\|/.test(line) && i + 1 < lines.length && isTableDelimiter(lines[i + 1])) {
      flushList(`${k}-tbl`)
      const aligns = splitRow(lines[i + 1]).map(cellAlign)
      const header = splitRow(line)
      const body: string[][] = []
      i += 2
      while (i < lines.length && /^\s*\|/.test(lines[i])) {
        body.push(splitRow(lines[i]))
        i++
      }
      blocks.push(<DataTable key={k} header={header} body={body} aligns={aligns} />)
      continue
    }

    // Horizontal rule — `---`, `***`, `___` (3 or more)
    if (/^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
      flushList(`${k}-hr`)
      blocks.push(<hr key={k} />)
      i++
      continue
    }

    const h = line.match(/^(#{1,3})\s+(.*)$/)
    if (h) {
      flushList(`${k}-h`)
      const level = h[1].length
      const content = inline(h[2], `${k}-h`)
      blocks.push(
        level === 1 ? <h1 key={k}>{content}</h1> : level === 2 ? <h2 key={k}>{content}</h2> : <h3 key={k}>{content}</h3>,
      )
      i++
      continue
    }

    const ol = line.match(/^\d+\.\s+(.*)$/)
    if (ol) {
      if (!list || !list.ordered) {
        flushList(`${k}-ol`)
        list = { ordered: true, items: [] }
      }
      list.items.push(ol[1])
      i++
      continue
    }

    const ul = line.match(/^[-•]\s+(.*)$/)
    if (ul) {
      if (!list || list.ordered) {
        flushList(`${k}-ul`)
        list = { ordered: false, items: [] }
      }
      list.items.push(ul[1])
      i++
      continue
    }

    if (line.trim().startsWith('>')) {
      flushList(`${k}-q`)
      blocks.push(<blockquote key={k}>{inline(line.trim().replace(/^>\s?/, ''), `${k}-q`)}</blockquote>)
      i++
      continue
    }

    if (line.trim() === '') {
      flushList(`${k}-e`)
      i++
      continue
    }

    flushList(`${k}-p`)
    blocks.push(<p key={k}>{inline(line, `${k}-p`)}</p>)
    i++
  }
  flushList('end')

  return <div className="chat-md text-[14.5px]">{blocks}</div>
}

function DataTable({ header, body, aligns }: { header: string[]; body: string[][]; aligns: Align[] }) {
  const styleFor = (idx: number): CSSProperties | undefined =>
    aligns[idx] === 'center' || aligns[idx] === 'right' ? { textAlign: aligns[idx] } : undefined
  return (
    <table>
      <thead>
        <tr>
          {header.map((c, j) => (
            <th key={j} style={styleFor(j)}>
              {inline(c, `th-${j}`)}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {body.map((r, ri) => (
          <tr key={ri}>
            {header.map((_, j) => (
              <td key={j} style={styleFor(j)}>
                {inline(r[j] ?? '', `td-${ri}-${j}`)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

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
      // Italic — key includes the bold index j; two plain text segments from
      // different bold splits would otherwise collide on `-t${m}` (React
      // duplicate-key console error, hit on real design.md content).
      const emParts = bp.split(/(\*[^*]+\*)/g)
      emParts.forEach((ep, m) => {
        if (ep.startsWith('*') && ep.endsWith('*') && ep.length > 2) {
          out.push(<em key={`${k}-b${j}-e${m}`}>{ep.slice(1, -1)}</em>)
        } else if (ep) {
          out.push(<Fragment key={`${k}-b${j}-t${m}`}>{ep}</Fragment>)
        }
      })
    })
  })
  return out
}
