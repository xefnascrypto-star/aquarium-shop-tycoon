const assert=require('node:assert/strict'),M=require('./layout-model.js'),N=require('./navigation.js'),D=require('./design.js');
let state={},l=M.create();assert.equal(l.rooms[0].width,12);assert.equal(l.objects.filter(o=>M.owned(o,state)&&['betta','comet','tank3'].includes(o.kind)).length,2);
for(const k of ['betta','comet','food','conditioner'])assert.ok(N.plan(N.build(l,state),k));
state.shelf=true;assert.equal(N.build(l,state).grids.main.objects.some(o=>o.kind==='shelf'),false,'paid pending furniture is not an obstacle');
const shelf=l.objects.find(o=>o.kind==='shelf');shelf.placed=true;
const graph=N.build(l,state);for(const o of graph.grids.main.objects)assert.equal(M.validate(l,o,state),'');
const p=l.objects.find(o=>o.kind==='betta');assert.deepEqual(M.footprint({...p,rotation:90}),{x:0,y:2,width:3,depth:5});
for(const k of ['betta','comet','food','conditioner','filter']){const trip=N.plan(graph,k);assert.ok(trip);for(const path of [trip.toProduct,trip.toCounter,trip.toExit])for(let i=0;i<path.length;i++){assert.ok(N.free(graph.grids.main,path[i]));if(i)assert.equal(Math.abs(path[i].x-path[i-1].x)+Math.abs(path[i].y-path[i-1].y),1)}}
const corner={room:{width:2,depth:2},blocked:new Set(['1,0','0,1'])};assert.equal(N.route(corner,{x:0,y:0},[{x:1,y:1}]),null);
const legacy={version:1,objects:l.objects.filter(o=>!['tank4','tank5','shelf2','battery','plants','professional'].includes(o.kind)).map(({placed,...o})=>o)};const migrated=M.migrate(legacy,{shelf:true,tank3:true});assert.equal(migrated.objects.find(o=>o.kind==='shelf').placed,true);
for(let seed=0;seed<40;seed++){const broken=M.clone(legacy);broken.objects.forEach((o,i)=>{o.x=(seed*7+i*3)%16-2;o.y=(seed*3+i*7)%16-2;o.rotation=i%2?90:0});const fixed=M.migrate(broken,{shelf:true,tank3:true});for(const o of fixed.objects.filter(o=>M.owned(o,{shelf:true,tank3:true})))assert.equal(M.validate(fixed,o,{shelf:true,tank3:true}),'')}
const expanded=M.migrate(l,{shelf:true,expansion:true});assert.deepEqual([expanded.rooms[0].width,expanded.rooms[0].depth],[18,16]);assert.deepEqual(M.migrate(expanded,{shelf:true,expansion:true}),expanded);
assert.deepEqual(Object.keys(D.products).length,17);assert.equal(D.upgrades.warehouse2.cost,11000);assert.equal(D.levels.at(-1).level,10);
console.log('PASS: catalog, initial stock displays, pending obstacles, rotations, BFS, corner prevention, legacy migration, corrupt layout repair, expansion persistence, ten-level boundary.');
