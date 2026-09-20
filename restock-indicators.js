// Restock alert & low-stock display indicators.
// Pure status inspection and lightweight SVG badge generation for sales displays.
(function(root, factory){
 const m = factory(
  typeof module === 'object' && module.exports ? require('./layout-model.js') : root.ShopLayout,
  typeof module === 'object' && module.exports ? require('./navigation.js') : root.ShopNavigation,
  typeof module === 'object' && module.exports ? require('./design.js') : root.ShopDesign
 );
 if (typeof module === 'object' && module.exports) module.exports = m;
 else root.ShopRestockIndicator = m;
})(globalThis, (L, N, D) => {
 const DISPLAY_KINDS = new Set([
  'betta', 'comet', 'tank3', 'tank4', 'tank5',
  'battery', 'professional', 'plants', 'shelf', 'shelf2'
 ]);

 function isDisplay(kind){
  return DISPLAY_KINDS.has(kind);
 }

 function indicatorOffset(kind){
  if(['battery', 'professional'].includes(kind)) return { x: 34, y: -195 };
  if(['shelf', 'shelf2'].includes(kind)) return { x: 38, y: -105 };
  if(kind === 'plants') return { x: 30, y: -45 };
  if(['betta', 'comet', 'tank3', 'tank4', 'tank5'].includes(kind)) return { x: 34, y: -130 };
  return { x: 32, y: -110 };
 }

 function getDisplayStatus(objectId, layout, gameState = {}){
  if(!layout || !Array.isArray(layout.objects)) return null;
  const o = layout.objects.find(item => item.id === objectId);
  if(!o || !isDisplay(o.kind) || o.placed === false) return null;

  const catalogGoods = N?.goods?.[o.kind] || [];
  if(!catalogGoods.length) return null;

  const isUnlocked = typeof unlocked === 'function'
   ? unlocked
   : (k => (gameState.level || 1) >= (D?.products?.[k]?.level || 1));

  const availableGoods = catalogGoods.filter(k => isUnlocked(k));
  if(!availableGoods.length) return null;

  const counts = {};
  let totalUnits = 0;
  for(const k of availableGoods){
   const count = gameState.logistics
    ? (gameState.logistics.bins?.[o.id]?.[k] || 0)
    : (gameState.stock?.[k] || 0);
   counts[k] = count;
   totalUnits += count;
  }

  let status = 'normal';
  if(totalUnits === 0) status = 'empty';
  else if(totalUnits === 1) status = 'critical';

  // Sort available goods by available count ascending so the lowest-stocked item is primary
  const sortedGoods = [...availableGoods].sort((a, b) => (counts[a] || 0) - (counts[b] || 0));
  const primaryProduct = sortedGoods[0] || availableGoods[0];

  return {
   status,
   totalUnits,
   goods: availableGoods,
   primaryProduct,
   counts
  };
 }

 function renderBadge(status, kind, rotation = 0){
  if(status !== 'empty' && status !== 'critical') return '';
  const base = indicatorOffset(kind);
  const x = rotation === 90 ? -base.x : base.x;
  const y = base.y;

  if(status === 'empty'){
   return `<g class="display-stock-badge empty" role="img" aria-label="Sin existencias · Reponer" transform="translate(${x} ${y})">` +
    `<rect x="-19" y="-9" width="38" height="18" rx="9" fill="#fff5ec" stroke="#d45d3a" stroke-width="1.5"/>` +
    `<path d="M-11 -3L-7 -6L-3 -3V2L-7 5L-11 2Z" fill="#d45d3a"/>` +
    `<path d="M-11 -3L-7 0L-3 -3M-7 0V5" fill="none" stroke="#fff5ec" stroke-width="0.75"/>` +
    `<text x="5" y="1" text-anchor="middle" dominant-baseline="central" font-family="'Trebuchet MS', sans-serif" font-size="10" font-weight="bold" fill="#b33f1e">0</text>` +
    `</g>`;
  }

  if(status === 'critical'){
   return `<g class="display-stock-badge critical" role="status" aria-label="Stock crítico: 1 unidad" transform="translate(${x} ${y})">` +
    `<rect x="-10" y="-8" width="20" height="16" rx="8" fill="#fcf8ed" stroke="#d6a958" stroke-width="1.2" opacity="0.95"/>` +
    `<text x="0" y="1" text-anchor="middle" dominant-baseline="central" font-family="'Trebuchet MS', sans-serif" font-size="10" font-weight="600" fill="#8c621d">1</text>` +
    `</g>`;
  }

  return '';
 }

 return {
  isDisplay,
  indicatorOffset,
  getDisplayStatus,
  renderBadge
 };
});
