// Unit tests for lib/design-md.ts — the design.md display-side splitter
// (2026-09-07). Same discipline as design-session.test.ts: plain node
// (npx tsx), no browser, no React. The contract under test: a design.md's
// YAML frontmatter (renderDesignMd's machine block) splits cleanly off the
// markdown body, quoted scalars unquote, the colors map parses and STOPS at
// the next top-level key, and any non-design.md input passes through
// untouched — the renderer never invents or eats content.
//
// Owner: dev · design-first-workflow, 2026-09-07
import { splitDesignMd } from '../lib/design-md'

let fail = 0
const ck = (name: string, cond: boolean, extra?: unknown) => {
  console.log((cond ? '  PASS  ' : '  FAIL  ') + name)
  if (!cond) {
    fail++
    if (extra !== undefined) console.log('         ', JSON.stringify(extra))
  }
}
const H = (s: string) => console.log('\n' + s)

const DOC = `---
version: alpha
name: "Test-System-design-analysis"
description: "Measured from the capture relay's artifacts. Unmeasurable areas are declared."
colors:
  black: "#000000"
  white: "#ffffff"
  primary: "#ff4c24"
  grey: "#0b0b0b1a"

typography:
  body:
    fontFamily: "Barlow"
    fontWeight: 400

rounded:
  card: "16px"
---

## Overview

The body starts here.

## Colors

- **Primary** ('#ff4c24'): the accent.
`

H('1. frontmatter splits off the body')
const r = splitDesignMd(DOC)
ck('frontmatter detected', r.frontmatter !== null)
ck('name unquoted', r.frontmatter?.name === 'Test-System-design-analysis', r.frontmatter?.name)
ck('version scalar', r.frontmatter?.version === 'alpha', r.frontmatter?.version)
ck('description unquoted', r.frontmatter?.description?.startsWith('Measured from') === true, r.frontmatter?.description)
ck('body starts at the first heading', r.body.startsWith('## Overview'), r.body.slice(0, 40))
ck('closing delimiter not in body', !r.body.startsWith('---'))

H('2. colors map parses and stops at the next top-level key')
ck('colors parsed', r.frontmatter?.colors?.black === '#000000' && r.frontmatter?.colors?.primary === '#ff4c24', r.frontmatter?.colors)
ck('colors includes 8-digit hex', r.frontmatter?.colors?.grey === '#0b0b0b1a')
ck('colors did not swallow typography/rounded keys', r.frontmatter?.colors?.body === undefined && r.frontmatter?.colors?.card === undefined, r.frontmatter?.colors)
ck('body still contains later sections', r.body.includes('## Colors'))

H('3. no frontmatter → passthrough, never mutated')
const plain = '# Just a doc\n\nwith an hr:\n\n---\n\nand more text.\n'
const r2 = splitDesignMd(plain)
ck('frontmatter null', r2.frontmatter === null)
ck('body is the original text byte-for-byte', r2.body === plain)

H('4. a doc that only STARTS with --- but never closes it is not frontmatter')
const unclosed = '---\nnot: frontmatter\njust: text'
const r3 = splitDesignMd(unclosed)
ck('frontmatter null for unclosed block', r3.frontmatter === null, r3.frontmatter)
ck('body preserved', r3.body === unclosed)

H('5. CRLF tolerance (files cross Windows/VPS)')
const crlf = DOC.replace(/\n/g, '\r\n')
const r4 = splitDesignMd(crlf)
ck('frontmatter still detected', r4.frontmatter?.name === 'Test-System-design-analysis')
ck('body clean of CRs', r4.body.startsWith('## Overview') && !r4.body.startsWith('\r'))

H('6. frontmatter at EOF with no body')
const eofOnly = '---\nname: "Bare"\n---\n'
const r5 = splitDesignMd(eofOnly)
ck('frontmatter parsed at EOF', r5.frontmatter?.name === 'Bare', r5.frontmatter)
ck('body empty', r5.body === '')

process.exit(fail > 0 ? 1 : 0)
