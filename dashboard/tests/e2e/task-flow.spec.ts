/**
 * Smoke gate for the task surface (2026-08-24).
 * Owner: quinn · engineering
 *
 * Short version — full behavioural coverage lives in tests/e2e/e2e-panel.spec.ts
 * (the file the TS-046 record and the artifact name). This one exists so the
 * /tasks route and the task-spec API are cheap to smoke-check without running
 * the whole suite: a dead library is not a reason to show a bare error page.
 *
 *   npx playwright test tests/e2e/task-flow.spec.ts
 */
import { test, expect, type Page } from '@playwright/test'

const BASE = 'http://localhost:3000'

async function mockTaskSpec(page: Page) {
  await page.route('**/api/task-spec*', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        tasks: [
          {
            id: 'TS-001',
            status: 'draft',
            sourceMessage: 'smoke task',
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
            nextBlocking: 'fill classification.lead',
            active: false,
            createdAt: '2026-08-24T00:00:00Z',
            updatedAt: '2026-08-24T00:00:00Z',
            revisionOf: '',
            derivedFrom: '',
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
        ],
        source: 'mock',
        roomId: null,
      }),
    }),
  )
}

test.describe('Task surface — smoke', () => {
  test('/tasks renders the lineage shell, never a bare error page', async ({ page }) => {
    await mockTaskSpec(page)
    const res = await page.goto(`${BASE}/tasks`, { waitUntil: 'domcontentloaded' })
    expect(res, `no response from /tasks — is \`npm run dev\` running?`).toBeTruthy()
    expect(res!.status()).toBeLessThan(400)
    await expect(page.getByText('Task lineage')).toBeVisible({ timeout: 15_000 })
  })

  test('a failed /api/task-spec fetch is named, not silently swallowed', async ({ page }) => {
    await page.route('**/api/task-spec*', (r) => r.fulfill({ status: 502, body: '{}' }))
    const res = await page.goto(`${BASE}/tasks`, { waitUntil: 'domcontentloaded' })
    expect(res!.status()).toBeLessThan(400)
    await expect(page.getByText(/502|error/i).first()).toBeVisible({ timeout: 15_000 })
  })
})
