const panel=$('panel');
let selectedProduct='betta',toastTimer;
const titles={stock:'El proveedor',upgrades:'Un poco más grande',activity:'Vida en la tienda',settings:'Tu partida',object:'Acuario'};
function showPanel(name,title){
 document.querySelectorAll('[data-section]').forEach(s=>s.hidden=s.dataset.section!==name);
 $('panelTitle').textContent=title||titles[name];if(!panel.open)panel.showModal();
}
document.querySelectorAll('[data-panel]').forEach(b=>b.onclick=()=>showPanel(b.dataset.panel));
$('closePanel').onclick=()=>panel.close();
panel.addEventListener('click',e=>{if(e.target===panel){const r=panel.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)panel.close()}});
document.querySelectorAll('[data-order]').forEach(b=>b.onclick=()=>order(b.dataset.order,5));
$('shelfBtn').onclick=upgradeShelf;$('tankBtn').onclick=upgradeTank;$('warehouseBtn').onclick=upgradeWarehouse;
$('saveBtn').onclick=()=>saveGame();$('resetBtn').onclick=resetGame;
function objectInfo(){const p=products[selectedProduct];$('objectInfo').innerHTML=`<p>${state.stock[selectedProduct]} unidades disponibles · venta automática</p><div class="stockline"><span>Precio de venta</span><b>${p.sell} 🪙</b></div><div class="stockline"><span>Coste por unidad</span><b>${p.buy} 🪙</b></div><p>${selectedProduct==='food'?'La comida ocupa 1 de volumen por unidad.':'Los peces no consumen volumen de almacén en esta versión.'}</p>`;$('objectOrder').textContent=`Pedir 5 · ${p.buy*5} 🪙`;$('objectOrder').disabled=!!state.delivery||state.money<p.buy*5||used()+p.vol*5>state.capacity;}
function openObject(id){
 if(['betta','comet','shelf'].includes(id)){selectedProduct=id==='shelf'?'food':id;objectInfo();showPanel('object',id==='shelf'?'Comida y estantería':products[id].name+'s');}
 else if(id==='warehouse')showPanel('stock','La trastienda');
 else showPanel('activity',id==='door'?'¡Bienvenidos!':id==='customer'?'De visita':id==='clerk'?'Tu dependiente':'El mostrador');
}
$('objectOrder').onclick=()=>order(selectedProduct,5);
let dragged=false;
document.querySelectorAll('[data-object]').forEach(g=>{g.addEventListener('click',()=>{if(!dragged)openObject(g.dataset.object)});g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openObject(g.dataset.object)}})});
function syncScene(){
 $('shelfExtra').style.display=state.shelf?'block':'none';$('warehouseExtra').style.display=state.warehouse?'block':'none';
 document.querySelectorAll('[data-order]').forEach(b=>{const p=products[b.dataset.order];b.disabled=!!state.delivery||state.money<p.buy*5||used()+p.vol*5>state.capacity});
 $('shelfBtn').disabled=state.shelf||state.money<250;$('tankBtn').disabled=!state.shelf||state.tank3||state.money<350;$('warehouseBtn').disabled=state.level<8||state.warehouse||state.money<4000;
 $('goal').textContent=!state.shelf?'Tu primera estantería':!state.tank3?'Un hogar para más peces':!state.warehouse?'Una tienda con futuro':'Tu pequeño océano crece';
 $('goalDetail').textContent=!state.shelf?'Ahorra 250 monedas y haz crecer tu tienda.':!state.tank3?'Construye el tercer acuario por 350 monedas.':!state.warehouse?'Alcanza el nivel 8 para ampliar el almacén.':'Sigue reponiendo y atendiendo a tus visitantes.';
 document.querySelectorAll('[data-object="betta"] .fish-swim').forEach(g=>g.style.opacity=state.stock.betta?1:0);
 document.querySelectorAll('[data-object="comet"] .fish-swim').forEach(g=>g.style.opacity=state.stock.comet?1:0);
 $('shelfGoods').style.opacity=state.stock.food?1:.25;objectInfo();
}
window.addEventListener('statechange',syncScene);
window.addEventListener('notice',e=>{$('toast').textContent=e.detail;$('toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('visible'),3200)});
window.addEventListener('sale',e=>{$('saleEffect').innerHTML=`<text class="coin-pop" text-anchor="middle" fill="#aa7a2e" font-size="25" font-weight="bold">+${e.detail} 🪙</text>`});
let zoom=1,panX=0,panY=0;
const pointers=new Map();let lastDistance=0,lastPoint;
function camera(){panX=Math.max(-300,Math.min(300,panX));panY=Math.max(-200,Math.min(200,panY));world.setAttribute('transform',`translate(${500+panX} ${390+panY}) scale(${zoom}) translate(-500 -390)`)}
function changeZoom(n){zoom=Math.max(.85,Math.min(1.8,n));camera()}
$('zoomIn').onclick=()=>changeZoom(zoom+.15);$('zoomOut').onclick=()=>changeZoom(zoom-.15);$('zoomReset').onclick=()=>{zoom=1;panX=panY=0;camera()};
const viewport=$('viewport');
viewport.addEventListener('pointerdown',e=>{if(e.target.closest('button'))return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});lastPoint={x:e.clientX,y:e.clientY};dragged=false;lastDistance=0});
window.addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId))return;const prev=pointers.get(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointers.size===2){const [a,b]=[...pointers.values()],d=Math.hypot(a.x-b.x,a.y-b.y);if(lastDistance)changeZoom(zoom*d/lastDistance);lastDistance=d;dragged=true}else{const dx=e.clientX-prev.x,dy=e.clientY-prev.y;if(Math.hypot(e.clientX-lastPoint.x,e.clientY-lastPoint.y)>5)dragged=true;if(dragged){const scale=1000/$('scene').getBoundingClientRect().width;panX+=dx*scale;panY+=dy*scale;camera()}}});
for(const event of ['pointerup','pointercancel'])window.addEventListener(event,e=>{pointers.delete(e.pointerId);lastDistance=0});
viewport.addEventListener('wheel',e=>{e.preventDefault();changeZoom(zoom-e.deltaY*.001)},{passive:false});
window.addEventListener('pagehide',()=>saveGame(false));document.addEventListener('visibilitychange',()=>{if(document.hidden)saveGame(false)});
syncScene();

