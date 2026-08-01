# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tasks.spec.ts >> Task Dispatch page >> Reset returns to the empty state
- Location: tests/e2e/tasks.spec.ts:27:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'Step' })

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e4]:
    - generic [ref=e5]:
      - generic [ref=e6]: "Y"
      - generic [ref=e7]:
        - generic [ref=e8]: YVON OS
        - generic [ref=e9]: Mission Control
    - generic [ref=e10]:
      - heading "Sign in" [level=1] [ref=e11]
      - paragraph [ref=e12]: Enter your YVON OS username and password.
      - generic [ref=e13]: Username
      - textbox "Username" [ref=e15]:
        - /placeholder: e.g. novy738
      - generic [ref=e16]: Password
      - textbox "Password" [ref=e18]
      - button "Sign in" [disabled] [ref=e19]
    - paragraph [ref=e20]: Access is invite-only.
  - button "Open Next.js Dev Tools" [ref=e26] [cursor=pointer]
  - alert [ref=e30]
  - button [ref=e32] [cursor=pointer]:
    - generic:
      - generic:
        - button
      - generic:
        - button
      - generic:
        - button [disabled]
      - generic:
        - button [disabled]
      - generic:
        - button [disabled]
      - generic:
        - button [disabled]
      - generic:
        - button
      - generic:
        - button
    - generic:
      - generic:
        - generic:
          - generic:
            - link:
              - /url: https://agentation.com
            - paragraph: v3.0.2
            - button "Switch to light mode"
          - generic:
            - generic:
              - generic: Output Detail
              - button "Standard"
            - generic:
              - generic: React Components
              - generic:
                - checkbox [checked]
            - generic:
              - generic: Hide Until Restart
              - generic:
                - checkbox
          - generic:
            - generic: Marker Color
            - generic:
              - button "Indigo"
              - button "Blue"
              - button "Cyan"
              - button "Green"
              - button "Yellow"
              - button "Orange"
              - button "Red"
          - generic:
            - generic:
              - generic:
                - checkbox "Clear on copy/send"
              - generic: Clear on copy/send
            - generic:
              - generic:
                - checkbox "Block page interactions" [checked]
              - generic: Block page interactions
          - button "Manage MCP & Webhooks"
        - generic:
          - button "Manage MCP & Webhooks"
          - generic:
            - generic: MCP Connection
            - paragraph:
              - text: MCP connection allows agents to receive and act on annotations.
              - link "Learn more":
                - /url: https://agentation.dev/mcp
          - generic:
            - generic:
              - generic: Webhooks
              - generic:
                - generic: Auto-Send
                - generic:
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
  20 |     await expect(page.getByText('Press Play', { exact: false })).toBeVisible();
  21 |     // click Step once → first stage reveals + spec begins filling
  22 |     await page.getByRole('button', { name: 'Step' }).click();
  23 |     await expect(page.getByText('Message received')).toBeVisible();
  24 |     await expect(page.getByText('filling · stage 1/7')).toBeVisible();
  25 |   });
  26 | 
  27 |   test('Reset returns to the empty state', async ({ page }) => {
  28 |     await page.goto('/tasks');
> 29 |     await page.getByRole('button', { name: 'Step' }).click();
     |                                                      ^ Error: locator.click: Test timeout of 30000ms exceeded.
  30 |     await page.getByRole('button', { name: 'Reset' }).click();
  31 |     await expect(page.getByText('Press Play', { exact: false })).toBeVisible();
  32 |   });
  33 | });
  34 | 
```