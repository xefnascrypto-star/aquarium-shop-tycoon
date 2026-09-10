const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),fixtures=require('./polish-fixtures.cjs');
(async()=>{const b=await chromium.launch({headless:true,channel:'msedge'});try{
const p=await b.newPage({viewport:{width:390,height:844}}),errors=[],reports=[];p.on('pageerror',e=>errors.push(e.message));
await p.clock.install({time:new Date('2026-09-10T12:00:00Z')});await p.clock.pauseAt(new Date('2026-09-10T12:00:01Z'));await p.goto('http://127.0.0.1:4174');await require('./test-start.cjs')(p);
await p.evaluate(()=>{
window.audit={errors:[],samples:0,previous:{},phases:{},maxJobs:0,sales:0};
const update=ShopCharacters.update;ShopCharacters.update=(node,pose)=>{update(node,pose);if(!window.audit.grid)return;const g=audit.grid,dx=(pose.feet.x-g.room.origin.x)/30,dy=(pose.feet.y-g.room.origin.y)/15,pos={x:(dx+dy)/2,y:(dy-dx)/2},id=node.dataset.visitorId;
if(!ShopNavigation.clear(g,pos))audit.errors.push('collision '+id+' '+JSON.stringify(pos));
const prev=audit.previous[id];if(prev&&Math.hypot(pos.x-prev.x,pos.y-prev.y)>3*state.speed*(Date.now()-prev.time)/1000+.001)audit.errors.push('jump '+id);
audit.previous[id]={...pos,time:Date.now()};audit.samples++;if(node.dataset.workerId!==undefined)audit.phases[node.dataset.task||'idle']=true;
};
window.addEventListener('sale',()=>audit.sales++);
});
async function setup(layout,two=false,onlyBetta=false){
await p.evaluate(({layout,two,onlyBetta})=>{shopEditor.begin();audit.previous={};audit.errors=[];audit.phases={};audit.maxJobs=0;audit.sales=0;audit.samples=0;
Object.assign(state,{layout,shelf:true,tank3:true,expansion:layout.rooms[0].width>14,level:two?9:3,employee:two?'eva':null,employeeUnpaid:false,wageElapsed:0,money:10000,speed:4,orders:[],logistics:null,stock:Object.fromEntries(Object.keys(products).map(k=>[k,onlyBetta?(k==='betta'?100:0):['betta','comet','guppy','platy'].includes(k)?100:['food','conditioner'].includes(k)?3:0]))});
Object.assign(state.moments,{active:null,request:null,offer:null,interest:null,cooldown:999999});audit.grid=ShopNavigation.build(state.layout,state).grids.main;render();shopEditor.end();
},{layout,two,onlyBetta});
}
async function run(ms){for(let t=0;t<ms;t+=200){await p.clock.runFor(Math.min(200,ms-t));await p.evaluate(()=>{const w=ShopStaff.snapshot(),jobs=w.filter(w=>w.job!==null);audit.maxJobs=Math.max(audit.maxJobs,jobs.length);if(new Set(jobs.map(w=>w.job)).size!==jobs.length)audit.errors.push('duplicate assignment');for(const w of jobs){const a=shopCirculation.snapshot().find(a=>a.id===w.job);if(!a)audit.errors.push('orphan task')}})}}
for(const [name,two] of [['rows',false],['rotated',true],['island',true]]){
await setup(fixtures[name],two);await run(30000);const report=await p.evaluate(()=>({samples:audit.samples,errors:audit.errors,phases:Object.keys(audit.phases),maxJobs:audit.maxJobs,sales:audit.sales,workers:ShopStaff.snapshot().length}));assert.deepEqual(report.errors,[],name);assert.ok(report.sales>=2,name+' sales');assert.equal(report.workers,two?2:1);assert.equal(report.maxJobs,two?2:1);assert.ok(report.phases.includes('preparing-fish')&&report.phases.includes('carrying-order')&&report.phases.includes('checkout'));reports.push({name,...report});console.log('LAYOUT',JSON.stringify(reports.at(-1)));
await p.screenshot({path:__dirname+'/v010-'+name+'.png',fullPage:true});
}
// Save at each material task stage, then restore exact service state and supplier timers.
await setup(fixtures.rows,true,true);
for(const phase of ['preparing-fish','carrying-order','checkout']){
let found=false;for(let i=0;i<500;i++){await p.clock.runFor(50);if(await p.evaluate(phase=>ShopStaff.snapshot().some(w=>w.phase===phase),phase)){found=true;break}}assert.ok(found,phase);
await p.evaluate(()=>{if(!incomingOrders().length){order('betta',1);order('food',1)}saveGame(false)});
await p.screenshot({path:__dirname+'/v010-'+phase+'.png',fullPage:true});
const before=await p.evaluate(()=>({session:shopCirculation.serialize(),stock:state.stock,money:state.money,served:state.served,orders:state.orders}));
await p.reload();const after=await p.evaluate(()=>({session:shopCirculation.serialize(),stock:state.stock,money:state.money,served:state.served,orders:state.orders}));assert.deepEqual(after,before,'restore '+phase);
}
const served=await p.evaluate(()=>state.served);await p.clock.runFor(20000);assert.ok(await p.evaluate(n=>state.served>n,served));assert.ok(await p.evaluate(()=>Object.values(state.stock).every(n=>n>=0)));
// Work side blocked, customer side open: the editor must explicitly report staff access.
await p.evaluate(()=>{shopEditor.begin();const c=state.layout.objects.find(o=>o.kind==='counter'),b=ShopLayout.footprint(c);state.layout.rooms[0].obstacles=[{x:b.x,y:b.y-1,width:b.width,depth:1},{x:b.x-1,y:b.y,width:1,depth:b.depth}];window.dispatchEvent(new Event('layoutchange'));render()});
const bad=await p.evaluate(()=>ShopNavigation.assess(ShopNavigation.build(state.layout,state)).find(o=>o.kind==='counter'));assert.equal(bad.customerReachable,true);assert.equal(bad.staffReachable,false);assert.equal(bad.reachable,false);assert.ok((await p.locator('#editAccess').textContent()).includes('No funcional'));await p.locator('#editExit').click();
const start=await p.evaluate(()=>state.served);await p.clock.runFor(15000);assert.equal(await p.evaluate(()=>state.served),start);assert.ok(await p.evaluate(()=>ShopStaff.snapshot().every(w=>ShopNavigation.clear(ShopNavigation.build(state.layout,state).grids.main,w.position))));
assert.deepEqual(errors,[]);fs.writeFileSync(__dirname+'/staff-v010-report.json',JSON.stringify({layouts:reports,persistedPhases:['preparing-fish','carrying-order','checkout'],supplierOrdersPreserved:true,staffOnlyBlockedAccess:true,errors},null,2));console.log('PASS: physical worker paths, one/two staff, concurrent jobs, three layouts, preparation/bags/payment, work-side warnings, task and supplier persistence.');
}finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});
