// Sparse, optional neighbourhood moments. No modal pop-ups or new progression gates.
(() => {
 const fresh=()=>({elapsed:0,cooldown:75,sequence:0,active:null,request:null,offer:null,interest:null,completed:0});
 state.moments={...fresh(),...(state.moments||{})};const m=state.moments;
 if(m.request)m.request.claimed=false;
 const name=k=>products[k]?.name||'producto',bar=$('momentBar');
 function draw(){
 let title='',detail='',actions=[];
 if(m.active){
 const e=m.active;
 if(e.type==='request'){title='Un encargo de barrio';detail='Clara busca 2 '+name(e.product)+'. Puedes reservarlos para ella o seguir vendiendo normalmente.';actions=[['accept','Reservar 2'],['skip','Ahora no']]}
 if(e.type==='offer'){title='Una oportunidad del proveedor';detail='20% menos en '+name(e.product)+' del proveedor local durante 90 s de juego.';actions=[['offer','Ver oferta'],['skip','Dejar pasar']]}
 if(e.type==='interest'){title='Una pregunta en la tienda';detail='Dos vecinos preguntan qué pez recomiendas. Tu elección atraerá algunas visitas interesadas.';actions=[['betta','Betta'],['comet','Cometa'],['skip','Otro día']]}
 }else if(m.request){title=m.request.claimed?'Clara ya está en la tienda':'Encargo reservado · 2 '+name(m.request.product);detail=m.request.claimed?'Mirará el expositor y pagará en caja.':'Prepara el stock. Quedan '+Math.ceil(m.request.remaining)+' s de juego; sin penalización si no llegas.';actions=m.request.claimed?[]:[['stock','Reponer'],['cancel','Cancelar']]}
 else if(m.offer){title='Oferta local · '+name(m.offer.product);detail='20% de descuento · '+Math.ceil(m.offer.remaining)+' s de juego. Tú decides si merece la pena reponer.';actions=[['buy','Pedir 5 · '+quote(m.offer.product,5,'local').cost+' 🪙'],['skip','Dejar pasar']]}
 else if(m.interest){title='Hoy preguntan por '+name(m.interest.product);detail='Algunas visitas buscarán esta especie. Puedes priorizar su stock.';actions=[['stock','Ver stock'],['quiet','Entendido']]}
 bar.hidden=!title||!!m.interest?.quiet&&!m.active&&!m.request&&!m.offer;
 if($('momentTitle').textContent!==title)$('momentTitle').textContent=title;if($('momentDetail').textContent!==detail)$('momentDetail').textContent=detail;
 const signature=JSON.stringify(actions);
 if(bar.dataset.actions!==signature){bar.dataset.actions=signature;$('momentActions').innerHTML=actions.map(([id,label])=>'<button data-moment="'+id+'">'+label+'</button>').join('')}
 }
 function act(action){
 const e=m.active;
 if(action==='accept'&&e?.type==='request'){m.request={id:e.id,product:e.product,basket:{[e.product]:2},remaining:180,claimed:false,retry:0};m.active=null}
 else if(action==='offer'&&e?.type==='offer'){m.offer={product:e.product,remaining:90};m.active=null}
 else if(['betta','comet'].includes(action)&&e?.type==='interest'){m.interest={product:action,remaining:120};m.active=null}
 else if(action==='buy'&&m.offer){state.supplier='local';order(m.offer.product,5)}
 else if(action==='stock'){showPanel('stock')}
 else if(action==='quiet'&&m.interest)m.interest.quiet=true;
 else if(action==='cancel'&&m.request&&!m.request.claimed)m.request=null;
 else if(action==='skip'){m.active=null;m.offer=null;m.interest=null}
 draw();render();saveGame(false);
 }
 $('momentActions').onclick=e=>{const b=e.target.closest('[data-moment]');if(b)act(b.dataset.moment)};
 function tick(dt){
 if(window.shopEditor?.active)return;
 m.elapsed+=dt;
 for(const field of ['active','offer','interest'])if(m[field]){m[field].remaining-=dt;if(m[field].remaining<=0)m[field]=null}
 if(m.request&&!m.request.claimed){m.request.remaining-=dt;m.request.retry=Math.max(0,(m.request.retry||0)-dt);if(m.request.remaining<=0)m.request=null}
 if(!m.active&&!m.request&&!m.offer&&!m.interest){
 m.cooldown-=dt;
 if(m.cooldown<=0&&state.level<=4&&!state.kitRequested){
 const type=['request','offer','interest'][m.sequence%3];if(type==='offer'&&state.level<2){draw();return}
 const product=type==='request'&&state.level>=3?'guppy':type==='offer'?'food':'comet';
 m.active={id:'neighbour-'+(++m.sequence),type,product,remaining:90};m.cooldown=240;saveGame(false);
 }
 }
 draw();
 }
 window.ShopMoments={
 tick,act,reveal:()=>{if(m.interest)m.interest.quiet=false;draw()},
 reserved(k,except){return m.request&&m.request.id!==except?(m.request.basket[k]||0):0},
 discount(k,supplier){return m.offer&&m.offer.remaining>0&&m.offer.product===k&&supplier==='local'?.8:1},
 purchased(k,supplier){if(m.offer?.product===k&&supplier==='local'){m.offer=null;draw()}},
 claim(){const r=m.request;if(!r||r.claimed||r.retry>0||!Object.entries(r.basket).every(([k,q])=>state.stock[k]>=q+(state.kitRequested?(ShopDesign.kit[k]||0):0)))return null;r.claimed=true;draw();return {id:r.id,basket:{...r.basket}}},
 valid(id){return m.request?.id===id},
 finish(id,success){if(m.request?.id!==id)return;if(success){m.request=null;m.completed++}else {m.request.claimed=false;m.request.retry=30}draw()},
 interest(){return m.interest?.product||null}
 };
 window.addEventListener('editbegin',()=>{if(m.request)m.request.claimed=false});
 window.addEventListener('statechange',draw);draw();
})();
