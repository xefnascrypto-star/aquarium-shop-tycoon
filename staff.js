// Physical employee jobs. Navigation, preparation and checkout are mutually exclusive phases.
window.ShopStaff=(()=>{
const N=ShopNavigation,M=ShopLayout,Motion=ShopMotion,workers=[];
let context;
const g=()=>context.graph().grids.main;
const definitions=()=>[{id:0,key:'owner',seconds:6,walkSpeed:ShopDesign.staffMotion.walkSpeed,fishSeconds:ShopDesign.staffMotion.fishSeconds,goodsSeconds:ShopDesign.staffMotion.goodsSeconds},...(state.employee?[{id:1,key:state.employee,seconds:ShopDesign.employees[state.employee].service,walkSpeed:ShopDesign.employees[state.employee].walkSpeed||ShopDesign.staffMotion.walkSpeed,fishSeconds:ShopDesign.staffMotion.fishSeconds,goodsSeconds:ShopDesign.staffMotion.goodsSeconds}]:[])];
const station=(w)=>{const counter=g().objects.find(o=>o.id===w.counterId);return counter?N.stations(g(),counter)[w.stationIndex]||null:null};
function createNode(w){
 const node=ShopCharacters.create({id:10000+w.id,seed:410+w.id*29});node.classList.remove('live-visitor');node.classList.add('live-worker');node.dataset.workerId=w.id;node.dataset.visitorId='staff-'+w.id;
 const model=node.querySelector('.character-model'),head=model.querySelector('.character-head');
 const apron=document.createElementNS('http://www.w3.org/2000/svg','g');apron.innerHTML='<path d="M-10-39H10L12-15H-12Z" fill="#eee1bd"/><svg class="brand-badge" x="-7" y="-34" width="14" height="14" viewBox="0 0 64 64">'+ShopIdentity.mark().replace(/^<svg[^>]*>|<\/svg>$/g,'')+'</svg>';model.insertBefore(apron,head);
 node.addEventListener('click',()=>{if(!dragged)showPanel('team')});node.addEventListener('keydown',e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();showPanel('team')}});
 const indicator=node.querySelector('.visitor-bubble');indicator.setAttribute('transform','translate(-13 -106)');indicator.querySelector('rect').setAttribute('width','26');indicator.querySelector('text').setAttribute('x','13');
 model.setAttribute('transform','scale('+ShopDesign.staffMotion.visualScale+')');node.querySelector('.purchase-bag').setAttribute('transform','translate(20 -31) scale(1.25)');
 w.node=node;
}
function route(w,goals,phase){
 const path=N.route(g(),w.cell,goals),motion=path&&Motion.points(path,g(),w.position);
 if(!motion)return false;
 w.phase=phase;w.path=path;w.motion=motion;w.motionIndex=1;w.goal={...path.at(-1)};
 if(motion.length<=1)arrive(w);
 return true;
}
function arrive(w){
 w.path=null;w.motion=null;w.goal=null;
 if(w.phase==='to-product'){const a=context.actor(w.job),stop=a?.stops[w.stop];if(!stop)return cancel(w);
 w.phase=products[stop.product].vol===0?'preparing-fish':'preparing-product';w.remaining=w.phase==='preparing-fish'?w.profile.fishSeconds:w.profile.goodsSeconds;
 }else if(w.phase==='carrying-order')w.phase='at-counter';
 else if(w.phase==='returning')w.phase='idle';
 else if(w.phase==='to-receipt'){w.phase='collecting-stock';w.remaining=.7}
 else if(w.phase==='carrying-stock'){w.phase='restocking';w.remaining=1.4}
}
function pickup(w){
 const a=context.actor(w.job),stop=a?.stops[w.stop],o=stop&&g().objects.find(o=>o.id===stop.objectId);if(!o)return false;
 let goals=N.staffServices(g(),o),others=workers.filter(v=>v!==w).map(v=>v.goal||v.cell);
 const preferred=goals.filter(c=>N.key(c)!==N.key(a.cell)&&!others.some(v=>N.key(v)===N.key(c)));
 if(preferred.length&&N.route(g(),w.cell,preferred))goals=preferred;
 w.objectId=o.id;
 return route(w,goals,'to-product');
}
function release(w){ShopLogistics.returnTransport(w.transportId);w.transportId=null;w.restock=null;w.job=null;w.carry=null;w.stop=0;w.objectId=null;w.remaining=0;const s=station(w);if(!s||!route(w,[s.cell],'returning')){w.path=null;w.motion=null;w.phase='blocked'}}
function cancel(w){const a=context.actor(w.job);w.job=null;release(w);if(a&&!a.paid)context.fail(a,ShopI18n.t('staffBlocked'))}
function ensure(){
 const defs=definitions();
 for(const w of [...workers])if(!defs.some(d=>d.id===w.id&&d.key===w.profile.key)){cancel(w);w.node.remove();workers.splice(workers.indexOf(w),1)}
 const all=g().objects.filter(o=>o.kind==='counter').flatMap(o=>N.stations(g(),o).map((s,i)=>({...s,index:i})));
 for(const def of defs){
 if(workers.some(w=>w.id===def.id))continue;
 const free=all.find(s=>!workers.some(w=>w.counterId===s.counterId&&w.stationIndex===s.index));
 const cell=def.id===0&&free?free.cell:g().entrance;if(!N.free(g(),cell))continue;
 const w={id:def.id,profile:def,counterId:free?.counterId||null,stationIndex:free?.index||0,position:{x:cell.x+.5,y:cell.y+.5},cell:{...cell},phase:free?'idle':'blocked',job:null,stop:0,remaining:0,carry:null,path:null,motion:null,motionIndex:0,distance:0,facing:1,objectId:null};
 createNode(w);workers.push(w);if(def.id!==0&&free)route(w,[free.cell],'returning');
 }
 for(const w of workers){w.profile=defs.find(d=>d.id===w.id)||w.profile;
 if(!station(w)&&!w.job){const s=all.find(s=>!workers.some(v=>v!==w&&v.counterId===s.counterId&&v.stationIndex===s.index));if(s){w.counterId=s.counterId;w.stationIndex=s.index;route(w,[s.cell],'returning')}}
 }
}
function reserved(k,except,objectId){if(!context)return 0;return workers.reduce((sum,w)=>{const a=context.actor(w.job);return sum+(a&&!a.paid&&a.id!==except&&!a.kit&&!a.requestId&&(!objectId||(a.locations?a.locations[k]===objectId:a.stops.some(s=>s.objectId===objectId&&N.goods[g().objects.find(o=>o.id===s.objectId)?.kind]?.includes(k))))?(Math.max(0,(a.basket[k]||0)-(objectId?ShopLogistics.carried(a.id,k,objectId):0))):0)},0)}
function assign(){
 for(const a of context.waiting()){
 if(!context.available(a)){if(Object.entries(a.basket).some(([k,q])=>(state.stock[k]||0)<q))context.fail(a,ShopI18n.t('staffNoStock'));else if(a.waitTime>35)context.fail(a,ShopI18n.t('staffRestockLate'));continue}
 const free=workers.filter(w=>!w.job&&!w.restock&&['idle','returning'].includes(w.phase)&&!(w.id===1&&state.employeeUnpaid));
 const eligible=free.find(w=>{const s=station(w);return s&&a.stops.every(stop=>{const o=g().objects.find(o=>o.id===stop.objectId);return o&&N.route(g(),w.cell,N.staffServices(g(),o))&&N.route(g(),w.cell,[s.cell])})});
 if(!eligible)continue;
 const w=eligible,s=station(w);w.job=a.id;w.stop=0;w.carry=null;a.phase='staff-working';a.counterId=w.counterId;a.server={id:w.id,cell:{...s.customer},seconds:w.profile.seconds};
 if(!pickup(w))cancel(w);
 }
}
function restockAssign(){
 const tasks=ShopLogistics.candidates(g(),workers,context.waiting());
 for(const w of workers.filter(w=>!w.job&&!w.restock&&['idle','returning'].includes(w.phase)&&!(w.id===1&&state.employeeUnpaid))){
 const receipt=ShopLogistics.receipt(g());if(!receipt)continue;
 const first=N.route(g(),w.cell,N.staffServices(g(),receipt));if(!first)continue;
 const index=tasks.findIndex(t=>{const o=g().objects.find(o=>o.id===t.objectId);return o&&N.route(g(),first.at(-1),N.staffServices(g(),o))});if(index<0)continue;
 w.restock=tasks.splice(index,1)[0];route(w,N.staffServices(g(),receipt),'to-receipt');
 }
}
function advance(dt){
 ensure();
 for(const w of [...workers]){
 if(w.path){
 const move=Motion.travel(w.position,w.motion,w.motionIndex,dt*w.profile.walkSpeed,g());w.position=move.position;w.motionIndex=move.index;w.distance+=move.walked;
 if(move.direction)w.facing=move.direction.x-move.direction.y>=0?1:-1;
 w.cell={x:Math.floor(w.position.x),y:Math.floor(w.position.y)};
 if(move.blocked){if(!w.goal||!route(w,[w.goal],w.phase))cancel(w)}else if(move.done)arrive(w);
 continue;
 }
 if(w.phase==='collecting-stock'||w.phase==='restocking'){
 w.remaining-=dt;if(w.remaining>0)continue;
 if(w.phase==='collecting-stock'){const o=g().objects.find(o=>o.id===w.restock?.objectId);w.carry=products[w.restock?.k]?.vol===0?'fish':'goods';if(!o||!route(w,N.staffServices(g(),o),'carrying-stock'))release(w)}
 else {ShopLogistics.commit(w.restock);release(w);render();saveGame(false)}
 continue;
 }
 if(w.phase==='preparing-fish'||w.phase==='preparing-product'){
 w.remaining-=dt;if(w.remaining>0)continue;
 const a=context.actor(w.job);if(!a||!context.available(a)||!ShopLogistics.collect(w,a,a.stops[w.stop].objectId)){cancel(w);continue}
 if(w.phase==='preparing-fish')w.carry='fish';else if(!w.carry)w.carry='goods';
 w.stop++;
 if(w.stop<a.stops.length){if(!pickup(w))cancel(w)}
 else {const s=station(w);if(!s||!route(w,[s.cell],'carrying-order'))cancel(w);else context.ready(a,w)}
 render();saveGame(false);
 }
 }
 assign();restockAssign();
}
function ready(id,customerId){const w=workers.find(w=>w.id===id&&w.job===customerId);if(!w||!['at-counter','checkout'].includes(w.phase))return false;const s=station(w);if(!s||N.key(s.cell)!==N.key(w.cell))return false;w.phase='checkout';return true}
function complete(id){const w=workers.find(w=>w.job===id);if(w)release(w)}
function reset(){ShopLogistics.returnAll();for(const w of workers)w.node.remove();workers.length=0}
function draw(){
 for(const w of workers){
 const label=ShopI18n.t(({idle:'staffIdle',returning:'staffReturning','to-product':'staffServing','preparing-fish':'staffFish','preparing-product':'staffProduct','carrying-order':'staffCarrying','at-counter':'staffTill',checkout:'staffTill',blocked:'staffBlocked','to-receipt':'staffReceipt','collecting-stock':'staffCollect','carrying-stock':'staffRestockCarry',restocking:'staffRestock'})[w.phase]);
 const bubble=({ 'preparing-fish':'◌', 'preparing-product':'◌',checkout:'✓',restocking:'↥','collecting-stock':'↓'})[w.phase]||'';
 const feet=M.project(g().room,w.position.x,w.position.y);
 ShopCharacters.update(w.node,{feet,phase:(w.phase.startsWith('preparing')||w.phase==='restocking')?'browsing':w.phase,moving:!!w.path,distance:w.distance,facing:w.facing,bubble,label:ShopI18n.t('clerk')+': '+label,result:'pending'});
 w.node.dataset.task=w.phase;w.node.dataset.job=w.job??'';w.node.querySelector('.character-model>path').setAttribute('fill',ShopIdentity.colors[ShopIdentity.current.color]);
 const bag=w.node.querySelector('.purchase-bag');bag.style.display=w.carry?'':'none';
 if(bag.dataset.carry!==(w.carry||'')){bag.dataset.carry=w.carry||'';bag.innerHTML=w.carry==='fish'?'<path d="M3-7H13L10-1Q25 12 16 25H0Q-7 12 6-1Z" fill="#e0f5ed" fill-opacity=".85" stroke="#669c9d" stroke-width="1.5"/><path d="M-1 10Q8 8 19 11L16 24H0Z" fill="#77ced4" opacity=".8"/><path d="M5 17L1 14V20Z" fill="#eda768"/><ellipse cx="9" cy="17" rx="5" ry="3" fill="#eda768"/><circle cx="11" cy="16" r=".8" fill="#41666b"/><path d="M3-4H13" stroke="#64988c" stroke-width="2"/>':'<path d="M-2 1L9-4L21 2V23L9 28L-2 21Z" fill="#d5b17c"/><path d="M9 8V28M-2 1L9 8L21 2" stroke="#ae895f" fill="none"/>'}
 }
 return workers.map(w=>({node:w.node,bounds:{x:w.position.x-.28,y:w.position.y-.28,width:.56,depth:.56}}));
}
const serialize=()=>workers.map(({node,...w})=>JSON.parse(JSON.stringify(w)));
function restore(data,actors){
 if(!Array.isArray(data)||data.length>definitions().length)return false;
 const used=new Set();
 for(const w of data){
 if(!['idle','returning','to-product','preparing-fish','preparing-product','carrying-order','at-counter','checkout','blocked','to-receipt','collecting-stock','carrying-stock','restocking'].includes(w.phase)||!definitions().some(d=>d.id===w.id)||used.has(w.id)||!N.clear(g(),w.position)||!station(w)||!Number.isFinite(w.distance)||!Number.isFinite(w.remaining))return false;used.add(w.id);
 if(!!w.restock!==['to-receipt','collecting-stock','carrying-stock','restocking'].includes(w.phase))return false;
 if(w.restock&&(!products[w.restock.k]||!Number.isInteger(w.restock.q)||w.restock.q<1||w.job!==null||!g().objects.some(o=>o.id===w.restock.objectId)))return false;
 if(w.job!==null&&!actors.some(a=>a.id===w.job&&!a.paid&&a.server?.id===w.id))return false;
 if(w.motion&&(!Array.isArray(w.motion)||!w.motion.every((p,i)=>N.clear(g(),p)&&(i===0||N.segmentClear(g(),w.motion[i-1],p)))))return false;
 }
 if(new Set(data.filter(w=>w.job!==null).map(w=>w.job)).size!==data.filter(w=>w.job!==null).length)return false;
 for(const k of Object.keys(products))if(data.reduce((n,w)=>n+(w.restock?.k===k?w.restock.q:0),0)>ShopLogistics.stored(k))return false;
 const keys=data.filter(w=>w.restock).map(w=>w.restock.objectId+':'+w.restock.k);if(new Set(keys).size!==keys.length)return false;
 const manifests=state.logistics.transports;
 for(const [id,t] of Object.entries(manifests)){
  const w=data.find(w=>w.transportId===id&&w.id===t.workerId&&w.job===t.saleId),a=actors.find(a=>a.id===t.saleId&&!a.paid);
  if(!w||!a||!a.locations||w.restock||!['preparing-fish','preparing-product','to-product','carrying-order','at-counter','checkout'].includes(w.phase))return false;
  if(t.items.some(i=>a.locations[i.k]!==i.objectId||i.q!==a.basket[i.k]))return false;
  if(new Set(t.items.map(i=>i.k)).size!==t.items.length)return false;
 }
 for(const w of data){
  if(w.transportId&&!manifests[w.transportId])return false;
  const a=actors.find(a=>a.id===w.job);if(!a)continue;
  const expected=a.stops.slice(0,w.stop).map(s=>s.objectId);
  for(const [k,q] of Object.entries(a.basket))if(ShopLogistics.carried(a.id,k,a.locations?.[k])!==(expected.includes(a.locations?.[k])?q:0))return false;
  if(['carrying-order','at-counter','checkout'].includes(w.phase)&&!ShopLogistics.saleTransport(a.id,a.basket,a.locations))return false;
 }
 for(const w of workers)w.node.remove();workers.length=0;for(const raw of data){const w=JSON.parse(JSON.stringify(raw));w.profile=definitions().find(d=>d.id===w.id);createNode(w);workers.push(w)}return true;
}
return {init(api){context=api},ensure,advance,ready,complete,reserved,draw,reset,restore,serialize,snapshot:serialize,visualWorkers:()=>workers,occupied:()=>workers.map(w=>({...w.cell,roomId:'main'}))};
})();
