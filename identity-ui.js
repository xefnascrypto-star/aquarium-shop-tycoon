// Start gate: no game clock, arrivals or autosave before a new identity is confirmed.
(()=>{
const B=ShopIdentity,T=ShopI18n,t=(key,params)=>T.t(key,params);
function apply(){
 const v=B.set(state.identity||B.current);document.documentElement.style.setProperty('--shop-color',B.colors[v.color]);
 document.querySelector('.brand .logo').innerHTML=B.mark(v);
 document.querySelector('.brand > span:last-child').textContent=v.name;
 document.querySelector('.heading h1').textContent=v.name;
 const sign=document.getElementById('shopSign');
 sign.innerHTML='<rect width="186" height="65" rx="7" fill="#fff1d6" stroke="'+B.colors[v.color]+'" stroke-width="4"/><g transform="translate(5 10)"><svg width="45" height="45" viewBox="0 0 64 64">'+B.mark(v).replace(/^<svg[^>]*>|<\/svg>$/g,'')+'</svg></g><text x="115" y="29" text-anchor="middle" font-size="'+(v.name.length>18?9:12)+'" font-weight="bold" fill="'+B.colors[v.color]+'">'+B.escape(v.name)+'</text><text x="115" y="46" text-anchor="middle" font-size="7" fill="#617e68">'+B.escape(t('tagline'))+'</text>';
 const signName=sign.querySelector('text');if(signName.getComputedTextLength()>122){signName.setAttribute('textLength','122');signName.setAttribute('lengthAdjust','spacingAndGlyphs')}
 document.querySelector('[data-shop-open]').textContent=t('open');
 document.querySelectorAll('.brand-badge').forEach(node=>node.innerHTML=B.mark(v).replace(/^<svg[^>]*>|<\/svg>$/g,''));
 const customize=document.getElementById('customizeShop');if(customize)customize.textContent=t('customize');
 const info=document.getElementById('identityInfo');if(info){info.innerHTML=B.mark(v)+'<b></b><p></p>';info.querySelector('b').textContent=v.name;info.querySelector('p').textContent=t('identityHelp')}
}
window.addEventListener('statechange',apply);window.addEventListener('layoutchange',apply);
const section=document.createElement('section');section.id='identityInfo';section.className='identity-info';document.querySelector('[data-section="settings"]').prepend(section);
const customize=document.createElement('button');customize.id='customizeShop';customize.className='secondary';section.after(customize);customize.onclick=()=>{panel.close();openCreation(true)};
if(state.identity)apply();else openCreation(false);
function openCreation(editing){
B.editing=true;
let draft=B.normalize(editing?state.identity:undefined);const dialog=document.createElement('dialog');dialog.id='shopCreation';dialog.setAttribute('aria-labelledby','creationTitle');document.body.append(dialog);
function preview(){draft.name=dialog.querySelector('#shopName').value;dialog.querySelector('#brandPreview').innerHTML=B.mark(draft)+'<div><b></b><small></small></div>';dialog.querySelector('#brandPreview b').textContent=draft.name||t('defaultName');dialog.querySelector('#brandPreview small').textContent=t('tagline')}
function form(){
 dialog.innerHTML='<form id="identityForm"><div class="creation-top"><span>AQUARIUM SHOP TYCOON · v0.9</span><label>'+t('language')+' <select id="identityLanguage"><option value="es">Español</option><option value="en">English</option></select></label></div><h1 id="creationTitle">'+t(editing?'identity':'welcome')+'</h1><p>'+t(editing?'identityHelp':'intro')+'</p><div id="brandPreview" class="brand-preview" role="img" aria-label="'+t('preview')+'"></div><label for="shopName">'+t('name')+'</label><input id="shopName" name="shopName" maxlength="28" required autocomplete="off" aria-describedby="nameHelp"><small id="nameHelp">'+t('nameHelp')+'</small><fieldset><legend>'+t('color')+'</legend><div class="brand-options">'+Object.entries(B.colors).map(([key,color])=>'<button type="button" data-color="'+key+'" class="color-choice" style="--swatch:'+color+'" aria-label="'+t(key)+'" aria-pressed="'+(draft.color===key)+'"><span></span>'+t(key)+'</button>').join('')+'</div></fieldset><fieldset><legend>'+t('symbol')+'</legend><div class="brand-options">'+B.icons.map(icon=>'<button type="button" data-icon="'+icon+'" aria-pressed="'+(draft.icon===icon)+'">'+B.mark({...draft,icon})+'<span>'+t(icon)+'</span></button>').join('')+'</div></fieldset><fieldset><legend>'+t('shape')+'</legend><div class="brand-options shapes">'+B.shapes.map(shape=>'<button type="button" data-shape="'+shape+'" aria-pressed="'+(draft.shape===shape)+'">'+t(shape)+'</button>').join('')+'</div></fieldset><p class="creation-note">'+t('saved')+'</p><button class="start-shop" type="submit">'+t(editing?'saveIdentity':'start')+' →</button>'+(editing?'<button type="button" id="cancelIdentity" class="secondary">'+t('back')+'</button>':'')+'<small class="language-note">'+t('languageHelp')+'</small></form>';
 dialog.querySelector('#shopName').value=draft.name;dialog.querySelector('#identityLanguage').value=T.locale;
 dialog.querySelector('#shopName').oninput=preview;
 dialog.querySelector('#identityLanguage').onchange=e=>{draft.locale=e.target.value;T.set(draft.locale);form()};
 for(const type of ['color','icon','shape'])dialog.querySelectorAll('[data-'+type+']').forEach(button=>button.onclick=()=>{draft[type]=button.dataset[type];const focus=button.dataset[type];form();dialog.querySelector('[data-'+type+'="'+focus+'"]').focus()});
 if(editing)dialog.querySelector('#cancelIdentity').onclick=close;
 dialog.querySelector('form').onsubmit=e=>{e.preventDefault();const input=dialog.querySelector('#shopName');if(!input.value.trim()){input.setCustomValidity(t('nameRequired'));input.reportValidity();input.oninput=()=>{input.setCustomValidity('');preview()};return}
 state.identity=B.normalize({...draft,name:input.value,locale:T.locale});apply();saveGame(false);close();render();if(!editing)window.dispatchEvent(new Event('shopstarted'))};
 preview();
}
function close(){B.editing=false;dialog.close();dialog.remove();document.querySelector('.game').inert=false;if(state.identity)apply();document.getElementById('editStart').focus()}
form();document.querySelector('.game').inert=true;dialog.addEventListener('cancel',e=>{e.preventDefault();if(editing)close()});dialog.showModal();
}
})();
