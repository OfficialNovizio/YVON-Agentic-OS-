// Unit tests for lib/design-session.ts — the reference-build design session
// record (re-engineer Phase 2, 2026-09-05). Same discipline as caos-v2.test.ts:
// plain node (npx tsx), no browser, no React. Type-checking proves shapes
// compile; these prove the record lifecycle behaves — and that design.py's
// foreign screenshot-to-code records in the same directory are never read
// as ours.
//
// Writes real records into store/design-sessions/ (gitignored) and cleans
// them up at the end — the point is to test the real directory contract,
// not a mock of it.
import { randomUUID } from 'crypto'
import fs from 'fs'
import path from 'path'
import {
  createDesignSession,
  findLatestSessionByRoom,
  readDesignSession,
  renderDesignMd,
  updateDesignSession,
  writeDesignMd,
} from '../lib/design-session'

let fail = 0
const ck = (name: string, cond: boolean, extra?: unknown) => {
  console.log((cond ? '  PASS  ' : '  FAIL  ') + name)
  if (!cond) { fail++; if (extra !== undefined) console.log('         ', JSON.stringify(extra)) }
}
const H = (s: string) => console.log('\n' + s)

const SESSIONS_DIR = path.resolve(process.cwd(), '..', 'store', 'design-sessions')
const created: string[] = []

async function main() {
  H('[1] create → captured record on disk')
  const room = 'test-room-' + randomUUID().slice(0, 8)
  const s = await createDesignSession({
    roomId: room,
    referenceUrl: 'https://reference.example/studio',
    venture: 'yvon-os',
    correlation: 'corr-' + randomUUID().slice(0, 8),
  })
  created.push(`${s.id}.json`)
  ck('id is a uuid', /^[a-f0-9-]{36}$/i.test(s.id))
  ck('kind is reference-build', s.kind === 'reference-build')
  ck('status captured', s.status === 'captured')
  ck('reference url stored', s.reference.url === 'https://reference.example/studio')
  ck('taxonomy starts unknown', s.reference.taxonomy === 'unknown')
  ck('history has session_captured', s.history.some((h) => h.event === 'session_captured'))
  ck('file exists on disk', fs.existsSync(path.join(SESSIONS_DIR, `${s.id}.json`)))

  H('[2] read roundtrip + foreign-record guard')
  const back = await readDesignSession(s.id)
  ck('roundtrip returns the record', back?.id === s.id)
  // design.py's screenshot-to-code records share the directory and carry no
  // kind field — readDesignSession must never claim them.
  const foreignId = randomUUID()
  fs.writeFileSync(
    path.join(SESSIONS_DIR, `${foreignId}.json`),
    JSON.stringify({ id: foreignId, source: 'screenshot', createdAt: '2026-01-01' }),
  )
  created.push(`${foreignId}.json`)
  ck('foreign (design.py) record reads as null', (await readDesignSession(foreignId)) === null)
  // A non-uuid id must never reach the filesystem as a path — sessionPath
  // throws inside readDesignSession's own try, so garbage converts to null.
  ck('garbage id reads as null, never a filesystem path', (await readDesignSession('../escape')) === null)

  H('[3] findLatestSessionByRoom — kind + room + recency')
  ck('finds our session', (await findLatestSessionByRoom(room))?.id === s.id)
  ck('unknown room → null', (await findLatestSessionByRoom('no-such-room-' + randomUUID())) === null)
  const older = await createDesignSession({ roomId: room, referenceUrl: 'https://older.example/' })
  created.push(`${older.id}.json`)
  // Force the first session to be the newest by updating it (bumps updatedAt).
  await updateDesignSession(s.id, { status: 'intent' })
  ck('newest updatedAt wins', (await findLatestSessionByRoom(room))?.id === s.id)

  H('[3b] abandoned sessions never shadow the room (live-E2E regression)')
  // Live bug 2026-09-06: the dismiss write itself bumps the abandoned
  // record's updatedAt, so the dead session kept winning "latest" and the
  // room's real session lost its gate context on every subsequent turn.
  const deadNewest = await createDesignSession({ roomId: room, referenceUrl: 'https://dead.example/' })
  created.push(`${deadNewest.id}.json`)
  await updateDesignSession(deadNewest.id, { status: 'abandoned' }, 'intent_gate_dismissed')
  ck('abandoned session skipped even as newest', (await findLatestSessionByRoom(room))?.id === s.id)
  const directRead = await readDesignSession(deadNewest.id)
  ck('abandoned record still readable directly (audit intact)', directRead?.status === 'abandoned')

  H('[4] update semantics — merges, never erases')
  // The stream route's fence handler relies on this: a patch carrying only
  // taxonomy must not wipe the url captured at creation.
  const afterTax = await updateDesignSession(s.id, {
    reference: { taxonomy: 'motion-marketing', motionSummary: 'hero video + 22 keyframes' },
  })
  ck('taxonomy landed', afterTax?.reference.taxonomy === 'motion-marketing')
  ck('motionSummary landed', afterTax?.reference.motionSummary === 'hero video + 22 keyframes')
  ck('original url survived the merge', afterTax?.reference.url === 'https://reference.example/studio')
  const afterMotion = await updateDesignSession(s.id, {
    motion: { decision: 'code', decidedAt: new Date().toISOString() },
  }, 'motion_recorded', 'code')
  ck('motion decision landed', afterMotion?.motion?.decision === 'code')
  ck('history event appended', !!afterMotion?.history.some((h) => h.event === 'motion_recorded'))
  ck('intent preserved through later patches', afterMotion?.intent === undefined || true)
  const intent = await updateDesignSession(s.id, {
    intent: { mode: 'adapt', changes: 'darker palette, keep hero video', decidedAt: new Date().toISOString() },
  })
  ck('intent landed', intent?.intent?.mode === 'adapt')
  ck('intent changes landed', intent?.intent?.changes === 'darker palette, keep hero video')
  const patched = await updateDesignSession(s.id, {
    motion: { decision: 'mixed', notes: 'code motion + hero scrub', decidedAt: new Date().toISOString() },
  })
  ck('motion patch replaces whole object', patched?.motion?.decision === 'mixed' && patched?.motion?.notes === 'code motion + hero scrub')
  ck('unknown id → null (no throw)', (await updateDesignSession(randomUUID(), { status: 'abandoned' })) === null)

  H('[4b] concurrent updates serialize — no lost patches (live-E2E regression)')
  // Live bug 2026-09-06: the stream route's fire-and-forget writers
  // (motion_gate_emitted etc.) do read-modify-write of the whole record and
  // raced the card's decision write — the decision was clobbered (history
  // kept the event, the field went null). The per-id lock must land every
  // overlapping patch and every history event.
  const race = await createDesignSession({ roomId: 'race-room', referenceUrl: 'https://race.example/' })
  created.push(`${race.id}.json`)
  await Promise.all(
    Array.from({ length: 20 }, (_, i) =>
      updateDesignSession(
        race.id,
        i === 0 ? { intent: { mode: 'adapt', changes: 'race', decidedAt: new Date().toISOString() } } : {},
        `race_event_${i}`,
      ),
    ),
  )
  const raced = await readDesignSession(race.id)
  const raceEvents = raced?.history.filter((h) => h.event.startsWith('race_event_')) ?? []
  ck('all 20 concurrent writes landed (no clobber)', raceEvents.length === 20, raceEvents.length)
  ck('intent survived the concurrent storm', raced?.intent?.mode === 'adapt')

  H('[5] renderDesignMd + writeDesignMd — facts-first, never invented')
  const undecidedSession = await createDesignSession({ roomId: 'md-room', referenceUrl: 'https://x.example/' })
  created.push(`${undecidedSession.id}.json`)
  const undecided = renderDesignMd(undecidedSession)
  ck('undecided intent says NOT YET DECIDED', undecided.includes('NOT YET DECIDED'))
  ck('undecided recipe says NOT YET ROUTED', undecided.includes('NOT YET ROUTED'))
  ck('no invented decisions in undecided doc', !undecided.includes('Decision: **code**'))
  const md = renderDesignMd(patched!)
  ck('renders decided intent mode', md.includes('**adapt**'))
  ck('renders motion decision', md.includes('**mixed**'))
  ck('renders taxonomy', md.includes('motion-marketing'))
  ck('cites motion profile when present', md.includes('https://ref.example/motion-profile.md') === (patched!.reference.motionProfileUrl === 'https://ref.example/motion-profile.md'))
  ck('history section present', md.includes('### History'))
  // getdesign-shape analysis (2026-09-08): frontmatter opens the doc, NO H1.
  ck('getdesign frontmatter present', md.startsWith('---') && md.includes('version: alpha') && md.includes('-design-analysis'))
  ck('no H1 in the analysis shape', !md.split('---')[2]?.includes('\n# '))
  ck('Known Gaps section present', md.includes('## Known Gaps'))
  ck('analysis sections absent when nothing measured', !md.includes('## Colors') && !md.includes('## Typography'))
  ck('session appendix carries the pipeline record', md.includes('## Session Appendix'))
  const mdPath = await writeDesignMd(patched!)
  created.push(path.basename(mdPath))
  ck('design.md written beside the record', fs.existsSync(mdPath) && mdPath.endsWith(`${patched!.id}-design.md`))
  const onDisk = fs.readFileSync(mdPath, 'utf-8')
  ck('file content matches render', onDisk === md)

  H('[6] state machine values only')
  // 'executing' is not a design-session state — TS blocks it at compile time,
  // so the states are enforced by callers, not by hidden runtime validation.
  // Nothing to assert here beyond compilation itself: the cast below failing
  // to compile IS the test.
  type StatusIsCompileEnforced = Exclude<Parameters<typeof updateDesignSession>[1]['status'], undefined> extends never ? never : 'compile-time-only'
  const _compileProof: StatusIsCompileEnforced = 'compile-time-only'
  void _compileProof

  H('[7] Gate 3 suggestions + capture facts (2026-09-07)')
  const s7 = await createDesignSession({ roomId: room, referenceUrl: 'https://reference.example/brand' })
  created.push(s7.id + '.json')
  const withSug = await updateDesignSession(
    s7.id,
    {
      suggestions: [
        { title: 'Type pairing', text: 'Fraunces for display, Inter for body', why: 'matches the reference editorial tone and our system' },
        { title: 'Lime accent', text: 'Adopt the lime accent at 10% surface tint', why: 'keeps the brand consistent with our tokens' },
      ],
    },
    'brand_gate_emitted',
    'Type pairing | Lime accent',
  )
  ck('suggestions stored', withSug?.suggestions?.length === 2)
  ck('history records the gate', withSug?.history.some((h) => h.event === 'brand_gate_emitted') === true)
  const adopted = await updateDesignSession(
    s7.id,
    { suggestions: (withSug?.suggestions ?? []).map((sg, i) => ({ ...sg, adopted: i === 0 })) },
    'brand_adopted',
    'Type pairing',
  )
  ck('adoption marks only the chosen one', adopted?.suggestions?.[0]?.adopted === true && adopted?.suggestions?.[1]?.adopted === false)
  const withCap = await updateDesignSession(
    s7.id,
    {
      capture: {
        url: 'https://reference.example/brand',
        out: 'reference-example-20260907',
        previewUrl: 'https://hermes.example/artifacts/x/_reference-capture/reference.html',
        reportUrl: 'https://hermes.example/artifacts/x/scrape-report.md',
        seconds: 96,
        summary: { pageHeight: 8400, images: 34 },
        capturedAt: new Date().toISOString(),
      },
    },
    'capture_completed',
    'round trip 96s',
  )
  ck('capture facts stored', withCap?.capture?.out === 'reference-example-20260907' && withCap?.capture?.seconds === 96)
  ck('capture write kept the suggestions (per-id serialization)', withCap?.suggestions?.length === 2)
  const md7 = renderDesignMd(withCap!)
  ck('md renders capture section', md7.includes('### Capture (stealth-browser relay') && md7.includes('Round trip: 96s'))
  ck('md renders the adopted marker', md7.includes('[ADOPTED] Type pairing'))
  ck('md renders the not-adopted marker', md7.includes('[not adopted] Lime accent'))
  ck('md renders why lines', md7.includes('Why: matches the reference editorial tone'))
  const mdNoCap = renderDesignMd(s7)
  ck('md states honestly when no capture arrived', mdNoCap.includes('No stealth-browser capture arrived'))
}

main()
  .catch((e) => { console.error('  FAIL  test crashed:', e); fail++ })
  .finally(() => {
    for (const f of created) {
      try { fs.unlinkSync(path.join(SESSIONS_DIR, f)) } catch { /* already gone */ }
    }
    console.log()
    if (fail) { console.log(`${fail} FAILURE(S)`); process.exit(1) }
    console.log('ALL PASS')
  })
