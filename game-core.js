(function(root){
  const bounds={left:120,right:920,top:185,bottom:650},radius=15;
  // Footprints are on the floor; painted object height extends above its baseline.
  const objects=[
    {id:'desk',x:200.2,y:258.5,w:229.6,h:61.5,base:320,section:'projects'},
    {id:'chair',x:282,y:311,w:66,h:59,base:370,section:'projects'},
    {id:'shelf',x:740,y:220,w:125,h:75,base:295,section:'about'},
    {id:'bed',x:175,y:455,w:170,h:95,base:550,section:'bed'},
    {id:'plant',x:825,y:382,w:54,h:40,base:422},
    {id:'letter',x:750,y:515,w:110,h:55,base:570,section:'contact'},
    {id:'flowers',x:176,y:598,w:50,h:30,base:628,section:'flowers'},
    {id:'tv',x:676,y:236,w:58,h:44,base:280,section:'snake'},
    {id:'hoop',x:130,y:396,w:40,h:24,base:420,section:'hoops'}
  ];
  // Wall and desk-top fixtures: interactable with E but not obstacles on the floor.
  const zones=[{id:'window',x:500,y:185,w:170,h:0,section:'night'},{id:'lamp',x:432,y:240,w:0,h:40,section:'lamp'}];
  const seat={approach:{x:380,y:355},position:{x:315,y:355}};
  const bedSeat={approach:{x:380,y:520},position:{x:340,y:520},facing:'right'};
  const hotspots={projects:seat.approach,about:{x:800,y:330},contact:{x:798,y:604},bed:bedSeat.approach,snake:{x:705,y:315},hoops:{x:192,y:404},flowers:{x:245,y:612},night:{x:585,y:215},lamp:{x:452,y:250}};
  const inside=(x,y)=>x>=bounds.left+radius&&x<=bounds.right-radius&&y>=bounds.top+radius&&y<=bounds.bottom-radius;
  const walkable=(x,y)=>inside(x,y)&&!objects.some(o=>x>o.x-radius&&x<o.x+o.w+radius&&y>o.y-radius&&y<o.y+o.h+radius);
  const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  const move=(p,dx,dy)=>walkable(p.x+dx,p.y+dy)?{x:p.x+dx,y:p.y+dy}:walkable(p.x+dx,p.y)?{x:p.x+dx,y:p.y}:walkable(p.x,p.y+dy)?{x:p.x,y:p.y+dy}:p;
  // Measure from the furniture footprint, so either side of the same desk works.
  const interactionDistance=(p,section)=>Math.min(...objects.concat(zones).filter(o=>o.section===section).map(o=>Math.hypot(Math.max(o.x-p.x,0,p.x-o.x-o.w),Math.max(o.y-p.y,0,p.y-o.y-o.h))));
  const nearest=p=>Object.keys(hotspots).reduce((a,b)=>interactionDistance(p,a)<interactionDistance(p,b)?a:b);
  const clear=(a,b)=>{const n=Math.ceil(distance(a,b)/4);for(let i=0;i<=n;i++){const t=n?i/n:0;if(!walkable(a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t))return false;}return true;};
  function path(start,end){
    if(!walkable(end.x,end.y))return[];if(clear(start,end))return[end];
    const grid=10,key=(x,y)=>x+','+y;
    // A valid click beside furniture can round into its obstacle; connect to a clear nearby cell.
    function gridPoint(p){
      const candidates=[];
      for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++)candidates.push({x:Math.round(p.x/grid)+dx,y:Math.round(p.y/grid)+dy});
      return candidates.sort((a,b)=>distance(p,{x:a.x*grid,y:a.y*grid})-distance(p,{x:b.x*grid,y:b.y*grid})).find(q=>clear(p,{x:q.x*grid,y:q.y*grid}));
    }
    const s=gridPoint(start),t=gridPoint(end);if(!s||!t)return[];
    const queue=[s],seen=new Map([[key(s.x,s.y),null]]);let found;
    for(let i=0;i<queue.length;i++){const p=queue[i];if(p.x===t.x&&p.y===t.y){found=p;break;}for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const x=p.x+dx,y=p.y+dy,k=key(x,y);if(seen.has(k)||!walkable(x*grid,y*grid))continue;seen.set(k,p);queue.push({x,y});}}
    if(!found)return[];let result=[end];while(found){result.push({x:found.x*grid,y:found.y*grid});found=seen.get(key(found.x,found.y));}result.reverse();
    const smooth=[];let anchor=start,index=0;while(index<result.length){let next=index;while(next+1<result.length&&clear(anchor,result[next+1]))next++;if(!clear(anchor,result[next]))return[];smooth.push(result[next]);anchor=result[next];index=next+1;}return smooth;
  }
  // Screen-space directions, clockwise from down. Idle retains its previous facing.
  const facing=(dx,dy,previous='down')=>!dx&&!dy?previous:['right','down-right','down','down-left','left','up-left','up','up-right'][(Math.round(Math.atan2(dy,dx)/(Math.PI/4))+8)%8];
  const api={bounds,radius,objects,zones,hotspots,seat,bedSeat,inside,walkable,move,nearest,interactionDistance,distance,path,clear,facing};if(typeof module!=='undefined')module.exports=api;else root.RoomCore=api;
})(typeof window==='undefined'?globalThis:window);
