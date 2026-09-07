// Unit tests for lib/build-recipe.ts (re-engineer Phase 4, 2026-09-05).
// The recipe router is the "analyze skill/library/tool to use" stage — its
// whole point is that the build loads REAL fleet machinery, so the strongest
// pin here is fs: every skill path the router can cite must exist on disk
// right now. Same discipline as design-session.test.ts: plain node (npx tsx),
// ck()/PASS/FAIL, process.exit(1) on fail.
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { RECIPE_SKILL_PATHS, buildRecipe } from '../lib/build-recipe'

let fail = 0
const ck = (name: string, cond: boolean, extra?: unknown) => {
  console.log((cond ? '  PASS  ' : '  FAIL  ') + name)
  if (!cond) { fail++; if (extra !== undefined) console.log('         ', JSON.stringify(extra)) }
}
const H = (s: string) => console.log('\n' + s)

// Tests run from dashboard/ (npx tsx tests/...); the repo root is one up —
// same convention as prd-pending.ts.
const REPO_ROOT = resolve(process.cwd(), '..')

H('[1] the cited machinery is REAL — every skill path exists on disk')
for (const [key, relPath] of Object.entries(RECIPE_SKILL_PATHS)) {
  ck(`${key} → ${relPath}`, existsSync(resolve(REPO_ROOT, relPath)))
}

H('[2] determinism — same input, same recipe')
const a = buildRecipe({ taxonomy: 'motion-marketing', motion: 'code', intent: 'identical' })
const b = buildRecipe({ taxonomy: 'motion-marketing', motion: 'code', intent: 'identical' })
ck('two calls deep-equal', JSON.stringify(a) === JSON.stringify(b))

H('[3] motion decision "code" — $0, MIT stack, nothing to swap')
const code = buildRecipe({ taxonomy: 'motion-marketing', motion: 'code', intent: 'identical' })
ck('cost is $0 and verified', code.costConfidence === 'verified' && code.cost.includes('$0'))
ck('no obligations', code.obligations.length === 0)
ck('gsap + motion cited as installed', code.motionLibs.some((l) => l.includes('gsap')) && code.motionLibs.some((l) => l.includes('motion')))
ck('no scroll-world machinery', !code.skills.some((s) => s.path.includes('scroll-world')))
ck('no borrowed assets — nothing to swap', code.assetsNeedSwapping === 0 && code.assetPlan.every((x) => !x.swapRequired))
ck('krea endpoints never cited', !code.skills.some((s) => s.path.includes('krea')))

H('[4] motion decision "video" — scroll-world machinery + krea probe obligation')
const video = buildRecipe({ taxonomy: 'motion-marketing', motion: 'video', intent: 'identical' })
ck('cites scrub-engine.js', video.skills.some((s) => s.path.endsWith('scrub-engine.js')))
ck('cites the scroll-world skill', video.skills.some((s) => s.path.endsWith('scroll-world/SKILL.md')))
ck('cites krea endpoints', ['krea/generate/route.ts', 'krea/generate-video/route.ts'].every((p) => video.skills.some((s) => s.path.includes(p))))
ck('cost is an estimate carrying the per-scene figure', video.costConfidence === 'estimated' && video.cost.includes('$4.50'))
ck('krea probe obligation present', video.obligations.some((o) => o.includes('qualification probe')))
ck('generated assets, nothing borrowed', video.assetPlan.every((x) => x.origin !== 'reference') && video.assetsNeedSwapping === 0)

H('[5] motion decision "mixed" — both tracks')
const mixed = buildRecipe({ taxonomy: 'motion-marketing', motion: 'mixed', intent: 'identical' })
ck('cites both impeccable and scroll-world', mixed.skills.some((s) => s.path.includes('impeccable')) && mixed.skills.some((s) => s.path.includes('scroll-world')))
ck('probe obligation present', mixed.obligations.some((o) => o.includes('qualification probe')))
ck('single-scene estimate', mixed.cost.includes('ONE AI-video scene') || mixed.cost.includes('~$4.50'))

H('[6] motion decision "reference" — hybrid swap list (user decision 1)')
const ref = buildRecipe({ taxonomy: 'motion-marketing', motion: 'reference', intent: 'identical' })
ck('borrowed media tracked for swap', ref.assetPlan.filter((x) => x.origin === 'reference').every((x) => x.swapRequired))
ck('swap count matches the plan', ref.assetsNeedSwapping === ref.assetPlan.filter((x) => x.swapRequired).length && ref.assetsNeedSwapping >= 2)
ck('copy is never borrowed', !ref.assetPlan.some((x) => x.kind === 'copy' && x.swapRequired))
ck('asset-swap gate obligation present', ref.obligations.some((o) => o.includes('asset-swap gate')))

H('[7] product home — workspaces/<venture>/ (user decision 3)')
ck('placeholder venture', buildRecipe({ motion: 'code', intent: 'identical' }).home === 'workspaces/<venture>/')
ck('named venture', buildRecipe({ motion: 'code', intent: 'identical', venture: 'demo-co' }).home === 'workspaces/demo-co/')

H('[8] intent note carries the decision (and the changes text for adapt)')
ck('identical says so', buildRecipe({ motion: 'code', intent: 'identical' }).intentNote.includes('IDENTICAL CLONE'))
const adapt = buildRecipe({ motion: 'code', intent: 'adapt', changes: 'darker palette, add pricing section' })
ck('adapt says so + carries changes', adapt.intentNote.includes('ADAPT') && adapt.intentNote.includes('darker palette, add pricing section'))
ck('adapt loads the brand register', adapt.skills.some((s) => s.path.endsWith('reference/brand.md')))
ck('identical does not need the brand register', !a.skills.some((s) => s.path.endsWith('reference/brand.md')))

H('[9] taxonomy notes — caution, never override')
ck('static-editorial + video warns', buildRecipe({ taxonomy: 'static-editorial', motion: 'video', intent: 'identical' }).taxonomyNote?.includes('static-editorial') === true)
ck('immersive-3d + code flags three.js honestly', buildRecipe({ taxonomy: 'immersive-3d', motion: 'code', intent: 'identical' }).taxonomyNote?.includes('three.js') === true)
ck('video-led + code warns photoreal gap', buildRecipe({ taxonomy: 'video-led', motion: 'code', intent: 'identical' }).taxonomyNote?.includes('video-led') === true)
ck('dashboard keeps motion functional', buildRecipe({ taxonomy: 'dashboard', motion: 'code', intent: 'identical' }).taxonomyNote?.includes('dashboard') === true)
ck('unknown points at motion-profile.md', buildRecipe({ taxonomy: 'unknown', motion: 'code', intent: 'identical' }).taxonomyNote?.includes('motion-profile') === true)
ck('no note when taxonomy and decision agree', buildRecipe({ taxonomy: 'motion-marketing', motion: 'code', intent: 'identical' }).taxonomyNote === undefined)

H('[10] every recipe is complete — no undefined holes')
for (const motion of ['reference', 'code', 'video', 'mixed'] as const) {
  const r = buildRecipe({ taxonomy: 'motion-marketing', motion, intent: 'identical' })
  ck(`${motion}: stack/motionLibs/skills/verifyStep/cost all populated`,
    r.stack.length > 0 && r.motionLibs.length > 0 && r.skills.length > 0 && !!r.verifyStep && !!r.cost && !!r.intentNote)
  ck(`${motion}: every skill entry has a role`, r.skills.every((s) => s.role && s.path))
  ck(`${motion}: verify step names the verification skill`, r.verifyStep.includes('verification-before-completion'))
}

console.log()
if (fail) { console.log(`${fail} FAILURE(S)`); process.exit(1) }
console.log('ALL PASS')
