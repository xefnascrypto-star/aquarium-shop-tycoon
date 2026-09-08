// Pure, versioned placement data; independent of rendering and economy.
(function(root,factory){const m=factory();if(typeof module==='object'&&module.exports)module.exports=m;else root.ShopLayout=m})(globalThis,()=>{
 const catalog={betta:{label:'Acuario de Bettas',width:5,depth:3,action:'betta'},comet:{label:'Acuario de Cometas',width:5,depth:3,action:'comet'},tank3:{label:'Tercer acuario',width:5,depth:3,action:'betta',unlock:'tank3'},shelf:{label:'Estantería',width:4,depth:2,action:'shelf'},counter:{label:'Mostrador',width:6,depth:3,action:'counter'},plant:{label:'Planta decorativa',width:2,depth:2,action:'decoration'},warehouse:{label:'Cajas del almacén',width:2,depth:2,action:'warehouse'}};
 const roomTypes=['retail','freshwater','plants','marine','reef','warehouse','workshop','pond-koi'];
 const defaults=[['betta-1','betta',0,2],['comet-1','comet',0,6],['shelf-1','shelf',5,0],['counter-1','counter',6,8],['plant-1','plant',0,0],['plant-2','plant',10,2],['plant-3','plant',0,10],['warehouse-1','warehouse',10,5],['tank-3','tank3',5,3]];
 const clone=v=>JSON.parse(JSON.stringify(v));
 function create(){return {version:1,rooms:[{id:'main',type:'retail',width:12,depth:12,origin:{x:500,y:185},reserved:[{x:10,y:0,width:2,depth:2,label:'Entrada'}]}],objects:defaults.map(([id,kind,x,y])=>({id,kind,roomId:'main',x,y,rotation:0}))}}
 function owned(o,state={}){return !catalog[o.kind].unlock||!!state[catalog[o.kind].unlock]}
 function footprint(o){const c=catalog[o.kind];return {x:o.x,y:o.y,width:o.rotation===90?c.depth:c.width,depth:o.rotation===90?c.width:c.depth}}
 function overlaps(a,b){return a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.depth&&a.y+a.depth>b.y}
 function validate(layout,o,state={}){
  const room=layout.rooms.find(r=>r.id===o.roomId);
  if(!room||!catalog[o.kind]||!Number.isInteger(o.x)||!Number.isInteger(o.y)||![0,90].includes(o.rotation))return 'Posición no válida.';
  const b=footprint(o);
  if(b.x<0||b.y<0||b.x+b.width>room.width||b.y+b.depth>room.depth)return 'El objeto queda fuera de la habitación.';
  if(room.reserved.some(c=>overlaps(b,c)))return 'Deja libre la entrada.';
  if(layout.objects.some(other=>other.id!==o.id&&other.roomId===o.roomId&&owned(other,state)&&overlaps(b,footprint(other))))return 'Ese espacio está ocupado.';
  return '';
 }
 function findFree(layout,o,state){
  const room=layout.rooms.find(r=>r.id===o.roomId);if(!room)return null;
  for(const rotation of [o.rotation,o.rotation===0?90:0])for(let y=0;y<room.depth;y++)for(let x=0;x<room.width;x++){const c={...o,x,y,rotation};if(!validate(layout,c,state))return c}
  return null;
 }
 function migrate(saved,state={}){
  const result=create();
  if(saved?.version===1&&Array.isArray(saved.objects)){
   const accepted=[];
   for(const original of result.objects){
    const data=saved.objects.find(o=>o&&o.id===original.id&&o.kind===original.kind);
    const candidate=data?{...original,x:data.x,y:data.y,rotation:data.rotation,roomId:data.roomId}:original;
    const partial={...result,objects:accepted};
    const placed=validate(partial,candidate,state)?findFree(partial,original,state):candidate;
    if(!placed)return create();
    accepted.push(placed);
   }
   result.objects=accepted;
  }
  return result;
 }
 function project(room,x,y){return {x:room.origin.x+(x-y)*30,y:room.origin.y+(x+y)*15}}
 function unproject(room,x,y){const dx=(x-room.origin.x)/30,dy=(y-room.origin.y)/15;return {x:Math.floor((dx+dy)/2),y:Math.floor((dy-dx)/2)}}
 return {catalog,roomTypes,create,clone,owned,footprint,validate,findFree,migrate,project,unproject};
});
