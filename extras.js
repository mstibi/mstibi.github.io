(() => {
  'use strict';
  const dialog=document.getElementById('extras-dialog'),content=document.getElementById('extras-content'),kicker=document.getElementById('extras-kicker');
  let returnFocus=null,closeTimer,raf=0,lastTime=0;
  // Best scores are a per-visitor nicety; storage may be blocked, so every access is guarded.
  const best={get:key=>{try{return Number(localStorage.getItem('room-best-'+key))||0;}catch{return 0;}},set:(key,value)=>{try{localStorage.setItem('room-best-'+key,String(value));}catch{}}};
  // Secrets: found ids live in localStorage (guarded like best); the pill counts them, a toast names each new one.
  const SECRETS={lamp:'Let there be light',night:'Night owl',konami:'Cheat code',nap:'Power nap',hoops:'Nothing but net',snake:'Snake charmer',bug:'Bug hunter',terminal:'I’m in',hire:'Root access'};
  const TOTAL=Object.keys(SECRETS).length,pill=document.getElementById('secrets-count'),toast=document.getElementById('secret-toast');
  let found=[];try{found=JSON.parse(localStorage.getItem('room-secrets'))||[];}catch{}
  found=found.filter(id=>SECRETS[id]);
  let toastTimer;
  const showCount=()=>{pill.textContent=`${found.length}/${TOTAL}`;};
  function foundSecret(id){
    if(!SECRETS[id]||found.includes(id))return;
    found.push(id);try{localStorage.setItem('room-secrets',JSON.stringify(found));}catch{}
    showCount();
    // The toast joins whichever modal is on top, otherwise it would sit hidden behind it.
    (document.querySelector('#extras-dialog[open]')||document.querySelector('#detail-dialog[open]')||document.getElementById('room')).append(toast);
    toast.textContent=`Secret found: ${SECRETS[id]} · ${found.length}/${TOTAL}`;toast.classList.add('show');
    clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),2600);
  }
  showCount();
  window.RoomSecrets={found:foundSecret};
  function toggleNight(){
    const night=document.body.classList.toggle('night');if(night)foundSecret('night');
    document.querySelectorAll('[data-extra="night"]').forEach(button=>{button.setAttribute('aria-pressed',String(night));button.setAttribute('aria-label',night?'Change to daytime':'Change to nighttime');});
  }
  // Canvas keeps game coordinates; the backing store follows the screen's pixel density.
  function setupCanvas(canvas,width,height){
    const ratio=Math.min(window.devicePixelRatio||1,2),ctx=canvas.getContext('2d');
    canvas.width=width*ratio;canvas.height=height*ratio;ctx.setTransform(ratio,0,0,ratio,0,0);
    const point=event=>{const box=canvas.getBoundingClientRect();return {x:(event.clientX-box.left)*width/box.width,y:(event.clientY-box.top)*height/box.height};};
    return {ctx,point};
  }
  function loop(frame){
    cancelAnimationFrame(raf);lastTime=performance.now();
    const run=time=>{if(!dialog.open)return;const dt=Math.min((time-lastTime)/1000,.05);lastTime=time;frame(Math.max(dt,0));raf=requestAnimationFrame(run);};
    raf=requestAnimationFrame(run);
  }
  function open(kind){
    if(kind==='hoops')openHoops();else if(kind==='snake')openSnake();else if(kind==='terminal')openTerminal();else return;
    window.dispatchEvent(new Event('room-pause'));returnFocus=document.activeElement;
        dialog.classList.remove('closing');if(!dialog.open)dialog.showModal();dialog.scrollTop=0;content.querySelector('input,canvas').focus();
  }
  function close(){
    if(!dialog.open||dialog.classList.contains('closing'))return;
    cancelAnimationFrame(raf);
    if(matchMedia('(prefers-reduced-motion: reduce)').matches){dialog.close();return;}
    dialog.classList.add('closing');closeTimer=setTimeout(()=>dialog.close(),450);
  }
  document.getElementById('close-extras').addEventListener('click',close);
  dialog.addEventListener('cancel',event=>{event.preventDefault();close();});
  dialog.addEventListener('close',()=>{clearTimeout(closeTimer);cancelAnimationFrame(raf);dialog.classList.remove('closing');if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true});});
  dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const box=dialog.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)close();});
  document.querySelectorAll('[data-extra]').forEach(button=>{
    const action={night:toggleNight,bed:()=>window.RoomActions.visitBed(),flowers:shakeFlowers}[button.dataset.extra],activate=()=>action?action():open(button.dataset.extra);
    button.addEventListener('click',event=>{event.stopPropagation();activate();});
    if(button.tagName.toLowerCase()==='g')button.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();event.stopPropagation();activate();}});
  });
  window.RoomExtras={open,toggleNight,shakeFlowers};
  // Speech bubble over a room object (used by the flower pot).
  const flowers=document.getElementById('object-flowers'),critters=document.getElementById('critters'),reduced=matchMedia('(prefers-reduced-motion: reduce)'),bubble=document.getElementById('room-bubble'),room=document.getElementById('room');
  let bubbleTimer;
  function say(el,text){
    const d=el.getBoundingClientRect(),box=room.getBoundingClientRect();
    bubble.textContent=text;bubble.style.left=`${Math.min(Math.max(d.left+d.width/2-box.left,110),box.width-110)}px`;bubble.style.top=`${d.top-box.top}px`;bubble.classList.add('show');
    clearTimeout(bubbleTimer);bubbleTimer=setTimeout(()=>bubble.classList.remove('show'),3200);
  }
  // Flower pot: it shakes and a ladybug hops out, says its line, scurries along the floor and fades. One bug at a time.
  const PUNS=['You found a bug!','Found the bug. It was in production.','It’s not a bug, it’s a feature.','Works on my flower pot.'];
  const LADYBUG=`<g>${'<ellipse cx="0" cy="5" rx="7" ry="2" fill="#4f4c4030"/>'}<path d="M-2 -7L-5 -11M2 -7L5 -11" stroke="#2b3437" stroke-width="1" stroke-linecap="round"/><ellipse cx="0" cy="-6" rx="3.6" ry="2.7" fill="#2b3437"/><ellipse cx="0" cy="0" rx="7" ry="6.2" fill="#d9574f" stroke="#a8403c" stroke-width=".9"/><path d="M0 -5.8V6" stroke="#5a2a28" stroke-width="1"/><circle cx="-3.2" cy="-1.5" r="1.3" fill="#2b3437"/><circle cx="3.3" cy="1" r="1.3" fill="#2b3437"/><circle cx="-2.6" cy="3" r="1" fill="#2b3437"/><circle cx="2.8" cy="-3" r="1" fill="#2b3437"/><ellipse cx="-2.2" cy="-2.8" rx="1.4" ry=".8" fill="#fff" opacity=".45"/></g>`;
  let bug=null;
  function shakeFlowers(){
    flowers.classList.remove('wobble');void flowers.getBoundingClientRect();flowers.classList.add('wobble');
    if(bug)return;
    foundSecret('bug');setTimeout(()=>say(flowers,PUNS[Math.floor(Math.random()*PUNS.length)]),reduced.matches?0:350);
    if(reduced.matches)return;
    critters.innerHTML=LADYBUG;bug=critters.firstElementChild;
    const at=(x,y,turn,scale=1)=>`translate(${x}px,${y}px) rotate(${turn}deg) scale(${scale})`;
    bug.animate([{transform:at(201,598,0,.2),opacity:0},{transform:at(206,570,-20),opacity:1,offset:.14},{transform:at(222,636,60),offset:.3},{transform:at(234,640,90),offset:.4},{transform:at(292,640,90),opacity:1,offset:.86},{transform:at(306,640,90),opacity:0}],{duration:2500,easing:'linear'}).finished.then(()=>{critters.replaceChildren();bug=null;});
  }

  function openTerminal(){
    const data=window.PORTFOLIO,history=[];let back=0;
    kicker.textContent='MATEO@ROOM: ~';
    content.innerHTML='<div class="game-heading"><h2 id="extras-title">Terminal.</h2></div><div class="term"><div class="term-out" id="term-out" role="log" aria-live="polite"></div><form class="term-line" id="term-form"><label for="term-input" class="term-prompt">$</label><input id="term-input" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="send" aria-label="Terminal command"></form></div><p class="game-help">Type <kbd>help</kbd> and press Enter.</p>';
    const out=document.getElementById('term-out'),input=document.getElementById('term-input');
    // Output is built with textContent, so typed input can never become markup; links pass the same http(s)/mailto check as the panels.
    const safe=href=>/^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/.test(href)?href:(()=>{try{const url=new URL(href,location.href);return ['https:','http:'].includes(url.protocol)?url.href:null;}catch{return null;}})();
    function print(line,cls){
      const row=document.createElement('p');row.className=cls||'';
      const href=line.href&&safe(line.href);
      if(href){const a=document.createElement('a');a.href=href;a.textContent=line.text;if(!href.startsWith('mailto:')){a.target='_blank';a.rel='noopener noreferrer';}row.append(a);}else row.textContent=line.text;
      out.append(row);
    }
    print({text:`Welcome to ${data.name.toLowerCase()}@room. Type help to see what you can do.`},'term-dim');
    document.getElementById('term-form').addEventListener('submit',event=>{
      event.preventDefault();const command=input.value;input.value='';
      print({text:'$ '+command},'term-cmd');
      if(command.trim()){history.push(command);back=history.length;}
      const result=TerminalCore.run(command,data);
      if(result.clear)out.replaceChildren();
      result.lines.forEach(line=>print(line));
      if(result.secret)foundSecret(result.secret);
      if(result.open&&safe(result.open))window.open(safe(result.open),'_blank','noopener');
      out.scrollTop=out.scrollHeight;
      if(result.exit)close();
    });
    input.addEventListener('keydown',event=>{
      if(event.key==='ArrowUp'&&back>0){event.preventDefault();input.value=history[--back];}
      else if(event.key==='ArrowDown'&&back<history.length){event.preventDefault();back++;input.value=history[back]||'';}
    });
    content.querySelector('.term').addEventListener('click',()=>{if(!getSelection().toString())input.focus();});
    foundSecret('terminal');
  }

  function openHoops(){
    const C=HoopCore.court,ROUND=45;
    kicker.textContent='A LITTLE BREAK BETWEEN BUILDS';
    content.innerHTML=`<div class="game-heading"><h2 id="extras-title">Beat the clock.</h2><p class="game-stats"><span>Score <b id="hoop-score">0</b></span><span>Time <b id="hoop-time">${ROUND}</b></span><span>Best <b id="hoop-best">${best.get('hoops')}</b></span></p></div><canvas id="hoop-canvas" class="game-canvas" tabindex="0" aria-label="Basketball. Drag back from the court and release to shoot. Keyboard: left and right change the angle, up and down change the power, Space shoots." aria-describedby="hoop-help"></canvas><p id="hoop-help" class="game-help">Pull back like a slingshot and let go. Behind the dashed line is worth 3, three makes in a row puts you on fire (double points), and from 10 points the hoop starts moving. Keys: <kbd>←</kbd><kbd>→</kbd> angle, <kbd>↑</kbd><kbd>↓</kbd> power, <kbd>Space</kbd> shoot.</p><p id="hoop-feedback" class="discovery-feedback" role="status">${ROUND} seconds. The clock starts with your first shot.</p>`;
    const canvas=document.getElementById('hoop-canvas'),{ctx,point}=setupCanvas(canvas,C.width,C.height),feedback=document.getElementById('hoop-feedback');
    const newSpot=()=>({x:70+Math.random()*330});
    let g,drag=null;
    function reset(){g={score:0,time:ROUND,started:false,over:false,streak:0,spot:newSpot(),aim:{angle:52,power:650},ball:null,clock:0,acc:0,flash:0};hud();}
    function hud(){document.getElementById('hoop-score').textContent=g.score;document.getElementById('hoop-time').textContent=Math.ceil(g.time);document.getElementById('hoop-best').textContent=best.get('hoops');}
    function shoot(){
      if(g.over){reset();feedback.textContent='New round. Clock starts on your first shot.';return;}
      if(g.ball)return;
      g.started=true;g.ball=HoopCore.launch(g.spot,g.aim.angle,g.aim.power);feedback.textContent='In the air…';
    }
    function finishRound(){
      g.over=true;const previous=best.get('hoops');if(g.score>previous)best.set('hoops',g.score);hud();
      feedback.textContent=g.score>previous?`Time! ${g.score} points, a new best. Tap or press Space for another round.`:`Time! ${g.score} points (best ${previous}). Tap or press Space for another round.`;
    }
    function settle(ball){
      if(ball.made){
        foundSecret('hoops');const value=HoopCore.points(g.spot)*(g.streak>=3?2:1);g.score+=value;g.streak++;g.spot=newSpot();g.flash=1;
        feedback.textContent=`${ball.touched?'Bucket':'Swish'}! +${value}${g.streak>=3?' · on fire, double points':''}${g.time<=0?' · buzzer beater':''}`;
      }else{g.streak=0;feedback.textContent=ball.touched?'Rattled out. Same spot, adjust and go again.':'Miss. Same spot, adjust and go again.';}
      g.ball=null;hud();if(g.time<=0)finishRound();
    }
    function frame(dt){
      g.clock+=dt;g.flash=Math.max(0,g.flash-dt*2);
      if(g.started&&!g.over){const shown=Math.ceil(g.time);g.time=Math.max(0,g.time-dt);if(Math.ceil(g.time)!==shown)hud();if(g.time<=0&&!g.ball)finishRound();}
      if(g.ball){
        g.acc+=dt;
        while(g.acc>=C.dt&&g.ball&&!g.ball.done){g.ball=HoopCore.step(g.ball,C.dt,HoopCore.hoopY(g.clock,g.score));g.acc-=C.dt;}
        if(g.ball.done)settle(g.ball);
      }else g.acc=0;
      draw();
    }
    function draw(){
      const y=HoopCore.hoopY(g.clock,g.score),rest={x:g.spot.x,y:C.floor-75};
      const sky=ctx.createLinearGradient(0,0,0,C.height);sky.addColorStop(0,'#3f625c');sky.addColorStop(1,'#6f8e84');ctx.fillStyle=sky;ctx.fillRect(0,0,C.width,C.height);
      ctx.fillStyle='#c9a77b';ctx.fillRect(0,C.floor,C.width,C.height-C.floor);ctx.fillStyle='#e4c493';ctx.fillRect(0,C.floor,C.width,3);
      ctx.setLineDash([6,6]);ctx.strokeStyle='#e9e2c999';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(C.threePoint,C.floor-40);ctx.lineTo(C.threePoint,C.floor);ctx.stroke();ctx.setLineDash([]);
      ctx.fillStyle='#e9e2c9aa';ctx.font='600 11px Arial,sans-serif';ctx.textAlign='center';ctx.fillText('3 PT',C.threePoint-24,C.floor-28);ctx.fillText('2 PT',C.threePoint+24,C.floor-28);
      // Stanchion, backboard, rim and net.
      ctx.strokeStyle='#55605d';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(624,C.floor);ctx.lineTo(624,y-30);ctx.lineTo(604,y-30);ctx.stroke();
      ctx.fillStyle='#ece6d1';ctx.fillRect(C.board.x,y-C.board.above,7,C.board.above+C.board.below);
      ctx.strokeStyle='#e6dfc4';ctx.lineWidth=1.5;ctx.beginPath();
      for(let i=0;i<=4;i++){const top=C.rimFront+(C.rimBack-C.rimFront)*i/4,bottom=C.rimFront+10+(C.rimBack-C.rimFront-20)*i/4;ctx.moveTo(top,y);ctx.lineTo(bottom,y+34+g.flash*6);}
      ctx.moveTo(C.rimFront+4,y+14);ctx.lineTo(C.rimBack-4,y+14);ctx.stroke();
      ctx.strokeStyle='#d9824a';ctx.lineWidth=5;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(C.rimFront,y);ctx.lineTo(C.rimBack+4,y);ctx.stroke();ctx.lineCap='butt';
      ctx.fillStyle='#2f4a45aa';ctx.beginPath();ctx.ellipse(g.spot.x,C.floor-2,16,4,0,0,Math.PI*2);ctx.fill();
      if(!g.ball&&!g.over){
        const r=g.aim.angle*Math.PI/180,len=24+g.aim.power*.08,tx=rest.x+Math.cos(r)*len,ty=rest.y-Math.sin(r)*len;
        ctx.strokeStyle='#f4e7c1';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(rest.x,rest.y);ctx.lineTo(tx,ty);ctx.stroke();
        ctx.fillStyle='#f4e7c1';ctx.beginPath();ctx.moveTo(tx+Math.cos(r)*8,ty-Math.sin(r)*8);ctx.lineTo(tx+Math.cos(r+2.4)*8,ty-Math.sin(r+2.4)*8);ctx.lineTo(tx+Math.cos(r-2.4)*8,ty-Math.sin(r-2.4)*8);ctx.fill();
        ctx.fillStyle='#f4e7c1cc';ctx.textAlign='left';ctx.fillText(`${Math.round(g.aim.angle)}° · power ${Math.round(g.aim.power)}`,14,C.floor+20);
      }
      const b=g.ball||rest;
      ctx.fillStyle='#e08c4c';ctx.strokeStyle='#8f5a3c';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(b.x,b.y,C.radius,0,Math.PI*2);ctx.fill();ctx.stroke();
      ctx.beginPath();ctx.moveTo(b.x-C.radius,b.y);ctx.lineTo(b.x+C.radius,b.y);ctx.moveTo(b.x,b.y-C.radius);ctx.lineTo(b.x,b.y+C.radius);ctx.stroke();
      if(g.streak>=3){ctx.fillStyle='#ffcf7a';ctx.textAlign='left';ctx.font='700 13px Arial,sans-serif';ctx.fillText('ON FIRE ×2',14,24);}
      if(!g.started||g.over){ctx.fillStyle='#16262acc';ctx.fillRect(170,120,300,80);ctx.fillStyle='#f0e9d8';ctx.textAlign='center';ctx.font='400 22px Georgia,serif';ctx.fillText(g.over?`Time! ${g.score} points`:'Pull back to shoot',320,154);ctx.font='12px Arial,sans-serif';ctx.fillStyle='#c4d1b4';ctx.fillText(g.over?'Tap or press Space to play again':`${ROUND} seconds once you take the first shot`,320,180);}
    }
    canvas.addEventListener('pointerdown',event=>{
      event.preventDefault();if(g.over){shoot();return;}if(g.ball)return;
      drag=point(event);canvas.setPointerCapture(event.pointerId);
    });
    canvas.addEventListener('pointermove',event=>{if(!drag||g.ball)return;const p=point(event);if(Math.hypot(drag.x-p.x,drag.y-p.y)>6)g.aim=HoopCore.drag(drag.x-p.x,drag.y-p.y);});
    canvas.addEventListener('pointerup',event=>{if(!drag)return;const p=point(event),pulled=Math.hypot(drag.x-p.x,drag.y-p.y);drag=null;if(pulled>10)shoot();});
    for(const name of ['pointercancel','lostpointercapture'])canvas.addEventListener(name,()=>drag=null);
    canvas.addEventListener('keydown',event=>{
      const change={ArrowLeft:[2,0],ArrowRight:[-2,0],ArrowUp:[0,10],ArrowDown:[0,-10]}[event.key];
      if(change){event.preventDefault();g.aim={angle:Math.max(15,Math.min(85,g.aim.angle+change[0])),power:Math.max(250,Math.min(1000,g.aim.power+change[1]))};}
      else if(event.key===' '||event.key==='Enter'){event.preventDefault();shoot();}
    });
    reset();loop(frame);
  }

  function openSnake(){
    const S=SnakeCore.grid,CELL=20,W=S.cols*CELL,H=S.rows*CELL;
    kicker.textContent='THE OLD TV IN THE CORNER';
    content.innerHTML=`<div class="game-heading"><h2 id="extras-title">Snake.</h2><p class="game-stats"><span>Score <b id="snake-score">0</b></span><span>Best <b id="snake-best">${best.get('snake')}</b></span></p></div><div class="crt"><canvas id="snake-canvas" class="game-canvas" tabindex="0" aria-label="Snake. Arrow keys or WASD steer, Space starts and pauses. On touch screens, swipe to steer." aria-describedby="snake-help"></canvas></div><div class="snake-pad" aria-label="Steer the snake"><button data-turn="up" aria-label="Up"><svg class="icon" aria-hidden="true"><use href="#i-chev"/></svg></button><button data-turn="left" aria-label="Left"><svg class="icon rot-left" aria-hidden="true"><use href="#i-chev"/></svg></button><button data-turn="down" aria-label="Down"><svg class="icon rot-down" aria-hidden="true"><use href="#i-chev"/></svg></button><button data-turn="right" aria-label="Right"><svg class="icon rot-right" aria-hidden="true"><use href="#i-chev"/></svg></button></div><p id="snake-help" class="game-help">Eat the amber pixels, don’t hit the walls or yourself. It gets faster with every bite. <kbd>WASD</kbd> or arrows steer, <kbd>Space</kbd> pauses, swipe on a phone.</p><p id="snake-feedback" class="discovery-feedback" role="status">Press Space, an arrow key or tap the screen to start.</p>`;
    const canvas=document.getElementById('snake-canvas'),{ctx}=setupCanvas(canvas,W,H),feedback=document.getElementById('snake-feedback');
    const dirs={up:{x:0,y:-1},down:{x:0,y:1},left:{x:-1,y:0},right:{x:1,y:0}};
    const keys={ArrowUp:'up',w:'up',ArrowDown:'down',s:'down',ArrowLeft:'left',a:'left',ArrowRight:'right',d:'right'};
    let game=SnakeCore.create(),running=false,acc=0,clock=0,swipe=null;
    const score=()=>{document.getElementById('snake-score').textContent=game.score;document.getElementById('snake-best').textContent=best.get('snake');};
    function start(){if(!game.alive){game=SnakeCore.create();score();}running=true;acc=0;feedback.textContent='Go!';}
    function steer(name){if(!running&&game.alive&&game.snake.length===3&&!game.score)start();else if(!running)return;SnakeCore.turn(game,dirs[name]);}
    function toggle(){if(running){running=false;feedback.textContent='Paused. Space or tap to continue.';}else start();}
    function frame(dt){
      clock+=dt;
      if(running){
        acc+=dt*1000;
        while(running&&acc>=SnakeCore.interval(game.score)){
          acc-=SnakeCore.interval(game.score);const before=game.score;game=SnakeCore.tick(game);
          if(game.score!==before){score();if(game.score>=10)foundSecret('snake');}
          if(!game.alive){running=false;const previous=best.get('snake');if(game.score>previous)best.set('snake',game.score);score();feedback.textContent=game.score>previous?`Game over: ${game.score}, a new best! Space or tap to play again.`:`Game over: ${game.score} (best ${previous}). Space or tap to play again.`;}
        }
      }
      draw();
    }
    function draw(){
      ctx.fillStyle='#0f1f17';ctx.fillRect(0,0,W,H);
      ctx.fillStyle='#16291f';for(let x=0;x<S.cols;x++)for(let y=0;y<S.rows;y++)if((x+y)%2)ctx.fillRect(x*CELL,y*CELL,CELL,CELL);
      if(game.food){ctx.fillStyle=Math.sin(clock*8)>-.6?'#f0a95e':'#9c6b3b';ctx.fillRect(game.food.x*CELL+4,game.food.y*CELL+4,CELL-8,CELL-8);}
      game.snake.forEach((p,i)=>{ctx.fillStyle=i?'#8fcf7c':'#d6f5b8';ctx.fillRect(p.x*CELL+1,p.y*CELL+1,CELL-2,CELL-2);});
      if(!running){
        ctx.fillStyle='#0b1610d9';ctx.fillRect(0,H/2-46,W,92);ctx.textAlign='center';ctx.fillStyle='#bdf0a0';ctx.font='700 26px Consolas,monospace';
        const fresh=game.alive&&game.snake.length===3&&!game.score;
        ctx.fillText(!game.alive?'GAME OVER':fresh?'SNAKE':'PAUSED',W/2,H/2-6);
        ctx.font='13px Consolas,monospace';ctx.fillStyle='#8fcf7c';ctx.fillText(!game.alive?`SCORE ${game.score}  ·  PRESS SPACE`:'PRESS SPACE OR TAP',W/2,H/2+22);
      }
    }
    canvas.addEventListener('keydown',event=>{
      const key=event.key.length===1?event.key.toLowerCase():event.key;
      if(keys[key]){event.preventDefault();if(!game.alive){start();return;}steer(keys[key]);}
      else if(key===' '||key==='Enter'){event.preventDefault();toggle();}
    });
    canvas.addEventListener('pointerdown',event=>{event.preventDefault();swipe={x:event.clientX,y:event.clientY};canvas.focus();});
    canvas.addEventListener('pointerup',event=>{
      if(!swipe)return;const dx=event.clientX-swipe.x,dy=event.clientY-swipe.y;swipe=null;
      if(Math.hypot(dx,dy)<24){toggle();return;}
      if(!game.alive)start();
      steer(Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up'));
    });
    content.querySelectorAll('[data-turn]').forEach(button=>button.addEventListener('contextmenu',event=>event.preventDefault()));
    content.querySelectorAll('[data-turn]').forEach(button=>button.addEventListener('click',()=>{if(!game.alive)start();steer(button.dataset.turn);canvas.focus({preventScroll:true});}));
    draw();loop(frame);
  }
})();
