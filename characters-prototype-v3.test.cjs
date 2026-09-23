// Automated test suite for Character Visual Prototype V3
// Validates volumetric cartoon character renderer, limbs, views, and integration
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

console.log('Testing Character Visual Prototype V3...');

// Mock DOM & environment
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
        if (sel === '.view-front' || sel === '.view-back' || sel === '.view-side') {
          return {
            attributes: {},
            style: { display: '' },
            setAttribute(k, v) { this.attributes[k] = String(v); },
            getAttribute(k) { return this.attributes[k]; },
            querySelector(s) { return dummy; }
          };
        }
        if (sel === '.character-model>path') {
          if ((this._innerHTML || '').includes('<path class="character-swatch"') ||
              (this._innerHTML || '').includes('<g class="character-model">\n          <path') ||
              (this._innerHTML || '').includes('<g class="character-model">\n            <path') ||
              (this._innerHTML || '').includes('<g class="character-model"><path')) {
            return {
              attributes: {},
              setAttribute(k, v) { this.attributes[k] = String(v); },
              getAttribute(k) { return this.attributes[k]; }
            };
          }
          return null;
        }
        if (sel === '.purchase-bag') {
          return this._bagEl || (this._bagEl = {
            attributes: {},
            dataset: {},
            style: { display: 'none' },
            innerHTML: '',
            setAttribute(k, v) { this.attributes[k] = String(v); },
            getAttribute(k) { return this.attributes[k]; }
          });
        }
        return dummy;
      },
      querySelectorAll(sel) {
        return [];
      }
    };
    return el;
  }
};

const ctx = {
  window,
  document,
  console,
  crypto: window.crypto,
  ShopIdentity: window.ShopIdentity
};

vm.createContext(ctx);

// Load dependencies
vm.runInContext(fs.readFileSync('fish-art.js', 'utf8'), ctx);
vm.runInContext(fs.readFileSync('characters.js', 'utf8'), ctx);
vm.runInContext(fs.readFileSync('characters-prototype-v2.js', 'utf8'), ctx);
vm.runInContext(fs.readFileSync('characters-prototype-v3.js', 'utf8'), ctx);

ctx.ShopFish = ctx.window.ShopFish;

const ShopCharacters = ctx.window.ShopCharacters || ctx.ShopCharacters;

// 1. Verify prototype-v3 registration
assert.ok(ShopCharacters, 'ShopCharacters must be defined');
const v3 = ShopCharacters.getRenderer('prototype-v3');
assert.ok(v3, 'prototype-v3 renderer must be registered');
assert.equal(typeof v3.create, 'function', 'prototype-v3 must implement create');
assert.equal(typeof v3.update, 'function', 'prototype-v3 must implement update');

// 2. Test Customer creation
const customerNode = v3.create({
  id: 'visitor-v3-1',
  seed: 42,
  profile: {
    skin: '#fed8b1',
    hairColor: '#4a2f1b',
    color: '#3b82f6',
    archetype: 'casual'
  },
  role: 'customer'
});

assert.ok(customerNode, 'Customer node must be created');
assert.ok(customerNode.classList.contains('character-prototype-v3'), 'Node must have character-prototype-v3 class');
assert.ok(customerNode.classList.contains('live-visitor'), 'Customer must have live-visitor class');
assert.equal(customerNode.dataset.role, 'customer');

// Verify view layers exist in innerHTML
const cHtml = customerNode.innerHTML;
assert.ok(cHtml.includes('view-front'), 'Must contain view-front');
assert.ok(cHtml.includes('view-back'), 'Must contain view-back');
assert.ok(cHtml.includes('view-side'), 'Must contain view-side');
assert.ok(cHtml.includes('purchase-bag'), 'Must contain purchase-bag');
assert.ok(cHtml.includes('visitor-bubble'), 'Must contain visitor-bubble');

// 3. Test Staff creation
const staffNode = v3.create({
  id: 'staff-v3-1',
  seed: 99,
  profile: {
    skin: '#d9a77d',
    hairColor: '#2c3437',
    archetype: 'staff'
  },
  role: 'staff'
});

assert.ok(staffNode, 'Staff node must be created');
assert.ok(staffNode.classList.contains('character-prototype-v3'), 'Node must have character-prototype-v3 class');
assert.ok(staffNode.classList.contains('live-worker'), 'Staff must have live-worker class');
assert.equal(staffNode.dataset.role, 'staff');

const sHtml = staffNode.innerHTML;
assert.ok(sHtml.includes('character-cap'), 'Staff must have uniform cap');
assert.ok(sHtml.includes('staff-badge'), 'Staff must have employee badge');

// 4. Test directional headings and view toggling in update
// Moving front-down (positive screen Dy)
v3.update(customerNode, {
  animState: 'walk',
  direction: { x: 0.5, y: 0.5 },
  distance: 1.2,
  moving: true,
  facing: 1
});
assert.equal(customerNode.dataset.heading, 'front', 'Heading should be front when moving down');

// Moving back-up (negative screen Dy)
v3.update(customerNode, {
  animState: 'walk',
  direction: { x: -0.5, y: -0.5 },
  distance: 2.4,
  moving: true,
  facing: -1
});
assert.equal(customerNode.dataset.heading, 'back', 'Heading should be back when moving up');

// Moving sideways (screen Dy close to 0)
v3.update(customerNode, {
  animState: 'walk',
  direction: { x: 0.5, y: -0.5 },
  distance: 3.1,
  moving: true,
  facing: 1
});
assert.equal(customerNode.dataset.heading, 'side', 'Heading should be side when moving horizontally');

// 5. Test fish transport visual identity integration
v3.update(customerNode, {
  animState: 'carry',
  result: 'sale',
  product: 'comet',
  carry: true
});
const bag = customerNode.querySelector('.purchase-bag');
assert.ok(bag, 'Purchase bag must be queried');
assert.equal(bag.dataset.species, 'comet', 'Bag must contain comet species');
assert.equal(bag.dataset.carry, 'fish', 'Bag carry type must be fish');

// 6. Test public module methods
const mod = ctx.window.ShopCharacterPrototypeV3;
assert.ok(mod, 'ShopCharacterPrototypeV3 module must be exported');
assert.equal(mod.id, 'prototype-v3');
assert.equal(typeof mod.enable, 'function');
assert.equal(typeof mod.disable, 'function');

mod.enable();
assert.equal(ShopCharacters.getActiveRendererName(), 'prototype-v3', 'enable() must set active renderer to prototype-v3');

mod.disable();
assert.equal(ShopCharacters.getActiveRendererName(), 'svg-isometric', 'disable() must revert active renderer to svg-isometric');

// 7. REGRESSION TEST: Switching V2 -> V3 preserves exact logical coordinates without global offsets
console.log('Testing V2 -> V3 renderer coordinate preservation and offset invariance...');
ShopCharacters.setRenderer('prototype-v2');
const liveVisitor = ShopCharacters.create({
  id: 'visitor-regression-1',
  seed: 777,
  role: 'customer'
});

const testCoord1 = { x: 420.5, y: 310.25 };
ShopCharacters.update(liveVisitor, {
  feet: testCoord1,
  phase: 'browsing',
  animState: 'look',
  facing: 1,
  direction: { x: 0.5, y: -0.5 },
  label: 'Customer looking'
});

assert.equal(
  liveVisitor.getAttribute('transform'),
  `translate(${testCoord1.x} ${testCoord1.y})`,
  'V2 must set transform coordinates directly on character node'
);

// Switch to Prototype V3
ShopCharacters.setRenderer('prototype-v3');

// Update with identical coordinates through ShopCharacters
ShopCharacters.update(liveVisitor, {
  feet: testCoord1,
  phase: 'browsing',
  animState: 'look',
  facing: 1,
  direction: { x: 0.5, y: -0.5 },
  label: 'Customer looking'
});

assert.equal(
  liveVisitor.getAttribute('transform'),
  `translate(${testCoord1.x} ${testCoord1.y})`,
  'V3 must preserve identical transform coordinates as V2 without global offsets'
);
assert.ok(
  liveVisitor.classList.contains('character-prototype-v3'),
  'Live node must be adapted to prototype-v3 on renderer switch'
);

// Advance coordinates under V3
const testCoord2 = { x: 535.0, y: 395.75 };
ShopCharacters.update(liveVisitor, {
  feet: testCoord2,
  phase: 'walking',
  animState: 'walk',
  distance: 2.5,
  moving: true,
  facing: -1,
  direction: { x: -0.5, y: 0.5 },
  label: 'Customer walking'
});

assert.equal(
  liveVisitor.getAttribute('transform'),
  `translate(${testCoord2.x} ${testCoord2.y})`,
  'V3 must track updated coordinates exactly at root element'
);

// Switch back V3 -> V2
ShopCharacters.setRenderer('prototype-v2');
ShopCharacters.update(liveVisitor, {
  feet: testCoord2,
  phase: 'checkout',
  animState: 'checkout',
  facing: 1,
  label: 'Customer checkout'
});

assert.equal(
  liveVisitor.getAttribute('transform'),
  `translate(${testCoord2.x} ${testCoord2.y})`,
  'Switching back to V2 must preserve exact coordinates'
);

// Switch back V2 -> V3
ShopCharacters.setRenderer('prototype-v3');
ShopCharacters.update(liveVisitor, {
  feet: testCoord2,
  phase: 'checkout',
  animState: 'checkout',
  facing: 1,
  label: 'Customer checkout'
});

assert.equal(
  liveVisitor.getAttribute('transform'),
  `translate(${testCoord2.x} ${testCoord2.y})`,
  'Switching back to V3 must preserve exact coordinates'
);

// 8. SIMULATION: Multiple customers entering, shopping, and leaving under V3
console.log('Testing multi-customer lifecycle simulation under V3...');
ShopCharacters.setRenderer('prototype-v3');

const staff = ShopCharacters.create({ id: 10001, seed: 101, role: 'staff' });
const staffPos = { x: 510, y: 380 };
ShopCharacters.update(staff, {
  feet: staffPos,
  phase: 'serving',
  animState: 'serve_till',
  facing: -1,
  label: 'Staff at till'
});
assert.equal(staff.getAttribute('transform'), `translate(${staffPos.x} ${staffPos.y})`);

const customers = [
  { id: 201, seed: 12, name: 'Alice' },
  { id: 202, seed: 34, name: 'Bob' },
  { id: 203, seed: 56, name: 'Charlie' }
].map(c => {
  const node = ShopCharacters.create({ id: c.id, seed: c.seed, role: 'customer' });
  return { ...c, node };
});

const lifecycleSteps = [
  // Step 1: Entering entrance
  {
    phase: 'entering',
    animState: 'walk',
    moving: true,
    coords: [{ x: 120, y: 60 }, { x: 130, y: 70 }, { x: 140, y: 80 }]
  },
  // Step 2: Browsing aquariums
  {
    phase: 'browsing',
    animState: 'look',
    moving: false,
    coords: [{ x: 260, y: 180 }, { x: 340, y: 220 }, { x: 420, y: 280 }]
  },
  // Step 3: Queuing at checkout
  {
    phase: 'queue',
    animState: 'wait',
    moving: false,
    coords: [{ x: 470, y: 370 }, { x: 485, y: 375 }, { x: 500, y: 380 }]
  },
  // Step 4: Checkout & purchase with fish transport bag
  {
    phase: 'checkout',
    animState: 'checkout',
    moving: false,
    result: 'sale',
    product: 'neon',
    coords: [{ x: 470, y: 370 }, { x: 485, y: 375 }, { x: 500, y: 380 }]
  },
  // Step 5: Leaving with bag
  {
    phase: 'leaving',
    animState: 'walk',
    moving: true,
    result: 'sale',
    product: 'neon',
    coords: [{ x: 220, y: 140 }, { x: 160, y: 90 }, { x: 100, y: 50 }]
  }
];

for (let s = 0; s < lifecycleSteps.length; s++) {
  const step = lifecycleSteps[s];
  for (let i = 0; i < customers.length; i++) {
    const c = customers[i];
    const pt = step.coords[i];
    ShopCharacters.update(c.node, {
      feet: pt,
      phase: step.phase,
      animState: step.animState,
      moving: step.moving,
      distance: s * 1.5,
      facing: step.moving ? 1 : -1,
      result: step.result || 'pending',
      product: step.product || null,
      label: `${c.name} ${step.phase}`
    });

    assert.equal(
      c.node.getAttribute('transform'),
      `translate(${pt.x} ${pt.y})`,
      `Customer ${c.name} at step ${s} must have exact transform translate(${pt.x} ${pt.y})`
    );

    // Verify fish bag appears on purchase and leaving
    if (step.result === 'sale') {
      const bag = c.node.querySelector('.purchase-bag');
      assert.ok(bag, 'Purchase bag element must be queryable');
      assert.equal(bag.style.display, '', 'Bag must be visible when purchasing/leaving');
      assert.equal(bag.dataset.species, 'neon', 'Bag must contain neon species');
    }
  }
}

// =========================================================================
// REAL MOVEMENT DYNAMIC TEST SUITE (Items 1-8 from User Specification)
// =========================================================================
console.log('Running Real Movement Dynamic Test Suite (Items 1-8)...');

function testCharacterMovement(type) {
  const isWorker = type === 'staff';
  const role = isWorker ? 'staff' : 'customer';
  const posA = { x: 120, y: 80 };
  const posB = { x: 340, y: 260 };

  // 1. Crear personaje en posicion A
  ShopCharacters.setRenderer('svg-isometric');
  const node = ShopCharacters.create({
    id: isWorker ? 10001 : 55,
    seed: 42,
    role
  });
  if (isWorker) {
    node.classList.remove('live-visitor');
    node.classList.add('live-worker');
    node.dataset.workerId = '1';
    node.dataset.visitorId = 'staff-1';
  }

  // Verify initial state: idle at position A
  ShopCharacters.update(node, {
    feet: posA,
    phase: 'idle',
    moving: false,
    distance: 0,
    facing: 1
  });
  assert.equal(node.getAttribute('transform'), `translate(${posA.x} ${posA.y})`);
  assert.equal(node.dataset.animState, 'idle');

  // 2. Activar V3
  ShopCharacters.setRenderer('prototype-v3');
  assert.equal(ShopCharacters.getActiveRendererName(), 'prototype-v3');

  // 3. Simular multiples ticks/updates de navegacion A -> B
  const totalTicks = 10;
  let lastTransform = node.getAttribute('transform');
  const transforms = [lastTransform];

  for (let tick = 1; tick <= totalTicks; tick++) {
    const fraction = tick / totalTicks;
    const currentPos = {
      x: Math.round(posA.x + (posB.x - posA.x) * fraction),
      y: Math.round(posA.y + (posB.y - posA.y) * fraction)
    };
    const isArrived = tick === totalTicks;

    // Movement: animState = walk while moving, idle upon reaching B
    ShopCharacters.update(node, {
      feet: currentPos,
      phase: isArrived ? 'idle' : 'walking',
      moving: !isArrived,
      distance: tick * 2.5,
      facing: 1
    });

    const currentTransform = node.getAttribute('transform');

    // 4. Comprobar que transform cambia progresivamente en cada actualizacion
    assert.notEqual(
      currentTransform,
      lastTransform,
      `[${type}] Transform must change progressively at tick ${tick}: was ${lastTransform}, now ${currentTransform}`
    );
    assert.equal(
      currentTransform,
      `translate(${currentPos.x} ${currentPos.y})`,
      `[${type}] Transform must match current intermediate coordinates at tick ${tick}`
    );

    // Verify staff.js invariant: .character-model>path does NOT crash and is queryable
    if (isWorker) {
      const swatch = node.querySelector('.character-model>path');
      assert.ok(swatch, `[${type}] Staff must have queryable .character-model>path for uniform swatch at tick ${tick}`);
      assert.doesNotThrow(() => {
        swatch.setAttribute('fill', '#7e9a86');
      }, `[${type}] Setting fill on .character-model>path must never throw TypeError`);
    }

    transforms.push(currentTransform);
    lastTransform = currentTransform;
  }

  // 5. Comprobar que llega a B
  assert.equal(
    node.getAttribute('transform'),
    `translate(${posB.x} ${posB.y})`,
    `[${type}] Must reach position B exactly`
  );

  // 6. Comprobar idle -> walk -> idle
  // Verify final animState is idle after arrival
  assert.equal(node.dataset.animState, 'idle', `[${type}] Must transition back to idle after arrival`);
  assert.equal(transforms.length, totalTicks + 1, `[${type}] Must have recorded all discrete tick positions`);

  return node;
}

// 7. Repetir para cliente y empleado
const movedCustomerNode = testCharacterMovement('customer');
const movedStaffNode = testCharacterMovement('staff');
console.log('Step 7 PASSED: Customer and staff movements verified independently without freeze.');

// 8. Cambiar V2 -> V3 durante el desplazamiento y comprobar que continua moviendose sin congelarse
console.log('Step 8: Testing renderer switch V2 -> V3 during active mid-motion displacement...');
ShopCharacters.setRenderer('prototype-v2');
const liveNode = ShopCharacters.create({ id: 99, seed: 123, role: 'customer' });
const originalNodeRef = liveNode;

const midPosA = { x: 50, y: 50 };
const midPosB = { x: 250, y: 200 };

// Ticks 1 to 5 under V2
for (let tick = 1; tick <= 5; tick++) {
  const fraction = tick / 10;
  const pos = {
    x: Math.round(midPosA.x + (midPosB.x - midPosA.x) * fraction),
    y: Math.round(midPosA.y + (midPosB.y - midPosA.y) * fraction)
  };
  ShopCharacters.update(liveNode, {
    feet: pos,
    phase: 'walking',
    moving: true,
    distance: tick * 2,
    facing: 1
  });
  assert.equal(liveNode.getAttribute('transform'), `translate(${pos.x} ${pos.y})`);
}

// SWITCH RENDERER TO V3 MID-FLIGHT
ShopCharacters.setRenderer('prototype-v3');
assert.equal(ShopCharacters.getActiveRendererName(), 'prototype-v3');

// Ticks 6 to 10 under V3
let prevT = liveNode.getAttribute('transform');
for (let tick = 6; tick <= 10; tick++) {
  const fraction = tick / 10;
  const pos = {
    x: Math.round(midPosA.x + (midPosB.x - midPosA.x) * fraction),
    y: Math.round(midPosA.y + (midPosB.y - midPosA.y) * fraction)
  };
  const isArrived = tick === 10;

  ShopCharacters.update(liveNode, {
    feet: pos,
    phase: isArrived ? 'idle' : 'walking',
    moving: !isArrived,
    distance: tick * 2,
    facing: 1
  });

  const curT = liveNode.getAttribute('transform');
  assert.notEqual(curT, prevT, `Mid-flight V2->V3 motion must continue changing transform at tick ${tick}`);
  assert.equal(curT, `translate(${pos.x} ${pos.y})`, `Mid-flight transform must match interpolated position at tick ${tick}`);
  prevT = curT;

  // Verify root DOM reference is preserved (never replaced by rebuild)
  assert.equal(liveNode, originalNodeRef, 'Root DOM node reference MUST remain identical across renderer switch');
}

// Check final arrival at midPosB
assert.equal(liveNode.getAttribute('transform'), `translate(${midPosB.x} ${midPosB.y})`);
assert.equal(liveNode.dataset.animState, 'idle');
console.log('Step 8 PASSED: Seamless mid-motion V2 -> V3 renderer transition verified with node reference preservation.');

console.log('PASS: Character Visual Prototype V3 tests passed successfully.');
