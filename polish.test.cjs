const {chromium}=require('playwright'),assert=require('node:assert/strict'),fixtures=require('./polish-fixtures.cjs'),fs=require('node:fs');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
const p=await browser.newPage({viewport:{width:390,height:844}}),errors=[],reports=[];p.on('pageerror',e=>errors.push(e.message));await p.clock.install({time:new Date('2026-09-09T12:00:00Z')});await p.clock.pauseAt(new Date('2026-09-09T12:00:01Z'));await p.goto('http://127.0.0.1:4174');await require('./test-start.cjs')(p);
await p.evaluate(()=>{
window.audit={errors:[],updates:0,seen:{},previous:{},visited:{},grid:null};
const update=ShopCharacters.update;ShopCharacters.update=(node,pose)=>{update(node,pose);const a=window.audit;if(!a.grid)return;const room=a.grid.room,dx=(pose.feet.x-room.origin.x)/30,dy=(pose.feet.y-room.origin.y)/15,pos={x:(dx+dy)/2,y:(dy-dx)/2};
if(!ShopNavigation.clear(a.grid,pos))a.errors.push('collision '+JSON.stringify(pos));
const old=a.previous[node.dataset.visitorId],now=Date.now();if(old){const distance=Math.hypot(pos.x-old.x,pos.y-old.y);if(distance>3*state.speed*(now-old.time)/1000+.001)a.errors.push('jump '+distance)}
a.previous[node.dataset.visitorId]={...pos,time:now};a.updates++;a.seen[pose.phase]=(a.seen[pose.phase]||0)+1;
};
const sort=ShopDepth.sort;ShopDepth.sort=items=>{const sorted=sort(items),audit=window.audit;if(!audit.grid||!window.shopCirculation)return sorted;
for(const a of shopCirculation.snapshot().filter(a=>['browsing','checkout'].includes(a.phase))){
const object=a.phase==='browsing'?a.objectId:a.counterId,oi=sorted.findIndex(i=>i.node?.dataset.instance===object),ai=sorted.findIndex(i=>i.node?.dataset.visitorId===String(a.id));
if(oi>=0&&ai>=0&&oi>ai)audit.errors.push('wrong occlusion '+object);
if(a.phase==='browsing'){const o=audit.grid.objects.find(o=>o.id===a.objectId);if(!ShopNavigation.services(audit.grid,o).some(c=>ShopNavigation.key(c)===ShopNavigation.key(a.cell)))audit.errors.push('not at interaction');audit.visited[o.kind]=true}
}return sorted};
});
for(const [name,layout] of Object.entries(fixtures)){
await p.evaluate(l=>{shopEditor.begin();state.layout=l;state.shelf=state.tank3=true;state.level=3;state.xp=0;state.served=0;state.stock=Object.fromEntries(Object.keys(products).map(k=>[k,['betta','comet','guppy','platy','food','conditioner'].includes(k)?60:0]));state.speed=1;Object.assign(state.moments,{cooldown:100000,active:null,request:null,offer:null,interest:null});render();window.dispatchEvent(new Event('layoutchange'));audit.grid=ShopNavigation.build(state.layout,state).grids.main;audit.errors=[];audit.previous={};audit.visited={};audit.updates=0;audit.seen={};let seed=88;Math.random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};shopEditor.end()},layout);
await p.clock.runFor(name==='blocked'?45000:160000);
const report=await p.evaluate(()=>({errors:audit.errors.slice(0,10),updates:audit.updates,visited:audit.visited,phases:audit.seen,served:state.served,layout:state.layout}));
assert.deepEqual(report.errors,[],name);assert.deepEqual(errors,[]);
if(name==='blocked'){assert.equal(report.served,0);assert.equal(await p.locator('#accessAlert').isVisible(),true)}
else {assert.ok(report.served>=5,name);for(const kind of ['betta','comet','tank3'])assert.ok(report.visited[kind],name+' did not visit '+kind);assert.equal(await p.locator('#accessAlert').isVisible(),false)}
await p.screenshot({path:__dirname+'/v09-'+name+'.png',fullPage:true});reports.push({name,updates:report.updates,sales:report.served,visited:report.visited});console.log('LAYOUT',JSON.stringify(reports.at(-1)));
}
await p.evaluate(()=>{shopEditor.begin();Object.assign(state.layout.objects.find(o=>o.id==='plant-2'),{x:12,y:8});window.dispatchEvent(new Event('layoutchange'));audit.grid=ShopNavigation.build(state.layout,state).grids.main;audit.previous={};shopEditor.end()});
await p.clock.runFor(45000);assert.equal(await p.locator('#accessAlert').isVisible(),false);assert.ok(await p.evaluate(()=>state.served)>0);assert.deepEqual(await p.evaluate(()=>audit.errors),[]);
await p.evaluate(l=>{shopEditor.begin();state.layout=l;audit.grid=null;window.dispatchEvent(new Event('layoutchange'));shopEditor.end();saveGame(false)},fixtures.rotated);
const saved=await p.evaluate(()=>JSON.parse(JSON.stringify(state.layout)));await p.reload();assert.deepEqual(await p.evaluate(()=>state.layout),saved);
for(const width of [320,390,768,1280]){await p.setViewportSize({width,height:900});await p.locator('#editStart').click();await p.locator('#editObject').selectOption('tank-3');assert.ok(await p.locator('#placementLayer ellipse').count()>0);assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await p.locator('#editExit').click()}
assert.deepEqual(errors,[]);fs.writeFileSync(__dirname+'/polish-v09-report.json',JSON.stringify({layouts:reports,checks:'Every rendered frame: radius clearance, speed bound, product interaction and front occlusion. Three layouts, blocked/reopened route, save migration and mobile editor. PASS'},null,2));
await browser.close();
console.log('PASS: live rendered movement / interaction / depth and rotated save migration.');
}catch(e){await browser.close();throw e}})().catch(e=>{console.error(e);process.exitCode=1});
