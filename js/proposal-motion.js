/* Proposal B motion, translated from the supplied b.js without runtime dependencies.
   Trigger positions, delays, stagger and section coverage follow the reference. */
(() => {
  'use strict';
  const body = document.body;
  if (!body.classList.contains('proposal-site')) return;
  body.classList.add('proposal-enhanced');
  const all = (selector, context = document) => [...context.querySelectorAll(selector)];
  const one = selector => document.querySelector(selector);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = matchMedia('(min-width: 961px) and (min-height: 640px)');
  const header = one('[data-cab]');
  const dark = all('[data-tono="oscuro"], .page-hero, .section--dark');
  const method = one('.metodo');
  const stem = one('.planta__tallo');
  const leaves = all('.planta__hoja');
  const seeds = all('.planta__semillas path');
  const steps = all('.metodo__pasos li');
  const stemLength = stem ? stem.getTotalLength() : 0;
  const cases = all('.caso');
  const timers = new Set();
  const animations = new Map();
  const entries = [];
  const tracks = [];
  const statements = [];
  const clamp = n => Math.max(0, Math.min(1, n));
  const powerOut = (p, power = 4) => 1 - Math.pow(1 - clamp(p), power);
  // GSAP power3.out is quartic, not the earlier generic cubic-bezier approximation.
  const easeOut = `linear(${Array.from({ length: 41 }, (_, i) => powerOut(i / 40)).join(',')})`;
  let pending = false;
  let initialized = false;
  let lastFrame = 0;

  function later(callback, delay) {
    const id = setTimeout(() => { timers.delete(id); callback(); }, delay);
    timers.add(id);
  }
  function arrival(el, { y = 30, delay = 0, duration = 850, clip = false } = {}) {
    const original = ['opacity', 'visibility', 'transform', 'transition', 'clip-path']
      .map(name => [name, el.style.getPropertyValue(name)]);
    const clear = () => original.forEach(([name, value]) => {
      if (value) el.style.setProperty(name, value);
      else el.style.removeProperty(name);
    });
    el.style.transition = 'none';
    if (clip) el.style.clipPath = 'inset(100% 0% 0% 0% round 14px)';
    else { el.style.opacity = '0'; el.style.visibility = 'hidden'; el.style.transform = `translateY(${y}px)`; }
    const play = (batchDelay = 0) => {
      if (reduced.matches || !el.animate) { clear(); return; }
      const frames = clip
        ? [{ clipPath: 'inset(100% 0% 0% 0% round 14px)' }, { clipPath: 'inset(0% 0% 0% 0% round 14px)' }]
        : [{ opacity: 0, visibility: 'visible', transform: `translateY(${y}px)` }, { opacity: 1, visibility: 'visible', transform: 'translateY(0)' }];
      const animation = el.animate(frames, { duration, delay: delay + batchDelay, easing: clip ? 'cubic-bezier(.77,0,.175,1)' : easeOut, fill: 'both' });
      animations.set(animation, clear);
      animation.onfinish = () => { clear(); animations.delete(animation); animation.cancel(); };
    };
    return { play, clear };
  }
  function enter(el, viewport, callback, finish = () => {}, group = null) {
    entries.push({ el, viewport, callback, finish, group, done: false });
  }
  function batch(elements, y = 30) {
    const group = {};
    [...new Set(elements)].forEach(el => {
      const effect = arrival(el, { y });
      enter(el, .91, effect.play, effect.clear, group);
    });
  }
  function prepare(el) {
    if (el.dataset.typed) return null;
    el.dataset.typed = 'true';
    const text = el.textContent;
    el.setAttribute('aria-label', text.replace(/\s+/g, ' ').trim());
    el.textContent = '';
    const chars = [];
    text.split(/(\s+)/).forEach(word => {
      if (!word) return;
      if (/^\s+$/.test(word)) { el.append(' '); return; }
      const span = document.createElement('span');
      span.className = 'pal';
      span.setAttribute('aria-hidden', 'true');
      Array.from(word).forEach(letter => {
        const char = document.createElement('span');
        char.className = 'ch';
        char.textContent = letter;
        span.append(char);
        chars.push(char);
      });
      el.append(span);
    });
    const finish = () => chars.forEach(char => { char.classList.add('on'); char.classList.remove('cur'); });
    const play = (delay = 0) => {
      let index = 0;
      const beat = Math.max(9, Math.min(26, 1300 / chars.length));
      function tick() {
        if (reduced.matches || document.hidden) { finish(); return; }
        if (index) chars[index - 1].classList.remove('cur');
        if (index >= chars.length) return;
        chars[index++].classList.add('on', 'cur');
        if (index === chars.length) later(() => chars[index - 1].classList.remove('cur'), 900);
        else later(tick, beat);
      }
      later(tick, delay);
    };
    return { play, finish };
  }
  // The same start/end geometry as ScrollTrigger, without intercepting wheel/touch input.
  function range(el, startViewport, endViewport, startEdge = 0, endEdge = 1) {
    const rect = el.getBoundingClientRect();
    const start = rect.top + rect.height * startEdge - innerHeight * startViewport;
    const distance = rect.height * (endEdge - startEdge) + innerHeight * (startViewport - endViewport);
    return clamp(-start / Math.max(1, distance));
  }
  function track(el, start, end, apply, scrub = 0, startEdge = 0, endEdge = 1, finish = () => {}) {
    tracks.push({ el, start, end, apply, scrub, startEdge, endEdge, value: null, finish });
  }
  function selectCase(selected) {
    cases.forEach(c => {
      const open = c === selected;
      c.classList.toggle('is-open', open);
      c.querySelector('button').setAttribute('aria-expanded', String(open));
      all('.caso__mas a', c).forEach(a => { a.tabIndex = open || reduced.matches || innerWidth <= 960 ? 0 : -1; });
    });
  }
  cases.forEach(c => {
    c.querySelector('button').addEventListener('click', () => selectCase(c));
    c.addEventListener('mouseenter', () => {
      if (matchMedia('(hover: hover) and (min-width: 961px)').matches) selectCase(c);
    });
    c.addEventListener('focusin', () => selectCase(c));
  });

  function initializeMotion() {
    if (initialized) return;
    initialized = true;
    all('[data-escribe]').forEach(el => {
      const typing = prepare(el);
      if (!typing) return;
      if (el.dataset.escribe === 'inmediato') typing.play(350);
      else enter(el, .86, () => typing.play(), typing.finish);
    });
    all('[data-subraya]').forEach(el => {
      const text = el.textContent;
      const words = [];
      el.setAttribute('aria-label', text.replace(/\s+/g, ' ').trim());
      el.textContent = '';
      text.split(/(\s+)/).forEach(word => {
        if (!word) return;
        if (/^\s+$/.test(word)) { el.append(' '); return; }
        const span = document.createElement('span');
        span.textContent = word;
        span.setAttribute('aria-hidden', 'true');
        el.append(span);
        words.push(span);
      });
      const finish = () => words.forEach(word => word.style.removeProperty('opacity'));
      statements.push(finish);
      track(el, .8, .48, p => {
        const time = p * (.9 + .06 * (words.length - 1));
        words.forEach((word, i) => { word.style.opacity = String(.14 + .86 * clamp((time - .06 * i) / .9)); });
      }, .5, 0, 1, finish);
    });
    const hero = one('.portada');
    if (hero) {
      const copy = one('.portada__texto');
      const image = one('.portada__fondo img');
      const intro = image.animate([{ transform: 'scale(1.12)' }, { transform: 'scale(1)' }], { duration: 2200, easing: 'cubic-bezier(.215,.61,.355,1)' });
      animations.set(intro, () => {});
      intro.onfinish = () => { animations.delete(intro); intro.cancel(); };
      arrival(copy.querySelector('.rotulo'), { y: 12, delay: 100, duration: 700 }).play();
      all('.portada__copy, .acciones', copy).forEach((el, i) => arrival(el, { y: 22, delay: 1100 + i * 120, duration: 900 }).play());
      track(hero, 0, 0, p => { image.style.transform = `translateY(${p * 9}%) scale(${1 + p * .14})`; }, .4, 0, 1, () => image.style.removeProperty('transform'));
      track(hero, 0, .3, p => { copy.style.transform = `translateY(${-16 * p}%)`; copy.style.opacity = String(1 - p); }, .4, .3, 1, () => { copy.style.removeProperty('transform'); copy.style.removeProperty('opacity'); });
    }
    const rows = all('.fila');
    const rowList = one('.transforma__filas');
    if (rowList) {
      track(rowList, .72, .62, p => {
        const time = p * (rows.length - .1);
        rows.forEach((row, i) => {
          const done = powerOut((time - i - .5) / .4, 3);
          row.style.setProperty('--hilo', String(clamp((time - i) / .6)));
          const output = row.querySelector('.tarjeta--lista');
          output.style.opacity = String(done);
          output.style.visibility = done ? 'visible' : 'hidden';
          output.style.transform = `translateX(${-26 * (1 - done)}px) scale(${.94 + .06 * done})`;
          row.querySelector('.tarjeta--pendiente').style.opacity = String(1 - .5 * clamp((time - i - .5) / .4));
        });
      }, .5, 0, 1, () => rows.forEach(row => {
        row.style.removeProperty('--hilo');
        all('.tarjeta', row).forEach(card => ['opacity', 'visibility', 'transform'].forEach(name => card.style.removeProperty(name)));
      }));
    }
    batch(cases, 46);
    all('.caso__imagen img').forEach(img => track(img.parentElement, 1, 0, p => {
      img.style.transform = `translateY(${-5 + p * 10}%) scale(${1.2 - p * .14})`;
    }, .3, 0, 1, () => img.style.removeProperty('transform')));
    all('[data-cifra]').forEach(el => {
      const text = el.textContent;
      const target = Number(text.replace(/[.,]/g, ''));
      const separator = (text.match(/[.,]/) || ['.'])[0];
      el.dataset.final = text;
      el.setAttribute('aria-label', text);
      el.textContent = '0';
      const finish = () => { el.textContent = text; };
      enter(el, .9, () => {
        const start = performance.now();
        function count(now) {
          if (reduced.matches || document.hidden) { finish(); return; }
          const p = clamp((now - start) / 1500);
          el.textContent = String(Math.round(target * powerOut(p, 3))).replace(/\B(?=(\d{3})+(?!\d))/g, separator);
          if (p < 1) requestAnimationFrame(count);
          else finish();
        }
        requestAnimationFrame(count);
      }, finish);
    });
    all('.producto__imagen img, .showcase-art img, .product-example-art img, .case-card__visual').forEach(img => track(img.parentElement, 1, 0, p => {
      img.style.transform = `translateY(${-3 + p * 6}%) scale(${1.14 - p * .11})`;
    }, .3, 0, 1, () => img.style.removeProperty('transform')));
    batch(all('[data-aparece]'));
    all('.equipo__personas img, .team-portrait').forEach((img, i) => {
      const effect = arrival(img, { clip: true, duration: 1150, delay: (i % 4) * 80 });
      enter(img, .9, effect.play, effect.clear);
    });
    if (body.classList.contains('interior')) {
      const heroContent = one('.page-hero .container');
      if (heroContent) {
        const typing = prepare(heroContent.querySelector('h1'));
        if (typing) typing.play(250);
        all(':scope > :not(h1)', heroContent).forEach((el, i) => arrival(el, { y: 20, delay: 500 + i * 100, duration: 900 }).play());
      }
      const detail = one('.case-detail > .container');
      const detailIntro = detail ? all(':scope > :nth-child(-n+4)', detail) : [];
      if (detail) {
        const h1 = detail.querySelector('h1');
        if (h1) { const typing = prepare(h1); if (typing) typing.play(250); }
        detailIntro.filter(el => el !== h1).forEach((el, i) => arrival(el, { y: 16, delay: 300 + i * 100, duration: 900 }).play());
      }
      all('.section > .container > h2, .showcase-copy h2, .product-example h2, .case-library h2, .dark-inner h2').forEach(h => {
        const typing = prepare(h);
        if (typing) enter(h, .88, () => typing.play(), typing.finish);
      });
      const selectors = ['.section > .container > p', '.section > .container > h3', '.section > .container > ul', '.section > .container > ol:not(.steps):not(.study-phases)', '.section > .container > table', '.section > .container > .text-link', '.section > .container > .case-back', '.feature-card', '.radar-plan', '.faq-section details', '.team-card', '.case-card', '.showcase', '.product-example > *', '.steps li', '.product-note', '.dark-inner p', '.dark-inner .btn'];
      batch(selectors.flatMap(selector => all(selector)).filter(el => !detailIntro.includes(el)));
      const phases = one('.study-phases');
      if (phases) {
        phases.classList.add('is-live');
        const items = all('li', phases);
        track(phases, .68, .62, p => {
          phases.classList.add('is-live');
          phases.style.setProperty('--fases', String(p));
          items.forEach((li, i) => li.classList.toggle('is-on', p >= i / (items.length - 1) - .01));
        }, .4, 0, 1, () => {
          phases.classList.remove('is-live');
          phases.style.removeProperty('--fases');
          items.forEach(li => li.classList.add('is-on'));
        });
        batch(items, 22);
      }
    }
  }

  function finishMotion() {
    timers.forEach(clearTimeout);
    timers.clear();
    animations.forEach((clear, animation) => { clear(); animation.cancel(); });
    animations.clear();
    entries.forEach(entry => { entry.finish(); entry.done = true; });
    all('.ch').forEach(char => char.classList.add('on'));
    all('.cur').forEach(char => char.classList.remove('cur'));
    all('[data-cifra]').forEach(el => { if (el.dataset.final) el.textContent = el.dataset.final; });
    tracks.forEach(item => item.finish());
    statements.forEach(finish => finish());
  }
  function update(now = performance.now()) {
    pending = false;
    const dt = Math.min(.1, Math.max(.016, (now - lastFrame) / 1000));
    lastFrame = now;
    let settling = false;
    if (header) {
      header.classList.toggle('is-fija', scrollY > 40 || (body.classList.contains('interior') && !one('.page-hero')));
      header.classList.toggle('is-oscura', dark.some(section => {
        const rect = section.getBoundingClientRect();
        return rect.top <= 44 && rect.bottom > 44;
      }));
    }
    if (method) {
      const rect = method.getBoundingClientRect();
      const pinned = desktop.matches && !reduced.matches;
      const p = reduced.matches ? 1 : pinned ? clamp(-rect.top / (rect.height - innerHeight)) : range(one('[data-planta]'), .88, .72);
      steps.forEach((step, i) => step.classList.toggle('is-on', !pinned || i === Math.min(3, Math.floor(Math.max(0, p - .08) / .215))));
      const growth = clamp((p - .2) / .72);
      stem.style.strokeDasharray = String(stemLength);
      stem.style.strokeDashoffset = String(stemLength * (1 - growth));
      leaves.forEach((leaf, i) => {
        leaf.style.transformBox = 'view-box'; leaf.style.transformOrigin = '0px 0px';
        leaf.style.transform = `scale(${clamp((growth - [.37, .57, .76, .91][i]) / .08)})`;
      });
      seeds.forEach((seed, i) => {
        const drop = clamp((p - i * .035) / .15);
        seed.style.transform = `translateY(${-150 * (1 - drop)}px)`;
        seed.style.opacity = reduced.matches ? '0' : String(drop * (1 - clamp((p - .17) / .08)));
      });
    }
    if (!reduced.matches && !document.hidden) {
      const batches = new Map();
      entries.forEach(entry => {
        if (entry.done || entry.el.getBoundingClientRect().top > innerHeight * entry.viewport) return;
        entry.done = true;
        const stagger = entry.group ? (batches.get(entry.group) || 0) : 0;
        if (entry.group) batches.set(entry.group, stagger + 90);
        entry.callback(stagger);
      });
      tracks.forEach(item => {
        const target = range(item.el, item.start, item.end, item.startEdge, item.endEdge);
        if (item.value === null || !item.scrub) item.value = target;
        else {
          item.value += (target - item.value) * (1 - Math.exp(-dt * 5 / item.scrub));
          if (Math.abs(target - item.value) < .0001) item.value = target;
          else settling = true;
        }
        item.apply(item.value);
      });
      all('[data-luz], .page-hero, .section--dark').forEach(section => {
        const p = range(section, 1, 0);
        section.style.setProperty('--luz-x', `${14 + p * 62}%`);
        section.style.setProperty('--luz-y', `${24 + p * 46}%`);
      });
    }
    if (settling) schedule();
  }
  function schedule() {
    if (pending || document.hidden) return;
    pending = true;
    requestAnimationFrame(update);
  }
  function configure() {
    body.classList.toggle('motion-active', !reduced.matches);
    body.classList.toggle('method-pinned', desktop.matches && !reduced.matches);
    if (reduced.matches) finishMotion();
    else initializeMotion();
    selectCase(cases.find(c => c.classList.contains('is-open')) || cases[0]);
    schedule();
  }
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', configure);
  addEventListener('load', schedule);
  if (document.fonts) document.fonts.ready.then(schedule);
  reduced.addEventListener('change', configure);
  desktop.addEventListener('change', configure);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { pending = false; finishMotion(); }
    else schedule();
  });
  const links = all('.service-links a');
  if (links.length && 'IntersectionObserver' in window) {
    const indexObserver = new IntersectionObserver(items => {
      items.filter(item => item.isIntersecting).forEach(item => {
        links.forEach(link => {
          const active = link.hash === `#${item.target.id}`;
          link.classList.toggle('is-on', active);
          if (active) {
            link.setAttribute('aria-current', 'true');
            const nav = link.parentElement;
            nav.scrollLeft = link.offsetLeft - nav.clientWidth / 2 + link.offsetWidth / 2;
          } else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-35% 0px -60% 0px' });
    links.forEach(link => { const target = document.getElementById(link.hash.slice(1)); if (target) indexObserver.observe(target); });
  }
  configure();
})();
