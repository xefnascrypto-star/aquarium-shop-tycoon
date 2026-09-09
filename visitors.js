// Visitors own a basket and a physical itinerary; payment is atomic at a staffed till.
(() => {
const N=ShopNavigation,M=ShopLayout,actors=[],names=['Luna','Leo','Nora','Álex','Vera','Hugo'];
let graph,signature='',revision=0,serial=0,selected=null,lastFrame=Date.now(),arrival=0,paused=false;
const grid=a=>graph.grids[a.roomId],object=(a,id)=>grid(a).objects.find(o=>o.id===id);
function refresh(){const next=JSON.stringify(state.layout);if(next===signature)return;signature=next;graph=N.build(state.layout,state);revision++;if(!window.shopEditor?.active)updateAccessibility(state.layout)}
function status(a){return ({entering:'Entra por la puerta.','to-product':'Busca '+(products[a.product]?.name||'su pedido')+'.',browsing:'Mira '+products[a.product]?.name+'.','to-queue':'Se acerca a la cola.',queue:'Espera su turno en caja.','to-counter':'Le toca: va a su puesto de caja.',checkout:'Su empleado prepara el cobro.',leaving:a.result?'Sale con '+a.result.name+' · '+a.result.amount+' monedas.':'Sale sin comprar. '+(a.reason||''),turning:a.reason,waiting:'Salida bloqueada. Abre un paso en el editor.'})[a.phase]||'Visita terminada.'}
function details(){$('visitorSummary').textContent=actors.length+' visitantes · '+actors.filter(a=>['queue','to-queue'].includes(a.phase)).length+' en cola · '+(state.employee&&!state.employeeUnpaid?2:1)+' puestos de caja.';if(selected)$('visitorInfo').textContent=actors.includes(selected)?status(selected):'La visita ha terminado.'}
function hasStock(basket){return Object.entries(basket).every(([k,q])=>state.stock[k]>=q)}
function itinerary(basket){let start=graph.grids.main.entrance;const stops=[];let counterId;
for(const k of Object.keys(basket)){const p=N.plan(graph,k,'main',start);if(!p)return null;counterId=p.counterId;if(!stops.some(s=>s.objectId===p.objectId))stops.push({objectId:p.objectId,product:k});start=p.toProduct.at(-1)}
return {stops,counterId};
}
function spawn(){
const g=graph.grids.main;if(!N.free(g,g.entrance))return;
let basket,kit=false;
if(state.kitRequested&&!actors.some(a=>a.kit&&!a.paid)&&hasStock(ShopDesign.kit)){basket={...ShopDesign.kit};kit=true}
else {const all=Object.keys(products).filter(unlocked),available=all.filter(k=>state.stock[k]-(state.kitRequested?(ShopDesign.kit[k]||0):0)>0),keys=state.level>=8&&Math.random()<.25?all:available.length?available:all;const k=keys[Math.floor(Math.random()*keys.length)];basket=k?{[k]:state.level>=6&&['neon','molly','cory','ancistrus'].includes(k)?2+Math.floor(Math.random()*4):1}:{}}
const route=Object.keys(basket).length?itinerary(basket):null,stops=route?.stops||[];
state.potential++;
const a={id:++serial,name:names[(serial-1)%names.length],roomId:'main',basket,kit,stops,stop:0,product:stops[0]?.product||Object.keys(basket)[0],objectId:stops[0]?.objectId,counterId:route?.counterId,cell:{...g.entrance},position:{x:g.entrance.x+.5,y:g.entrance.y+.5},phase:'entering',remaining:.5,path:null,progress:0,result:null,paid:false,lost:false,reason:!hasStock(basket)||!Object.keys(basket).length?'Falta stock del producto que busca.':'No hay un recorrido completo al expositor y a caja.',revision,server:null,queueCell:null,ticket:null};
const node=document.createElementNS('http://www.w3.org/2000/svg','g');node.classList.add('live-visitor');node.setAttribute('role','button');node.setAttribute('tabindex','0');node.dataset.visitorId=a.id;
node.innerHTML=person(serial%2?'#e89b75':'#91a7cd')+'<g class="visitor-bubble" transform="translate(-48 -117)"><rect width="96" height="27" rx="10"/><text x="48" y="18" text-anchor="middle"></text></g>';a.node=node;
const inspect=()=>{selected=a;showPanel('visitor',a.name+(a.kit?' · acuario completo':' · de visita'));details()};
node.addEventListener('click',()=>{if(!dragged)inspect()});node.addEventListener('keydown',e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();inspect()}});
actors.push(a);
}
function goals(a,phase){if(phase==='leaving')return [grid(a).entrance];if(phase==='to-queue')return a.queueCell?[a.queueCell]:[];if(phase==='to-counter'&&a.server)return [a.server.cell];const o=object(a,a.objectId);return o?N.services(grid(a),o):[]}
function remove(a){a.node.remove();actors.splice(actors.indexOf(a),1);a.phase='done';details()}
function arrive(a){a.path=null;a.progress=0;if(a.phase==='leaving'){remove(a);return}if(a.phase==='to-product'){a.phase='browsing';a.remaining=2.5}else if(a.phase==='to-queue'){a.phase='queue';a.remaining=0}else {a.phase='checkout';a.remaining=a.server?.seconds||6}}
function walk(a,phase){const path=N.route(grid(a),a.cell,goals(a,phase));a.revision=revision;
if(!path){if(phase==='leaving'){a.phase='waiting';a.path=null;return}fail(a,'No hay un camino libre hasta su destino.');return}
a.phase=phase;a.path=path;a.progress=0;if(path.length===1)arrive(a);
}
function fail(a,reason){a.reason=reason;a.phase='turning';a.remaining=1.2;a.path=null;a.server=null;a.queueCell=null;if(!a.lost&&!a.paid){a.lost=true;loseSale(reason)}}
function queue(a){
a.ticket=a.id;const c=object(a,a.counterId),cells=c?N.services(grid(a),c):[];
const occupied=new Set(actors.filter(v=>v!==a).flatMap(v=>[v.queueCell,v.server?.cell].filter(Boolean)).map(N.key));
const candidates=cells.slice(2).concat(cells.slice(0,2));
a.queueCell=candidates.find(cell=>!occupied.has(N.key(cell))&&N.route(grid(a),a.cell,[cell]));
if(!a.queueCell){a.phase='queue';a.remaining=0;return}
walk(a,'to-queue');
}
function schedule(){
const waiting=actors.filter(a=>a.phase==='queue').sort((a,b)=>a.ticket-b.ticket);
for(const a of waiting){const c=object(a,a.counterId);if(!c)continue;const cells=N.services(grid(a),c);
const staff=[{id:0,seconds:6}];if(state.level>=9&&state.employee&&!state.employeeUnpaid)staff.push({id:1,seconds:ShopDesign.employees[state.employee].service});
const server=staff.find(s=>!actors.some(v=>v.server?.id===s.id)&&cells[s.id]&&N.route(grid(a),a.cell,[cells[s.id]]));
if(server){a.server={...server,cell:cells[server.id]};a.queueCell=null;walk(a,'to-counter')}
}
}
function advance(a,dt){
if(a.phase==='queue')return;
if(a.phase==='waiting'){if(a.revision!==revision){a.revision=revision;walk(a,'leaving')}return}
if(a.path){if(a.progress===0&&a.revision!==revision){walk(a,a.phase);if(!a.path)return}const next=a.path[1];if(!next){arrive(a);return}if(!N.free(grid(a),next)){walk(a,a.phase);return}
a.progress+=dt*3;const t=Math.min(1,a.progress);a.position={x:a.cell.x+.5+(next.x-a.cell.x)*t,y:a.cell.y+.5+(next.y-a.cell.y)*t};
if(a.progress>=1){a.cell={...next};a.position={x:next.x+.5,y:next.y+.5};a.path.shift();a.progress=0;if(a.path.length===1)arrive(a)}return}
a.remaining-=dt;if(a.remaining>0)return;
if(a.phase==='entering'){if(!a.objectId||!hasStock(a.basket)){fail(a,a.reason);return}walk(a,'to-product')}
else if(a.phase==='browsing'){if(!hasStock(a.basket)){fail(a,'El producto se ha agotado.');return}a.stop++;if(a.stop<a.stops.length){Object.assign(a,a.stops[a.stop]);walk(a,'to-product')}else queue(a)}
else if(a.phase==='checkout'){const c=object(a,a.counterId);if(!c||!N.services(grid(a),c).some(p=>N.key(p)===N.key(a.cell))){fail(a,'La caja ya no es accesible.');return}if(a.paid)return;
const p=M.project(grid(a).room,a.position.x,a.position.y);$('saleEffect').setAttribute('transform','translate('+p.x+' '+(p.y-80)+')');
a.result=sellBasket(a.basket);a.server=null;if(a.result){a.paid=true;walk(a,'leaving')}else fail(a,'El producto se agotó antes del pago.');
}else if(a.phase==='turning')walk(a,'leaving');
}
function draw(){
for(const a of actors){const p=M.project(grid(a).room,a.position.x,a.position.y);a.node.setAttribute('transform','translate('+p.x+' '+p.y+')');a.node.dataset.phase=a.phase;a.node.dataset.result=a.result?'sale':a.lost?'empty':'pending';a.node.setAttribute('aria-label',a.name+': '+status(a));
a.node.querySelector('text').textContent=({entering:a.kit?'Mi acuario':'¡Hola!','to-product':'Voy a mirar',browsing:a.kit?'El conjunto':products[a.product]?.name,'to-queue':state.level>=9?'A la cola':'A la caja',queue:state.level>=9?'Mi turno…':'Voy a pagar','to-counter':'¡Me toca!',checkout:'En caja',leaving:a.result?'¡Gracias!':'Hasta luego',turning:'Otra vez será',waiting:'Sin paso'})[a.phase]||''}
const layer=$('furnitureLayer'),items=[...layer.querySelectorAll(':scope > [data-instance]')].map(node=>{const o=state.layout.objects.find(o=>o.id===node.dataset.instance),b=M.footprint(o);return {node,depth:o.x+o.y+b.width+b.depth}});
items.push(...actors.map(a=>({node:a.node,depth:a.position.x+a.position.y})));items.sort((a,b)=>a.depth-b.depth);for(const item of items)layer.append(item.node);details();
}
function tick(){const now=Date.now();let dt=Math.min(.15,Math.max(0,(now-lastFrame)/1000))*state.speed;lastFrame=now;if(paused||document.hidden)return;refresh();
while(dt>0){const step=Math.min(.05,dt);dt-=step;for(const a of [...actors])advance(a,step);schedule();arrival-=step;if(arrival<=0&&actors.length<(state.level>=9?7:3)){spawn();arrival=state.level>=9?3:8}}
draw();
}
$('visitorStock').onclick=()=>showPanel('stock');
window.shopCirculation={occupied(){return actors.flatMap(a=>[a.cell,...(a.path?.slice(0,2)||[])].map(c=>({...c,roomId:a.roomId})))},snapshot(){return actors.map(a=>({id:a.id,phase:a.phase,cell:{...a.cell},position:{...a.position},product:a.product,objectId:a.objectId,counterId:a.counterId,result:a.result,basket:{...a.basket},kit:a.kit,server:a.server?.id,path:a.path?.map(c=>({...c}))||[],roomId:a.roomId}))}};
window.addEventListener('editbegin',()=>{paused=true;for(const a of actors)a.node.remove();actors.length=0;selected=null});
window.addEventListener('editend',()=>{paused=false;lastFrame=Date.now();arrival=8;refresh();spawn();draw()});
window.addEventListener('layoutchange',refresh);window.addEventListener('statechange',refresh);
document.addEventListener('visibilitychange',()=>lastFrame=Date.now());
refresh();spawn();draw();arrival=8;setInterval(tick,50);
})();
