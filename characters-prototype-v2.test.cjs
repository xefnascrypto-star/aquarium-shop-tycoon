// Automated test suite for Character Visual Prototype V2
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

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
    const el = {
      tagName: tag,
      classList: {
        add: (c) => classSet.add(c),
        contains: (c) => classSet.has(c),
        remove: (c) => classSet.delete(c)
      },
      dataset: {},
      attributes: {},
      style: {},
      _innerHTML: '',
      set innerHTML(val) {
        this._innerHTML = val;
      },
      get innerHTML() {
        return this._innerHTML;
      },
      setAttribute(k, v) { this.attributes[k] = String(v); },
      getAttribute(k) { return this.attributes[k]; },
      querySelector(sel) {
        const dummy = {
          attributes: {},
          style: {},
          setAttribute(k, v) { this.attributes[k] = String(v); },
          getAttribute(k) { return this.attributes[k]; },
          querySelector(s) { return dummy; }
        };
        if (sel === '.view-front' || sel === '.view-back' || sel === '.view-side' ||
            sel === '.visitor-bubble' || sel === '.character-body' ||
            sel === '.left-leg' || sel === '.right-leg' ||
            sel === '.arm-left' || sel === '.arm-right' ||
            sel === '.character-head' || sel === '.purchase-bag') {
          return dummy;
        }
        if (this._innerHTML && this._innerHTML.includes(sel.replace('.', ''))) return dummy;
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

// Evaluate characters.js and characters-prototype-v2.js
const codeCharacters = fs.readFileSync('characters.js', 'utf8');
vm.runInContext(codeCharacters, context);
const codePrototypeV2 = fs.readFileSync('characters-prototype-v2.js', 'utf8');
vm.runInContext(codePrototypeV2, context);

const ShopCharacters = context.ShopCharacters || context.window.ShopCharacters;
const ShopCharacterPrototypeV2 = context.ShopCharacterPrototypeV2 || context.window.ShopCharacterPrototypeV2;
const { STATES } = ShopCharacters;

console.log('Testing Character Visual Prototype V2...');

// 1. Verification of Registration
assert.strictEqual(typeof ShopCharacterPrototypeV2, 'object');
assert.strictEqual(ShopCharacterPrototypeV2.id, 'prototype-v2');
assert.ok(ShopCharacters.getRenderer('prototype-v2'), 'prototype-v2 must be registered in ShopCharacters');

// 2. Test Direction Heading Resolver
// Up-screen into background (dx + dy < -0.18) -> back
assert.strictEqual(ShopCharacterPrototypeV2.resolveDirectionHeading({ x: -0.7, y: 0 }, STATES.WALK, 'to-product', 1), 'back');
assert.strictEqual(ShopCharacterPrototypeV2.resolveDirectionHeading({ x: 0, y: -0.8 }, STATES.WALK, 'to-product', 1), 'back');

// Down-screen towards viewer (dx + dy > 0.18) -> front
assert.strictEqual(ShopCharacterPrototypeV2.resolveDirectionHeading({ x: 0.7, y: 0 }, STATES.WALK, 'leaving', 1), 'front');
assert.strictEqual(ShopCharacterPrototypeV2.resolveDirectionHeading({ x: 0, y: 0.8 }, STATES.WALK, 'leaving', 1), 'front');

// Lateral diagonal (dx + dy close to 0) -> side
assert.strictEqual(ShopCharacterPrototypeV2.resolveDirectionHeading({ x: 0.7, y: -0.7 }, STATES.WALK, 'to-product', 1), 'side');

// Contextual fallback: browsing tanks -> back
assert.strictEqual(ShopCharacterPrototypeV2.resolveDirectionHeading(null, STATES.LOOK, 'browsing', 1), 'back');

// Contextual fallback: checkout -> front
assert.strictEqual(ShopCharacterPrototypeV2.resolveDirectionHeading(null, STATES.CHECKOUT, 'checkout', 1), 'front');

// 3. Customer Character V2 Creation & Structure
ShopCharacterPrototypeV2.enable();
assert.strictEqual(ShopCharacters.getActiveRendererName(), 'prototype-v2');
assert.strictEqual(ShopCharacterPrototypeV2.isCurrent(), true);

const customerNode = ShopCharacters.create({
  id: 1,
  seed: 42,
  role: 'customer'
});
assert.ok(customerNode, 'Customer DOM node must be created');
assert.ok(customerNode.classList.contains('live-visitor'), 'Must have live-visitor class for layer tracking');
assert.ok(customerNode.classList.contains('character-prototype-v2'), 'Must have character-prototype-v2 class');
assert.strictEqual(customerNode.dataset.role, 'customer');

// Verify front, back and side view layers exist in V2 markup
assert.ok(customerNode.innerHTML.includes('view-front'), 'Customer must contain front view');
assert.ok(customerNode.innerHTML.includes('view-back'), 'Customer must contain back view');
assert.ok(customerNode.innerHTML.includes('view-side'), 'Customer must contain side view');
assert.ok(customerNode.innerHTML.includes('character-eyes'), 'Customer must have expressive eyes');
assert.ok(customerNode.innerHTML.includes('character-mouth'), 'Customer must have mouth');
assert.ok(customerNode.innerHTML.includes('character-hair'), 'Customer must have volumetric hair');

// 4. Staff Character V2 Creation & Structure
const staffNode = ShopCharacters.create({
  id: 10000,
  seed: 410,
  role: 'staff'
});
assert.ok(staffNode, 'Staff DOM node must be created');
assert.ok(staffNode.classList.contains('live-worker'), 'Must have live-worker class');
assert.strictEqual(staffNode.dataset.role, 'staff');

// Verify staff uniform, apron, cap, and multi-directional views exist
assert.ok(staffNode.innerHTML.includes('view-front'), 'Staff must contain front view');
assert.ok(staffNode.innerHTML.includes('view-back'), 'Staff must contain back view');
assert.ok(staffNode.innerHTML.includes('view-side'), 'Staff must contain side view');
assert.ok(staffNode.innerHTML.includes('character-cap'), 'Staff must feature uniform cap');
assert.ok(staffNode.innerHTML.includes('staff-badge'), 'Staff must feature employee badge');

// 5. Verification of All Canonical States with Direction
const testStates = [
  'idle', 'walk', 'look', 'wait', 'pick', 'carry', 'checkout',
  'react_positive', 'react_negative', 'leave',
  'fetch', 'prepare', 'transport_stock', 'serve_till', 'restock'
];

for (const stateName of testStates) {
  // Update Customer walking into background
  ShopCharacters.update(customerNode, {
    feet: { x: 120, y: 150 },
    phase: stateName,
    animState: stateName,
    moving: stateName === 'walk',
    distance: 3.5,
    facing: 1,
    direction: { x: -0.6, y: -0.4 },
    bubble: '🐟',
    label: `Test Customer ${stateName}`,
    result: stateName === 'carry' ? 'sale' : 'pending'
  });
  assert.strictEqual(customerNode.dataset.animState, stateName, `Customer animState must be ${stateName}`);
  assert.strictEqual(customerNode.dataset.heading, 'back', 'Customer should face back when walking into background');

  // Update Staff carrying stock towards viewer
  ShopCharacters.update(staffNode, {
    feet: { x: 180, y: 210 },
    phase: stateName,
    animState: stateName,
    moving: stateName === 'walk' || stateName === 'fetch' || stateName === 'transport_stock',
    distance: 4.2,
    facing: -1,
    direction: { x: 0.5, y: 0.5 },
    bubble: '✓',
    label: `Test Staff ${stateName}`,
    result: 'pending'
  });
  assert.strictEqual(staffNode.dataset.animState, stateName, `Staff animState must be ${stateName}`);
  assert.strictEqual(staffNode.dataset.heading, 'front', 'Staff should face front when moving towards viewer');
}

// 6. Test node removal
ShopCharacters.remove(customerNode);
ShopCharacters.remove(staffNode);
assert.strictEqual(customerNode.removed, true);
assert.strictEqual(staffNode.removed, true);

// 7. Test disabling / switching
ShopCharacterPrototypeV2.disable();
assert.strictEqual(ShopCharacters.getActiveRendererName(), 'svg-isometric');
assert.strictEqual(ShopCharacterPrototypeV2.isCurrent(), false);

console.log('PASS: Character Visual Prototype V2 tests passed successfully.');
