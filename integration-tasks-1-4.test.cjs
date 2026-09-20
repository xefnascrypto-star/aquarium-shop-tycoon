const assert = require('node:assert/strict');

// Load all systems
const ShopDesign = require('./design.js');
const ShopLayout = require('./layout-model.js');
const ShopNavigation = require('./navigation.js');
const ShopOrders = require('./supplier-orders.js');
const ShopRestockIndicator = require('./restock-indicators.js');
const ShopI18n = require('./i18n.js');

console.log('--- RUNNING INTEGRATION SUITE: TASKS 1 TO 4 ---');

// 1. Initial State Setup
const catalog = ShopDesign.products;
const layout = ShopLayout.create();

// Ensure shelf and tank fixtures are placed
for (const o of layout.objects) {
  if (['shelf-1', 'betta-1', 'comet-1'].includes(o.id)) {
    o.placed = true;
  }
}

const gameState = {
  level: 3,
  money: 1000,
  orders: [],
  orderSerial: 0,
  stock: {
    betta: 0,
    comet: 0,
    food: 0,
    conditioner: 0
  },
  logistics: {
    version: 1,
    bins: {
      'betta-1': { betta: 0 },
      'comet-1': { comet: 0 },
      'shelf-1': { food: 0, conditioner: 0 }
    },
    stored: {
      betta: 0,
      comet: 0,
      food: 0,
      conditioner: 0
    },
    transports: {}
  }
};

// =========================================================================
// TEST 1: Initial Empty Fixtures & Indicators (Task 4)
// =========================================================================
console.log('1. Verifying initial empty display indicators...');
const bettaInitial = ShopRestockIndicator.getDisplayStatus('betta-1', layout, gameState);
assert.equal(bettaInitial.status, 'empty', 'betta-1 starts empty');
assert.equal(bettaInitial.totalUnits, 0);
assert.equal(bettaInitial.primaryProduct, 'betta');
const bettaBadge = ShopRestockIndicator.renderBadge(bettaInitial.status, 'betta', 0);
assert.ok(bettaBadge.includes('display-stock-badge empty'), 'betta-1 has empty badge markup');
assert.ok(bettaBadge.includes('>0<'), 'displays 0 count');

const shelfInitial = ShopRestockIndicator.getDisplayStatus('shelf-1', layout, gameState);
assert.equal(shelfInitial.status, 'empty', 'shelf-1 starts empty');
assert.equal(shelfInitial.totalUnits, 0);

// =========================================================================
// TEST 2: Supplier Multi-Order Placement & Timers (Tasks 1 & 2)
// =========================================================================
console.log('2. Placing simultaneous supplier orders...');
const now = 100000;
// Order 5 betta (30s) and 10 food (30s) from local supplier
const quoteBetta = ShopOrders.quote(catalog, 'betta', 5, 'local');
const quoteFood = ShopOrders.quote(catalog, 'food', 10, 'local');

assert.ok(quoteBetta, 'betta order quote valid');
assert.ok(quoteFood, 'food order quote valid');

const order1 = {
  id: 'order-1',
  k: 'betta',
  q: 5,
  ...quoteBetta,
  duration: quoteBetta.seconds * 1000,
  remaining: quoteBetta.seconds * 1000,
  status: 'in_transit',
  orderedAt: now,
  supplier: 'local'
};

const order2 = {
  id: 'order-2',
  k: 'food',
  q: 10,
  ...quoteFood,
  duration: quoteFood.seconds * 1000,
  remaining: quoteFood.seconds * 1000,
  status: 'in_transit',
  orderedAt: now,
  supplier: 'local'
};

gameState.orders.push(order1, order2);
assert.equal(gameState.orders.length, 2, '2 concurrent orders placed');
assert.equal(ShopOrders.reserved(gameState.orders, catalog), 10, 'reserved volume matches dry goods volume (food vol 1 * 10, fish vol 0)');

// Advance 15 seconds: neither should be delivered yet
const midway = ShopOrders.advance(gameState.orders, 15, now + 15000);
assert.equal(midway.length, 0, 'no deliveries at 15s');
assert.equal(gameState.orders[0].remaining, 15000);
assert.equal(gameState.orders[1].remaining, 15000);

// Advance remaining 15 seconds: both 30s orders complete independently
const completed = ShopOrders.advance(gameState.orders, 15, now + 30000);
assert.equal(completed.length, 2, 'both orders completed at 30s');
assert.equal(completed[0].k, 'betta');
assert.equal(completed[1].k, 'food');

// Deliver goods to stock
for (const o of completed) {
  gameState.stock[o.k] = (gameState.stock[o.k] || 0) + o.q;
  gameState.logistics.stored[o.k] = (gameState.logistics.stored[o.k] || 0) + o.q;
}

assert.equal(gameState.stock.betta, 5, '5 betta received');
assert.equal(gameState.stock.food, 10, '10 food received');

// =========================================================================
// TEST 3: Restocking Transitions & Dynamic Indicators (Task 4)
// =========================================================================
console.log('3. Restocking displays and verifying indicator state transitions...');

// Worker transfers 1 unit of betta from storage to betta-1 display
gameState.logistics.stored.betta -= 1;
gameState.logistics.bins['betta-1'].betta = 1;

// Now betta-1 has 1 unit -> transition to critical
const bettaCritical = ShopRestockIndicator.getDisplayStatus('betta-1', layout, gameState);
assert.equal(bettaCritical.status, 'critical', 'betta-1 is now critical with 1 unit');
const criticalBadge = ShopRestockIndicator.renderBadge(bettaCritical.status, 'betta', 0);
assert.ok(criticalBadge.includes('display-stock-badge critical'), 'shows critical badge');
assert.ok(criticalBadge.includes('>1<'), 'shows count 1');

// Worker transfers 4 more units of betta to betta-1 display (total 5)
gameState.logistics.stored.betta -= 4;
gameState.logistics.bins['betta-1'].betta = 5;

// Now betta-1 has 5 units -> transition to normal (badge hidden)
const bettaNormal = ShopRestockIndicator.getDisplayStatus('betta-1', layout, gameState);
assert.equal(bettaNormal.status, 'normal', 'betta-1 is normal with 5 units');
const normalBadge = ShopRestockIndicator.renderBadge(bettaNormal.status, 'betta', 0);
assert.equal(normalBadge, '', 'no badge shown when stock is healthy');

// Restock shelf with 1 food, 0 conditioner -> total 1 -> critical
gameState.logistics.stored.food -= 1;
gameState.logistics.bins['shelf-1'].food = 1;
const shelfCritical = ShopRestockIndicator.getDisplayStatus('shelf-1', layout, gameState);
assert.equal(shelfCritical.status, 'critical', 'shelf-1 is critical with 1 food + 0 conditioner');
// Primary product to reorder should be conditioner (0 in stock)
assert.equal(shelfCritical.primaryProduct, 'conditioner', 'prioritizes 0-count conditioner');

// =========================================================================
// TEST 4: Customer Bubbles & Thought Reactions (Task 3)
// =========================================================================
console.log('4. Verifying customer thought bubbles and reactions...');

// Check thought text generation and formatting
ShopI18n.set('es');
const browsingText = ShopI18n.t('seeking', { name: catalog.betta.name });
assert.ok(browsingText.includes('Betta'), 'browsing bubble references product');

const blockedText = ShopI18n.t('blocked');
assert.ok(blockedText.length > 0, 'blocked bubble translation exists');

const checkoutText = ShopI18n.t('checkout');
assert.ok(checkoutText.length > 0, 'checkout bubble translation exists');

// Simulated customer purchase cycle:
// Customer buys 4 bettas -> leaves 1 unit on display -> triggers critical indicator
gameState.stock.betta -= 4;
gameState.logistics.bins['betta-1'].betta -= 4;
assert.equal(gameState.logistics.bins['betta-1'].betta, 1);

const postSale1 = ShopRestockIndicator.getDisplayStatus('betta-1', layout, gameState);
assert.equal(postSale1.status, 'critical', 'display drops back to critical after customer sales');

// Another customer buys last betta -> leaves 0 units -> triggers empty indicator
gameState.stock.betta -= 1;
gameState.logistics.bins['betta-1'].betta -= 1;
assert.equal(gameState.logistics.bins['betta-1'].betta, 0);

const postSale2 = ShopRestockIndicator.getDisplayStatus('betta-1', layout, gameState);
assert.equal(postSale2.status, 'empty', 'display drops to empty after selling out');
assert.ok(ShopRestockIndicator.renderBadge(postSale2.status, 'betta', 0).includes('empty'));

// =========================================================================
// TEST 5: i18n Bilingual Integrity across all new strings
// =========================================================================
console.log('5. Verifying ES and EN bilingual keys for all Tasks 1-4...');
const requiredKeys = [
  'displayEmptyBanner',
  'displayCriticalBanner',
  'orderFromSupplier',
  'orderGoods',
  'ordersTitle',
  'ordersEmpty',
  'ordersCapacity',
  'orderInTransit',
  'orderSupplier',
  'orderItems',
  'orderStatus',
  'orderDelivered',
  'orderSeconds',
  'orderCost',
  'ordersSummary',
  'orderPlaced',
  'orderArrived',
  'ordersArrived',
  'seeking',
  'blocked',
  'checkout',
  'later',
  'pay',
  'thanks'
];

for (const key of requiredKeys) {
  // Test ES (default)
  ShopI18n.set('es');
  const esVal = ShopI18n.t(key, { name: 'Cometa', count: 1, quantity: 1, product: 'Cometa', seconds: 30, cost: 10, used: 0, reserved: 0, capacity: 50, free: 50 });
  assert.ok(esVal && !esVal.startsWith('[missing'), `ES translation for ${key} exists: "${esVal}"`);

  // Test EN
  ShopI18n.set('en');
  const enVal = ShopI18n.t(key, { name: 'Comet', count: 1, quantity: 1, product: 'Comet', seconds: 30, cost: 10, used: 0, reserved: 0, capacity: 50, free: 50 });
  assert.ok(enVal && !enVal.startsWith('[missing'), `EN translation for ${key} exists: "${enVal}"`);
}
// Reset language back to ES
ShopI18n.set('es');

console.log('--- ALL INTEGRATION VERIFICATIONS PASSED SUCCESSFULLY ---');
