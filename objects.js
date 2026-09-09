// Art adapters retain the existing cozy SVG assets.
function furnitureArt(kind){
 if(['betta','comet','tank3','tank4','tank5','battery','professional'].includes(kind)){
const label={betta:'Bettas',comet:'Cometas',tank3:'Guppy · Platy',tank4:'Agua dulce',tank5:'Guppy · Platy',battery:'Agua Dulce I',professional:'Discos'}[kind];
return tank(kind,0,-119,label,kind==='comet'?'#ffcd73':kind==='betta'?'#ed927d':'#85ccdf')+(['battery','professional'].includes(kind)?'<g transform="translate(0 -74) scale(.85)">'+tank(kind,0,-119,'Cardumen','#a5e7df')+'</g>':'');
}
if(kind==='plants')return box(0,-30,100,70,30)+plant(0,-30,.8)+plant(40,-10,.7)+plant(0,0,.65);
 if(kind==='plant')return plant(0,0,.8);
 if(kind==='shelf'||kind==='shelf2')return hit('shelf','Estantería y comida','<g transform="translate(0 -90)">'+box(0,0,112,35,90,'#d9b77d','#bc9565','#a7845a')+'<path d="M4 30L108 82M4 60L108 112" stroke="#f5dca6" stroke-width="7"/><g class="shelf-goods">'+[0,1,2,3].map(i=>'<rect x="'+(12+i*23)+'" y="'+(10+i*11.5)+'" width="14" height="20" rx="3" fill="'+(i%2?'#e8b478':'#87b2a0')+'"/>').join('')+'</g><g class="shelf-extra" style="display:none">'+[0,1,2,3].map(i=>'<rect x="'+(12+i*23)+'" y="'+(45+i*11.5)+'" width="14" height="18" rx="3" fill="#e7c37e"/>').join('')+'</g></g>');
 if(kind==='warehouse')return hit('warehouse','Cajas del almacén',box(0,-32,39,33,32)+'<g class="warehouse-extra" style="display:none">'+box(0,-61,34,29,29)+'</g>'+(typeof state!=='undefined'&&state.warehouse2?box(0,-87,29,25,26):''));
 return hit('counter','Mostrador y actividad','<g transform="translate(55 -42)">'+person('#4d9985')+'<path d="M-9-37H9V-16H-9Z" fill="#f4e2bb"/></g>'+(typeof state!=='undefined'&&state.employee?'<g class="second-employee" transform="translate(110 -13)">'+person('#cfac75')+'</g>':'')+box(0,-58,157,66,58,'#e7c594','#bf9363','#ab8156')+'<g transform="translate(40 -47)"><path d="M0 0L26 13L13 20L-13 7Z" fill="#517568"/><path d="M-3 4V-17L19-6V15Z" fill="#375c54"/><path d="M0-12L15-5V5L0-2Z" fill="#b9ddbd"/></g><g class="counter-products" transform="translate(95 -23)"><rect x="0" y="0" width="12" height="19" rx="3" fill="#deb780"/><rect x="3" y="-3" width="6" height="5" rx="1" fill="#7a9578"/><rect x="19" y="9" width="10" height="18" rx="3" fill="#89b5a3"/><rect x="21" y="6" width="6" height="5" rx="1" fill="#517f73"/></g>');
}
function objectMarkup(o,layout){
 const room=layout.rooms.find(r=>r.id===o.roomId),p=ShopLayout.project(room,o.x,o.y),c=ShopLayout.catalog[o.kind];
 // Reflection exchanges the two floor axes without tilting vertical artwork.
 const mirror=o.rotation===90?'scale(-1 1)':'';
 const inset=o.kind==='plant'?'translate(0 30)':'translate(0 7)';
 return '<g data-instance="'+o.id+'" data-object="'+c.action+'" role="button" tabindex="0" aria-label="'+c.label+'" transform="translate('+p.x+' '+p.y+')"><g class="'+(o.rotation===90?'mirrored-art':'')+'" transform="'+mirror+' '+inset+'">'+furnitureArt(o.kind)+'</g></g>';
}
function drawFurniture(layout,gameState={}){
 const items=layout.objects.filter(o=>ShopLayout.owned(o,gameState)).sort((a,b)=>{const aa=ShopLayout.footprint(a),bb=ShopLayout.footprint(b);return (a.x+a.y+aa.width+aa.depth)-(b.x+b.y+bb.width+bb.depth)});
 document.getElementById('furnitureLayer').innerHTML=ShopDepth.sort(items.map(o=>({o,bounds:ShopLayout.footprint(o)}))).map(({o})=>objectMarkup(o,layout)).join('');
}
drawFurniture(ShopLayout.create());
