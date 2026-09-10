const products=ShopDesign.products;
const $=id=>document.getElementById(id),fmt=n=>Math.floor(n).toLocaleString('es-ES');
const initial=()=>({schema:6,serviceSession:null,identity:null,money:500,level:1,xp:0,served:0,capacity:20,pearls:0,stock:Object.fromEntries(Object.keys(products).map(k=>[k,({betta:5,comet:6,food:4,conditioner:3})[k]||0])),lastSeen:Date.now(),ordersVersion:1,orders:[],orderSerial:0,restocked:0,supplier:'local',supplierReceived:{local:0,wholesale:0},sold:{},placementRewarded:{},lost:0,potential:0,kits:0,kitRequested:false,groupSales:0,wageElapsed:0,wagesPaid:0,employee:null,speed:4,debt:0,investment:null});
let state=initial(),resetting=false;
function unlocked(k){const p=products[k];return !!p&&state.level>=p.level&&(!p.investment||state[p.investment])}
function used(){return Object.entries(state.stock).reduce((a,[k,v])=>a+v*(products[k]?.vol||0),0)}
function placed(kind){return !!state.layout?.objects.some(o=>o.kind===kind&&ShopLayout.owned(o,state))}
function log(t,c='',notify=true){const d=document.createElement('div');d.className=c;d.textContent='• '+t;$('log').prepend(d);while($('log').children.length>60)$('log').lastChild.remove();if(notify)window.dispatchEvent(new CustomEvent('notice',{detail:t}))}
function render(){ $('money').textContent=fmt(state.money);$('level').textContent=state.level;$('served').textContent=state.served;$('pearls').textContent=state.pearls;window.dispatchEvent(new Event('statechange'))}
function requirements(target){
const defs=ShopDesign.levels.find(l=>l.level===target);if(!defs)return [];
const r=[{label:defs.xp+' XP',done:state.xp>=defs.xp,value:state.xp,total:defs.xp},{label:defs.sales+' ventas',done:state.served>=defs.sales,value:state.served,total:defs.sales}];
const add=(label,done,action='upgrades')=>r.push({label,done:!!done,action});
if(target===3){add('Colocar la estantería',placed('shelf'));add('Recibir un pedido del proveedor',state.restocked>=1,'stock')}
if(target===4){add('Colocar el acuario de 60 L',placed('tank3'));add('Vender Guppy o Platy',(state.sold.guppy||0)+(state.sold.platy||0)>0,'stock')}
if(target===5)add('Entregar un acuario completo',state.kits>=1,'contract');
if(target===6)add('Ampliar físicamente la tienda',state.expansion);
if(target===7){add('Colocar Batería Agua Dulce I',placed('battery'));add('Vender un grupo de peces',state.groupSales>=1,'stock')}
if(target===8){add('Recibir un pedido local',state.supplierReceived.local>=1,'stock');add('Recibir un pedido mayorista',state.supplierReceived.wholesale>=1,'stock')}
if(target===9)add('Ampliar a Almacén I',state.warehouse);
if(target===10){add('Contratar un segundo empleado',state.employee,'team');add('Pagar su primer salario',state.wagesPaid>=1,'team');add('Reservar 12.000 monedas para invertir',state.money>=12000,'activity')}
return r;
}
function recalcLevel(){
while(state.level<10&&requirements(state.level+1).every(r=>r.done)){state.level++;window.dispatchEvent(new CustomEvent('levelup',{detail:state.level}));log('¡Nivel '+state.level+'! '+ShopDesign.levels.find(l=>l.level===state.level).unlock,'good')}
}
function loseSale(reason){state.lost++;log('Compra perdida: '+reason,'warn',false);render();saveGame(false)}
function sellBasket(basket,options={}){
const entries=Object.entries(basket),isKit=state.kitRequested&&entries.length===Object.keys(ShopDesign.kit).length&&entries.every(([k,q])=>ShopDesign.kit[k]===q);
if(options.requestId&&!window.ShopMoments?.valid(options.requestId))return null;
if(!entries.length||entries.some(([k,q])=>!unlocked(k)||!Number.isInteger(q)||q<1||(state.stock[k]||0)<q||((state.stock[k]-q)<((state.kitRequested&&!isKit?(ShopDesign.kit[k]||0):0)+(window.ShopMoments?.reserved(k,options.requestId)||0)+(window.ShopStaff?.reserved(k,options.visitorId)||0)))))return null;
let amount=0;for(const [k,q] of entries){state.stock[k]-=q;amount+=products[k].sell*q;state.sold[k]=(state.sold[k]||0)+q}
const repayment=Math.min(state.debt,amount);state.debt-=repayment;state.money+=amount-repayment;state.served++;state.xp+=entries.reduce((n,[k,q])=>n+10*q,0);
if(isKit){state.kits++;state.kitRequested=false}if(entries.some(([k,q])=>['neon','molly','cory','ancistrus'].includes(k)&&q>1))state.groupSales++;
if(options.requestId)window.ShopMoments.finish(options.requestId,true);
window.dispatchEvent(new CustomEvent('sale',{detail:amount}));log((isKit?'Acuario completo':entries[0][1]+' × '+products[entries[0][0]].name)+' +'+amount+' 🪙'+(repayment?' · anticipo devuelto: '+repayment:''),'good',false);recalcLevel();render();saveGame(false);
return {key:entries[0][0],name:isKit?'Acuario completo':products[entries[0][0]].name,amount,basket};
}
function customer(k,strict=false){const keys=Object.keys(products).filter(k=>unlocked(k)&&state.stock[k]>0);return sellBasket({[keys.includes(k)?k:strict?k:keys[Math.floor(Math.random()*keys.length)]]:1})}
function incomingOrders(){return ShopOrders.active(state.orders)}
function reservedSpace(){return ShopOrders.reserved(state.orders,products)}
function quote(k,q,supplier=state.supplier){return ShopOrders.quote(products,k,q,supplier,window.ShopMoments?.discount(k,supplier)||1)}
function orderReason(k,q,supplier=state.supplier){
 const t=(key,params)=>ShopI18n.t(key,params),offer=quote(k,q,supplier);
 if(!unlocked(k)||![1,5,10,20].includes(q)||!offer)return t('orderUnavailable');
 if(state.level<offer.level)return t('orderSupplierLevel',{level:offer.level});
 if(q<offer.minimum)return t('orderMinimum',{quantity:offer.minimum});
 if(state.money<offer.cost)return t('orderNoMoney');
 const volume=ShopOrders.space(products,k,q);
 if(volume>0&&used()+reservedSpace()+volume>state.capacity)return t('orderNoSpace');
 return '';
}
function order(k,q){
 const reason=orderReason(k,q);if(reason)return log(reason,'warn');
 const offer=quote(k,q),now=Date.now();
 const d={id:'order-'+(++state.orderSerial),k,q,cost:offer.cost,supplier:state.supplier,orderedAt:now,duration:offer.seconds*1000,remaining:offer.seconds*1000,status:'in_transit',deliveredAt:null};
 state.money-=d.cost;state.orders.push(d);window.ShopMoments?.purchased(k,d.supplier);
 log(ShopI18n.t('orderPlaced',{quantity:q,product:products[k].name,seconds:offer.seconds}));render();saveGame(false);return d.id;
}
function deliveryTick(dt){
 const arrived=ShopOrders.advance(state.orders,dt,Date.now());if(!arrived.length)return;
 for(const d of arrived){
 state.stock[d.k]=(state.stock[d.k]||0)+d.q;state.restocked++;state.supplierReceived[d.supplier]=(state.supplierReceived[d.supplier]||0)+1;state.xp+=20;
 log(ShopI18n.t('orderArrived',{quantity:d.q,product:products[d.k].name}),'good',false);
 }
 state.orders=ShopOrders.compact(state.orders);
 for(const d of arrived)window.dispatchEvent(new CustomEvent('deliveryreceived',{detail:{...d}}));
 window.dispatchEvent(new CustomEvent('notice',{detail:arrived.length===1?ShopI18n.t('orderArrived',{quantity:arrived[0].q,product:products[arrived[0].k].name}):ShopI18n.t('ordersArrived',{count:arrived.length})}));
 recalcLevel();render();saveGame(false);
}
function upgradeReason(k){const u=ShopDesign.upgrades[k];if(!u)return 'Mejora desconocida';if(state[k])return 'Comprado';if(state.level<u.level)return 'Nivel '+u.level;if(['tank4','tank5','shelf2'].includes(k)&&!state.expansion)return 'Amplía la tienda';if(k==='expansion'&&(state.served<25||state.kits<1))return '25 ventas y un acuario completo';if(k==='warehouse2'&&!state.warehouse)return 'Requiere Almacén I';if(state.money<u.cost)return 'Faltan '+fmt(u.cost-state.money)+' monedas';return ''}
function buyUpgrade(k){
const reason=upgradeReason(k);if(reason)return log(reason,'warn');const u=ShopDesign.upgrades[k];
state.money-=u.cost;state[k]=true;
if(k==='warehouse')state.capacity=50;if(k==='warehouse2')state.capacity=100;
if(k==='expansion'){state.pearls+=10;state.layout.rooms[0].width=18;state.layout.rooms[0].depth=16}
if(u.kind){const o=state.layout.objects.find(o=>o.kind===u.kind);o.placed=false}
if(state.level===10&&!state.investment)state.investment=k;
state.xp+=30;log(u.name+(u.kind?' comprado. Elige dónde colocarlo.':' completado.'),'good');recalcLevel();render();window.dispatchEvent(new Event('layoutchange'));saveGame(false);
if(u.kind)shopEditor.begin(state.layout.objects.find(o=>o.kind===u.kind).id);
}
function upgradeShelf(){buyUpgrade('shelf')}function upgradeTank(){buyUpgrade('tank3')}function upgradeWarehouse(){buyUpgrade('warehouse')}
function hire(id){if(state.level<9||state.employee||!ShopDesign.employees[id])return;if(state.money<1500)return log('Necesitas 1.500 monedas','warn');state.money-=1500;state.employee=id;state.wageElapsed=0;state.xp+=30;log(ShopDesign.employees[id].name+' se incorpora al equipo','good');recalcLevel();render();saveGame(false)}
function rescue(){if(incomingOrders().length||state.debt||state.money>=15||Object.entries(state.stock).some(([k,q])=>unlocked(k)&&q>0))return;state.stock.comet=1;state.debt=15;log('El proveedor te adelanta un Cometa. Devolverás 15 monedas al venderlo.');render();saveGame(false)}
function saveGame(show=true){if(resetting||!state.identity||window.shopCirculation?.settling)return;if(window.shopCirculation?.serialize)state.serviceSession=shopCirculation.serialize();state.lastSeen=Date.now();try{localStorage.setItem('aquariumShopV01',JSON.stringify(state))}catch(e){if(show)log('No se ha podido guardar','warn');return}if(show)log('Partida guardada','good')}
function load(){try{const raw=localStorage.getItem('aquariumShopV01');if(!raw)return;const old=JSON.parse(raw);state={...initial(),...old,stock:{...initial().stock,...old.stock},sold:old.sold||{},supplierReceived:{local:0,wholesale:0,...old.supplierReceived}};
state.identity=ShopIdentity.normalize(old.identity);
if(old.schema!==6){state.schema=6;state.xp=Math.max(0,state.served*10);state.shelf=true;state.speed=1;state.supplierReceived.local=old.restocked||0;state.stock.conditioner=3}
state.level=Math.max(1,Math.min(10,Math.floor(state.level)||1));state.money=Math.max(0,Number(state.money)||0);state.speed=[1,4,12].includes(state.speed)?state.speed:1;
for(const k of Object.keys(products))state.stock[k]=Math.max(0,Math.floor(Number(state.stock[k])||0));
Object.assign(state,ShopOrders.migrate(old,products,Date.now()));delete state.delivery;if(!Object.hasOwn(ShopOrders.providers,state.supplier))state.supplier='local';
}catch(e){state=initial()}}
function resetGame(){if(confirm('¿Empezar una partida nueva? Se borrará el progreso de este navegador.')){resetting=true;localStorage.removeItem('aquariumShopV01');location.reload()}}
load();if(state.identity)ShopIdentity.set(state.identity);render();
let lastEconomy=Date.now();
setInterval(()=>{const now=Date.now(),dt=Math.min(.5,Math.max(0,(now-lastEconomy)/1000))*state.speed;lastEconomy=now;if(document.hidden||!state.identity||ShopIdentity.editing)return;deliveryTick(dt);window.ShopMoments?.tick(dt);
if(state.employee&&!window.shopEditor?.active){state.wageElapsed+=dt;if(state.wageElapsed>=60){state.wageElapsed-=60;const wage=ShopDesign.employees[state.employee].wage;if(state.money>=wage){state.money-=wage;state.wagesPaid++;state.employeeUnpaid=false;recalcLevel();render();saveGame(false)}else {state.employeeUnpaid=true;log('No alcanza para el salario. El refuerzo espera al próximo pago.','warn');render()}}}
},250);
setInterval(()=>saveGame(false),5000);
