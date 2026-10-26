(function(root){
  'use strict';
  const grid={cols:24,rows:18};
  const same=(a,b)=>a.x===b.x&&a.y===b.y;
  function placeFood(snake,rng){
    const free=[];
    for(let x=0;x<grid.cols;x++)for(let y=0;y<grid.rows;y++)if(!snake.some(p=>p.x===x&&p.y===y))free.push({x,y});
    return free.length?free[Math.floor(rng()*free.length)]:null;
  }
  function create(rng=Math.random){
    const snake=[{x:6,y:9},{x:5,y:9},{x:4,y:9}];
    return {snake,dir:{x:1,y:0},queue:[],food:placeFood(snake,rng),score:0,alive:true};
  }
  // Queue up to two turns so quick double-taps are not lost; a reversal onto the neck is ignored.
  function turn(state,dir){
    const last=state.queue[state.queue.length-1]||state.dir;
    if(state.queue.length<2&&!(dir.x===-last.x&&dir.y===-last.y)&&!same(dir,last))state.queue.push(dir);
  }
  function tick(state,rng=Math.random){
    if(!state.alive)return state;
    const dir=state.queue.length?state.queue[0]:state.dir,head={x:state.snake[0].x+dir.x,y:state.snake[0].y+dir.y};
    const eats=state.food&&same(head,state.food),body=eats?state.snake:state.snake.slice(0,-1);
    const next={...state,dir,queue:state.queue.slice(1)};
    if(head.x<0||head.y<0||head.x>=grid.cols||head.y>=grid.rows||body.some(p=>same(p,head)))return {...next,alive:false};
    next.snake=[head,...body];
    if(eats){next.score=state.score+1;next.food=placeFood(next.snake,rng);if(!next.food)next.alive=false;}
    return next;
  }
  // Starts at 7 moves a second and gets faster with every bite, capped at 16.
  const interval=score=>1000/Math.min(7+score*.35,16);
  const api={grid,create,turn,tick,interval};if(typeof module!=='undefined')module.exports=api;else root.SnakeCore=api;
})(typeof window==='undefined'?globalThis:window);
