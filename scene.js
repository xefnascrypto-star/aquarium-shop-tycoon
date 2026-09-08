// Lightweight vector scenery: no downloads, build step or external assets.
const world = document.getElementById('world');
const poly=(points,fill,extra='')=>`<polygon points="${points}" fill="${fill}" ${extra}/>`;
function box(x,y,w,d,h,top='#d9ae79',front='#bd8c59',side='#a37349'){
 return `<g transform="translate(${x} ${y})">${poly(`0,0 ${w},${w*.5} ${w-d},${(w+d)*.5} ${-d},${d*.5}`,top)}${poly(`${-d},${d*.5} ${w-d},${(w+d)*.5} ${w-d},${(w+d)*.5+h} ${-d},${d*.5+h}`,front)}${poly(`${w},${w*.5} ${w-d},${(w+d)*.5} ${w-d},${(w+d)*.5+h} ${w},${w*.5+h}`,side)}</g>`;
}
const hit=(id,label,body)=>`<g role="button" tabindex="0" data-object="${id}" aria-label="${label}">${body}</g>`;
function plant(x,y,s=1){return `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cy="8" rx="24" ry="12" fill="#658a6633"/><path d="M-17-12H17L12 12Q0 22-12 12Z" fill="#c48962"/><ellipse cy="-12" rx="17" ry="8" fill="#edba8a"/><path d="M0-12V-60M0-35Q-40-70-22-77Q5-73 0-35M0-24Q35-58 23-64Q0-64 0-24M0-48Q-20-90-4-89Q12-76 0-48" stroke="#42846a" stroke-width="5" fill="#66a57e" stroke-linecap="round"/></g>`}
function fish(x,y,c){return `<g transform="translate(${x} ${y})"><path d="M-9 0L-20-9V9Z" fill="${c}"/><ellipse rx="13" ry="7" fill="${c}"/><circle cx="7" cy="-1" r="1.7" fill="#245366"/><path d="M-4-5L0-13L7-4" fill="${c}"/></g>`}
function tank(id,x,y,name,color){return hit(id,name,`<g transform="translate(${x} ${y})">${box(0,71,126,58,48)}${box(0,0,126,58,72,'#a9f1e8','url(#water)','#5bbbc1')}<path d="M0 61L126 124L68 153L-58 90" fill="none" stroke="#e2c99b" stroke-width="12"/><path d="M12 58Q7 20 20 29Q28 40 20 65M99 107Q90 59 104 70Q116 93 110 112" fill="none" stroke="#3d9173" stroke-width="6"/><g class="fish-swim">${fish(36,43,color)}${fish(77,83,color)}</g><g class="bubbles" fill="none" stroke="#d4fff1" stroke-width="2"><circle cx="102" cy="64" r="4"/><circle cx="106" cy="49" r="2"/></g><path d="M8 8L8 48M16 13L16 38M-48 31L-48 65" stroke="#e4fff2" opacity=".55" stroke-width="3"/><path d="M-58 0V-1L0-30L126 33V41L0-22L-58 7Z" fill="#517b70" transform="translate(0 29)"/><path d="M0 3L126 66" stroke="#defff5" stroke-width="3"/><g transform="translate(28 115) skewY(26.565)"><rect width="66" height="18" rx="4" fill="#f8efd7"/><text x="33" y="13" text-anchor="middle" font-size="10" fill="#647567">${name}</text></g></g>`)}
function person(color,skin='#edbc91',hair='#625047'){return `<ellipse cy="3" rx="19" ry="9" fill="#52776325"/><path d="M-8-19L-9-2M8-19L9-2" stroke="#485965" stroke-width="8" stroke-linecap="round"/><path d="M-15-42Q0-53 15-42L12-17Q0-10-12-17Z" fill="${color}"/><path d="M-14-39L-19-24M14-39L19-24" stroke="${skin}" stroke-width="7" stroke-linecap="round"/><rect x="-5" y="-53" width="10" height="12" rx="3" fill="${skin}"/><ellipse cy="-64" rx="14" ry="17" fill="${skin}"/><path d="M-14-60Q-22-87 0-86Q20-85 14-64L7-74Q-10-68-14-60" fill="${hair}"/><circle cx="6" cy="-63" r="1.5" fill="#4c4e4a"/>`}
world.innerHTML=`<ellipse cx="499" cy="460" rx="344" ry="158" fill="#91b6a0" opacity=".17"/>
<g filter="url(#shadow)">
${poly('140,365 500,185 860,365 860,383 500,563 140,383','#b6bd99')}
${poly('140,365 500,185 860,365 500,545','#f0e2c3')}
<path d="M140 365V383L500 563V545Z" fill="#cbb997"/><path d="M500 545L860 365V383L500 563Z" fill="#c2ad89"/>
<path d="M140 383L500 563L860 383V391L500 571L140 391Z" fill="#89a88c"/>
<g transform="matrix(1 .5 -1 .5 500 185)"><rect width="360" height="360" fill="url(#tiles)"/></g>
${poly('140,365 140,178 500,-2 500,185','url(#wall)')}
${poly('500,-2 860,178 860,365 500,185','#c8dac2')}
<path d="M140 178L500-2L860 178" fill="none" stroke="#83a792" stroke-width="12" stroke-linejoin="round"/>
<path d="M140 350L500 170L860 350" fill="none" stroke="#92b19a" stroke-width="12"/>
<g transform="translate(285 132) skewY(-26.565)"><rect width="158" height="57" rx="6" fill="#f8efd5" stroke="#d5c69e" stroke-width="4"/><text x="79" y="25" text-anchor="middle" font-size="17" letter-spacing="2" fill="#427d6d">AQUARIUM</text><text x="79" y="42" text-anchor="middle" font-size="9" letter-spacing="4" fill="#7b9780">SHOP TYCOON</text></g>
${hit('door','Puerta · información de clientes',`<g transform="translate(735 171) skewY(26.565)"><rect x="-5" y="-5" width="83" height="159" rx="3" fill="#719987"/><rect width="73" height="150" rx="2" fill="#4f8175"/><rect x="8" y="9" width="57" height="91" fill="#b9dcd3"/><path d="M14 16L57 72M14 35L39 68" stroke="#e3f4df" stroke-width="7" opacity=".6"/><rect x="17" y="61" width="42" height="20" rx="3" fill="#fff1cb"/><text x="38" y="74" text-anchor="middle" font-size="8" fill="#628574">ABIERTO</text><circle cx="61" cy="116" r="4" fill="#ecd292"/></g>`)}
<g transform="translate(565 88) skewY(26.565)"><rect width="70" height="65" rx="5" fill="#f2eccd" stroke="#9eb59a" stroke-width="5"/><path d="M8 43Q35 3 60 43Q38 70 8 43" fill="#87bfa6"/><circle cx="45" cy="36" r="3" fill="#477e6d"/></g>
<g id="gridLayer" style="display:none"></g><g id="furnitureLayer"></g><g id="visitors"></g><g id="placementLayer" pointer-events="none"></g>
</g><g id="saleEffect"></g>`;
