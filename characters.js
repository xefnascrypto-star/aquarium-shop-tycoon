// Visual profiles and poses can be replaced by sprites without changing navigation.
window.ShopCharacters=(()=>{
const appearanceOffset=crypto.getRandomValues(new Uint16Array(1))[0];
const clothes=['#d79676','#82a59b','#8b9fc0','#c2a36c','#ac86ac','#769aab','#b67666','#8caa78'],skins=['#efc8a2','#d9a77d','#b88060','#81563f'],hairs=['#493e38','#82634b','#ba915e','#ddd2b5','#343b42'];
function profile(id){const n=Number(id)||1;return {body:n%3,hair:n%4,skirt:n%5===2,young:n%4===1,glasses:n%7===0,color:clothes[n%clothes.length],skin:skins[Math.floor(n/2)%skins.length],hairColor:hairs[Math.floor(n/3)%hairs.length]}}
function art(p){
const w=[13,16,19][p.body],hair=p.hair===0?'M-14-60Q-22-87 0-86Q20-85 14-64L7-74Q-10-68-14-60':p.hair===1?'M-14-55Q-21-88 1-86Q20-82 15-52L10-68Q-3-76-14-55':p.hair===2?'M-14-68Q-19-86-5-84Q-1-94 9-83Q20-80 14-65L6-73Z':'M-14-67Q-18-87 0-86Q18-86 15-67L8-74L-8-72Z';
return '<ellipse cy="3" rx="19" ry="8" fill="#52776325"/><g class="character-leg left-leg"><path d="M-7-19L-8-3" stroke="#485965" stroke-width="8" stroke-linecap="round"/><path d="M-11-2H-4" stroke="#394c53" stroke-width="5" stroke-linecap="round"/></g><g class="character-leg right-leg"><path d="M7-19L8-3" stroke="#485965" stroke-width="8" stroke-linecap="round"/><path d="M5-2H12" stroke="#394c53" stroke-width="5" stroke-linecap="round"/></g><path d="M-'+w+'-42Q0-53 '+w+'-42L'+(p.skirt?w+3:w-3)+'-'+(p.skirt?12:17)+'Q0-9 -'+(p.skirt?w+3:w-3)+'-'+(p.skirt?12:17)+'Z" fill="'+p.color+'"/><path d="M-6-45Q0-37 6-45" fill="none" stroke="#f5e7c9" stroke-width="2"/><path class="character-arm" d="M-'+w+'-39L-'+(w+4)+'-25M'+w+'-39L'+(w+4)+'-25" stroke="'+p.skin+'" stroke-width="7" stroke-linecap="round" fill="none"/><g class="character-head"><rect x="-5" y="-53" width="10" height="12" rx="3" fill="'+p.skin+'"/><ellipse cy="-64" rx="14" ry="17" fill="'+p.skin+'"/><path d="'+hair+'" fill="'+p.hairColor+'"/><circle cx="6" cy="-63" r="1.5" fill="#4c4e4a"/>'+(p.glasses?'<path d="M0-64H12V-59H1Z" fill="none" stroke="#574e49" stroke-width="1.5"/>':'')+'</g>';
}
return {profile,
create({id,seed}){
 const visualSeed=Number.isInteger(seed)&&seed>=0?seed:Number(id)+appearanceOffset,p=profile(visualSeed),node=document.createElementNS('http://www.w3.org/2000/svg','g');node.classList.add('live-visitor');node.dataset.visitorId=id;node.dataset.seed=visualSeed;node.dataset.profile=JSON.stringify(p);node.setAttribute('role','button');node.setAttribute('tabindex','0');
 node.innerHTML='<g class="character-body"><g class="character-model" transform="scale('+(p.young?.93:1)+' '+(p.young?.94:1)+')">'+art(p)+'<g class="purchase-bag" transform="translate(17 -28)" style="display:none"><path d="M1 0V-5Q8-14 15-5V0" fill="none" stroke="#ad956e" stroke-width="2"/><path d="M-2-1H18L20 24H-3Z" fill="#f2dfb6"/><g><svg class="brand-badge" x="1" y="3" width="15" height="15" viewBox="0 0 64 64">'+ShopIdentity.mark().replace(/^<svg[^>]*>|<\/svg>$/g,'')+'</svg></g></g></g></g><g class="visitor-bubble" transform="translate(-55 -117)"><rect width="110" height="27" rx="10"/><text x="55" y="18" text-anchor="middle"></text></g>';
 return node;
},
update(node,{feet,phase,moving,distance,facing,bubble,label,result}){
 node.setAttribute('transform','translate('+feet.x+' '+feet.y+')');node.dataset.phase=phase;node.dataset.result=result;node.setAttribute('aria-label',label);
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,wave=moving&&!reduced?Math.sin(distance*11):0,mirror=facing<0?-1:1;
 node.querySelector('.character-body').setAttribute('transform','translate(0 '+(wave*1.2)+') scale('+mirror+' 1)');
 node.querySelector('.left-leg').setAttribute('transform','rotate('+(wave*12)+' -7 -19)');node.querySelector('.right-leg').setAttribute('transform','rotate('+(-wave*12)+' 7 -19)');
 node.querySelector('.character-head').setAttribute('transform',phase==='browsing'?'rotate(7 0 -49)':phase==='checkout'?'rotate(4 0 -49)':'');
 node.querySelector('.character-arm').setAttribute('transform',phase==='checkout'?'rotate(-12 0 -39)':'');
 node.querySelector('.purchase-bag').style.display=result==='sale'?'':'none';
 node.querySelector('.visitor-bubble').style.display=bubble?'':'none';node.querySelector('.visitor-bubble text').textContent=bubble;
},
remove(node){node.remove()}
};
})();
// Pairwise floor separation, not a far-corner scalar, determines occlusion.
window.ShopDepth={
 sort(items){
 const edges=items.map(()=>new Set()),indegree=items.map(()=>0),behind=(a,b)=>a.x+a.width<=b.x+1e-6||a.y+a.depth<=b.y+1e-6;
 for(let i=0;i<items.length;i++)for(let j=i+1;j<items.length;j++){
 const a=behind(items[i].bounds,items[j].bounds),b=behind(items[j].bounds,items[i].bounds);
 if(a===b)continue;const from=a?i:j,to=a?j:i;edges[from].add(to);indegree[to]++;
 }
 const remaining=new Set(items.map((_,i)=>i)),result=[],rank=i=>items[i].bounds.x+items[i].bounds.y+items[i].bounds.width+items[i].bounds.depth;
 while(remaining.size){let ready=[...remaining].filter(i=>indegree[i]===0);if(!ready.length)ready=[...remaining];ready.sort((a,b)=>rank(a)-rank(b)||a-b);const i=ready[0];remaining.delete(i);result.push(items[i]);for(const to of edges[i])indegree[to]--}
 return result;
 }
};
