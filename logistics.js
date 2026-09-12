// Location ledger: total ownership stays in state.stock; bins are the exposed subset.
// Transfers commit once, only at the destination. Interrupted trips never create stock.
window.ShopLogistics=(()=>{
const N=ShopNavigation,M=ShopLayout;
function graph(){return N.build(state.layout,state).grids.main}
function ensure(){
 if(!state.layout)return;
 if(!state.logistics||state.logistics.version!==1){
  state.logistics={version:1,bins:{}};
  const g=graph();for(const k of Object.keys(products)){const o=g.objects.find(o=>N.goods[o.kind]?.includes(k));if(o)bin(o.id)[k]=Math.min(state.stock[k]||0,limit(k))}
 }
 if(!state.logistics.bins||typeof state.logistics.bins!=='object'||Array.isArray(state.logistics.bins))state.logistics.bins={};
 const g=graph();for(const [id,items] of Object.entries(state.logistics.bins)){const o=g.objects.find(o=>o.id===id);if(!o||!items||typeof items!=='object'||Array.isArray(items)){delete state.logistics.bins[id];continue}for(const k of Object.keys(items))if(!N.goods[o.kind]?.includes(k))delete items[k]}
 for(const k of Object.keys(products)){let left=state.stock[k]||0;for(const items of Object.values(state.logistics.bins)){items[k]=Math.min(left,Math.max(0,Math.floor(Number(items[k])||0)));left-=items[k]}}
}
const limit=k=>products[k]?.vol===0?6:4;
function bin(id){return state.logistics.bins[id]||(state.logistics.bins[id]={})}
function exposed(k){return Object.values(state.logistics?.bins||{}).reduce((s,b)=>s+(b[k]||0),0)}
function stored(k){return Math.max(0,(state.stock[k]||0)-exposed(k))}
function at(id,k){return state.logistics?.bins[id]?.[k]||0}
function take(basket,locations={}){for(const [k,q] of Object.entries(basket)){let left=q;for(const b of (locations[k]?[bin(locations[k])]:Object.values(state.logistics.bins))){const n=Math.min(left,b[k]||0);b[k]=(b[k]||0)-n;left-=n}}}
function plan(graph,k,room='main',start,q=1){
 const g=graph.grids[room],stocked=g.objects.filter(o=>at(o.id,k)>=q);
 let p=N.plan(graph,k,room,start,stocked.map(o=>o.id));if(p&&at(p.objectId,k)>=q)return p;
 return N.plan(graph,k,room,start);
}
function candidates(g,workers,waiting=[]){
 const claimed=new Set(workers.filter(w=>w.restock).map(w=>w.restock.objectId+':'+w.restock.k));
 const reserved={};for(const w of workers)if(w.restock)reserved[w.restock.k]=(reserved[w.restock.k]||0)+w.restock.q;
 const tasks=[];
 for(const k of Object.keys(products)){
  if(!unlocked(k))continue;let supply=stored(k)-(reserved[k]||0);if(supply<=0)continue;
  const destinations=g.objects.filter(o=>N.goods[o.kind]?.includes(k)).sort((a,b)=>Number(waiting.some(v=>v.stops.some(s=>s.objectId===b.id)&&v.basket[k]))-Number(waiting.some(v=>v.stops.some(s=>s.objectId===a.id)&&v.basket[k])));
  for(const o of destinations){const demand=Math.max(limit(k),...waiting.filter(a=>(a.locations?a.locations[k]===o.id:a.stops.some(s=>s.objectId===o.id))).map(a=>a.basket[k]||0));const have=at(o.id,k);
   if((have>=demand||have>Math.floor(limit(k)/2)&&!waiting.some(a=>(a.locations?a.locations[k]===o.id:a.stops.some(s=>s.objectId===o.id))&&a.basket[k]>have))||claimed.has(o.id+':'+k))continue;
   const q=Math.min(supply,demand-have);if(q<=0)continue;
   const urgent=waiting.some(a=>(a.locations?a.locations[k]===o.id:a.stops.some(s=>s.objectId===o.id))&&a.basket[k]>have)?2:have===0?1:0;tasks.push({objectId:o.id,k,q,urgent});supply-=q;
  }
 }
 return tasks.sort((a,b)=>Number(b.urgent)-Number(a.urgent));
}
function commit(task){
 const o=graph().objects.find(o=>o.id===task.objectId);if(!o||!N.goods[o.kind]?.includes(task.k))return false;
 const q=Math.min(task.q,stored(task.k));if(q<=0)return false;
 bin(o.id)[task.k]=(bin(o.id)[task.k]||0)+q;return true;
}
function receipt(g){return g.objects.find(o=>o.kind==='warehouse')}
function reachable(g,o){const r=receipt(g);if(!r)return false;const start=N.route(g,g.entrance,N.staffServices(g,r))?.at(-1);return !!start&&!!N.route(g,start,N.staffServices(g,o))}
function feedback(k){if(exposed(k)>0)return '';if(stored(k)>0){const g=graph();return g.objects.some(o=>N.goods[o.kind]?.includes(k)&&reachable(g,o))?'Reposición pendiente':'Reposición bloqueada · revisa los accesos'}return 'Sin stock · pide al proveedor'}
function draw(){
 if(!state.logistics)return;
 const node=document.querySelector('[data-instance="warehouse-1"] .receipt-load');if(!node)return;
 const fish=Object.keys(products).reduce((s,k)=>s+(products[k].vol===0?stored(k):0),0),goods=Object.keys(products).reduce((s,k)=>s+(products[k].vol>0?stored(k):0),0),key=fish+':'+goods;
 if(node.dataset.load===key)return;node.dataset.load=key;
 node.innerHTML=(goods?'<g class="received-box" transform="translate(12 -38)"><path d="M0 0L20-9L38 1V25L19 35L0 25Z" fill="#d6b486" stroke="#ac8862"/><path d="M0 0L19 10L38 1M19 10V35" fill="none" stroke="#ac8862"/></g>':'')+(fish?'<g class="received-fish" transform="translate(0 -64)"><path d="M2 0H16L12 9Q32 33 20 44H-2Q-13 30 6 9Z" fill="#e2f7f1" stroke="#739c9b"/><path d="M-5 25Q11 21 24 26L20 43H-2Z" fill="#80ced8"/><ellipse cx="10" cy="33" rx="6" ry="3" fill="#edac70"/><path d="M5 33L0 29V37Z" fill="#edac70"/></g>':'');
 node.setAttribute('aria-label','Recepción: '+fish+' peces en transporte y '+goods+' productos pendientes');
}
window.addEventListener('statechange',draw);
return {ensure,limit,exposed,stored,at,take,plan,candidates,commit,receipt,reachable,feedback,draw};
})();
