const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('fs');
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});try{
const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[],reports=[];
page.on('pageerror',e=>errors.push(e.message));
await page.clock.install({time:new Date('2026-09-12T12:00:00Z')});await page.clock.pauseAt(new Date('2026-09-12T12:00:01Z'));
await page.goto('http://127.0.0.1:4174');await require('./test-start.cjs')(page);
for(const spec of [{upgrade:'microWidth',x:12,y:9,w:17,d:14},{upgrade:'microDepth',x:0,y:12,w:16,d:15},{upgrade:'expansion',x:15,y:12,w:20,d:17}]){
const result=await page.evaluate(spec=>{
shopEditor.begin();Object.assign(state,{level:5,money:5000,served:25,kits:1,employee:null,speed:1,shelf:true,tank3:true,expansion:false,microWidth:false,microDepth:false,orders:[],stock:Object.fromEntries(Object.keys(products).map(k=>[k,k==='guppy'?10:0])),logistics:null});
state.moments={version:1,cooldown:999999,sequence:0};state.layout=ShopLayout.create();
for(const o of state.layout.objects)if(o.kind==='shelf'||o.kind==='tank3')o.placed=true;
// Move only the counter to provide a service corridor beside the lateral extension.
Object.assign(state.layout.objects.find(o=>o.id==='counter-1'),{x:5,y:10});
const tank=state.layout.objects.find(o=>o.id==='tank-3'),candidate={...tank,x:spec.x,y:spec.y};
const before=ShopLayout.validate(state.layout,candidate,state);const money=state.money;buyUpgrade(spec.upgrade);
const after=ShopLayout.validate(state.layout,candidate,state);if(after)throw Error(after);Object.assign(tank,candidate);
window.dispatchEvent(new Event('layoutchange'));render();shopEditor.end();
const graph=ShopNavigation.build(state.layout,state),g=graph.grids.main,plan=ShopNavigation.plan(graph,'guppy');
if(!plan)throw Error('No sale route in purchased zone');const work=ShopNavigation.workPlan(g,tank,g.objects.find(o=>o.kind==='counter'));if(!work)throw Error('No staff route');
window.expansionAudit={grid:g,prev:{},samples:0,phases:[]};const update=ShopCharacters.update;
if(!window.expansionOriginal){window.expansionOriginal=update;ShopCharacters.update=(node,pose)=>{expansionOriginal(node,pose);const a=expansionAudit,dx=(pose.feet.x-a.grid.room.origin.x)/30,dy=(pose.feet.y-a.grid.room.origin.y)/15,p={x:(dx+dy)/2,y:(dy-dx)/2},id=node.dataset.visitorId;if(!ShopNavigation.clear(a.grid,p)||a.prev[id]&&!ShopNavigation.segmentClear(a.grid,a.prev[id],p))throw Error('Movement crossed obstacle');a.prev[id]=p;a.samples++}}
window.startSales=state.served;return {before,after,charged:money-state.money,room:{w:g.room.width,d:g.room.depth},route:true,work:true};
},spec);
assert.match(result.before,/fuera/);assert.equal(result.after,'');assert.deepEqual(result.room,{w:spec.w,d:spec.d});assert.equal(result.charged,{microWidth:180,microDepth:260,expansion:1200}[spec.upgrade]);
for(let i=0;i<90;i++){await page.clock.runFor(1000);await page.evaluate(()=>{for(const w of ShopStaff.snapshot())if(!expansionAudit.phases.includes(w.phase))expansionAudit.phases.push(w.phase)});if(await page.evaluate(()=>state.served>startSales))break}
const actual=await page.evaluate(()=>({sales:state.served-startSales,samples:expansionAudit.samples,phases:expansionAudit.phases,stock:state.stock,logistics:state.logistics,objects:state.layout.objects}));assert.ok(actual.sales>0,'real sale after expansion');assert.ok(actual.phases.includes('carrying-order'));assert.ok(actual.samples>0);
await page.evaluate(()=>{shopEditor.begin();saveGame(false)});const saved=await page.evaluate(()=>({stock:state.stock,logistics:state.logistics,objects:state.layout.objects,money:state.money}));await page.screenshot({path:__dirname+'/v011-expansion-'+spec.upgrade+'.png',fullPage:true});await page.reload();
const restored=await page.evaluate(()=>({stock:state.stock,logistics:state.logistics,objects:state.layout.objects,money:state.money}));assert.deepEqual(restored,saved,'save retains purchased placement and inventory');
assert.deepEqual(await page.evaluate(()=>({w:state.layout.rooms[0].width,d:state.layout.rooms[0].depth})),{w:spec.w,d:spec.d});reports.push({upgrade:spec.upgrade,...result,sales:actual.sales,samples:actual.samples,phases:actual.phases,reload:true});console.log('PASS physical expansion',spec.upgrade);
}
assert.deepEqual(errors,[]);fs.writeFileSync('expansion-v011-report.json',JSON.stringify({reports,errors},null,2));
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
