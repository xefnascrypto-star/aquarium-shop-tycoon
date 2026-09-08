// Physical visitor state machine. Only checkout completion can award a sale.
(() => {
 const N=ShopNavigation,M=ShopLayout,actors=[],names=['Luna','Leo','Nora','Álex','Vera','Hugo'];
 const SPEED=3,BROWSE=2.5,CHECKOUT=1,ARRIVAL=8,MAX_VISITORS=3;
 let graph,signature='',revision=0,serial=0,selected=null,lastFrame=Date.now(),arrival=0,cashCooldown=0,paused=false;
 function grid(a){return graph.grids[a.roomId]}
 function object(a,id){return grid(a).objects.find(o=>o.id===id)}
 function refresh(){
  const next=JSON.stringify([state.layout,!!state.tank3]);
  if(next===signature)return;signature=next;graph=N.build(state.layout,state);revision++;
  if(!window.shopEditor?.active)updateAccessibility(state.layout);
 }
 function status(a){
  const messages={entering:'Acaba de entrar por la puerta.','to-product':'Camina hacia '+(products[a.product]?.name||'el expositor')+'.',browsing:'Está mirando '+(products[a.product]?.name||'productos')+'.','to-counter':'Va al mostrador con su elección.',checkout:'Está en la caja.',leaving:a.result?'Sale con '+products[a.result.key].name+'; ha pagado '+a.result.amount+' monedas.':'Sale sin comprar. '+(a.reason||''),turning:a.reason||'No encuentra un producto.',waiting:'No puede salir: el camino está bloqueado. Abre Editar para liberar el paso.'};
  return messages[a.phase]||'Visita terminada.';
 }
 function details(){
  $('visitorSummary').textContent=actors.length+' '+(actors.length===1?'visitante':'visitantes')+' · las compras se realizan al llegar a caja.';
  if(selected)$('visitorInfo').textContent=actors.includes(selected)?status(selected):(selected.result?'Se ha marchado con su compra.':'Se ha marchado sin comprar.');
 }
 function spawn(){
  const roomId='main',g=graph.grids[roomId];if(!g||!N.free(g,g.entrance))return;
  const keys=Object.keys(products).filter(k=>state.stock[k]>0),product=keys.length?keys[Math.floor(Math.random()*keys.length)]:null;
  const plan=product?N.plan(graph,product,roomId):null;
  const a={id:++serial,name:names[(serial-1)%names.length],roomId,product,objectId:plan?.objectId,counterId:plan?.counterId,cell:{...g.entrance},position:{x:g.entrance.x+.5,y:g.entrance.y+.5},phase:'entering',remaining:.5,path:null,progress:0,result:null,paid:false,reason:product?'No hay un camino completo al producto y a la caja.':'No hay stock.',revision};
  const node=document.createElementNS('http://www.w3.org/2000/svg','g');node.classList.add('live-visitor');node.setAttribute('role','button');node.setAttribute('tabindex','0');
  node.innerHTML=person(serial%2?'#e89b75':'#91a7cd')+'<g class="visitor-bubble" transform="translate(-43 -117)"><rect width="86" height="27" rx="10"/><text x="43" y="18" text-anchor="middle"></text></g>';a.node=node;node.dataset.visitorId=String(a.id);
  const inspect=()=>{selected=a;showPanel('visitor',a.name+' · de visita');details()};
  node.addEventListener('click',()=>{if(!dragged)inspect()});node.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();inspect()}});
  actors.push(a);draw();
 }
 function goals(a,phase){
  if(phase==='leaving')return [grid(a).entrance];
  const o=object(a,phase==='to-product'?a.objectId:a.counterId);
  return o?N.services(grid(a),o):[];
 }
 function remove(a){a.node.remove();actors.splice(actors.indexOf(a),1);a.phase='done';details()}
 function arrive(a){
  a.path=null;a.progress=0;
  if(a.phase==='leaving'){remove(a);return}
  a.phase=a.phase==='to-product'?'browsing':'checkout';a.remaining=a.phase==='browsing'?BROWSE:CHECKOUT;
 }
 function walk(a,phase){
  const path=N.route(grid(a),a.cell,goals(a,phase));a.revision=revision;
  if(!path){
   if(phase==='leaving'){a.phase='waiting';a.path=null;return}
   a.reason='La ruta al expositor o a la caja está bloqueada.';walk(a,'leaving');return;
  }
  a.phase=phase;a.path=path;a.progress=0;if(path.length===1)arrive(a);
 }
 function fail(a,reason){a.reason=reason;a.phase='turning';a.remaining=1.2;a.path=null}
 function advance(a,dt){
  if(a.phase==='waiting'){if(a.revision!==revision){a.revision=revision;walk(a,'leaving')}return}
  if(a.path){
   // Replan at a cell centre, never jump across an obstacle after a layout upgrade.
   if(a.progress===0&&a.revision!==revision){walk(a,a.phase);if(!a.path)return}
   const next=a.path[1];if(!next){arrive(a);return}
   if(!N.free(grid(a),next)){walk(a,a.phase);return}
   a.progress+=dt*SPEED;
   const t=Math.min(1,a.progress);a.position={x:a.cell.x+.5+(next.x-a.cell.x)*t,y:a.cell.y+.5+(next.y-a.cell.y)*t};
   if(a.progress>=1){a.cell={...next};a.position={x:next.x+.5,y:next.y+.5};a.path.shift();a.progress=0;if(a.path.length===1)arrive(a)}
   return;
  }
  a.remaining-=dt;if(a.remaining>0)return;
  if(a.phase==='entering'){
   if(!a.objectId){fail(a,a.reason);return}walk(a,'to-product');
  }else if(a.phase==='browsing'){
   if(!state.stock[a.product]){fail(a,'El producto se ha agotado.');return}walk(a,'to-counter');
  }else if(a.phase==='checkout'){
   if(cashCooldown>0)return;
   const counter=object(a,a.counterId),atCounter=counter&&N.services(grid(a),counter).some(c=>N.key(c)===N.key(a.cell));
   if(!atCounter){walk(a,'to-counter');return}
   if(a.paid)return;
   const p=M.project(grid(a).room,a.position.x,a.position.y);$('saleEffect').setAttribute('transform','translate('+p.x+' '+(p.y-80)+')');
   a.result=customer(a.product,true);a.paid=true;
   if(a.result)cashCooldown=8;else a.reason='El producto se ha agotado antes del pago.';
   walk(a,'leaving');
  }else if(a.phase==='turning'){walk(a,'leaving')}
 }
 function draw(){
  for(const a of actors){
   const p=M.project(grid(a).room,a.position.x,a.position.y);
   a.node.setAttribute('transform','translate('+p.x+' '+p.y+')');a.node.dataset.phase=a.phase;a.node.dataset.result=a.result?'sale':a.reason&&['turning','leaving','waiting'].includes(a.phase)?'empty':'pending';a.node.setAttribute('aria-label',a.name+': '+status(a));
   a.node.querySelector('text').textContent=({entering:'¡Hola!','to-product':'Voy a mirar',browsing:products[a.product]?.name||'Mirando','to-counter':'A la caja',checkout:'En caja',leaving:a.result?'¡Gracias!':'Hasta luego',turning:a.product?'Sin acceso':'Sin stock',waiting:'Sin paso'})[a.phase]||'';
  }
  // Draw people behind/in front of furniture according to their floor depth.
  const layer=$('furnitureLayer'),items=[...layer.querySelectorAll(':scope > [data-instance]')].map(node=>{const o=state.layout.objects.find(o=>o.id===node.dataset.instance),b=M.footprint(o);return {node,depth:o.x+o.y+b.width+b.depth}});
  items.push(...actors.map(a=>({node:a.node,depth:a.position.x+a.position.y})));
  items.sort((a,b)=>a.depth-b.depth);for(const item of items)layer.append(item.node);
  details();
 }
 function tick(){
  const now=Date.now(),dt=Math.min(.15,Math.max(0,(now-lastFrame)/1000));lastFrame=now;
  if(paused||document.hidden)return;
  refresh();cashCooldown=Math.max(0,cashCooldown-dt);
  for(const a of [...actors])advance(a,dt);
  arrival-=dt;if(arrival<=0&&actors.length<MAX_VISITORS){spawn();arrival=ARRIVAL}
  draw();
 }
 $('visitorStock').onclick=()=>showPanel('stock');
 window.shopCirculation={
  occupied(){return actors.flatMap(a=>[a.cell,...(a.path?.slice(0,2)||[])].map(c=>({...c,roomId:a.roomId})))},
  snapshot(){return actors.map(a=>({id:a.id,phase:a.phase,cell:{...a.cell},position:{...a.position},product:a.product,objectId:a.objectId,counterId:a.counterId,result:a.result,path:a.path?.map(c=>({...c}))||[],roomId:a.roomId}))}
 };
 window.addEventListener('editbegin',()=>{paused=true;for(const a of actors)a.node.remove();actors.length=0;selected=null});
 window.addEventListener('editend',()=>{paused=false;lastFrame=Date.now();arrival=ARRIVAL;refresh();spawn()});
 window.addEventListener('layoutchange',refresh);window.addEventListener('statechange',refresh);
 document.addEventListener('visibilitychange',()=>{lastFrame=Date.now()});
 refresh();spawn();arrival=ARRIVAL;setInterval(tick,50);
})();
