const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
const p=await browser.newPage({viewport:{width:1280,height:1000}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
await p.clock.install({time:new Date('2026-09-19T12:00:00Z')});await p.clock.pauseAt(new Date('2026-09-19T12:00:01Z'));
await p.goto('http://127.0.0.1:4174');await require('./test-start.cjs')(p);
await p.evaluate(()=>{Object.assign(state,{level:9,expansion:true,shelf:true,tank3:true,battery:true,employee:'eva',speed:1});state.stock=Object.fromEntries(Object.keys(products).map(k=>[k,20]));const l=ShopLayout.create();l.objects.forEach(o=>{if(['shelf','tank3','battery'].includes(o.kind))o.placed=true});state.layout=ShopLayout.migrate(l,state);delete state.logistics;saveGame(false)});await p.reload();
assert.equal(await p.locator('#polish-definitions').count(),1);
assert.ok(await p.locator('#furnitureLayer [data-species]').count()>0,'Fish remain visible immediately after reload');
assert.ok(await p.locator('.polished-character .character-head').count()>0);
for(const width of [1280,768,390,320]){await p.setViewportSize({width,height:width>800?1000:844});assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,'No overflow '+width);await p.screenshot({path:__dirname+'/polish-preview-'+width+'.png',fullPage:true})}
const before=await p.evaluate(()=>JSON.stringify(state));
await p.evaluate(()=>{drawRoom(state.layout.rooms[0]);drawFurniture(state.layout,state);syncScene()});
assert.equal(await p.evaluate(()=>JSON.stringify(state)),before,'Redrawing art cannot mutate the game state');
assert.equal(await p.locator('#polish-definitions').count(),1);
assert.deepEqual(errors,[]);console.log('PASS visual hooks, fish on reload, state-neutral redraw, 320/390/768/1280 responsive, no browser errors');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
