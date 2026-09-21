import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

// QA runs only against an isolated, credential-free CI build, never production.
const base = new URL(process.env.QA_BASE_URL ?? 'http://127.0.0.1:3000');
assert.equal(base.protocol, 'http:');
assert.ok(['127.0.0.1', 'localhost'].includes(base.hostname), 'Only loopback targets are allowed');
assert.ok(!base.username && !base.password && !base.search && !base.hash);
const tools = process.env.QA_TOOLS_DIR;
assert.ok(tools, 'QA_TOOLS_DIR must point to the isolated Playwright installation');
const out = process.env.QA_OUTPUT_DIR ?? '/tmp/petclub-browser-qa';
await mkdir(out, { recursive: true });
const { chromium, webkit } = await import(pathToFileURL(join(tools, 'node_modules/playwright/index.mjs')).href);
const report = {
  startedAt: new Date().toISOString(),
  testedCommit: process.env.GITHUB_SHA ?? 'local',
  scope: 'Isolated production-mode build; not a deployed Vercel preview or physical iPhone test.',
  unverified: ['Deployed Vercel X-Robots-Tag', 'Production domain/branch mapping', 'Physical iPhone Safari', 'Search Console performance'],
  cases: [],
};

const deadline = Date.now() + 60000;
let serverReady = false;
while (Date.now() < deadline) {
  try {
    const response = await fetch(base, { signal: AbortSignal.timeout(2000) });
    if (response.status === 200) { serverReady = true; break; }
  } catch { /* A not-yet-listening server is retried only until the deadline. */ }
  await new Promise((resolve) => setTimeout(resolve, 500));
}
assert.ok(serverReady, 'The local application did not start within 60 seconds');

const routes = ['/', '/guides', '/dogs', '/cats', '/guides/winter-dog-care-in-canada', '/puppy/12-weeks'];
const scenarios = [
  { name: 'chromium-desktop', engine: chromium, viewport: { width: 1440, height: 900 }, mobile: false },
  { name: 'chromium-mobile', engine: chromium, viewport: { width: 390, height: 844 }, mobile: true },
  { name: 'webkit-mobile', engine: webkit, viewport: { width: 390, height: 844 }, mobile: true },
];

for (const scenario of scenarios) {
  let browser;
  try {
    browser = await scenario.engine.launch();
    const context = await browser.newContext({
      viewport: scenario.viewport,
      isMobile: scenario.mobile,
      hasTouch: scenario.mobile,
      deviceScaleFactor: 1,
      reducedMotion: 'reduce',
    });
    // Prevent accidental external navigation, submissions or analytics requests.
    await context.route('**/*', (route) => {
      const request = route.request();
      const url = new URL(request.url());
      if (url.origin !== base.origin || !['GET', 'HEAD'].includes(request.method())) return route.abort();
      return route.continue();
    });
    for (const path of routes) {
      const page = await context.newPage();
      page.setDefaultTimeout(12000);
      const errors = [];
      const badResponses = [];
      page.on('pageerror', (error) => errors.push(error.message));
      page.on('response', (response) => {
        if (response.status() >= 400 && new URL(response.url()).origin === base.origin) {
          badResponses.push({ path: new URL(response.url()).pathname, status: response.status() });
        }
      });
      const result = { browser: scenario.name, path, passed: false };
      const filename = `${scenario.name}-${path === '/' ? 'home' : path.slice(1).replaceAll('/', '-')}`;
      try {
        // Background prefetches are not a readiness signal. The explicit
        // heading, fonts, image and interaction checks below remain required.
        const response = await page.goto(new URL(path, base).href, { waitUntil: 'domcontentloaded' });
        assert.ok(response);
        result.status = response.status();
        assert.equal(result.status, 200);
        await page.locator('h1').waitFor({ state: 'visible' });
        assert.equal(await page.locator('h1').count(), 1, 'Exactly one h1 is required');
        await page.evaluate(async () => { await document.fonts.ready; });
        result.viewport = await page.evaluate(() => ({ width: innerWidth, height: innerHeight }));
        assert.deepEqual(result.viewport, scenario.viewport, 'Requested viewport was not applied');
        result.layout = await page.evaluate(() => ({ width: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth }));
        assert.ok(result.layout.scrollWidth <= result.layout.width + 1, 'Horizontal overflow');
        result.canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
        assert.equal(result.canonical?.replace(/\/$/, ''), `https://thepetclub.ca${path === '/' ? '' : path}`);
        result.robots = await page.locator('meta[name="robots"]').evaluateAll((nodes) => nodes.map((node) => node.getAttribute('content')).join(', ')) || null;
        assert.ok(!/noindex/i.test(result.robots ?? ''), 'Published production-mode page unexpectedly noindex');
        result.localXRobotsTag = (await response.allHeaders())['x-robots-tag'] ?? null;
        assert.ok(!/noindex/i.test(result.localXRobotsTag ?? ''), 'Local production-mode header unexpectedly noindex');
        // Verify image availability without turning lazy-loading policy into
        // a release gate. Images that the browser has actually requested must
        // decode successfully. Lazy images that have not been requested yet
        // are checked with a same-origin GET to their declared Next image URL;
        // forcing every off-screen image through the viewport made the harness
        // test scrolling/timing rather than whether the asset is healthy.
        const images = page.locator('main img');
        result.imagesChecked = await images.count();
        result.lazyImagesProbed = 0;
        for (let index = 0; index < result.imagesChecked; index += 1) {
          const image = images.nth(index);
          const state = await image.evaluate((node) => ({
            src: node.getAttribute('src'),
            currentSrc: node.currentSrc,
            loading: node.loading,
            complete: node.complete,
            naturalWidth: node.naturalWidth,
          }));
          if (state.currentSrc) {
            const element = await image.elementHandle();
            assert.ok(element);
            try {
              await page.waitForFunction((node) => node.complete && node.naturalWidth > 0, element, { timeout: 15000 });
            } finally {
              await element.dispose();
            }
            continue;
          }
          assert.equal(state.loading, 'lazy', 'Non-lazy image was never requested');
          assert.ok(state.src, 'Lazy image is missing its declared source');
          const probe = await context.request.get(new URL(state.src, base).href);
          assert.equal(probe.status(), 200, `Lazy image probe failed: ${state.src}`);
          result.lazyImagesProbed += 1;
        }
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.screenshot({ path: join(out, `${filename}.png`), fullPage: true });
        if (path === '/') {
          assert.ok(!(await page.locator('body').innerText()).includes('no article has been published yet'));
          result.guideCards = await page.locator('section[aria-labelledby="guides-heading"] h3').count();
          assert.equal(result.guideCards, 3, 'Homepage must show three published guide cards');
          if (scenario.mobile) {
            const open = page.getByRole('button', { name: 'Open menu', exact: true });
            await open.click();
            await page.locator('dialog[open]').waitFor({ state: 'visible' });
            assert.equal(await open.getAttribute('aria-expanded'), 'true');
            await page.screenshot({ path: join(out, `${scenario.name}-menu-open.png`) });
            await page.getByRole('button', { name: 'Close menu', exact: true }).click();
            await page.locator('dialog[open]').waitFor({ state: 'hidden' });
            await open.click();
            await page.locator('dialog[open]').waitFor({ state: 'visible' });
            await page.keyboard.press('Escape');
            await page.locator('dialog[open]').waitFor({ state: 'hidden' });
            result.mobileMenu = 'Open, close button and Escape passed';
          }
          await page.getByRole('link', { name: 'Browse Canadian guides', exact: true }).click();
          await page.waitForURL(new URL('/guides', base).href);
          await page.locator('#published-guides-heading').waitFor({ state: 'visible' });
          result.heroGuideNavigation = 'passed';
        }
        if (path === '/guides') {
          const list = page.locator('section[aria-labelledby="published-guides-heading"]');
          result.guideCards = await list.locator('h3').count();
          assert.ok(result.guideCards > 0, 'Published library must not be empty');
          const card = list.locator('a[href="/guides/winter-dog-care-in-canada"]').first();
          await card.click();
          await page.waitForURL(new URL('/guides/winter-dog-care-in-canada', base).href);
          assert.equal(await page.locator('h1').innerText(), 'Winter Dog Care in Canada');
          result.guideCardNavigation = 'passed';
        }
        if (path === '/guides/winter-dog-care-in-canada') {
          result.inlineDraftLinks = await page.locator('a[href*="/guides/arthritis-and-mobility-in-dogs-and-cats"]').count();
          assert.equal(result.inlineDraftLinks, 0, 'Known in-review destination is still promoted');
        }
        assert.deepEqual(errors, [], 'Browser execution errors');
        assert.deepEqual(badResponses, [], 'Failed same-origin requests');
        result.passed = true;
      } catch (error) {
        result.error = error instanceof Error ? error.message : String(error);
        result.imageStates = await page.locator('main img').evaluateAll((images) => images.map((image) => ({
          src: image.getAttribute('src'), currentSrc: image.currentSrc,
          loading: image.loading, complete: image.complete, naturalWidth: image.naturalWidth,
        }))).catch(() => []);
        await page.screenshot({ path: join(out, `${filename}-failure.png`), fullPage: true }).catch(() => {});
      } finally {
        result.browserErrors = errors;
        result.failedResponses = badResponses;
        report.cases.push(result);
        process.stdout.write(`${result.passed ? 'PASS' : 'FAIL'} ${scenario.name} ${path}${result.error ? `: ${result.error}` : ''}\n`);
        await writeFile(join(out, 'report.json'), JSON.stringify(report, null, 2));
        await page.close();
      }
    }
    await context.close();
  } catch (error) {
    report.cases.push({ browser: scenario.name, path: '(browser setup)', passed: false, error: String(error) });
  } finally {
    if (browser) await browser.close();
  }
}
report.finishedAt = new Date().toISOString();
report.passed = report.cases.filter((item) => item.passed).length;
report.failed = report.cases.filter((item) => !item.passed).length;
await writeFile(join(out, 'report.json'), JSON.stringify(report, null, 2));
process.stdout.write(`Browser QA: ${report.passed} passed; ${report.failed} failed. See report.json and screenshots.\n`);
process.exitCode = report.failed ? 1 : 0;
