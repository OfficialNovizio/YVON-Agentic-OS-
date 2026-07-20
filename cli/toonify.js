#!/usr/bin/env node
// toonify — Convert Teams/ .md files to TOON Claude format
//
// Usage: node cli/toonify.js [--all|--agent <id>|--status]
//   --all     : convert every .md in Teams/ to .toon
//   --agent  <id> : convert all .md files for one agent
//   --status : report conversion state
//
// TOON Claude format: natural language key=value with · delimiters.
// Exploits Claude's tokenizer asymmetry (80-87% savings vs JSON).
//
// Format: `section_name · heading=text · content=value`
// Where headings are compressed to 1-3 char abbreviations.
//
// This is a pre-build step. CIE reads .toon files, not raw .md.

const fs = require('fs')
const path = require('path')

// ─── Abbreviation map for common markdown headings ──────────────────
const ABBR = {
  '## Purpose': 'p:', '## Summary': 's:', '## Instructions': 'i:',
  '## Principles': 'pr:', '## Fallback': 'f:', '## Boundaries': 'b:',
  '## Introduction': 'in:', '## Structure': 'st:', '## Protocol': 'pl:',
  '## Output Format': 'of:', '## Why': 'w:', '## What': 'wh:',
  '## How': 'h:', '## Position in the Org': 'po:',
  '## Skill Roster': 'sr:', '## Identity': 'id:',
  '## Operational Layer': 'ol:', '## Logical Layer': 'll:',
  '## Workflow': 'wf:', '## Working Structure': 'ws:',
  '## Working Tree': 'wt:', '## Working Instructions': 'wi:',
  '## Department Status': 'ds:', '## Tool Requirements': 'tr:',
  '## Notes': 'n:', '## Purpose': 'p:', '## Flag Clearance': 'fc:',
  '## Skills → Script Mapping': 'sm:', '## Inherited Scripts': 'is:',
  '## Candidate': 'ca:', '## Currently flagged': 'cf:',
  '## Extraction protocol': 'ep:', '## Wants': 'wa:',
  '## When to Use': 'wu:', '## Part': 'pt:',
  '## Source': 'so:', '## Route': 'ro:',
  '## Design rules': 'dr:', '## Self-Test': 'tt:',
  '## Application': 'ap:', '## Test': 'te:',
  '## Rule': 'ru:', '## Key': 'k:', '## Citation': 'ci:',
  '## Covers': 'cv:', '## Connection': 'co:',
}

function esc(v) {
  return v.replace(/\|/g, '\\|').replace(/\n/g, '\\n').replace(/·/g, '\\·')
}

function short(s) {
  // Abbreviate common markdown heading patterns
  for (const [full, abbr] of Object.entries(ABBR)) {
    if (s.startsWith(full)) {
      return abbr + esc(s.slice(full.length).trim())
    }
  }
  // Compress other headings: take first char of each word
  if (s.startsWith('## ') || s.startsWith('# ')) {
    const words = s.replace(/^#+\s*/, '').split(/\s+/).slice(0, 3)
    const abbr = words.map(w => w[0]?.toLowerCase() || '').join('')
    return abbr + ':' + esc(s.replace(/^#+\s*/, '').trim())
  }
  return esc(s)
}

function mdToToon(content, fileName) {
  const lines = content.split('\n')
  const parts = []
  let currentHeading = 'h'
  let currentText = []

  function flush() {
    if (currentText.length > 0) {
      const text = currentText.join('\\n').trim()
      if (text.length > 0) {
        parts.push(`${currentHeading}=${esc(text)}`)
      }
      currentText = []
    }
  }

  // First line is the file marker
  parts.push(`file=${esc(fileName)}`)

  for (const line of lines) {
    // Skip YAML frontmatter
    if (line.trim() === '---') continue
    // Skip empty lines
    if (line.trim() === '') {
      if (currentText.length > 0) currentText.push('')
      continue
    }
    // Headings become new keys
    if (line.startsWith('#')) {
      flush()
      currentHeading = short(line.trim())
      continue
    }
    // Skip table formatting (tables become compact key=value in TOON)
    if (line.trim().startsWith('|')) {
      flush()
      parts.push(`tb=${esc(line.trim())}`)
      continue
    }
    currentText.push(line.trim())
  }
  flush()

  return parts.join(' · ')
}

// ─── Main ──────────────────────────────────────────────────────────

const teamsDir = path.join(__dirname, '..', 'Teams')
const command = process.argv[2] || '--status'

function findMdFiles(dir) {
  const files = []
  try {
    for (const entry of fs.readdirSync(dir)) {
      if (entry === 'node_modules' || entry === '.git' || entry === '.DS_Store') continue
      const full = path.join(dir, entry)
      try {
        if (fs.statSync(full).isDirectory()) {
          files.push(...findMdFiles(full))
        } else if (entry.endsWith('.md') && !entry.endsWith('.toon')) {
          files.push(full)
        }
      } catch (_) {}
    }
  } catch (_) {}
  return files
}

function convertAll() {
  const mdFiles = findMdFiles(teamsDir)
  console.log(`\n  📄 Found ${mdFiles.length} .md files in Teams/\n`)
  let converted = 0, skipped = 0, failed = 0

  for (const mdPath of mdFiles) {
    const relPath = path.relative(teamsDir, mdPath)
    const toonPath = mdPath.replace(/\.md$/, '.toon')

    try {
      // Skip if .toon is newer than .md
      if (fs.existsSync(toonPath)) {
        const mdStat = fs.statSync(mdPath)
        const toonStat = fs.statSync(toonPath)
        if (toonStat.mtimeMs >= mdStat.mtimeMs) {
          skipped++
          continue
        }
      }

      const content = fs.readFileSync(mdPath, 'utf-8')
      const toonContent = mdToToon(content, relPath)
      fs.writeFileSync(toonPath, toonContent, 'utf-8')

      const savings = ((1 - toonContent.length / content.length) * 100).toFixed(0)
      console.log(`  ✅ ${relPath} → ${savings}% smaller`)
      converted++
    } catch (e) {
      console.log(`  ❌ ${relPath}: ${e.message}`)
      failed++
    }
  }

  console.log(`\n  📊 ${converted} converted, ${skipped} skipped, ${failed} failed\n`)
}

function convertAgent(agentId) {
  const mdFiles = findMdFiles(teamsDir).filter(f => f.includes(`/${agentId}/`))
  console.log(`\n  📄 Agent ${agentId}: ${mdFiles.length} .md files\n`)

  for (const mdPath of mdFiles) {
    const relPath = path.relative(teamsDir, mdPath)
    const toonPath = mdPath.replace(/\.md$/, '.toon')
    try {
      const content = fs.readFileSync(mdPath, 'utf-8')
      fs.writeFileSync(toonPath, mdToToon(content, relPath), 'utf-8')
      console.log(`  ✅ ${relPath}`)
    } catch (e) {
      console.log(`  ❌ ${relPath}: ${e.message}`)
    }
  }
}

function status() {
  const mdFiles = findMdFiles(teamsDir)
  let withToon = 0, withoutToon = 0

  for (const mdPath of mdFiles) {
    const toonPath = mdPath.replace(/\.md$/, '.toon')
    if (fs.existsSync(toonPath)) {
      withToon++
    } else {
      withoutToon++
    }
  }

  console.log(`\n  📊 TOON Conversion Status — Teams/\n`)
  console.log(`  Total .md files: ${mdFiles.length}`)
  console.log(`  With .toon: ${withToon}`)
  console.log(`  Without .toon: ${withoutToon}`)
  console.log(`  Coverage: ${((withToon / mdFiles.length) * 100).toFixed(1)}%\n`)

  if (withoutToon > 0) {
    console.log(`  Run: node cli/toonify.js --all\n`)
  }
}

if (command === '--all') convertAll()
else if (command === '--agent') convertAgent(process.argv[3] || '')
else status()
