#!/usr/bin/env python3
"""
toonify v2 — Aggressive compression for Teams/ .md → .toon
=============================================================
Produces TOON Claude format: dense key=value pairs with · delimiters.
Target: 60-85% size reduction vs raw markdown.

Compression rules:
  1. Strip YAML frontmatter entirely (it's metadata, not context)
  2. Drop structural lines: "---", horizontal rules, blank blocks
  3. Heading text → 2-char abbreviation, trailing content preserved
  4. Bullet lists → comma-separated after the heading
  5. Table rows → single-line pipe format: |col1|col2|col3|
  6. Prose paragraphs → token-stripped: remove articles and filler words
  7. Code blocks → collapsed to single line with language tag
  8. Template markers like `<FILL_IN>` → `…`

Usage:
  python3 cli/toonify.py --all
  python3 cli/toonify.py --status
"""

import os, sys, re
from pathlib import Path

# ── Stop words to strip from prose ─────────────────────────────
STOP = {'the','a','an','is','are','was','were','be','been','being',
        'have','has','had','do','does','did','will','would','shall',
        'should','may','might','must','can','could','it','its','this',
        'that','these','those','each','every','all','both','few','more',
        'most','other','some','such','no','not','only','own','same','so',
        'than','too','very','just','also','now','then','here','there','when',
        'where','why','how','if','or','and','but','for','nor','yet','at',
        'by','from','in','into','of','on','to','with','as','per','via'}

# ── Heading abbreviations ─────────────────────────────────────
ABBR = {
    '## Purpose': 'p:', '## Summary': 's:', '## Instructions': 'in:',
    '## Principles': 'pr:', '## Fallback': 'f:', '## Boundaries': 'b:',
    '## Introduction': 'in:', '## Structure': 'st:', '## Protocol': 'pl:',
    '## Output Format': 'of:', '## Why': 'w:', '## When to Use': 'wu:',
    '## What': 'wh:', '## How': 'h:', '## Position in the Org': 'po:',
    '## Skill Roster': 'sr:', '## Identity': 'id:',
    '## Operational Layer': 'ol:', '## Logical Layer': 'll:',
    '## Workflow': 'wf:', '## Working Structure': 'ws:',
    '## Working Tree': 'wt:', '## Working Instructions': 'wi:',
    '## Department Status': 'ds:', '## Tool Requirements': 'tr:',
    '## Notes': 'n:', '## Flag Clearance Summary': 'fc:',
    '## Still Pending': 'sp:', '## How to Use': 'hu:', '## Purpose': 'p:',
    '## Extraction': 'ex:', '## Books': 'bk:', '## Finding': 'fi:',
    '## Score': 'sc:', '## Verdict': 've:', '## Check': 'ch:',
    '## Source': 'so:', '## Route': 'ro:', '## Design rules': 'dr:',
    '## Self-Test': 'tt:', '## Application': 'ap:', '## Test': 'te:',
    '## Rule': 'ru:', '## Key': 'k:', '## Citation': 'ci:',
    '## Covers': 'cv:', '## Connection': 'co:', '## Part': 'pt:',
    '## Summary': 's:', '## Purpose': 'p:', '## Criteria': 'cr:',
    '# ': 'h1:', '## ': 'h2:', '### ': 'h3:', '#### ': 'h4:',
}

def esc(v):
    return v.replace('|','\\|').replace('·','\\·')

def strip_prose(text):
    """Aggressively strip filler from prose — keep nouns, verbs, key adjectives."""
    words = text.split()
    if len(words) < 5:
        return text
    # Keep words that aren't in stop list and are > 2 chars
    kept = [w for w in words if w.lower() not in STOP and len(w) > 2]
    if not kept:
        kept = words[:3]
    return ' '.join(kept)

def short_heading(s):
    s_trim = s.strip()
    for full, abbr in sorted(ABBR.items(), key=lambda x: -len(x[0])):
        if s_trim.startswith(full):
            rest = s_trim[len(full):].strip()
            if rest:
                return abbr + esc(strip_prose(rest))
            return abbr[:-1]
    words = re.sub(r'^#+\s*','',s_trim).split()[:2]
    abbr = ''.join(w[0] for w in words if w).lower() if words else 'h'
    return abbr + ':' + esc(strip_prose(re.sub(r'^#+\s*','',s_trim)))

def collapse_bullets(lines):
    """Collapse consecutive bullet points into one compressed line."""
    items = []
    for line in lines:
        stripped = line.strip()
        # Strip bullet markers
        for prefix in ['- ', '* ', '+ ', '· ']:
            if stripped.startswith(prefix):
                stripped = stripped[len(prefix):]
                break
        if stripped:
            items.append(strip_prose(stripped))
    if items:
        return ', '.join(items)
    return ''

def md_to_toon(content, filename):
    lines = content.split('\n')
    parts = [f'f={esc(filename)}']
    current_heading = 'tx'
    current_bullets = []
    current_text = []
    in_frontmatter = False
    in_code_block = False
    code_lines = []

    def flush_bullets():
        nonlocal current_bullets
        if current_bullets:
            compressed = collapse_bullets(current_bullets)
            if compressed:
                parts.append(f'{current_heading}={esc(compressed)}')
            current_bullets = []

    def flush_text():
        nonlocal current_text
        if current_text:
            text = ' '.join(current_text).strip()
            if text and len(text) > 3:
                parts.append(f'{current_heading}={esc(strip_prose(text))}')
            current_text = []

    for line in lines:
        stripped = line.strip()

        # ── YAML frontmatter: skip entirely ──
        if stripped == '---':
            in_frontmatter = not in_frontmatter
            continue
        if in_frontmatter:
            continue

        # ── Code blocks: collapse to single line ──
        if stripped.startswith('```'):
            in_code_block = not in_code_block
            if not in_code_block and code_lines:
                code_text = ' · '.join(code_lines[:5])
                parts.append(f'{current_heading}=`{esc(code_text)}`')
                code_lines = []
            continue
        if in_code_block:
            code_lines.append(stripped)
            continue

        # ── Skip structural noise ──
        if not stripped or stripped in ('---', '***', '___', '...'):
            continue

        # ── Headings ──
        if stripped.startswith('#'):
            flush_bullets()
            flush_text()
            current_heading = short_heading(stripped)
            current_bullets = []
            current_text = []
            continue

        # ── Bullet points ──
        if stripped.startswith('- ') or stripped.startswith('* ') or stripped.startswith('+ ') or stripped.startswith('· '):
            flush_text()
            current_bullets.append(stripped)
            continue

        # ── Table rows → pass through compact ──
        if stripped.startswith('|'):
            flush_bullets()
            flush_text()
            parts.append(f'{current_heading}={esc(stripped)}')
            continue

        # ── Horizontal rules, empty template markers → skip ──
        if stripped in ('---', '***', '___', '<FILL_IN>'):
            continue

        # ── Normal text ──
        flush_bullets()
        current_text.append(stripped)

    flush_bullets()
    flush_text()
    return ' · '.join(parts)


def find_md_files(teams_dir):
    files = []
    for root, dirs, filenames in os.walk(teams_dir):
        dirs[:] = [d for d in dirs if not d.startswith('.') and d != 'node_modules']
        for f in filenames:
            if f.endswith('.md') and not f.endswith('.toon'):
                files.append(os.path.join(root, f))
    return files


def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    teams_dir = os.path.join(script_dir, '..', 'Teams')
    cmd = sys.argv[1] if len(sys.argv) > 1 else '--status'

    if cmd == '--status':
        md_files = find_md_files(teams_dir)
        with_toon = sum(1 for f in md_files if os.path.exists(f.replace('.md', '.toon')))
        without = len(md_files) - with_toon
        print(f'\n  📊 TOON Conversion Status — Teams/')
        print(f'  Total .md files: {len(md_files)}')
        print(f'  With .toon: {with_toon}')
        print(f'  Without .toon: {without}')
        print(f'  Coverage: {with_toon/max(len(md_files),1)*100:.1f}%\n')
        if without > 0:
            print(f'  Run: python3 cli/toonify.py --all\n')

    elif cmd == '--all':
        md_files = find_md_files(teams_dir)
        converted, skipped, failed = 0, 0, 0
        old_total, new_total = 0, 0
        print(f'\n  📄 TOON v2 — aggressive compression — {len(md_files)} .md files\n')

        for md_path in sorted(md_files):
            toon_path = md_path.replace('.md', '.toon')
            rel = os.path.relpath(md_path, teams_dir)

            try:
                with open(md_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                old_size = len(content.encode('utf-8'))

                toon = md_to_toon(content, rel)
                with open(toon_path, 'w', encoding='utf-8') as f:
                    f.write(toon)
                new_size = len(toon.encode('utf-8'))

                savings = (1 - new_size / max(old_size, 1)) * 100
                if savings > 20:
                    print(f'  ✅ {rel} ({old_size:,}→{new_size:,} = {savings:.0f}%)')
                converted += 1
                old_total += old_size
                new_total += new_size
            except Exception as e:
                print(f'  ❌ {rel}: {e}')
                failed += 1

        overall = (1 - new_total / max(old_total, 1)) * 100
        print(f'\n  📊 {converted} converted | {old_total:,}→{new_total:,} bytes | {overall:.0f}% total savings\n')

    elif cmd == '--agent':
        agent_id = sys.argv[2] if len(sys.argv) > 2 else ''
        if not agent_id:
            print('  Usage: python3 cli/toonify.py --agent <agent-id>')
            return
        md_files = [f for f in find_md_files(teams_dir) if f'/{agent_id}/' in f]
        print(f'\n  📄 Agent {agent_id}: {len(md_files)} .md files\n')
        old_t, new_t = 0, 0
        for md_path in md_files:
            toon_path = md_path.replace('.md', '.toon')
            rel = os.path.relpath(md_path, teams_dir)
            try:
                with open(md_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                old_s = len(content.encode('utf-8'))
                toon = md_to_toon(content, rel)
                new_s = len(toon.encode('utf-8'))
                old_t += old_s; new_t += new_s
                with open(toon_path, 'w', encoding='utf-8') as f:
                    f.write(toon)
                print(f'  ✅ {rel} ({old_s:,}→{new_s:,} = {(1-new_s/max(old_s,1))*100:.0f}%)')
            except Exception as e:
                print(f'  ❌ {rel}: {e}')
        print(f'\n  Agent total: {old_t:,}→{new_t:,} = {(1-new_t/max(old_t,1))*100:.0f}% savings\n')
    else:
        print(f'  Usage: python3 cli/toonify.py [--all|--agent <id>|--status]')

if __name__ == '__main__':
    main()
