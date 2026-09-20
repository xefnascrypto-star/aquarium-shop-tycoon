/* Presentation adapter. Remove its script/style tags to restore the original art.
   No state, randomness, timers, footprints, routes or economy are changed. */
(()=>{
 const ns='http://www.w3.org/2000/svg',svg=document.getElementById('scene');
 document.body.classList.add('polish-pass');
 const defs=document.createElementNS(ns,'defs');defs.id='polish-definitions';defs.innerHTML=`
 <radialGradient id="polish-soft-light" cx=".25" cy=".2" r=".9"><stop stop-color="#fff" stop-opacity=".52"/><stop offset=".48" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#432d40" stop-opacity=".19"/></radialGradient>
 <linearGradient id="polish-shirt-shade" x2="1" y2=".65"><stop stop-color="#fff" stop-opacity=".35"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#193a48" stop-opacity=".3"/></linearGradient>`;svg.prepend(defs);
 const group=markup=>{const g=document.createElementNS(ns,'g');g.setAttribute('pointer-events','none');g.innerHTML=markup;return g};
 const create=ShopCharacters.create;
 ShopCharacters.create=function(options){
  const node=create.call(this,options),p=JSON.parse(node.dataset.profile),model=node.querySelector('.character-model'),head=node.querySelector('.character-head'),shirt=model.querySelector(':scope > path');
  // Keep the first direct path: staff.js recolors it with the chosen shop identity.
  const fabric=group(`<path d="${shirt.getAttribute('d')}" fill="url(#polish-shirt-shade)"/><path d="M-8-17Q0-14 8-17" stroke="#fff" stroke-opacity=".22" fill="none"/>`);
  shirt.after(fabric);
  for(const [cls,x] of [['left-leg',-8],['right-leg',8]]){
   const leg=node.querySelector('.'+cls);leg.innerHTML=`<path d="M${x}-20V-5" stroke="#384d68" stroke-width="9" stroke-linecap="round"/><path d="M${x-3}-18V-8" stroke="#fff" stroke-opacity=".12" stroke-width="2"/><rect x="${x-5}" y="-7" width="14" height="8" rx="4" fill="#f5f2e9"/><path d="M${x-3} 0H${x+7}" stroke="#b8c5c7" stroke-width="2" stroke-linecap="round"/>`;
  }
  const hair=head.querySelector('path').getAttribute('d');
  head.innerHTML=`<rect x="-5" y="-52" width="11" height="10" rx="4" fill="${p.skin}"/><ellipse cx="-17" cy="-63" rx="4" ry="6" fill="${p.skin}"/><ellipse cx="17" cy="-63" rx="4" ry="6" fill="${p.skin}"/><ellipse cy="-66" rx="18" ry="20" fill="${p.skin}"/><ellipse cy="-66" rx="18" ry="20" fill="url(#polish-soft-light)"/><path d="${hair}" transform="translate(0 5) scale(1.2 1.08)" fill="${p.hairColor}"/><path d="M-11-79Q-4-86 6-81" fill="none" stroke="#fff" stroke-opacity=".15" stroke-width="3" stroke-linecap="round"/><ellipse cx="3" cy="-64" rx="2.2" ry="3" fill="#30374a"/><ellipse cx="12" cy="-64" rx="2" ry="2.8" fill="#30374a"/><circle cx="3.6" cy="-65" r=".75" fill="#fff"/><circle cx="12.5" cy="-65" r=".7" fill="#fff"/><path d="M7-62q5 4 0 4" fill="none" stroke="#875846" stroke-opacity=".4" stroke-width="1.6" stroke-linecap="round"/><path d="M3-54q4 3 8-1" fill="none" stroke="#824d4a" stroke-width="1.5" stroke-linecap="round"/><ellipse cx="-3" cy="-58" rx="3.5" ry="2" fill="#e78f84" opacity=".28"/>${p.glasses?'<g fill="none" stroke="#354d55" stroke-width="1.4"><rect x="-1" y="-69" width="8" height="9" rx="3"/><rect x="9" y="-69" width="8" height="9" rx="3"/><path d="M7-65H9"/></g>':''}`;
  node.classList.add('polished-character');return node;
 };

 // All materials are SVG paint servers. Geometry still comes from the original room/objects.
 defs.insertAdjacentHTML('beforeend',`
 <linearGradient id="polish-oak-top" x2="0" y2="1"><stop stop-color="#fff3d9"/><stop offset="1" stop-color="#e7c893"/></linearGradient>
 <linearGradient id="polish-oak-front" x2=".2" y2="1"><stop stop-color="#edcc98"/><stop offset="1" stop-color="#be9062"/></linearGradient>
 <linearGradient id="polish-oak-side" x2=".8" y2="1"><stop stop-color="#ba906c"/><stop offset="1" stop-color="#93704f"/></linearGradient>
 <linearGradient id="polish-water-front" x2=".2" y2="1"><stop stop-color="#b1fff1"/><stop offset=".4" stop-color="#59d4d5"/><stop offset="1" stop-color="#2298b0"/></linearGradient>
 <linearGradient id="polish-water-side" x2="1" y2="1"><stop stop-color="#61d9d4"/><stop offset="1" stop-color="#277f99"/></linearGradient>
 <linearGradient id="polish-wall-right" x2="0" y2="1"><stop stop-color="#e4f0de"/><stop offset="1" stop-color="#b8d4c3"/></linearGradient>
 <linearGradient id="polish-leaf" x2="1" y2="1"><stop stop-color="#9ed599"/><stop offset=".5" stop-color="#58a68a"/><stop offset="1" stop-color="#267a6a"/></linearGradient>
 <linearGradient id="polish-pot" x2="1" y2=".3"><stop stop-color="#efc1a3"/><stop offset=".4" stop-color="#de9f7d"/><stop offset="1" stop-color="#b67758"/></linearGradient>
 <linearGradient id="polish-counter" x2=".2" y2="1"><stop stop-color="#69aa9e"/><stop offset="1" stop-color="#347e77"/></linearGradient>`);
 document.getElementById('wall').innerHTML='<stop stop-color="#fffcf0"/><stop offset="1" stop-color="#eee9d5"/>';
 document.getElementById('tiles').innerHTML='<rect width="90" height="90" fill="#ecdfc5"/><rect x="1" y="1" width="88" height="43" rx="1" fill="#f3e8d2"/><path d="M0 0H90V90H0ZM0 45H90M45 0V45" fill="none" stroke="#fff8e7" stroke-width="1.2"/><path d="M6 8H38M50 53H81" stroke="#d6c6aa" stroke-width=".6" opacity=".4"/>';
 const originalBox=box;
 box=function(x,y,w,d,h,top,front,side){
  const water=front==='url(#water)';
  return originalBox(x,y,w,d,h,water?'#bdfff0':'url(#polish-oak-top)',water?'url(#polish-water-front)':'url(#polish-oak-front)',water?'url(#polish-water-side)':'url(#polish-oak-side)');
 };
 const originalPlant=plant;
 plant=function(...args){return originalPlant(...args).replace('fill="#c48962"','fill="url(#polish-pot)"').replace('fill="#66a57e"','fill="url(#polish-leaf)"')};
 const originalTank=tank;
 tank=function(...args){return originalTank(...args).replace('stroke="#e2c99b"','stroke="#f6e8cf"').replace('fill="#517b70"','fill="#376e70"').replace('<g class="fish-swim">','<path d="M-48 105L59 159M-48 112L59 166" stroke="#ffffff" stroke-opacity=".15" fill="none"/><path d="M-20 119v23M24 141v22" stroke="#896c50" stroke-opacity=".35"/><g class="fish-swim">')};
 const originalFurniture=furnitureArt;
 const packageArt=(x,y,color,tall=false)=>'<g transform="translate('+x+' '+y+')"><ellipse cx="7" cy="22" rx="9" ry="3" fill="#27595422"/><rect width="14" height="22" rx="'+(tall?4:2)+'" fill="'+color+'"/><path d="M2 3v16" stroke="#fff" stroke-opacity=".35" stroke-width="2"/><rect x="2" y="8" width="10" height="8" rx="1" fill="#fff4d8"/><path d="M5 11h4m-4 2h3" stroke="#487f79" stroke-width="1"/>'+(tall?'<rect x="3" y="-3" width="8" height="5" rx="2" fill="#467a75"/>':'')+'</g>';
 furnitureArt=function(kind){
  if(kind==='shelf'||kind==='shelf2')return hit('shelf','Estantería y comida','<g transform="translate(0 -90)">'+box(0,0,112,35,90)+'<path d="M4 30L108 82M4 60L108 112" stroke="#fff1d9" stroke-width="7"/><path d="M4 34L108 86M4 64L108 116" stroke="#ab8760" stroke-width="1"/><g class="shelf-goods">'+[0,1,2,3].map(i=>packageArt(12+i*23,8+i*11.5,['#6aa99f','#dfae66','#82adc0','#cc9a85'][i],i%2===0)).join('')+'</g><g class="shelf-extra" style="display:none">'+[0,1,2,3].map(i=>packageArt(12+i*23,42+i*11.5,['#e4bb73','#73a995','#a6b780','#83abc2'][i],false)).join('')+'</g></g>');
  if(kind==='counter')return hit('counter','Mostrador y actividad',originalBox(0,-58,157,66,58,'#fff2da','url(#polish-counter)','#326b68')+'<path d="M-59-20L85 52M-59-13L85 59" stroke="#fff" stroke-opacity=".16" stroke-width="2"/><g transform="translate(10 -9) skewY(26.565)"><rect width="35" height="27" rx="8" fill="#e6eed8"/><path d="M6 14Q17 1 27 14Q17 26 6 14L2 7V20Z" fill="#4a8d80"/><circle cx="23" cy="12" r="1.5" fill="#eff9e7"/></g><g transform="translate(40 -47)"><path d="M0 0L26 13L13 20L-13 7Z" fill="#789991"/><path d="M-3 4V-17L19-6V15Z" fill="#315e63"/><path d="M0-12L15-5V5L0-2Z" fill="#b9ede1"/><path d="M3-9L12-5M3-5L9-2" stroke="#f0fff1" stroke-width="1.5"/></g><g class="counter-products" transform="translate(95 -23)">'+packageArt(0,0,'#dfa65e',true)+packageArt(19,9,'#87b8aa',true)+'</g>');
  let art=originalFurniture(kind);
  if(kind==='warehouse')art=art.replace('<g class="receipt-load">','<g pointer-events="none"><path d="M1-30L1-4L-7 0V-25Z" fill="#f1d7a8"/><path d="M-23-7L-8 0V11L-23 4Z" fill="#fff3d5"/><path d="M-19-3L-12 0M-19 0L-12 3" stroke="#758d80" stroke-width="1.2"/></g><g class="receipt-load">');
  return art;
 };
 const originalRoom=drawRoom;
 drawRoom=function(room){
  originalRoom(room);const shell=document.getElementById('roomShell');
  shell.querySelector('polygon[fill="#c8dac2"]')?.setAttribute('fill','url(#polish-wall-right)');
  const a=ShopLayout.project(room,0,0),b=ShopLayout.project(room,room.width,0),d=ShopLayout.project(room,0,room.depth);
  const line=(height,color,width)=>'<polyline points="'+[d,a,b].map(p=>p.x+','+(p.y-height)).join(' ')+'" fill="none" stroke="'+color+'" stroke-width="'+width+'"/>';
  shell.append(group(line(4,'#7b9e90',8)+line(39,'#fff9e9',4)+line(43,'#91b5a2',2)+line(184,'#eff7e8',3)));
 };
 // Redraw presentation only; subsequent editor/expansion redraws use the same adapters.
 if(state.layout){drawRoom(state.layout.rooms[0]);drawFurniture(state.layout,state);syncScene()}
})();
