const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[],levels=[],phases=new Set();page.on('pageerror',e=>errors.push(e.message));
// The long economy regression uses 10 Hz; polish.test.cjs audits native-frame rendering.
await page.addInitScript(()=>{window.requestAnimationFrame=cb=>setTimeout(()=>cb(performance.now()),100);let seed=927;Math.random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};window.addEventListener('levelup',e=>{if(e.detail===10)window.tenArrival={money:state.money,served:state.served}})});
await page.clock.install({time:new Date('2026-09-08T12:00:00Z')});await page.clock.pauseAt(new Date('2026-09-08T12:00:01Z'));await page.goto('http://127.0.0.1:4174');await require('./test-start.cjs')(page);
await page.evaluate(()=>{let seed=927;Math.random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}});
assert.equal(await page.locator('#money').textContent(),'500');
await page.locator('[data-panel="settings"]').click();await page.locator('#gameSpeed').selectOption('12');await page.locator('#closePanel').click();
let previous=0,pendingTested=false,full=false;const report=[];
for(let step=0;step<3000;step++){
 const info=await page.evaluate(()=>({level:state.level,money:state.money,served:state.served,xp:state.xp,kits:state.kits,employee:state.employee,wages:state.wagesPaid,stock:{...state.stock},delivery:incomingOrders()[0]||null,pending:shopEditor.pending().map(o=>o.id),needs:requirements(state.level+1),layout:state.layout}));
 if(info.level!==previous){levels.push(info.level);report.push({step,level:info.level,money:info.level===10?(await page.evaluate(()=>window.tenArrival.money)):info.money,sampledMoney:info.money,served:info.served,xp:info.xp});console.log('LEVEL',JSON.stringify(report.at(-1)));previous=info.level;await page.screenshot({path:__dirname+'/v09-level-'+info.level+'.png',fullPage:true})}
 if(info.level===10){const at=await page.evaluate(()=>window.tenArrival);assert.ok(at&&at.money>=12000&&at.money<17000,'reserve at actual level-up');full=true;if(info.money>=12000)break;await page.clock.runFor(1000);continue}
 if(info.pending.length){
  const id=info.pending[0];await page.evaluate(id=>shopEditor.begin(id),id);
  if(!pendingTested){
   const money=await page.evaluate(()=>state.money);await page.locator('#editCancel').click();await page.locator('#editExit').click();await page.reload();assert.equal(await page.evaluate(()=>state.money),money);assert.ok(await page.evaluate(id=>shopEditor.pending().some(o=>o.id===id),id));pendingTested=true;await page.evaluate(id=>shopEditor.begin(id),id);
  }
  await page.locator('#editSuggest').click();assert.equal(await page.locator('#editConfirm').isEnabled(),true);
  await page.locator('#editConfirm').click();await page.locator('#editExit').click();
  continue;
 }
 const action=await page.evaluate(()=>{
 const needed=['shelf','tank3','expansion','battery','warehouse'].find(k=>!state[k]&&!upgradeReason(k));
 if(needed){buyUpgrade(needed);return 'upgrade '+needed}
 if(state.level>=9&&!state.employee&&state.money>=1500){hire('eva');return 'hire'}
 if(state.level>=4&&!state.kits&&!state.kitRequested){$('kitAccept').click();return 'kit'}
 if(state.level<2||incomingOrders().length)return '';
 // Reserve the kit, keep a modest range stocked, and compare suppliers when introduced.
 let keys=Object.keys(products).filter(k=>unlocked(k)&&(!products[k].investment));
 if(state.level===3&&!((state.sold.guppy||0)+(state.sold.platy||0)))keys=keys.sort((a,b)=>(b==='guppy')-(a==='guppy'));
 if(state.level===6&&placed('battery')&&!state.groupSales)keys=keys.sort((a,b)=>(b==='neon')-(a==='neon'));
 if(state.kitRequested)keys.sort((a,b)=>(ShopDesign.kit[b]||0)-(ShopDesign.kit[a]||0));
 const k=keys.find(k=>state.stock[k]<(state.kitRequested&&ShopDesign.kit[k]?1:products[k].vol===0?5:1)&&used()+products[k].vol<=state.capacity&&state.money>=products[k].buy);
 if(!k){rescue();return ''}
 const wholesale=state.level>=7&&(!state.supplierReceived.wholesale||state.supplierReceived.local>0)&&products[k].vol===0&&state.money>=Math.ceil(products[k].buy*.85)*10;
 state.supplier=wholesale?'wholesale':'local';
 let q=wholesale?(state.money>=Math.ceil(products[k].buy*.85)*20?20:10):products[k].vol===0&&state.money>=products[k].buy*5?5:1;
 order(k,q);return 'order '+k+' '+q;
 });
 await page.clock.runFor(1000);
 const check=await page.evaluate(()=>{
 const g=ShopNavigation.build(state.layout,state).grids.main,actors=shopCirculation.snapshot();
 return {phases:actors.map(a=>a.phase),invalid:actors.some(a=>{const node=document.querySelector('[data-visitor-id="'+a.id+'"]'),xy=node.getAttribute('transform').match(/translate\(([-\d.]+) ([-\d.]+)\)/);return !ShopNavigation.free(g,ShopLayout.unproject(g.room,+xy[1],+xy[2]))||a.path.some(c=>!ShopNavigation.free(g,c))}),money:state.money,stock:Object.values(state.stock),s:state.served};
 });
 check.phases.forEach(p=>phases.add(p));assert.equal(check.invalid,false,'Actor crossed furniture');assert.ok(check.money>=0);assert.ok(check.stock.every(q=>q>=0));
 if(step%150===0)console.log('PROGRESS',step,JSON.stringify({level:info.level,money:info.money,sales:info.served,needs:info.needs,action}));
 assert.deepEqual(errors,[]);
}
assert.equal(full,true,'Did not reach level 10');assert.deepEqual(levels,[1,2,3,4,5,6,7,8,9,10]);assert.ok(phases.has('service-queue'));assert.ok(phases.has('staff-working'));assert.ok(phases.has('checkout'));
const before=await page.evaluate(()=>({money:state.money,pearls:state.pearls,wages:state.wagesPaid,employee:state.employee,kits:state.kits,group:state.groupSales,suppliers:state.supplierReceived,layout:state.layout}));
assert.equal(before.pearls,10);assert.ok(before.wages>0&&before.kits>0&&before.group>0&&before.suppliers.wholesale>0);
await page.evaluate(()=>buyUpgrade('plants'));assert.equal(await page.evaluate(()=>state.money),before.money-12000);assert.ok(await page.evaluate(()=>shopEditor.pending().some(o=>o.kind==='plants')));
await page.locator('#editSuggest').click();assert.equal(await page.locator('#editConfirm').isEnabled(),true);await page.locator('#editConfirm').click();await page.locator('#editExit').click();
const final=await page.evaluate(()=>{saveGame(false);return JSON.parse(JSON.stringify(state))});await page.reload();
assert.deepEqual(await page.evaluate(()=>state.layout),final.layout);assert.equal(await page.evaluate(()=>state.money),final.money);assert.equal(await page.evaluate(()=>state.investment),'plants');
assert.equal(await page.evaluate(()=>state.professional||false),false);assert.equal(await page.evaluate(()=>state.warehouse2||false),false);
for(const width of [320,390,768,1280]){await page.setViewportSize({width,height:960});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await page.screenshot({path:__dirname+'/v09-finished-'+width+'.png',fullPage:true})}
assert.deepEqual(errors,[]);fs.writeFileSync(__dirname+'/playthrough-v09.json',JSON.stringify({levels:report,final:{money:final.money,served:final.served,level:final.level,xp:final.xp,pearls:final.pearls,kits:final.kits,groupSales:final.groupSales,employee:final.employee,wages:final.wagesPaid,lost:final.lost,investment:final.investment},checks:'Physical paths, pending cancel/reload, placement confirmation, all ten levels without money/XP cheats, suppliers, kit, groups, wages, first investment, persistence, responsive. PASS'},null,2));
console.log('PASS: complete new game 1–10 through actual customers, orders, editor, expansion, kit, groups, suppliers, employee, wages and one investment.');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
