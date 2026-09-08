// One checkout every 8 seconds. Animation never awards money.
(() => {
 const layer=$('visitors'),actors=[],names=['Luna','Leo','Nora','Álex','Vera','Hugo'];
 const entrance=[800,355];
 function destination(kind){const layout=state.layout,o=layout?.objects.find(o=>o.kind===kind);if(!o)return [600,400];const room=layout.rooms.find(r=>r.id===o.roomId),b=ShopLayout.footprint(o),p=ShopLayout.project(room,o.x+b.width,o.y+b.depth);return [p.x,p.y]}
 const checkoutPoint=()=>destination('counter');
 const spots={betta:[420,428],comet:[592,510],food:[687,371]};
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let serial=0,selected=null;
 layer.replaceChildren();
 const svgNS='http://www.w3.org/2000/svg';
 function spawn(){
  const keys=Object.keys(products).filter(k=>state.stock[k]>0);
  const product=keys.length?keys[Math.floor(Math.random()*keys.length)]:null;
  const actor={id:++serial,name:names[(serial-1)%names.length],product,born:Date.now(),phase:'entering',result:null,paid:false};
  const g=document.createElementNS(svgNS,'g');g.classList.add('live-visitor');g.setAttribute('role','button');g.setAttribute('tabindex','0');
  g.innerHTML=person(serial%2?'#e89b75':'#91a7cd')+'<g class="visitor-bubble" transform="translate(-43 -117)"><rect width="86" height="27" rx="10"/><text x="43" y="18" text-anchor="middle"></text></g>';
  actor.node=g;actors.push(actor);layer.append(g);
  const inspect=()=>{selected=actor;showPanel('visitor',actor.name+' · de visita');updateDetails()};
  g.addEventListener('click',()=>{if(!dragged)inspect()});
  g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();inspect()}});
  return actor;
 }
 function status(a){
  if(a.phase==='leaving')return a.result?'Ha comprado '+products[a.result.key].name+' por '+a.result.amount+' monedas.':'Sale sin comprar: no había stock.';
  if(a.phase==='checkout')return 'En caja. El dependiente está atendiendo.';
  if(a.phase==='browsing')return a.product?'Está mirando '+products[a.product].name+'.':'Está buscando productos disponibles.';
  return 'Acaba de entrar en la tienda.';
 }
 function updateDetails(){
  $('visitorSummary').textContent=actors.length+' '+(actors.length===1?'visitante en la tienda.':'visitantes en la tienda.')+' Una atención en caja cada 8 segundos.';
  if(!selected)return;
  const text=actors.includes(selected)?status(selected):(selected.result?'Se ha marchado con su compra.':'Se ha marchado sin comprar.');
  $('visitorInfo').textContent=text;
 }
 function lerp(a,b,t){return [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]}
 function position(a,age){
  const spot=destination(a.product==='food'?'shelf':a.product||'shelf'),checkout=checkoutPoint();
  // Waypoints keep the approach on the customer side of the displays.
  const route=[[0,entrance],[1.4,[700,413]],[3,spot],[4.5,spot],[6.8,checkout],[8,checkout],[9,[505,590]],[10,[725,515]],[12,entrance]];
  if(reduced.matches)return age>=8?entrance:age>=6.8?checkout:spot;
  for(let i=1;i<route.length;i++)if(age<=route[i][0]){
   return lerp(route[i-1][1],route[i][1],Math.max(0,(age-route[i-1][0])/(route[i][0]-route[i-1][0])));
  }
  return entrance;
 }
 function draw(){
  const now=Date.now();
  for(const a of [...actors]){
   const age=(now-a.born)/1000;
   if(a.paid&&age>=12){a.node.remove();actors.splice(actors.indexOf(a),1);continue}
   const phase=a.paid?'leaving':age>=6.8?'checkout':age>=2.8?'browsing':'entering';
   const changed=phase!==a.phase;a.phase=phase;
   const [x,y]=position(a,a.paid?Math.max(8,age):Math.min(age,8));
   a.node.setAttribute('transform','translate('+x+' '+y+')');
   a.node.dataset.phase=phase;a.node.dataset.result=a.paid?(a.result?'sale':'empty'):'pending';
   a.node.setAttribute('aria-label',a.name+': '+status(a));
   const label=a.paid?(a.result?'¡Gracias!':'Sin stock'):phase==='checkout'?'En caja':phase==='browsing'?(a.product?products[a.product].name:'¿Hay stock?'):'¡Hola!';
   a.node.querySelector('text').textContent=label;
   if(changed)updateDetails();
  }
  updateDetails();
 }
 function checkoutTick(){
  let a=actors.find(a=>!a.paid);
  if(!a)a=spawn();
  // Snap to checkout before the economic transaction (also after a throttled tab).
  a.node.setAttribute('transform','translate('+checkoutPoint().join(' ')+')');
 $('saleEffect').setAttribute('transform','translate('+checkoutPoint()[0]+' '+(checkoutPoint()[1]-80)+')');
  a.result=customer(a.product);
  a.paid=true;a.born=Date.now()-8000;
  spawn();draw();
 }
 $('visitorStock').onclick=()=>showPanel('stock');
 spawn();draw();
 let checkoutTimer=setInterval(checkoutTick,8000);
 window.addEventListener('editbegin',()=>{clearInterval(checkoutTimer)});
 window.addEventListener('editend',()=>{for(const a of actors)a.node.remove();actors.length=0;selected=null;spawn();draw();checkoutTimer=setInterval(checkoutTick,8000)});
 // A low-rate visual clock keeps CPU use modest; only checkoutTick mutates the economy.
 setInterval(()=>{if(!document.hidden&&!window.shopEditor?.active)draw()},50);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)draw()});
 reduced.addEventListener('change',draw);
})();
