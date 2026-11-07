// Compare the actual proposal and integrated site, not just their lack of errors.
// Requires an external Playwright installation and both folders served locally.
// PLAYWRIGHT_PATH=/path/to/playwright node scripts/check-proposal-fidelity.cjs
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const site = process.env.SITE_URL || 'http://localhost:8765';
const reference = process.env.REFERENCE_URL || 'http://localhost:8766';
const routes = ['index.html'];
for (const lang of ['es', 'en', 'cat']) {
  for (const file of fs.readdirSync(lang, { recursive: true })) {
    if (file.endsWith('.html') && !file.startsWith('blog/')) routes.push(`${lang}/${file}`);
  }
}
const properties = ['display', 'position', 'color', 'backgroundColor', 'fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'marginTop', 'marginBottom', 'paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight', 'gridTemplateColumns', 'borderRadius', 'maxWidth'];
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const differences = [];
    let pairs = 0;
    for (const width of [1440, 390]) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, javaScriptEnabled: false });
      const pages = await Promise.all([context.newPage(), context.newPage()]);
      for (const route of routes) {
        const snapshots = await Promise.all(pages.map(async (page, i) => {
          await page.goto(`${i ? site : reference}/${route}`);
          return page.evaluate(async properties => {
            document.querySelectorAll('img').forEach(img => img.loading = 'eager');
            await Promise.all([340, 400, 450, 500, 550, 600, 650, 700].map(weight => document.fonts.load(`${weight} 17px Inter`, 'Aaéçà')));
            await document.fonts.ready;
            await Promise.all([...document.images].map(img => img.decode().catch(() => {})));
            return [...document.querySelectorAll('main, main *')].filter(el => !el.closest('svg')).map(el => {
              const style = getComputedStyle(el);
              const rect = el.getBoundingClientRect();
              // Deliberate accessibility fallbacks: expose all method explanations,
              // and remove nonfunctional overlay controls without JavaScript.
              const fallback = !!el.closest('.metodo__pasos, .portada__baja, .caso__boton');
              return {
                tag: el.tagName, class: el.className, text: el.textContent.trim(), fallback,
                box: fallback ? null : [rect.x, rect.y, rect.width, rect.height].map(n => Math.round(n * 10) / 10),
                style: fallback ? null : Object.fromEntries(properties.map(name => [name, style[name]]))
              };
            });
          }, properties);
        }));
        const [expected, actual] = snapshots;
        if (expected.length !== actual.length) differences.push(`${width} ${route}: DOM element count differs`);
        expected.forEach((el, i) => {
          const current = actual[i];
          if (!current) return;
          if (el.tag !== current.tag || el.text !== current.text || JSON.stringify(el.style) !== JSON.stringify(current.style) || JSON.stringify(el.box) !== JSON.stringify(current.box)) {
            differences.push({ width, route, element: `${el.tag}.${el.class}`, expected: el, actual: current });
          }
        });
        pairs++;
      }
      await context.close();
    }
    if (process.env.FIDELITY_REPORT) fs.writeFileSync(process.env.FIDELITY_REPORT, JSON.stringify(differences, null, 2));
    assert.deepEqual(differences.slice(0, 3), [], `${differences.length} reference layout/style mismatches`);

    // Motion coverage: the same headings must be prepared before they enter view.
    // In particular Services h2, showcase titles and dark closing headings were
    // completely missing from the first implementation's reveal selectors.
    const motionRoutes = ['es/services.html', 'en/services.html', 'cat/services.html', 'en/index.html', 'en/products.html', 'en/about.html', 'en/use-cases.html', 'en/products/blog-content-manager.html'];
    for (const route of motionRoutes) {
      const pages = await Promise.all([browser.newPage(), browser.newPage()]);
      const snapshots = [];
      for (const [i, page] of pages.entries()) {
        await page.route(/google-analytics|googletagmanager|chatbase/, request => request.abort());
        await page.goto(`${i ? site : reference}/${route}`);
        snapshots.push(await page.locator('main h1, main h2').evaluateAll(headings => headings.map(el => ({
          text: el.getAttribute('aria-label') || el.textContent.trim(),
          characters: el.querySelectorAll('.ch').length
        }))));
      }
      assert.deepEqual(snapshots[1], snapshots[0], `${route}: text-reveal coverage differs`);
      const current = pages[1];
      const target = current.locator('.section > .container > h2, .transforma h2').first();
      if (await target.count()) {
        await target.evaluate(el => scrollTo(0, scrollY + el.getBoundingClientRect().top - innerHeight * .3));
        await current.waitForTimeout(2500);
        assert.equal(await target.locator('.ch:not(.on)').count(), 0, `${route}: heading did not finish typing`);
        await current.emulateMedia({ reducedMotion: 'reduce' });
        await current.waitForFunction(() => !document.querySelector('.ch:not(.on), .ch.cur'));
        if (await current.locator('.study-phases').count()) {
          await current.emulateMedia({ reducedMotion: 'no-preference' });
          await current.waitForFunction(() => document.querySelector('.study-phases').classList.contains('is-live'));
        }
      }
      await Promise.all(pages.map(page => page.close()));
    }
    console.log(`PASS: ${pairs} reference/current page pairs (37 pages × desktop/mobile), matching DOM copy, computed type/layout and element geometry; ${motionRoutes.length} animated heading-coverage comparisons and completion checks.`);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exit(1); });
