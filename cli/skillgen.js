#!/usr/bin/env node
/**
 * skillgen.js — YVON skill compiler (Adoption A1)
 * ------------------------------------------------
 * Compiles an agent's source skills in Teams/ into runtime skills with
 * uniform frontmatter + tier-matched preambles (Adoption A3).
 *
 * Teams/ is the single source of truth. Output is disposable.
 *
 * Usage:
 *   node cli/skillgen.js <agent> [--out <dir>]   # default out: dist/skills
 *
 * Derivation rules (Playbook §0.5 — nothing invented):
 *   triggers      ← quoted phrases in source "## When to Use"
 *   description   ← first sentence of source "## Purpose" + "(yvon)"
 *   allowed-tools ← Required column of operational/tool/<agent>-tool-requirements.md
 *   boundaries    ← lines mentioning the skill in <agent>-skill-routing.md
 *   tier          ← source frontmatter `tier:` override, else custom→3, marketplace→2
 *   name          ← source name, company prefix stripped (§0.4a)
 *   version       ← 1.0.0; minor bump when source_hash changes
 */
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const TEAMS = path.join(ROOT, 'Teams');
const TPL_DIR = path.join(TEAMS, 'Shared OS', 'skills', 'skill-template');

// ── helpers ────────────────────────────────────────────────────────────
const read = (f) => fs.readFileSync(f, 'utf8');
const exists = (f) => { try { fs.accessSync(f); return true; } catch { return false; } };
const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');

function parseFrontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---/);
  const fm = {};
  if (m) for (const line of m[1].split('\n')) {
    const kv = line.match(/^(\w[\w-]*):\s*(.*)$/);
    if (kv) fm[kv[1]] = kv[2].trim();
  }
  return { fm, body: m ? text.slice(m[0].length) : text };
}

function parseSections(body) {
  const sections = {};
  const parts = body.split(/^## +/m).slice(1);
  for (const p of parts) {
    const nl = p.indexOf('\n');
    sections[p.slice(0, nl).trim()] = p.slice(nl + 1).trim();
  }
  return sections;
}

// case-insensitive section lookup with aliases
function getSec(sections, ...names) {
  for (const n of names) {
    const k = Object.keys(sections).find((k) => k.toLowerCase() === n.toLowerCase());
    if (k) return sections[k];
  }
  return '';
}

// first prose paragraph (marketplace fallback for Purpose)
function firstParagraph(body) {
  return (body.split(/\n\n+/).find((p) => {
    const t = p.trim();
    return t && !t.startsWith('#') && !t.startsWith('---') && !t.startsWith('|') && !t.startsWith('```');
  }) || '').trim();
}

function parseInlineList(v) {
  if (!v || !v.startsWith('[')) return null;
  return v.replace(/^\[|\]$/g, '').split(',').map((s) => s.trim()).filter(Boolean);
}

function findAgentDir(agent) {
  for (const dept of fs.readdirSync(TEAMS)) {
    const d = path.join(TEAMS, dept, agent);
    if (exists(path.join(d, 'agent.md')) || exists(d)) {
      if (fs.existsSync(d) && fs.statSync(d).isDirectory()) return { dept, dir: d };
    }
  }
  return null;
}

function deriveTriggers(whenToUse, skillName) {
  const out = new Set([skillName.replace(/-/g, ' ')]);
  if (whenToUse) {
    const rx = /[""]([^"""]{3,60})[""]|"([^"]{3,60})"/g;
    let m;
    while ((m = rx.exec(whenToUse)) && out.size < 8) {
      const t = (m[1] || m[2]).replace(/[,.]$/, '').trim();
      if (t && !/\[.*\]/.test(t)) out.add(t.toLowerCase());
    }
  }
  return [...out];
}

function deriveDescription(purpose, skillName) {
  if (!purpose) return `<FILL_IN: no ## Purpose section in source for ${skillName}> (yvon)`;
  const flat = purpose.replace(/\n+/g, ' ');
  const first = flat.match(/^(.{20,240}?[.!?])(\s|$)/);
  if (first) return `${first[1].trim()} (yvon)`;
  const cut = flat.slice(0, 200).replace(/\s+\S*$/, ''); // word boundary
  return `${cut.trim()}… (yvon)`;
}

const TOOL_MAP = [
  [/file (read\/write|write\/read)|repo (scope|read\/write)/i, ['Read', 'Write']],
  [/file write/i, ['Write']],
  [/file read|read[- ]only|read (access|of)|log source read/i, ['Read']],
  [/python|shell|execution|script|build/i, ['Bash']],
  [/web search|web read|web-search/i, ['WebSearch']],
  [/second model|cross-check|another (claude|model)|subagent|dispatch/i, ['Agent']],
];

function deriveTools(toolReqText, skillName) {
  if (!toolReqText) return null; // unknown → FILL_IN downstream
  const lname = skillName.toLowerCase();
  // Format A: per-skill table — | Skill | Required | ... |
  for (const line of toolReqText.split('\n')) {
    if (!line.startsWith('|')) continue;
    const cells = line.split('|').map((c) => c.trim());
    if (cells[1] && cells[1].toLowerCase().replace(/\s*\(.*\)$/, '') === lname) {
      const required = cells[2] || '';
      if (/^none/i.test(required)) return [];
      const tools = new Set();
      let matched = false;
      for (const [rx, names] of TOOL_MAP)
        if (rx.test(required)) { names.forEach((n) => tools.add(n)); matched = true; }
      if (!matched) return [`<FILL_IN: unmapped requirement "${required}">`];
      return [...tools];
    }
  }
  // Format B: per-need table — | Need | Tool / access | Used by | ... |
  // Rows apply when "Used by" names this skill or says "all skills".
  const tools = new Set();
  let sawNeedRow = false;
  for (const line of toolReqText.split('\n')) {
    if (!line.startsWith('|')) continue;
    const cells = line.split('|').map((c) => c.trim());
    if (cells.length < 5 || /^[-\s:]*$/.test(cells[1])) continue;
    const usedBy = (cells[3] || '').toLowerCase();
    if (usedBy.includes(lname) || usedBy.includes('all skills')) {
      sawNeedRow = true;
      const text = `${cells[1]} ${cells[2]}`;
      for (const [rx, names] of TOOL_MAP)
        if (rx.test(text)) names.forEach((n) => tools.add(n));
    }
  }
  if (sawNeedRow) return tools.size ? [...tools] : [];
  return null; // skill not in any table
}

function deriveBoundaries(routingText, skillName) {
  if (!routingText) return '';
  const lines = routingText.split('\n').filter(
    (l) => l.includes(skillName) && !l.startsWith('name:') && !l.startsWith('assigned_agent:')
  );
  const bullets = lines.filter((l) => /^\s*[-*]|→|->/.test(l)).slice(0, 10);
  const picked = (bullets.length ? bullets : lines.slice(0, 6)).map((l) => l.trim());
  return picked.join('\n');
}

function assembleFragments(tier, vars) {
  const manifest = JSON.parse(read(path.join(TPL_DIR, 'preambles', 'manifest.json')));
  const spec = manifest[String(tier)];
  if (!spec) throw new Error(`no preamble tier ${tier} in manifest`);
  const sub = (s) => s.replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? `{{${k}}}`);
  const build = (list) => {
    let bash = [], prose = [];
    for (const f of list || []) {
      const content = sub(read(path.join(TPL_DIR, 'preambles', f)).trim());
      (f.endsWith('.sh.frag') ? bash : prose).push(content);
    }
    let out = '';
    if (bash.length) out += '```bash\n' + bash.join('\n\n') + '\n```\n';
    if (prose.length) out += '\n' + prose.join('\n\n') + '\n';
    return out.trim();
  };
  return { preamble: build(spec.preamble), postamble: build(spec.postamble) };
}

// dept-leader voice: compiled from identity/ Core Traits (identity holders only)
function voiceFor(agentDir) {
  const idDir = path.join(agentDir, 'identity');
  if (!exists(idDir)) return { identity: 'none', voice: '' };
  const f = fs.readdirSync(idDir).find((x) => x.endsWith('.md'));
  if (!f) return { identity: 'none', voice: '' };
  const text = read(path.join(idDir, f)).replace(/^---[\s\S]*?---/, '');
  const traits = getSec(parseSections(text), 'Core Traits');
  const id = f.replace('.md', '');
  return {
    identity: id,
    voice: traits
      ? `Active identity: **${id}** (\`identity/${f}\`) — applied uniformly across this skill.\n\n${traits.split('\n').slice(0, 25).join('\n').trim()}`
      : `Active identity: ${id} — see \`identity/${f}\`.`,
  };
}

// machine-readable routing block (preferred over prose heuristics when present)
function routingBlockFor(routingText, name) {
  const m = routingText.match(/# yvon-compile:[^\n]*\n([\s\S]*?)```/);
  if (!m) return null;
  const esc = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const e = m[1].match(new RegExp('^ {2}' + esc + ':\\n((?: {4}.+\\n?)+)', 'm'));
  if (!e) return null;
  return e[1].split('\n').filter(Boolean)
    .map((l) => '- ' + l.replace(/^ {4}/, '').replace(/^(\w[\w-]*): /, '**$1**: '))
    .join('\n');
}

function stripEmptySections(text) {
  return text.replace(/\n## [^\n]+\n+(?=(## |$))/g, '\n');
}

// ── main ───────────────────────────────────────────────────────────────
function main() {
  const args = process.argv.slice(2);
  const agent = args.find((a) => !a.startsWith('--'));
  const outIdx = args.indexOf('--out');
  const OUT = outIdx >= 0 ? path.resolve(args[outIdx + 1]) : path.join(ROOT, 'dist', 'skills');
  if (!agent) { console.error('usage: node cli/skillgen.js <agent> [--out <dir>]'); process.exit(1); }

  const loc = findAgentDir(agent);
  if (!loc) { console.error(`agent "${agent}" not found under Teams/`); process.exit(1); }
  const { dept, dir } = loc;

  const tpl = read(path.join(TPL_DIR, 'SKILL.md.tmpl')).replace(/^<!--[\s\S]*?-->\n/, '');
  const routingDir = path.join(dir, 'operational', 'skill');
  const routingFile = exists(routingDir) ? fs.readdirSync(routingDir).find((f) => f.endsWith('.md')) : null;
  const routingText = routingFile ? read(path.join(routingDir, routingFile)) : '';
  const toolDir = path.join(dir, 'operational', 'tool');
  const toolFile = exists(toolDir) ? fs.readdirSync(toolDir).find((f) => f.endsWith('.md')) : null;
  const toolReqText = toolFile ? read(path.join(toolDir, toolFile)) : '';

  const sources = [];
  for (const kind of ['custom', 'marketplace']) {
    const kd = path.join(dir, kind);
    if (!exists(kd)) continue;
    for (const s of fs.readdirSync(kd)) {
      const f = path.join(kd, s, 'SKILL.md');
      if (exists(f)) sources.push({ kind, skillDir: s, file: f });
    }
  }
  if (!sources.length) { console.error(`no skills found for ${agent}`); process.exit(1); }

  console.log(`\nskillgen — ${agent} (${dept}) — ${sources.length} skills → ${OUT}\n`);
  for (const src of sources) {
    const raw = read(src.file);
    const { fm, body } = parseFrontmatter(raw);
    const sec = parseSections(body);
    const name = (fm.name || src.skillDir).replace(/^[a-z0-9]+-(?=.)/i, (p) =>
      /^(vyon|toon)/i.test(p) ? '' : p); // §0.4a: strip company prefixes only
    const tier = fm.tier ? parseInt(fm.tier, 10) : src.kind === 'custom' ? 3 : 2;
    const hash = sha256(raw);
    const relSource = path.relative(ROOT, src.file);
    const outFile = path.join(OUT, agent, name, 'SKILL.md');

    // version: keep if hash unchanged, bump minor if changed
    let version = '1.0.0';
    if (exists(outFile)) {
      const prev = read(outFile);
      const ph = prev.match(/source_hash: (\w+)/);
      const pv = prev.match(/version: ([\d.]+)/);
      if (ph && pv) version = ph[1] === hash ? pv[1]
        : pv[1].replace(/^(\d+)\.(\d+)/, (_, a, b) => `${a}.${+b + 1}`);
    }

    const tools = deriveTools(toolReqText, name);
    const toolsYaml = tools === null
      ? `  - <FILL_IN: not listed in ${toolFile || 'tool-requirements (file missing)'}>`
      : tools.length === 0 ? '  []' : tools.map((t) => `  - ${t}`).join('\n');

    // strip HTML comments (provenance notes) — provenance belongs in frontmatter
    // only (§0.4); comments must never enter compiled skill content
    const cleanBody = body.replace(/<!--[\s\S]*?-->/g, '').trim();
    const cleanSec = parseSections(cleanBody);
    const fmTriggers = parseInlineList(fm.triggers);
    const trigList = fmTriggers || deriveTriggers(getSec(cleanSec, 'When to Use', 'When to use'), name);

    let whenToUse = getSec(cleanSec, 'When to Use', 'When to use');
    // gstack pattern: this section always exists — synthesize from triggers if absent
    if (!whenToUse) whenToUse = `Use when the request matches: ${trigList.map((t) => `"${t}"`).join(', ')}.`;
    const purpose = getSec(cleanSec, 'Purpose', 'Overview', 'Introduction') || firstParagraph(cleanBody);
    let protocol = getSec(cleanSec, 'Structure / Protocol', 'Protocol', 'Instructions');
    // marketplace copies: the whole document IS the protocol — compile verbatim
    if (!protocol && src.kind === 'marketplace') protocol = cleanBody;
    const frags = assembleFragments(tier, { AGENT_ID: agent, DEPT: dept, SKILL_NAME: name });
    const { identity, voice } = voiceFor(dir);
    const vars = {
      SKILL_NAME: name, AGENT_ID: agent, DEPT: dept, VERSION: version,
      TIER: String(tier),
      DESCRIPTION: fm.description ? `${fm.description.replace(/^["']|["']$/g, '')} (yvon)` : deriveDescription(purpose, name),
      TRIGGERS: trigList.map((t) => `  - ${t}`).join('\n'),
      ALLOWED_TOOLS: toolsYaml,
      OWNS_PATHS: '[]   # filled per work item from the active TASK-SPEC',
      IDENTITY: identity,
      SOURCE_PATH: relSource, SOURCE_SHA256: hash,
      TIMESTAMP: new Date().toISOString(),
      PREAMBLE: frags.preamble,
      POSTAMBLE: frags.postamble,
      VOICE: voice,
      WHEN_TO_USE: whenToUse,
      PURPOSE: purpose,
      PROTOCOL: protocol,
      BOUNDARIES: routingBlockFor(routingText, name) || deriveBoundaries(routingText, name),
      OUTPUT_FORMAT: getSec(sec, 'Output Format', 'Output format'),
    };

    let out = tpl.replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? `<FILL_IN: ${k}>`);
    out = out.replace(/^allowed-tools:\n {2}\[\]/m, 'allowed-tools: []');
    out = stripEmptySections(out);

    fs.mkdirSync(path.dirname(outFile), { recursive: true });
    fs.writeFileSync(outFile, out);
    console.log(`  ✅ ${name}  (tier ${tier}, v${version}, ${src.kind}, tools: ${
      tools === null ? 'FILL_IN' : tools.length ? tools.join('/') : 'none'})`);
  }
  console.log('');
}

main();
