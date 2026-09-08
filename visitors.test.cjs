const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.clock.install({time:new Date('2026-09-08T12:00:00Z')});await page.clock.pauseAt(new Date('2026-09-08T12:00:01Z'));await page.goto('http://127.0.0.1:4174');
 const phases=new Map();let paid=0;
 async function observe(ms){
  for(let t=0;t<ms;t+=250){
   await page.clock.runFor(Math.min(250,ms-t));
   const data=await page.evaluate(()=>{
    const graph=ShopNavigation.build(state.layout,state),actors=shopCirculation.snapshot();
    return {served:state.served,actors,invalid:actors.some(a=>{
     const g=graph.grids[a.roomId],node=document.querySelector('[data-visitor-id="'+a.id+'"]');
     const xy=node.getAttribute('transform').match(/translate\(([-\d.]+) ([-\d.]+)\)/);
     const cell=ShopLayout.unproject(g.room,Number(xy[1]),Number(xy[2]));
     return !ShopNavigation.free(g,cell)||a.path.some((c,i)=>!ShopNavigation.free(g,c)||(i&&Math.abs(c.x-a.path[i-1].x)+Math.abs(c.y-a.path[i-1].y)!==1));
    })};
   });
   assert.equal(data.invalid,false,'A rendered visitor crossed an obstacle');
   for(const a of data.actors){const seen=phases.get(a.id)||new Set();seen.add(a.phase);phases.set(a.id,seen);if(a.result){assert.ok(seen.has('browsing'));assert.ok(seen.has('checkout'));assert.ok(seen.has('to-counter'))}}
   paid=data.served;
  }
 }
 await observe(45000);assert.ok(paid>=2);
 await page.screenshot({path:__dirname+'/v05-circulation-mobile.png',fullPage:true});
 // Last available unit cannot be oversold, nor replaced by a different product.
 await page.locator('#editStart').click();await page.evaluate(()=>{state.stock={betta:0,comet:1,food:0};state.money=500;state.served=0;render()});await page.locator('#editExit').click();
 await observe(60000);assert.equal(await page.evaluate(()=>state.served),1);assert.equal(await page.evaluate(()=>state.money),530);
 await page.locator('#editStart').click();
 await page.evaluate(()=>{state.stock={betta:8,comet:8,food:8};state.money=500;state.served=0;state.layout=ShopLayout.create();const c={'betta-1':[0,4],'comet-1':[5,4],'plant-2':[10,4],'warehouse-1':[0,7]};for(const o of state.layout.objects)if(c[o.id])[o.x,o.y]=c[o.id];saveGame(false)});
 await page.locator('#editExit').click();
 assert.equal(await page.locator('#accessAlert').isVisible(),true);
 await observe(25000);assert.equal(await page.evaluate(()=>state.served),0);assert.equal(await page.evaluate(()=>state.money),500);
 await page.locator('#accessAlert').click();assert.match(await page.locator('#accessList').textContent(),/Mostrador/);await page.locator('#closePanel').click();
 await page.locator('#editStart').click();await page.locator('#editObject').selectOption('plant-2');
 for(let i=0;i<10;i++)await page.locator('[data-move="-1,0"]').click();
 for(let i=0;i<2;i++)await page.locator('[data-move="0,-1"]').click();
 assert.match(await page.locator('#editAccess').textContent(),/tienen acceso/);
 await page.locator('#editConfirm').click();await page.locator('#editExit').click();
 assert.equal(await page.locator('#accessAlert').isVisible(),false);
 await observe(45000);assert.ok(await page.evaluate(()=>state.served)>0);
 for(const width of [320,390,768,1280]){await page.setViewportSize({width,height:900});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false)}
 assert.deepEqual(errors,[]);console.log('PASS: rendered feet/path obstacle checks over full visits, browse-before-checkout, last-unit sale, blocked-layout zero sales, editor warning preview, restored circulation, responsive.');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
