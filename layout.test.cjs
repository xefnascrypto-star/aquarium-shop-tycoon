const assert=require('node:assert/strict'),M=require('./layout-model.js');
let layout=M.create(),state={tank3:true};
for(const o of layout.objects)assert.equal(M.validate(layout,o,state),'',o.id);
const plant=layout.objects.find(o=>o.id==='plant-1');
assert.match(M.validate(layout,{...plant,x:-1},state),/fuera/);
assert.match(M.validate(layout,{...plant,x:11},state),/fuera/);
assert.match(M.validate(layout,{...plant,x:10,y:0},state),/entrada/);
assert.match(M.validate(layout,{...plant,x:1,y:3},state),/ocupado/);
assert.equal(M.validate(layout,{...plant,x:2,y:0},state),'');
assert.deepEqual(M.footprint({...layout.objects[0],rotation:90}),{x:0,y:2,width:3,depth:5});
const room=layout.rooms[0];
for(let x=0;x<12;x++)for(let y=0;y<12;y++){const p=M.project(room,x+.5,y+.5);assert.deepEqual(M.unproject(room,p.x,p.y),{x,y})}
const saved=M.clone(layout);saved.objects[0].x=-100;saved.objects[1].rotation=999;
const repaired=M.migrate(saved,state);for(const o of repaired.objects)assert.equal(M.validate(repaired,o,state),'',o.id);
assert.deepEqual(M.migrate(null,state),M.create());
const otherRoom={...M.clone(room),id:'reef',type:'reef',origin:{x:1000,y:200}};
const withRoom={...layout,rooms:[room,otherRoom]};
assert.equal(M.validate(withRoom,{...plant,roomId:'reef',x:0,y:2},state),'');
const full={...layout,rooms:[{...room,width:1,depth:1}]};assert.equal(M.findFree(full,plant,state),null);
console.log('PASS: footprints, both orientations, boundaries, overlap, door, coordinate roundtrips, old/corrupt save migration, separate rooms, full room.');

for(let seed=0;seed<80;seed++){
 const broken=M.create();broken.objects.forEach((o,i)=>{o.x=(seed*7+i*3)%16-2;o.y=(seed*3+i*7)%16-2;o.rotation=i%2?90:0});
 const fixed=M.migrate(broken,{tank3:true});
 for(const o of fixed.objects)assert.equal(M.validate(fixed,o,{tank3:true}),'');
}
console.log('PASS: 80 malformed layouts never produce overlaps.');
