const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
const p=await browser.newPage({viewport:{width:390,height:844}}),errors=[],failed=[];p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400)failed.push([r.url(),r.status()])});
await p.clock.install({time:new Date('2026-09-10T12:00:00Z')});await p.clock.pauseAt(new Date('2026-09-10T12:00:01Z'));
await p.goto('https://xefnascrypto-star.github.io/aquarium-shop-tycoon/?verify=v09-'+Date.now(),{waitUntil:'networkidle'});const title=await p.title();assert.ok(title.includes('v0.9'),title);
await p.locator('#shopName').fill('Océano de Barrio');await p.locator('[data-icon="wave"]').click();await p.locator('[data-color="ocean"]').click();await p.locator('.start-shop').click();
await p.locator('#editStart').click();assert.ok(await p.locator('#editorBar').isVisible());await p.locator('#editExit').click();assert.equal(await p.locator('.live-worker').count(),1);
await p.evaluate(()=>{state.level=2;state.money=1000;order('betta',1);order('food',1);showPanel('stock')});assert.equal(await p.locator('.incoming-order').count(),2);assert.ok(await p.locator('[data-order="betta"]').isEnabled());
await p.reload();assert.equal(await p.evaluate(()=>incomingOrders().length),2);assert.equal(await p.evaluate(()=>state.identity.name),'Océano de Barrio');await p.evaluate(()=>Math.random=()=>.01);
await p.clock.runFor(10000);assert.ok(await p.evaluate(()=>state.served>0));assert.ok(await p.evaluate(()=>ShopStaff.snapshot()[0].distance>0));
await p.evaluate(()=>saveGame(false));const service=await p.evaluate(()=>shopCirculation.serialize());await p.reload();assert.deepEqual(await p.evaluate(()=>shopCirculation.serialize()),service);
assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);const report={url:p.url(),title,physicalStaff:true,staffDistance:await p.evaluate(()=>ShopStaff.snapshot()[0].distance),supplierOrders:true,identity:await p.evaluate(()=>state.identity),editor:true,serviceRestored:true,errors,failed};fs.writeFileSync(__dirname+'/published-v09.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
