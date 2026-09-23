// Functional test for Character Renderer Selector & Prototype V2 Activation
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

console.log('Testing Character Renderer Selector & Prototype V2 Integration...');

// 1. Verify index.html contains script tags in correct order
const html = fs.readFileSync('index.html', 'utf8');

const idxChars = html.indexOf('characters.js');
const idxV1 = html.indexOf('characters-prototype.js');
const idxV2 = html.indexOf('characters-prototype-v2.js');

assert.ok(idxChars !== -1, 'index.html must include characters.js');
assert.ok(idxV1 !== -1, 'index.html must include characters-prototype.js');
assert.ok(idxV2 !== -1, 'index.html must include characters-prototype-v2.js');
assert.ok(idxChars < idxV1, 'characters.js must load before characters-prototype.js');
assert.ok(idxV1 < idxV2, 'characters-prototype.js must load before characters-prototype-v2.js');

// 2. Verify select element options in index.html
const selectMatch = html.match(/<select id="characterRendererSelect">([\s\S]*?)<\/select>/);
assert.ok(selectMatch, 'index.html must contain #characterRendererSelect');

const selectContent = selectMatch[1];
assert.ok(
  selectContent.includes('<option value="svg-isometric">Original / SVG isométrico</option>'),
  'Must include option for "Original / SVG isométrico"'
);
assert.ok(
  selectContent.includes('<option value="prototype-v1">Prototipo V1 (Cartoon estilizado)</option>'),
  'Must include option for "Prototipo V1 (Cartoon estilizado)"'
);
assert.ok(
  selectContent.includes('<option value="prototype-v2">Prototipo V2 (Cartoon pseudo-3D)</option>'),
  'Must include option for "Prototipo V2 (Cartoon pseudo-3D)"'
);

// 3. Verify runtime execution and wiring in vm context
const mockElements = {};
let changeCallback = null;

const document = {
  getElementById: (id) => {
    if (!mockElements[id]) {
      mockElements[id] = {
        id,
        value: 'svg-isometric',
        set onchange(fn) { changeCallback = fn; },
        get onchange() { return changeCallback; }
      };
    }
    return mockElements[id];
  },
  createElementNS: (ns, tag) => {
    const classes = new Set();
    const attrs = {};
    return {
      tagName: tag,
      classList: {
        add: (...c) => c.forEach(x => classes.add(x)),
        contains: (x) => classes.has(x),
        remove: (...c) => c.forEach(x => classes.delete(x))
      },
      dataset: {},
      attributes: attrs,
      setAttribute: (k, v) => { attrs[k] = String(v); },
      getAttribute: (k) => attrs[k],
      style: {},
      _innerHTML: '',
      set innerHTML(v) { this._innerHTML = v; },
      get innerHTML() { return this._innerHTML; },
      querySelector: () => null,
      querySelectorAll: () => []
    };
  },
  querySelector: () => null,
  querySelectorAll: () => [],
  addEventListener: () => {}
};

const window = {
  document,
  crypto: { getRandomValues: arr => arr },
  matchMedia: () => ({ matches: false }),
  ShopIdentity: { mark: () => '<svg></svg>', colors: {}, current: { color: 'sage' } },
  addEventListener: () => {}
};

const ctx = { window, document, console, crypto: window.crypto, ShopIdentity: window.ShopIdentity };
vm.createContext(ctx);

vm.runInContext(fs.readFileSync('fish-art.js', 'utf8'), ctx);
vm.runInContext(fs.readFileSync('characters.js', 'utf8'), ctx);
vm.runInContext(fs.readFileSync('characters-prototype.js', 'utf8'), ctx);
vm.runInContext(fs.readFileSync('characters-prototype-v2.js', 'utf8'), ctx);

const ShopCharacters = ctx.window.ShopCharacters || ctx.ShopCharacters;

// Verify Prototype V2 is registered
assert.ok(ShopCharacters.getRenderer('prototype-v2'), 'prototype-v2 must be registered in ShopCharacters');
assert.equal(typeof ShopCharacters.getRenderer('prototype-v2').create, 'function', 'prototype-v2 must have create()');
assert.equal(typeof ShopCharacters.getRenderer('prototype-v2').update, 'function', 'prototype-v2 must have update()');

// Verify initial renderer is svg-isometric
assert.equal(ShopCharacters.getActiveRendererName(), 'svg-isometric');

// Wire up UI select handler as in ui.js
const selectEl = document.getElementById('characterRendererSelect');
selectEl.onchange = (e) => {
  if (ShopCharacters) {
    ShopCharacters.setRenderer(e.target.value);
  }
};

// Simulate user selecting prototype-v2
selectEl.value = 'prototype-v2';
selectEl.onchange({ target: { value: 'prototype-v2' } });

// Verify active renderer changed to prototype-v2
assert.equal(ShopCharacters.getActiveRendererName(), 'prototype-v2', 'Active renderer must be prototype-v2 after selection');

// Create a character under prototype-v2 and verify prototype-v2 attributes/classes
const v2Customer = ShopCharacters.create({ id: 1, role: 'customer' });
assert.ok(v2Customer.classList.contains('character-prototype-v2'), 'Created node must have character-prototype-v2 class');

// Simulate user switching back to prototype-v1
selectEl.value = 'prototype-v1';
selectEl.onchange({ target: { value: 'prototype-v1' } });
assert.equal(ShopCharacters.getActiveRendererName(), 'prototype-v1', 'Active renderer must switch to prototype-v1');

const v1Customer = ShopCharacters.create({ id: 2, role: 'customer' });
assert.ok(v1Customer.classList.contains('character-prototype-v1'), 'Created node must have character-prototype-v1 class');

// Simulate user switching to svg-isometric
selectEl.value = 'svg-isometric';
selectEl.onchange({ target: { value: 'svg-isometric' } });
assert.equal(ShopCharacters.getActiveRendererName(), 'svg-isometric', 'Active renderer must switch to svg-isometric');

console.log('PASS: All 3 options available and prototype-v2 functionally switches active renderer.');
