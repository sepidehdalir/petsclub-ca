import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

// Isolated local production build only; no external forms or sharing.
const base = new URL(process.env.QA_BASE_URL ?? 'http://127.0.0.1:3000');
assert.equal(base.protocol, 'http:');
assert.ok(['127.0.0.1', 'localhost'].includes(base.hostname));
assert.ok(!base.username && !base.password && !base.search && !base.hash);
assert.ok(process.env.QA_TOOLS_DIR, 'Set QA_TOOLS_DIR to an existing Playwright installation');
const { chromium } = await import(pathToFileURL(join(process.env.QA_TOOLS_DIR, 'node_modules/playwright/index.mjs')).href);
const out = process.env.QA_OUTPUT_DIR ?? '/tmp/petclub-kitchen-print-qa';
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ chromiumSandbox: true, executablePath: process.env.QA_CHROMIUM_PATH || undefined });
const results = [];
try {
  for (const slug of ['soft-carrot-mash-for-dogs', 'sweet-potato-spoonfuls-for-dogs', 'plain-poached-chicken-for-dogs-and-cats', 'plain-egg-crumbles-for-dogs-and-cats']) {
    const page = await browser.newPage();
    try {
      const response = await page.goto(new URL(`/kitchen/${slug}`, base).href);
      assert.equal(response.status(), 200);
      const batch = page.getByText('Makes a preparation batch, not one serving.', { exact: false });
      assert.equal(await batch.isVisible(), true);
      const identity = page.getByText(`Recipe page: https://thepetclub.ca/kitchen/${slug}`, { exact: true });
      assert.equal(await identity.isVisible(), false, 'print identity does not clutter screen');
      await page.emulateMedia({ media: 'print' });
      assert.equal(await batch.isVisible(), true, 'batch warning must survive print');
      assert.equal(await page.getByText('AI-generated illustration.', { exact: false }).isVisible(), true, 'untested-method disclosure survives print');
      assert.equal(await identity.isVisible(), true);
      assert.equal(await page.getByText('Before you start:', { exact: true }).isVisible(), true);
      for (const heading of ['Offer a little, not the whole batch', 'Keep the rest safely', 'Leave these out']) {
        assert.equal(await page.getByRole('heading', { name: heading, exact: true }).isVisible(), true);
      }
      assert.equal(await page.getByRole('button', { name: 'Print / save PDF' }).isVisible(), false);
      const sources = page.locator('main a[target="_blank"]');
      for (const link of await sources.all()) {
        if (await link.isVisible()) {
          const href = await link.getAttribute('href');
          assert.ok((await link.evaluate(node => getComputedStyle(node, '::after').content)).includes(href));
        }
      }
      await page.screenshot({ path: join(out, `${slug}-print.png`), fullPage: true });
      await page.pdf({ path: join(out, `${slug}.pdf`), format: 'Letter', printBackground: false });
      await page.emulateMedia({ media: 'screen' });
      assert.equal(await identity.isVisible(), false);
      assert.equal(await page.getByRole('button', { name: 'Print / save PDF' }).isVisible(), true);
      results.push({ slug, passed: true });
    } finally { await page.close(); }
  }
} finally { await browser.close(); }
await writeFile(join(out, 'results.json'), JSON.stringify({ checked: new Date().toISOString(), results }, null, 2));
process.stdout.write(JSON.stringify(results));
