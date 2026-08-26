/**
 * Browser gate for the artifact's task surface (2026-08-24).
 * Owner: quinn · engineering
 *
 * WHAT THIS GATES
 * ---------------
 * The "One Request, End to End" task design, beats 9–22: the blocked SIDECAR,
 * per-criterion acceptance verdicts + evidence, the handoff packet, roles,
 * provenance links, and the lineage board (revision collapses, derived nests).
 * The same class of failure this exists to catch: "the app was never opened"
 * (SESSION-HANDOUT §5.1, §13.7 — a design shipped as a product twice).
 *
 * Lives in tests/e2e/ because playwright.config.ts's testDir is ./tests/e2e —
 * a spec outside it is a gate that never runs (a silent skip is how a gate
 * stops being a gate). The config's setup project signs in via password auth
 * (E2E_USERNAME/E2E_PASSWORD env — see auth.setup.ts) so the SessionGate lets
 * the tests through.
 *
 *   E2E_USERNAME=<username> E2E_PASSWORD=<...> npx playwright test tests/e2e/e2e-panel.spec.ts
 *
 * The API is route-mocked with the demo chain's shape so the suite is
 * deterministic (records in store/tasks/ are repo files, not something a
 * fresh checkout guarantees). The UI under test is the REAL page — never a
 * mock of the component. If it cannot reach the route it FAILS rather than
 * skips.
 */
import { test, expect, type Page } from '@playwright/test'

const BASE = 'http://localhost:3000'

// ── fixture: the demo chain, exactly as /api/task-spec would return it ─────
const FIXTURE = [
  {
    id: 'TS-042',
    status: 'review',
    sourceMessage: 'I need a scroll animation for the landing page. Something that dives through, like the Apple product pages.',
    requester: 'operator',
    taskType: 'build',
    departments: ['Engineering'],
    lead: 'mia',
    discoveryQuestions: [],
    workItems: [
      {
        id: 'WI-1',
        owner: 'mia',
        objective: 'CAOS panel dive animation',
        doer: 'mia',
        verifier: 'quinn',
        integrator: '',
        produces: 'dashboard/app/chat/CaosPanel.tsx',
        blockedBy: [],
        acceptance: [
          { text: 'Renders inside the 312px rail', status: 'pass', evidence: 'chromium 1300×1000 · pass' },
          { text: 'Every step row expands to its decision', status: 'pass', evidence: '8 rows checked · pass' },
          { text: 'No measurement rendered that was not taken', status: 'pass', evidence: '47 assertions · pass' },
          { text: 'Keyboard reachable at every control', status: 'fail', evidence: 'FAIL — Enter on .caos2-head did not expand · run-2617' },
        ],
      },
    ],
    exitOwner: 'quinn',
    exitProof: 'store/runs/run-2617.md',
    approvedBy: 'operator',
    approvedAt: '2026-08-19T11:02:00Z',
    nextBlocking: 'task.sh suite --result fail --run <path> to rotate',
    active: false,
    createdAt: '2026-08-19T11:02:00Z',
    updatedAt: '2026-08-22T10:15:00Z',
    revisionOf: '',
    derivedFrom: '',
    supersededBy: 'TS-043',
    blocked: false,
    blockedAt: '',
    blockedReason: '',
    runRef: 'store/runs/run-2617.md',
    handoff: {},
    gate0: false,
    gate0Signoffs: [],
    history: [
      { ts: '2026-08-19T11:02:00Z', actor: 'operator', event: 'opened_draft', note: '' },
      { ts: '2026-08-20T13:30:00Z', actor: 'mia', event: 'blocked', note: 'OPENAI_API_KEY unset' },
      { ts: '2026-08-22T10:14:00Z', actor: 'quinn', event: 'suite_failed', note: '1 of 4 assertions' },
    ],
    designSessionId: '',
    designTool: '',
    designArtifactId: '',
    designHandoffPath: '',
    prdRef: 'store/tasks/TS-042-prd.md',
    riceScore: '0',
  },
  {
    id: 'TS-043',
    status: 'done',
    sourceMessage: 'Rework the keyboard path — Enter on .caos2-head must expand the row.',
    requester: 'operator',
    taskType: 'build',
    departments: ['Engineering'],
    lead: 'mia',
    discoveryQuestions: [],
    workItems: [
      {
        id: 'WI-1',
        owner: 'mia',
        objective: 'Keyboard path',
        doer: 'mia',
        verifier: 'quinn',
        integrator: 'engineering',
        produces: 'dashboard/app/chat/CaosPanel.tsx',
        blockedBy: [],
        acceptance: [
          { text: 'Renders inside the 312px rail', status: 'pass', evidence: 'pass · inherited' },
          { text: 'Every step row expands to its decision', status: 'pass', evidence: 'pass · inherited' },
          { text: 'No measurement rendered that was not taken', status: 'pass', evidence: 'pass · inherited' },
          { text: 'Keyboard reachable at every control', status: 'pass', evidence: 'Enter + Tab path · pass' },
        ],
      },
    ],
    exitOwner: 'quinn',
    exitProof: 'store/runs/run-2631.md',
    approvedBy: 'operator',
    approvedAt: '2026-08-22T10:15:00Z',
    nextBlocking: 'complete',
    active: false,
    createdAt: '2026-08-22T10:15:00Z',
    updatedAt: '2026-08-23T14:31:00Z',
    revisionOf: 'TS-042',
    derivedFrom: '',
    supersededBy: '',
    blocked: false,
    blockedAt: '',
    blockedReason: '',
    runRef: 'store/runs/run-2631.md',
    handoff: {
      entry: 'dashboard/app/chat/CaosPanel.tsx — mounts when focus.kind === \'tasks\'',
      contract: 'TaskSpecItem from /api/task-spec, plus designSessionId',
      stubbed: 'preview HTML has no live deployment',
      needs_wiring: 'no polling · changes_requested has no caller',
      tokens: 'Adora — violet #592eff',
      verified_on: 'chromium 1300×1000, light + dark',
    },
    gate0: false,
    gate0Signoffs: [],
    history: [
      { ts: '2026-08-22T10:15:00Z', actor: 'system', event: 'revision_opened', note: 'forked from TS-042' },
      { ts: '2026-08-23T14:31:00Z', actor: 'system', event: 'handoff_emitted', note: '' },
    ],
    designSessionId: '',
    designTool: '',
    designArtifactId: '',
    designHandoffPath: '',
    prdRef: 'store/tasks/TS-042-prd.md',
    riceScore: '0',
  },
  {
    id: 'TS-044',
    status: 'done',
    sourceMessage: 'Data contract: designSessionId must be on TaskSpecItem.',
    requester: 'operator',
    taskType: 'build',
    departments: ['Engineering'],
    lead: 'dev',
    discoveryQuestions: [],
    workItems: [
      {
        id: 'WI-1',
        owner: 'dev',
        objective: 'The contract',
        doer: 'dev',
        verifier: 'quinn',
        integrator: '',
        produces: 'dashboard/app/chat/TasksPanel.tsx',
        blockedBy: [],
        acceptance: [
          { text: 'designSessionId is on TaskSpecItem', status: 'pass', evidence: 'tsc --noEmit · pass · 0 errors' },
          { text: 'Every field the panel reads is declared', status: 'pass', evidence: '19 fields checked · pass' },
        ],
      },
    ],
    exitOwner: 'quinn',
    exitProof: 'store/runs/run-2644.md',
    approvedBy: 'operator',
    approvedAt: '2026-08-23T15:00:00Z',
    nextBlocking: 'complete',
    active: false,
    createdAt: '2026-08-23T15:00:00Z',
    updatedAt: '2026-08-23T17:41:00Z',
    revisionOf: '',
    derivedFrom: 'TS-043',
    supersededBy: '',
    blocked: false,
    blockedAt: '',
    blockedReason: '',
    runRef: 'store/runs/run-2644.md',
    handoff: {},
    gate0: false,
    gate0Signoffs: [],
    history: [
      { ts: '2026-08-23T15:00:00Z', actor: 'operator', event: 'opened_draft', note: 'fan-out 1 of 3' },
      { ts: '2026-08-23T17:41:00Z', actor: 'quinn', event: 'done', note: 'store/runs/run-2644.md' },
    ],
    designSessionId: '',
    designTool: '',
    designArtifactId: '',
    designHandoffPath: '',
    prdRef: 'store/tasks/TS-044-prd.md',
    riceScore: '4.5',
  },
  {
    id: 'TS-045',
    status: 'review',
    sourceMessage: 'Backend: /api/task-spec returns run records.',
    requester: 'operator',
    taskType: 'build',
    departments: ['Engineering'],
    lead: 'quinn',
    discoveryQuestions: [],
    workItems: [
      {
        id: 'WI-1',
        owner: 'quinn',
        objective: 'Run records in the task API',
        doer: 'quinn',
        verifier: 'quinn',
        integrator: '',
        produces: 'dashboard/app/api/task-spec/route.ts',
        blockedBy: ['TS-044'],
        acceptance: [
          { text: 'GET /api/task-spec returns run records', status: 'pass', evidence: '12 assertions · pass' },
          { text: 'A failed run is returned as failed, never omitted', status: 'pass', evidence: 'pass' },
          { text: 'Absent data returns undefined, never a default', status: 'pass', evidence: 'pass' },
          { text: 'Cost per task is returned', status: 'deferred', evidence: 'deferred at the scope gate — no ledger link exists' },
        ],
      },
    ],
    exitOwner: 'quinn',
    exitProof: 'store/runs/run-2645.md',
    approvedBy: 'operator',
    approvedAt: '2026-08-23T18:00:00Z',
    nextBlocking: 'resolve the block: task.sh unblock TS-045',
    active: false,
    createdAt: '2026-08-23T18:00:00Z',
    updatedAt: '2026-08-24T11:05:00Z',
    revisionOf: '',
    derivedFrom: 'TS-043',
    supersededBy: '',
    blocked: true,
    blockedAt: '2026-08-24T11:05:00Z',
    blockedReason: 'cost field needs the ledger link — deferred at the scope gate',
    runRef: 'store/runs/run-2645.md',
    handoff: {},
    gate0: false,
    gate0Signoffs: [],
    history: [
      { ts: '2026-08-23T18:02:00Z', actor: 'operator', event: 'criterion_deferred', note: 'cost field, agreed at the gate' },
      { ts: '2026-08-24T11:05:00Z', actor: 'operator', event: 'blocked', note: '' },
    ],
    designSessionId: '',
    designTool: '',
    designArtifactId: '',
    designHandoffPath: '',
    prdRef: 'store/tasks/TS-045-prd.md',
    riceScore: '7.2',
  },
  {
    id: 'TS-047',
    status: 'draft',
    sourceMessage: 'Cost per task in the panel — the ledger link deferred at the scope gate.',
    requester: 'operator',
    taskType: 'build',
    departments: ['Engineering'],
    lead: '',
    discoveryQuestions: [],
    workItems: [],
    exitOwner: '',
    exitProof: '',
    approvedBy: '',
    approvedAt: '',
    nextBlocking: 'fill classification.lead → task.sh discover',
    active: false,
    createdAt: '2026-08-24T11:50:00Z',
    updatedAt: '2026-08-24T11:50:00Z',
    revisionOf: '',
    derivedFrom: 'TS-045',
    supersededBy: '',
    blocked: false,
    blockedAt: '',
    blockedReason: '',
    runRef: '',
    handoff: {},
    gate0: false,
    gate0Signoffs: [],
    history: [],
    designSessionId: '',
    designTool: '',
    designArtifactId: '',
    designHandoffPath: '',
    prdRef: '',
    riceScore: '',
  },
]

async function mockTaskSpec(page: Page) {
  await page.route('**/api/task-spec*', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ tasks: FIXTURE, source: 'mock', roomId: null }),
    }),
  )
}

test.describe('Task surface — "One Request, End to End"', () => {
  test('lineage board groups by request: revision collapses, derived nests', async ({ page }) => {
    await mockTaskSpec(page)
    const res = await page.goto(`${BASE}/tasks`, { waitUntil: 'domcontentloaded' })
    expect(res, `no response from /tasks — is \`npm run dev\` running?`).toBeTruthy()
    expect(res!.status(), `/tasks returned ${res!.status()}`).toBeLessThan(400)

    // The root card carries the original request.
    await expect(page.getByText('I need a scroll animation for the landing page').first()).toBeVisible({ timeout: 15_000 })

    // The fan-out shows both link kinds — one revision, three derived (TS-044/045/047).
    const revisionTags = page.locator('.lg-klk.revision')
    const derivedTags = page.locator('.lg-klk.derived')
    await expect(revisionTags).toHaveCount(1)
    await expect(derivedTags).toHaveCount(3)

    // Attempts collapse on the root card (1 revision → 2 attempts).
    await expect(page.getByText(/2 attempts/)).toBeVisible()

    // The blocked kid is named, not hidden — with its reason (which takes
    // precedence over the blocked_by ordering note on the kid row).
    await expect(page.getByText(/blocked: cost field needs the ledger link/).first()).toBeVisible()

    // Flat view keeps every record, superseded ones dimmed and labelled.
    await page.getByRole('button', { name: 'All records' }).click()
    await expect(page.getByText(/superseded by TS-043/)).toBeVisible()
    await expect(page.getByText(/derived_from TS-045/).first()).toBeVisible()
  })

  test('task detail: blocked sidecar, per-criterion verdicts, deferred stays visible', async ({ page }) => {
    await mockTaskSpec(page)
    const res = await page.goto(`${BASE}/chat`, { waitUntil: 'domcontentloaded' })
    expect(res, `no response from /chat — is \`npm run dev\` running?`).toBeTruthy()

    // Open the Tasks dock, then the blocked backend task.
    await page.getByRole('button', { name: /Tasks/ }).first().click()
    await page.getByRole('button', { name: /TS-045/ }).first().click()

    // The blocked SIDECAR: the strip banner says blocked (it overrides the
    // status label while the sidecar is set — the artifact's "blocked AND
    // executing"), the reason is named, and the suite counts still render in
    // the acceptance header (3 pass of 4, 1 deferred).
    await expect(page.getByText(/blocked · /).first()).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText(/cost field needs the ledger link/)).toBeVisible()
    await expect(page.getByText('3 of 4 met')).toBeVisible()

    // Verdicts with evidence; the deferral is a datum, not a silent gap.
    await expect(page.getByText('12 assertions · pass')).toBeVisible()
    await expect(page.getByText(/deferred by decision/)).toBeVisible()

    // Provenance: the derived link is visible.
    await expect(page.getByText('TS-043', { exact: true }).last()).toBeVisible()
  })

  test('task detail: failed suite names the criterion, handoff packet renders six fields', async ({ page }) => {
    await mockTaskSpec(page)
    const res = await page.goto(`${BASE}/chat`, { waitUntil: 'domcontentloaded' })
    expect(res!.status()).toBeLessThan(400)

    await page.getByRole('button', { name: /Tasks/ }).first().click()

    // TS-042 — the failed review: 3 of 4, the failing criterion named.
    await page.getByRole('button', { name: /TS-042/ }).first().click()
    await expect(page.getByText('suite ran · 3 of 4').first()).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText(/Enter on .caos2-head did not expand/)).toBeVisible()

    // TS-043 — done with the packet: all six fields render.
    await page.getByRole('button', { name: /Back to chat/ }).click()
    await page.getByRole('button', { name: /TS-043/ }).first().click()
    await expect(page.getByText('Handoff packet')).toBeVisible({ timeout: 15_000 })
    for (const field of ['entry', 'contract', 'stubbed', 'needs_wiring', 'tokens', 'verified_on']) {
      await expect(page.getByText(field, { exact: true })).toBeVisible()
    }
    // Roles: doer / verifier / integrator all present.
    await expect(page.getByText('Doer', { exact: true })).toBeVisible()
    await expect(page.getByText('Verifier', { exact: true })).toBeVisible()
    await expect(page.getByText('Integrator', { exact: true })).toBeVisible()
  })
})
