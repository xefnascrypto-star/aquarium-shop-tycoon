const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});const page=await browser.newPage({viewport:{width:390,height:844}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.clock.install({time:new Date('2026-09-07T12:00:00')});await page.goto('http://127.0.0.1:4174');
assert.equal(await page.locator('#money').textContent(),'500');
await page.locator('[data-object="betta"]').first().click();assert.equal(await page.locator('#panelTitle').textContent(),'Bettas');await page.locator('#objectOrder').click();assert.equal(await page.evaluate(()=>state.money),375);assert.ok(await page.evaluate(()=>state.delivery));
await page.reload();assert.equal(await page.evaluate(()=>state.money),375);assert.ok(await page.evaluate(()=>state.delivery));
await page.clock.fastForward(30000);assert.equal(await page.evaluate(()=>state.delivery),null);
await page.evaluate(()=>{state.money=1000;render()});await page.locator('[data-panel="upgrades"]').first().click();await page.locator('#shelfBtn').click();assert.equal(await page.evaluate(()=>state.money),750);await page.locator('#tankBtn').click();assert.equal(await page.evaluate(()=>state.money),400);assert.equal(await page.locator('#tank3').isVisible(),true);
await page.evaluate(()=>{upgradeShelf();upgradeTank()});assert.equal(await page.evaluate(()=>state.money),400);
await page.locator('#closePanel').click();
await page.evaluate(()=>{state.stock={betta:1,comet:0,food:0};state.served=4;state.money=500;customer()});assert.deepEqual(await page.evaluate(()=>[state.money,state.level,state.served,state.stock.betta]),[545,2,5,0]);
await page.evaluate(()=>customer());assert.equal(await page.evaluate(()=>state.money),545);
await page.evaluate(()=>{state.money=5000;state.level=7;upgradeWarehouse()});assert.equal(await page.evaluate(()=>state.capacity),20);
await page.evaluate(()=>{state.level=8;upgradeWarehouse()});assert.deepEqual(await page.evaluate(()=>[state.money,state.capacity]),[1000,50]);
await page.evaluate(()=>{state.delivery=null;state.stock.food=49;order('food',5)});assert.equal(await page.evaluate(()=>state.delivery),null);
await page.evaluate(()=>{state.stock.food=5;state.money=10;order('food',5)});assert.equal(await page.evaluate(()=>state.delivery),null);

await page.evaluate(()=>{state.restocked=0;state.shelf=false;state.tank3=false;state.warehouse=false;state.level=1;state.served=0;state.money=30;state.stock={betta:0,comet:0,food:0};state.delivery=null;render()});
assert.equal(await page.locator('#goal').textContent(),'Tu primera venta');
assert.match(await page.locator('#shopStatus').textContent(),/Reponer/);
await page.locator('.dock [data-panel="stock"]').click();
await page.locator('[data-quantity="1"]').click();
await page.locator('[data-order="comet"]').click();
assert.equal(await page.evaluate(()=>state.money),15);
assert.equal(await page.evaluate(()=>state.delivery.q),1);
await page.locator('#closePanel').click();
await page.clock.fastForward(30000);
assert.equal(await page.evaluate(()=>state.restocked),1);
assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('aquariumShopV01')).restocked),1);
await page.evaluate(()=>{state.stock.comet=1;customer()});
assert.equal(await page.locator('#goal').textContent(),'Tu primera estantería');
await page.locator('#goalAction').click();
assert.equal(await page.locator('#journeyList .complete').count(),2);
await page.locator('#journeyAction').click();
assert.equal(await page.locator('#panelTitle').textContent(),'Un poco más grande');
await page.locator('#closePanel').click();
await page.evaluate(()=>{const before=state.money;order('missing',1);order('food',-1);order('food',0);order('food',2);if(state.money!==before)throw Error('invalid orders changed money')});
await page.evaluate(()=>{state.money=500;state.served=0;state.level=1;state.stock={betta:5,comet:6,food:5};state.restocked=0;state.delivery=null;render();saveGame(false)});
await page.reload();
await page.screenshot({path:__dirname+'/v03-mobile.png',fullPage:true});
await page.setViewportSize({width:1280,height:960});
await page.screenshot({path:__dirname+'/v03-desktop.png',fullPage:true});
await page.setViewportSize({width:390,height:844});

await page.addInitScript(()=>{const s=JSON.parse(localStorage.getItem('aquariumShopV01'));if(s){s.lastSeen=Date.now()-3600000;s.money=500;localStorage.setItem('aquariumShopV01',JSON.stringify(s))}});await page.reload();assert.equal(await page.evaluate(()=>state.money),675);
await page.locator('.dock [data-panel="stock"]').click();assert.equal(await page.locator('#panel').isVisible(),true);await page.keyboard.press('Escape');assert.equal(await page.locator('#panel').isVisible(),false);
await page.locator('#zoomIn').click();assert.match(await page.locator('#world').getAttribute('transform'),/1.15/);await page.locator('#zoomReset').click();
for(const width of [320,390,768,1280]){await page.setViewportSize({width,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);}
assert.deepEqual(errors,[]);console.log('PASS: sales, stock depletion, levels, orders, delivery, persistence, legacy offline bonus, upgrade guards, capacity, context actions, keyboard, zoom, responsive 320/390/768/1280; no JS errors.');
await browser.close()})().catch(e=>{console.error(e);process.exit(1)});



