// Reference-led homepage motion. Native scrolling, local assets, no dependencies.
(function () {
  'use strict';
  const home = document.querySelector('.garden-home');
  if (!home) return;
  const body = document.body;
  const reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const reduced = { matches: reducedQuery.matches };
  const desktop = window.matchMedia('(min-width: 1101px)');
  const pinned = window.matchMedia('(min-width: 901px) and (min-height: 681px)');
  const language = document.documentElement.lang.split('-')[0];
  const labels = {
    es: { expand: 'Mostrar ejemplo: ' },
    en: { expand: 'Expand example: ' },
    ca: { expand: 'Mostra l’exemple: ' }
  }[language] || { expand: 'Expand example: ' };
  const ease = 'cubic-bezier(.16,1,.3,1)';
  const clamp = value => Math.max(0, Math.min(1, value));
  const counters = [];
  const runningCounters = new Set();
  const oneShots = new Map();
  const animations = new Set();
  const typed = [];
  const typing = new Set();
  let frame = 0;
  let lastFrame = 0;
  let lastDraw = -Infinity;
  let elapsed = 0;
  let renderer = null;
  let ambientInitTimer = 0;
  let surfaces = [];

  // The default CSS and original text stay complete if any enhancement is unavailable.
  function animate(element, keyframes, options) {
    if (reduced.matches || !element.animate) return;
    const animation = element.animate(keyframes, options);
    animations.add(animation);
    animation.finished.then(() => animations.delete(animation), () => animations.delete(animation));
  }

  function observeOnce(element, play) {
    if (!element) return;
    if (!('IntersectionObserver' in window)) return; // The default is the complete static state.
    oneShots.set(element, play);
    entranceObserver.observe(element);
  }
  const entranceObserver = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entranceObserver.unobserve(entry.target);
      const play = oneShots.get(entry.target);
      oneShots.delete(entry.target);
      if (!reduced.matches && play) play();
    });
  }, { threshold: .25, rootMargin: '0px 0px -5% 0px' }) : null;

  // Whole words retain their wrapping; one visual character and a travelling caret arrive per beat.
  // The heading's accessible name stays a single unchanged sentence, never a stream of characters.
  function prepareType(heading) {
    const text = heading.textContent.trim();
    if (!text) return;
    heading.setAttribute('aria-label', text);
    const visual = document.createElement('span');
    visual.className = 'home-type-visual';
    visual.setAttribute('aria-hidden', 'true');
    const count = Array.from(text).length;
    const interval = Math.min(32, 1450 / Math.max(1, count));
    const characters = [];
    let index = 0;
    text.split(/(\s+)/).forEach(token => {
      if (/^\s+$/.test(token)) { visual.appendChild(document.createTextNode(token)); index += token.length; return; }
      const word = document.createElement('span');
      word.className = 'home-type-word';
      Array.from(token).forEach(character => {
        const span = document.createElement('span');
        span.className = 'home-type-char';
        span.textContent = character;
        const delay = Math.round(index++ * interval);
        span.style.setProperty('--char-delay', delay + 'ms');
        characters.push({ span, delay });
        word.appendChild(span);
      });
      visual.appendChild(word);
    });
    heading.replaceChildren(visual);
    const caret = document.createElement('span');
    caret.className = 'home-type-caret';
    caret.setAttribute('aria-hidden', 'true');
    const last = characters[characters.length - 1];
    const record = { heading, caret, characters, duration: last.delay + 120, played: false, started: 0, clock: null };
    typed.push(record);
    observeOnce(heading, () => {
      record.played = true;
      record.started = performance.now();
      heading.dataset.type = 'on';
      // One real caret per heading, outside the individual letters' opacity animations.
      heading.appendChild(caret);
      record.clock = typeof last.span.getAnimations === 'function'
        ? last.span.getAnimations().find(animation => animation.animationName === 'home-char-in') : null;
      typing.add(record);
      if (record.clock) {
        record.clock.finished.then(() => finishType(record), () => {
          if (typing.has(record)) finishType(record);
        });
      }
      updateCaret(record, 0);
      requestTick();
    });
    heading.dataset.type = reduced.matches ? 'done' : 'ready';
  }
  function finishType(record) {
    record.caret.remove();
    record.heading.dataset.type = 'done';
    record.clock = null;
    typing.delete(record);
  }
  function updateCaret(record, time) {
    let current = record.characters[0];
    for (const character of record.characters) {
      if (character.delay > time) break;
      current = character;
    }
    const heading = record.heading.getBoundingClientRect();
    const character = current.span.getBoundingClientRect();
    record.caret.style.transform = `translate(${character.right - heading.left}px, ${character.top - heading.top}px)`;
  }
  if (entranceObserver) {
    home.querySelectorAll('h1, .home-statement, .home-method-copy h2, .home-workflow h2, .home-section-heading h2, .home-services > .container > h2, .home-team-copy h2, .home-faq h2, .home-contact h2').forEach(prepareType);
  }

  // The final-width ghost prevents figure changes from moving either the units or the layout.
  // Only the visual digits change; assistive technology retains the original final text and unit.
  home.querySelectorAll('.home-case-metric, .home-timing-value').forEach(element => {
    const node = Array.from(element.childNodes).find(child => child.nodeType === 3 && /\d/.test(child.nodeValue));
    if (!node) return;
    const source = node.nodeValue;
    const visual = document.createElement('span');
    visual.className = 'home-counter-run';
    visual.setAttribute('aria-hidden', 'true');
    const digits = [];
    let previous = 0;
    source.replace(/\d[\d.,]*/g, (final, at) => {
      visual.appendChild(document.createTextNode(source.slice(previous, at)));
      const slot = document.createElement('span');
      slot.className = 'home-counter-slot';
      slot.dataset.final = final;
      const value = document.createElement('span');
      value.className = 'home-counter-value';
      value.textContent = final;
      slot.appendChild(value);
      visual.appendChild(slot);
      digits.push({ value, final, target: Number(final.replace(/[.,]/g, '')), separator: final.includes(',') ? ',' : final.includes('.') ? '.' : '' });
      previous = at + final.length;
    });
    visual.appendChild(document.createTextNode(source.slice(previous)));
    const spoken = document.createElement('span');
    spoken.className = 'home-motion-sr';
    spoken.textContent = source;
    node.replaceWith(visual, spoken);
    const record = { element, digits, time: 0, played: false };
    counters.push(record);
    observeOnce(element, () => {
      record.played = true;
      record.time = 0;
      element.dataset.count = 'on';
      runningCounters.add(record);
      digits.forEach(digit => { digit.value.textContent = '0'; });
      requestTick();
    });
  });
  function completeCounter(counter) {
    counter.digits.forEach(digit => { digit.value.textContent = digit.final; });
    counter.element.dataset.count = 'done';
    runningCounters.delete(counter);
  }
  function format(digit, value) {
    return digit.separator ? String(value).replace(/\B(?=(\d{3})+(?!\d))/g, digit.separator) : String(value);
  }

  // Images have their own downward, soft-focus arrival; titles do not share this treatment.
  home.querySelectorAll('.home-case > img, .home-product-image, .home-person .team-portrait').forEach((element, index) => {
    observeOnce(element, () => animate(element, [
      { opacity: 0, transform: 'translateY(-24px) scale(1.035)', filter: 'blur(4px)' },
      { opacity: 1, transform: 'translateY(0) scale(1)', filter: 'blur(0px)' }
    ], { duration: 950, delay: index % 4 * 75, easing: ease, fill: 'backwards' }));
  });
  const workflow = home.querySelector('.home-workflow');
  observeOnce(workflow, () => {
    workflow.querySelectorAll('.task-row').forEach((row, index) => {
      const delay = index * 150;
      row.classList.add('is-resolved');
      animate(row.querySelector('.task-input'), [
        { transform: 'translateX(18px) rotate(-2deg)' }, { transform: 'translateX(0) rotate(0)' }
      ], { duration: 750, delay, easing: ease, fill: 'backwards' });
      animate(row.querySelector('.task-connector'), [
        { transform: 'scaleX(0)', opacity: 0 }, { transform: 'scaleX(1)', opacity: 1 }
      ], { duration: 500, delay: delay + 170, easing: ease, fill: 'backwards' });
      animate(row.querySelector('.task-output'), [
        { transform: 'translateX(-45%) scale(.94)', opacity: 0, filter: 'blur(5px)' },
        { transform: 'translateX(0) scale(1)', opacity: 1, filter: 'blur(0)' }
      ], { duration: 800, delay: delay + 300, easing: ease, fill: 'backwards' });
      animate(row.querySelector('.task-output > svg'), [
        { transform: 'scale(0)' }, { transform: 'scale(1)' }
      ], { duration: 350, delay: delay + 650, easing: ease, fill: 'backwards' });
    });
  });

  // Real stroke growth, not an image whose top is progressively cropped away.
  const method = home.querySelector('.home-method');
  const plant = home.querySelector('.home-plant');
  const steps = Array.from(home.querySelectorAll('.method-step'));
  let botanical = null;
  let manualPlant = null;
  let scrollFrame = 0;
  if (plant) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 240 400');
    svg.setAttribute('aria-hidden', 'true');
    svg.classList.add('home-botanical');
    svg.innerHTML = '<defs><linearGradient id="home-leaf" x1="40" y1="60" x2="190" y2="250" gradientUnits="userSpaceOnUse"><stop stop-color="#a5e5bb"/><stop offset="1" stop-color="#229c78"/></linearGradient></defs>' +
      '<path class="home-plant-stem" d="M120 325c-2-55 17-74 8-122S103 130 129 49" fill="none" stroke="#8ad6af" stroke-width="3" stroke-linecap="round"/>' +
      '<g class="home-plant-leaves" fill="url(#home-leaf)" stroke="#94d7ae"><path d="M126 260c-41-2-68-24-72-58 39-2 68 18 72 58Z"/><path d="M127 235c39 0 69-22 77-55-42-5-72 16-77 55Z"/><path d="M124 179c-38-5-62-29-64-62 36 0 61 23 64 62Z"/><path d="M117 154c38 0 66-23 72-54-37-3-66 18-72 54Z"/><path d="M120 99C85 95 62 71 62 39c36 1 57 24 58 60Z"/></g>' +
      '<g class="home-plant-seeds" fill="none" stroke="#91dbb4" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M104 100 120 115 136 100"/><path d="M104 76 120 91 136 76"/></g>' +
      '<path d="M66 326h108l-19 63H85l-19-63Z" fill="#123a2e" stroke="#91dbb4" stroke-width="3" stroke-linejoin="round"/>';
    plant.appendChild(svg);
    const stem = svg.querySelector('.home-plant-stem');
    const length = stem.getTotalLength();
    stem.style.strokeDasharray = String(length);
    botanical = { stem, length, leaves: Array.from(svg.querySelectorAll('.home-plant-leaves path')),
      seeds: Array.from(svg.querySelectorAll('.home-plant-seeds path')) };
    plant.classList.add('has-botanical');
  }
  function growPlant(progress) {
    if (!botanical) return;
    // The two chevrons from the logo drop into the pot before the plant emerges.
    botanical.seeds.forEach((seed, index) => {
      const drop = clamp((progress - index * .045) / .16);
      const eased = drop * drop * (3 - 2 * drop);
      const start = index ? 76 : 100;
      seed.setAttribute('transform', `translate(0 ${(326 - start) * eased})`);
      seed.style.opacity = String(drop < .76 ? 1 : 1 - clamp((drop - .76) / .24));
    });
    const growth = clamp((progress - .21) / .79);
    botanical.stem.style.strokeDashoffset = String(botanical.length * (1 - growth));
    const origins = [[126, 260], [127, 235], [124, 179], [117, 154], [120, 99]];
    botanical.leaves.forEach((leaf, index) => {
      const amount = clamp((growth - .13 - index * .15) / .24);
      const scale = 1 - Math.pow(1 - amount, 3);
      const [x, y] = origins[index];
      leaf.setAttribute('transform', `translate(${x} ${y}) scale(${scale}) rotate(${(1 - scale) * (index % 2 ? 18 : -18)}) translate(${-x} ${-y})`);
      leaf.style.opacity = String(amount);
    });
    plant.dataset.growth = progress.toFixed(3);
  }
  function updateScroll() {
    scrollFrame = 0;
    if (!method) return;
    if (reduced.matches || !pinned.matches) { growPlant(1); return; }
    const rect = method.getBoundingClientRect();
    if (rect.bottom < 84 || rect.top > window.innerHeight) manualPlant = null;
    const progress = clamp((84 - rect.top) / Math.max(1, rect.height - window.innerHeight + 84));
    growPlant(manualPlant === null ? progress : manualPlant);
  }
  function scheduleScroll() {
    if (!scrollFrame) scrollFrame = window.requestAnimationFrame(updateScroll);
  }
  steps.forEach((step, index) => {
    step.querySelector('summary').addEventListener('click', () => {
      if (!reduced.matches && pinned.matches) { manualPlant = [.04, .37, .69, 1][index]; scheduleScroll(); }
    });
    step.addEventListener('toggle', () => {
      if (step.open && pinned.matches) animate(step.querySelector('p'), [
        { opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }
      ], { duration: 450, easing: ease });
    });
  });

  // Expand is a button; reading the actual example stays a normal link. No first-tap navigation trap.
  const caseGrid = home.querySelector('.home-case-grid');
  const panels = [];
  let activeCase = 0;
  let hoverTimer = 0;
  let movingTimer = 0;
  function selectCase(index) {
    if (!caseGrid.classList.contains('has-case-panels')) return;
    activeCase = index;
    caseGrid.style.gridTemplateColumns = panels.map((_, i) => i === index ? '2.4fr' : '1fr').join(' ');
    panels.forEach((panel, i) => {
      panel.wrapper.classList.toggle('is-active', i === index);
      panel.button.setAttribute('aria-expanded', String(i === index));
      panel.link.tabIndex = i === index ? 0 : -1;
    });
    caseGrid.classList.add('is-moving');
    window.clearTimeout(movingTimer);
    movingTimer = window.setTimeout(() => caseGrid.classList.remove('is-moving'), 720);
  }
  if (caseGrid) {
    Array.from(caseGrid.querySelectorAll('.home-case')).forEach((link, index) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'home-case-panel';
      link.before(wrapper);
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'home-case-expand';
      button.hidden = true;
      button.setAttribute('aria-label', labels.expand + link.querySelector('h3').textContent);
      link.id = 'home-example-' + (index + 1);
      button.setAttribute('aria-controls', link.id);
      button.innerHTML = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M12 5v14" stroke="currentColor" stroke-width="1.5"/></svg>';
      wrapper.append(button, link);
      button.addEventListener('click', () => selectCase(index));
      button.addEventListener('focus', () => selectCase(index));
      wrapper.addEventListener('pointerenter', event => {
        if (event.pointerType !== 'mouse') return;
        window.clearTimeout(hoverTimer);
        hoverTimer = window.setTimeout(() => selectCase(index), 100);
      });
      wrapper.addEventListener('pointerleave', () => window.clearTimeout(hoverTimer));
      panels.push({ wrapper, button, link });
    });
  }
  function configurePanels() {
    if (!caseGrid) return;
    const enabled = desktop.matches && !reduced.matches;
    caseGrid.classList.toggle('has-case-panels', enabled);
    panels.forEach(panel => { panel.button.hidden = !enabled; panel.link.removeAttribute('tabindex'); });
    if (enabled) selectCase(activeCase);
    else { caseGrid.style.removeProperty('grid-template-columns'); caseGrid.classList.remove('is-moving'); }
  }

  // An original procedural shader: drifting folds lit in the site's forest palette.
  // One shared WebGL context renders only visible bands into their own small 2D canvases.
  // No footage, raster distortion, external library or perpetual offscreen render loop is needed.
  function createRenderer() {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl', { alpha: false, antialias: false, preserveDrawingBuffer: true });
    if (!gl) return null;
    function shader(type, source) {
      const result = gl.createShader(type);
      gl.shaderSource(result, source);
      gl.compileShader(result);
      if (!gl.getShaderParameter(result, gl.COMPILE_STATUS)) { gl.deleteShader(result); return null; }
      return result;
    }
    const vertex = shader(gl.VERTEX_SHADER, 'attribute vec2 aPosition;void main(){gl_Position=vec4(aPosition,0.,1.);}');
    const fragment = shader(gl.FRAGMENT_SHADER, `precision mediump float;
      uniform vec2 uResolution,uPointer;
      uniform float uTime,uOverlay;
      void main(){
        vec2 uv=gl_FragCoord.xy/uResolution;
        vec2 p=(uv-.5)*vec2(uResolution.x/uResolution.y,1.);
        float t=uTime*.16;
        float reach=exp(-4.*dot(uv-uPointer,uv-uPointer));
        float bend=.34*sin(p.y*3.+t)+.22*sin(p.x*1.7-p.y*2.-t*.7);
        float fold=sin(p.x*5.1+p.y*2.6+bend*2.8+t+reach*.7);
        float roll=sin(p.x*2.3-p.y*1.4-t*.55);
        float sheen=pow(max(0.,fold),5.);
        vec3 forest=vec3(.06275,.18039,.14510);
        vec3 colour=forest*(.88+.16*fold+.08*roll)+vec3(.012,.06,.032)*sheen;
        vec3 veil=vec3(.49+.085*fold+.035*roll+.045*sheen);
        gl_FragColor=vec4(mix(colour,veil,uOverlay),1.);
      }`);
    if (!vertex || !fragment) return null;
    const program = gl.createProgram();
    gl.attachShader(program, vertex); gl.attachShader(program, fragment); gl.linkProgram(program);
    gl.deleteShader(vertex); gl.deleteShader(fragment);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
    gl.useProgram(program);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, 'aPosition');
    gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    const uniforms = Object.fromEntries(['uResolution', 'uPointer', 'uTime', 'uOverlay'].map(name => [name, gl.getUniformLocation(program, name)]));
    canvas.addEventListener('webglcontextlost', event => {
      event.preventDefault();
      renderer = null;
      surfaces.forEach(surface => { surface.canvas.hidden = true; });
    });
    return { canvas, gl, uniforms };
  }
  function prepareAmbient() {
    renderer = createRenderer();
    if (!renderer) return;
    home.querySelectorAll('.home-hero, .home-method, .home-timings, .home-contact').forEach(element => {
      const canvas = document.createElement('canvas');
      canvas.className = 'home-current';
      canvas.setAttribute('aria-hidden', 'true');
      const context = canvas.getContext('2d', { alpha: false });
      if (!context) return;
      element.prepend(canvas);
      element.classList.add('has-current');
      const surface = { element, canvas, context, visible: false, overlay: element.classList.contains('home-hero'), x: .5, y: .5, targetX: .5, targetY: .5, width: 0, height: 0 };
      surfaces.push(surface);
      element.addEventListener('pointermove', event => {
        if (event.pointerType !== 'mouse') return;
        const rect = element.getBoundingClientRect();
        surface.targetX = clamp((event.clientX - rect.left) / rect.width);
        surface.targetY = 1 - clamp((event.clientY - rect.top) / rect.height);
      }, { passive: true });
      element.addEventListener('pointerleave', () => { surface.targetX = surface.targetY = .5; });
    });
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const surface = surfaces.find(item => item.element === entry.target);
        surface.visible = entry.isIntersecting;
      });
      requestTick();
    });
    surfaces.forEach(surface => observer.observe(surface.element));
  }
  function canDraw() {
    return renderer && !reduced.matches && surfaces.some(surface => surface.visible);
  }
  function requestTick() {
    if (!frame && !document.hidden && !reduced.matches && (typing.size || runningCounters.size || canDraw())) {
      lastFrame = performance.now();
      frame = window.requestAnimationFrame(tick);
    }
  }
  function tick(now) {
    frame = 0;
    if (document.hidden || reduced.matches) return;
    const dt = Math.min(64, Math.max(0, now - lastFrame));
    lastFrame = now;
    typing.forEach(record => {
      // Use the letters' CSS clock, so delayed frames cannot leave the caret behind.
      const time = record.clock && record.clock.currentTime !== null
        ? record.clock.currentTime : now - record.started;
      if ((record.clock && record.clock.playState === 'finished') || time >= record.duration) finishType(record);
      else updateCaret(record, time);
    });
    runningCounters.forEach(counter => {
      counter.time += dt;
      const progress = clamp(counter.time / 1500);
      const amount = 1 - Math.pow(1 - progress, 4);
      counter.digits.forEach(digit => { digit.value.textContent = format(digit, Math.round(digit.target * amount)); });
      if (progress === 1) completeCounter(counter);
    });
    if (canDraw() && now - lastDraw >= 32) {
      elapsed += (now - lastDraw < 100 ? now - lastDraw : 33) / 1000;
      lastDraw = now;
      drawSurfaces();
    }
    if (typing.size || runningCounters.size || canDraw()) frame = window.requestAnimationFrame(tick);
  }
  function drawSurfaces() {
    const { gl, canvas, uniforms } = renderer;
    surfaces.forEach(surface => {
      if (!surface.visible) return;
      if (!surface.width) {
        const rect = surface.element.getBoundingClientRect();
        surface.width = Math.max(1, Math.min(640, Math.round(rect.width / 3)));
        surface.height = Math.max(1, Math.min(480, Math.round(rect.height / 3)));
      }
      const width = surface.width, height = surface.height;
      if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
      if (surface.canvas.width !== width || surface.canvas.height !== height) { surface.canvas.width = width; surface.canvas.height = height; }
      surface.x += (surface.targetX - surface.x) * .12;
      surface.y += (surface.targetY - surface.y) * .12;
      gl.viewport(0, 0, width, height);
      gl.uniform2f(uniforms.uResolution, width, height);
      gl.uniform2f(uniforms.uPointer, surface.x, surface.y);
      gl.uniform1f(uniforms.uTime, elapsed);
      gl.uniform1f(uniforms.uOverlay, surface.overlay ? 1 : 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      surface.context.drawImage(canvas, 0, 0);
      surface.canvas.classList.add('is-drawn');
    });
  }

  function configureMotion() {
    body.dataset.cinematicMotion = reduced.matches ? 'reduced' : 'full';
    animations.forEach(animation => animation.cancel());
    animations.clear();
    configurePanels();
    manualPlant = null;
    updateScroll();
    if (reduced.matches) {
      typed.forEach(finishType);
      counters.forEach(completeCounter);
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
    } else {
      // Give the initial type/copy sequence first paint before compiling a GPU program.
      // This also keeps software-rendered/low-power devices responsive on arrival.
      if (!renderer && !surfaces.length && !ambientInitTimer && entranceObserver) {
        ambientInitTimer = window.setTimeout(() => {
          ambientInitTimer = 0;
          if (!reduced.matches) prepareAmbient();
        }, 1700);
      }
      typed.forEach(record => { if (!record.played && oneShots.has(record.heading)) record.heading.dataset.type = 'ready'; });
      requestTick();
    }
  }
  body.classList.add('home-cinematics');
  configureMotion();
  reducedQuery.addEventListener('change', event => {
    reduced.matches = event.matches;
    configureMotion();
  });
  document.addEventListener('home:motion-preference', event => {
    reduced.matches = event.detail.reduced;
    configureMotion();
  });
  desktop.addEventListener('change', configurePanels);
  pinned.addEventListener('change', () => { manualPlant = null; updateScroll(); });
  window.addEventListener('scroll', scheduleScroll, { passive: true });
  window.addEventListener('resize', () => {
    surfaces.forEach(surface => { surface.width = 0; });
    scheduleScroll();
    requestTick();
  }, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
      typing.forEach(finishType);
      animations.forEach(animation => animation.finish());
    } else requestTick();
  });
})();
