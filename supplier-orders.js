// Orders own their clocks and paid quote. No queue or cap on simultaneous orders.
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.ShopOrders=api})(globalThis,()=>{
const providers={
 local:{level:2,minimum:1,priceFactor:1,seconds:30,productRules:{}},
 wholesale:{level:7,minimum:10,priceFactor:.85,seconds:90,productRules:{}}
};
const active=orders=>(orders||[]).filter(o=>o.status==='in_transit');
function quote(catalog,k,q,supplier,discount=1){
 if(!Object.hasOwn(providers,supplier)||!Object.hasOwn(catalog,k))return null;
 const provider=providers[supplier],product=catalog[k];
 const rule={...provider,...provider.productRules[k]};
 if(rule.available===false)return null;
 return {cost:Math.ceil(product.buy*rule.priceFactor*discount)*q,seconds:rule.seconds,minimum:rule.minimum,level:rule.level};
}
// Fish have vol=0 in v0.8. A future live-stock pool belongs here, not in warehouse space.
const space=(catalog,k,q)=>(catalog[k]?.vol||0)*q;
const reserved=(orders,catalog)=>active(orders).reduce((sum,o)=>sum+space(catalog,o.k,o.q),0);
function advance(orders,dt,now){
 if(!Number.isFinite(dt)||dt<=0)return [];
 const arrived=[];
 for(const o of active(orders)){
 o.remaining=Math.max(0,o.remaining-dt*1000);
 if(o.remaining===0){o.status='delivered';o.deliveredAt=now;arrived.push(o)}
 }
 return arrived;
}
function compact(orders){const recent=orders.filter(o=>o.status==='delivered').slice(-50),keep=new Set(recent);return orders.filter(o=>o.status==='in_transit'||keep.has(o))}
function migrate(saved,catalog,now){
 const source=Array.isArray(saved.orders)?saved.orders:saved.delivery?[saved.delivery]:[],seen=new Set(),orders=[];
 let serial=Math.max(0,Math.floor(Number(saved.orderSerial)||0));
 for(const raw of source){
 if(!raw||!Object.hasOwn(catalog,raw.k)||!Number.isInteger(raw.q)||raw.q<1)continue;
 const supplier=Object.hasOwn(providers,raw.supplier)?raw.supplier:'local',duration=(providers[supplier].productRules[raw.k]?.seconds||providers[supplier].seconds)*1000;
 const remaining=Number.isFinite(raw.remaining)?Math.max(0,raw.remaining):Number.isFinite(raw.end)?Math.max(0,raw.end-(saved.lastSeen||now)):duration;
 let id=typeof raw.id==='string'&&/^order-\d+$/.test(raw.id)?raw.id:null;
 if(id&&seen.has(id))continue;
 if(id)serial=Math.max(serial,Number(id.slice(6)));else {do{id='order-'+(++serial)}while(seen.has(id))}
 seen.add(id);
 orders.push({id,k:raw.k,q:raw.q,cost:Number.isFinite(raw.cost)&&raw.cost>=0?raw.cost:null,supplier,
 orderedAt:Number.isFinite(raw.orderedAt)?raw.orderedAt:Math.max(0,(Number.isFinite(raw.end)?raw.end-duration:saved.lastSeen)||now),
 duration:Math.max(remaining,Number.isFinite(raw.duration)&&raw.duration>0?raw.duration:duration),
 remaining:raw.status==='delivered'?0:remaining,status:raw.status==='delivered'?'delivered':'in_transit',
 deliveredAt:raw.status==='delivered'&&Number.isFinite(raw.deliveredAt)?raw.deliveredAt:null});
 }
 return {ordersVersion:1,orders:compact(orders),orderSerial:serial};
}
return {providers,active,quote,space,reserved,advance,compact,migrate};
});
