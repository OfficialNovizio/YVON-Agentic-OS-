// design-md.ts — display-side parsing for design.md documents (2026-09-07).
//
// design.md is dual-purpose: `lib/design-session.ts`'s renderDesignMd writes
// YAML frontmatter (the PRD generator and builder consume it) over a markdown
// body (the getdesign-catalog shape — Overview → Colors → Typography → … →
// Known Gaps). This module is the READ side for the dashboard: it splits the
// frontmatter off so the UI renders a metadata header + the markdown body
// instead of a raw YAML wall (the operator's complaint, SESSION-HANDOUT §16).
//
// No YAML dependency: the frontmatter is our own renderer's output, so a
// minimal parser of exactly the shapes renderDesignMd emits IS the honest
// contract. Anything unparseable degrades to null/absent — never invented
// (§0.5). The stored file is never mutated; this only splits a display copy.
//
// Owner: dev · design-first-workflow, 2026-09-07

export interface DesignMdFrontmatter {
  name?: string
  version?: string
  description?: string
  /** top-level `colors:` map — measured hex values for the swatch row */
  colors?: Record<string, string>
}

export interface SplitDesignMd {
  /** null when the text has no frontmatter block at all */
  frontmatter: DesignMdFrontmatter | null
  /** the markdown body after the closing delimiter — fed to <Markdown> */
  body: string
}

function unquote(v: string): string {
  const t = v.trim()
  if ((t.startsWith('"') && t.endsWith('"') && t.length >= 2) || (t.startsWith("'") && t.endsWith("'") && t.length >= 2)) {
    return t.slice(1, -1)
  }
  return t
}

/**
 * Split a design.md document into frontmatter + body. Tolerates CRLF (the
 * file is written on Windows dev machines and the VPS). Only a block whose
 * FIRST line is exactly `---` and which has a closing `---` line counts —
 * anything else is passed through untouched so the renderer never eats a
 * document that merely starts with a horizontal rule.
 */
export function splitDesignMd(text: string): SplitDesignMd {
  const normalized = text.replace(/\r\n/g, '\n')
  const m = normalized.match(/^---\n([\s\S]*?)\n---(?:\n|$)/)
  if (!m) return { frontmatter: null, body: text }

  const fm: DesignMdFrontmatter = {}
  let colors: Record<string, string> | null = null
  for (const line of m[1].split('\n')) {
    if (!line.trim()) continue
    const top = line.match(/^(name|version|description):\s*(.*)$/)
    if (top) {
      colors = null
      fm[top[1] as 'name' | 'version' | 'description'] = unquote(top[2])
      continue
    }
    if (/^colors:\s*$/.test(line)) {
      colors = {}
      fm.colors = colors
      continue
    }
    if (colors) {
      // nested block entries are indented; any unindented key ends the map
      const entry = line.match(/^\s+([A-Za-z0-9_-]+):\s*(\S.*)$/)
      if (entry) {
        colors[entry[1]] = unquote(entry[2])
        continue
      }
      colors = null
    }
    // everything else (typography:, rounded:, …) is machine-side only — skipped
  }

  return { frontmatter: fm, body: normalized.slice(m[0].length).replace(/^\n+/, '') }
}
