// Accessible-object warnings use exactly the same grid as visitor movement.
function updateAccessibility(layout,preview=false){
 const report=ShopNavigation.assess(ShopNavigation.build(layout,state)),missing=report.filter(o=>!o.reachable);
 const alert=$('accessAlert');alert.hidden=!missing.length;alert.textContent=missing.length+' '+(missing.length===1?'zona sin acceso':'zonas sin acceso')+' · revisar';
 $('editAccess').textContent=missing.length?'Sin acceso: '+missing.map(o=>o.label).join(', ')+'. Puedes guardar, pero no habrá compras allí.':'✓ Los expositores y la caja tienen acceso.';
 $('editAccess').classList.toggle('access-warning',!!missing.length);
 const list=$('accessList');list.replaceChildren();
 for(const o of report){const li=document.createElement('li'),button=document.createElement('button');button.textContent=(o.reachable?'✓ ':'⚠ ')+o.label;button.onclick=()=>window.shopEditor.begin(o.id);li.append(button);if(!o.reachable){const p=document.createElement('small');p.textContent=o.reason;li.append(p)}list.append(li)}
 for(const node of world.querySelectorAll('[data-instance]'))node.classList.toggle('unreachable-object',missing.some(o=>o.id===node.dataset.instance));
 $('accessExplanation').textContent=missing.length?'Reorganiza los muebles y deja un pasillo libre hacia las caras de atención.':'La puerta está conectada con los expositores y la caja.';
 return report;
}
