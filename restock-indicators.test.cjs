const assert = require('node:assert/strict');
const ShopLayout = require('./layout-model.js');
const ShopNavigation = require('./navigation.js');
const ShopDesign = require('./design.js');
const ShopRestockIndicator = require('./restock-indicators.js');

console.log('Testing ShopRestockIndicator...');

// 1. Display kind verification
assert.equal(ShopRestockIndicator.isDisplay('betta'), true, 'betta is a display');
assert.equal(ShopRestockIndicator.isDisplay('comet'), true, 'comet is a display');
assert.equal(ShopRestockIndicator.isDisplay('tank3'), true, 'tank3 is a display');
assert.equal(ShopRestockIndicator.isDisplay('tank4'), true, 'tank4 is a display');
assert.equal(ShopRestockIndicator.isDisplay('tank5'), true, 'tank5 is a display');
assert.equal(ShopRestockIndicator.isDisplay('battery'), true, 'battery is a display');
assert.equal(ShopRestockIndicator.isDisplay('professional'), true, 'professional is a display');
assert.equal(ShopRestockIndicator.isDisplay('plants'), true, 'plants is a display');
assert.equal(ShopRestockIndicator.isDisplay('shelf'), true, 'shelf is a display');
assert.equal(ShopRestockIndicator.isDisplay('shelf2'), true, 'shelf2 is a display');

// Non-displays
assert.equal(ShopRestockIndicator.isDisplay('counter'), false, 'counter is not a sales display fixture');
assert.equal(ShopRestockIndicator.isDisplay('warehouse'), false, 'warehouse is not a sales display fixture');
assert.equal(ShopRestockIndicator.isDisplay('plant'), false, 'decorative plant is not a sales display fixture');

// Setup base layout and game state for tests
const layout = ShopLayout.create();
const shelfObj = layout.objects.find(o => o.id === 'shelf-1');
if (shelfObj) shelfObj.placed = true;

const baseState = {
 level: 3,
 money: 500,
 stock: { betta: 0, comet: 0, food: 0, conditioner: 0 },
 logistics: {
  bins: {
   'betta-1': { betta: 0 },
   'comet-1': { comet: 5 },
   'shelf-1': { food: 1, conditioner: 0 }
  },
  stored: {}
 }
};

// 2. Empty stock state
const bettaStatus = ShopRestockIndicator.getDisplayStatus('betta-1', layout, baseState);
assert.ok(bettaStatus, 'betta-1 status returned');
assert.equal(bettaStatus.status, 'empty', '0 units results in empty status');
assert.equal(bettaStatus.totalUnits, 0, 'total units is 0');
assert.equal(bettaStatus.primaryProduct, 'betta', 'primary product is betta');

const emptyBadge = ShopRestockIndicator.renderBadge(bettaStatus.status, 'betta', 0);
assert.ok(emptyBadge.includes('class="display-stock-badge empty"'), 'badge has empty class');
assert.ok(emptyBadge.includes('role="img"'), 'badge has role="img"');
assert.ok(emptyBadge.includes('>0<'), 'badge displays 0 count');
assert.ok(emptyBadge.includes('transform="translate(34 -130)"'), 'badge has expected tank offset');

// 3. Critical stock state (exactly 1 unit remaining)
const shelfStatus = ShopRestockIndicator.getDisplayStatus('shelf-1', layout, baseState);
assert.ok(shelfStatus, 'shelf-1 status returned');
assert.equal(shelfStatus.status, 'critical', '1 unit total results in critical status');
assert.equal(shelfStatus.totalUnits, 1, 'total units is 1');
// conditioner is at 0 while food is at 1, so conditioner is prioritized for restock/quick-action
assert.equal(shelfStatus.primaryProduct, 'conditioner', 'lowest stocked item on shelf prioritized');

const criticalBadge = ShopRestockIndicator.renderBadge(shelfStatus.status, 'shelf', 0);
assert.ok(criticalBadge.includes('class="display-stock-badge critical"'), 'badge has critical class');
assert.ok(criticalBadge.includes('role="status"'), 'badge has role="status"');
assert.ok(criticalBadge.includes('>1<'), 'badge displays 1 count');
assert.equal(criticalBadge.includes('⚠️'), false, 'subtle indicator avoids noisy warning icons');
assert.ok(criticalBadge.includes('transform="translate(38 -105)"'), 'badge has shelf offset');

// 4. Normal stock state (>1 units)
const cometStatus = ShopRestockIndicator.getDisplayStatus('comet-1', layout, baseState);
assert.ok(cometStatus, 'comet-1 status returned');
assert.equal(cometStatus.status, 'normal', '5 units results in normal status');
assert.equal(cometStatus.totalUnits, 5, 'total units is 5');

const normalBadge = ShopRestockIndicator.renderBadge(cometStatus.status, 'comet', 0);
assert.equal(normalBadge, '', 'normal stock renders no badge');

// 5. State transitions after restocking and consumption
const dynamicState = {
 level: 3,
 logistics: {
  bins: {
   'comet-1': { comet: 0 }
  }
 }
};

// Start empty
let cometCheck = ShopRestockIndicator.getDisplayStatus('comet-1', layout, dynamicState);
assert.equal(cometCheck.status, 'empty', 'initial empty');
assert.ok(ShopRestockIndicator.renderBadge(cometCheck.status, 'comet').includes('empty'));

// Restock 1 unit -> transition to critical
dynamicState.logistics.bins['comet-1'].comet = 1;
cometCheck = ShopRestockIndicator.getDisplayStatus('comet-1', layout, dynamicState);
assert.equal(cometCheck.status, 'critical', 'transitions to critical with 1 unit');
assert.ok(ShopRestockIndicator.renderBadge(cometCheck.status, 'comet').includes('critical'));

// Restock 4 more units (total 5) -> transition to normal
dynamicState.logistics.bins['comet-1'].comet = 5;
cometCheck = ShopRestockIndicator.getDisplayStatus('comet-1', layout, dynamicState);
assert.equal(cometCheck.status, 'normal', 'transitions to normal with >1 units');
assert.equal(ShopRestockIndicator.renderBadge(cometCheck.status, 'comet'), '');

// Customer buys 4 units -> down to 1 (critical)
dynamicState.logistics.bins['comet-1'].comet = 1;
cometCheck = ShopRestockIndicator.getDisplayStatus('comet-1', layout, dynamicState);
assert.equal(cometCheck.status, 'critical', 'transitions back to critical after sale');

// Customer buys last unit -> down to 0 (empty)
dynamicState.logistics.bins['comet-1'].comet = 0;
cometCheck = ShopRestockIndicator.getDisplayStatus('comet-1', layout, dynamicState);
assert.equal(cometCheck.status, 'empty', 'transitions back to empty after selling last unit');

// 6. No mutation / side effects on logistics or economy
const stateSnapshotBefore = JSON.stringify(baseState);
ShopRestockIndicator.getDisplayStatus('betta-1', layout, baseState);
ShopRestockIndicator.getDisplayStatus('comet-1', layout, baseState);
ShopRestockIndicator.getDisplayStatus('shelf-1', layout, baseState);
const stateSnapshotAfter = JSON.stringify(baseState);
assert.equal(stateSnapshotBefore, stateSnapshotAfter, 'indicator checks are pure and have zero side effects');

// 7. Rotation handling
const rot0Badge = ShopRestockIndicator.renderBadge('empty', 'betta', 0);
assert.ok(rot0Badge.includes('translate(34 -130)'), 'unrotated badge at positive x');
const rot90Badge = ShopRestockIndicator.renderBadge('empty', 'betta', 90);
assert.ok(rot90Badge.includes('translate(-34 -130)'), 'rotated 90 badge has mirrored x without flipping text');

// 8. Legacy state fallback (when state.logistics is not defined)
const legacyState = {
 level: 2,
 stock: { betta: 1, comet: 0 }
};
const legacyBetta = ShopRestockIndicator.getDisplayStatus('betta-1', layout, legacyState);
assert.equal(legacyBetta.status, 'critical', 'legacy state without logistics correctly reads stock');
assert.equal(legacyBetta.totalUnits, 1);

const legacyComet = ShopRestockIndicator.getDisplayStatus('comet-1', layout, legacyState);
assert.equal(legacyComet.status, 'empty', 'legacy state without logistics reads 0 as empty');

// 9. Unplaced objects return null
const unplacedLayout = {
 objects: [
  { id: 'tank-3', kind: 'tank3', placed: false }
 ]
};
assert.equal(ShopRestockIndicator.getDisplayStatus('tank-3', unplacedLayout, baseState), null, 'unplaced fixture returns null');

console.log('PASS: ShopRestockIndicator tests passed successfully.');
