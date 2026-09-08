const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
 const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.clock.install({time:new Date('2026-09-08T01:00:00Z')});await page.clock.pauseAt(new Date('2026-09-08T01:00:01Z'));
 await page.goto('http://127.0.0.1:4174');
 assert.equal(await page.locator('[data-instance]').count(),8);
 assert.equal(await page.evaluate(()=>state.layout.version),1);
 await page.screenshot({path:__dirname+'/v04-before-edit-mobile.png',fullPage:true});
 await page.locator('#editStart').click();await page.locator('#editObject').selectOption('plant-1');
 await page.locator('[data-move="1,0"]').click();await page.locator('#editRotate').click();
 assert.equal(await page.evaluate(()=>state.layout.objects.find(o=>o.id==='plant-1').x),0);
 await page.locator('#editConfirm').click();
 assert.deepEqual(await page.evaluate(()=>{const o=state.layout.objects.find(o=>o.id==='plant-1');return [o.x,o.rotation]}),[1,90]);
 await page.locator('#editObject').selectOption('plant-1');await page.locator('[data-move="1,0"]').click();await page.locator('#editCancel').click();
 assert.equal(await page.evaluate(()=>state.layout.objects.find(o=>o.id==='plant-1').x),1);
 await page.locator('#editUndo').click();assert.equal(await page.evaluate(()=>state.layout.objects.find(o=>o.id==='plant-1').x),0);
 await page.locator('#editObject').selectOption('plant-2');await page.locator('[data-move="0,-1"]').click();assert.equal(await page.locator('#editConfirm').isEnabled(),false);assert.match(await page.locator('#editHelp').textContent(),/entrada/);
 await page.locator('#editCancel').click();await page.locator('#editObject').selectOption('plant-1');
 await page.locator('[data-move="-1,0"]').click();assert.equal(await page.locator('#editConfirm').isEnabled(),false);
 await page.locator('#editCancel').click();
 const before=await page.evaluate(()=>[state.money,state.served]);await page.clock.runFor(16000);assert.deepEqual(await page.evaluate(()=>[state.money,state.served]),before);
 await page.locator('#editObject').selectOption('plant-1');await page.locator('[data-move="1,0"]').click();await page.locator('#editRotate').click();await page.locator('#editConfirm').click();
 await page.screenshot({path:__dirname+'/v04-editor-mobile.png',fullPage:true});
 await page.locator('#editExit').click();await page.reload();
 assert.deepEqual(await page.evaluate(()=>{const o=state.layout.objects.find(o=>o.id==='plant-1');return [o.x,o.rotation]}),[1,90]);
 await page.clock.runFor(8000);assert.equal(await page.evaluate(()=>state.served),before[1]+1);

 // Long press opens editing without invoking the normal object menu.
 const target=page.locator('[data-instance="plant-3"]');
 const r=await target.boundingBox();await page.mouse.move(r.x+r.width/2,r.y+r.height/2);await page.mouse.down();await page.clock.runFor(600);await page.mouse.up();
 assert.equal(await page.locator('#editorBar').isVisible(),true);
 assert.equal(await page.locator('#editObject').inputValue(),'plant-3');
 await page.locator('#editCancel').click();await page.locator('#editExit').click();
 // Touch selection and dragging are measured through the world camera matrix.
 await page.locator('#editStart').tap();
 await page.locator('[data-instance="plant-3"]').tap();
 assert.equal(await page.locator('#editObject').inputValue(),'plant-3');
 const box=await page.locator('[data-instance="plant-3"]').boundingBox();
 const delta=await page.evaluate(()=>{const m=document.getElementById('world').getScreenCTM();return {x:m.a*30+m.c*15,y:m.b*30+m.d*15}});
 await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.mouse.move(box.x+box.width/2+delta.x,box.y+box.height/2+delta.y,{steps:4});await page.mouse.up();
 assert.equal(await page.locator('#editConfirm').isEnabled(),true);await page.locator('#editConfirm').click();
 assert.equal(await page.evaluate(()=>state.layout.objects.find(o=>o.id==='plant-3').x),1);
 await page.locator('#editExit').click();

 // A new upgrade is placed around edited furniture, not over it.
 await page.evaluate(()=>{state.money=1000;state.shelf=true;const o=state.layout.objects.find(o=>o.id==='plant-1');o.x=5;o.y=3;upgradeTank()});
 assert.equal(await page.evaluate(()=>state.tank3),true);
 assert.equal(await page.evaluate(()=>state.layout.objects.filter(o=>ShopLayout.owned(o,state)).every(o=>!ShopLayout.validate(state.layout,o,state))),true);
 await page.locator('#editStart').click();await page.locator('#editObject').selectOption('counter-1');
 await page.locator('#editRotate').click();assert.equal(await page.locator('#editConfirm').isEnabled(),false);
 await page.locator('#editExit').click();
 for(const width of [320,390,768,1280]){await page.setViewportSize({width,height:900});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false)}
 await page.setViewportSize({width:1280,height:960});await page.screenshot({path:__dirname+'/v04-layout-desktop.png',fullPage:true});

 // Rectangular object: the swapped footprint is validated and its orientation persists.
 await page.reload();
 await page.evaluate(()=>{state.tank3=false;state.shelf=false;state.layout=ShopLayout.create();saveGame(false)});
 await page.reload();
 await page.locator('#editStart').click();await page.locator('#editObject').selectOption('betta-1');
 for(let i=0;i<5;i++)await page.locator('[data-move="1,0"]').click();
 await page.locator('[data-move="0,1"]').click();await page.locator('#editRotate').click();
 assert.equal(await page.locator('#editConfirm').isEnabled(),true);
 await page.locator('#editConfirm').click();await page.locator('#editExit').click();await page.reload();
 assert.deepEqual(await page.evaluate(()=>{const o=state.layout.objects.find(o=>o.id==='betta-1');return [o.x,o.y,o.rotation]}),[5,3,90]);
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:__dirname+'/v04-alternate-layout-mobile.png',fullPage:true});

 assert.deepEqual(errors,[]);console.log('PASS: old saves, select/move/rotate, transactional confirm/cancel, undo, invalid bounds/door, pause/resume, persisted positions, upgrade placement, responsive.');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
