const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),M=require('./layout-model.js'),N=require('./navigation.js'),Motion=require('./motion.js'),fixtures=require('./polish-fixtures.cjs'),state={shelf:true,tank3:true};
const base=M.create();assert.equal(base.rooms[0].width*base.rooms[0].depth,224);assert.ok(224/182>1.2&&224/182<1.3);
const legacy=M.clone(fixtures.rows);legacy.version=2;legacy.rooms[0].width=legacy.rooms[0].depth=12;
const migrated=M.migrate(legacy,state);assert.deepEqual(migrated.objects,legacy.objects);assert.equal(migrated.rooms[0].width,16);assert.equal(migrated.rooms[0].depth,14);
const ctx={window:{},crypto:require('node:crypto').webcrypto};vm.runInNewContext(fs.readFileSync(__dirname+'/characters.js','utf8'),ctx);
const depth=ctx.window.ShopDepth;
assert.equal(depth.sort([{id:'person',bounds:{x:2.22,y:5.22,width:.56,depth:.56}},{id:'tank',bounds:{x:2,y:2,width:5,depth:3}}])[1].id,'person');
let samples=0,curves=0;
for(const [name,l] of Object.entries(fixtures)){
for(const o of l.objects.filter(o=>M.owned(o,state)))assert.equal(M.validate(l,o,state),'',name+': '+o.id);
const g=N.build(l,state).grids.main;
for(const p of [{x:-.1,y:3},{x:16.1,y:3},{x:3,y:-.1},{x:3,y:14.1}])assert.equal(N.clear(g,p),false);
if(name==='blocked'){assert.equal(N.plan(N.build(l,state),'betta'),null);assert.ok(N.assess(N.build(l,state)).some(o=>o.kind==='counter'&&!o.reachable));continue}
for(const k of ['betta','comet','guppy','platy','food','conditioner']){
const plan=N.plan(N.build(l,state),k);assert.ok(plan,name+' / '+k);
for(const path of [plan.toProduct,plan.toCounter,plan.toExit]){
const points=Motion.points(path,g);assert.ok(points);if(points.some(p=>Math.abs(p.x%1-.5)>1e-5&&Math.abs(p.y%1-.5)>1e-5))curves++;
let p=points[0],index=1;while(index<points.length){const move=Motion.travel(p,points,index,.13,g);assert.ok(!move.blocked);assert.ok(N.clear(g,move.position));assert.ok(N.segmentClear(g,p,move.position));assert.ok(Math.hypot(move.position.x-p.x,move.position.y-p.y)<=.130001);p=move.position;index=move.index;samples++}
}
const o=g.objects.find(o=>o.id===plan.objectId),b=M.footprint(o),at=plan.toProduct.at(-1);
assert.ok(!(at.x>=b.x&&at.x<b.x+b.width&&at.y>=b.y&&at.y<b.y+b.depth),'interaction cannot be inside furniture');
}
}
const internal=M.clone(base);internal.rooms[0].obstacles=[{x:8,y:4,width:1,depth:3}];const g=N.build(internal).grids.main;assert.equal(N.free(g,{x:8,y:5}),false);assert.equal(N.clear(g,{x:8.1,y:5.5}),false);
const repaired=M.clone(fixtures.blocked);Object.assign(repaired.objects.find(o=>o.id==='plant-2'),{x:12,y:8});assert.ok(N.plan(N.build(repaired,state),'betta'));assert.ok(curves>0);
console.log('PASS: +23% initial area, v0.6 position migration, three layouts/rotations, blocked and reopened passage, physical interaction cells, walls, radius clearance, rounded turns, continuous movement, front-of-tank depth. Samples:',samples);
