// Real-browser motion checks using the Chrome DevTools Protocol; no npm dependency.
// Start a local static server and a local Chromium with --remote-debugging-port=9237.
// Run: node scripts/check-homepage-motion-browser.cjs
// Optional: SITE_URL=http://127.0.0.1:8765 CDP_URL=http://127.0.0.1:9237
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = process.env.SITE_URL || 'http://127.0.0.1:8765';
const cdp = process.env.CDP_URL || 'http://127.0.0.1:9237';
const output = path.join(__dirname, '../.impeccable/review/motion');
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  fs.mkdirSync(output, { recursive: true });
  const tab = await (await fetch(cdp + '/json/new?about:blank', { method: 'PUT' })).json();
  const socket = new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise(resolve => socket.addEventListener('open', resolve, { once: true }));
  let id = 0;
  const pending = new Map();
  const errors = [];
  socket.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    if (message.id) {
      const call = pending.get(message.id);
      pending.delete(message.id);
      message.error ? call.reject(message.error) : call.resolve(message.result);
    } else if (message.method === 'Runtime.exceptionThrown') {
      errors.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text);
    } else if (message.method === 'Network.responseReceived' && message.params.response.status >= 400) {
      errors.push(message.params.response.status + ' ' + message.params.response.url);
    }
  });
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const next = ++id;
    pending.set(next, { resolve, reject });
    socket.send(JSON.stringify({ id: next, method, params }));
  });
  const evaluate = async expression => {
    const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
    return result.result.value;
  };
  const screenshot = async name => {
    const result = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(output, name), Buffer.from(result.data, 'base64'));
  };
  const navigate = async route => {
    await send('Page.navigate', { url: base + route });
    for (let attempt = 0; attempt < 100; attempt++) {
      if (await evaluate(`!!document.querySelector('.home-cinematics')`)) return;
      await wait(30);
    }
    throw new Error('Homepage enhancements did not initialize: ' + route);
  };
  const caretState = selector => evaluate(`(()=>{
    const heading=document.querySelector(${JSON.stringify(selector)});
    const carets=[...heading.querySelectorAll('.home-type-caret')];
    return {state:heading.dataset.type,count:carets.length,position:carets[0]?.style.transform,
      legacy:[...heading.querySelectorAll('.home-type-char')].filter(character=>{
        const style=getComputedStyle(character,'::after');
        return style.content!=='none'&&style.content!=='normal'&&+style.opacity>.01;
      }).length};
  })()`);
  const report = {};
  try {
    await send('Page.enable'); await send('Page.bringToFront'); await send('Runtime.enable'); await send('Network.enable');
    // A fresh profile is still tested without loading optional services or covering the page in a modal.
    const consent = await send('Page.addScriptToEvaluateOnNewDocument', { source: `try { localStorage.setItem('tag-cookie-consent-v1', JSON.stringify({version:1,analytics:false,chat:false,savedAt:Date.now()})); } catch (_) {}` });
    await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
    await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });
    await navigate('/');
    await wait(250);
    const early = await evaluate(`({state:document.querySelector('h1').dataset.type, characters:document.querySelectorAll('h1 .home-type-char').length, visible:[...document.querySelectorAll('h1 .home-type-char')].filter(c=>+getComputedStyle(c).opacity>.9).length,label:document.querySelector('h1').getAttribute('aria-label'),hidden:document.hidden,animation:document.querySelector('h1 .home-type-char').getAnimations().map(a=>({time:a.currentTime,state:a.playState}))})`);
    assert.equal(early.state, 'on'); assert(early.visible > 0 && early.visible < early.characters, JSON.stringify(early));
    const firstCaret = await caretState('h1');
    assert.equal(firstCaret.count, 1); assert.equal(firstCaret.legacy, 0);
    await wait(80);
    const movedCaret = await caretState('h1');
    assert.equal(movedCaret.count, 1); assert.notEqual(movedCaret.position, firstCaret.position);
    await screenshot('hero-typing.png');
    await wait(1600);
    assert.equal(await evaluate(`document.querySelector('h1').dataset.type`), 'done');
    await screenshot('desktop-hero.png');
    report.typewriter = early;
    assert.equal((await caretState('h1')).count, 0, 'A completed heading must not retain a caret.');

    // A newly inserted hero canvas must stay invisible until a real frame has been drawn.
    // Test a separate canvas even on browsers where WebGL is unavailable.
    const handoff = await evaluate(`(async()=>{
      const canvas=document.createElement('canvas');
      canvas.className='home-current';
      document.querySelector('.home-hero').prepend(canvas);
      const before=getComputedStyle(canvas).opacity;
      await new Promise(requestAnimationFrame);
      canvas.classList.add('is-drawn');
      const atDraw=getComputedStyle(canvas).opacity;
      await new Promise(resolve=>setTimeout(resolve,1200));
      const after=getComputedStyle(canvas).opacity;
      canvas.remove();
      return {before:+before,atDraw:+atDraw,after:+after};
    })()`);
    assert.equal(handoff.before, 0, 'An undrawn hero canvas must be invisible.');
    assert(handoff.atDraw < .1, 'The drawn frame should fade in, not appear abruptly.');
    assert(Math.abs(handoff.after - .75) < .01, 'The hero overlay should reach its intended opacity.');
    report.heroHandoff = handoff;

    // The old per-character cursors overlapped and lingered most visibly on long headings.
    await evaluate(`document.querySelector('.home-statement').scrollIntoView({block:'center'})`);
    const caretSamples = [];
    for (let index = 0; index < 10; index++) {
      await wait(70);
      const state = await caretState('.home-statement');
      assert.equal(state.legacy, 0);
      assert.equal(state.count, state.state === 'on' ? 1 : 0, JSON.stringify(state));
      caretSamples.push(state);
      if (index === 4) await screenshot('long-heading-single-caret.png');
    }
    assert(caretSamples.filter(sample => sample.state === 'on').length >= 5);
    await wait(1700);
    assert.equal((await caretState('.home-statement')).count, 0);
    await screenshot('long-heading-finished.png');
    report.carets = { hero: [firstCaret, movedCaret], longHeading: caretSamples, completed: 0 };
    await evaluate('scrollTo(0,0)');
    await wait(100);

    assert.equal(await evaluate(`document.querySelectorAll('.home-ambient-toggle').length`), 0, 'Background pause controls must not be added to the hero or footer.');
    const available = await evaluate(`document.querySelectorAll('.home-current.is-drawn').length>0`);
    report.webglAvailable = available;
    if (available) {
      const before = await evaluate(`document.querySelector('.home-current').toDataURL()`);
      await wait(400);
      const after = await evaluate(`document.querySelector('.home-current').toDataURL()`);
      assert.notEqual(before, after, 'The shader must actually change its pixels, not just exist.');
      report.ambient = 'changing pixels verified';
    }

    await evaluate(`document.querySelector('.home-case-grid').scrollIntoView({block:'center'})`);
    await wait(180);
    const midCount = await evaluate(`[...document.querySelectorAll('.home-case-metric .home-counter-value')].map(n=>n.textContent)`);
    assert(midCount.some(n => Number(n.replace(/[.,]/g,'')) > 0 && Number(n.replace(/[.,]/g,'')) < 1092));
    await screenshot('cases-counting.png');
    await wait(1700);
    const finalCounts = await evaluate(`[...document.querySelectorAll('.home-case-metric .home-counter-value')].map(n=>n.textContent)`);
    assert.deepEqual(finalCounts, ['1.092', '915', '690', '230']);
    const initialWidths = await evaluate(`[...document.querySelectorAll('.home-case-panel')].map(n=>Math.round(n.getBoundingClientRect().width))`);
    assert(initialWidths[0] > initialWidths[1] * 2);
    await evaluate(`document.querySelectorAll('.home-case-expand')[2].click()`);
    await wait(300);
    await screenshot('cases-expanding.png');
    await wait(600);
    const nextWidths = await evaluate(`[...document.querySelectorAll('.home-case-panel')].map(n=>Math.round(n.getBoundingClientRect().width))`);
    assert(nextWidths[2] > nextWidths[0] * 2);
    assert.equal(await evaluate(`document.querySelectorAll('.home-case-expand')[2].getAttribute('aria-expanded')`), 'true');
    await evaluate(`document.querySelectorAll('.home-case-expand')[1].focus()`);
    await wait(750);
    assert.equal(await evaluate(`document.querySelectorAll('.home-case')[1].tabIndex`), 0);
    await screenshot('desktop-examples.png');
    report.counters = { midCount, finalCounts };
    report.panels = { initialWidths, nextWidths, keyboard: true };

    const method = await evaluate(`(()=>{const r=document.querySelector('.home-method').getBoundingClientRect();return{top:r.top+scrollY,height:r.height}})()`);
    report.plant = [];
    for (const progress of [.05, .12, .21, .32, .61, .94]) {
      await evaluate(`scrollTo(0,${method.top - 84 + progress * (method.height - 1000 + 84)})`);
      await wait(200);
      const state = await evaluate(`({growth:+document.querySelector('.home-plant').dataset.growth,offset:+document.querySelector('.home-plant-stem').style.strokeDashoffset,leaves:[...document.querySelectorAll('.home-plant-leaves path')].map(n=>+n.style.opacity),seeds:[...document.querySelectorAll('.home-plant-seeds path')].map(n=>({opacity:+n.style.opacity,transform:n.getAttribute('transform')})),alignment:getComputedStyle(document.querySelector('.home-plant')).alignSelf})`);
      assert(Math.abs(state.growth - progress) < .02);
      report.plant.push(state);
      await screenshot('plant-' + Math.round(progress * 100) + '.png');
    }
    assert.equal(report.plant[0].alignment, 'center');
    assert(report.plant[0].seeds.every(seed => seed.opacity > 0));
    assert.notEqual(report.plant[0].seeds[0].transform, report.plant[1].seeds[0].transform);
    assert(report.plant[2].seeds.every(seed => seed.opacity === 0));
    assert(Math.abs(report.plant[0].offset - report.plant[2].offset) < 1, 'Stem must wait for the chevrons to enter the pot.');
    assert(report.plant[2].offset > report.plant[5].offset);
    assert(report.plant[5].leaves.every(opacity => opacity > .8));

    await evaluate(`document.querySelector('.home-workflow').scrollIntoView({block:'center'})`);
    await wait(350);
    assert(await evaluate(`document.getAnimations().some(a=>a.effect.target.closest('.task-row'))`));
    await screenshot('workflow-in-progress.png');
    await wait(1600);
    await screenshot('desktop-workflow.png');
    report.workflow = 'Staggered input, connector, result and check animations verified';

    // Preference changes midway through typing/counting must immediately expose the final, readable state.
    await evaluate(`document.querySelector('.home-services h2').scrollIntoView({block:'center'})`);
    await wait(120);
    assert.equal((await caretState('.home-services h2')).count, 1);
    await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
    for (let attempt = 0; attempt < 40; attempt++) {
      if (await evaluate(`document.querySelectorAll('[data-type="ready"],[data-type="on"]').length===0`)) break;
      await wait(50);
    }
    assert.equal(await evaluate(`document.querySelectorAll('[data-type="ready"],[data-type="on"]').length`), 0, JSON.stringify({errors,state:await evaluate(`({classes:document.body.className,motion:document.body.dataset.cinematicMotion,reduced:matchMedia('(prefers-reduced-motion: reduce)').matches,ready:[...document.querySelectorAll('[data-type="ready"]')].map(n=>n.textContent)})`)}));
    assert.equal(await evaluate(`document.querySelectorAll('.home-type-caret').length`), 0, 'Reduced motion must remove active carets immediately.');
    assert.equal(await evaluate(`document.querySelectorAll('.has-case-panels').length`), 0);
    assert.equal(await evaluate(`document.querySelectorAll('.method-step[open]').length`), 4);
    assert.equal(await evaluate(`document.querySelector('.home-plant').dataset.growth`), '1.000');
    assert(await evaluate(`[...document.querySelectorAll('.home-plant-seeds path')].every(seed=>+seed.style.opacity===0)`));
    assert(await evaluate(`[...document.querySelectorAll('.home-current')].every(n=>getComputedStyle(n).display==='none')`));
    await evaluate(`document.querySelector('.home-case-grid').scrollIntoView({block:'center'})`);
    await screenshot('reduced-motion.png');
    report.reduced = 'Complete text/figures/method, static full plant, no background or expanding panels';
    await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });

    // Batched responsive and localized checks, including the previously approved static mobile layout.
    report.viewports = [];
    for (const width of [1440, 1024, 768, 390, 320]) {
      await send('Emulation.setDeviceMetricsOverride', { width, height: width > 900 ? 1000 : 844, deviceScaleFactor: 1, mobile: width <= 640 });
      for (const route of ['/', '/es/index.html', '/en/index.html', '/cat/index.html']) {
        await navigate(route); await wait(1700);
        const state = await evaluate(`({overflow:document.documentElement.scrollWidth>innerWidth,headings:document.querySelectorAll('h1').length,cases:document.querySelectorAll('.home-case-panel').length,products:document.querySelectorAll('.home-product').length,backgroundControls:document.querySelectorAll('.home-ambient-toggle').length,carets:document.querySelectorAll('h1 .home-type-caret').length,hiddenHeadings:[...document.querySelectorAll('h1 .home-type-char')].filter(n=>+getComputedStyle(n).opacity<1).length})`);
        assert(!state.overflow && state.headings === 1 && state.cases === 4 && state.products === 3 && state.backgroundControls === 0 && state.carets === 0 && state.hiddenHeadings === 0, JSON.stringify({width,route,...state}));
        report.viewports.push({width,route,...state});
        if (width === 390 && route === '/') {
          await screenshot('mobile-hero.png');
          await evaluate(`document.querySelector('.home-method').scrollIntoView({block:'start'})`); await wait(1800);
          await screenshot('mobile-method.png');
        }
      }
    }

    // WebGL failure is not allowed to break typography, examples, form, or navigation.
    const fallback = await send('Page.addScriptToEvaluateOnNewDocument', { source: `const originalContext = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function(type,...args){return type==='webgl'?null:originalContext.call(this,type,...args)};` });
    await navigate('/en/index.html'); await wait(1700);
    assert.equal(await evaluate(`document.querySelectorAll('.home-current').length`), 0);
    assert.equal(await evaluate(`document.querySelector('h1').dataset.type`), 'done');
    assert(await evaluate(`!!document.querySelector('#contact .meeting-request')`));
    await send('Page.removeScriptToEvaluateOnNewDocument', { identifier: fallback.identifier });
    report.noWebGL = 'Readable homepage and contact form intact';
    await send('Emulation.setScriptExecutionDisabled', { value: true });
    await send('Page.navigate', { url: base + '/en/index.html' }); await wait(800);
    await send('Emulation.setScriptExecutionDisabled', { value: false });
    assert.equal(await evaluate(`document.body.classList.contains('home-cinematics')`), false);
    assert.equal(await evaluate(`document.querySelectorAll('.method-step[open]').length`), 4);
    assert.equal(await evaluate(`document.querySelectorAll('.home-case').length`), 4);
    report.noJS = 'Original static content, examples, open method and native form retained';
    await send('Page.removeScriptToEvaluateOnNewDocument', { identifier: consent.identifier });
    assert.deepEqual(errors, []);
    report.errors = errors;
    fs.writeFileSync(path.join(output, 'checks.json'), JSON.stringify(report, null, 2));
    console.log('PASS: typewriter, counters, panel expansion, botanical drawing, workflow sequence, no background buttons, 20 responsive/localized views and fallbacks.');
    console.log(JSON.stringify({webglAvailable:available, counters:report.counters, panels:report.panels,errors},null,2));
  } finally {
    await send('Page.close').catch(() => {});
    socket.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
