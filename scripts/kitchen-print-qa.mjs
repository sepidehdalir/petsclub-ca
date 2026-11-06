import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';

// Reuse the caller's isolated browser context and existing same-origin request guard.
// No browser launch, credentials, network policy or sandbox settings are changed here.
export async function checkKitchenPrint(context, base, out) {
  assert.equal(base.protocol, 'http:');
  assert.ok(['127.0.0.1', 'localhost'].includes(base.hostname));
  const results = [];
  for (const slug of ['soft-carrot-mash-for-dogs', 'sweet-potato-spoonfuls-for-dogs', 'plain-poached-chicken-for-dogs-and-cats', 'plain-egg-crumbles-for-dogs-and-cats']) {
    const page = await context.newPage();
    try {
      const response = await page.goto(new URL(`/kitchen/${slug}`, base).href);
      assert.equal(response.status(), 200, `${slug}: page HTTP200`);
      const batch = page.getByText('Makes a preparation batch, not one serving.', { exact: false });
      // A streamed route can still show its loading shell after navigation resolves.
      // Wait for real recipe content; keep the visibility assertion and finite timeout.
      await batch.waitFor({ state: 'visible', timeout: 15000 });
      assert.equal(await batch.isVisible(), true, `${slug}: screen batch note visible`);
      const identity = page.getByText(`Recipe page: https://thepetclub.ca/kitchen/${slug}`, { exact: true });
      assert.equal(await identity.isVisible(), false, 'print identity does not clutter screen');
      await page.emulateMedia({ media: 'print' });
      await page.screenshot({ path: join(out, `${slug}-print-before-checks.png`), fullPage: true });
      const visibility = await page.locator('main p, main strong').evaluateAll(nodes => nodes.filter(node => /Makes a preparation batch|AI-generated illustration|Recipe page:|Before you start:/.test(node.textContent)).map(node => ({ text: node.textContent, display: getComputedStyle(node).display, visibility: getComputedStyle(node).visibility, rect: node.getBoundingClientRect().toJSON() })));
      await writeFile(join(out, `${slug}-print-visibility.json`), JSON.stringify(visibility, null, 2));
      assert.equal(await batch.isVisible(), true, 'batch warning must survive print');
      assert.equal(await page.getByText('AI-generated illustration.', { exact: false }).isVisible(), true, 'untested-method disclosure survives print');
      assert.equal(await identity.isVisible(), true, `${slug}: print identity visible`);
      assert.equal(await page.getByText('Before you start:', { exact: true }).isVisible(), true, `${slug}: caution visible`);
      for (const heading of ['Offer a little, not the whole batch', 'Keep the rest safely', 'Leave these out']) {
        assert.equal(await page.getByRole('heading', { name: heading, exact: true }).isVisible(), true, `${slug}: ${heading} visible`);
      }
      assert.equal(await page.getByRole('button', { name: 'Print / save PDF' }).isVisible(), false, `${slug}: print tool hidden`);
      const sources = page.locator('main a[target="_blank"]');
      for (const link of await sources.all()) {
        if (await link.isVisible()) {
          const href = await link.getAttribute('href');
          assert.ok((await link.evaluate(node => getComputedStyle(node, '::after').content)).includes(href), `${slug}: printed source URL ${href}`);
        }
      }
      await page.screenshot({ path: join(out, `${slug}-print.png`), fullPage: true });
      await page.pdf({ path: join(out, `${slug}.pdf`), format: 'Letter', printBackground: false });
      await page.emulateMedia({ media: 'screen' });
      assert.equal(await identity.isVisible(), false, `${slug}: screen identity hidden after restore`);
      assert.equal(await page.getByRole('button', { name: 'Print / save PDF' }).isVisible(), true, `${slug}: screen tool restored`);
      results.push({ slug, passed: true });
    } catch (error) {
      await page.screenshot({ path: join(out, `${slug}-print-failure.png`), fullPage: true }).catch(() => {});
      await writeFile(join(out, 'kitchen-print-failure.json'), JSON.stringify({ slug, error: String(error), stack: error.stack }, null, 2));
      throw error;
    } finally { await page.close(); }
  }
  await writeFile(join(out, 'kitchen-print-results.json'), JSON.stringify({ checked: new Date().toISOString(), results }, null, 2));
  return 'Four recipes: printed batch warning, preparation disclaimer, serving/storage/avoid guidance, canonical URL, source URLs and screen restoration verified; four PDFs and screenshots saved.';
}
