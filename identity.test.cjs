const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
const p=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
p.on('pageerror',e=>errors.push(e.message));
await p.clock.install({time:new Date('2026-09-09T12:00:00Z')});await p.clock.pauseAt(new Date('2026-09-09T12:00:01Z'));
await p.goto('http://127.0.0.1:4174');
assert.equal(await p.locator('#shopCreation').isVisible(),true);
await p.clock.runFor(15000);
assert.deepEqual(await p.evaluate(()=>({money:state.money,potential:state.potential,visitors:shopCirculation.snapshot().length,save:localStorage.getItem('aquariumShopV01')})),{money:500,potential:0,visitors:0,save:null});
await p.locator('#identityLanguage').selectOption('en');assert.equal(await p.locator('.start-shop').textContent(),'Open my shop →');
await p.locator('#shopName').fill('The Little Reef');await p.locator('[data-color="plum"]').click();await p.locator('[data-icon="coral"]').click();await p.locator('[data-shape="soft"]').click();
assert.equal(await p.locator('#brandPreview b').textContent(),'The Little Reef');
await p.screenshot({path:__dirname+'/v08-creation-mobile.png',fullPage:true});
await p.locator('#identityLanguage').selectOption('es');await p.locator('#shopName').fill('La Casa del Betta');await p.locator('[data-color="ocean"]').click();await p.locator('[data-icon="betta"]').click();await p.locator('.start-shop').click();
const identity=await p.evaluate(()=>state.identity);
assert.deepEqual(identity,{version:1,name:'La Casa del Betta',color:'ocean',icon:'betta',shape:'soft',locale:'es'});
assert.equal(await p.locator('.heading h1').textContent(),identity.name);
assert.ok((await p.locator('#shopSign').textContent()).includes(identity.name));
assert.ok(await p.locator('.shop-clerk .brand-badge').count());
await p.reload();assert.deepEqual(await p.evaluate(()=>state.identity),identity);assert.equal(await p.locator('#shopCreation').count(),0);
const phases=new Set();let bag=false;for(let i=0;i<90;i++){await p.clock.runFor(500);for(const a of await p.evaluate(()=>shopCirculation.snapshot()))phases.add(a.phase);if(await p.locator('.live-visitor[data-result="sale"] .purchase-bag').count()){assert.equal(await p.locator('.live-visitor[data-result="sale"] .purchase-bag').first().isVisible(),true);bag=true}}
assert.ok(bag,'physical purchase produces a bag');assert.ok(phases.has('browsing')&&phases.has('checkout')&&phases.has('leaving'));assert.ok(await p.evaluate(()=>state.served>0));
await p.locator('#editStart').click();await p.locator('#editObject').selectOption('betta-1');await p.locator('#editSuggest').click();await p.locator('#editConfirm').click();await p.locator('#editExit').click();
await p.evaluate(()=>saveGame(false));const preserved=await p.evaluate(()=>({identity:state.identity,layout:state.layout,money:state.money,stock:state.stock,level:state.level}));await p.reload();
assert.deepEqual(await p.evaluate(()=>({identity:state.identity,layout:state.layout,money:state.money,stock:state.stock,level:state.level})),preserved);
for(const width of [320,390,768,1280]){await p.setViewportSize({width,height:844});assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await p.screenshot({path:__dirname+'/v08-shop-'+width+'.png',fullPage:true})}
// Legacy identity migration leaves every existing business field untouched.
await p.evaluate(()=>{const old=JSON.parse(localStorage.getItem('aquariumShopV01'));resetting=true;delete old.identity;delete old.orders;delete old.orderSerial;delete old.ordersVersion;old.money=4321;old.level=7;old.employee='eva';old.delivery={k:'food',q:5,remaining:12000,supplier:'local'};localStorage.setItem('aquariumShopV01',JSON.stringify(old));window.legacy=old});
const old=await p.evaluate(()=>window.legacy);await p.reload();
const migrated=await p.evaluate(()=>state);for(const key of ['money','level','employee','stock','layout','served','xp'])assert.deepEqual(migrated[key],old[key],key);
assert.equal(await p.locator('#shopCreation').count(),0);assert.ok(migrated.identity.name);assert.equal(migrated.orders[0].remaining,old.delivery.remaining);assert.equal(migrated.orders[0].k,old.delivery.k);
await p.evaluate(()=>{state.identity=ShopIdentity.normalize({name:'WWWWWWWWWWWWWWWWWWWWWWWWWWWW'});render()});assert.ok(await p.locator('#shopSign text').first().evaluate(n=>n.getComputedTextLength()<=122.01));
// User-supplied text remains inert in every logo/surface.
await p.evaluate(()=>{state.identity=ShopIdentity.normalize({name:'<img src=x onerror=alert(1)>',icon:'initials',color:'url(bad)',shape:'evil'});render();saveGame(false)});
assert.equal(await p.locator('#shopSign img').count(),0);assert.equal(await p.locator('#brandPreview img').count(),0);assert.equal(await p.evaluate(()=>state.identity.color),'sage');
assert.equal(await p.evaluate(()=>Object.keys(ShopI18n.messages.es).sort().join()===Object.keys(ShopI18n.messages.en).sort().join()),true);
const variants=await p.evaluate(()=>new Set(Array.from({length:28},(_,i)=>JSON.stringify(ShopCharacters.profile(i+1)))).size);assert.equal(variants,28);
const species=await p.evaluate(()=>{
const root=document.createElementNS('http://www.w3.org/2000/svg','g');root.innerHTML='<g class="fish-swim"></g>';const seen=[];
for(const kind of ['betta','comet','tank3','battery']){delete root.dataset.fishStock;ShopFish.paint(root,kind,Object.fromEntries(Object.keys(ShopFish.catalog).map(k=>[k,5])));seen.push(...[...root.querySelectorAll('[data-species]')].map(n=>n.dataset.species))}
return [...new Set(seen)]});
assert.deepEqual(species.sort(),['betta','comet','guppy','platy','neon','molly','cory','ancistrus'].sort());
await p.locator('[data-panel="settings"]').click();await p.locator('#customizeShop').click();const beforeEdit=await p.evaluate(()=>({money:state.money,visitors:shopCirculation.snapshot()}));await p.clock.runFor(5000);assert.deepEqual(await p.evaluate(()=>({money:state.money,visitors:shopCirculation.snapshot()})),beforeEdit);
await p.locator('#shopName').fill('Océano de Barrio');await p.locator('[data-icon="wave"]').click();await p.locator('.start-shop').click();assert.equal(await p.evaluate(()=>state.identity.name),'Océano de Barrio');
await p.locator('[data-panel="settings"]').click();await p.locator('#customizeShop').click();await p.locator('#shopName').fill('Cambio cancelado');await p.locator('#cancelIdentity').click();assert.equal(await p.evaluate(()=>state.identity.name),'Océano de Barrio');
await p.locator('[data-panel="settings"]').click();p.once('dialog',d=>d.accept());await p.locator('#resetBtn').click();await p.waitForSelector('#shopCreation');assert.equal(await p.evaluate(()=>state.money),500);assert.equal(await p.evaluate(()=>localStorage.getItem('aquariumShopV01')),null);
assert.deepEqual(errors,[]);fs.writeFileSync(__dirname+'/identity-v08-report.json',JSON.stringify({identity,phases:[...phases],bag,variants,species,legacyMigration:true,reset:true,errors},null,2));console.log('PASS: onboarding pause, ES/EN, brand, physical branded purchase, editor/save/reload, legacy migration, safe name rendering, 28 profiles, eight fish, reset, responsive');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
