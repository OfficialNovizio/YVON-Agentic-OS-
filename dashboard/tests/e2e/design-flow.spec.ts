/**
 * quinn E2E gate — design→product pipeline (re-engineer Phases 2–8, 2026-09-06).
 *
 * Drives the full chat reference-build chain with the dashboard's own API
 * routes route-mocked in the browser (the seam that stands in for the Hermes
 * VPS, whose outbound calls are server-side and invisible to Playwright):
 *
 *   send "build me a site like https://example.com"
 *     → SSE design.gate(stage intent)          → IntentGateCard
 *   "Adapt it" + changes → /api/chat/design-gate (action intent)
 *     → follow-up turn → SSE design.gate(stage motion, needs)
 *                                              → MotionBriefCard
 *   "Pure code motion ($0)" + "Record motion decision"
 *     → /api/chat/design-gate (action motion)
 *     → follow-up turn → SSE task.proposed (derivedFrom carried)
 *                                              → TaskProposalPrompt
 *   "Yes, start it" → /api/chat/prd-proposal (generate)
 *                                              → PrdProposalCard (3 tabs)
 *   "Convert to task" → /api/chat/prd-proposal (convert) → TS-900 executing
 *
 * Every POST body is captured and asserted — the spec is a contract test of
 * the chain (sessionId/mode/changes on intent; decision on motion; derivedFrom
 * forwarded to generate; pendingId on convert), not just a screenshot walk.
 *
 * RUN GATE (same as every authed spec here): needs tests/e2e/.auth/user.json —
 * create it once with E2E_USERNAME/E2E_PASSWORD (see auth.setup.ts). Without
 * a stored session the setup project fails loudly on purpose.
 *
 *   npx playwright test tests/e2e/design-flow.spec.ts
 *
 * Gate: quinn · browser-verification
 * Owner: dev · design-to-product re-engineer, 2026-09-06
 */
import { test, expect, type Page, type Route } from '@playwright/test'

const SESSION_ID = 'sess-e2e-design-1'
const ROOM_ID = 'e2e-room-design-1'
const DERIVED_FROM = 'TS-899'
const CONVERTED_TASK = 'TS-900'

interface CapturedBody {
  action?: string
  sessionId?: string
  mode?: string
  changes?: string
  decision?: string
  derivedFrom?: string
  pendingId?: string
  [k: string]: unknown
}

/** One shared turn counter: /api/chat/send increments it, the SSE stream
 * reads it — send always precedes its stream open, so the pair stays in
 * step. Frames per turn mirror the real wrapper's fence chain. */
function sse(frames: Record<string, unknown>[]): string {
  return frames.map((f) => `data: ${JSON.stringify(f)}\n\n`).join('')
}

async function mockDesignPipeline(page: Page) {
  const state = { turn: 0 }
  const gateBodies: CapturedBody[] = []
  const generateBodies: CapturedBody[] = []
  const convertBodies: CapturedBody[] = []

  // Landing room (page boot: POST /threads {reuseEmpty:true} → activeRoom;
  // GET /rooms + GET /threads merge is tolerated empty).
  await page.route('**/api/chat/threads', (route: Route) => {
    if (route.request().method() === 'POST') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          room: {
            id: ROOM_ID,
            kind: 'thread',
            department: null,
            agentId: null,
            ownerUserId: null,
            ventureSlug: null,
            title: 'Design flow e2e',
            label: 'Design flow e2e',
            section: 'recent',
          },
        }),
      })
    }
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ threads: [], hiddenCount: 0 }) })
  })
  await page.route('**/api/chat/rooms', (route: Route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ rooms: [] }) }),
  )
  await page.route('**/api/chat/messages*', (route: Route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ messages: [] }) }),
  )
  // Real contract: a room with no unresolved proposal 404s (jsonFetch throws,
  // page.tsx rehydration try/catches) — not a 200 with null.
  await page.route('**/api/chat/task-proposal*', (route: Route) =>
    route.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({ error: 'not found' }) }),
  )

  // The three-turn fence chain, scripted on the turn counter.
  await page.route('**/api/chat/send', (route: Route) => {
    state.turn += 1
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ userMessage: { id: `mock-msg-${state.turn}` } }),
    })
  })
  await page.route('**/api/chat/stream*', (route: Route) => {
    const t = state.turn
    const frames =
      t === 1
        ? [
            { kind: 'token', text: 'Reference captured.' },
            {
              kind: 'design.gate',
              stage: 'intent',
              sessionId: SESSION_ID,
              correlation: 'corr-e2e-1',
              reference: {
                url: 'https://example.com/landing',
                taxonomy: 'motion-marketing',
                motionSummary: 'Hero video loop, scroll-triggered section reveals.',
              },
            },
            { kind: 'done', response: 'Reference captured.', usage: { inputTokens: 100, outputTokens: 40 }, correlation: 'corr-e2e-1' },
          ]
        : t === 2
          ? [
              { kind: 'token', text: 'Motion needs observed.' },
              {
                kind: 'design.gate',
                stage: 'motion',
                sessionId: SESSION_ID,
                correlation: 'corr-e2e-1',
                needs: [
                  { need: 'hero loop', reference: 'autoplay video', bestPath: 'video', why: 'cinematic entry' },
                  { need: 'section reveals', reference: 'fade+rise on scroll', bestPath: 'code', why: 'cheap, crisp' },
                ],
              },
              { kind: 'done', response: 'Motion needs observed.', usage: { inputTokens: 120, outputTokens: 60 }, correlation: 'corr-e2e-1' },
            ]
          : [
              { kind: 'token', text: 'Proposal ready.' },
              {
                kind: 'task.proposed',
                title: 'Build the adapted landing site',
                summary: 'Adapt example.com/landing per the recorded design decisions.',
                correlation: 'corr-e2e-1',
                artifacts: [{ url: 'https://hermes.example.com/artifacts/reference.md', label: 'reference.md', kind: 'file' }],
                derivedFrom: DERIVED_FROM,
              },
              { kind: 'done', response: 'Proposal ready.', usage: { inputTokens: 140, outputTokens: 80 }, correlation: 'corr-e2e-1' },
            ]
    return route.fulfill({ status: 200, contentType: 'text/event-stream', body: sse(frames) })
  })

  // Gate decisions — echo the follow-up text that triggers the next turn.
  await page.route('**/api/chat/design-gate', async (route: Route) => {
    const body = (await route.request().postDataJSON()) as CapturedBody
    gateBodies.push(body)
    const followUp =
      body.action === 'intent'
        ? 'Design decision recorded — here is the motion brief.'
        : 'Motion decision recorded — here is the build proposal.'
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, followUp }) })
  })

  // PRD generate → card payload; convert → real chain result shape.
  await page.route('**/api/chat/prd-proposal', async (route: Route) => {
    const body = (await route.request().postDataJSON()) as CapturedBody
    if (body.action === 'generate') {
      generateBodies.push(body)
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ok: true,
          pendingId: 'pending-e2e-1',
          markdown: '# PRD — adapted landing site\n\nScope: adapt the reference per the recorded gates.',
          lead: 'mia',
          departments: ['Engineering'],
          riceScore: 42,
          warnings: [],
          design: {
            sessionId: SESSION_ID,
            designMdPath: 'store/design-sessions/sess-e2e-design-1-design.md',
            designMd: '# Design.md — reference profile, intent, motion decision, recipe.',
            recipe: { stack: ['next', 'gsap'], motionDecision: 'code', skills: ['scroll-world'] },
          },
        }),
      })
    }
    convertBodies.push(body)
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, taskId: CONVERTED_TASK, status: 'executing', kanbanOk: true }),
    })
  })

  return { state, gateBodies, generateBodies, convertBodies }
}

test.describe('Design→product flow (re-engineer Phases 2–8)', () => {
  test('scrape → intent → motion → PRD/Design/Recipe → convert', async ({ page }) => {
    const { gateBodies, generateBodies, convertBodies } = await mockDesignPipeline(page)

    await page.goto('/chat', { waitUntil: 'domcontentloaded' })

    // ── Turn 1: the reference ask → IntentGateCard ────────────────────────
    const composer = page.locator('textarea[placeholder*="Message"]').first()
    await expect(composer).toBeVisible({ timeout: 20_000 })
    await composer.fill('Build me a site like https://example.com/landing')
    await page.getByRole('button', { name: 'Send', exact: true }).click()

    const intentCard = page.getByText('Reference captured — how should we build it?')
    await expect(intentCard).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText('example.com', { exact: false }).first()).toBeVisible()
    await expect(page.getByText('motion-marketing')).toBeVisible()

    // ── Turn 2: adapt + changes → MotionBriefCard ─────────────────────────
    await page.getByRole('button', { name: /Adapt it/ }).click()
    await page
      .getByPlaceholder('What should change? (sections to drop, pages to add, brand direction…)')
      .fill('Drop the pricing section; our brand fonts.')
    await page.getByRole('button', { name: /Record and continue/ }).click()

    const brief = page.getByText('Video-based motion')
    await expect(brief).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText('Pure code motion — CSS/JS + GSAP + Lottie')).toBeVisible()
    await expect(page.getByText('hero loop')).toBeVisible()

    await page.getByRole('button', { name: /Pure code motion \(\$0\)/ }).click()
    await page.getByRole('button', { name: /Record motion decision/ }).click()

    // ── Turn 3: proposal → TaskProposalPrompt ─────────────────────────────
    await expect(page.getByText('Build the adapted landing site')).toBeVisible({ timeout: 15_000 })

    // Contract: the intent decision carried session + mode + verbatim changes.
    const intentBody = gateBodies.find((b) => b.action === 'intent')
    expect(intentBody, 'intent decision was not POSTed').toBeTruthy()
    expect(intentBody!.sessionId).toBe(SESSION_ID)
    expect(intentBody!.mode).toBe('adapt')
    expect(intentBody!.changes).toBe('Drop the pricing section; our brand fonts.')

    // ── PRD + Design.md + Recipe presented ────────────────────────────────
    await page.getByRole('button', { name: /Yes, start it/ }).click()
    // PRD renders through the Markdown component (h1), the other tabs are raw <pre>
    const prdCard = page.getByRole('heading', { name: 'PRD — adapted landing site' })
    await expect(prdCard).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText('mia')).toBeVisible()

    await page.getByRole('button', { name: 'Design.md' }).click()
    await expect(page.getByRole('heading', { name: 'Design.md — reference profile' })).toBeVisible()
    await page.getByRole('button', { name: 'Recipe' }).click()
    await expect(page.getByText('scroll-world')).toBeVisible()

    // Contract: generate forwarded the proposal fence's derivedFrom.
    expect(generateBodies.length).toBe(1)
    expect(generateBodies[0]!.derivedFrom).toBe(DERIVED_FROM)

    // ── Convert → the task exists and is executing ────────────────────────
    await page.getByRole('button', { name: /Convert to task/ }).click()
    await expect(
      page.getByText(`${CONVERTED_TASK} created and advanced to executing · on the task board`),
    ).toBeVisible({ timeout: 15_000 })

    expect(convertBodies.length).toBe(1)
    expect(convertBodies[0]!.pendingId).toBe('pending-e2e-1')
  })
})
