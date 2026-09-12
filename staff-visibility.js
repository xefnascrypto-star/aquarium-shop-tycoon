// Active staff remain readable behind tall furniture without changing floor collisions or depth.
window.ShopStaffVisibility=(()=>{
const boxes=new WeakMap();
function update(items,workers){
 const furniture=items.filter(i=>i.node.dataset.instance);
 for(const i of furniture)i.node.classList.remove('staff-occluder');
 for(const w of workers){if(!w.job&&!w.restock)continue;const at=items.findIndex(i=>i.node===w.node),p=ShopLayout.project(state.layout.rooms[0],w.position.x,w.position.y);
  for(let j=at+1;j<items.length;j++){const item=items[j];if(!item.node.dataset.instance)continue;
   let b=boxes.get(item.node);if(!b){const local=item.node.getBBox(),o=state.layout.objects.find(o=>o.id===item.node.dataset.instance),origin=ShopLayout.project(state.layout.rooms[0],o.x,o.y);b={x:origin.x+local.x,y:origin.y+local.y,width:local.width,height:local.height};boxes.set(item.node,b)}
   if(p.x+20>b.x&&p.x-20<b.x+b.width&&p.y-25>b.y&&p.y-100<b.y+b.height)item.node.classList.add('staff-occluder');
  }
 }
}
return {update};
})();
