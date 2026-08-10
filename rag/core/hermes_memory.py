#!/usr/bin/env python3
"""
Hermes Memory Bridge (Python) — TS-002 WI-3
============================================
The Python half of the Hermes loop. Mirrors src/adapters/hermes-sync.ts +
src/cie/sources/hermes-memory.ts so BOTH pipelines read/write the same memory.

Memory lives in-repo at store/hermes/ (USER.md + MEMORY.md), configured via
yvon.config.json (hermesMemoryDir, resolved against project root).

  - read_user()                     → operator identity/preferences (P0)
  - read_memory(agent_id, keywords) → fleet lessons + this agent's section,
                                       keyword-filtered
  - push_lesson(agent_id, lesson)   → append a timestamped lesson under the
                                       agent's section (## Fleet if empty)
  - get_hermes_context(agent_id, keywords) → combined block for injection

Degrades loudly: if the dir/files are missing, returns '' and never raises.

Usage:
  python3 rag/core/hermes_memory.py --test
  python3 rag/core/hermes_memory.py --context marcus "npv financial"
  python3 rag/core/hermes_memory.py --push dev "keep header values ASCII"
"""

import os, sys, json, datetime, re
from typing import List

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, '..', '..'))


def _hermes_dir() -> str:
    """Resolve hermesMemoryDir from yvon.config.json (relative → root), else default."""
    cfg_path = os.path.join(PROJECT_ROOT, 'yvon.config.json')
    hd = None
    if os.path.exists(cfg_path):
        try:
            with open(cfg_path, 'r', encoding='utf-8') as f:
                hd = json.load(f).get('hermesMemoryDir')
        except Exception:
            hd = None
    if not hd:
        return os.path.join(PROJECT_ROOT, 'store', 'hermes')
    return hd if os.path.isabs(hd) else os.path.join(PROJECT_ROOT, hd)


def _user_path() -> str:   return os.path.join(_hermes_dir(), 'USER.md')
def _memory_path() -> str: return os.path.join(_hermes_dir(), 'MEMORY.md')


def _safe_read(path: str) -> str:
    try:
        with open(path, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception:
        return ''


def read_user(cap: int = 400) -> str:
    """Operator identity/preferences — small, injected as P0 context."""
    return _safe_read(_user_path()).strip()[:cap]


def _sections(md: str) -> dict:
    """Split MEMORY.md into {section_name_lower: body} by '## ' headers."""
    out, cur, buf = {}, None, []
    for line in md.splitlines():
        m = re.match(r'^##\s+(.+?)\s*$', line)
        if m:
            if cur is not None:
                out[cur] = '\n'.join(buf).strip()
            cur, buf = m.group(1).strip().lower(), []
        elif cur is not None:
            buf.append(line)
    if cur is not None:
        out[cur] = '\n'.join(buf).strip()
    return out


def read_memory(agent_id: str = '', keywords: List[str] = None, max_lines: int = 8) -> str:
    """This agent's section + Fleet lessons, optionally keyword-filtered.

    Agent section first (fixed 2026-08-10, kept in sync with
    src/cie/sources/hermes-memory.ts): with a global max_lines cap, a
    verbose ## Fleet section used to crowd out the very agent-specific
    match the caller asked for. Fleet lines are still always kept once
    reached; only the ORDER changed."""
    md = _safe_read(_memory_path())
    if not md:
        return ''
    secs = _sections(md)
    picked = []
    for name in ((agent_id or '').lower(), 'fleet'):
        if name and name in secs and secs[name]:
            picked.append((name, secs[name]))
    lines = []
    for name, body in picked:
        for ln in body.splitlines():
            ln = ln.strip()
            if not ln or not ln.startswith('-'):
                continue
            if keywords:
                low = ln.lower()
                if not any(k.lower() in low for k in keywords if k):
                    # fleet lines always kept; agent lines keyword-gated
                    if name != 'fleet':
                        continue
            lines.append(ln)
    return '\n'.join(lines[:max_lines])


def _tool_registry_path() -> str:
    return os.path.join(PROJECT_ROOT, 'Teams', 'Shared OS', 'tools', 'shared-tool-registry.md')


def read_tools(agent_id: str = '') -> str:
    """Parse the shared-tool registry into a compact one-line-per-tool inventory
    so every agent's context knows what's available and how to invoke it.
    If agent_id is given, only tools whose 'Consuming agents' column names it
    (plus any listing it) are returned; otherwise all tools."""
    md = _safe_read(_tool_registry_path())
    if not md:
        return ''
    out = []
    for line in md.splitlines():
        line = line.strip()
        if not line.startswith('|'):
            continue
        cells = [c.strip() for c in line.strip('|').split('|')]
        if len(cells) < 7:
            continue
        name = cells[0].replace('**', '')
        if name.lower() in ('tool', '') or set(name) <= {'-', ' ', ':'}:
            continue  # header / separator
        agents, purpose = cells[4], cells[6]
        if agent_id and agent_id.lower() not in agents.lower():
            continue
        # trim purpose to first sentence for compactness
        purpose = purpose.split('. ')[0].split(' — ')[0][:90]
        out.append(f'- {name}: {purpose} [{agents}]')
    return '\n'.join(out)


def get_hermes_context(agent_id: str = '', keywords: List[str] = None) -> str:
    """Combined USER + MEMORY + TOOLS block, pre-formatted for injection. '' if empty.
    TOOLS is the shared-tool registry so every agent can reach every tool easily."""
    user = read_user()
    mem = read_memory(agent_id, keywords)
    tools = read_tools(agent_id)
    if not user and not mem and not tools:
        return ''
    parts = ['[HERMES MEMORY]']
    if user:
        parts.append(user)
    if mem:
        parts.append('Lessons:\n' + mem)
    if tools:
        parts.append('Available tools (Shared OS registry):\n' + tools)
    return '\n'.join(parts)


def push_lesson(agent_id: str, lesson: str) -> dict:
    """Append a timestamped lesson under the agent's section (## Fleet if empty).
    Creates the section if missing. Returns {ok, bytes, path}."""
    lesson = (lesson or '').strip()
    if not lesson:
        return {'ok': False, 'reason': 'empty lesson', 'bytes': 0}
    path = _memory_path()
    os.makedirs(os.path.dirname(path), exist_ok=True)
    md = _safe_read(path) or '# Hermes Agent Memory\n'
    section = (agent_id or 'Fleet').strip()
    ts = datetime.datetime.now().strftime('%Y-%m-%d')
    entry = f'- [{ts}#loop] {lesson}'
    header = f'## {section}'
    # case-insensitive section match
    lines = md.splitlines()
    idx = next((i for i, l in enumerate(lines)
                if l.strip().lower() == header.lower()), None)
    if idx is None:
        md = md.rstrip() + f'\n\n{header}\n{entry}\n'
    else:
        # insert right after the header (and any existing bullets: after header line)
        insert_at = idx + 1
        lines.insert(insert_at, entry)
        md = '\n'.join(lines) + ('\n' if not md.endswith('\n') else '')
    with open(path, 'w', encoding='utf-8') as f:
        f.write(md)
    return {'ok': True, 'bytes': len(entry.encode('utf-8')), 'path': path, 'section': section}


# ── self-test ──────────────────────────────────────────────────────────
def _test() -> int:
    ok = True
    d = _hermes_dir()
    print('hermes dir:', d)
    assert os.path.isabs(d), 'dir should resolve absolute'
    u = read_user(); print('USER chars:', len(u)); ok &= len(u) > 0
    fleet = read_memory('', None); print('fleet lines:', len(fleet.splitlines())); ok &= len(fleet) > 0
    ctx = get_hermes_context('mia', ['ui', 'design']); ok &= 'HERMES' in ctx
    # round-trip push
    r = push_lesson('dev', 'test-loop lesson (self-test)'); print('push:', r['ok'])
    back = read_memory('dev', ['test-loop']); ok &= 'test-loop' in back
    print('round-trip:', 'test-loop' in back)
    print('RESULT:', 'PASS' if ok else 'FAIL')
    return 0 if ok else 1


if __name__ == '__main__':
    args = sys.argv[1:]
    if not args or args[0] == '--test':
        sys.exit(_test())
    elif args[0] == '--context':
        print(get_hermes_context(args[1] if len(args) > 1 else '', args[2:] or None))
    elif args[0] == '--push':
        print(push_lesson(args[1], ' '.join(args[2:])))
    else:
        print(__doc__)
