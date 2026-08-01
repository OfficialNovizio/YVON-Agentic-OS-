# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tasks.spec.ts >> Task Dispatch page >> Step advances the simulator and fills the spec
- Location: tests/e2e/tasks.spec.ts:17:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Press Play')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText('Press Play')

```

```yaml
- text: Y YVON OS Mission Control
- heading "Sign in" [level=1]
- paragraph: Enter your YVON OS username and password.
- text: Username
- img
- textbox "Username":
  - /placeholder: e.g. novy738
- text: Password
- img
- textbox "Password"
- button "Sign in" [disabled]
- paragraph: Access is invite-only.
- alert
- button "v3.0.2 Output Detail Standard React Components Hide Until Restart Marker Color Clear on copy/send Block page interactions Manage MCP & Webhooks Manage MCP & Webhooks MCP Connection MCP connection allows agents to receive and act on annotations. Learn more Webhooks Auto-Send The webhook URL will receive live annotation changes and annotation data.":
  - img
  - button:
    - img
  - button:
    - img
  - button [disabled]:
    - img
  - button [disabled]:
    - img
  - button [disabled]:
    - img
  - button [disabled]:
    - img
  - button:
    - img
  - button:
    - img
  - link:
    - /url: https://agentation.com
    - img
  - paragraph: v3.0.2
  - button "Switch to light mode":
    - img
  - text: Output Detail
  - img
  - button "Standard"
  - text: React Components
  - img
  - checkbox [checked]
  - text: Hide Until Restart
  - img
  - checkbox
  - text: Marker Color
  - button "Indigo"
  - button "Blue"
  - button "Cyan"
  - button "Green"
  - button "Yellow"
  - button "Orange"
  - button "Red"
  - checkbox "Clear on copy/send"
  - img
  - text: Clear on copy/send
  - img
  - checkbox "Block page interactions" [checked]
  - img
  - text: Block page interactions
  - button "Manage MCP & Webhooks":
    - text: Manage MCP & Webhooks
    - img
  - button "Manage MCP & Webhooks":
    - img
    - text: Manage MCP & Webhooks
  - text: MCP Connection
  - img
  - paragraph:
    - text: MCP connection allows agents to receive and act on annotations.
    - link "Learn more":
      - /url: https://agentation.dev/mcp
  - text: Webhooks
  - img
  - text: Auto-Send
  - checkbox "Auto-Send" [checked] [disabled]
  - paragraph: The webhook URL will receive live annotation changes and annotation data.
  - textbox "Webhook URL"
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | /**
  4  |  * Critical-flow smoke: the Task Dispatch simulator (/tasks).
  5  |  * This is the quinn gate proof for the /tasks feature — real render,
  6  |  * real interaction, no mock data asserted from the DOM.
  7  |  */
  8  | 
  9  | test.describe('Task Dispatch page', () => {
  10 |   test('renders the page shell and the verbatim operator message', async ({ page }) => {
  11 |     await page.goto('/tasks');
  12 |     await expect(page.getByRole('heading', { name: 'Task Dispatch' })).toBeVisible();
  13 |     await expect(page.getByText('Operator message — captured verbatim')).toBeVisible();
  14 |     await expect(page.getByText('store/tasks/TS-001.yaml')).toBeVisible();
  15 |   });
  16 | 
  17 |   test('Step advances the simulator and fills the spec', async ({ page }) => {
  18 |     await page.goto('/tasks');
  19 |     // empty state before stepping
> 20 |     await expect(page.getByText('Press Play', { exact: false })).toBeVisible();
     |                                                                  ^ Error: expect(locator).toBeVisible() failed
  21 |     // click Step once → first stage reveals + spec begins filling
  22 |     await page.getByRole('button', { name: 'Step' }).click();
  23 |     await expect(page.getByText('Message received')).toBeVisible();
  24 |     await expect(page.getByText('filling · stage 1/7')).toBeVisible();
  25 |   });
  26 | 
  27 |   test('Reset returns to the empty state', async ({ page }) => {
  28 |     await page.goto('/tasks');
  29 |     await page.getByRole('button', { name: 'Step' }).click();
  30 |     await page.getByRole('button', { name: 'Reset' }).click();
  31 |     await expect(page.getByText('Press Play', { exact: false })).toBeVisible();
  32 |   });
  33 | });
  34 | 
```