// Dependency-free tests for the homepage's progressive enhancements.
// Run: node --test scripts/test-homepage.cjs
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const production = fs.readFileSync(path.join(__dirname, '../js/production.js'), 'utf8');
const start = production.indexOf('// Homepage storytelling');
const source = production.slice(start, production.indexOf('\n})();', start) + '\n})();'.length);

function setup({ reduced = false, pinned = true, homepage = true, observer = true } = {}) {
  const classes = new Set();
  const classList = {
    add: name => classes.add(name),
    toggle(name, enabled) { enabled ? classes.add(name) : classes.delete(name); }
  };
  const events = {};
  const notifications = [];
  const media = {
    reduced: { matches: reduced, addEventListener(type, callback) { this.change = callback; } },
    pinned: { matches: pinned, addEventListener(type, callback) { this.change = callback; } }
  };
  const rect = { top: 1000, bottom: 3100, height: 2100 };
  const style = {};
  const steps = Array.from({ length: 4 }, () => ({
    open: true,
    summary: { addEventListener(type, callback) { this[type] = callback; } },
    querySelector() { return this.summary; }
  }));
  const method = { style: { setProperty(name, value) { style[name] = value; } }, getBoundingClientRect: () => rect };
  const hero = { tagName: 'SECTION', dataset: { headerTone: 'dark' }, getBoundingClientRect: () => ({ top: 0, bottom: 900 }) };
  const light = { tagName: 'SECTION', dataset: {}, getBoundingClientRect: () => ({ top: 900, bottom: 1100 }) };
  const rows = Array.from({ length: 5 }, () => ({ classList: { add(name) { this[name] = true; } } }));
  const statement = { classList: { add(name) { this[name] = true; } } };
  const home = {
    children: [hero, light],
    querySelector: selector => selector === '.home-method' ? method : statement,
    querySelectorAll: selector => selector === '.method-step' ? steps : rows
  };
  const window = {
    innerWidth: pinned ? 1440 : 390, innerHeight: 1000, scrollY: 0,
    matchMedia: query => query.includes('reduced') ? media.reduced : media.pinned,
    requestAnimationFrame: callback => callback(),
    addEventListener(type, callback) { events[type] = callback; }
  };
  const observers = [];
  class IntersectionObserver {
    constructor(callback) { this.callback = callback; this.targets = []; observers.push(this); }
    observe(target) { this.targets.push(target); }
    unobserve(target) { this.targets = this.targets.filter(item => item !== target); }
    disconnect() { this.targets = []; }
  }
  class CustomEvent {
    constructor(type, options) { this.type = type; this.detail = options.detail; }
  }
  const context = { window, CustomEvent, document: {
    body: { classList }, querySelector: () => homepage ? home : null,
    dispatchEvent: event => notifications.push(event)
  } };
  if (observer) { context.IntersectionObserver = IntersectionObserver; window.IntersectionObserver = IntersectionObserver; }
  vm.runInNewContext(source, context);
  return { classes, events, media, rect, style, steps, rows, statement, hero, light, observers, window, notifications };
}

test('secondary pages do not receive homepage enhancements', () => {
  const ui = setup({ homepage: false });
  assert.equal(ui.classes.size, 0);
});
test('desktop starts on the first method step and scroll advances all four', () => {
  const ui = setup();
  assert.equal(ui.classes.has('home-enhanced'), true);
  assert.equal(ui.classes.has('home-motion'), true);
  for (const [progress, expected] of [[0, 0], [.3, 1], [.6, 2], [.9, 3]]) {
    ui.rect.top = 84 - progress * (2100 - 1000 + 84);
    ui.rect.bottom = ui.rect.top + 2100;
    ui.events.scroll();
    assert.equal(ui.steps.findIndex(step => step.open), expected);
    assert.equal(ui.steps.filter(step => step.open).length, 1);
  }
  assert.equal(ui.style['--growth'], '1');
});
test('manual disclosure activation is not overwritten by the next scroll', () => {
  const ui = setup();
  ui.steps[2].summary.click();
  ui.events.scroll();
  assert.equal(ui.steps.findIndex(step => step.open), 2);
});
test('mobile and reduced-motion readers receive all method explanations', () => {
  for (const options of [{ pinned: false }, { reduced: true }]) {
    const ui = setup(options);
    assert.equal(ui.steps.filter(step => step.open).length, 4);
    assert.equal(ui.style['--growth'], '1');
    if (options.reduced) assert.equal(ui.classes.has('home-motion'), false);
  }
});
test('changes to motion preference or layout restore complete static content', () => {
  const ui = setup();
  ui.media.reduced.matches = true;
  ui.media.reduced.change();
  assert.equal(ui.classes.has('home-motion'), false);
  assert.equal(ui.steps.filter(step => step.open).length, 4);
  ui.media.reduced.matches = false;
  ui.media.pinned.matches = false;
  ui.media.pinned.change();
  assert.equal(ui.steps.filter(step => step.open).length, 4);
});
test('motion preference changes are shared with the cinematic controller', () => {
  const ui = setup();
  assert.equal(ui.notifications.at(-1).type, 'home:motion-preference');
  assert.equal(ui.notifications.at(-1).detail.reduced, false);
  ui.media.reduced.matches = true;
  ui.media.reduced.change();
  assert.equal(ui.notifications.at(-1).detail.reduced, true);
});
test('header switches contrast with the active section', () => {
  const ui = setup();
  assert.equal(ui.classes.has('header-on-light'), false);
  ui.hero.getBoundingClientRect = () => ({ top: -1000, bottom: -100 });
  ui.light.getBoundingClientRect = () => ({ top: -100, bottom: 800 });
  ui.window.scrollY = 1000;
  ui.events.scroll();
  assert.equal(ui.classes.has('header-on-light'), true);
  assert.equal(ui.classes.has('header-scrolled'), true);
});
test('workflow rows resolve once when visible; no observer is also safe', () => {
  const ui = setup();
  const observer = ui.observers[0];
  assert.equal(observer.targets.length, 5);
  observer.callback([{ isIntersecting: true, target: ui.rows[0] }]);
  assert.equal(ui.rows[0].classList['is-resolved'], true);
  assert.equal(observer.targets.length, 4);
  assert.doesNotThrow(() => setup({ observer: false }));
});
