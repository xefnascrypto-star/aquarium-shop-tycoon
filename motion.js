// Pure locomotion in floor coordinates. Rendering never changes collision position.
(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./navigation.js'):root.ShopNavigation);if(typeof module==='object'&&module.exports)module.exports=api;else root.ShopMotion=api})(globalThis,N=>{
 function points(path,g,position){
 const centers=path.map(c=>({x:c.x+.5,y:c.y+.5})),result=position?[{...position}]:[];
 const push=p=>{if(!result.length||Math.hypot(p.x-result.at(-1).x,p.y-result.at(-1).y)>1e-7)result.push(p)};
 for(let i=0;i<centers.length;i++){
 const c=centers[i],prev=centers[i-1],next=centers[i+1];
 if(prev&&next&&(c.x-prev.x!==next.x-c.x||c.y-prev.y!==next.y-c.y)){
 const radius=.2,enter={x:c.x+(prev.x-c.x)*radius,y:c.y+(prev.y-c.y)*radius},exit={x:c.x+(next.x-c.x)*radius,y:c.y+(next.y-c.y)*radius};
 const curve=[enter];for(let j=1;j<=8;j++){const t=j/8,s=1-t;curve.push({x:s*s*enter.x+2*s*t*c.x+t*t*exit.x,y:s*s*enter.y+2*s*t*c.y+t*t*exit.y})}
 if(curve.every((p,j)=>j===0||N.segmentClear(g,curve[j-1],p))){curve.forEach(push);continue}
 }
 push(c);
 }
 return result.every((p,i)=>i===0||N.segmentClear(g,result[i-1],p))?result:null;
 }
 function travel(position,points,index,distance,g){
 let p={...position},remaining=distance,walked=0,direction=null;
 while(index<points.length&&remaining>1e-8){
 const to=points[index],length=Math.hypot(to.x-p.x,to.y-p.y);if(length<1e-8){index++;continue}
 const step=Math.min(remaining,length),next={x:p.x+(to.x-p.x)*step/length,y:p.y+(to.y-p.y)*step/length};
 if(!N.segmentClear(g,p,next))return {position:p,index,walked,direction,blocked:true};
 direction={x:(to.x-p.x)/length,y:(to.y-p.y)/length};p=next;walked+=step;remaining-=step;if(step>=length-1e-8)index++;
 }
 return {position:p,index,walked,direction,done:index>=points.length};
 }
 return {points,travel};
});
