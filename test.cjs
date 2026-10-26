const assert=require('node:assert/strict'),c=require('./game-core.js');
const start={x:540,y:520};let total=0;
for(let x=140;x<=900;x+=10)for(let y=200;y<=630;y+=10){if(!c.walkable(x,y))continue;const route=c.path(start,{x,y});assert(route.length,`unreachable ${x},${y}`);let prev=start;for(const p of route){assert(c.clear(prev,p),`crosses obstacle ${x},${y}`);prev=p;}total++;}
for(const [x,y,face] of [[0,1,'down'],[0,-1,'up'],[-1,0,'left'],[1,0,'right'],[1,1,'down-right'],[-1,1,'down-left'],[1,-1,'up-right'],[-1,-1,'up-left']]){assert.equal(c.facing(x,y),face);assert.equal(c.facing(0,0,face),face);const next=c.move(start,x*4,y*4);assert.equal(Math.sign(next.x-start.x),x);assert.equal(Math.sign(next.y-start.y),y);}
for(const obj of c.objects){assert(!c.walkable(obj.x+obj.w/2,obj.y+obj.h/2));assert.equal(obj.y+obj.h,obj.base);assert(obj.x>=c.bounds.left&&obj.x+obj.w<=c.bounds.right&&obj.y>=c.bounds.top&&obj.base<=c.bounds.bottom);}
for(const p of Object.values(c.hotspots))assert(c.path(start,p).length);
for(const p of [{x:180,y:290},{x:450,y:290},{x:315,y:400},{x:380,y:380}]){
  assert(c.walkable(p.x,p.y),'interaction approach must be on open floor');
  assert.equal(c.nearest(p),'projects');
  assert(c.interactionDistance(p,'projects')<65,'desk must work from either side and chair');
  assert(c.path(p,c.seat.approach).length,'chair must be reachable from every desk approach');
}
assert(c.walkable(c.seat.approach.x,c.seat.approach.y),'standing up must return to open floor');
assert(!c.walkable(c.seat.position.x,c.seat.position.y),'seating is an explicit pose on the chair');
const chair=c.objects.find(o=>o.id==='chair');
assert(c.seat.approach.x>chair.x+chair.w+c.radius,'approach is beside the chair, never behind its backrest');
assert.equal(c.seat.approach.y,c.seat.position.y,'entry and exit travel sideways, not through the rear backrest');
assert(c.interactionDistance(start,'projects')>65,'Projects must not activate from across the room');
assert(c.path(start,c.bedSeat.approach).length,'bed must be reachable');
assert(c.walkable(c.bedSeat.approach.x,c.bedSeat.approach.y),'bed exit is open floor');
assert(!c.walkable(c.bedSeat.position.x,c.bedSeat.position.y),'bed seating explicitly enters the mattress');
assert.equal(c.nearest(c.bedSeat.approach),'bed');
// Subpixel clicks close to furniture must not round into blocked grid cells.
let precise=0;
for(let i=0;i<300;i++){
  const end={x:136+(i*137.371)%768,y:201+(i*83.129)%433};if(!c.walkable(end.x,end.y))continue;
  precise++;const route=c.path(start,end);assert(route.length,`unreachable precise click ${JSON.stringify(end)}`);
  let previous=start;for(const next of route){assert(c.clear(previous,next));previous=next;}
  assert(c.path(end,c.seat.approach).length,'chair reachable from a precise floor position');
}
let p=start;for(let i=0;i<1000;i++){p=c.move(p,3,2);assert(c.walkable(p.x,p.y));}
console.log(`PASS: ${total} reachable floor samples + ${precise} subpixel samples; obstacle-safe smoothed paths; exact 8 screen directions; idle facing; consistent object baselines; every hotspot; bounds/collision.`);
for(const key of ['snake','hoops']){const spot=c.hotspots[key];assert(c.walkable(spot.x,spot.y),`${key} hotspot on open floor`);assert.equal(c.nearest(spot),key);assert(c.interactionDistance(spot,key)<65);}
for(const key of ['lamp','night'])assert.equal(c.nearest(c.hotspots[key]),key,`${key} answers to E from its spot`);
assert.equal(c.nearest(c.seat.approach),'projects','the chair still opens Projects, not the lamp');
for(const key of ['flowers']){const spot=c.hotspots[key];assert(c.walkable(spot.x,spot.y),`${key} hotspot on open floor`);assert.equal(c.nearest(spot),key,`E from the ${key} spot reaches the ${key}`);assert(c.interactionDistance(spot,key)<65);assert(c.path(start,spot).length,`${key} is reachable`);}
assert.deepEqual(c.hotspots.projects,{x:380,y:355});assert.deepEqual(c.hotspots.bed,{x:380,y:520});assert.equal(c.nearest(c.bedSeat.approach),'bed','flowers do not steal the bed');
const hoop=require('./hoop-core.js'),H=hoop.court;
function shot(x,angle,power){let ball=hoop.launch({x},angle,power);for(let i=0;i<5000&&!ball.done;i++){ball=hoop.step(ball,H.dt);assert(Number.isFinite(ball.x)&&Number.isFinite(ball.y));}assert(ball.done,'every shot finishes');return ball;}
for(const x of [70,200,300,400]){
  let made=0,total=0;for(let a=15;a<=85;a+=2)for(let p=250;p<=1000;p+=10){total++;if(shot(x,a,p).made)made++;}
  assert(made>0,`a basket is possible from ${x}`);assert(made/total<.1,`most aims miss from ${x} (${made}/${total})`);
}
let board=hoop.launch({x:560},0,0);board={...board,x:585,y:130,vx:400,vy:0};for(let i=0;i<20;i++)board=hoop.step(board,H.dt);assert(board.vx<0,'backboard bounces the ball back');
let rim={...hoop.launch({x:300},50,600),x:H.rimFront,y:H.hoopY-H.radius-H.rimPoint+1,vx:0,vy:100};rim=hoop.step(rim,H.dt);assert(rim.touched&&rim.vy<0,'rim is solid');
assert(!hoop.step({...hoop.launch({x:300},50,600),x:566,y:H.hoopY+1,vy:-300},H.dt).made,'upward crossing never scores');
assert.throws(()=>hoop.launch({x:NaN},50,500),TypeError);assert.throws(()=>hoop.step(hoop.launch({x:200},50,500),1),RangeError);
assert.equal(hoop.points({x:100}),3);assert.equal(hoop.points({x:350}),2);
assert.equal(hoop.hoopY(5,9),H.hoopY,'hoop is still below 10 points');assert.notEqual(hoop.hoopY(1,20),H.hoopY,'hoop moves from 10 points');
assert(hoop.drag(45,-64).angle>50&&hoop.drag(45,-64).angle<60);assert.equal(hoop.drag(500,-500).power,1000);
console.log('PASS: hoops: baskets possible but <10% of aims score from every spot, solid rim and backboard, downward-only scoring, 2/3 points, moving hoop, finite input.');
const snake=require('./snake-core.js');let seq=0;const rng=()=>(seq++*0.618)%1;
let g=snake.create(rng);assert(!g.snake.some(p=>p.x===g.food.x&&p.y===g.food.y),'food never spawns on the snake');
g={...g,food:{x:7,y:9}};g=snake.tick(g,rng);assert.equal(g.snake.length,4);assert.equal(g.score,1);assert(g.food&&!g.snake.some(p=>p.x===g.food.x&&p.y===g.food.y));
snake.turn(g,{x:-1,y:0});assert.equal(g.queue.length,0,'reversing onto the neck is ignored');
snake.turn(g,{x:0,y:1});snake.turn(g,{x:-1,y:0});snake.turn(g,{x:0,y:-1});assert.equal(g.queue.length,2,'at most two queued turns');
let wall=snake.create(rng);wall={...wall,food:null};for(let i=0;i<30&&wall.alive;i++)wall=snake.tick(wall,rng);assert(!wall.alive,'hitting the wall ends the game');
let loop={snake:[{x:5,y:5},{x:5,y:6},{x:6,y:6},{x:6,y:5},{x:6,y:4}],dir:{x:0,y:-1},queue:[{x:1,y:0}],food:null,score:0,alive:true};assert(!snake.tick(loop,rng).alive,'running into your body ends the game');
let tail={snake:[{x:5,y:5},{x:5,y:6},{x:6,y:6},{x:6,y:5}],dir:{x:0,y:-1},queue:[{x:1,y:0}],food:{x:0,y:0},score:0,alive:true};assert(snake.tick(tail,rng).alive,'moving into the cell the tail leaves is allowed');
assert(snake.interval(0)>snake.interval(10)&&snake.interval(100)===1000/16,'speeds up, capped');
console.log('PASS: snake: eating grows and respawns food off the body, no reversal, turn queue, wall and self collision, tail chase, speed curve.');
const term=require('./terminal-core.js');global.window={};require('./content.js');const P=window.PORTFOLIO,text=r=>r.lines.map(l=>l.text).join('\n');
const help=text(term.run('help',P));for(const c of ['whoami','ls','cat','open','contact','cv','date','clear','exit'])assert(help.includes(c),`help lists ${c}`);
assert.equal(text(term.run('rm -rf /',P)),'command not found: rm. Try help');
const opened=term.run('open lora',P);assert.equal(opened.open,P.projects.find(p=>p.name==='lora-workflow').url,'open matches a project by name prefix');
assert(!term.run('open zzz',P).open&&!term.run('open',P).open,'open needs exactly one match');
const evil=term.run('<script>alert(1)</script>',P);assert(evil.lines.every(l=>!l.href&&Object.keys(l).join()==='text'),'typed input only ever comes back as plain text for textContent');
assert(text(evil).startsWith('command not found: <script>'),'unknown command echoes the raw text, escaping is the renderer’s job');
assert.equal(term.run('sudo hire mateo',P).secret,'hire');assert(!term.run('sudo rm',P).secret);
assert(term.run('clear',P).clear&&term.run('exit',P).exit&&!term.run('',P).lines.length);
assert(text(term.run('ls projects',P)).includes('order-processing-system'));
{const T=require('./terminal-core.js'),d={name:'Mateo',location:'Osijek',intro:'',about:'',email:'a@b.co',github:'https://github.com/x',cv:'cv.pdf',projects:[]},txt=r=>r.lines.map(l=>l.text).join(' ');assert(/ls -a/.test(txt(T.run('help',d))),'help hints ls -a');assert(/\.hire_me/.test(txt(T.run('ls -a',d))),'ls -a shows the hidden file');assert(/sudo hire mateo/.test(txt(T.run('cat .hire_me',d))),'hidden file names the command');assert(!/\.hire_me/.test(txt(T.run('ls',d))),'plain ls keeps it hidden');}
console.log('PASS: terminal: help lists commands, unknown command message, open by project prefix, plain-text output for hostile input, sudo hire secret, clear/exit.');
