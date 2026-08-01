import { test, expect } from '@playwright/test';

/**
 * STALE (skipped 2026-08-01) — starting fresh.
 * These target a `/tasks` "Task Dispatch simulator" (Step/Reset/Press Play, 7 stages)
 * that was never built; the live route is `/task-board`, currently a static demo
 * (handout §10). Re-write as a real smoke test against `/task-board` once its
 * final shape is decided, then remove `.skip`. Kept for intent, not deleted.
 */

test.describe.skip('Task Dispatch page (STALE — /tasks route not built)', () => {
  test('renders the page shell and the verbatim operator message', async ({ page }) => {
    await page.goto('/tasks');
    await expect(page.getByRole('heading', { name: 'Task Dispatch' })).toBeVisible();
    await expect(page.getByText('Operator message — captured verbatim')).toBeVisible();
    await expect(page.getByText('store/tasks/TS-001.yaml')).toBeVisible();
  });

  test('Step advances the simulator and fills the spec', async ({ page }) => {
    await page.goto('/tasks');
    // empty state before stepping
    await expect(page.getByText('Press Play', { exact: false })).toBeVisible();
    // click Step once → first stage reveals + spec begins filling
    await page.getByRole('button', { name: 'Step' }).click();
    await expect(page.getByText('Message received')).toBeVisible();
    await expect(page.getByText('filling · stage 1/7')).toBeVisible();
  });

  test('Reset returns to the empty state', async ({ page }) => {
    await page.goto('/tasks');
    await page.getByRole('button', { name: 'Step' }).click();
    await page.getByRole('button', { name: 'Reset' }).click();
    await expect(page.getByText('Press Play', { exact: false })).toBeVisible();
  });
});
