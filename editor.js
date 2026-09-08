// Transactional editor: only Confirm and Undo change persisted layout.
(() => {
 const M=ShopLayout;
 state.layout=M.migrate(state.layout,state);
 let active=false,draft=null,history=[],gesture=null,longPress=null,unlock=!!state.tank3;
 const bar=$('editorBar');
 const current=()=>state.layout;
 const working=()=>{const layout=M.clone(current());if(draft)layout.objects=layout.objects.map(o=>o.id===draft.id?{...draft}:o);return layout};
 function paint(){
  drawFurniture(working(),state);
  syncScene();updateJourney();
  $('gridLayer').style.display=active?'block':'none';
  $('placementLayer').innerHTML='';
  if(draft){
   const room=current().rooms.find(r=>r.id===draft.roomId),b=M.footprint(draft),p=[[b.x,b.y],[b.x+b.width,b.y],[b.x+b.width,b.y+b.depth],[b.x,b.y+b.depth]].map(([x,y])=>{const pt=M.project(room,x,y);return pt.x+','+pt.y}).join(' ');
   const invalid=M.validate(current(),draft,state);
   $('placementLayer').innerHTML='<polygon points="'+p+'" fill="'+(invalid?'#dc795855':'#76b99444')+'" stroke="'+(invalid?'#b34831':'#367d60')+'" stroke-width="3"/>';
   $('editHelp').textContent=invalid||'Arrastra o toca una casilla. Giro: '+draft.rotation+'°. Confirma para guardar.';
   $('editConfirm').disabled=!!invalid;
   const node=world.querySelector('[data-instance="'+draft.id+'"]');if(node)node.classList.add('selected-object');
  }else{$('editHelp').textContent='Selecciona un objeto. Las ventas están en pausa.';$('editConfirm').disabled=true}
  for(const id of ['editRotate','editCancel'])$(id).disabled=!draft;
  document.querySelectorAll('[data-move]').forEach(b=>b.disabled=!draft);
  $('editUndo').disabled=!history.length;
 }
 function grid(){
  const room=current().rooms[0],lines=[];
  for(let x=0;x<=room.width;x++){const a=M.project(room,x,0),b=M.project(room,x,room.depth);lines.push('<path d="M'+a.x+' '+a.y+'L'+b.x+' '+b.y+'"/>')}
  for(let y=0;y<=room.depth;y++){const a=M.project(room,0,y),b=M.project(room,room.width,y);lines.push('<path d="M'+a.x+' '+a.y+'L'+b.x+' '+b.y+'"/>')}
  $('gridLayer').innerHTML='<g fill="none" stroke="#558b75" stroke-width="1.5" opacity=".65">'+lines.join('')+'</g>';
 }
 function refreshSelect(){
  const select=$('editObject');select.replaceChildren();
  const empty=document.createElement('option');empty.value='';empty.textContent='Seleccionar objeto…';select.append(empty);
  current().objects.filter(o=>M.owned(o,state)).forEach(o=>{const opt=document.createElement('option');opt.value=o.id;opt.textContent=M.catalog[o.kind].label+' · '+o.id;select.append(opt)});
  select.value=draft?.id||'';
 }
 function select(id){
  const o=current().objects.find(o=>o.id===id&&M.owned(o,state));draft=o?M.clone(o):null;
  $('editObject').value=draft?.id||'';paint();
 }
 function begin(id){
  if(panel.open)panel.close();
  if(!active){active=true;pointers.clear();document.body.classList.add('editing');bar.hidden=false;window.dispatchEvent(new Event('editbegin'));refreshSelect()}
  grid();if(id)select(id);else paint();
 }
 function end(){
  draft=null;active=false;gesture=null;bar.hidden=true;document.body.classList.remove('editing');paint();
  window.dispatchEvent(new Event('editend'));$('editStart').focus();
 }
 function confirm(){
  if(!draft||M.validate(current(),draft,state))return;
  const previous=current().objects.find(o=>o.id===draft.id);
  if(JSON.stringify(previous)!==JSON.stringify(draft)){
   history.push(M.clone(current()));if(history.length>30)history.shift();
   state.layout=working();saveGame(false);window.dispatchEvent(new Event('layoutchange'));
  }
  draft=null;refreshSelect();paint();
 }
 function undo(){
  if(!history.length)return;
  // Ownership may change while editing; never restore an invalid unlocked footprint.
  const candidate=history.pop();
  if(candidate.objects.some(o=>M.owned(o,state)&&M.validate(candidate,o,state))){$('editHelp').textContent='Ese cambio ya no se puede deshacer tras una mejora.';return}
  state.layout=candidate;draft=null;saveGame(false);refreshSelect();paint();window.dispatchEvent(new Event('layoutchange'));
 }
 function cell(event){
  const point=new DOMPoint(event.clientX,event.clientY).matrixTransform(world.getScreenCTM().inverse());
  return M.unproject(current().rooms[0],point.x,point.y);
 }
 window.shopEditor={canPlace(kind){const o=current().objects.find(o=>o.kind===kind);const s={...state,[kind]:true};return o&&(!M.validate(current(),o,s)||!!M.findFree(current(),o,s))},get active(){return active},begin,end,get layout(){return M.clone(current())}};
 $('editStart').onclick=()=>begin();$('editExit').onclick=end;$('editConfirm').onclick=confirm;$('editUndo').onclick=undo;
 $('editCancel').onclick=()=>{draft=null;refreshSelect();paint()};
 $('editRotate').onclick=()=>{if(draft){draft.rotation=draft.rotation===0?90:0;paint()}};
 $('editObject').onchange=e=>select(e.target.value);
 document.querySelectorAll('[data-move]').forEach(b=>b.onclick=()=>{if(draft){const [x,y]=b.dataset.move.split(',').map(Number);draft.x+=x;draft.y+=y;paint()}});
 world.addEventListener('pointerdown',e=>{
  const item=e.target.closest('[data-instance]');
  if(!active){
   if(item){const id=item.dataset.instance,start={x:e.clientX,y:e.clientY};longPress={start,timer:setTimeout(()=>{longPress=null;dragged=true;begin(id)},550)}}
   return;
  }
  e.preventDefault();e.stopPropagation();
  if(item){if(draft?.id!==item.dataset.instance)select(item.dataset.instance)}
  else if(draft){const c=cell(e);draft.x=c.x;draft.y=c.y;paint()}
  if(draft)gesture={id:e.pointerId,start:cell(e),original:{x:draft.x,y:draft.y},moved:false};
  world.setPointerCapture(e.pointerId);
 },true);
 world.addEventListener('pointermove',e=>{
  if(longPress&&Math.hypot(e.clientX-longPress.start.x,e.clientY-longPress.start.y)>8){clearTimeout(longPress.timer);longPress=null}
  if(!active||!gesture||gesture.id!==e.pointerId||!draft)return;
  e.preventDefault();e.stopPropagation();
  const c=cell(e);draft.x=gesture.original.x+c.x-gesture.start.x;draft.y=gesture.original.y+c.y-gesture.start.y;gesture.moved=true;paint();
 },true);
 function release(e){if(longPress){clearTimeout(longPress.timer);longPress=null}if(gesture?.id===e.pointerId){gesture=null;if(world.hasPointerCapture(e.pointerId))world.releasePointerCapture(e.pointerId)}}
 world.addEventListener('pointerup',release,true);world.addEventListener('pointercancel',release,true);
 world.addEventListener('click',e=>{if(active){e.preventDefault();e.stopImmediatePropagation()}},true);
 world.addEventListener('keydown',e=>{if(active&&(e.key==='Enter'||e.key===' ')){const item=e.target.closest('[data-instance]');if(item){e.preventDefault();e.stopImmediatePropagation();select(item.dataset.instance)}}},true);
 document.addEventListener('keydown',e=>{if(active&&e.key==='Escape'){e.preventDefault();if(draft){draft=null;refreshSelect();paint()}else end()}});
 window.addEventListener('statechange',()=>{
  if(unlock!==!!state.tank3){
   unlock=!!state.tank3;history=[];draft=null;
   const third=current().objects.find(o=>o.kind==='tank3');
   if(M.validate(current(),third,state)){const free=M.findFree(current(),third,state);if(free)Object.assign(third,free)}
   refreshSelect();paint();saveGame(false);
  }
 });
 paint();grid();saveGame(false);
})();
