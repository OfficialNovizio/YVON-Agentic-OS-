// Verifies capSkillBody against the REAL skill sizes measured on the device.
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
// resolves whether run from repo root, dashboard/, or dashboard/tests/
const HERE = dirname(fileURLToPath(import.meta.url))
const CANDIDATES = [
  join(HERE, 'context-resolver.ts'),
  join(HERE, '..', 'lib', 'context-resolver.ts'),
  join(HERE, '..', '..', 'dashboard', 'lib', 'context-resolver.ts'),
]
let src = ''
for (const c of CANDIDATES) { try { src = readFileSync(c, 'utf8'); break } catch {} }
if (!src) { console.error('could not locate context-resolver.ts'); process.exit(1) }
const CAP = Number((src.match(/YVON_SKILL_CHAR_CAP \?\? (\d+)/)||[])[1])

function capSkillBody(name, content) {
  if (content.length <= CAP) return content
  return content.slice(0, CAP) +
    `\n\n[...${name} truncated at ${CAP} of ${content.length} characters. ` +
    `Ask the user if you need a section that is not shown above.]`
}

// real byte sizes from Teams/Engineering/mia (device_list_dir, 22 Aug)
const MIA = [
  ['design-tokens', 8170], ['frontend-performance', 6218],
  ['frontend-verification', 6483], ['ui-accessibility-standards', 6022],
  ['scroll-world', 24161],
]
let fail = 0
const ck = (n,c) => { console.log((c?'  PASS  ':'  FAIL  ')+n); if(!c) fail++ }

console.log(`cap = ${CAP} chars\n`)
console.log('[1] normal skills pass through untouched')
for (const [n,size] of MIA.filter(([,s]) => s <= CAP)) {
  const body = 'x'.repeat(size)
  ck(`${n} (${size}) unchanged`, capSkillBody(n, body) === body)
}
console.log('\n[2] outliers are trimmed and say so')
for (const [n,size] of MIA.filter(([,s]) => s > CAP)) {
  const out = capSkillBody(n, 'x'.repeat(size))
  ck(`${n} (${size}) shrinks`, out.length < size)
  ck(`${n} announces the trim`, out.includes('truncated at'))
  ck(`${n} names itself`, out.includes(n))
}
console.log('\n[3] worst case: all 5 matched, before vs after')
const before = MIA.reduce((a,[,s])=>a+s,0)
const after  = MIA.reduce((a,[n,s])=>a+capSkillBody(n,'x'.repeat(s)).length,0)
console.log(`  ${before} -> ${after} chars  (~${Math.round(before/4)} -> ~${Math.round(after/4)} tokens)`)
ck('worst case reduced', after < before)
console.log('\n[4] edge cases')
ck('empty', capSkillBody('e','') === '')
ck('exactly at cap untouched', capSkillBody('e','y'.repeat(CAP)).length === CAP)
ck('one over is trimmed', capSkillBody('e','y'.repeat(CAP+1)).length !== CAP+1)
console.log('\nFAILURES: '+fail); process.exit(fail?1:0)
