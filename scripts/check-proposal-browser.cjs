// Optional browser regression check; uses an externally installed Playwright.
// Serve the repo, then: PLAYWRIGHT_PATH=/path/to/playwright node scripts/check-proposal-browser.cjs
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const base = process.env.SITE_URL || 'http://localhost:8765';
const pages = ['index.html'];
for (const lang of ['es', 'en', 'cat']) {
  for (const file of fs.readdirSync(lang, { recursive: true })) {
    if (file.endsWith('.html') && !file.startsWith('blog/')) pages.push(`${lang}/${file}`);
  }
}
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const failures = [];
  let checks = 0;
  for (const mode of ['desktop', 'mobile', 'reduced', 'no-js']) {
    const context = await browser.newContext({
      viewport: mode === 'mobile' ? { width: 390, height: 844 } : { width: 1440, height: 900 },
      reducedMotion: mode === 'reduced' ? 'reduce' : 'no-preference', javaScriptEnabled: mode !== 'no-js'
    });
    await context.route(/google-analytics|googletagmanager|chatbase/, route => route.abort());
    const page = await context.newPage();
    let current;
    page.on('pageerror', error => failures.push(`${current} ${mode}: ${error.message}`));
    page.on('response', response => {
      if (response.url().startsWith(base) && response.status() >= 400) failures.push(`${current}: HTTP ${response.status()} ${response.url()}`);
    });
    for (current of pages) {
      await page.goto(`${base}/${current}`, { waitUntil: 'load' });
      await page.evaluate(async () => {
        document.querySelectorAll('img[loading="lazy"]').forEach(img => img.loading = 'eager');
        await document.fonts.ready;
        await Promise.all([...document.images].map(img => img.decode().catch(() => {})));
      });
      const state = await page.evaluate(staticMode => ({
        overflow: document.documentElement.scrollWidth > innerWidth,
        broken: [...document.images].filter(img => !img.naturalWidth).map(img => img.src),
        heading: document.querySelector('h1').textContent.trim(),
        hidden: staticMode ? [...document.querySelectorAll('h1,h2')].filter(el => getComputedStyle(el).visibility === 'hidden').length : 0,
        noindex: !!document.querySelector('meta[name="robots"][content*="noindex"]'),
        vendor: !!document.querySelector('script[src*="vendor/"]')
      }), mode === 'reduced' || mode === 'no-js');
      if (state.overflow || state.broken.length || state.hidden || state.noindex || state.vendor || !state.heading) failures.push(`${current} ${mode}: ${JSON.stringify(state)}`);
      checks++;
    }
    await context.close();
  }
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.route(/google-analytics|googletagmanager|chatbase/, route => route.abort());
  for (const lang of ['es', 'en', 'cat']) {
    await page.goto(`${base}/${lang}/index.html`);
    await page.locator('.cookie-consent .btn').first().click();
    await page.waitForTimeout(1600);
    for (const [progress, expected] of [[.05, 0], [.5, 1], [.95, 3]]) {
      await page.evaluate(progress => {
        const method = document.querySelector('.metodo');
        scrollTo(0, method.offsetTop + (method.offsetHeight - innerHeight) * progress);
      }, progress);
      await page.waitForFunction(expected => [...document.querySelectorAll('.metodo__pasos li')]
        .findIndex(step => step.classList.contains('is-on')) === expected, expected);
      assert.notEqual(await page.locator('.metodo__pasos h3').first().evaluate(el =>
        getComputedStyle(el).color), 'rgb(23, 42, 37)');
    }
    await page.mouse.move(0, 0);
    await page.locator('.caso').nth(2).scrollIntoViewIfNeeded();
    await page.waitForTimeout(1300);
    await page.locator('.caso').nth(2).locator('button').focus();
    await page.keyboard.press('Enter');
    assert.equal(await page.locator('.caso').nth(2).locator('button').getAttribute('aria-expanded'), 'true');
    await page.locator('form').evaluate(el => scrollTo(0, scrollY + el.getBoundingClientRect().top - innerHeight * .2));
    await page.locator('form #contact-name').fill('Browser test');
    await page.locator('form #contact-email').fill('test@example.com');
    await page.locator('form #contact-goals').fill('Testing the contact flow without sending a real request.');
    let posted = false;
    await page.route('https://formspree.io/**', async route => {
      posted = true;
      assert.equal(route.request().method(), 'POST');
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
    });
    await page.locator('form button[type="submit"]').click();
    await page.waitForFunction(() => document.querySelector('form').dataset.submitting !== 'true' && document.getElementById('contact-status').textContent.length > 0);
    assert.ok(posted);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    assert.equal(await page.locator('body').evaluate(el => el.classList.contains('method-pinned')), false);
    assert.equal(await page.locator('.metodo__pasos li.is-on').count(), 4);
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.setViewportSize({ width: 320, height: 568 });
    await page.locator('.mobile-menu summary').click();
    assert.equal(await page.locator('.mobile-menu').getAttribute('open'), '');
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('.mobile-menu').getAttribute('open'), null);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.evaluate(() => localStorage.clear());
  }
  await browser.close();
  assert.deepEqual(failures, []);
  console.log(`PASS: ${checks} page/mode checks, three localized mocked form submissions, case panels, botanical scroll steps, live reduced-motion changes, mobile navigation and 320px overflow.`);
})().catch(error => { console.error(error); process.exit(1); });
