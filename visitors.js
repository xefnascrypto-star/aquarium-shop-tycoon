// Visitors own a basket and a physical itinerary; payment is atomic at a staffed till.
(() => {
const N=ShopNavigation,M=ShopLayout,Motion=ShopMotion,Characters=ShopCharacters,actors=[],names=['Luna','Leo','Nora','Álex','Vera','Hugo'];
let graph,signature='',revision=0,serial=0,selected=null,lastFrame=Date.now(),arrival=0,paused=false;
const grid=a=>graph.grids[a.roomId],object=(a,id)=>grid(a).objects.find(o=>o.id===id);
function refresh(){const next=JSON.stringify([state.layout,Object.keys(ShopDesign.upgrades).map(k=>!!state[k])]);if(next===signature)return;signature=next;graph=N.build(state.layout,state);revision++;if(!window.shopEditor?.active)updateAccessibility(state.layout)}
function status(a){return ({entering:'Entra por la puerta.','to-product':'Busca '+(products[a.product]?.name||'su pedido')+'.',browsing:'Mira '+products[a.product]?.name+'.','to-queue':'Se acerca a la cola.',queue:'Espera su turno en caja.','to-counter':'Le toca: va a su puesto de caja.',checkout:'Su empleado prepara el cobro.',leaving:a.result?'Sale con '+a.result.name+' · '+a.result.amount+' monedas.':'Sale sin comprar. '+(a.reason||''),turning:a.reason,waiting:'Salida bloqueada. Abre un paso en el editor.'})[a.phase]||'Visita terminada.'}
function details(){$('visitorSummary').textContent=actors.length+' visitantes · '+actors.filter(a=>['queue','to-queue'].includes(a.phase)).length+' en cola · '+(state.employee&&!state.employeeUnpaid?2:1)+' puestos de caja.';if(selected)$('visitorInfo').textContent=actors.includes(selected)?status(selected):'La visita ha terminado.'}
function hasStock(basket){return Object.entries(basket).every(([k,q])=>state.stock[k]>=q)}
function itinerary(basket){let start=graph.grids.main.entrance;const stops=[];let counterId;
for(const k of Object.keys(basket)){const p=N.plan(graph,k,'main',start);if(!p)return null;counterId=p.counterId;if(!stops.some(s=>s.objectId===p.objectId))stops.push({objectId:p.objectId,product:k});start=p.toProduct.at(-1)}
return {stops,counterId};
}
function spawn(){
if(!state.identity)return;
const g=graph.grids.main;if(!N.free(g,g.entrance))return;
let basket,kit=false,specific=false,request=window.ShopMoments?.claim();
if(request){basket=request.basket;specific=true}
else if(state.kitRequested&&!actors.some(a=>a.kit&&!a.paid)&&hasStock(ShopDesign.kit)){basket={...ShopDesign.kit};kit=true}
else {
 const all=Object.keys(products).filter(unlocked),available=all.filter(k=>state.stock[k]-(state.kitRequested?(ShopDesign.kit[k]||0):0)-(window.ShopMoments?.reserved(k)||0)>0);
 const interest=window.ShopMoments?.interest(),fish=all.filter(k=>products[k].vol===0);
 specific=serial%5===3||!!interest&&Math.random()<.6;
 const keys=specific?(interest?[interest]:fish):state.level>=8&&Math.random()<.25?all:available.length?available:all;
 const k=keys[Math.floor(Math.random()*keys.length)];basket=k?{[k]:state.level>=6&&['neon','molly','cory','ancistrus'].includes(k)?2+Math.floor(Math.random()*4):1}:{};
 }
 let route=Object.keys(basket).length?itinerary(basket):null;
 if(!route&&!specific&&!kit){for(const k of Object.keys(products).filter(k=>unlocked(k)&&state.stock[k]>(state.kitRequested?(ShopDesign.kit[k]||0):0)+(window.ShopMoments?.reserved(k)||0))){const alternate=itinerary({[k]:1});if(alternate){basket={[k]:1};route=alternate;break}}}
 const stops=route?.stops||[];
state.potential++;
const a={id:++serial,name:names[(serial-1)%names.length],roomId:'main',basket,kit,specific,requestId:request?.id,stops,stop:0,product:stops[0]?.product||Object.keys(basket)[0],objectId:stops[0]?.objectId,counterId:route?.counterId,distance:0,facing:1,direction:null,motion:null,motionIndex:0,cell:{...g.entrance},position:{x:g.entrance.x+.5,y:g.entrance.y+.5},phase:'entering',remaining:.5,path:null,progress:0,result:null,paid:false,lost:false,reason:!hasStock(basket)||!Object.keys(basket).length?'Falta stock del producto que busca.':'No hay un recorrido completo al expositor y a caja.',revision,server:null,queueCell:null,ticket:null};
const node=Characters.create({id:a.id,color:serial%2?'#e89b75':'#91a7cd',skin:serial%3?'#edbc91':'#c18e6e',hair:serial%2?'#625047':'#8c6c51'});a.node=node;
const inspect=()=>{selected=a;showPanel('visitor',a.name+(a.kit?' · acuario completo':' · de visita'));details()};
node.addEventListener('click',()=>{if(!dragged)inspect()});node.addEventListener('keydown',e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();inspect()}});
actors.push(a);
}
function goals(a,phase){if(phase==='leaving')return [grid(a).entrance];if(phase==='to-queue')return a.queueCell?[a.queueCell]:[];if(phase==='to-counter'&&a.server)return [a.server.cell];const o=object(a,a.objectId);return o?N.services(grid(a),o):[]}
function remove(a){Characters.remove(a.node);actors.splice(actors.indexOf(a),1);a.phase='done';details()}
function arrive(a){a.path=null;a.motion=null;a.progress=0;if(a.phase==='leaving'){remove(a);return}if(a.phase==='to-product'){a.phase='browsing';a.remaining=2.5}else if(a.phase==='to-queue'){a.phase='queue';a.remaining=0}else {a.phase='checkout';a.remaining=a.server?.seconds||6}}
function walk(a,phase){
 let path=N.route(grid(a),a.cell,goals(a,phase));a.revision=revision;
 if(!path&&phase==='to-product'){
 const alternate=N.plan(graph,a.product,a.roomId,a.cell);
 if(alternate){a.objectId=alternate.objectId;a.counterId=alternate.counterId;path=alternate.toProduct}
 }
 if(!path){if(phase==='leaving'){a.phase='waiting';a.path=null;a.motion=null;return}fail(a,'No hay un camino libre hasta su destino.');return}
 const motion=Motion.points(path,grid(a),a.position);
 if(!motion){if(phase==='leaving'){a.phase='waiting';a.path=null;a.motion=null;return}fail(a,'El paso es demasiado estrecho.');return}
 a.phase=phase;a.path=path;a.motion=motion;a.motionIndex=1;a.progress=0;if(motion.length<=1)arrive(a);
}
function fail(a,reason){if(a.requestId)window.ShopMoments?.finish(a.requestId,false);a.reason=reason;a.phase='turning';a.remaining=1.2;a.path=null;a.motion=null;a.server=null;a.queueCell=null;if(!a.lost&&!a.paid){a.lost=true;loseSale(reason)}}
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
for(const a of waiting){const c=object(a,a.counterId);if(!c)continue;const cells=N.services(grid(a),c).filter(cell=>N.route(grid(a),grid(a).entrance,[cell]));
const staff=[{id:0,seconds:6}];if(state.level>=9&&state.employee&&!state.employeeUnpaid)staff.push({id:1,seconds:ShopDesign.employees[state.employee].service});
const server=staff.find(s=>!actors.some(v=>v.server?.id===s.id)&&cells[s.id]&&N.route(grid(a),a.cell,[cells[s.id]]));
if(server){a.server={...server,cell:cells[server.id]};a.queueCell=null;walk(a,'to-counter')}
}
}
function advance(a,dt){
if(a.phase==='queue')return;
if(a.phase==='waiting'){if(a.revision!==revision){a.revision=revision;walk(a,'leaving')}return}
if(a.path){
 if(a.revision!==revision){if(a.path.every(c=>N.free(grid(a),c)))a.revision=revision;else {walk(a,a.phase);if(!a.path)return}}
 const moved=Motion.travel(a.position,a.motion,a.motionIndex,dt*3,grid(a));a.position=moved.position;a.motionIndex=moved.index;a.distance+=moved.walked;
 if(moved.direction){a.direction=moved.direction;a.facing=moved.direction.x-moved.direction.y>=0?1:-1}
 a.cell={x:Math.floor(a.position.x),y:Math.floor(a.position.y)};
 if(moved.blocked){walk(a,a.phase);return}if(moved.done)arrive(a);return;
}
a.remaining-=dt;if(a.remaining>0)return;
if(a.phase==='entering'){if(!a.objectId||!hasStock(a.basket)){fail(a,a.reason);return}walk(a,'to-product')}
else if(a.phase==='browsing'){if(!hasStock(a.basket)){fail(a,'El producto se ha agotado.');return}a.stop++;if(a.stop<a.stops.length){Object.assign(a,a.stops[a.stop]);walk(a,'to-product')}else queue(a)}
else if(a.phase==='checkout'){const c=object(a,a.counterId);if(!c||!N.services(grid(a),c).some(p=>N.key(p)===N.key(a.cell))){fail(a,'La caja ya no es accesible.');return}if(a.paid)return;
const p=M.project(grid(a).room,a.position.x,a.position.y);$('saleEffect').setAttribute('transform','translate('+p.x+' '+(p.y-80)+')');
a.result=sellBasket(a.basket,{requestId:a.requestId});a.server=null;if(a.result){a.paid=true;walk(a,'leaving')}else fail(a,'El producto se agotó antes del pago.');
}else if(a.phase==='turning')walk(a,'leaving');
}
function draw(){
for(const a of actors){
 const feet=M.project(grid(a).room,a.position.x,a.position.y);
 const t=(key,params)=>ShopI18n.t(key,params),bubble=({entering:a.requestId?t('order'):a.kit?t('aquarium'):a.specific?t('seeking',{name:products[a.product]?.name}):t('hello'),'to-product':a.specific?t('seeking',{name:products[a.product]?.name}):t('look'),browsing:a.kit?t('set'):products[a.product]?.name,'to-queue':t(state.level>=9?'queue':'till'),queue:t(state.level>=9?'turn':'pay'),'to-counter':t('myTurn'),checkout:t('checkout'),leaving:t(a.result?'thanks':'bye'),turning:t('later'),waiting:t('blocked')})[a.phase]||'';
 Characters.update(a.node,{feet,phase:a.phase,moving:!!a.path,distance:a.distance,facing:a.facing,bubble,label:a.name+': '+status(a),result:a.result?'sale':a.lost?'empty':'pending'});
}
document.querySelectorAll('.shop-clerk').forEach((node,index)=>node.classList.toggle('serving',actors.some(a=>a.phase==='checkout'&&a.server?.id===index)));
const layer=$('furnitureLayer'),items=[...layer.querySelectorAll(':scope > [data-instance]')].map(node=>{const o=state.layout.objects.find(o=>o.id===node.dataset.instance);return {node,bounds:M.footprint(o)}});
items.push(...actors.map(a=>({node:a.node,bounds:{x:a.position.x-.28,y:a.position.y-.28,width:.56,depth:.56}})));
for(const item of ShopDepth.sort(items))layer.append(item.node);details();
}
function tick(){const now=Date.now();let dt=Math.min(.1,Math.max(0,(now-lastFrame)/1000))*state.speed;lastFrame=now;if(paused||document.hidden||!state.identity||ShopIdentity.editing)return;refresh();
while(dt>0){const step=Math.min(.05,dt);dt-=step;for(const a of [...actors])advance(a,step);schedule();arrival-=step;if(arrival<=0&&actors.length<(state.level>=9?7:3)){spawn();arrival=state.level>=9?3:8}}
draw();
}
$('visitorStock').onclick=()=>showPanel('stock');
window.shopCirculation={occupied(){return actors.flatMap(a=>[a.cell,...(a.path?.slice(0,2)||[])].map(c=>({...c,roomId:a.roomId})))},snapshot(){return actors.map(a=>({id:a.id,phase:a.phase,distance:a.distance,interaction:!!a.objectId&&N.services(grid(a),object(a,a.objectId)||{kind:'plant',x:-99,y:-99,rotation:0}).some(c=>N.key(c)===N.key(a.cell)),cell:{...a.cell},position:{...a.position},product:a.product,objectId:a.objectId,counterId:a.counterId,result:a.result,basket:{...a.basket},requestId:a.requestId,specific:a.specific,kit:a.kit,server:a.server?.id,path:a.path?.map(c=>({...c}))||[],roomId:a.roomId}))}};
window.addEventListener('editbegin',()=>{paused=true;for(const a of actors)Characters.remove(a.node);actors.length=0;selected=null});
window.addEventListener('editend',()=>{paused=false;lastFrame=Date.now();arrival=8;refresh();spawn();draw()});
window.addEventListener('shopstarted',()=>{lastFrame=Date.now();arrival=8;spawn();draw()});
window.addEventListener('layoutchange',refresh);window.addEventListener('statechange',refresh);
document.addEventListener('visibilitychange',()=>lastFrame=Date.now());
refresh();spawn();draw();arrival=8;function frame(){tick();requestAnimationFrame(frame)}requestAnimationFrame(frame);
})();
