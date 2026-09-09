// Replace this renderer to install future sprite sheets/rigs; simulation owns feet and phases.
window.ShopCharacters={
 create({id,color,skin,hair}){
 const node=document.createElementNS('http://www.w3.org/2000/svg','g');node.classList.add('live-visitor');node.dataset.visitorId=id;node.setAttribute('role','button');node.setAttribute('tabindex','0');
 node.innerHTML='<g class="character-body">'+person(color,skin,hair)+'</g><g class="visitor-bubble" transform="translate(-55 -117)"><rect width="110" height="27" rx="10"/><text x="55" y="18" text-anchor="middle"></text></g>';
 return node;
 },
 update(node,{feet,phase,moving,distance,facing,bubble,label,result}){
 node.setAttribute('transform','translate('+feet.x+' '+feet.y+')');node.dataset.phase=phase;node.dataset.result=result;node.setAttribute('aria-label',label);
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const bob=moving&&!reduced?Math.sin(distance*11)*1.6:0,mirror=facing<0?-1:1;
 node.querySelector('.character-body').setAttribute('transform','translate(0 '+bob+') scale('+mirror+' 1)');
 node.querySelector('.visitor-bubble text').textContent=bubble;
 },
 remove(node){node.remove()}
};
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
