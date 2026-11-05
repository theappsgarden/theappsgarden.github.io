// Dependency-free checks for the progressive enhancements in production.js.
// Run: node --test scripts/test-site-interactions.cjs
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../js/production.js'), 'utf8');
const enhancements = source.slice(0, source.indexOf('\n})();') + '\n})();'.length);

function setup({ lang = 'en', hasMenu = true, hasWorkflow = true } = {}) {
  const events = { document: {}, window: {}, menu: {} };
  let focused = false;
  const summary = { focus: () => { focused = true; } };
  const menu = {
    open: false,
    querySelector: () => summary,
    contains: target => target === summary || target === menu,
    addEventListener: (type, callback) => { events.menu[type] = callback; }
  };
  const links = ['es', 'en', 'ca'].map(language => ({
    lang: language, attrs: {},
    setAttribute(name, value) { this.attrs[name] = value; },
    removeAttribute(name) { delete this.attrs[name]; }
  }));
  const workflow = {
    dataset: {}, role: 'img',
    removeAttribute() { this.role = null; },
    appendChild(button) { this.button = button; }
  };
  const document = {
    documentElement: { lang },
    querySelector: selector => selector === '.mobile-menu' ? (hasMenu ? menu : null) : (hasWorkflow ? workflow : null),
    querySelectorAll: () => links,
    addEventListener: (type, callback) => { events.document[type] = callback; },
    createElement: () => ({ addEventListener(type, callback) { this[type] = callback; } })
  };
  const window = { innerWidth: 390, addEventListener: (type, callback) => { events.window[type] = callback; } };
  vm.runInNewContext(enhancements, { document, window });
  return { menu, summary, workflow, links, events, window, focused: () => focused };
}

test('Escape closes an open menu and returns keyboard focus', () => {
  const ui = setup();
  ui.menu.open = true;
  let prevented = false;
  ui.events.document.keydown({ key: 'Escape', preventDefault() { prevented = true; } });
  assert.equal(ui.menu.open, false);
  assert.equal(ui.focused(), true);
  assert.equal(prevented, true);
});

test('outside click and focus departure close the menu without stealing focus', () => {
  const ui = setup();
  for (const type of ['click', 'focusin']) {
    ui.menu.open = true;
    ui.events.document[type]({ target: {} });
    assert.equal(ui.menu.open, false);
    assert.equal(ui.focused(), false);
  }
});

test('clicking within the menu does not dismiss it; following a link does', () => {
  const ui = setup();
  ui.menu.open = true;
  ui.events.document.click({ target: ui.summary });
  assert.equal(ui.menu.open, true);
  ui.events.menu.click({ target: { closest: () => ({}) } });
  assert.equal(ui.menu.open, false);
});

test('switching to desktop closes the mobile disclosure', () => {
  const ui = setup();
  ui.menu.open = true;
  ui.window.innerWidth = 1200;
  ui.events.window.resize();
  assert.equal(ui.menu.open, false);
});

for (const [lang, pause, resume] of [
  ['en', 'Pause animation', 'Resume animation'],
  ['es', 'Pausar animación', 'Reanudar animación'],
  ['ca', 'Pausar animació', 'Reprendre animació']
]) {
  test(`${lang}: localized pause/resume and current-language navigation`, () => {
    const ui = setup({ lang });
    assert.equal(ui.workflow.role, null);
    assert.equal(ui.workflow.button.textContent, pause);
    assert.equal(ui.workflow.button.type, 'button');
    ui.workflow.button.click();
    assert.equal(ui.workflow.dataset.paused, 'true');
    assert.equal(ui.workflow.button.textContent, resume);
    ui.workflow.button.click();
    assert.equal(ui.workflow.dataset.paused, 'false');
    assert.equal(ui.workflow.button.textContent, pause);
    assert.deepEqual(ui.links.filter(link => link.attrs['aria-current'] === 'page').map(link => link.lang), [lang]);
  });
}

test('pages without a workflow or menu remain usable', () => {
  assert.doesNotThrow(() => setup({ hasMenu: false, hasWorkflow: false }));
});

test('unrecognized languages do not receive an untranslated animation control', () => {
  const ui = setup({ lang: 'fr' });
  assert.equal(ui.workflow.button, undefined);
});
