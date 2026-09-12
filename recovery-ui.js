// Voluntary provider seam. Replace the debug adapter with an opt-in rewarded SDK later.
window.ShopRecovery=(()=>{
const Model=ShopRecoveryModel,config=ShopDesign.recovery;
state.recovery=Model.normalize(state.recovery);
const provider={id:'debug',begin(){return Model.begin(state,products,config)},finish(id,completed){return Model.finish(state,products,config,id,completed)}};
function lifeline(){return state.level===1&&!Object.entries(state.stock).some(([k,q])=>q>0&&Model.usable(k,state,products))&&!incomingOrders().length}
function renderSupport(){
 const resources=Model.resources(state,products),critical=resources<config.target;
 const restartReady=lifeline()&&state.money>=products.comet.buy;$('emergencyHint').hidden=!critical&&!restartReady;$('emergencyHint').textContent=restartReady?'Ya puedes volver a empezar · comprar 1 Cometa':'Apoyo de emergencia · +'+config.coinAmount+' moneda cada '+config.coinInterval+' s';
 $('recoveryInfo').textContent=critical?'Recuperación activa: +'+config.coinAmount+' moneda cada '+config.coinInterval+' segundos con la tienda abierta, hasta poder comprar un Cometa. Próxima moneda en '+Math.ceil(Math.max(0,config.coinInterval-state.recovery.progress))+' s.':'La ayuda automática se detiene cuando ya tienes dinero, mercancía utilizable o entregas suficientes para volver a vender.';
 const q=Model.rewardQuote(state,products,config);$('rewardInfo').textContent='Hasta '+config.reward+' monedas · máximo '+config.rewardLimit+' por hora activa · espera de '+config.rewardCooldown/60+' min. '+q.reason;
 $('rewardStart').textContent='Ver anuncio (simulación) · +'+(q.amount||config.reward)+' monedas';$('rewardStart').disabled=!q.amount;$('rewardDebug').hidden=!state.recovery.pending;
 $('lifelineOrder').textContent='Comprar 1 Cometa · '+products.comet.buy+' monedas';$('lifelineOrder').hidden=state.level>1||!lifeline();$('lifelineOrder').disabled=!!orderReason('comet',1,'local');
}
$('rewardStart').onclick=()=>{provider.begin();saveGame(false);renderSupport()};
function finish(completed){const id=state.recovery.pending?.id;if(id==null)return;const amount=provider.finish(id,completed);render();saveGame(false);renderSupport();if(amount)log('Simulación completada: +'+amount+' monedas.','good')}
$('rewardComplete').onclick=()=>finish(true);$('rewardCancel').onclick=()=>finish(false);
$('panel').addEventListener('close',()=>finish(false));
$('lifelineOrder').onclick=()=>{state.supplier='local';order('comet',1);renderSupport()};
window.addEventListener('statechange',renderSupport);
let displayElapsed=0;
return {lifeline,provider,render:renderSupport,tick(dt){const amount=Model.tick(state,products,config,dt);displayElapsed+=dt;if(amount){render();saveGame(false)}else if(displayElapsed>=1){displayElapsed=0;renderSupport()}}};
})();
ShopRecovery.render();
