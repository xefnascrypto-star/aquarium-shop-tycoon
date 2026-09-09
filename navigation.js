// Pure navigation on the placement grid. Orthogonal steps never cut corners.
(function(root,factory){const m=factory(typeof module==='object'&&module.exports?require('./layout-model.js'):root.ShopLayout);if(typeof module==='object'&&module.exports)module.exports=m;else root.ShopNavigation=m})(globalThis,M=>{
 const goods={betta:['betta'],comet:['comet'],tank3:['guppy','platy'],tank4:['betta','comet'],tank5:['guppy','platy'],shelf:['food','conditioner','filter','heater','light','siphon','thermometer'],shelf2:['food','conditioner','filter','heater','light','siphon','thermometer'],counter:['food','conditioner'],battery:['neon','molly','cory','ancistrus'],plants:['anubias'],professional:['discus']};
 const key=c=>c.x+','+c.y;
 function build(layout,state={}){
  const grids={};
  for(const room of layout.rooms){
   const blocked=new Set(),objects=layout.objects.filter(o=>o.roomId===room.id&&M.owned(o,state));
   for(const o of objects){const b=M.footprint(o);for(let x=Math.max(0,b.x);x<Math.min(room.width,b.x+b.width);x++)for(let y=Math.max(0,b.y);y<Math.min(room.depth,b.y+b.depth);y++)blocked.add(x+','+y)}
   const door=room.entrance||room.reserved[0];
   grids[room.id]={room,objects,blocked,entrance:door?{x:door.x,y:door.y}:null};
  }
  return {grids};
 }
 function free(g,c){return !!c&&Number.isInteger(c.x)&&Number.isInteger(c.y)&&c.x>=0&&c.y>=0&&c.x<g.room.width&&c.y<g.room.depth&&!g.blocked.has(key(c))}
 function route(g,start,goals){
  if(!free(g,start))return null;
  const targets=new Set(goals.filter(c=>free(g,c)).map(key));if(!targets.size)return null;
  const queue=[{x:start.x,y:start.y}],parents=new Map([[key(start),null]]);
  for(let i=0;i<queue.length;i++){
   const c=queue[i];if(targets.has(key(c))){const path=[];let at=key(c);while(at!==null){const [x,y]=at.split(',').map(Number);path.push({x,y});at=parents.get(at)}return path.reverse()}
   for(const [dx,dy] of [[1,0],[0,1],[-1,0],[0,-1]]){const n={x:c.x+dx,y:c.y+dy},k=key(n);if(free(g,n)&&!parents.has(k)){parents.set(k,key(c));queue.push(n)}}
  }
  return null;
 }
 function services(g,o){
  // The two visible customer-facing edges swap with the object's 90° rotation.
  const b=M.footprint(o),cells=[];
  for(let x=b.x;x<b.x+b.width;x++)cells.push({x,y:b.y+b.depth});
  for(let y=b.y;y<b.y+b.depth;y++)cells.push({x:b.x+b.width,y});
  return cells.filter(c=>free(g,c));
 }
 function assess(graph){
  const objects=[];
  for(const g of Object.values(graph.grids)){
   for(const o of g.objects.filter(o=>goods[o.kind]||['counter','warehouse'].includes(o.kind))){
    const path=g.entrance?route(g,g.entrance,services(g,o)):null;
    objects.push({id:o.id,kind:o.kind,roomId:o.roomId,label:M.catalog[o.kind].label,reachable:!!path,reason:path?'':'Sin camino desde la puerta hasta una cara de atención.'});
   }
  }
  return objects;
 }
 function plan(graph,product,roomId='main',start){
  const g=graph.grids[roomId];if(!g||!g.entrance)return null;
  const origin=start||g.entrance,counters=g.objects.filter(o=>o.kind==='counter'),options=[];
  for(const object of g.objects.filter(o=>goods[o.kind]?.includes(product))){
   const toProduct=route(g,origin,services(g,object));if(!toProduct)continue;
   for(const counter of counters){
    const toCounter=route(g,toProduct.at(-1),services(g,counter));if(!toCounter)continue;
    const toExit=route(g,toCounter.at(-1),[g.entrance]);if(!toExit)continue;
    options.push({roomId,product,objectId:object.id,counterId:counter.id,toProduct,toCounter,toExit});
   }
  }
  return options.sort((a,b)=>(a.toProduct.length+a.toCounter.length+a.toExit.length)-(b.toProduct.length+b.toCounter.length+b.toExit.length))[0]||null;
 }
 return {goods,key,build,free,route,services,assess,plan};
});
