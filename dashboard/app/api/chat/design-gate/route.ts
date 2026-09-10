// /api/chat/design-gate — server actions for the reference-build design
// session's gates (re-engineer Phase 2, 2026-09-05). The IntentGateCard
// posts here when the user answers the clone-vs-adapt gate; this route
// writes the decision into the session record (store/design-sessions/) and
// returns the canonical follow-up message the card sends into the room.
//
// The session record is the durable artifact — later phases read it back
// (PRD generation folds design.md facts; createTaskFromPrd copies
// design.md into the task and lights set-design-origin). Losing the SSE
// card to a reload loses nothing: findLatestSessionByRoom still finds the
// decisions.
//
// Owner: dev · design-to-product re-engineer, 2026-09-05

import { NextResponse } from 'next/server'
import {
  readDesignSession,
  updateDesignSession,
  writeDesignMd,
  type BrandSuggestion,
} from '@/lib/design-session'
import { buildRecipe } from '@/lib/build-recipe'

interface DesignGateBody {
  sessionId?: string
  action?: 'intent' | 'motion' | 'brand' | 'dismiss'
  mode?: 'identical' | 'adapt'
  changes?: string
  /** action 'brand': indices (0-based, into the session's suggestions[])
   * the user ADOPTED; unlisted suggestions are dropped. */
  adopted?: number[]
  /** action 'motion': the pick from the Options Brief. */
  decision?: 'reference' | 'code' | 'video' | 'mixed'
  notes?: string
}

const MOTION_DECISIONS = ['reference', 'code', 'video', 'mixed'] as const

export async function POST(req: Request) {
  let body: DesignGateBody
  try {
    body = (await req.json()) as DesignGateBody
  } catch {
    return NextResponse.json({ error: 'invalid JSON body' }, { status: 400 })
  }

  const { sessionId, action } = body
  if (!sessionId || !/^[a-f0-9-]{36}$/i.test(sessionId)) {
    return NextResponse.json({ error: 'sessionId (uuid) is required' }, { status: 400 })
  }
  if (action !== 'intent' && action !== 'motion' && action !== 'brand' && action !== 'dismiss') {
    return NextResponse.json(
      { error: "action must be 'intent', 'motion', 'brand' or 'dismiss'" },
      { status: 400 },
    )
  }

  const session = await readDesignSession(sessionId)
  if (!session) {
    return NextResponse.json({ error: 'design session not found' }, { status: 404 })
  }

  if (action === 'dismiss') {
    await updateDesignSession(
      sessionId,
      { status: 'abandoned' },
      'intent_gate_dismissed',
      'user said this is not a reference build',
    )
    return NextResponse.json({ ok: true, abandoned: true })
  }

  // action === 'brand' — Gate 3 adoptions (2026-09-07). Marks the adopted
  // suggestions on the record and returns the canonical follow-up turn that
  // carries them to the agent (they land in design.md + the PRD).
  if (action === 'brand') {
    const adopted = Array.isArray(body.adopted)
      ? [...new Set(body.adopted.filter((n) => Number.isInteger(n) && n >= 0))].sort((a, b) => a - b)
      : []
    const current = session.suggestions ?? []
    if (current.length === 0) {
      return NextResponse.json({ error: 'no suggestions recorded on this session' }, { status: 409 })
    }
    if (adopted.some((n) => n >= current.length)) {
      return NextResponse.json(
        { error: `adopted indices must be 0-${current.length - 1}` },
        { status: 400 },
      )
    }
    const marked: BrandSuggestion[] = current.map((sg, i) => ({
      ...sg,
      adopted: adopted.includes(i),
    }))
    const picked = marked.filter((sg) => sg.adopted)
    const updated = await updateDesignSession(
      sessionId,
      { suggestions: marked },
      'brand_adopted',
      picked.length ? picked.map((sg) => sg.title).join(' | ') : 'none adopted',
    )
    if (!updated) {
      return NextResponse.json({ error: 'design session not found' }, { status: 404 })
    }
    const listed = picked.length
      ? picked.map((sg) => `- ${sg.title}: ${sg.text} (why: ${sg.why})`).join('\n')
      : '- (none - you preferred to keep the changes as stated)'
    // URL parenthesized (2026-09-07): "for <url>. " glued punctuation onto
    // the URL, the stream route's extractor kept it, and the follow-up turn
    // stopped matching the room's live session — orphaning one record per
    // gate answer. Parens are excluded from both the route-side and the
    // wrapper-side URL matchers, so the bare URL is what gets extracted.
    const followUp =
      `Brand suggestions reviewed for reference (${session.reference.url}). ` +
      `Adopt these into the design study, design.md and the PRD:\n${listed}` +
      `\nContinue: fold the adopted suggestions into the design brief and prepare design.md and the PRD.`
    return NextResponse.json({ ok: true, followUp, adoptedCount: picked.length })
  }

  // action === 'motion' — the pick from the Options Brief (Phase 3). Each
  // decision's follow-up carries its own obligation so the agent hears the
  // consequences in the same turn the user makes the choice.
  if (action === 'motion') {
    const decision = body.decision
    if (!decision || !MOTION_DECISIONS.includes(decision)) {
      return NextResponse.json(
        { error: "decision must be 'reference', 'code', 'video' or 'mixed'" },
        { status: 400 },
      )
    }
    const notes = (body.notes ?? '').trim()
    const updated = await updateDesignSession(
      sessionId,
      {
        status: 'motion',
        motion: {
          decision,
          ...(notes ? { notes } : {}),
          decidedAt: new Date().toISOString(),
        },
      },
      'motion_recorded',
      `${decision}${notes ? `: ${notes.slice(0, 200)}` : ''}`,
    )
    if (!updated) {
      return NextResponse.json({ error: 'design session not found' }, { status: 404 })
    }

    // Phase 4 — both gates answered: route the build recipe (Stage 4) and
    // write design.md (Stage 5). Deterministic from the session record — the
    // router is a curated rules table, nothing invented here. Guarded on
    // intent: the motion stage normally follows intent, but if a motion gate
    // somehow fires first, the recipe waits for the intent decision.
    let current = updated
    if (current.intent && current.motion && !current.recipe) {
      const recipe = buildRecipe({
        taxonomy: current.reference.taxonomy,
        motion: current.motion.decision,
        intent: current.intent.mode,
        changes: current.intent.changes,
        venture: current.venture,
      })
      current =
        (await updateDesignSession(
          sessionId,
          { recipe },
          'recipe_routed',
          `${recipe.cost} · ${recipe.skills.length} skill(s) · ${recipe.assetsNeedSwapping} asset(s) to swap`,
        )) ?? current
    }
    if (current.intent && current.motion && current.recipe) {
      const mdPath = await writeDesignMd(current)
      current =
        (await updateDesignSession(
          sessionId,
          { designMd: { path: mdPath }, status: 'briefed' },
          'design_md_written',
          mdPath,
        )) ?? current
    }
    const followUpByDecision: Record<(typeof MOTION_DECISIONS)[number], string> = {
      reference: `Motion decision: REUSE the reference's own motion assets (hybrid). Continue: prepare the design brief with a deeper asset inventory — list every borrowed video/image with its source URL and a planned licensed/owned replacement. All borrowed assets are swapped before real delivery.`,
      code: `Motion decision: PURE CODE motion (CSS + GSAP + motion, $0 — all installed and MIT). Continue: prepare the design brief reproducing the reference's motion with code — everything except photoreal content.`,
      video: `Motion decision: AI VIDEO scrub for the scroll narrative (frames scrubbed via scrub-engine). Obligation: the AI-video client must pass its qualification probe before any build starts. Continue: prepare the design brief with the video scenes enumerated (subject, duration, art direction per scene).`,
      mixed: `Motion decision: MIXED — code motion for elements/text/icons/routes, one AI-video scrub for the hero/scroll narrative. Obligation: the AI-video client must pass its qualification probe before any build starts. Continue: prepare the design brief covering both tracks.`,
    }
    return NextResponse.json({
      ok: true,
      followUp: `${followUpByDecision[decision]}${notes ? ` Notes: ${notes}.` : ''}`,
      ...(current.designMd ? { designMdPath: current.designMd.path } : {}),
    })
  }

  // action === 'intent'
  const mode = body.mode
  if (mode !== 'identical' && mode !== 'adapt') {
    return NextResponse.json(
      { error: "mode must be 'identical' or 'adapt'" },
      { status: 400 },
    )
  }
  const changes = (body.changes ?? '').trim()
  if (mode === 'adapt' && !changes) {
    return NextResponse.json(
      { error: 'adapt mode requires a description of the changes' },
      { status: 400 },
    )
  }

  const updated = await updateDesignSession(
    sessionId,
    {
      status: 'intent',
      intent: {
        mode,
        ...(changes ? { changes } : {}),
        decidedAt: new Date().toISOString(),
      },
    },
    'intent_recorded',
    `${mode}${changes ? `: ${changes.slice(0, 200)}` : ''}`,
  )
  if (!updated) {
    return NextResponse.json({ error: 'design session not found' }, { status: 404 })
  }

  // Canonical follow-up turn text — the card sends this through the room's
  // normal send path so the agent sees the decision as a user message (the
  // same way every other gate answer reaches the wrapper).
  // [GATE DECISION] provenance marker (2026-09-08): gate answers are recorded
  // through the decision card, so downstream agents must be able to tell them
  // apart from messages the user typed. The stream route's verify payload
  // excludes [GATE DECISION] turns from "original asks" — the operator's
  // typed words stay the authority a build is judged against. Root cause of
  // the TS-055 clone failure: an adapt decision the operator never typed
  // became the verify stage's notion of the user's voice.
  const followUp =
    mode === 'identical'
      ? `[GATE DECISION] Reference (${session.reference.url}): IDENTICAL CLONE — replicate the reference's structure, layout, sections and motion exactly; replace all text and imagery with our venture's own content and brand. Continue: finish the design study and prepare the design brief.`
      : `[GATE DECISION] Reference (${session.reference.url}): ADAPT — keep the reference's spirit and style, redesign for our venture's brand. Changes requested: ${changes}. Continue: finish the design study and prepare the design brief incorporating these changes.`

  return NextResponse.json({ ok: true, followUp })
}
