import { test, expect } from '@playwright/test';

/**
 * Critical-flow smoke: the Task Dispatch simulator (/tasks).
 * This is the quinn gate proof for the /tasks feature — real render,
 * real interaction, no mock data asserted from the DOM.
 */

test.describe('Task Dispatch page', () => {
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
