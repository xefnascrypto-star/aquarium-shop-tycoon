const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try{
 const page=await browser.newPage({viewport:{width:390,height:844}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.clock.install({time:new Date('2026-09-08T00:00:00Z')});
 await page.clock.pauseAt(new Date('2026-09-08T00:00:01Z'));
 await page.goto('http://127.0.0.1:4174');
 assert.equal(await page.locator('.live-visitor').count(),1);
 assert.equal(await page.evaluate(()=>state.served),0);
 await page.clock.runFor(7000);
 assert.equal(await page.locator('.live-visitor').getAttribute('data-phase'),'checkout');
 await page.locator('.live-visitor').click();
 assert.match(await page.locator('#visitorInfo').textContent(),/En caja/);
 await page.clock.runFor(999);assert.equal(await page.evaluate(()=>state.served),0);
 await page.clock.runFor(1);assert.equal(await page.evaluate(()=>state.served),1);
 assert.equal(await page.locator('.live-visitor').count(),2);
 assert.equal(await page.locator('[data-result="sale"]').count(),1);
 assert.match(await page.locator('#visitorInfo').textContent(),/Ha comprado/);
 const money=await page.evaluate(()=>state.money);
 assert.ok([530,535,545].includes(money));
 assert.equal(await page.evaluate(()=>Object.values(state.stock).reduce((a,b)=>a+b,0)),15);
 await page.locator('#closePanel').click();
 await page.screenshot({path:__dirname+'/v04-checkout-mobile.png',fullPage:true});
 await page.clock.runFor(4100);assert.equal(await page.locator('.live-visitor').count(),1);
 await page.evaluate(()=>{state.stock={betta:0,comet:0,food:0};render()});
 await page.clock.runFor(3900);
 assert.equal(await page.evaluate(()=>state.money),money);
 assert.equal(await page.evaluate(()=>state.served),1);
 assert.equal(await page.locator('[data-result="empty"]').count(),1);
 await page.reload();assert.equal(await page.evaluate(()=>state.served),1);
 await page.evaluate(()=>{state.stock={betta:0,comet:1,food:0};render()});
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.clock.runFor(8000);
 assert.equal(await page.evaluate(()=>state.served),2);
 assert.equal(await page.evaluate(()=>state.money),money+30);
 await page.clock.runFor(8000);assert.equal(await page.evaluate(()=>state.served),2);
 for(const width of [320,390,768,1280]){await page.setViewportSize({width,height:900});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);}
 assert.deepEqual(errors,[]);
 console.log('PASS: checkout at 8s, one charge, inventory decrement, visit inspection, exit removal, empty-stock departure, reload, reduced motion, four widths, no JS errors.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
