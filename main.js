(() => {
  'use strict';
  const data = window.PORTFOLIO, core = window.RoomCore;
  const room = document.getElementById('room');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'),coarse=matchMedia('(pointer: coarse)');
  let route=[], phase=0, moving=false, wasMoving=false, face='down', running=false;
  const dialog = document.getElementById('detail-dialog'), content = document.getElementById('dialog-content');
  const hint = document.getElementById('room-hint'), keys = new Set();
  let position = { x: 540, y: 520 }, target = null, lastTime = 0, returnFocus = null;
  let pendingSeat=false, seated=false, seatReturn=null, sitMotion=null, standMotion=null, sitAmount=0, seatKind='desk', afterStand=null;
  const currentSeat=()=>seatKind==='bed'?core.bedSeat:core.seat;
  const subdialogOpen=()=>dialog.open||!!document.getElementById('extras-dialog')?.open;
  const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  function safeUrl(value) {
    try { const url = new URL(value, location.href); return ['https:', 'http:'].includes(url.protocol) ? url.href : null; } catch { return null; }
  }
  const link = (url, label) => safeUrl(url) ? `<a class="action-link" href="${escape(safeUrl(url))}" target="_blank" rel="noopener noreferrer">${escape(label)} <svg class="icon" aria-hidden="true"><use href="#i-arrow"/></svg></a>` : '';
  document.getElementById('intro-copy').textContent = data.intro;
  const title = document.getElementById('headline'), lines = data.headline.split('\n');
  title.replaceChildren(document.createTextNode(lines[0]), document.createElement('br'));
  const emphasis = document.createElement('em'); emphasis.textContent = lines.slice(1).join(' '); title.append(emphasis);
  document.querySelectorAll('[data-github]').forEach(item => { const url = safeUrl(data.github); if (url) item.href = url; });
  function openPanel(section) {
    stopWalking();
    returnFocus = document.activeElement;
    document.querySelectorAll('#navigation [data-open]').forEach(button=>button.setAttribute('aria-expanded',String(button.dataset.open===section)));
    const labels = { projects: '01 / THE DESK', about: '02 / THE PERSONAL SHELF', contact: '03 / THE MAILBOX', help: 'A QUICK TOUR' };
    document.getElementById('dialog-kicker').textContent = labels[section];
    if (section === 'projects') content.innerHTML = `<h2 id="dialog-title">Things I’m building.</h2><p>A growing collection of projects, experiments, and lessons learned along the way.</p>${data.projects.map(project => `<article class="project"><p class="label">${escape(project.type)}</p><h3>${escape(project.name)}</h3><p class="${project.description.startsWith('[EDIT]') ? 'placeholder' : ''}">${escape(project.description)}</p><div class="tags">${project.tags.map(tag => `<span class="tag">${escape(tag)}</span>`).join('')}</div>${link(project.url, project.linkLabel)}${project.note ? `<p class="small-note">${escape(project.note)}</p>` : ''}</article>`).join('')}<p class="label">PREFER THE COMMAND LINE?</p><button class="action-link" type="button" data-terminal>Open the terminal <svg class="icon" aria-hidden="true"><use href="#i-arrow"/></svg></button>`;
    if (section === 'about') content.innerHTML = `<h2 id="dialog-title">A little about me.</h2><p>${escape(data.about)}</p><p class="label">WHAT I’M EXPLORING</p><p>${escape(data.focus)}</p><h3 class="experience-heading">Work experience</h3><div class="experience-list">${data.experience.map(job=>`<article class="experience"><p class="experience-period">${escape(job.period)}</p><h4>${escape(job.role)}</h4><p class="experience-company">${escape(job.company)}</p>${job.description?`<p>${escape(job.description)}</p>`:''}</article>`).join('')}</div><p class="label">BEYOND THE SCREEN</p><div class="tags">${data.interests.map(item => `<span class="tag">${escape(item)}</span>`).join('')}</div><p class="small-note">${escape(data.location)} · Computer Engineering, FERIT</p>`;
    if (section === 'contact') content.innerHTML = `<h2 id="dialog-title">Let’s connect.</h2><p>${escape(data.contact)}</p>${link(data.github, 'Find me on GitHub')}<p class="label">EMAIL</p>${/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) ? `<a class="action-link" href="mailto:${escape(data.email)}">${escape(data.email)} <svg class="icon" aria-hidden="true"><use href="#i-arrow"/></svg></a>` : '<p class="placeholder">[EDIT] Add your contact email in content.js.</p>'}<p class="label">CURRICULUM VITAE</p>${safeUrl(data.cv) && data.cv ? link(data.cv, 'View CV') : '<p class="placeholder">[EDIT] Add a CV link in content.js.</p>'}`;
    if (section === 'help') content.innerHTML = '<h2 id="dialog-title">Make yourself at home.</h2><p>Click the labelled objects to discover projects, meet Mateo, or get in touch. The navigation at the top takes you to the same places.</p><p class="label">TAKE A LITTLE WALK</p><p>Use <strong>WASD</strong> or the <strong>arrow keys</strong>, hold <strong>Shift</strong> to run. Press <strong>E</strong> near furniture to interact. At the desk, Mateo walks to the chair and sits down to show his projects. Close the panel to stand up.</p><p>Click the floor to walk. On a phone, use the arrows, <strong>A</strong> to interact and hold <strong>B</strong> to run. Some things in the room do more than they let on, so poke around: the counter at the top keeps score of the secrets you find. Click the bed for a nap; press E or a direction key to wake him up.</p><p class="label">KEYBOARD SHORTCUTS</p><p><strong>Tab</strong> moves between links and objects. <strong>Enter</strong> opens the focused object. <strong>Escape</strong> closes a panel, then exits the room.</p>';
    content.querySelector('[data-terminal]')?.addEventListener('click',()=>window.RoomExtras.open('terminal'));
    if (!dialog.open) dialog.showModal();
    dialog.scrollTop = 0;
    document.getElementById('close-dialog').focus();
  }
  document.querySelectorAll('[data-open]').forEach(button => {
    const activate=()=>button.closest('#room-art')&&button.dataset.open==='projects'?visitDesk():openPanel(button.dataset.open);
    button.addEventListener('click', event => {event.stopPropagation();activate();});
    if(button.tagName.toLowerCase()==='g')button.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();event.stopPropagation();activate();}});
  });
  document.getElementById('help-button').addEventListener('click', () => openPanel('help'));
  let closeTimer;
  function closePanel(){
    if(!dialog.open||dialog.classList.contains('closing'))return;
    if(reduced.matches){dialog.close();return;}
    dialog.classList.add('closing');
    closeTimer=setTimeout(()=>dialog.close(),450);
  }
  document.getElementById('close-dialog').addEventListener('click',closePanel);
  dialog.addEventListener('cancel',event=>{event.preventDefault();closePanel();});
  dialog.addEventListener('click', event => { if (event.target === dialog) { const box = dialog.getBoundingClientRect(); if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) closePanel(); } });
  dialog.addEventListener('close', () => {
    clearTimeout(closeTimer);dialog.classList.remove('closing');
    document.querySelectorAll('#navigation [data-open]').forEach(button=>button.setAttribute('aria-expanded','false'));
    if(seated&&seatKind==='desk')standUp();
    if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
  });
  const roomDialog=document.getElementById('room-dialog'),roomSection=document.querySelector('.room-section'),explore=document.getElementById('explore');
  // Back to portfolio joins the room's top bar so it lines up with Help.
  const exitButton=document.getElementById('exit-room'),topline=roomSection.querySelector('.room-topline');
  explore.addEventListener('click',()=>{stopWalking();roomDialog.append(roomSection);topline.append(exitButton);document.getElementById('room-art').setAttribute('viewBox','90 76 860 604');roomDialog.showModal();room.focus({preventScroll:true});});
  let roomCloseTimer;
  function closeRoom(){
    if(roomDialog.classList.contains('closing'))return;
    stopWalking();if(seated)standUp();
    if(reduced.matches){roomDialog.close();return;}
    roomDialog.classList.add('closing');roomCloseTimer=setTimeout(()=>roomDialog.close(),650);
  }
  document.getElementById('exit-room').addEventListener('click',closeRoom);
  roomDialog.addEventListener('cancel',event=>{event.preventDefault();closeRoom();});
  roomDialog.addEventListener('close',()=>{clearTimeout(roomCloseTimer);roomDialog.classList.remove('closing');stopWalking();document.getElementById('room-art').setAttribute('viewBox','0 0 1040 720');document.querySelector('main').append(roomSection);roomDialog.append(exitButton);explore.focus({preventScroll:true});});
  const lamp=document.getElementById('desk-lamp');
  function toggleLamp(){const on=room.classList.toggle('lamp-on');lamp.setAttribute('aria-pressed',String(on));if(on)window.RoomSecrets?.found('lamp');render();}
  lamp.addEventListener('click',event=>{event.stopPropagation();toggleLamp();});
  lamp.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();event.stopPropagation();toggleLamp();}});
  const directions = { ArrowUp:[0,-1], w:[0,-1], ArrowDown:[0,1], s:[0,1], ArrowLeft:[-1,0], a:[-1,0], ArrowRight:[1,0], d:[1,0] };
  function stopWalking(){
    keys.clear();target=null;route=[];pendingSeat=false;afterStand=null;RoomScene.destination(null);
    if(sitMotion)standUp();
  }
  function standUp(){
    if(!seatReturn)return;
    standMotion={from:{...position},to:seatReturn,amount:sitAmount,elapsed:0};
    seated=false;sitMotion=null;seatReturn=null;
    if(reduced.matches){position=standMotion.to;standMotion=null;sitAmount=0;}
    render();
  }
  function visitSeat(kind){
    if(subdialogOpen()||kind==='bed'&&!core.bedSeat)return;
    if(standMotion){afterStand=()=>visitSeat(kind);return;}
    stopWalking();
    if(seated)standUp();
    if(standMotion){afterStand=()=>visitSeat(kind);return;}
    seatKind=kind;
    const seat=currentSeat();route=core.path(position,seat.approach);target=route.shift()||null;
    if(!target){hint.textContent='Walk into the open floor to reach the seat';return;}
    pendingSeat=true;RoomScene.destination(seat.approach);room.focus({preventScroll:true});render();
  }
  const visitDesk=()=>visitSeat('desk'),visitBed=()=>visitSeat('bed');
  function sitAtSeat(){
    const seat=currentSeat();seatReturn={...position};sitMotion={from:{...position},elapsed:0};pendingSeat=false;
    face=core.facing(seat.position.x-position.x,seat.position.y-position.y);moving=false;render();
  }
  function interact(){
    if(subdialogOpen()||standMotion)return;
    if(seated){stopWalking();standUp();return;}
    if(sitMotion)return;
    const key=core.nearest(position);
    if(core.interactionDistance(position,key)<65){if(key==='projects')visitDesk();else if(key==='bed')visitBed();else if(key==='hoops'||key==='snake')window.RoomExtras.open(key);else if(key==='flowers')window.RoomExtras.shakeFlowers();else if(key==='lamp')toggleLamp();else if(key==='night')window.RoomExtras.toggleNight();else openPanel(key);}
    else hint.textContent='Walk closer to an object, or click its label';
  }
  // Easter egg: the Konami code woven into the rug.
  const konami=['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];let recent=[],flash='',flashUntil=0;
  // Fed by the keyboard and by the touch pad (arrows, B, A), so phones can enter it too.
  // A rolling window of the last ten keys, so an extra press (↑↑↑↓↓…) still matches.
  function konamiKey(key){recent=[...recent,key].slice(-konami.length);if(recent.join()===konami.join()){recent=[];cheat();return true;}return false;}
  function cheat(){const on=room.classList.toggle('cheat');RoomScene.setCool(on);if(on)window.RoomSecrets?.found('konami');flash=on?'Cheat code accepted · deal with it':'Cheats off · back to normal';flashUntil=performance.now()+3500;render();}
  room.addEventListener('keydown',event=>{
    if(event.target!==room||subdialogOpen())return;
    const key=event.key.length===1?event.key.toLowerCase():event.key;
    if(!event.repeat)konamiKey(key);
    if(key==='Shift')running=true;
    if(directions[key]){
      event.preventDefault();if(sitMotion)stopWalking();if(seated)standUp();afterStand=null;
      keys.add(key);target=null;route=[];pendingSeat=false;RoomScene.destination(null);
    }else if(key==='e'){event.preventDefault();interact();}
  });
  window.addEventListener('keyup', event => {keys.delete(event.key.length === 1 ? event.key.toLowerCase() : event.key);if(event.key==='Shift')running=false;});
  window.addEventListener('blur', ()=>{running=false;stopWalking();});
  document.addEventListener('visibilitychange', () => { stopWalking();lastTime = 0; });
  room.addEventListener('blur', () => keys.clear());
  function walkTo(destination){
    if(subdialogOpen())return;
    pendingSeat=false;route=core.path(position,destination);target=route.shift()||null;
    RoomScene.destination(target?destination:null);room.focus({preventScroll:true});
  }
  document.getElementById('room-art').addEventListener('click',event=>{
    if(subdialogOpen())return;
    const svg=event.currentTarget,point=new DOMPoint(event.clientX,event.clientY).matrixTransform(svg.getScreenCTM().inverse());
    const destination={x:point.x,y:point.y};stopWalking();if(seated)standUp();
    if(standMotion){afterStand=()=>walkTo(destination);return;}walkTo(destination);
  });
  // D-pad is one touch area: the angle from its centre picks one of 8 directions, so the thumb can slide (and go diagonal).
  const dpad=document.querySelector('.dpad'),padKeys={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right'};
  function padDirection(event){
    const box=dpad.getBoundingClientRect(),dx=event.clientX-box.left-box.width/2,dy=event.clientY-box.top-box.height/2,held=new Set();
    if(Math.hypot(dx,dy)>box.width*.1){const angle=Math.atan2(dy,dx),c=Math.cos(angle),n=Math.sin(angle);if(c>.38)held.add('ArrowRight');if(c<-.38)held.add('ArrowLeft');if(n>.38)held.add('ArrowDown');if(n<-.38)held.add('ArrowUp');}
    for(const key in padKeys){held.has(key)?keys.add(key):keys.delete(key);dpad.querySelector(`[data-direction="${padKeys[key]}"]`).classList.toggle('pressed',held.has(key));}
    return held;
  }
  let padPointer=null;
  function releasePad(){padPointer=null;for(const key in padKeys)keys.delete(key);dpad.querySelectorAll('.pressed').forEach(arm=>arm.classList.remove('pressed'));}
  dpad.addEventListener('pointerdown',event=>{
    event.preventDefault();padPointer=event.pointerId;try{dpad.setPointerCapture(event.pointerId);}catch{}
    if(sitMotion)stopWalking();if(seated)standUp();afterStand=null;target=null;route=[];pendingSeat=false;RoomScene.destination(null);
    const held=padDirection(event);if(held.size===1)konamiKey([...held][0]);
  });
  dpad.addEventListener('pointermove',event=>{if(event.pointerId===padPointer)padDirection(event);});
  for(const name of ['pointerup','pointercancel','lostpointercapture'])dpad.addEventListener(name,event=>{if(event.pointerId===padPointer)releasePad();});
  dpad.addEventListener('contextmenu',event=>event.preventDefault());
  // Game Boy style pad: A interacts, B cancels (stops walking, stands up, wakes up).
  document.getElementById('touch-interact').addEventListener('click',()=>{if(!konamiKey('a'))interact();});
  // B: hold to run (Shift on a keyboard); a tap while seated or asleep gets up instead.
  const bButton=document.getElementById('touch-b');
  bButton.addEventListener('pointerdown',event=>{event.preventDefault();bButton.setPointerCapture(event.pointerId);konamiKey('b');if(subdialogOpen())return;if(seated||sitMotion){stopWalking();if(seated)standUp();render();return;}running=true;});
  for(const name of ['pointerup','pointercancel','lostpointercapture'])bButton.addEventListener(name,()=>running=false);
  bButton.addEventListener('contextmenu',event=>event.preventDefault());
  window.RoomActions={stopWalking,visitBed};
  window.addEventListener('room-pause',stopWalking);
  function render() {
    RoomScene.render(position,reduced.matches?0:phase,moving&&!reduced.matches,face,sitAmount,seated||!!sitMotion||!!standMotion,seatKind,seated&&seatKind==='bed');
    const nearest=core.nearest(position),close=core.interactionDistance(position,nearest)<65;
    document.querySelectorAll('.object-action,#room-window,#desk-lamp').forEach(button=>button.classList.toggle('near',close&&(button.dataset.open||button.dataset.extra||button.dataset.zone)===nearest));
    const text=standMotion?(seatKind==='bed'?'Waking up · One moment':'Standing up · One moment'):seated?(seatKind==='bed'?'Asleep, dreaming in code · Press E to wake up':'At the desk · Close Projects to stand up'):sitMotion?(seatKind==='bed'?'Getting sleepy…':'Getting comfortable · Projects will open in a moment'):pendingSeat?`Walking to the ${seatKind==='bed'?'bed':'chair'} · Use a direction key to cancel`:close?`Press E to ${({projects:'sit down & explore Projects',bed:'take a nap',about:'explore About me',contact:'explore Contact',hoops:'shoot some hoops',snake:'play Snake',flowers:'check the flowers',lamp:room.classList.contains('lamp-on')?'switch the lamp off':'switch the lamp on',night:document.body.classList.contains('night')?'make it day':'make it night'})[nearest]} · ${['lamp','night','hoops','snake','bed','flowers'].includes(nearest)?'or just click it':'or click its label'}`:'Click the floor to walk · Click a label to explore';
    const shown=performance.now()<flashUntil?flash:coarse.matches?text.replace(/Press E/g,'Tap A'):text;if(hint.textContent!==shown)hint.textContent=shown;
  }
  function frame(time) {
    const dt=Math.min((time-lastTime)/1000||0,.04);lastTime=time;
    if(subdialogOpen()&&sitMotion)stopWalking();
    if(standMotion){
      standMotion.elapsed+=dt;
      const progress=Math.min(1,standMotion.elapsed/.9),ease=t=>t*t*(3-2*t);
      sitAmount=standMotion.amount*(1-ease(Math.min(1,progress/.35)));
      const travel=ease(Math.max(0,(progress-.35)/.65));
      position={x:standMotion.from.x+(standMotion.to.x-standMotion.from.x)*travel,y:standMotion.from.y+(standMotion.to.y-standMotion.from.y)*travel};
      face=progress>.35?core.facing(standMotion.to.x-standMotion.from.x,standMotion.to.y-standMotion.from.y):(currentSeat().facing||'up');moving=progress>.35;phase+=dt*8;
      if(progress===1){position=standMotion.to;standMotion=null;sitAmount=0;moving=false;const next=afterStand;afterStand=null;next?.();}
      render();wasMoving=moving;requestAnimationFrame(frame);return;
    }
    if(sitMotion){
      const seat=currentSeat();
      sitMotion.elapsed+=dt;
      const progress=Math.min(1,sitMotion.elapsed/1.35),ease=t=>t*t*(3-2*t),travel=ease(Math.min(1,progress/.65));
      position={x:sitMotion.from.x+(seat.position.x-sitMotion.from.x)*travel,y:sitMotion.from.y+(seat.position.y-sitMotion.from.y)*travel};
      sitAmount=ease(Math.max(0,(progress-.65)/.35));face=progress<.65?core.facing(seat.position.x-sitMotion.from.x,seat.position.y-sitMotion.from.y):(seat.facing||'up');moving=progress<.65;phase+=dt*8;
      if(reduced.matches||sitMotion.elapsed>=1.65){position={...seat.position};sitAmount=1;sitMotion=null;seated=true;moving=false;if(seatKind==='desk')openPanel('projects');else window.RoomSecrets?.found('nap');}
      render();wasMoving=moving;requestAnimationFrame(frame);return;
    }
    let dx=0,dy=0;moving=false;const oldFace=face;
    if(!subdialogOpen()&&!seated){
      let sx=0,sy=0;keys.forEach(key=>{sx+=directions[key][0];sy+=directions[key][1];});
      dx=sx;dy=sy;
      if(target){let d=core.distance(position,target);if(d<2){target=route.shift()||null;if(!target){RoomScene.destination(null);if(pendingSeat)sitAtSeat();}}if(target){dx=target.x-position.x;dy=target.y-position.y;}}
      const len=Math.hypot(dx,dy);
      if(len){face=core.facing(dx,dy,face);let step=Math.min(dt*155*(running?1.8:1),target?core.distance(position,target):Infinity);let next=core.move(position,dx/len*step,dy/len*step);moving=core.distance(next,position)>.0001;if(moving){position=next;phase+=dt*(running?19:12);}else{target=null;route=[];RoomScene.destination(null);}}
    }
    if(moving||wasMoving||oldFace!==face)render();wasMoving=moving;requestAnimationFrame(frame);
  }
  render();requestAnimationFrame(frame);
})();

