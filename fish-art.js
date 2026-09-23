// A replaceable species renderer: decoration only, never stock or simulation rules.
window.ShopFish=(()=>{
const catalog={
betta:{body:'#b45279',fin:'#da7d9e',size:1.12,shape:'betta'},
comet:{body:'#efad44',fin:'#f5ce7b',size:1.08,shape:'comet'},
guppy:{body:'#e5b268',fin:'#438cab',size:.78,shape:'fan'},
platy:{body:'#ed8251',fin:'#ca543a',size:.85,shape:'round'},
neon:{body:'#3d7095',fin:'#80cfce',size:.61,shape:'stripe'},
molly:{body:'#414951',fin:'#66777b',size:.96,shape:'sail'},
cory:{body:'#d6c396',fin:'#a39474',size:.79,shape:'bottom'},
ancistrus:{body:'#6f6e52',fin:'#99936b',size:.96,shape:'sucker'},
discus:{body:'#da9152',fin:'#e4b477',size:1.15,shape:'disc'}
};
const groups={betta:['betta'],comet:['comet'],tank3:['guppy','platy'],tank4:['betta','comet'],tank5:['guppy','platy'],battery:['neon','molly','cory','ancistrus'],professional:['discus']};
function fish(key){
 const s=catalog[key],tail=s.shape==='betta'?'M-8 0Q-37-26-29-5Q-40 12-24 18L-8 5':s.shape==='comet'?'M-9 0L-32-18L-23 1L-31 18L-8 5':s.shape==='fan'?'M-8 0L-27-15Q-32 0-27 15L-8 5':'M-9 0L-21-9L-21 9Z';
 const body=s.shape==='disc'?'<ellipse rx="11" ry="14"/>':s.shape==='round'?'<ellipse rx="13" ry="9"/>':'<ellipse rx="14" ry="7"/>';
 let detail='';
 if(s.shape==='stripe')detail='<path d="M-11-2H10" stroke="#6ee9ff" stroke-width="3"/><path d="M-10 3H2" stroke="#ef665a" stroke-width="3"/>';
 if(['fan','bottom','sucker','round'].includes(s.shape))detail+=[-6,0,5].map((x,i)=>'<circle cx="'+x+'" cy="'+(i%2?3:-2)+'" r="'+(s.shape==='round'?2.4:1.6)+'" fill="'+(s.shape==='sucker'?'#d0bf7f':'#655943')+'"/>').join('');
 if(s.shape==='bottom'||s.shape==='sucker')detail+='<path d="M12 3L19 7M12 3L20 1" fill="none" stroke="#7a7458" stroke-width="1.5"/>';
 if(s.shape==='betta')detail+='<path d="M-6 6Q-17 23 4 14L10 5M-6-6Q-12-22 8-11L11-5" fill="'+s.fin+'" opacity=".85"/>';
 if(s.shape==='disc')detail+='<path d="M-5-11L-3 12M2-12L4 11M7-8L9 6" stroke="#7d9e9d" stroke-width="2"/>';
 return '<g fill="'+s.body+'"><path d="'+tail+'" fill="'+s.fin+'"/>'+body+'<path d="M-7-5L0-'+(s.shape==='sail'?20:13)+'L9-5" fill="'+s.fin+'"/>'+detail+'<circle cx="9" cy="-2" r="1.6" fill="#243e46"/><circle cx="9.5" cy="-2.5" r=".5" fill="#fff4d7"/></g>';
}
function paint(node,kind,stock){
 const layers=[...node.querySelectorAll('.fish-swim')],keys=(groups[kind]||[]).filter(k=>stock[k]>0),signature=keys.join(',');
 if(node.dataset.fishStock===signature)return;node.dataset.fishStock=signature;
 layers.forEach((layer,index)=>{
 const species=layers.length>1?keys.filter((_,i)=>i%layers.length===index):keys;
 const samples=species.flatMap(k=>Array.from({length:k==='neon'?4:species.length===1&&k!=='betta'&&k!=='ancistrus'?2:1},(_,i)=>({key:k,index:i})));
 layer.innerHTML=samples.map(({key,index:i},n)=>{
 const s=catalog[key],bottom=['cory','ancistrus'].includes(key),x=bottom?10+n*13:species.length===1&&key==='neon'?4+i*13:10+(n%3)*19,y=bottom?83+n*7:59+(n%3)*12+(Math.floor(n/3)*8);
 return '<g transform="translate('+x+' '+y+') scale('+s.size+')"><g class="species-fish '+(bottom?'bottom-fish':key==='betta'?'betta-fish':'cruising-fish')+'" data-species="'+key+'" style="animation-delay:-'+(n*.8)+'s">'+fish(key)+'</g></g>';
 }).join('');
 });
}
function bag(key){
 const s=catalog[key]||catalog.comet,k=catalog[key]?key:'comet';
 return '<path d="M3-7H13L10-1Q25 12 16 25H0Q-7 12 6-1Z" fill="#e0f5ed" fill-opacity=".88" stroke="#669c9d" stroke-width="1.5"/>'+
   '<path d="M-1 10Q8 8 19 11L16 24H0Z" fill="#77ced4" opacity=".8"/>'+
   '<g class="bag-fish" data-species="'+k+'" transform="translate(8 16) scale(0.48)">'+fish(k)+'</g>'+
   '<circle cx="14" cy="12" r="0.9" fill="#ffffff" opacity=".7"/>'+
   '<circle cx="4" cy="15" r="0.6" fill="#ffffff" opacity=".6"/>'+
   '<path d="M3-4H13" stroke="#64988c" stroke-width="2"/>';
}
return {catalog,groups,fish,paint,bag};
})();
