#!/usr/bin/env python3
"""
Semantic Chunker — Element 1 of YVON RAG
=========================================
Splits Teams/ .md files into meaningful chunks at heading boundaries.
Preserves document structure, agent assignment, and section hierarchy.

Document types recognized:
  - SKILL.md (custom + marketplace): 9-section structure
  - agent.md: 6-section structure
  - book-requirements.md: 5-section structure
  - DEPARTMENT-WORKFLOW.md: ~8-section structure
  - Operational files: single-chunk (already small)
  - Route D wisdom: heading-section split
  - Identity files: heading-section split
  - Python scripts: NOT chunked — extracted separately per function

Output: rag/chunks/chunks.json — manifest of all chunks with metadata

Usage:
  python3 rag/chunkify.py --all        # Chunk all Teams/ .md files
  python3 rag/chunkify.py --agent marcus # Chunk one agent
  python3 rag/chunkify.py --status     # Report chunking stats
  python3 rag/chunkify.py --test       # Run self-tests
"""

import os, sys, json, re, time
from pathlib import Path
from typing import List, Dict, Optional

# ── Document type detection ────────────────────────────────────

def detect_document_type(filepath: str) -> str:
    """Detect document type from file path and name."""
    basename = os.path.basename(filepath)
    dirname = os.path.dirname(filepath)

    if basename == 'SKILL.md':
        return 'skill'
    if basename == 'agent.md':
        return 'agent'
    if basename == 'book-requirements.md':
        return 'book_requirements'
    if basename == 'DEPARTMENT-WORKFLOW.md':
        return 'department_workflow'
    if 'operational' in dirname:
        if basename.endswith('-principles.md'):
            return 'principles'
        if basename.endswith('-commands.md'):
            return 'commands'
        if basename.endswith('-config.md'):
            return 'agent_config'
        if basename.endswith('-skill-routing.md'):
            return 'skill_routing'
        if basename.endswith('-tool-requirements.md'):
            return 'tool_requirements'
    if 'identity' in dirname:
        return 'identity'
    if 'logical' in dirname and basename.endswith('.md'):
        return 'route_d_wisdom'
    if 'marketplace' in dirname or 'custom' in dirname:
        if basename.endswith('.md') and basename != 'SKILL.md':
            return 'reference'  # Template files, checklists
    return 'generic'


def _initial_quality(doc_type: str, filepath: str, tier: int, has_toon: bool) -> float:
    """Compute initial quality score per chunk based on source type and properties.

    This seeds the feedback loop. Scores adjust over time via feedback.py.
    """
    base = {
        'route_d_wisdom': 0.90,     # Published book extraction (Ogilvy, Aaker, etc.)
        'skill': 0.65,              # Agent SKILL.md
        'department_workflow': 0.60, # Department workflow docs
        'principles': 0.70,          # Operating principles
        'agent': 0.75,               # agent.md definition
        'identity': 0.60,            # Agent identity/persona
        'book_requirements': 0.55,   # Book requirement specs
        'agent_config': 0.55,        # Agent configuration
        'commands': 0.50,            # Command definitions
        'skill_routing': 0.55,       # Skill routing rules
        'tool_requirements': 0.50,   # Tool requirement specs
        'reference': 0.45,           # Template files, checklists
        'generic': 0.35,             # Unknown type
    }.get(doc_type, 0.40)

    # Tier bonus: T1 load-bearing chunks start higher
    tier_bonus = {1: 0.10, 2: 0.05, 3: 0.0}.get(tier, 0)

    # TOON bonus: compressed files are more credible (verified completeness)
    toon_bonus = 0.05 if has_toon else 0

    # Named authority boost (books, standards, key docs)
    name_lower = filepath.lower()
    auth_bonus = 0.05 if any(kw in name_lower for kw in [
        'ogilvy', 'brealey', 'myers', 'nist', 'porter', 'kahneman',
        'cialdini', 'aaker', 'kotler', 'ries', 'trout', 'heath',
        'berger', 'mckee', 'godin', 'miller',
    ]) else 0

    return round(min(1.0, base + tier_bonus + toon_bonus + auth_bonus), 2)


# ── Priority tier assignment ───────────────────────────────────

def assign_priority(doc_type: str, heading: str) -> int:
    """Assign priority tier (1=load-bearing, 2=structural, 3=supplementary)."""
    heading_lower = heading.lower()

    # Tier 1: Load-bearing — principles, formulas, rules, gate logic
    tier1_headings = ['principles', 'instructions', 'purpose', 'boundaries',
                      'constitution', 'fiduciary', 'risk', 'gate', 'protocol',
                      'structure', 'rule', 'test', 'source', 'citation']
    # Tier 3: Supplementary — examples, templates, notes, history
    tier3_headings = ['example', 'template', 'note', 'history', 'appendix',
                      'reference', 'readme', 'assets', 'department status',
                      'skill roster', 'position', 'operational layer',
                      'tool requirements', 'commands']

    for t1 in tier1_headings:
        if t1 in heading_lower:
            return 1
    for t3 in tier3_headings:
        if t3 in heading_lower:
            return 3
    return 2

# ── Agent and department extraction ────────────────────────────

def extract_agent_context(filepath: str, teams_root: str) -> Dict:
    """Extract department and agent name from file path."""
    rel = os.path.relpath(filepath, teams_root)
    parts = rel.split(os.sep)

    dept = parts[0] if len(parts) > 0 else 'unknown'
    agent = parts[1] if len(parts) > 1 and not parts[1].startswith('.') else None

    # Validate department name
    valid_depts = ['Executive Office', 'Governance', 'Engineering',
                   'Cybersecurity', 'Product', 'AI & Agents', 'Brand Studio',
                   'Shared OS']
    if dept not in valid_depts:
        dept = 'Shared OS'  # Fallback for top-level files

    # Determine assigned agents
    assigned = []
    if agent:
        assigned.append(agent)
    elif 'Shared OS' in rel:
        assigned = []  # Shared OS serves all agents

    return {'department': dept, 'agent': agent or '', 'assigned_agents': assigned}

# ── Markdown parser ────────────────────────────────────────────

def parse_sections(content: str) -> List[Dict]:
    """Parse markdown into heading-delimited sections with preserved hierarchy."""
    lines = content.split('\n')
    sections = []
    current_heading = None
    current_depth = 0
    current_lines = []
    in_frontmatter = False

    for line in lines:
        stripped = line.strip()

        # Skip YAML frontmatter
        if stripped == '---':
            in_frontmatter = not in_frontmatter
            if not in_frontmatter and not current_heading:
                # Material before first heading — capture as preamble
                pass
            continue
        if in_frontmatter:
            continue

        # Detect heading
        heading_match = re.match(r'^(#{1,4})\s+(.+)', stripped)
        if heading_match:
            # Save previous section
            if current_heading and current_lines:
                text = '\n'.join(current_lines).strip()
                if text and len(text) > 10:
                    sections.append({
                        'heading': current_heading,
                        'depth': current_depth,
                        'text': text,
                    })

            current_heading = heading_match.group(2)
            current_depth = len(heading_match.group(1))
            current_lines = []
            continue

        current_lines.append(line)

    # Don't forget the last section
    if current_heading and current_lines:
        text = '\n'.join(current_lines).strip()
        if text and len(text) > 10:
            sections.append({
                'heading': current_heading,
                'depth': current_depth,
                'text': text,
            })

    return sections

# ── Python script extraction ───────────────────────────────────

def extract_python_functions(filepath: str) -> List[Dict]:
    """Extract function docstrings from Python scripts in Shared OS/logical."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except:
        return []

    chunks = []
    lines = content.split('\n')
    current_func = None
    current_doc = []
    in_docstring = False

    for line in lines:
        stripped = line.strip()

        # Detect function definitions
        if re.match(r'^def (\w+)\(', stripped):
            func_name = re.match(r'^def (\w+)\(', stripped).group(1)
            if func_name.startswith('_'):
                continue  # Skip private functions
            current_func = func_name
            current_doc = []
            in_docstring = False
            continue

        # Detect docstring start
        if current_func and not in_docstring and ('"""' in stripped or "'''" in stripped):
            in_docstring = True
            # Check for single-line docstring
            if stripped.count('"""') == 2 or stripped.count("'''") == 2:
                doc_text = stripped.split('"""')[1] if '"""' in stripped else stripped.split("'''")[1]
                current_doc.append(doc_text)
                in_docstring = False
                chunks.append({
                    'heading': f'def {current_func}()',
                    'depth': 3,
                    'text': doc_text.strip(),
                })
                current_func = None
            continue

        # Collect docstring lines
        if in_docstring and current_func:
            if '"""' in stripped or "'''" in stripped:
                # End of docstring
                in_docstring = False
                doc_text = ' '.join(current_doc).strip()
                if doc_text and len(doc_text) > 20:
                    chunks.append({
                        'heading': f'def {current_func}()',
                        'depth': 3,
                        'text': doc_text,
                    })
                current_func = None
            else:
                current_doc.append(stripped)

    return chunks

# ─── TOON text generation ──────────────────────────────────────

def generate_toon_text(heading: str, text: str, max_chars: int = 300) -> str:
    """Generate a compact TOON representation of a chunk."""
    abbr = heading.lower().replace(' ', '_')[:20]
    # Take first max_chars chars of text, compress
    compact = text[:max_chars].replace('\n', ' · ').replace('|', '\\|')
    if len(text) > max_chars:
        compact += '…'
    return f'{abbr}={compact}'

# ─── Main chunker ──────────────────────────────────────────────

def chunk_file(filepath: str, teams_root: str) -> List[Dict]:
    """Chunk a single file into semantic sections."""
    doc_type = detect_document_type(filepath)
    context = extract_agent_context(filepath, teams_root)

    # Python scripts — function-level extraction
    if filepath.endswith('.py') and 'Shared OS/logical' in filepath:
        sections = extract_python_functions(filepath)
    else:
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
        except:
            return []
        sections = parse_sections(content)

    chunks = []
    rel_path = os.path.relpath(filepath, teams_root)
    mtime = os.path.getmtime(filepath) if os.path.exists(filepath) else 0
    toon_path = filepath.replace('.md', '.toon')

    for i, section in enumerate(sections):
        text = section['text']
        heading = section['heading']
        char_count = len(text)

        # Skip sections that are too small to be useful
        if char_count < 30:
            continue

        # Skip pure structural sections (tables with no prose)
        if text.count('|') > char_count * 0.3:
            # Heavy table section — include but mark
            pass

        chunk_id = f"{rel_path.replace('/', '--')}--{heading.lower().replace(' ', '-')[:60]}"
        priority = assign_priority(doc_type, heading)

        # TOON text
        toon_text = ''
        if toon_path and os.path.exists(toon_path):
            try:
                with open(toon_path, 'r', encoding='utf-8') as f:
                    toon_text = f.read()[:500]  # First 500 chars of TOON
            except:
                pass
        if not toon_text:
            toon_text = generate_toon_text(heading, text)

        # Initial quality score based on document type and file properties
        quality = _initial_quality(doc_type, rel_path, priority, bool(toon_text))

        chunk = {
            'chunk_id': chunk_id,
            'source_file': rel_path,
            'section': heading,
            'depth': section['depth'],
            'department': context['department'],
            'assigned_agents': context['assigned_agents'],
            'document_type': doc_type,
            'priority_tier': priority,
            'char_count': char_count,
            'toon_available': bool(toon_text),
            'last_modified': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime(mtime)),
            'quality_score': quality,
            'chunk_text': text,
            'toon_text': toon_text,
        }
        chunks.append(chunk)

    return chunks

# ─── CLI ───────────────────────────────────────────────────────

def find_md_files(teams_dir: str) -> List[str]:
    """Find all .md and logical .py files in Teams/."""
    files = []
    for root, dirs, filenames in os.walk(teams_dir):
        dirs[:] = [d for d in dirs if not d.startswith('.') and d != 'node_modules']
        for f in filenames:
            if f.endswith('.md') and not f.endswith('.toon'):
                files.append(os.path.join(root, f))
            elif f.endswith('.py') and 'Shared OS/logical' in root:
                files.append(os.path.join(root, f))
    return files

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    teams_dir = os.path.join(script_dir, '..', '..', 'Teams')
    chunks_dir = os.path.join(script_dir, '..', 'chunks')
    os.makedirs(chunks_dir, exist_ok=True)

    cmd = sys.argv[1] if len(sys.argv) > 1 else '--status'

    if cmd == '--test':
        result = run_tests(teams_dir)
        sys.exit(0 if result else 1)

    if cmd == '--status':
        manifest_path = os.path.join(chunks_dir, 'chunks.json')
        if not os.path.exists(manifest_path):
            print('\n  No chunks.json found. Run: python3 rag/chunkify.py --all\n')
            return
        with open(manifest_path, 'r') as f:
            data = json.load(f)
        chunks = data['chunks']
        files_chunked = len(set(c['source_file'] for c in chunks))
        total_chars = sum(c['char_count'] for c in chunks)
        by_dept = {}
        for c in chunks:
            d = c['department']
            by_dept[d] = by_dept.get(d, 0) + 1
        by_tier = {1:0, 2:0, 3:0}
        for c in chunks:
            by_tier[c['priority_tier']] = by_tier.get(c['priority_tier'], 0) + 1

        print(f'\n  📊 YVON RAG Chunking Status\n')
        print(f'  Total chunks: {len(chunks):,}')
        print(f'  Files chunked: {files_chunked}')
        print(f'  Total characters: {total_chars:,}')
        print(f'  Avg chunk size: {total_chars//max(len(chunks),1):,} chars')
        print(f'\n  By department:')
        for dept, count in sorted(by_dept.items()):
            print(f'    {dept}: {count}')
        print(f'\n  By priority:')
        for tier, count in sorted(by_tier.items()):
            label = {1:'Load-bearing',2:'Structural',3:'Supplementary'}
            pct = count/max(len(chunks),1)*100
            print(f'    Tier {tier} ({label[tier]}): {count} ({pct:.0f}%)')
        print()

    elif cmd == '--all':
        md_files = find_md_files(teams_dir)
        all_chunks = []
        failures = 0
        print(f'\n  🔪 YVON Semantic Chunker — {len(md_files)} files\n')

        for md_path in sorted(md_files):
            rel = os.path.relpath(md_path, teams_dir)
            try:
                file_chunks = chunk_file(md_path, teams_dir)
                all_chunks.extend(file_chunks)
                if file_chunks and len(file_chunks) > 3:
                    print(f'  ✅ {rel} → {len(file_chunks)} chunks')
            except Exception as e:
                print(f'  ❌ {rel}: {e}')
                failures += 1

        # Write manifest
        manifest = {
            'version': '1.0.0',
            'created': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
            'total_chunks': len(all_chunks),
            'total_files_chunked': len(set(c['source_file'] for c in all_chunks)),
            'chunks': all_chunks,
        }
        manifest_path = os.path.join(chunks_dir, 'chunks.json')
        with open(manifest_path, 'w', encoding='utf-8') as f:
            json.dump(manifest, f, indent=2, ensure_ascii=False)

        size_kb = os.path.getsize(manifest_path) / 1024
        print(f'\n  📊 {len(all_chunks):,} chunks from {len(set(c["source_file"] for c in all_chunks))} files → chunks.json ({size_kb:.0f} KB)\n')

    elif cmd == '--agent':
        agent_id = sys.argv[2] if len(sys.argv) > 2 else ''
        if not agent_id:
            print('  Usage: python3 rag/chunkify.py --agent <agent-id>')
            return
        md_files = [f for f in find_md_files(teams_dir) if f'/{agent_id}/' in f]
        chunks = []
        for md_path in md_files:
            rel = os.path.relpath(md_path, teams_dir)
            chunks.extend(chunk_file(md_path, teams_dir))
            print(f'  ✅ {rel} → {len(chunk_file(md_path, teams_dir))} chunks')
        print(f'\n  Agent {agent_id}: {len(chunks)} total chunks\n')
    else:
        print(f'  Usage: python3 rag/chunkify.py [--all|--agent <id>|--status|--test]')

# ─── Self-tests ────────────────────────────────────────────────

def run_tests(teams_dir: str) -> bool:
    """Verify chunker produces correct output."""
    passed, failed = 0, 0

    def check(label, condition, detail=''):
        nonlocal passed, failed
        if condition:
            print(f'  ✅ {label}')
            passed += 1
        else:
            print(f'  ❌ {label}: {detail}')
            failed += 1

    print('\n  🧪 YVON Chunker — Self-Tests\n')

    # Test 1: All 7 departments detected
    depts_found = set()
    for root, dirs, _ in os.walk(teams_dir):
        if root == teams_dir:
            depts_found = {d for d in dirs if not d.startswith('.')}
            break
    expected = {'Executive Office', 'Governance', 'Engineering', 'Cybersecurity',
                'Product', 'AI & Agents', 'Brand Studio', 'Shared OS'}
    check(f'All 7 departments (8 with Shared OS) found: {len(depts_found & expected)}/{len(expected)}',
          len(depts_found & expected) >= 7,
          f'Missing: {expected - depts_found}')

    # Test 2: Find a specific known file and chunk it
    test_path = os.path.join(teams_dir, 'Brand Studio', 'spark', 'agent.md')
    if os.path.exists(test_path):
        chunks = chunk_file(test_path, teams_dir)
        check(f'spark/agent.md produces chunks ({len(chunks)} found)',
              len(chunks) >= 2,
              f'Expected ≥2 sections, got {len(chunks)}')

        # Check chunk structure
        if chunks:
            c = chunks[0]
            check('chunk has chunk_id', bool(c.get('chunk_id')))
            check('chunk has section heading', bool(c.get('section')))
            check('chunk has department', c.get('department') == 'Brand Studio')
            check('chunk has assigned_agents', 'spark' in c.get('assigned_agents', []))
            check('chunk has document_type', c.get('document_type') == 'agent')
            check('chunk has priority_tier', c.get('priority_tier') in (1, 2, 3))

    # Test 3: Python script extraction
    py_path = os.path.join(teams_dir, 'Shared OS', 'logical', 'capital_budgeting.py')
    if os.path.exists(py_path):
        chunks = chunk_file(py_path, teams_dir)
        check(f'capital_budgeting.py produces function chunks ({len(chunks)} found)',
              len(chunks) >= 5,
              f'Expected ≥5 functions, got {len(chunks)}')
        if chunks:
            check('Python chunk has def heading', 'def ' in chunks[0].get('section', '').lower())

    # Test 4: Route D wisdom large file chunking
    wisdom_path = os.path.join(teams_dir, 'Shared OS', 'logical', 'aaker-brand-equity.md')
    if os.path.exists(wisdom_path):
        chunks = chunk_file(wisdom_path, teams_dir)
        check(f'aaker-brand-equity.md produces many chunks ({len(chunks)} found)',
              len(chunks) >= 10,
              f'Expected ≥10 sections, got {len(chunks)}')

    # Test 5: Shared OS chunks have correct department
    if os.path.exists(wisdom_path):
        chunks = chunk_file(wisdom_path, teams_dir)
        if chunks:
            dept = chunks[0]['department']
            check(f'Shared OS chunk has correct department: {dept}',
                  dept == 'Shared OS')

    # Test 6: SKILL.md file produces Instructions or Phase chunks
    skill_path = os.path.join(teams_dir, 'Executive Office', 'marcus', 'custom',
                              'decision-critic', 'SKILL.md')
    if os.path.exists(skill_path):
        chunks = chunk_file(skill_path, teams_dir)
        headings = [c['section'].lower() for c in chunks]
        check('SKILL.md has Principles section',
              any('principles' in h for h in headings),
              f'Headings: {headings}')
        has_instructions = any('instructions' in h or 'phase' in h for h in headings)
        check('SKILL.md has Instructions/Phase section',
              has_instructions,
              f'Headings: {headings}')

    # Test 7: Priority tier assignment
    if os.path.exists(skill_path):
        chunks = chunk_file(skill_path, teams_dir)
        tiers = [c['priority_tier'] for c in chunks]
        check('SKILL chunks have tier 1 (principles/instructions)',
              any(t == 1 for t in tiers))
        check('All tiers are 1-3',
              all(1 <= t <= 3 for t in tiers))

    # Test 8: Chunk dedup by ID
    if os.path.exists(test_path):
        chunks = chunk_file(test_path, teams_dir)
        ids = [c['chunk_id'] for c in chunks]
        check(f'All {len(ids)} chunks have unique IDs',
              len(ids) == len(set(ids)))

    print(f'\n  📊 {passed}/{passed+failed} passed\n')
    return failed == 0


if __name__ == '__main__':
    main()
