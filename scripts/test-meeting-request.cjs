// Dependency-free protocol/state tests: node --test scripts/test-meeting-request.cjs
const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { runInNewContext } = require('node:vm');
const source = readFileSync(join(__dirname, '../js/meeting-request.js'), 'utf8');
const endpoint = 'https://formspree.io/f/xyeebdyp';

function fixture({ language = 'en', respond = async () => ({ ok: true, status: 200, json: async () => ({ ok: true }) }), features = true } = {}) {
  const fields = [
    { name: 'name', value: ' Zoë & José ', required: true },
    { name: 'email', value: ' review@example.com ', required: true },
    { name: 'company', value: '', required: false },
    { name: 'message', value: ' Reports & invoices?\n<test> — català ', required: true }
  ].map(field => Object.assign(field, {
    disabled: false, validity: '', attrs: {}, events: {},
    setCustomValidity(message) { this.validity = message; },
    setAttribute(name, value) { this.attrs[name] = value; },
    removeAttribute(name) { delete this.attrs[name]; },
    addEventListener(name, callback) { this.events[name] = callback; }
  }));
  const button = { textContent: 'Send request', disabled: false };
  const status = { textContent: '', dataset: {}, focused: false, focus() { this.focused = true; } };
  const form = {
    action: endpoint, events: {}, attrs: {}, resetCount: 0,
    querySelector(selector) { return selector.includes('button') ? button : status; },
    querySelectorAll() { return fields; },
    addEventListener(name, callback) { this.events[name] = callback; },
    setAttribute(name, value) { this.attrs[name] = value; },
    removeAttribute(name) { delete this.attrs[name]; },
    reportValidity() { return fields.every(field => !field.validity && (!field.required || field.value.length)); },
    reset() { this.resetCount++; fields.forEach(field => { field.value = ''; }); }
  };
  class Payload extends Map {
    constructor() { super([['subject', 'First conversation — The Apps Garden'], ['language', language], ...fields.map(field => [field.name, field.value])]); }
  }
  const calls = [];
  const fetch = (url, options) => { calls.push({ url, options }); return respond(url, options); };
  const timer = {};
  const window = {
    fetch: features ? fetch : undefined, FormData: Payload, AbortController,
    setTimeout(callback, delay) { timer.callback = callback; timer.delay = delay; return 1; },
    clearTimeout() { timer.cleared = true; }
  };
  const document = { documentElement: { lang: language }, querySelectorAll: () => [form] };
  runInNewContext(source, { window, document, fetch, FormData: Payload, AbortController });
  return { fields, button, status, form, calls, timer, submit: () => form.events.submit({ preventDefault() {} }) };
}

for (const [language, sending, success] of [
  ['en', 'Sending…', 'Thank you.'], ['es', 'Enviando…', 'Gracias.'], ['ca', 'Enviant…', 'Gràcies.']
]) {
  test(`${language}: POST fields, loading state, confirmed success and reset`, async () => {
    const f = fixture({ language });
    const pending = f.submit();
    assert.equal(f.status.textContent, sending);
    assert.equal(f.button.disabled, true);
    assert.ok(f.fields.every(field => field.disabled));
    assert.equal(f.form.attrs['aria-busy'], 'true');
    assert.equal(f.timer.delay, 30000);
    const { url, options } = f.calls[0];
    assert.equal(url, endpoint);
    assert.equal(options.method, 'POST');
    assert.equal(options.headers.Accept, 'application/json');
    assert.equal(options.credentials, 'omit');
    assert.equal(options.body.get('email'), 'review@example.com');
    assert.equal(options.body.get('name'), 'Zoë & José');
    assert.equal(options.body.get('company'), '');
    assert.equal(options.body.get('message'), 'Reports & invoices?\n<test> — català');
    assert.equal(options.body.get('language'), language);
    assert.ok(options.body.get('subject'));
    await pending;
    assert.equal(f.status.dataset.state, 'success');
    assert.ok(f.status.textContent.startsWith(success));
    assert.equal(f.form.resetCount, 1);
    assert.ok(f.fields.every(field => field.value === '' && !field.disabled));
    assert.equal(f.button.disabled, false);
    assert.equal(f.button.textContent, 'Send request');
    assert.equal(f.form.attrs['aria-busy'], undefined);
    assert.equal(f.status.focused, true);
    assert.equal(f.timer.cleared, true);
    f.fields[0].events.input();
    assert.equal(f.status.textContent, '');
  });
}

test('required whitespace fails locally without making a request', async () => {
  const f = fixture();
  f.fields[0].value = '   ';
  await f.submit();
  assert.ok(f.fields[0].validity);
  assert.equal(f.calls.length, 0);
  assert.equal(f.form.resetCount, 0);
  f.fields[0].events.input();
  assert.equal(f.fields[0].validity, '');
});

test('a second submit during a request is ignored', async () => {
  let complete;
  const f = fixture({ respond: () => new Promise(resolve => { complete = resolve; }) });
  const pending = f.submit();
  await f.submit();
  assert.equal(f.calls.length, 1);
  complete({ ok: true, json: async () => ({ ok: true }) });
  await pending;
  assert.equal(f.form.resetCount, 1);
});

for (const [label, respond] of [
  ['server failure', async () => ({ ok: false, status: 500, json: async () => ({ error: 'server' }) })],
  ['quota/rate limit', async () => ({ ok: false, status: 429, json: async () => ({ errors: [] }) })],
  ['network failure', async () => { throw Error('offline'); }],
  ['invalid JSON', async () => ({ ok: true, json: async () => { throw Error('invalid JSON'); } })],
  ['explicit rejection with 2xx', async () => ({ ok: true, json: async () => ({ ok: false }) })],
  ['errors with 2xx', async () => ({ ok: true, json: async () => ({ errors: [{ field: 'email' }] }) })],
  ['unknown field error', async () => ({ ok: false, status: 422, json: async () => ({ errors: [null, { field: 'unknown' }] }) })]
]) {
  test(`${label}: keep answers, show error and restore controls`, async () => {
    const f = fixture({ respond });
    const values = f.fields.map(field => field.value);
    await f.submit();
    assert.equal(f.status.dataset.state, 'error');
    assert.match(f.status.textContent, /team@theappsgarden.com/);
    assert.deepEqual(f.fields.map(field => field.value), values);
    assert.equal(f.form.resetCount, 0);
    assert.ok(f.fields.every(field => !field.disabled));
    assert.equal(f.button.disabled, false);
    assert.equal(f.calls.length, 1);
  });
}

test('server field errors are localized, flagged and cleared on editing', async () => {
  const f = fixture({ language: 'es', respond: async () => ({ ok: false, status: 422,
    json: async () => ({ errors: [{ field: 'email', message: '<script>untrusted</script>' }] }) }) });
  await f.submit();
  assert.equal(f.fields[1].attrs['aria-invalid'], 'true');
  assert.equal(f.fields[1].validity, 'Revisa este dato.');
  assert.ok(!f.status.textContent.includes('<script>'));
  f.fields[1].events.input();
  assert.equal(f.fields[1].attrs['aria-invalid'], undefined);
  assert.equal(f.fields[1].validity, '');
});

test('timeout aborts without resetting or automatically retrying', async () => {
  const f = fixture({ respond: (_, options) => new Promise((resolve, reject) => {
    options.signal.addEventListener('abort', () => reject(Error('aborted')));
  }) });
  const pending = f.submit();
  f.timer.callback();
  await pending;
  assert.equal(f.status.dataset.state, 'error');
  assert.equal(f.form.resetCount, 0);
  assert.equal(f.calls.length, 1);
  assert.equal(f.button.disabled, false);
});

test('unsupported browsers retain the native POST fallback', () => {
  const f = fixture({ features: false });
  assert.equal(f.form.events.submit, undefined);
  assert.equal(f.calls.length, 0);
});
