// Guidance follows existing progress; no rewards or price changes.
const thresholds=[0,5,10,18,28,40,55,75,100,130];
function milestones(){
 return [
 {title:'Tu primera venta',detail:'Un visitante comprará automáticamente si hay stock.',done:state.served>=1,current:Math.min(state.served,1),total:1,action:'activity'},
 {title:'Reponer para seguir',detail:'Pide al proveedor y recibe tu primera entrega.',done:state.restocked>=1||state.shelf,current:state.restocked>=1||state.shelf?1:0,total:1,action:'stock'},
 {title:'Tu primera estantería',detail:'Instala la estantería por 250 monedas.',done:state.shelf,current:state.shelf?250:Math.min(state.money,250),total:250,action:'upgrades'},
 {title:'Un hogar para más peces',detail:'Construye el tercer acuario por 350 monedas.',done:state.tank3,current:state.tank3?350:Math.min(state.money,350),total:350,action:'upgrades'},
 {title:'Un negocio de barrio',detail:'Llega a 75 ventas para alcanzar el nivel 8.',done:state.level>=8,current:Math.min(state.served,75),total:75,action:'activity'},
 {title:'Más espacio para crecer',detail:'Amplía el almacén por 4.000 monedas.',done:state.warehouse,current:state.warehouse?4000:Math.min(state.money,4000),total:4000,action:'upgrades'}
 ];
}
let currentMilestone,previousLevel=state.level;
function updateJourney(){
 const steps=milestones(),active=steps.find(s=>!s.done);
 currentMilestone=active;
 $('goal').textContent=active?active.title:'¡Tu tienda ha crecido!';
 $('goalDetail').textContent=active?active.detail:'Has completado este recorrido. Sigue cuidando tu stock.';
 $('goalProgress').max=active?active.total:1;$('goalProgress').value=active?active.current:1;
 $('goalProgress').setAttribute('aria-label',active?active.title+': '+active.current+' de '+active.total:'Recorrido completado');
 $('journeyList').replaceChildren(...steps.map((s,i)=>{
  const li=document.createElement('li');li.className=s.done?'complete':s===active?'current':'';
  const name=document.createElement('b');name.textContent=(s.done?'✓ ':String(i+1)+'. ')+s.title;
  const desc=document.createElement('small');desc.textContent=s.done?'Completado':s.detail;
  li.append(name,desc);return li;
 }));
 $('journeyAction').textContent=active?'Ir al siguiente paso':'Volver a la tienda';
 $('levelProgress').textContent=state.level>=10?'Nivel máximo':state.served+' / '+thresholds[state.level]+' ventas';
 if(state.level>previousLevel)window.dispatchEvent(new CustomEvent('notice',{detail:'¡Nivel '+state.level+'! Tu tienda sigue creciendo.'}));
 previousLevel=state.level;updateShopStatus();
}
function updateShopStatus(){
 const status=$('shopStatus');
 if(state.delivery){const seconds=Math.max(0,Math.ceil((state.delivery.end-Date.now())/1000));status.hidden=false;status.textContent='▤ '+state.delivery.q+' × '+products[state.delivery.k].name+' · llega en '+seconds+' s';status.classList.remove('low-stock');}
 else {
  const empty=Object.keys(products).filter(k=>state.stock[k]===0),low=Object.keys(products).filter(k=>state.stock[k]>0&&state.stock[k]<=2);
  status.hidden=!empty.length&&!low.length;
  status.textContent=empty.length?'Reponer: '+empty.map(k=>products[k].name).join(', '):low.length?'Quedan pocas unidades · visita al proveedor':'';
  status.classList.toggle('low-stock',!!empty.length);
 }
}
$('goalAction').onclick=()=>showPanel('journey','Tu camino');
$('journeyAction').onclick=()=>{if(currentMilestone)showPanel(currentMilestone.action);else panel.close()};
document.querySelectorAll('[data-quantity]').forEach(b=>b.onclick=()=>{
 orderQuantity=Number(b.dataset.quantity);
 document.querySelectorAll('[data-quantity]').forEach(other=>other.setAttribute('aria-pressed',String(other===b)));
 syncScene();updateJourney();
});
window.addEventListener('statechange',updateJourney);
setInterval(updateShopStatus,250);
updateJourney();
