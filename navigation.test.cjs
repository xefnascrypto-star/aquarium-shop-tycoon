const assert=require('node:assert/strict'),M=require('./layout-model.js'),N=require('./navigation.js');
const layout=M.create(),graph=N.build(layout),g=graph.grids.main;
for(const product of ['betta','comet','food']){
 const plan=N.plan(graph,product);assert.ok(plan,product);
 for(const path of [plan.toProduct,plan.toCounter,plan.toExit])for(let i=0;i<path.length;i++){assert.ok(N.free(g,path[i]));if(i)assert.equal(Math.abs(path[i].x-path[i-1].x)+Math.abs(path[i].y-path[i-1].y),1)}
 assert.deepEqual(plan.toExit.at(-1),g.entrance);
}
assert.ok(N.assess(graph).every(o=>o.reachable));
const tiny={room:{width:3,depth:3},blocked:new Set(['1,0','0,1'])};
assert.equal(N.route(tiny,{x:0,y:0},[{x:1,y:1}]),null);
assert.equal(N.route(tiny,{x:-1,y:0},[{x:1,y:1}]),null);
assert.deepEqual(N.route(g,g.entrance,[g.entrance]),[g.entrance]);
const rotated=M.clone(layout);rotated.objects[0]={...rotated.objects[0],x:5,y:3,rotation:90};
const rg=N.build(rotated).grids.main;assert.ok(rg.blocked.has('7,7'));assert.ok(!rg.blocked.has('8,7'));
const locked=N.build(layout,{tank3:false}),unlocked=N.build(layout,{tank3:true});assert.ok(!locked.grids.main.blocked.has('7,4'));assert.ok(unlocked.grids.main.blocked.has('7,4'));
const barrier=M.create();const changes={'betta-1':[0,4],'comet-1':[5,4],'plant-2':[10,4],'warehouse-1':[0,7]};
for(const o of barrier.objects)if(changes[o.id])[o.x,o.y]=changes[o.id];
for(const o of barrier.objects.filter(o=>M.owned(o,{})))assert.equal(M.validate(barrier,o,{}),'');
assert.ok(N.assess(N.build(barrier)).some(o=>o.id==='counter-1'&&!o.reachable));assert.equal(N.plan(N.build(barrier),'food'),null);
const fixed=M.clone(barrier);Object.assign(fixed.objects.find(o=>o.id==='plant-2'),{x:0,y:2});
assert.ok(N.assess(N.build(fixed)).every(o=>o.reachable));assert.ok(N.plan(N.build(fixed),'food'));
console.log('PASS: four-way BFS, no corner cutting, bounded free paths, service faces, rotations, unlocked obstacles, inaccessible counter, reopening passage.');
