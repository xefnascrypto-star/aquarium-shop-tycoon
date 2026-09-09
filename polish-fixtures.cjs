const M=require('./layout-model.js');
function make(changes={}){const l=M.create();for(const o of l.objects){if(['shelf','tank3'].includes(o.kind))o.placed=true;if(changes[o.id]){const [x,y,rotation=0]=changes[o.id];Object.assign(o,{x,y,rotation})}}return l}
const rows=make();
const rotated=make({'betta-1':[0,2,90],'comet-1':[4,2,90],'tank-3':[8,2,90],'counter-1':[6,9],'plant-2':[12,2],'warehouse-1':[12,6]});
const island=make({'betta-1':[1,3],'comet-1':[7,2,90],'tank-3':[2,8],'counter-1':[10,6,90],'shelf-1':[0,0],'plant-1':[12,0],'plant-2':[12,3],'plant-3':[0,11],'warehouse-1':[8,10]});
const blocked=make({'betta-1':[0,4],'comet-1':[5,4],'tank-3':[0,8],'counter-1':[6,8],'plant-2':[10,4],'warehouse-1':[12,4],'plant-3':[0,11]});
module.exports={rows,rotated,island,blocked};
