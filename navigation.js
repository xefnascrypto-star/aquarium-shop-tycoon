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
   const barriers=M.barriers(room);for(const b of barriers)for(let x=b.x;x<b.x+b.width;x++)for(let y=b.y;y<b.y+b.depth;y++)blocked.add(x+','+y);
   grids[room.id]={room,objects,barriers,blocked,entrance:door?{x:door.x,y:door.y}:null};
  }
  return {grids};
 }
 function free(g,c){return !!c&&Number.isInteger(c.x)&&Number.isInteger(c.y)&&c.x>=0&&c.y>=0&&c.x<g.room.width&&c.y<g.room.depth&&!g.blocked.has(key(c))}
 function route(g,start,goals){
 if(!free(g,start))return null;const targets=goals.filter(c=>free(g,c));if(!targets.length)return null;
 // A* with a small turn cost chooses equally short paths with fewer zigzags.
 const heuristic=c=>Math.min(...targets.map(t=>Math.abs(c.x-t.x)+Math.abs(c.y-t.y)));
 const open=[{...start,dir:-1,cost:0,score:heuristic(start),parent:null}],best=new Map();
 while(open.length){
 open.sort((a,b)=>a.score-b.score||a.cost-b.cost);const c=open.shift(),id=key(c)+','+c.dir;
 if(best.has(id)&&best.get(id)<c.cost)continue;
 if(targets.some(t=>key(t)===key(c))){const path=[];for(let n=c;n;n=n.parent)path.push({x:n.x,y:n.y});return path.reverse()}
 [[1,0],[0,1],[-1,0],[0,-1]].forEach(([dx,dy],dir)=>{const n={x:c.x+dx,y:c.y+dy};if(!free(g,n))return;const cost=c.cost+1+(c.dir!==-1&&c.dir!==dir?.08:0),id=key(n)+','+dir;if(best.has(id)&&best.get(id)<=cost)return;best.set(id,cost);open.push({...n,dir,cost,score:cost+heuristic(n),parent:c})});
 }
 return null;
 }
 function clear(g,p,radius=.28){
 if(!p||!Number.isFinite(p.x)||!Number.isFinite(p.y)||p.x-radius<0||p.y-radius<0||p.x+radius>g.room.width||p.y+radius>g.room.depth)return false;
 for(let x=Math.floor(p.x-radius);x<=Math.floor(p.x+radius);x++)for(let y=Math.floor(p.y-radius);y<=Math.floor(p.y+radius);y++){
 if(!g.blocked.has(x+','+y))continue;const dx=p.x-Math.max(x,Math.min(x+1,p.x)),dy=p.y-Math.max(y,Math.min(y+1,p.y));if(dx*dx+dy*dy<radius*radius-1e-9)return false;
 }
 return true;
 }
 function segmentClear(g,a,b,radius=.28){
 const steps=Math.max(1,Math.ceil(Math.hypot(b.x-a.x,b.y-a.y)/.025));
 for(let i=0;i<=steps;i++)if(!clear(g,{x:a.x+(b.x-a.x)*i/steps,y:a.y+(b.y-a.y)*i/steps},radius))return false;
 return true;
 }
 function services(g,o){
  // The two visible customer-facing edges swap with the object's 90° rotation.
  const b=M.footprint(o),cells=[];
  for(let x=b.x;x<b.x+b.width;x++)cells.push({x,y:b.y+b.depth});
  for(let y=b.y;y<b.y+b.depth;y++)cells.push({x:b.x+b.width,y});
  return cells.filter(c=>free(g,c)&&clear(g,{x:c.x+.5,y:c.y+.5}));
 }
 function staffServices(g,o){
 if(o.kind!=='counter')return services(g,o);
 const b=M.footprint(o),cells=[];
 for(let x=b.x;x<b.x+b.width;x++)cells.push({x,y:b.y-1});
 for(let y=b.y;y<b.y+b.depth;y++)cells.push({x:b.x-1,y});
 return cells.filter(c=>free(g,c)&&clear(g,{x:c.x+.5,y:c.y+.5}));
 }
 const stationCache=new WeakMap();
 function stations(g,counter){
 let cache=stationCache.get(g);if(!cache){cache=new Map();stationCache.set(g,cache)}if(cache.has(counter.id))return cache.get(counter.id);
 const front=services(g,counter).filter(c=>route(g,g.entrance,[c]));
 const back=staffServices(g,counter).filter(c=>route(g,g.entrance,[c]));
 const result=back.slice(0,front.length).map((cell,i)=>({counterId:counter.id,cell,customer:front[i]}));cache.set(counter.id,result);return result;
 }
 function workPlan(g,o,counter,start){
 const home=stations(g,counter)[0]?.cell;if(!home)return null;
 const pickup=route(g,start||home,staffServices(g,o));if(!pickup)return null;
 const back=route(g,pickup.at(-1),[home]);return back?{pickup,back}:null;
 }
 function assess(graph){
 const objects=[];
 for(const g of Object.values(graph.grids)){
 const counters=g.objects.filter(o=>o.kind==='counter');
 for(const o of g.objects.filter(o=>goods[o.kind]||o.kind==='warehouse')){
 const path=g.entrance?route(g,g.entrance,services(g,o)):null;
 const staff=o.kind==='warehouse'?!!path:counters.some(c=>workPlan(g,o,c));
 const reasonKey=!path?'accessCustomer':!staff?'accessStaff':'';
 objects.push({id:o.id,kind:o.kind,roomId:o.roomId,label:M.catalog[o.kind].label,customerReachable:!!path,staffReachable:staff,reachable:!!path&&staff,reasonKey,reason:reasonKey==='accessCustomer'?'Sin camino para clientes.':reasonKey==='accessStaff'?'Sin recorrido de trabajo entre caja y expositor.':''});
 }
 }
 return objects;
 }
 function plan(graph,product,roomId='main',start,displayIds){
  const g=graph.grids[roomId];if(!g||!g.entrance)return null;
  const origin=start||g.entrance,counters=g.objects.filter(o=>o.kind==='counter'),options=[];
  for(const object of g.objects.filter(o=>goods[o.kind]?.includes(product)&&(!displayIds||displayIds.includes(o.id)))){
   const toProduct=route(g,origin,services(g,object));if(!toProduct)continue;
   for(const counter of counters){
    if(!workPlan(g,object,counter))continue;
    const toCounter=route(g,toProduct.at(-1),services(g,counter));if(!toCounter)continue;
    const toExit=route(g,toCounter.at(-1),[g.entrance]);if(!toExit)continue;
    options.push({roomId,product,objectId:object.id,counterId:counter.id,toProduct,toCounter,toExit});
   }
  }
  return options.sort((a,b)=>(a.toProduct.length+a.toCounter.length+a.toExit.length)-(b.toProduct.length+b.toCounter.length+b.toExit.length))[0]||null;
 }
 return {goods,key,build,free,clear,segmentClear,route,services,staffServices,stations,workPlan,assess,plan};
});
