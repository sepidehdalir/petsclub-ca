import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

// Called only by the existing credential-free, loopback-only Browser QA job.
export async function checkPuppyJourney(context, base, out, name) {
  const page = await context.newPage();
  page.setDefaultTimeout(12000);
  const route = new URL('/puppy/12-weeks', base).href;
  try {
    await page.goto(route);
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.getByRole('link', { name: 'Open this stage’s checklist', exact: true }).click();
    const anchorBounds = await page.locator('#stage-checklist-heading').evaluate(node => {
      const blockers = [...document.querySelectorAll('header')].filter(header => ['sticky', 'fixed'].includes(getComputedStyle(header).position));
      return { top: node.getBoundingClientRect().top, bottom: Math.max(0, ...blockers.map(header => header.getBoundingClientRect().bottom)) };
    });
    assert.ok(anchorBounds.top >= anchorBounds.bottom - 1, 'checklist jump target must clear sticky header');
    const box = page.getByRole('checkbox').first();
    await box.focus();
    await page.keyboard.press('Space');
    await page.waitForFunction(() => document.querySelector('input[type="checkbox"]')?.checked);
    await page.getByText('Saved on this device.', { exact: true }).waitFor();
    assert.match(await page.locator('main').innerText(), /1 of .* marked done/);
    await page.reload();
    await page.waitForFunction(() => document.querySelector('input[type="checkbox"]')?.checked);
    assert.equal(await box.isChecked(), true, 'tick survives reload');
    const other = await context.newPage();
    await other.goto(route);
    await other.waitForFunction(() => document.querySelector('input[type="checkbox"]')?.checked);
    assert.equal(await other.getByRole('checkbox').first().isChecked(), true);
    await other.getByRole('checkbox').first().uncheck();
    await page.waitForFunction(() => !document.querySelector('input[type="checkbox"]')?.checked);
    await other.close();
    await box.check();
    await page.getByLabel('Name for the card (optional)').fill('QA Puppy 🐶');
    const downloadEvent = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Save progress card', exact: true }).click();
    const download = await downloadEvent;
    const png = join(out, `${name}-puppy-progress.png`);
    await download.saveAs(png);
    const bytes = await readFile(png);
    assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
    assert.equal(bytes.readUInt32BE(16), 1080);
    assert.equal(bytes.readUInt32BE(20), 1350);
    assert.ok(bytes.length > 10000, 'nonempty rendered PNG');
    await page.evaluate(() => {
      window.__qaShares = [];
      Object.defineProperty(navigator, 'share', { configurable: true, value: async payload => {
        window.__qaShares.push(payload); throw new DOMException('Cancelled by QA', 'AbortError');
      } });
      Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async () => { throw new Error('denied'); } } });
    });
    await page.getByRole('button', { name: 'Share this stage', exact: true }).click();
    await page.getByText('Sharing cancelled. Nothing else was sent by this page.', { exact: true }).waitFor();
    const shares = await page.evaluate(() => window.__qaShares);
    assert.equal(shares.length, 1);
    const shared = new URL(shares[0].url);
    assert.equal(shared.origin, 'https://thepetclub.ca');
    assert.equal(shared.pathname, '/puppy/12-weeks');
    assert.doesNotMatch(JSON.stringify(shares), /QA Puppy|dob=|breed=|province=/);
    await page.getByRole('button', { name: 'Copy public link', exact: true }).click();
    await page.getByText('Copy is unavailable. Select and copy the public link in the field below.', { exact: true }).waitFor();
    assert.equal(await page.getByLabel('Public link — no birth date, breed, province or name').inputValue(), shares[0].url);
    const expandedWidth = await page.evaluate(() => ({ client: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
    assert.ok(expandedWidth.scroll <= expandedWidth.client + 1, 'expanded card must not cause horizontal overflow');
    await page.screenshot({ path: join(out, `${name}-puppy-checklist.png`), fullPage: true });
    page.once('dialog', dialog => dialog.dismiss());
    await page.getByRole('button', { name: 'Clear this checklist', exact: true }).click();
    assert.equal(await box.isChecked(), true, 'cancel preserves ticks');
    page.once('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: 'Clear this checklist', exact: true }).click();
    await page.reload();
    assert.equal(await box.isChecked(), false);
    await page.evaluate(() => {
      const d = new Date(); d.setDate(d.getDate() - 90);
      localStorage.setItem('petclub.puppy.v1', JSON.stringify({ dob: `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}` }));
    });
    await page.goto(new URL('/puppy', base).href);
    const resume = page.getByRole('link', { name: 'Continue your saved Journey', exact: true });
    await resume.waitFor();
    assert.match(await resume.getAttribute('href'), /^\/my-puppy\?dob=/);
    await resume.click();
    await page.waitForURL(/\/my-puppy\?dob=/);
    assert.match(await page.locator('meta[name="robots"]').getAttribute('content'), /noindex/);
    await page.goBack();
    await resume.waitFor();
    await page.evaluate(() => {
      localStorage.setItem('petclub.journey-checklist.v1.12-weeks:guide', '{"version":1,"done":["example"]}');
      localStorage.setItem('qa-unrelated', 'keep');
    });
    const profileTab = await context.newPage();
    await profileTab.goto(new URL('/puppy', base).href);
    const otherResume = profileTab.getByRole('link', { name: 'Continue your saved Journey', exact: true });
    await otherResume.waitFor();
    page.once('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: 'Clear saved Journey', exact: true }).click();
    await resume.waitFor({ state: 'hidden' });
    await otherResume.waitFor({ state: 'hidden' });
    await profileTab.close();
    assert.equal(await page.evaluate(() => localStorage.getItem('petclub.puppy.v1')), null);
    assert.equal(await page.evaluate(() => Object.keys(localStorage).some(key => key.startsWith('petclub.journey-checklist.v1.'))), false);
    assert.equal(await page.evaluate(() => localStorage.getItem('qa-unrelated')), 'keep');
    await page.evaluate(() => localStorage.setItem('petclub.journey-checklist.v1.12-weeks:guide', '{"version":999,"done":["fake"]}'));
    await page.goto(route);
    assert.equal(await box.isChecked(), false, 'unsupported old schema fails closed');
    await page.evaluate(() => { Storage.prototype.setItem = () => { throw new DOMException('Blocked', 'SecurityError'); }; });
    await box.check();
    await page.getByText('Storage is unavailable. These ticks are temporary and may disappear when you leave or refresh.', { exact: true }).waitFor();
    await page.reload();
    assert.equal(await box.isChecked(), false, 'failed storage was not persisted');
    const width = await page.evaluate(() => ({ client: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
    assert.ok(width.scroll <= width.client + 1, 'no horizontal overflow');
    await page.evaluate(() => localStorage.clear());
    return 'keyboard, reload, cross-tab, clear/cancel, local resume, old schema, denied storage, PNG bytes, cancelled native share and clipboard fallback passed; no external share';
  } catch (error) {
    await page.screenshot({ path: join(out, `${name}-puppy-failure.png`), fullPage: true }).catch(() => {});
    throw error;
  } finally { await page.close(); }
}
