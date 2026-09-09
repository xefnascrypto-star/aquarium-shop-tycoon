let currentMilestone;
function updateJourney(){
const target=ShopDesign.levels.find(l=>l.level===state.level+1),needs=target?requirements(target.level):[];
const missing=needs.find(r=>!r.done&&r.action)||needs.find(r=>!r.done);
const pending=state.layout?.objects.find(o=>ShopLayout.purchased(o,state)&&o.placed===false);
currentMilestone=pending?{action:'place',id:pending.id}:missing||{action:state.level===10?'upgrades':'stock'};
$('goal').textContent=pending?'Tu compra espera su sitio':target?'Nivel '+target.level+' · '+target.name:state.investment?'Tu siguiente inversión':'Tu primera gran decisión';
$('goalDetail').textContent=pending?'Coloca '+ShopLayout.catalog[pending.kind].label+' desde el editor.':missing?(missing.action?missing.label:'Gana experiencia atendiendo clientes y recibiendo pedidos.'):state.level===10?'Elige qué desarrollar primero. Las otras inversiones seguirán disponibles.':'Atiende y repón para seguir creciendo.';
$('goalProgress').max=needs.length||1;$('goalProgress').value=needs.length?needs.filter(r=>r.done).length:1;
$('goalProgress').setAttribute('aria-label','Objetivos completados: '+needs.filter(r=>r.done).length+' de '+needs.length);
$('journeyIntro').textContent=target?'Para llegar al nivel '+target.level+' necesitas:':'Demo completada hasta el nivel 10. Puedes seguir haciendo crecer este local.';
$('journeyList').innerHTML=needs.map(r=>'<li class="'+(r.done?'complete':'current')+'"><b>'+(r.done?'✓ ':'○ ')+r.label+'</b>'+(r.value!==undefined?'<small>'+r.value+' / '+r.total+'</small>':'')+'</li>').join('');
$('journeyAction').textContent=pending?'Colocar compra':missing?.action?'Ir al objetivo':'Volver a la tienda';
$('levelProgress').textContent=state.level===10?'Primera gran decisión':state.xp>=target.xp?'XP listo · faltan hitos':state.xp+' / '+target.xp+' XP';
updateShopStatus();
}
function updateShopStatus(){
const d=state.delivery,status=$('shopStatus');let message='';
if(d)message='▤ '+d.q+' × '+products[d.k].name+' · '+Math.max(0,Math.ceil(d.remaining/1000))+' s de juego';
else {const empty=Object.keys(products).filter(k=>unlocked(k)&&state.stock[k]===0);if(empty.length)message='Reponer '+empty.length+' productos'+(state.level>=8?' · '+state.lost+' compras perdidas':'')}
status.hidden=!message;status.textContent=message;$('delivery').textContent=d?message:'';
if($('deliveryArt')){$('deliveryArt').innerHTML=d?'<g transform="translate(800 353)">'+box(0,-28,29,23,28)+'<text x="0" y="-40" text-anchor="middle" fill="#447561" font-size="15">▤ '+Math.max(0,Math.ceil(d.remaining/1000))+' s</text></g>':''}
}
$('goalAction').onclick=()=>{if(currentMilestone?.action==='place')shopEditor.begin(currentMilestone.id);else showPanel('journey')};
$('journeyAction').onclick=()=>{if(currentMilestone?.action==='place')shopEditor.begin(currentMilestone.id);else if(currentMilestone?.action)showPanel(currentMilestone.action);else panel.close()};
window.addEventListener('statechange',updateJourney);window.addEventListener('layoutchange',updateJourney);
setInterval(updateShopStatus,250);
