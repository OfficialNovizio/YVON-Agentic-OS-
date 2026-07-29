import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';

const wait = ms => new Promise(r => setTimeout(r, ms));
async function up(url, tries = 30) {
  for (let i = 0; i < tries; i++) {
    try { const r = await fetch(url); if (r.ok) return true; } catch {}
    await wait(500);
  }
  return false;
}

const server = spawn('npx', ['next', 'start', '-p', '3000'], {
  cwd: process.cwd(), stdio: 'ignore', env: process.env,
});

let out = {};
try {
  const ready = await up('http://localhost:3000/tasks');
  out.serverReady = ready;
  if (!ready) throw new Error('server did not start');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const resp = await page.goto('http://localhost:3000/tasks', { waitUntil: 'networkidle' });
  out.httpStatus = resp.status();
  out.title = await page.title();
  out.heading = await page.getByRole('heading', { name: 'Task Dispatch' }).isVisible();
  out.verbatimMsg = await page.getByText('Operator message — captured verbatim').isVisible();
  out.specFile = await page.getByText('store/tasks/TS-001.yaml').isVisible();
  out.emptyState = await page.getByText('Press Play', { exact: false }).isVisible();

  // interact: click Step, verify the sim advances
  await page.getByRole('button', { name: 'Step' }).click();
  await wait(400);
  out.afterStep_stage1 = await page.getByText('filling · stage 1/7').isVisible();
  out.afterStep_msgReceived = await page.getByText('Message received').isVisible();

  await page.screenshot({ path: '/sessions/inspiring-zen-lamport/mnt/outputs/tasks_page.png', fullPage: true });
  out.screenshot = 'saved';
  await browser.close();
  out.RESULT = 'PASS';
} catch (e) {
  out.RESULT = 'FAIL';
  out.error = String(e).split('\n').slice(0, 3).join(' | ');
} finally {
  server.kill('SIGKILL');
}
console.log('PROBE_JSON ' + JSON.stringify(out));
