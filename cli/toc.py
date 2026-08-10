#!/usr/bin/env python3
"""
toc.py — regenerate the line-numbered index at the top of docs/MASTER.md.

MASTER.md is ~5,000 lines. Reading it whole wastes context; the index lets any
reader (human or agent) sed straight to the section they need.

Idempotent: strips the previous <!-- TOC:START -->..<!-- TOC:END --> block and
rebuilds it. Line numbers are solved to a fixed point because the index shifts
the very offsets it prints.

Run after ANY hand-edit to MASTER.md:   python3 cli/toc.py
Verify without writing:                 python3 cli/toc.py --check
"""
import re, sys, os

PATH = os.path.join(os.path.dirname(__file__), '..', 'docs', 'MASTER.md')
START, END = '<!-- TOC:START -->', '<!-- TOC:END -->'


def strip_toc(lines):
    if not any(l.strip() == START for l in lines):
        return lines
    s = next(i for i, l in enumerate(lines) if l.strip() == START)
    e = next(i for i, l in enumerate(lines) if l.strip() == END)
    out = lines[:s] + lines[e + 1:]
    while s < len(out) and out[s].strip() == '':   # drop the separator blank
        out.pop(s)
    return out


def collect(lines, from_line=0):
    """Headers at/after `from_line` only — the doc's own front-matter headings
    sit before the insertion point and must not be offset.

    Skips lines inside ``` fenced code blocks — a `## ` line inside a
    SKILL.md/agent.md example (illustrating what those files' own headers
    look like) is not a real MASTER.md section and must not be indexed as
    one. Bug found + fixed 2026-08-09: this previously had no fence
    awareness at all, so every fenced example containing a literal
    `## Something` line silently inflated the subsection count with fake
    entries — discovered when the count jumped from 129 to 139 after adding
    one more such example block."""
    out = []
    in_fence = False
    for i, l in enumerate(lines):
        if i < from_line:
            continue
        if l.lstrip().startswith('```'):
            in_fence = not in_fence
            continue
        if in_fence:
            continue
        m1 = re.match(r'^# ═+ (PART \d+|APPENDIX [A-C])\s*[—-]?\s*(.*?)\s*═*$', l)
        if m1:
            out.append((1, m1.group(1), m1.group(2).strip(' ═—-'), i + 1))
            continue
        m2 = re.match(r'^## (.+?)\s*$', l)
        if m2:
            out.append((2, None, m2.group(1).strip(), i + 1))
    return out


def build(entries, offset, total):
    t = [START,
         '## How to read this file',
         '',
         f'`docs/MASTER.md` is ~{total + offset} lines. **Do not read it whole.**',
         'Jump straight to what you need:',
         '',
         '```bash',
         "grep -n '^### PART' docs/MASTER.md    # find a section's line number",
         "sed -n '4170,4380p' docs/MASTER.md    # then read just that range",
         'python3 cli/toc.py                    # regenerate this index',
         'python3 cli/toc.py --check            # verify line numbers are accurate',
         '```',
         '',
         '> Line numbers below are generated. If you edit MASTER.md by hand, re-run',
         '> `cli/toc.py` or they drift.',
         '',
         '## Index',
         '']
    for lvl, key, label, ln in entries:
        n = ln + offset
        if lvl == 1:
            t += ['', f'### {key} — {label}  ·  line {n}']
        else:
            t.append(f'- `{n:>5}`  {label}')
    t += ['', END]
    return t


def main():
    check = '--check' in sys.argv
    raw = open(PATH, encoding='utf-8').read()
    lines = raw.split('\n')
    body = strip_toc(lines)
    anchor = next(i for i, l in enumerate(body) if l.startswith('# ═══════════ PART 0'))
    entries = collect(body, from_line=anchor)
    total = len(body)

    # fixed point — +1 for the blank separator inserted after the block
    offset = 0
    for _ in range(20):
        new = len(build(entries, offset, total)) + 1
        if new == offset:
            break
        offset = new

    toc = build(entries, offset, total)
    out = body[:anchor] + toc + [''] + body[anchor:]

    # ── self-verify every printed line number ──
    bad = []
    for lvl, key, label, ln in entries:
        n = ln + offset
        actual = out[n - 1] if n - 1 < len(out) else ''
        if lvl == 1 and key not in actual:
            bad.append((key, n, actual[:60]))
        if lvl == 2 and actual.strip() != f'## {label}':
            bad.append((label, n, actual[:60]))

    if bad:
        print(f'✗ {len(bad)} line number(s) wrong:')
        for lab, n, act in bad[:10]:
            print(f'    {lab!r} claims {n} -> {act!r}')
        sys.exit(1)

    parts = sum(1 for e in entries if e[0] == 1)
    subs = sum(1 for e in entries if e[0] == 2)
    if check:
        print(f'✓ index accurate — {parts} parts, {subs} subsections')
        sys.exit(0)

    open(PATH, 'w', encoding='utf-8').write('\n'.join(out))
    print(f'✓ index written — {parts} parts, {subs} subsections, {len(out)} lines total')


if __name__ == '__main__':
    main()
