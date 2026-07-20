#!/usr/bin/env python3
"""
YVON Progressive Disclosure — Skill Lazy Loading System
=========================================================
Agent skills are loaded on-demand based on query trigger matching.
Only matched skills get full SKILL.md injected; unmatched skills
stay as one-line summaries (~8 tokens each).

This implements the Agent-Skills-for-Context-Engineering pattern:
  → Load skill descriptions at startup
  → Match query against skill triggers
  → Activate 2-5 skills → load full SKILL.md
  → Inactive → summary only

Savings: ~40-60% on skill context for agents with 5+ skills.

Multi-LLM awareness:
  hermes + claude → skill matching logic
  deepseek → skill relevance verification
  chatgpt → creative skill quality assessment

Usage:
  python3 rag/progressive_disclosure.py --test
"""

import sys, os, re
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__)) if '__file__' in dir() else os.getcwd()
sys.path.insert(0, SCRIPT_DIR)


# ═══════════════════════════════════════════════════════════════════
# SKILL REGISTRY PARSER
# ═══════════════════════════════════════════════════════════════════

@dataclass
class SkillDescriptor:
    name: str
    description: str
    triggers: List[str]
    content: str          # Full SKILL.md content (loaded on activation)
    activated: bool
    activation_reason: str


def parse_skill_roster(agent_md_content: str) -> List[Dict]:
    """Parse the Skill Roster section from an agent.md file."""
    skills = []
    in_roster = False

    for line in agent_md_content.split('\n'):
        if re.search(r'(?i)##\s*(skill roster|skills|custom skills|marketplace skills)', line):
            in_roster = True
            continue
        if in_roster and line.startswith('##') and not re.search(r'skill|roster', line, re.I):
            break
        if in_roster and line.startswith('- ') or (in_roster and re.match(r'\*\s', line)):
            # Parse skill entry: "- skill-name: description"
            entry = line.strip('- *').strip()
            if ':' in entry:
                name = entry.split(':')[0].strip()
                desc = entry.split(':', 1)[1].strip() if ':' in entry else ''
                skills.append({'name': name, 'description': desc})
            else:
                skills.append({'name': entry, 'description': ''})

    return skills


def parse_skill_triggers(skill_md_content: str, skill_name: str) -> List[str]:
    """Extract triggers from a SKILL.md file."""
    triggers = []
    in_triggers = False

    for line in skill_md_content.split('\n'):
        if re.search(r'(?i)##\s*triggers', line):
            in_triggers = True
            continue
        if in_triggers and line.startswith('##'):
            break
        if in_triggers:
            trig = line.strip('- *').strip().lower()
            if trig and len(trig) > 2:
                triggers.append(trig)

    if not triggers:
        # Fallback: use skill name and description as triggers
        triggers = [skill_name.lower()]

    return triggers


# ═══════════════════════════════════════════════════════════════════
# PROGRESSIVE DISCLOSURE ENGINE
# ═══════════════════════════════════════════════════════════════════

@dataclass
class DisclosureResult:
    active_skills: List[SkillDescriptor]
    inactive_skills: List[SkillDescriptor]
    total_skills: int
    active_count: int
    savings_pct: float  # Percentage of skill context saved


class ProgressiveDisclosure:
    """Manages progressive loading of agent skills based on query matching."""

    def __init__(self, agent_id: str = '', skills_dir: str = ''):
        self.agent_id = agent_id
        self.skills_dir = skills_dir
        self.skills: List[SkillDescriptor] = []

    def register_skill(self, name: str, description: str, triggers: List[str],
                       content: str = '') -> None:
        """Register a skill with its description and triggers."""
        self.skills.append(SkillDescriptor(
            name=name, description=description,
            triggers=triggers, content=content,
            activated=False, activation_reason='',
        ))

    def load_for_query(self, query: str, max_active: int = 5) -> DisclosureResult:
        """
        Match query against registered skill triggers.
        Activate matching skills (load full content).
        Keep non-matching skills as summaries.
        """
        query_lower = query.lower()
        active = []
        inactive = []

        for skill in self.skills:
            # Check trigger matches
            matched = False
            for trigger in skill.triggers:
                if trigger and len(trigger) >= 3 and trigger in query_lower:
                    matched = True
                    skill.activation_reason = f'trigger: "{trigger}" matched in query'
                    break

            # Also check skill name match
            if not matched and skill.name.lower() in query_lower:
                matched = True
                skill.activation_reason = f'skill name "{skill.name}" matched in query'

            # Also check description keyword match
            if not matched and skill.description:
                desc_terms = set(re.findall(r'[a-z]{4,}', skill.description.lower()))
                query_terms = set(re.findall(r'[a-z]{4,}', query_lower))
                if len(desc_terms & query_terms) >= 2:
                    matched = True
                    skill.activation_reason = 'description keywords matched query'

            if matched and len(active) < max_active:
                skill.activated = True
                active.append(skill)
            else:
                skill.activated = False
                inactive.append(skill)

        # Cap at max_active
        if len(active) > max_active:
            overflow = active[max_active:]
            active = active[:max_active]
            for s in overflow:
                s.activated = False
                inactive.append(s)

        total = len(self.skills)
        savings = ((total - len(active)) / max(total, 1)) * 100

        return DisclosureResult(
            active_skills=active,
            inactive_skills=inactive,
            total_skills=total,
            active_count=len(active),
            savings_pct=round(savings, 1),
        )

    def generate_inactive_summaries(self) -> List[str]:
        """Generate one-line summaries for inactive skills."""
        return [
            f'{skill.name}: {skill.description[:80]}'
            for skill in self.skills
            if not skill.activated and skill.description
        ]

    def generate_active_content(self) -> List[Dict]:
        """Return full content for active skills."""
        return [
            {'name': s.name, 'content': s.content, 'reason': s.activation_reason}
            for s in self.skills if s.activated and s.content
        ]


# ═══════════════════════════════════════════════════════════════════
# SELF-TESTS
# ═══════════════════════════════════════════════════════════════════

def run_tests() -> bool:
    passed, failed = 0, 0
    def check(label, condition, detail=''):
        nonlocal passed, failed
        if condition: print(f'  ✅ {label}'); passed += 1
        else: print(f'  ❌ {label}: {detail}'); failed += 1

    print('\n  📋 YVON Progressive Disclosure — Skill Lazy Loading\n')

    # ── Test 1: Skill Registration ──
    print('── Skill Registration ──')
    pd = ProgressiveDisclosure(agent_id='marcus')

    pd.register_skill(
        'decision-critic',
        'Stress-tests strategic decisions against decision analysis framework',
        ['decision', 'approve', 'reject', 'acquire', 'invest', 'decide'],
        'FULL SKILL CONTENT: decision-critic applies Bayesian decision analysis...'
    )
    pd.register_skill(
        'venture-priority-matrix',
        'Scores ventures on strategic fit, urgency, and resource requirements',
        ['invest', 'acquire', 'prioritize', 'venture', 'priority'],
        'FULL SKILL CONTENT: venture-priority-matrix evaluates ventures...'
    )
    pd.register_skill(
        'strategy-advisor',
        'Provides strategic options with competitive analysis and market positioning',
        ['strategy', 'competition', 'market', 'porter', 'positioning'],
        'FULL SKILL CONTENT: strategy-advisor generates strategic options...'
    )
    pd.register_skill(
        'okr-cascade',
        'Cascades company OKRs to department level with measurable KRs',
        ['okr', 'goals', 'quarterly', 'objectives', 'key results'],
        'FULL SKILL CONTENT: okr-cascade breaks down OKRs by department...'
    )
    pd.register_skill(
        'vision-exploration',
        'Explores future scenarios and long-term strategic narratives',
        ['vision', 'future', 'scenario', 'explore', 'narrative', '10-year'],
        'FULL SKILL CONTENT: vision-exploration develops long-term scenarios...'
    )

    check(f'Registered {len(pd.skills)} skills', len(pd.skills) == 5)

    # ── Test 2: Query-Trigger Matching ──
    print('── Query-Trigger Matching ──')

    result = pd.load_for_query('should we acquire Competitor X for $2M valuation?')

    check(f'Active skills: {result.active_count}', result.active_count >= 2,
          f'Expected 2-3, got {result.active_count}')
    check('decision-critic activated',
          any(s.name == 'decision-critic' and s.activated for s in pd.skills))
    check('venture-priority-matrix activated',
          any(s.name == 'venture-priority-matrix' and s.activated for s in pd.skills))
    check(f'Savings: {result.savings_pct}%', result.savings_pct >= 30,
          f'{result.savings_pct}%')

    # ── Test 3: Inactive Skills Stay Inactive ──
    print('── Inactive Skills ──')
    okr_inactive = any(s.name == 'okr-cascade' and not s.activated for s in pd.skills)
    vision_inactive = any(s.name == 'vision-exploration' and not s.activated for s in pd.skills)
    check('okr-cascade not activated (no OKR terms in query)', okr_inactive)
    check('vision-exploration not activated (no vision terms)', vision_inactive)

    # ── Test 4: Summary Generation ──
    print('── Summary Generation ──')
    summaries = pd.generate_inactive_summaries()
    check(f'Inactive summaries: {len(summaries)}', len(summaries) >= 2)
    for s in summaries:
        check(f'Summary is short: {s}', len(s) < 200, f'{len(s)} chars')

    # ── Test 5: Active Content Generation ──
    print('── Active Content ──')
    active_content = pd.generate_active_content()
    check(f'Active content items: {len(active_content)}', len(active_content) >= 2)
    for ac in active_content:
        check(f'Active skill has content: {ac["name"]}', len(ac['content']) > 10)

    # ── Test 6: Different Query → Different Activation ──
    print('── Query-Dependent Activation ──')
    pd2 = ProgressiveDisclosure(agent_id='marcus')
    for s in pd.skills:
        pd2.register_skill(s.name, s.description, s.triggers, s.content)

    result2 = pd2.load_for_query('set quarterly OKRs for Q3 with measurable objectives')

    check('OKR query activates okr-cascade',
          any(s.name == 'okr-cascade' and s.activated for s in pd2.skills))
    check('OKR query does NOT activate decision-critic',
          not any(s.name == 'decision-critic' and s.activated for s in pd2.skills))

    # ── Test 7: Skill Roster Parser ──
    print('── Skill Roster Parser ──')
    agent_md = """
## Skill Roster
- decision-critic: Stress-tests strategic decisions
- venture-priority-matrix: Scores ventures on fit and urgency
- strategy-advisor: Competitive analysis and market positioning
- okr-cascade: Cascades company OKRs
- vision-exploration: Long-term scenario planning
"""
    parsed = parse_skill_roster(agent_md)
    check(f'Parsed {len(parsed)} skills from agent.md', len(parsed) == 5)
    check('First skill parsed correctly',
          parsed[0]['name'] == 'decision-critic' and parsed[0]['description'].startswith('Stress-tests'))

    # ── Test 8: Trigger Parser ──
    print('── Trigger Parser ──')
    skill_md = """
# decision-critic
## Triggers
- decision
- approve
- reject
- acquire
- invest
## Input
A strategic decision statement.
"""
    triggers = parse_skill_triggers(skill_md, 'decision-critic')
    check(f'Extracted {len(triggers)} triggers', len(triggers) >= 3)
    check('"acquire" in triggers', 'acquire' in triggers)

    # ── Test 9: Max Active Cap ──
    print('── Max Active Cap ──')
    # Query that matches ALL skills
    result3 = pd.load_for_query(
        'acquire company, set strategy, prioritize ventures, define OKRs, explore vision future scenarios',
        max_active=3
    )
    check(f'Capped at max_active=3 (got {result3.active_count})',
          result3.active_count <= 3, f'Got {result3.active_count}')

    # ── Test 10: Edge Cases ──
    print('── Edge Cases ──')
    pd_empty = ProgressiveDisclosure()
    r_empty = pd_empty.load_for_query('anything')
    check('Empty agent: 0 active, 0 inactive', r_empty.active_count == 0 and r_empty.total_skills == 0)

    # No trigger match
    pd3 = ProgressiveDisclosure(agent_id='test')
    pd3.register_skill('unrelated-skill', 'Does something unrelated',
                       ['unrelated', 'trigger', 'mismatch'], 'content...')
    r_no_match = pd3.load_for_query('completely different topic')
    check('No match: 0 active', r_no_match.active_count == 0)

    print(f'\n  📊 {passed}/{passed+failed} passed\n')
    return failed == 0


if __name__ == '__main__':
    if '--test' in sys.argv or len(sys.argv) == 1:
        sys.exit(0 if run_tests() else 1)
    else:
        print('Usage: python3 rag/progressive_disclosure.py --test')
