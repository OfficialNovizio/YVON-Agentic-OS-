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
import { readDesignSession, updateDesignSession, writeDesignMd } from '@/lib/design-session'
import { buildRecipe } from '@/lib/build-recipe'

interface DesignGateBody {
  sessionId?: string
  action?: 'intent' | 'motion' | 'dismiss'
  mode?: 'identical' | 'adapt'
  changes?: string
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
  if (action !== 'intent' && action !== 'motion' && action !== 'dismiss') {
    return NextResponse.json(
      { error: "action must be 'intent', 'motion' or 'dismiss'" },
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
  const followUp =
    mode === 'identical'
      ? `Decision for reference ${session.reference.url}: IDENTICAL CLONE — replicate the reference's structure, layout, sections and motion exactly; replace all text and imagery with our venture's own content and brand. Continue: finish the design study and prepare the design brief.`
      : `Decision for reference ${session.reference.url}: ADAPT — keep the reference's spirit and style, redesign for our venture's brand. Changes requested: ${changes}. Continue: finish the design study and prepare the design brief incorporating these changes.`

  return NextResponse.json({ ok: true, followUp })
}
