// Unit tests for Character Visual Prototype V1 (Zero external dependencies)
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
    const children = [];
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
        // Check if selector exists in generated innerHTML or structural tags
        if (sel === '.visitor-bubble' || sel === '.character-body' || sel === '.left-leg' || sel === '.right-leg' || sel === '.arm-left' || sel === '.arm-right' || sel === '.character-head' || sel === '.purchase-bag') {
          return dummy;
        }
        if (sel === '.character-eyes' || sel === '.character-mouth' || sel === '.character-hair' || sel === '.character-torso' || sel === '.character-cap' || sel === '.staff-badge') {
          if (this._innerHTML.includes(sel.replace('.', ''))) return dummy;
          return null;
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

// Evaluate characters.js and characters-prototype.js
const codeCharacters = fs.readFileSync('characters.js', 'utf8');
vm.runInContext(codeCharacters, context);
const codePrototype = fs.readFileSync('characters-prototype.js', 'utf8');
vm.runInContext(codePrototype, context);

const ShopCharacters = context.ShopCharacters || context.window.ShopCharacters;
const ShopCharacterPrototypeV1 = context.ShopCharacterPrototypeV1 || context.window.ShopCharacterPrototypeV1;

console.log('Testing Character Visual Prototype V1...');

// 1. Verification of Registration
assert.strictEqual(typeof ShopCharacterPrototypeV1, 'object');
assert.strictEqual(ShopCharacterPrototypeV1.id, 'prototype-v1');
assert.ok(ShopCharacters.getRenderer('prototype-v1'), 'prototype-v1 must be registered in ShopCharacters');

// 2. A/B Toggle capability
ShopCharacterPrototypeV1.enable();
assert.strictEqual(ShopCharacters.getActiveRendererName(), 'prototype-v1');
assert.strictEqual(ShopCharacterPrototypeV1.isCurrent(), true);

ShopCharacterPrototypeV1.disable();
assert.strictEqual(ShopCharacters.getActiveRendererName(), 'svg-isometric');
assert.strictEqual(ShopCharacterPrototypeV1.isCurrent(), false);

ShopCharacterPrototypeV1.toggle();
assert.strictEqual(ShopCharacters.getActiveRendererName(), 'prototype-v1');

// 3. Customer Character V1 Creation & Structure
const customerNode = ShopCharacters.create({
  id: 1,
  seed: 42,
  role: 'customer'
});

assert.ok(customerNode, 'Customer DOM node must be created');
assert.ok(customerNode.classList.contains('live-visitor'), 'Must have live-visitor class for layer tracking');
assert.ok(customerNode.classList.contains('character-prototype-v1'), 'Must have prototype-v1 class');
assert.strictEqual(customerNode.dataset.role, 'customer');

// Verify stylized cartoon parts exist in markup
assert.ok(customerNode.innerHTML.includes('character-eyes'), 'Customer must have stylized cartoon eyes');
assert.ok(customerNode.innerHTML.includes('character-mouth'), 'Customer must have cartoon mouth');
assert.ok(customerNode.innerHTML.includes('character-hair'), 'Customer must have hair volume');
assert.ok(customerNode.innerHTML.includes('character-torso'), 'Customer must have torso');
assert.ok(customerNode.innerHTML.includes('arm-left') && customerNode.innerHTML.includes('arm-right'), 'Customer must have cartoon arms');

// 4. Staff Character V1 Creation & Structure
const staffNode = ShopCharacters.create({
  id: 10000,
  seed: 410,
  role: 'staff'
});

assert.ok(staffNode, 'Staff DOM node must be created');
assert.ok(staffNode.classList.contains('live-worker'), 'Must have live-worker class');
assert.strictEqual(staffNode.dataset.role, 'staff');

// Verify staff stylized uniform elements in markup
assert.ok(staffNode.innerHTML.includes('character-cap'), 'Staff must feature employee cap/visor');
assert.ok(staffNode.innerHTML.includes('staff-badge'), 'Staff must feature identity badge');
assert.ok(staffNode.innerHTML.includes('character-mouth'), 'Staff must feature welcoming mouth');

// 5. Verification of All Canonical States
const testStates = [
  'idle', 'walk', 'look', 'wait', 'pick', 'carry', 'checkout',
  'react_positive', 'react_negative', 'leave',
  'fetch', 'prepare', 'transport_stock', 'serve_till', 'restock'
];

for (const stateName of testStates) {
  // Update Customer
  ShopCharacters.update(customerNode, {
    feet: { x: 120, y: 150 },
    phase: stateName,
    animState: stateName,
    moving: stateName === 'walk',
    distance: 3.5,
    facing: 1,
    bubble: '🐟',
    label: `Test Customer ${stateName}`,
    result: stateName === 'carry' ? 'sale' : 'pending'
  });

  assert.strictEqual(customerNode.dataset.animState, stateName, `Customer animState must be ${stateName}`);

  // Update Staff
  ShopCharacters.update(staffNode, {
    feet: { x: 180, y: 210 },
    phase: stateName,
    animState: stateName,
    moving: stateName === 'walk' || stateName === 'fetch' || stateName === 'transport_stock',
    distance: 4.2,
    facing: -1,
    bubble: '✓',
    label: `Test Staff ${stateName}`,
    result: 'pending'
  });

  assert.strictEqual(staffNode.dataset.animState, stateName, `Staff animState must be ${stateName}`);
}

// 6. Test facing flip & coordinate positioning
ShopCharacters.update(customerNode, {
  feet: { x: 250, y: 300 },
  phase: 'walk',
  animState: 'walk',
  moving: true,
  distance: 1.0,
  facing: -1,
  bubble: '',
  label: 'Facing left',
  result: 'pending'
});

assert.strictEqual(customerNode.getAttribute('transform'), 'translate(250 300)', 'Translation must match feet coordinates exactly');

// 7. Test node removal
ShopCharacters.remove(customerNode);
ShopCharacters.remove(staffNode);
assert.strictEqual(customerNode.removed, true);
assert.strictEqual(staffNode.removed, true);

console.log('PASS: Character Visual Prototype V1 tests passed successfully.');
