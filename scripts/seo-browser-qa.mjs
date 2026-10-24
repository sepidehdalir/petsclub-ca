import assert from 'node:assert/strict';
import { mkdir, writeFile, readdir } from 'node:fs/promises';
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

const routes = ['/guides/parasite-prevention-for-pets-in-canada', '/kitchen', '/kitchen/soft-carrot-mash-for-dogs', '/kitchen/sweet-potato-spoonfuls-for-dogs', '/kitchen/plain-poached-chicken-for-dogs-and-cats', '/kitchen/plain-egg-crumbles-for-dogs-and-cats', '/guides/pet-licensing-across-canada', '/guides/cost-of-owning-a-dog-in-canada', '/', '/guides/choosing-dog-boots-in-canada', '/guides/choosing-a-cat-scratching-post-in-canada', '/compare/catit-digger-vs-wave-circuit', '/guides', '/dogs', '/cats', '/guides/winter-dog-care-in-canada', '/puppy/12-weeks', '/editorial-policy', '/advertising-disclosure', '/guides/bringing-home-a-puppy-first-30-days', '/guides/indoor-cat-enrichment-canadian-homes', '/guides/cost-of-owning-a-cat-in-canada', '/guides/choosing-a-cat-carrier-in-canada', '/guides/choosing-a-cat-puzzle-feeder', '/contact'];
const sitemap = await (await fetch(new URL('/sitemap.xml', base))).text();
const sitemapRoutes = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => new URL(match[1]).pathname);
const privateRoutes = ['/search', '/sign-in', '/sign-up', '/forgot-password', '/reset-password', '/auth/confirm', '/account', '/my-puppy'];
const extraRoutes = ['/community', '/lost-found', '/puppy', '/puppy/3-months', '/puppy/beyond-the-first-year', ...privateRoutes];
const staticRoutes = (await readdir('.next/server/app', { recursive: true }))
  .filter(file => file.endsWith('.html') && !file.startsWith('_'))
  .map(file => file === 'index.html' ? '/' : '/' + file.slice(0, -5));
const allRoutes = [...new Set([...routes, ...sitemapRoutes, ...extraRoutes, ...staticRoutes])];
const representativeRoutes = [...new Set([...routes, ...extraRoutes, '/health', '/food', '/training', '/about', '/privacy-policy', '/terms-of-use', '/community-guidelines'])];
const scenarios = [
  { name: 'chromium-small', engine: chromium, viewport: { width: 320, height: 740 }, mobile: true },
  { name: 'chromium-laptop', engine: chromium, viewport: { width: 1024, height: 768 }, mobile: false },
  { name: 'chromium-tablet', engine: chromium, viewport: { width: 768, height: 1024 }, mobile: true },
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
    const selectedRoutes = ['chromium-small', 'chromium-desktop'].includes(scenario.name) ? allRoutes : representativeRoutes;
    for (const path of selectedRoutes) {
      const page = await context.newPage();
      page.setDefaultTimeout(12000);
      const errors = [];
      const badResponses = [];
      const failedRequests = [];
      page.on('requestfailed', (request) => failedRequests.push({ url: request.url(), error: request.failure()?.errorText }));
      page.on('pageerror', (error) => errors.push(error.message));
      page.on('response', (response) => {
        if (response.status() >= 400 && new URL(response.url()).origin === base.origin) {
          badResponses.push({ path: new URL(response.url()).pathname, status: response.status() });
        }
      });
      const result = { browser: scenario.name, path, passed: false, failedRequests };
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
        const mainText = (await page.locator('main').innerText()).replace(/\s+/g, ' ');
        if (path === '/kitchen') {
          assert.equal(await page.locator('main article').count(), 4);
          await page.getByRole('button', { name: 'For cats', exact: true }).click();
          assert.equal(await page.locator('main article').count(), 2);
          assert.match(await page.locator('main').innerText(), /Plain Poached Chicken/);
          await page.getByRole('button', { name: 'All recipes', exact: true }).click();
          assert.equal(await page.locator('main article').count(), 4);
          result.kitchenFilter = 'Dog/cat filter and reset passed';
        }
        if (path.startsWith('/kitchen/')) {
          assert.match(mainText, /below 10%/);
          assert.match(mainText, /not a target/);
          assert.match(mainText, /AI-generated illustration/);
          assert.equal(await page.getByRole('button', { name: 'Share recipe ↗', exact: true }).count(), 1);
          await page.evaluate(() => { window.__printRequested = false; window.print = () => { window.__printRequested = true; }; });
          await page.getByRole('button', { name: 'Print / save PDF', exact: true }).click();
          assert.equal(await page.evaluate(() => window.__printRequested), true);
          result.kitchenPrint = 'Print action and safety copy passed';
        }
        if (path === '/guides/pet-licensing-across-canada') {
          assert.match(mainText, /Pet-licence application checklist/i);
          assert.match(mainText, /appointment, proof of ownership and a valid City licence/);
          assert.match(mainText, /limited update/);
          assert.match(mainText, /October 21, 2026/);
          assert.ok(await page.locator('a[href="/guides/cost-of-owning-a-dog-in-canada"]').count());
          assert.ok(await page.locator('a[href="/guides/choosing-a-dog-harness-in-canada"]').count());
        }
        if (path === '/guides/cost-of-owning-a-dog-in-canada') {
          assert.match(mainText, /Ontario Veterinary Medical Association/);
          assert.match(mainText, /not a Canada-wide average or a quote for your dog/);
          assert.match(mainText, /Updated October 20, 2026/);
          assert.match(mainText, /Do not delay veterinary care/);
          assert.equal(await page.locator('table').count(), 1);
          assert.equal(await page.locator('table th[scope="row"]').count(), 9);
          assert.ok(await page.locator('table caption').innerText());
          assert.equal(await page.locator('time[datetime="2026-09-06"]').count(), 1);
          assert.equal(await page.locator('time[datetime="2026-10-20"]').count(), 1);
          assert.equal(await page.locator('a[href="/guides/pet-food-storage-container-original-bag"]').count(), 1);
          assert.equal(await page.locator('aside[aria-label="Affiliate offer"]').count(), 0);
        }
        if (path === '/guides/bringing-home-a-puppy-first-30-days') {
          assert.match(mainText, /Read the policy before relying on timing/);
          assert.match(mainText, /Do not delay veterinary care or an appointment/);
          assert.match(mainText, /Correction — September 27, 2026/);
          assert.match(mainText, /single daily-hour figure is not a reliable rule/);
        }
        if (path === '/guides/choosing-a-cat-puzzle-feeder') {
          const offer = page.locator('aside[aria-label="Affiliate offer"]');
          assert.equal(await offer.count(), 1, 'One contextual offer, not a wall of links');
          assert.match(await offer.innerText(), /As an Amazon Associate I earn from qualifying purchases/);
          const cta = offer.getByRole('link', { name: 'View on Amazon.ca' });
          const target = new URL(await cta.getAttribute('href'));
          assert.equal(target.hostname, 'www.amazon.ca');
          assert.ok(target.pathname.includes('/dp/B015P13QMM'));
          assert.equal(target.searchParams.get('tag'), 'thepetclub09-20');
          assert.match(await cta.getAttribute('rel'), /sponsored/);
          assert.match(mainText, /No product here has been tested by The Pet Club/);
          await cta.scrollIntoViewIfNeeded();
          assert.ok(await cta.isVisible());
          result.affiliateCheck = 'One visible disclosed exact Digger offer; original verified Amazon tag retained';
        }
        if (['/guides/choosing-dog-boots-in-canada', '/guides/choosing-a-cat-scratching-post-in-canada'].includes(path)) {
          assert.equal(await page.locator('time[datetime="2026-10-18"]').count(), 1);
          assert.equal(await page.locator('table').count(), 1, 'One usable comparison or fitting worksheet');
          assert.ok(await page.locator('table caption').innerText());
          assert.ok((await page.locator('table th[scope="row"]').count()) >= 6);
          assert.match(mainText, /No veterinarian has reviewed this guide/);
          assert.match(mainText, /has not tested/);
          assert.equal(await page.locator('aside[aria-label="Affiliate offer"]').count(), 0);
          assert.ok(!mainText.includes('| --- |'), 'Markdown tables must render as real tables');
          if (path.includes('choosing-dog-boots')) {
            assert.match(mainText, /outdoor use only/);
            assert.match(mainText, /four boots per package/);
          } else {
            assert.match(mainText, /32\.5 inches/);
            assert.match(mainText, /sold separately/);
          }
        }
        if (path === '/guides/choosing-a-cat-carrier-in-canada') {
          assert.equal(await page.locator('h1').innerText(), 'Choosing a Cat Carrier in Canada: Size, Access and Fit');
          assert.equal(await page.locator('time[datetime="2026-10-17"]').count(), 1);
          assert.match(mainText, /We have not tested these products/);
          assert.match(mainText, /intended maximum cat weight of 6 kg/);
          assert.match(mainText, /maximum cat height of 30 cm/);
          assert.match(mainText, /higher safety margin/);
          assert.match(mainText, /flexible, soft-sided carriers/);
          assert.match(mainText, /No affiliate relationship or hands-on product testing is claimed/);
          const shoppingLinks = [
            { label: 'Check the Catit PIXI Mio at Pet Valu', href: 'https://www.petvalu.ca/product/catit-pixi-mio-cat-bed-and-carrier/SCM15822' },
            { label: 'Check the Sherpa Original Deluxe at PetSmart Canada', href: 'https://www.petsmart.ca/dog/crates-gates-and-containment/carriers-and-backpacks/sherpa-original-deluxe-pet-carrier-guaranteed-on-board-dog-and-cat-carrier-16-lbs-max-black-537.html' },
          ];
          const clicks = [];
          await page.exposeFunction('recordCarrierShoppingClick', (href) => clicks.push(href));
          await page.evaluate((destinations) => {
            // Check the actual links without navigating to or contacting a retailer.
            document.addEventListener('click', (event) => {
              const link = event.target.closest('a');
              if (link && destinations.includes(link.href)) {
                event.preventDefault();
                window.recordCarrierShoppingClick(link.href);
              }
            });
          }, shoppingLinks.map((link) => link.href));
          for (const link of shoppingLinks) {
            const cta = page.getByRole('link', { name: link.label, exact: true });
            assert.equal(await cta.count(), 1);
            assert.equal(await cta.getAttribute('href'), link.href);
            assert.ok(await cta.isVisible());
            await cta.click();
          }
          await page.locator('main').innerText();
          assert.deepEqual(clicks, shoppingLinks.map((link) => link.href));
          const sourceLinks = await page.locator('section[aria-labelledby="article-sources-heading"] a').evaluateAll((nodes) => nodes.map((node) => node.href));
          assert.deepEqual(sourceLinks, [
            'https://www.edmontonhumanesociety.com/wp-content/uploads/2024/09/2024-choosing-cat-carrier-EHS-Resources.pdf',
            'https://catfriendly.com/be-a-cat-friendly-caregiver/cat-carriers/',
            'https://www.aircanada.com/ca/en/aco/home/plan/special-assistance/pets.html',
            'https://www.catit.com/products/catit-pixi-mio-carrier/',
            'https://sherpapet.com/products/sherpa-original-deluxe-travel-bag-pet-carrier?Color=Black&Size=Medium',
          ]);
          result.carrierShoppingLinks = 'Both named Canadian retailer links matched and handled one local click each; no external navigation';
          result.carrierSourceLinks = 'All five primary-source destinations matched';
        }
        if (path === '/editorial-policy') {
          assert.doesNotMatch(mainText, /Draft — pending editorial review/);
        }
        await page.evaluate(async () => { await document.fonts.ready; });
        result.viewport = await page.evaluate(() => ({ width: innerWidth, height: innerHeight }));
        assert.deepEqual(result.viewport, scenario.viewport, 'Requested viewport was not applied');
        result.layout = await page.evaluate(() => ({ width: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth }));
        assert.ok(result.layout.scrollWidth <= result.layout.width + 1, 'Horizontal overflow');
        result.canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
        assert.equal(result.canonical?.replace(/\/$/, ''), `https://thepetclub.ca${path === '/' ? '' : path === '/my-puppy' ? '/puppy' : path}`);
        result.robots = await page.locator('meta[name="robots"]').evaluateAll((nodes) => nodes.map((node) => node.getAttribute('content')).join(', ')) || null;
        assert.equal(/noindex/i.test(result.robots ?? ''), !sitemapRoutes.includes(path), 'Index policy matches public/private route');
        result.localXRobotsTag = (await response.allHeaders())['x-robots-tag'] ?? null;
        assert.ok(!/noindex/i.test(result.localXRobotsTag ?? ''), 'Local production-mode header unexpectedly noindex');
        // Verify every declared Next image URL returns successfully. Browser
        // decode/readiness is intentionally not a release gate here: repeated
        // CI runs showed engine-specific lazy/decode timing even when the image
        // endpoint returned 200 and screenshots rendered normally. Visual
        // evidence is still captured below, while this assertion catches a
        // genuinely broken or missing optimized asset deterministically.
        const images = page.locator('main img');
        result.imagesChecked = await images.count();
        result.imageStates = [];
        for (let index = 0; index < result.imagesChecked; index += 1) {
          const image = images.nth(index);
          const state = await image.evaluate((node) => ({
            src: node.getAttribute('src'),
            currentSrc: node.currentSrc,
            loading: node.loading,
            complete: node.complete,
            naturalWidth: node.naturalWidth,
          }));
          assert.ok(state.src, 'Image is missing its declared source');
          const probe = await context.request.get(new URL(state.src, base).href);
          assert.equal(probe.status(), 200, `Image endpoint failed: ${state.src}`);
          result.imageStates.push({ ...state, probeStatus: probe.status() });
        }
        result.domAudit = await page.evaluate(() => {
          const ids = [...document.querySelectorAll('[id]')].map(node => node.id);
          const missingAnchors = [...document.querySelectorAll('a[href^="#"]')]
            .map(node => node.getAttribute('href'))
            .filter(href => href.length > 1 && !document.getElementById(decodeURIComponent(href.slice(1))));
          return { duplicateIds: ids.filter((id, i) => ids.indexOf(id) !== i), missingAnchors };
        });
        assert.deepEqual(result.domAudit, { duplicateIds: [], missingAnchors: [] });
        if (path === '/puppy') {
          await page.locator('form button[type="submit"]').click();
          await page.getByText('Enter your puppy’s date of birth to start your Journey.', { exact: true }).waitFor();
          const dob = new Date(); dob.setDate(dob.getDate() - 84);
          await page.locator('#puppy-dob').fill(dob.toISOString().slice(0, 10));
          await page.locator('form button[type="submit"]').click();
          await page.waitForURL('**/my-puppy?**');
          await page.locator('main h1').waitFor({ state: 'visible' });
          assert.match(await page.locator('main').innerText(), /12 weeks/i);
          assert.ok(await page.locator('meta[name="robots"]').getAttribute('content').then(x => x.includes('noindex')));
          // Exercise the real return control rather than interrupting the
          // client transition with an immediate unrelated hard navigation.
          await page.getByRole('link', { name: 'Change details', exact: true }).click();
          await page.waitForURL(new URL('/puppy', base).href);
          await page.locator('#puppy-dob').waitFor({ state: 'visible' });
          // Keep explicit reload coverage. Settle background requests first so
          // this checks a user reload, not a forced abort mid-transition.
          await page.waitForLoadState('networkidle');
          await page.reload({ waitUntil: 'load' });
          await page.locator('#puppy-dob').waitFor({ state: 'visible' });
          assert.equal(await page.locator('form button[type="submit"]').count(), 1);
          result.puppyOnboarding = 'Empty date feedback, personalised journey, Change details return and direct reload passed';
        }
        if (path === '/search') {
          await page.locator('#search-query').fill('q'.repeat(120));
          await page.getByRole('button', { name: 'Find guides', exact: true }).click();
          await page.getByRole('heading', { name: 'No matching guides', exact: true }).waitFor();
          const width = await page.evaluate(() => [document.documentElement.scrollWidth, innerWidth]);
          assert.ok(width[0] <= width[1] + 1, 'Long search query must wrap on narrow screens');
          await page.goto(new URL(path, base).href);
          result.searchEmpty = 'No-result and long-query layout passed';
        }
        if (path === '/dogs' && scenario.viewport.width < 1024) {
          await page.getByRole('button', { name: 'Open menu', exact: true }).click();
          await page.getByRole('dialog', { name: 'Menu', exact: true }).waitFor();
          await page.keyboard.press('Escape');
          await page.getByRole('dialog', { name: 'Menu', exact: true }).waitFor({ state: 'hidden' });
          result.editorialMenu = 'Open and Escape close passed';
        }
        await page.evaluate(() => window.scrollTo(0, 0));
        if (representativeRoutes.includes(path)) await page.screenshot({ path: join(out, `${filename}.png`), fullPage: true });
        if (path === '/') {
          assert.ok(!(await page.locator('body').innerText()).includes('no article has been published yet'));
          await page.locator('.unleashed[data-enhanced="true"]').waitFor();
          // Page scrollWidth cannot detect text escaping a circular sticker.
          result.circleLabels = await page.evaluate(() => {
            const checks = [];
            const inspect = (badge, state) => {
              const previous = badge.getAttribute('style');
              badge.style.setProperty('rotate', '0deg', 'important');
              badge.style.setProperty('transform', 'none', 'important');
              const box = badge.getBoundingClientRect();
              const radius = box.width / 2;
              const cx = box.left + radius, cy = box.top + box.height / 2;
              const walker = document.createTreeWalker(badge.querySelector('.badge-copy'), NodeFilter.SHOW_TEXT);
              let node;
              while ((node = walker.nextNode())) {
                if (!node.textContent.trim()) continue;
                const range = document.createRange();
                range.selectNodeContents(node);
                for (const rect of range.getClientRects()) {
                  for (const x of [rect.left - 1, rect.right + 1]) {
                    for (const y of [rect.top, rect.bottom]) {
                      checks.push({ badge: badge.className, state, text: node.textContent,
                        inside: Math.hypot(x - cx, y - cy) <= radius * .96 });
                    }
                  }
                }
              }
              if (previous === null) badge.removeAttribute('style');
              else badge.setAttribute('style', previous);
            };
            document.querySelectorAll('.boop-button,.memory-sticker,.club-sticker,.belong-badge').forEach(b => inspect(b, 'default'));
            const hero = document.querySelector('.hero');
            const em = document.querySelector('.boop-button em');
            const original = em.textContent;
            hero.classList.add('is-booped');
            em.textContent = 'Booped!';
            inspect(document.querySelector('.boop-button'), 'booped');
            hero.classList.remove('is-booped');
            em.textContent = original;
            return checks;
          });
          assert.ok(result.circleLabels.length > 0);
          assert.deepEqual(result.circleLabels.filter(check => !check.inside), [], 'Badge text must fit inside the circle with a safety margin');
          assert.equal(await page.locator('.boop-button .badge-copy svg use').getAttribute('href'), '#arrow');
          result.guideCards = await page.locator('.story').count();
          assert.equal(result.guideCards, 5, 'Five approved featured stories');
          assert.equal(await page.getByRole('link', { name: 'Arvinify Technology Inc.', exact: true }).count(), 1);
          const fontEvidence = await page.locator('#hero-title').evaluate(node => {
            const family = getComputedStyle(node).fontFamily;
            return { family, loaded: document.fonts.check(`700 32px ${family.split(',')[0]}`) };
          });
          assert.match(fontEvidence.family, /Bricolage/i);
          assert.ok(fontEvidence.loaded, 'Display font loaded');
          result.fonts = fontEvidence;
          assert.equal(await page.locator('.hero-film').getAttribute('src'), null, 'Reduced motion must not download film');
          const open = page.getByRole('button', { name: 'Open menu', exact: true });
          await open.click();
          await page.locator('.menu-dialog[open]').waitFor({ state: 'visible' });
          assert.equal(await open.getAttribute('aria-expanded'), 'true');
          await page.screenshot({ path: join(out, `${scenario.name}-menu-open.png`) });
          await page.getByRole('button', { name: 'Close menu', exact: true }).click();
          await page.waitForFunction(() => document.querySelector('.menu-open')?.getAttribute('aria-expanded') === 'false');
          await open.click();
          await page.keyboard.press('Escape');
          await page.locator('.menu-dialog[open]').waitFor({ state: 'hidden' });
          result.menu = 'Open, close, Escape and expanded state passed';
          await page.locator('.world-switch [data-kind="cat"]').click();
          await page.locator('[data-mood="outside"]').click();
          assert.equal(await page.locator('.recommendation').getAttribute('href'), '/guides/choosing-a-cat-carrier-in-canada');
          assert.equal(await page.locator('.club-all').getAttribute('href'), '/cats');
          await page.locator('[data-filter="cats"]').click();
          assert.equal(await page.locator('.story:visible').count(), 3);
          await page.locator('[data-filter="all"]').click();
          await page.locator('.header .search-open').click();
          await page.locator('#guide-search').fill('boots');
          assert.equal(await page.locator('.search-result').count(), 1);
          assert.equal(await page.locator('.full-search').getAttribute('href'), '/search?q=boots');
          await page.keyboard.press('Escape');
          await page.locator('.recommendation').click();
          await page.waitForURL(new URL('/guides/choosing-a-cat-carrier-in-canada', base).href);
          await page.locator('h1').waitFor({ state: 'visible' });
          assert.match(await page.locator('h1').innerText(), /Choosing a Cat Carrier/);
          await page.goBack();
          await page.locator('.unleashed[data-enhanced="true"]').waitFor();
          await page.locator('.boop-button').click();
          assert.ok((await page.locator('.boop-status').innerText()).length > 0);
          result.homeInteractions = 'Dog/cat selection, recommendation navigation, filters, search, return and boop passed';
          await page.emulateMedia({ reducedMotion: 'no-preference' });
          await page.waitForFunction(() => document.querySelector('.unleashed')?.dataset.motion === 'on');
          await page.waitForFunction(() => document.querySelector('.hero-film')?.getAttribute('src'));
          const filmSrc = await page.locator('.hero-film').getAttribute('src');
          assert.equal(filmSrc, scenario.viewport.width <= 760 ? '/unleashed/hero-loop-mobile.mp4' : '/unleashed/hero-loop.mp4');
          result.motionLayout = [];
          for (const section of ['#home', '#manifesto', '#clubhouse', '#play', '#field-notes', '.footer']) {
            await page.locator(section).scrollIntoViewIfNeeded();
            await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
            const size = await page.evaluate(() => ({ width: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth }));
            assert.ok(size.scrollWidth <= size.width + 1, `Motion-on horizontal overflow at ${section}`);
            result.motionLayout.push({ section, ...size });
          }
          await page.locator('.throw-button').click();
          assert.match(await page.locator('.play-status').innerText(), /ball is bouncing/);
          await page.locator('.playground').scrollIntoViewIfNeeded();
          const beforeThrow = await page.locator('.tennis-ball').evaluate(node => node.style.getPropertyValue('--ball-y'));
          await page.waitForFunction(previous => document.querySelector('.tennis-ball')?.style.getPropertyValue('--ball-y') !== previous, beforeThrow);
          await page.locator('.footer .motion-toggle').click();
          assert.equal(await page.locator('.unleashed').getAttribute('data-motion'), 'off');
          assert.ok(await page.locator('.hero-film').evaluate(video => video.paused));
          result.motionControls = 'Responsive film source, six scroll positions, moving ball and pause passed';
          await page.locator('.header .search-open').click();
          await page.locator('#guide-search').fill('boots');
          await page.locator('.full-search').click();
          await page.waitForURL(new URL('/search?q=boots', base).href);
          await page.locator('#search-query').waitFor();
          assert.equal(await page.locator('#search-query').inputValue(), 'boots');
          assert.ok(await page.locator('main a[href="/guides/choosing-dog-boots-in-canada"]').count() > 0);
          result.fullSearch = 'Homepage query reached the server-rendered search route and returned the published boots guide';

        }
        if (path === '/guides') {
          const list = page.locator('section[aria-labelledby="published-guides-heading"]');
          result.guideCards = await list.locator('h3').count();
          assert.ok(result.guideCards > 0, 'Published library must not be empty');
          assert.equal(await list.locator('a[href="/guides/choosing-a-cat-carrier-in-canada"]').count(), 1, 'Published carrier guide is missing from the library');
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
        if (path === '/compare/catit-digger-vs-wave-circuit' || path === '/guides/indoor-cat-enrichment-canadian-homes' || path === '/guides/cost-of-owning-a-cat-in-canada') {
          const clicks = [];
          await page.exposeFunction('recordProductClick', (detail) => clicks.push(detail));
          await page.evaluate(() => {
            window.addEventListener('thepetclub:affiliate-click', (event) => window.recordProductClick(event.detail));
            // This credential-free test checks the actual button/event without leaving the application.
            document.addEventListener('click', (event) => {
              if (event.target.closest('a[href^="https://www.amazon.ca/"]')) event.preventDefault();
            });
          });
          const cta = page.getByRole('link', { name: 'View on Amazon.ca', exact: true }).first();
          const destination = new URL(await cta.getAttribute('href'));
          assert.equal(destination.hostname, 'www.amazon.ca');
          assert.equal(destination.searchParams.get('tag'), 'thepetclub09-20');
          assert.match(destination.pathname, /\/dp\/B015P13QMM$/);
          assert.match(await cta.getAttribute('rel'), /sponsored/);
          assert.match(await cta.getAttribute('rel'), /nofollow/);
          assert.ok(await cta.isVisible());
          await cta.click();
          await page.locator('main').innerText();
          assert.deepEqual(clicks, [{ offer_id: 'amazon-catit-digger', partner: 'Amazon Canada' }], 'One affiliate event per actual click');
          assert.match(await page.locator('main').innerText(), /As an Amazon Associate I earn from qualifying purchases/);
          assert.match(await page.locator('main').innerText(), /have not tested these products/);
          result.productInteraction = 'Actual affiliate click emitted exactly one local event with verified offer ID; no GA collector configured';
          if (path.endsWith('indoor-cat-enrichment-canadian-homes') || path.startsWith('/compare/')) {
            await page.getByText('Compare the features side by side', { exact: true }).click();
            assert.equal(await page.getByRole('region', { name: 'Scrollable comparison table' }).count(), 1);
          }
        }
        if (path === '/contact') {
          await page.getByLabel('Organisation (optional)', { exact: true }).fill('QA example');
          await page.getByLabel('Message', { exact: true }).fill('QA draft only; do not send.');
          await page.getByRole('button', { name: 'Prepare email draft', exact: true }).click();
          const emailDraft = page.getByRole('link', { name: 'Open email draft', exact: true });
          assert.match(await emailDraft.getAttribute('href'), /^mailto:hello@thepetclub\.ca\?subject=/);
          assert.match(await page.locator('main').innerText(), /No message has been sent/);
          result.enquiryComposer = 'Draft preparation passed; no submission or email was sent';
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
