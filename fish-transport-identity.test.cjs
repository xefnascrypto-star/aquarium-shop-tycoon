// Automated test suite for Fish Transport Visual Identity
// Validates: aquarium -> pick -> bag -> transport -> counter -> sale
// Checks that the bag inherits species, shape, and body/fin color from the tank.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

console.log('Testing Fish Transport Visual Identity (Aquarium -> Bag -> Counter -> Sale)...');

// Mock DOM
const window = {
  crypto: {
    getRandomValues: (arr) => {
      for (let i = 0; i < arr.length; i++) arr[i] = Math.floor(Math.random() * 65535);
      return arr;
    }
  },
  matchMedia: () => ({ matches: false }),
  ShopIdentity: {
    mark: () => '<svg></svg>',
    colors: { sage: '#7e9a86', ocean: '#5a8296', terracotta: '#c27d60', plum: '#8b6b80', gold: '#c99e58' },
    current: { color: 'sage' }
  }
};

const document = {
  createElementNS: (ns, tag) => {
    const classSet = new Set();
    const attrs = {};
    const style = {};
    const el = {
      tagName: tag,
      classList: {
        add: (c) => classSet.add(c),
        contains: (c) => classSet.has(c),
        remove: (c) => classSet.delete(c)
      },
      dataset: {},
      attributes: attrs,
      style,
      _innerHTML: '',
      set innerHTML(val) {
        this._innerHTML = val;
      },
      get innerHTML() {
        return this._innerHTML;
      },
      setAttribute(k, v) { attrs[k] = String(v); },
      getAttribute(k) { return attrs[k]; },
      querySelector(sel) {
        const dummy = {
          attributes: {},
          style: {},
          setAttribute(k, v) { this.attributes[k] = String(v); },
          getAttribute(k) { return this.attributes[k]; },
          querySelector(s) { return dummy; }
        };
        if (sel === '.purchase-bag') {
          return this._bagEl || (this._bagEl = {
            attributes: {},
            dataset: {},
            style: {},
            _html: '',
            set innerHTML(v) { this._html = v; },
            get innerHTML() { return this._html; },
            setAttribute(k, v) { this.attributes[k] = String(v); },
            getAttribute(k) { return this.attributes[k]; }
          });
        }
        return dummy;
      },
      querySelectorAll() { return []; },
      remove() { this.removed = true; }
    };
    return el;
  }
};

const context = {
  window,
  document,
  crypto: window.crypto,
  matchMedia: window.matchMedia,
  ShopIdentity: window.ShopIdentity,
  console
};
vm.createContext(context);

// Load fish-art.js and characters.js
vm.runInContext(fs.readFileSync('fish-art.js', 'utf8'), context);
vm.runInContext(fs.readFileSync('characters.js', 'utf8'), context);
vm.runInContext(fs.readFileSync('characters-prototype-v2.js', 'utf8'), context);

const ShopFish = context.ShopFish || context.window.ShopFish;
const ShopCharacters = context.ShopCharacters || context.window.ShopCharacters;

// 1. Verify ShopFish.bag helper exists and renders accurate identity for each catalog species
assert.strictEqual(typeof ShopFish.bag, 'function', 'ShopFish.bag must be a function');

const speciesList = ['betta', 'comet', 'guppy', 'platy', 'neon', 'molly', 'cory', 'ancistrus', 'discus'];
for (const sp of speciesList) {
  const cat = ShopFish.catalog[sp];
  assert.ok(cat, `Catalog must define ${sp}`);
  const bagHtml = ShopFish.bag(sp);
  
  // Must render fish bag shape and clear water
  assert.ok(bagHtml.includes('stroke="#669c9d"'), 'Must contain aquatic transport bag rim');
  // Must have bag-fish group tagged with dataset species
  assert.ok(bagHtml.includes(`data-species="${sp}"`), `Bag must contain data-species="${sp}"`);
  // Must inherit exact body color from aquarium catalog
  assert.ok(bagHtml.includes(cat.body), `Bag for ${sp} must contain body color ${cat.body}`);
  // Must inherit exact fin color from aquarium catalog
  assert.ok(bagHtml.includes(cat.fin), `Bag for ${sp} must contain fin color ${cat.fin}`);
}

// 2. Test Customer Character checkout / sale bag species inheritance
const customerNode = ShopCharacters.create({ id: 1, seed: 42, role: 'customer' });
ShopCharacters.update(customerNode, {
  feet: { x: 50, y: 80 },
  phase: 'checkout',
  animState: 'checkout',
  moving: false,
  distance: 0,
  facing: 1,
  bubble: '',
  label: 'Customer checkout',
  result: 'pending',
  product: 'betta'
});

// Initially bag hidden before sale
const customerBag = customerNode.querySelector('.purchase-bag');
assert.strictEqual(customerBag.style.display, 'none');

// On successful sale of a specific species (e.g. betta)
ShopCharacters.update(customerNode, {
  feet: { x: 50, y: 80 },
  phase: 'leaving',
  animState: 'walk',
  moving: true,
  distance: 1.2,
  facing: 1,
  bubble: '✓',
  label: 'Customer leaving',
  result: 'sale',
  product: 'betta'
});

assert.strictEqual(customerBag.style.display, '', 'Bag must be visible on sale');
assert.strictEqual(customerBag.dataset.species, 'betta', 'Customer bag must inherit betta species');
assert.strictEqual(customerBag.dataset.carry, 'fish');
assert.ok(customerBag.innerHTML.includes(ShopFish.catalog.betta.body), 'Customer bag must display betta body color');

// 3. Test Staff Bag Rendering with prototype-v2
ShopCharacters.setRenderer('prototype-v2');
const staffNode = ShopCharacters.create({ id: 10000, seed: 410, role: 'staff' });
const staffBag = staffNode.querySelector('.purchase-bag');

// Staff transporting neon tetra from tank to till
ShopCharacters.update(staffNode, {
  feet: { x: 120, y: 150 },
  phase: 'carrying-order',
  animState: 'carry',
  moving: true,
  distance: 3.5,
  facing: 1,
  bubble: '',
  label: 'Staff carrying neon',
  result: 'pending',
  product: 'neon',
  carry: 'fish'
});

assert.strictEqual(staffBag.style.display, '', 'Staff bag must be visible during carry');

// Switch back to svg-isometric
ShopCharacters.setRenderer('svg-isometric');

console.log('PASS: Fish transport visual identity verified across all species and states.');
