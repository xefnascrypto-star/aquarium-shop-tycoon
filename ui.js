const panel=$('panel');
let selectedInstance=null,toastTimer,orderQuantity=5,dragged=false,cardTimer;
const titles={stock:'El proveedor',upgrades:'Haz crecer tu tienda',activity:'Vida en la tienda',settings:'Tu partida',object:'Tu expositor',circulation:'Circulación',journey:'Tu siguiente paso',contract:'Mi primer acuario',team:'Tu equipo'};
function showPanel(name,title){document.querySelectorAll('[data-section]').forEach(s=>s.hidden=s.dataset.section!==name);$('panelTitle').textContent=title||titles[name];syncScene();if(!panel.open)panel.showModal()}
document.querySelectorAll('[data-panel]').forEach(b=>b.onclick=()=>showPanel(b.dataset.panel));
$('closePanel').onclick=()=>panel.close();
panel.addEventListener('click',e=>{if(e.target===panel){const r=panel.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)panel.close()}});
$('saveBtn').onclick=()=>saveGame();$('resetBtn').onclick=resetGame;
function card(eyebrow,title,detail){$('unlockEyebrow').textContent=eyebrow;$('unlockTitle').textContent=title;$('unlockDetail').textContent=detail;$('unlockCard').hidden=false;clearTimeout(cardTimer);cardTimer=setTimeout(()=>$('unlockCard').hidden=true,8500)}
$('unlockClose').onclick=()=>{$('unlockCard').hidden=true};
window.addEventListener('levelup',e=>{const l=ShopDesign.levels.find(l=>l.level===e.detail);card('NIVEL '+e.detail+' · NUEVAS POSIBILIDADES',l.name,l.unlock+'. '+Object.values(products).filter(p=>p.level===e.detail&&!p.investment).map(p=>p.icon+' '+p.name).join(' · '));document.querySelector('.hud').classList.remove('level-glow');requestAnimationFrame(()=>document.querySelector('.hud').classList.add('level-glow'))});
function productRows(keys,ordering=false){return keys.map(k=>{const p=products[k],q=quote(k,orderQuantity),can=!orderReason(k,orderQuantity);return '<div class="product-row"><span class="product-icon">'+p.icon+'</span><div><b>'+p.name+'</b><small>'+state.stock[k]+' disponibles'+(state.kitRequested&&ShopDesign.kit[k]?' · 1 reservado':'')+' · venta '+p.sell+' 🪙</small></div>'+(ordering?'<button data-order="'+k+'" '+(!can?'disabled':'')+'>'+orderQuantity+' × · '+fmt(q?.cost||0)+' 🪙</button>':'')+'</div>'}).join('')}
function objectInfo(){
const o=state.layout?.objects.find(o=>o.id===selectedInstance);if(!o)return;
const keys=(ShopNavigation.goods[o.kind]||[]).filter(unlocked);$('objectInfo').innerHTML=keys.length?productRows(keys):'<p>Un rincón de tu tienda. Puedes cambiar su posición.</p>';
}
function openObject(id,instance){
selectedInstance=instance||state.layout.objects.find(o=>ShopLayout.catalog[o.kind].action===id)?.id;
if(id==='door'||id==='counter')return showPanel('activity',id==='door'?'¡Bienvenidos!':'El mostrador');
if(id==='warehouse')return showPanel('stock','La trastienda');
objectInfo();showPanel('object',ShopLayout.catalog[state.layout.objects.find(o=>o.id===selectedInstance)?.kind]?.label||'Tu tienda');
}
$('objectStock').onclick=()=>showPanel('stock');$('objectEdit').onclick=()=>shopEditor.begin(selectedInstance);
world.addEventListener('click',e=>{const g=e.target.closest('[data-object]');if(g&&!dragged&&!window.shopEditor?.active)openObject(g.dataset.object,e.target.closest('[data-instance]')?.dataset.instance)});
world.addEventListener('keydown',e=>{const g=e.target.closest('[data-object]');if(g&&!window.shopEditor?.active&&(e.key==='Enter'||e.key===' ')){e.preventDefault();openObject(g.dataset.object,e.target.closest('[data-instance]')?.dataset.instance)}});
$('stock').onclick=e=>{const b=e.target.closest('[data-order]');if(b)order(b.dataset.order,orderQuantity)};
$('upgradeList').onclick=e=>{const b=e.target.closest('[data-upgrade]');if(b)buyUpgrade(b.dataset.upgrade)};
$('pendingList').onclick=e=>{const b=e.target.closest('[data-place]');if(b)shopEditor.begin(b.dataset.place)};
$('teamList').onclick=e=>{const b=e.target.closest('[data-hire]');if(b)hire(b.dataset.hire)};
$('kitAccept').onclick=()=>{if(state.level<4||state.kitRequested)return;state.kitRequested=true;log('Pedido aceptado. La clienta vendrá cuando estén todos los productos.');syncScene();saveGame(false)};
$('rescueBtn').onclick=rescue;
$('gameSpeed').onchange=e=>{state.speed=Number(e.target.value);saveGame(false);syncScene()};
$('productFilter').onchange=()=>syncScene();
document.querySelectorAll('[data-supplier]').forEach(b=>b.onclick=()=>{if(b.dataset.supplier==='wholesale'&&state.level<7)return;state.supplier=b.dataset.supplier;saveGame(false);syncScene()});
document.querySelectorAll('[data-quantity]').forEach(b=>b.onclick=()=>{orderQuantity=Number(b.dataset.quantity);syncScene()});
function syncScene(){
document.querySelector('[data-section="team"]>p').textContent=ShopI18n.t('teamPhysical');
$('gameSpeed').value=state.speed;$('gameHint').textContent='Toca tu tienda · v0.9 · ritmo ×'+state.speed;$('used').textContent=used();$('capacity').textContent=state.capacity;
const filter=$('productFilter').value,keys=Object.keys(products).filter(k=>unlocked(k)&&(filter==='all'||(filter==='fish'?products[k].vol===0:products[k].vol>0))).sort((a,b)=>products[b].level-products[a].level);
$('stock').innerHTML=productRows(keys,true);
$('supplierHelp').textContent=state.level<2?'El proveedor abre en el nivel 2. Empieza vendiendo el stock gratuito.':state.supplier==='local'?'Proveedor local · precio base · 30 s · sin mínimo.':'Mayorista · aproximadamente 15% menos · 90 s · mínimo 10 unidades de un producto.';
document.querySelectorAll('[data-supplier]').forEach(b=>{b.hidden=b.dataset.supplier==='wholesale'&&state.level<7;b.setAttribute('aria-pressed',String(state.supplier===b.dataset.supplier))});
document.querySelectorAll('[data-quantity]').forEach(b=>b.setAttribute('aria-pressed',String(orderQuantity===Number(b.dataset.quantity))));
$('upgradeList').innerHTML=Object.entries(ShopDesign.upgrades).filter(([k,u])=>u.level<=state.level+1).map(([k,u])=>'<article class="upgrade-card"><b>'+u.name+'</b><small>'+u.detail+'</small><button data-upgrade="'+k+'" '+(upgradeReason(k)?'disabled':'')+'>'+ (state[k]?'✓ Comprado':state.level<u.level?'Nivel '+u.level:'Comprar · '+fmt(u.cost)+' 🪙')+'</button>'+(!state[k]&&state.level>=u.level&&upgradeReason(k)?'<small>'+upgradeReason(k)+'</small>':'')+'</article>').join('');
const pending=state.layout?.objects.filter(o=>ShopLayout.purchased(o,state)&&o.placed===false)||[];
$('pendingList').innerHTML=pending.map(o=>'<button data-place="'+o.id+'">Colocar '+ShopLayout.catalog[o.kind].label+' →</button>').join('');
$('investmentHelp').textContent=state.level>=10?'Tu primera gran decisión. Elegir una inversión no bloquea las otras: podrás ahorrar para ellas después.':'Compra y coloca. Puedes cancelar la colocación y recuperarla aquí sin pagar otra vez.';
$('kitList').innerHTML=Object.entries(ShopDesign.kit).map(([k,q])=>'<div class="stockline"><span>'+products[k].name+'</span><b>'+state.stock[k]+'/'+q+' '+(state.stock[k]>=q?'✓':'')+'</b></div>').join('');
$('kitHelp').textContent=state.level<4?'Disponible desde el nivel 4.':'Venta del conjunto: '+Object.entries(ShopDesign.kit).reduce((n,[k,q])=>n+products[k].sell*q,0)+' monedas. Completados: '+state.kits+'.';
$('kitAccept').disabled=state.level<4||state.kitRequested;$('kitAccept').textContent=state.kitRequested?'Esperando mercancía / visita':'Aceptar pedido de acuario completo';
$('teamList').innerHTML=Object.entries(ShopDesign.employees).map(([k,e])=>'<article class="upgrade-card"><b>'+e.name+' · '+e.role+'</b><small>'+e.detail+'</small><button data-hire="'+k+'" '+(state.level<9||state.employee||state.money<1500?'disabled':'')+'>'+(state.employee===k?'✓ En tu equipo':'Contratar · 1.500 🪙')+'</button></article>').join('');
$('wageStatus').textContent=state.employee?'Salarios pagados: '+state.wagesPaid+(state.employeeUnpaid?' · Refuerzo en pausa hasta poder pagar.':' · Próximo pago en '+Math.ceil(60-state.wageElapsed)+' s de juego.'):'Contratación disponible en el nivel 9.';
$('salesSummary').textContent=state.level>=8?'Compras intentadas: '+state.potential+' · ventas reales: '+state.served+' · perdidas: '+state.lost+'. Revisa stock y accesos.':'Cada compra necesita producto, un camino y atención en caja.';
$('contractLink').hidden=state.level<4;$('teamLink').hidden=state.level<9;
$('rescueBtn').hidden=!!incomingOrders().length||!!state.debt||state.money>=15||Object.entries(state.stock).some(([k,q])=>unlocked(k)&&q>0);
for(const o of state.layout?.objects||[]){const node=world.querySelector('[data-instance="'+o.id+'"]');if(!node)continue;ShopFish.paint(node,o.kind,state.stock);const stocked=(ShopNavigation.goods[o.kind]||[]).some(k=>state.stock[k]>0);node.querySelectorAll('.fish-swim').forEach(g=>g.style.opacity=stocked?1:0);node.querySelectorAll('.shelf-goods').forEach(g=>g.style.opacity=stocked?1:.25);node.querySelectorAll('.shelf-extra').forEach(g=>g.style.display=state.level>=4?'block':'none');node.querySelectorAll('.warehouse-extra').forEach(g=>g.style.display=state.warehouse?'block':'none')}
objectInfo();
}
window.addEventListener('statechange',syncScene);
window.addEventListener('notice',e=>{$('toast').textContent=e.detail;$('toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('visible'),3200)});
window.addEventListener('sale',e=>{$('saleEffect').innerHTML='<text class="coin-pop" text-anchor="middle" fill="#aa7a2e" font-size="25" font-weight="bold">+'+e.detail+' 🪙</text>'});
let zoom=1,panX=0,panY=0;
const pointers=new Map();let lastDistance=0,lastPoint;
function camera(){panX=Math.max(-300,Math.min(300,panX));panY=Math.max(-200,Math.min(200,panY));world.setAttribute('transform',`translate(${500+panX} ${390+panY}) scale(${zoom}) translate(-500 -390)`)}
function changeZoom(n){zoom=Math.max(.85,Math.min(1.8,n));camera()}
$('zoomIn').onclick=()=>changeZoom(zoom+.15);$('zoomOut').onclick=()=>changeZoom(zoom-.15);$('zoomReset').onclick=()=>{zoom=1;panX=panY=0;camera()};
const viewport=$('viewport');
viewport.addEventListener('pointerdown',e=>{if(window.shopEditor?.active||e.target.closest('button'))return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});lastPoint={x:e.clientX,y:e.clientY};dragged=false;lastDistance=0});
window.addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId))return;const prev=pointers.get(e.pointerId);pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointers.size===2){const [a,b]=[...pointers.values()],d=Math.hypot(a.x-b.x,a.y-b.y);if(lastDistance)changeZoom(zoom*d/lastDistance);lastDistance=d;dragged=true}else{const dx=e.clientX-prev.x,dy=e.clientY-prev.y;if(Math.hypot(e.clientX-lastPoint.x,e.clientY-lastPoint.y)>5)dragged=true;if(dragged){const scale=1000/$('scene').getBoundingClientRect().width;panX+=dx*scale;panY+=dy*scale;camera()}}});
for(const event of ['pointerup','pointercancel'])window.addEventListener(event,e=>{pointers.delete(e.pointerId);lastDistance=0});
viewport.addEventListener('wheel',e=>{e.preventDefault();changeZoom(zoom-e.deltaY*.001)},{passive:false});
window.addEventListener('pagehide',()=>saveGame(false));document.addEventListener('visibilitychange',()=>{if(document.hidden)saveGame(false)});


