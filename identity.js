// Identity is a reusable value, separate from the shop layout and economy.
window.ShopIdentity=(()=>{
const colors={sage:'#427d6d',ocean:'#356c96',terracotta:'#a65d48',plum:'#815777',gold:'#906a25'},icons=['fish','betta','plant','coral','bubbles','wave','initials'],shapes=['circle','soft','plain'];
const clean=value=>String(value||'').replace(/[\u0000-\u001f\u007f]/g,'').trim().slice(0,28);
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function normalize(value){const v=value&&typeof value==='object'?value:{};return {version:1,name:clean(v.name)||ShopI18n.t('defaultName'),color:Object.hasOwn(colors,v.color)?v.color:'sage',icon:icons.includes(v.icon)?v.icon:'fish',shape:shapes.includes(v.shape)?v.shape:'circle',locale:v.locale==='en'?'en':'es'}}
let current=normalize();
function mark(identity=current){const v=normalize(identity),color=colors[v.color],ink=v.shape==='plain'?color:'#fff7e3';
const paths={fish:'<path d="M17 32Q29 13 46 31Q32 48 17 32L8 23V41Z"/><circle cx="38" cy="29" r="2" fill="'+color+'"/>',betta:'<path d="M29 31Q11 5 8 21Q1 35 13 47L29 36Q49 46 48 30Q42 21 29 31Z"/><path d="M30 28L30 16L44 27M31 38L26 50L42 40" opacity=".7"/>',plant:'<path d="M29 53V14M29 31Q8 29 12 15Q30 16 29 31M29 43Q48 41 48 26Q30 27 29 43" stroke="'+ink+'" stroke-width="4" stroke-linecap="round"/>',coral:'<path d="M30 52V16M30 38L15 29V15M30 29L44 22V11M15 25L8 20M44 21L52 16M30 45L45 38V31" fill="none" stroke="'+ink+'" stroke-width="5" stroke-linecap="round"/>',bubbles:'<circle cx="24" cy="39" r="12"/><circle cx="42" cy="21" r="8"/><circle cx="18" cy="13" r="4"/>',wave:'<path d="M8 36Q21 14 33 29Q44 40 54 24M8 47Q21 25 33 40Q44 51 54 35" fill="none" stroke="'+ink+'" stroke-width="5" stroke-linecap="round"/>',initials:'<text x="32" y="40" text-anchor="middle" font-size="23" font-weight="bold">'+escape(v.name.split(/\s+/u).slice(0,2).map(w=>Array.from(w)[0]).join('').toLocaleUpperCase(v.locale))+'</text>'};
const background=v.shape==='circle'?'<circle cx="32" cy="32" r="30" fill="'+color+'"/>':v.shape==='soft'?'<rect x="2" y="2" width="60" height="60" rx="15" fill="'+color+'"/>':'';
return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" aria-hidden="true">'+background+'<g fill="'+ink+'">'+paths[v.icon]+'</g></svg>'}
return {editing:false,colors,icons,shapes,normalize,escape,mark,get current(){return current},set(value){current=normalize(value);ShopI18n.set(current.locale);return current}};
})();
