// Top-down 2.5D art. x/y are screen-space floor coordinates; y is the depth baseline.
(() => {
const svg=document.getElementById('room-art'),NS='http://www.w3.org/2000/svg';
const r=(x,y,w,h,fill,rx=0,extra='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" ${extra}/>`;
const e=(x,y,rx,ry,fill,extra='')=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const line=(d,color,width=2,extra='')=>`<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" ${extra}/>`;
// Labels belong to the furniture: a sticky note on the desk, a brass plate on the shelf, a paper tag on the letter table.
// Highlight is a soft light behind the sign, never a filter on the text, so letters stay crisp while it fades in.
const glow=(x,y,w,h)=>r(x,y,w,h,'#fff3c8',6,'class="sign-glow" filter="url(#tightGlow)"');
const label=(x,y,text,size=11.5,fill='#5b4a26')=>`<text x="${x}" y="${y}" text-anchor="middle" fill="${fill}" font-size="${size}" font-family="Georgia,serif" font-style="italic" text-rendering="geometricPrecision">${text}</text>`;
const sticky=(x,y,text)=>`<g class="object-sign">${glow(x-38,y-15,76,32)}<g transform="rotate(-2 ${x} ${y})">${r(x-35,y-10,70,24,'#3b2e1a26',2,'transform="translate(1.5 2)"')}${r(x-35,y-10,70,24,'#f5df8e',2)}${r(x-35,y+11,70,3,'#e3c56a',1)}${r(x-10,y-14,20,7,'#fffaf0a6',1)}</g>${label(x,y+6,text,14)}</g>`;
const plate=(x,y,text)=>`<g class="object-sign">${glow(x-33,y-11,66,22)}${r(x-30,y-8,60,16,'#8a6a35',3)}${r(x-29,y-7,58,14,'#d4b06c',2)}${r(x-27,y-6,54,4,'#ead09a',2)}${e(x-25,y,1.3,1.3,'#8a6a35')}${e(x+25,y,1.3,1.3,'#8a6a35')}<text x="${x}" y="${y+3.5}" text-anchor="middle" fill="#4d3a1a" font-size="9" letter-spacing="1.6" font-family="Georgia,serif" text-rendering="geometricPrecision">${text}</text></g>`;
const paperTag=(x,y,text)=>`<g class="object-sign">${glow(x-32,y-13,66,26)}${line(`M${x-21} ${y}Q${x-30} ${y-9} ${x-33} ${y-15}`,'#8c6d4a',1.2)}<path d="M${x-29} ${y}L${x-21} ${y-10}H${x+31}V${y+10}H${x-21}Z" fill="#ecd9b0" stroke="#b8996a" stroke-width="1" stroke-linejoin="round"/>${e(x-20,y,2,2,'#a98762')}${label(x+5,y+4,text)}</g>`;
let floor=`<defs><pattern id="boards" width="160" height="44" patternUnits="userSpaceOnUse">${r(0,0,160,44,'#dec8a4')}<path d="M0 0H160M0 44H160M80 0V22M0 22H160M0 22V44" stroke="#c5aa83" stroke-width="1"/><path d="M12 11H50M106 33H140" stroke="#d3b992" stroke-width="1.4"/></pattern><linearGradient id="windowSky" x2="0" y2="1"><stop stop-color="#547b89"/><stop offset="1" stop-color="#b1c7bb"/></linearGradient><filter id="groundShadow"><feGaussianBlur stdDeviation="9"/></filter><filter id="tightGlow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter><linearGradient id="sunBeam" x2=".3" y2="1"><stop stop-color="#fff1c6" stop-opacity=".22"/><stop offset="1" stop-color="#fff1c6" stop-opacity="0"/></linearGradient></defs>`;
floor+=r(105,106,830,580,'#090f1433',28,'filter="url(#groundShadow)"');
floor+=r(100,86,840,584,'#576e6c',15)+r(110,90,820,560,'#abc1b3',9)+r(120,185,800,465,'url(#boards)');
floor+=r(120,97,800,78,'#abc1b3')+r(120,172,800,13,'#e6e1c4')+r(120,185,800,6,'#a2a789')+r(110,100,10,550,'#d3d9bc')+r(920,100,10,550,'#c8d1b7')+r(110,650,820,14,'#b99d79')+r(110,650,820,5,'#ead7b4');
// Window and picture are part of the rear wall, never depth-sorted with floor objects.
floor+='<g id="room-window" class="room-discovery" data-extra="night" role="button" tabindex="0" aria-label="Change to nighttime" aria-pressed="false">'+r(500,103,170,69,'#627c77',6)+r(507,107,156,58,'url(#windowSky)',3)+e(625,126,10,10,'#f2e4b7','id="window-sun"')+`<path id="window-moon" d="M633 115A11 11 0 1 0 638 134A12 12 0 0 1 633 115Z" fill="#f2e4c0"/>`+line('M508 153 Q545 131 574 150 T663 146','#829b91',16)+r(581,105,7,63,'#e5e4cb')+r(495,167,180,8,'#f4e4bf',3)+'</g>';
floor+=r(211,111,58,49,'#536f68',3)+r(216,116,48,39,'#eee3c5')+`<path d="M219 149L233 128 246 143 257 133 261 150Z" fill="#7d9682"/>`+e(251,125,4,4,'#d3a15f');
floor+=r(724,117,100,25,'#d9debf',5)+`<text x="774" y="134" text-anchor="middle" font-size="11" letter-spacing="2" fill="#52685e" font-family="Arial">MATEO</text>`;
floor+=`<path d="M508 191L663 191 745 450 550 450Z" fill="url(#sunBeam)"/>`;
// All ground graphics are below every actor and object.
// The rug is a terminal window; its woven border spells the Konami code (main.js listens for it).
const mono=(x,y,text,fill,size=13,extra='')=>`<text x="${x}" y="${y}" font-size="${size}" font-family="Consolas,'Courier New',monospace" fill="${fill}" ${extra}>${text}</text>`;
floor+=r(405,405,273,206,'#b2a07a',24)+r(410,405,263,200,'#33464a',18)+r(410,405,263,30,'#40565b',18)+r(410,421,263,14,'#40565b')+e(432,420,5,5,'#d98a7a')+e(448,420,5,5,'#e3c072')+e(464,420,5,5,'#8fbf8a')+mono(541,424,'mateo@room: ~','#a9bbb1',11,'text-anchor="middle"');
floor+=`<g class="rug-normal">${mono(430,464,'<tspan fill="#8fbf8a">$</tspan> whoami','#d8e6d2')}${mono(430,484,'mateo','#e3c99a')}${mono(430,512,'<tspan fill="#8fbf8a">$</tspan> cat goals.txt','#d8e6d2')}${mono(430,532,'ship cool stuff','#e3c99a')}${mono(430,560,'<tspan fill="#8fbf8a">$</tspan>','#d8e6d2')}${r(443,549,8,13,'#d8e6d2',1,'class="screen-cursor"')}</g>`;
floor+=`<g class="rug-cheat">${mono(430,464,'<tspan fill="#8fbf8a">$</tspan> sudo ./konami','#d8e6d2')}${mono(430,484,'access granted','#8fbf8a')}${mono(430,512,'<tspan fill="#8fbf8a">$</tspan> lives','#d8e6d2')}${mono(430,532,'+30','#e3c99a')}${mono(430,560,'<tspan fill="#8fbf8a">$</tspan> deal --with-it','#d8e6d2')}</g>`;
floor+=mono(541,594,'↑ ↑ ↓ ↓ ← → ← → B A','#7c9496',10,'text-anchor="middle" letter-spacing="2"');
for(let x=430;x<660;x+=11)floor+=line(`M${x} 402V395M${x} 607V614`,'#c6ccb0',3);
svg.innerHTML=floor+'<g id="destination"></g><g id="scene-objects"></g><g id="critters" pointer-events="none"></g><rect id="night-tint" x="100" y="86" width="840" height="584" rx="15" fill="#273c76" pointer-events="none"/><g id="night-light" pointer-events="none" transform="translate(315 320) scale(.82) translate(-315 -320)"></g>';
const art={};
// Desk faces the viewer: monitor at the back, keyboard in front, chair below.
art.desk=e(315,322,148,12,'#4f4c4030')+r(185,271,17,49,'#8e694b',4)+r(429,271,17,49,'#8e694b',4)+r(175,216,280,72,'#c59261',8)+r(175,205,280,72,'#ebc58e',8)+line('M188 263H441','#f4d8a6',2);
const screen=r(256,161,111,56,'#172b35',3)+`<g opacity=".9">${line('M266 173H295M275 181H330M275 189H314','#b8c8a1',3)}${line('M266 197H285M294 197H346M266 205H322','#8eb8bd',3)}</g>${r(325,203,4,4,'#f0d19b',1,'class="screen-cursor"')}`;
art.desk+=r(283,234,53,8,'#50626a',4)+r(303,208,12,29,'#4b6068',2)+r(249,155,125,71,'#344951',7)+screen;
art.desk+=r(260,244,105,20,'#b4c4b7',4)+line('M268 250H355M268 257H355','#7e9993',2)+r(382,239,22,30,'#d8b581',6)+e(393,250,5,8,'#576d6b')+e(218,243,15,4.5,'#d9cfb4')+e(218,242,10,2.5,'#c4b897')+`<path d="M227 226Q235 226 235 232Q235 238 227 238" fill="none" stroke="#eae3cf" stroke-width="3"/>`+`<path d="M208 223V238Q208 243 218 243Q228 243 228 238V223Z" fill="#eae3cf"/>`+r(208,229,20,4,'#8fa996')+e(218,223,10,3,'#f6f1e2')+e(218,223,8,2,'#6b4a35')+`<g class="steam">${line('M214 217Q211 212 214 207Q217 202 214 197','#fffaf0',1.6,'opacity=".55"')}${line('M222 216Q219 211 222 206','#fffaf0',1.6,'opacity=".45"')}</g>`;
art.desk+=sticky(319,279,'Projects');
const lamp=`<g id="desk-lamp" class="lamp-action" data-zone="lamp" role="button" tabindex="0" aria-label="Desk lamp" aria-pressed="false">${r(379,144,53,99,'transparent',8)}<ellipse class="lamp-glow" cx="400" cy="235" rx="46" ry="23" fill="#ffe6a3" opacity=".5" pointer-events="none"/>${line('M424 235V181L401 169','#69796a',5)}<path d="M387 160Q401 151 416 160L421 174H383Z" fill="#e4c57c"/><path class="lamp-glow" d="M386 174H418L444 250H360Z" fill="#ffe8b2" opacity=".25" pointer-events="none"/>${e(401,174,17,3,'#fff0bc','class="lamp-bulb"')}</g>`;
art.desk=`<g transform="translate(315 320) scale(.82) translate(-315 -320)"><g class="object-action" data-open="projects" role="button" tabindex="0" aria-label="Projects — sit at the desk">${art.desk}</g>${lamp}</g>`;
// Office chair viewed from behind, pointing up toward the desk.
art.chair=e(315,366,39,8,'#4f4c4030')+line('M315 337V359M288 365L315 358 342 365M315 358V368','#485b5b',5);
for(const x of [286,315,342])art.chair+=r(x-4,363,8,7,'#35484c',3);
art.chair+=r(287,315,56,25,'#829d94',10)+e(315,320,28,10,'#a6bbb0')+r(281,312,7,23,'#506865',3)+r(342,312,7,23,'#506865',3);
const chairBack=r(284,328,62,26,'#637f77',9)+r(290,332,50,16,'#8ba697',7)+line('M302 338H328','#a7bcaa',2);
// A front-facing bookshelf: one plane, one baseline, no conflicting perspectives.
art.shelf=e(802,296,70,10,'#4f4c4030')+r(740,151,125,144,'#9f7654',5)+r(749,160,107,123,'#715a47',2);
for(const y of [201,248,281])art.shelf+=r(746,y,113,9,'#d7ac77',2);
const bookColors=['#a3b69b','#c4a174','#729490','#d7c79b','#b4826e'];
for(let i=0;i<8;i++){const h=25+i%3*5;art.shelf+=r(754+i*12,201-h,9,h,bookColors[i%5],1)+r(756+i*12,201-h+6,5,2,'#e5ddbd');}
for(let i=0;i<5;i++)art.shelf+=r(756+i*13,218,10,30,bookColors[(i+2)%5],1);
art.shelf+=r(825,221,23,18,'#3b5359',3)+e(837,230,6,6,'#b4c4b5')+e(837,230,3,3,'#31494f')+r(756,265,30,6,'#96aa92',1)+r(760,259,31,6,'#d6ba87',1)+r(806,260,39,20,'#b8996f',4)+plate(802,285,'ABOUT');
// A low daybed, with its open edge toward the centre of the room.
art.bed=e(260,550,91,10,'#4f4c4030')+r(183,521,12,29,'#8d6d51',3)+r(328,521,12,29,'#8d6d51',3)+r(174,435,174,98,'#b7906d',9)+r(182,430,159,98,'#e0d8bb',12)+r(174,412,15,123,'#c6a27c',6)+r(185,437,38,79,'#eee5cb',9)+r(220,431,120,96,'#9fb6a5',9)+line('M232 438V516M241 438V516','#c6d0b1',3)+r(232,445,92,68,'none',5,'stroke="#bdcdb2" stroke-width="2"');
// Tall plant anchored to a footprint entirely inside the floor.
art.plant=e(852,421,32,9,'#4f4c4030')+`<path d="M825 387H879L871 420Q852 430 833 420Z" fill="#b88466"/>`+e(852,387,27,10,'#d7a281')+e(852,387,20,6,'#775b45');
for(let i=0;i<7;i++){let a=i*2.4,xx=852+Math.sin(a)*30,yy=351+Math.cos(a)*25;art.plant+=line(`M852 385Q850 360 ${xx} ${yy}`,'#557861',3)+e(xx,yy,12,23,i%2?'#7d9e75':'#a0b68b',`transform="rotate(${Math.sin(a)*40} ${xx} ${yy})"`);}
// Letter table faces down, matching the desk and shelf.
art.letter=e(805,571,63,10,'#4f4c4030')+r(757,531,12,39,'#90694c',3)+r(842,531,12,39,'#90694c',3)+r(750,492,110,53,'#b4875e',7)+r(750,480,110,53,'#e2bc87',7)+r(775,491,61,31,'#fff0c9',3,'transform="rotate(-6 805 506)"')+line('M779 493L804 510 832 488','#c5a77a',2)+e(765,495,8,8,'#829a7b')+paperTag(808,536,'Contact');
art.flowers=e(201,627,30,8,'#4f4c4030')+r(180,601,42,25,'#bf9672',7)+e(201,601,21,8,'#d1ad85');
for(let i=0;i<5;i++){let x=185+i*8,y=578+(i%2)*8;art.flowers+=line(`M201 604L${x} ${y}`,'#6f8a67',2)+e(x-4,y,5,5,'#ecd6a5')+e(x+4,y,5,5,'#ecd6a5')+e(x,y-4,5,5,'#f4dfad')+e(x,y+4,5,5,'#ead09d')+e(x,y,3,3,'#c29455');}
// Low stand with a CRT and console; the screen plays Snake.
art.tv=e(705,281,36,7,'#4f4c4030')+r(677,268,6,13,'#7d5f45',2)+r(727,268,6,13,'#7d5f45',2)+r(674,238,62,32,'#a77e5a',5)+r(674,234,62,8,'#c79a6c',3)+r(682,248,30,10,'#5d6b6c',3)+e(690,253,2,2,'#c96a5a')+r(716,246,12,16,'#8d6a4d',2)+line('M712 256Q716 266 722 262','#3f4c4d',1.5);
art.tv+=line('M705 196L692 176M705 196L718 172','#596b67',2)+e(705,197,6,3,'#596b67')+r(679,196,52,40,'#8b7f6b',8)+r(683,200,36,31,'#26382f',6,'class="tv-screen"')+r(689,214,10,3,'#9fd18b',1)+r(696,209,3,8,'#9fd18b',1)+r(707,221,3,3,'#e2a56b',1)+e(725,207,2.5,2.5,'#d8c9a5')+e(725,216,2.5,2.5,'#d8c9a5')+line('M722 224H728M722 228H728','#5f564a',1.5);
// Freestanding mini hoop with its weighted base on the floor.
art.hoop=e(150,421,26,6,'#4f4c4030')+r(132,404,36,16,'#4f5f5c',6)+r(147,334,6,74,'#6b7c78',2)+r(124,306,52,38,'#e8e5d2',4,'stroke="#748c80" stroke-width="3"')+r(140,320,20,16,'none',1,'stroke="#aa7f61" stroke-width="2"');
art.hoop+=line('M137 349L142 368H158L163 349M143 350L147 368M157 350L153 368M139 358H161','#eee4c6',1.5)+e(150,348,14,4,'none','stroke="#be8b64" stroke-width="3.5"')+e(162,413,7,7,'#d98f52','stroke="#9d684b" stroke-width="1"')+line('M155 413H169M162 406V420','#9d684b',1);
// Light sources are repainted above the night tint, so they glow brighter at night instead of dimming with the room.
// Each source keeps its own pool: a tight cool halo around the screen, a warm cone and spot below the lamp.
document.getElementById('night-light').innerHTML=`<g class="glow">${r(244,150,135,82,'#8fc4d6',18,'filter="url(#tightGlow)" opacity=".28"')}</g>${screen}<g class="lamp-light"><g class="glow"><path d="M388 175H414L430 246H372Z" fill="#ffe2a0" opacity=".3" filter="url(#tightGlow)"/>${e(401,248,34,12,'#ffd98a','filter="url(#tightGlow)" opacity=".55"')}</g>${e(401,174,17,3,'#fff6d2')}</g>`;
const layer=document.getElementById('scene-objects');
const items=RoomCore.objects.slice().sort((a,b)=>a.base-b.base).map(obj=>{
 const el=document.createElementNS(NS,'g');el.id='object-'+obj.id;el.dataset.baseline=obj.base;el.innerHTML=art[obj.id];
 if(obj.section&&obj.id!=='desk'){el.setAttribute('role','button');el.setAttribute('tabindex','0');el.setAttribute('aria-label',({projects:'Sit at the desk — Projects',about:'About Mateo — the shelf',contact:'Contact — the letter',bed:'Take a nap on the bed',snake:'Play Snake on the old TV',hoops:'Shoot some hoops',flowers:'Flower pot. Something rustles inside'})[obj.section]);if(['bed','snake','hoops','flowers'].includes(obj.section))el.dataset.extra=obj.section;else el.dataset.open=obj.section;el.classList.add('object-action');}
 layer.append(el);return {...obj,el};
});
// The backrest covers the seated hips; the head and shoulders stay above it.
const chairFront=document.createElementNS(NS,'g');chairFront.id='chair-backrest';chairFront.innerHTML=chairBack;chairFront.dataset.open='projects';chairFront.classList.add('object-action');
items.push({id:'chair-front',base:370.1,el:chairFront});items.sort((a,b)=>a.base-b.base);items.forEach(item=>layer.append(item.el));
const bedFront=document.createElementNS(NS,'g');bedFront.id='bed-front';bedFront.innerHTML=r(183,527,163,12,'#b7906d',4);bedFront.dataset.extra='bed';bedFront.classList.add('object-action');items.push({id:'bed-front',base:550.1,el:bedFront});items.sort((a,b)=>a.base-b.base);items.forEach(item=>layer.append(item.el));
const avatar=document.createElementNS(NS,'g');avatar.id='avatar';layer.append(avatar);
// Chibi avatar; feet sit on the origin, so y is the floor baseline.
// Each part is outlined in a darker tone of its own colour (soft lineart), never one hard black line.
const C={skin:'#f1c9a3',skinShade:'#dcaa83',hair:'#b48b57',hairShade:'#97723f',hairLight:'#dcb97c',top:'#7ea598',topShade:'#678e82',jeans:'#4a6170',jeansShade:'#3d5160',shoe:'#f0eadc',sole:'#c2b79f',ink:'#2b3437',blush:'#e8998a'};
const L={skin:'#cf9a75',hair:'#86613a',top:'#5d8175',topShade:'#527267',jeans:'#36495a',shoe:'#bfb399'};
const o=color=>`stroke="${color}" stroke-width=".9" stroke-linejoin="round"`;
const FRONT_HAIR='M-16 -62Q-18 -73 -6 -76.5Q6 -79.5 14.5 -71Q17.5 -67 16 -62Q14 -63.5 10 -64Q7.5 -60 3 -62Q0 -66.5 -4.5 -62Q-8 -66 -11.5 -61Q-13.5 -62.5 -16 -62Z';
let cool=false;
const shades=(x1,x2,w1=8,w2=8)=>cool?r(x1,-58.8,w1,5.4,'#1f2629',2.2)+r(x2,-58.8,w2,5.4,'#1f2629',2.2)+line(`M${x1+w1} -57.2H${x2}`,'#1f2629',1.2)+line(`M${x1+1.5} -57.5L${x1+3.5} -56.5M${x2+1.5} -57.5L${x2+3.5} -56.5`,'#ffffff',.8,'opacity=".5"'):'';
const shape=(d,fill,extra='')=>`<path d="${d}" fill="${fill}" ${extra}/>`;
const ear=x=>e(x,-58,2.8,3.8,C.skin,o(L.skin))+e(x,-58,1.2,2,C.skinShade);
const eye=(x,rx=2.2)=>e(x,-56,rx,2.8,C.ink)+e(x+.6,-57,.75,.85,'#fff');
const brow=x=>line(`M${x-2.5} -61.2Q${x} -62.8 ${x+2.5} -61.2`,C.hairShade,1.3);
const blush=x=>e(x,-52,2.6,1.4,C.blush,'opacity=".45"');
function character(facing,phase=0,moving=false,sitAmount=0){
 const up=facing.startsWith('up'),left=facing.includes('left'),right=facing.includes('right'),side=facing==='left'||facing==='right';
 const dir=left?-1:right?1:0,swing=moving?Math.sin(phase)*4:0,bob=moving?Math.abs(Math.sin(phase))*1.5:0,s=sitAmount;
 let g=s?'':e(0,0,17,6,'#314a4840');
 if(side){
  // Drawn facing right, mirrored for left. The far limbs are a shade darker.
  const leg=(fill,shift)=>`<g transform="translate(${shift} 0)">${r(-4,-22-s*4,8+s*12,9,fill,4,o(L.jeans))}${r(-3.5+s*11,-20+s*2,7.5,16-s*4,fill,3.5,o(L.jeans))}${r(-4.5+s*12,-7-s,12,7,C.shoe,3.5,o(L.shoe))}${line(`M${-3+s*12} -1.3H${6+s*12}`,C.sole,1.4)}</g>`;
  const arm=(fill,edge,rot)=>`<g transform="rotate(${rot} 0 -39)">${r(-3.2,-41,6.5,17,fill,3.2,o(edge))}${e(.1,-23.5,3,3.1,C.skin,o(L.skin))}</g>`;
  g+=`<g transform="scale(${dir} 1)">${leg(C.jeansShade,-swing)}${leg(C.jeans,swing)}<g transform="translate(0 ${-bob+s*7})">`;
  g+=arm(C.topShade,L.topShade,-swing*5)+shape('M-8 -42Q-10 -41 -9.8 -36L-9 -22Q-8.6 -19.5 -6 -19.5H6Q8.6 -19.5 9 -22L9.5 -36Q9.5 -42 4 -43Q-2 -44 -8 -42Z',C.top,o(L.top))+shape('M-9 -43Q-13 -40 -10.5 -33Q-7 -37 -4.5 -43Z',C.topShade,o(L.top))+line('M5 -41L6 -35','#eee6d0',1.1)+arm(C.top,L.top,swing*5);
  g+=r(-3.5,-48,7,6,C.skinShade,2)+shape('M13.5 -59.5Q17.2 -56 14 -53',C.skin,o(L.skin))+e(0,-60,14.5,15,C.skin,o(L.skin));
  g+=shape('M-15 -55Q-17.5 -72 -2 -76.5Q12 -78 15.5 -66Q16 -62 14 -61Q11 -65.5 7 -63Q4 -66.5 0 -63Q-3 -63 -4.5 -58Q-6 -53 -10 -49Q-14 -51 -15 -55Z',C.hair,o(L.hair))+line('M-6 -71Q2 -75 9 -71',C.hairLight,2.2);
  g+=ear(-2)+eye(8.5,2)+(cool?r(5,-58.8,7.5,5.4,'#1f2629',2.2)+line('M5 -57.2H-1','#1f2629',1.2):'')+line('M6 -62Q8.5 -63.6 11 -62',C.hairShade,1.3)+line('M8.5 -50.6Q10 -49.9 11 -50.8',C.ink,1.1)+blush(6.5);
  return g+'</g></g>';
 }
 // Front and back share legs; the lifted foot alternates with the stride.
 for(const k of [-1,1]){const lift=k*swing*.6,x=k<0?-9.5:2;g+=r(x,-23+lift-s*6,7.5,17-s*4,k<0?C.jeans:C.jeansShade,3.5,o(L.jeans))+r(x-1,-7+lift-s*8,9.5,7,C.shoe,3.5,o(L.shoe))+(up?'':line(`M${x} ${-1.4+lift-s*8}H${x+7.5}`,C.sole,1.4));}
 g+=`<g transform="translate(0 ${-bob+s*7})"><g transform="scale(${dir?.9:1} 1)">`;
 const arm=(x,a)=>r(x,-41+a,6.6,17,up?C.topShade:C.top,3.3,o(up?L.topShade:L.top))+e(x+3.3,-23.5+a,3,3.1,C.skin,o(L.skin));
 g+=shape('M-11 -42Q-13 -42 -13.5 -38L-12.5 -22Q-12 -19 -9 -19H9Q12 -19 12.5 -22L13.5 -38Q13 -42 11 -42Q0 -45 -11 -42Z',up?C.topShade:C.top,o(up?L.topShade:L.top));
 if(up)g+=shape('M-9.5 -42Q0 -46 9.5 -42Q8.5 -32 0 -31Q-8.5 -32 -9.5 -42Z',C.top,o(L.top))+line('M-5 -37Q0 -34 5 -37',C.topShade,1.1);
 else g+=shape('M8.5 -41Q12 -41 12.6 -37L12.2 -22Q11.8 -20 9.5 -20L9.8 -36Z',C.topShade)+shape('M-7 -31Q0 -32.5 7 -31L8 -23.5H-8Z',C.topShade,'opacity=".7"')+shape('M-8 -43Q0 -36 8 -43Q0 -40.5 -8 -43Z',C.topShade,o(L.top))+line('M-3 -39.5V-33.5M3 -39.5V-33.5','#eee6d0',1.1);
 g+=arm(-17.6,swing*.6)+arm(11,-swing*.6)+'</g>'+r(-3.5,-48,7,6,C.skinShade,2);
 if(up){
  // Back of the head; a diagonal turns the hair mass away and shows one ear.
  g+=`<g transform="translate(${-dir*1.5} 0)">${e(0,-61,16,15.5,C.hair,o(L.hair))}${shape('M-12.5 -52Q0 -43 12.5 -52Q10 -47 0 -46Q-10 -47 -12.5 -52Z',C.hairShade)}${line(`M${-6+dir*3} -70Q${1+dir*3} -74 ${6+dir*3} -69`,C.hairLight,2.2)}${line(`M${-1-dir*3} -66Q${2-dir*3} -67 ${2.5-dir*3} -64`,C.hairShade,1.2)}</g>`+(dir?ear(dir*15):ear(-15)+ear(15));
  return g+'</g>';
 }
 if(dir){
  // Three-quarter front, drawn facing right: a slight turn of the front view, so the face stays centred.
  g+=`<g transform="scale(${dir} 1)">${ear(-14.8)}${e(0,-60,15.5,15,C.skin,o(L.skin))}`;
  g+=shape('M-16 -62Q-18 -73 -5 -76.5Q8 -79.5 15 -70Q17.5 -66 15.8 -61Q13 -64.5 8.5 -65Q5 -61 1 -63Q-2 -66.5 -6 -62.5Q-9.5 -65 -12.5 -61Q-14 -62.5 -16 -62Z',C.hair,o(L.hair))+line('M-7 -72Q1 -76 9 -72',C.hairLight,2.2);
  g+=eye(-3.5)+eye(6.5,1.9)+shades(-7.5,2.8,8,7.2)+brow(-3.5)+brow(6.5)+blush(-8)+line('M-.5 -50.5Q2 -48.7 4.3 -50.6',C.ink,1.1);
  return g+'</g></g>';
 }
 g+=ear(-15)+ear(15)+e(0,-60,15.5,15,C.skin,o(L.skin));
 g+=shape(FRONT_HAIR,C.hair,o(L.hair))+line('M-8 -71.5Q0 -75.5 8 -71.5',C.hairLight,2.2);
 g+=eye(-5.5)+eye(5.5)+shades(-9.5,1.5)+brow(-5.5)+brow(5.5)+blush(-9.5)+blush(9.5)+line('M-2.5 -50.5Q0 -48.6 2.5 -50.5',C.ink,1.1);
 return g+'</g>';
}
// Asleep on the daybed: head on the pillow, body under the blanket, dreaming in code. Drawn in room coordinates.
function sleeper(){
 const puffs=[[300,391,50,24],[268,386,21,19],[296,370,25,19],[328,379,22,19]];
 const cloud=puffs.map(([x,y,rx,ry])=>e(x,y,rx,ry,'#fffaf0','stroke="#c9bfa5" stroke-width="3"')).join('')+puffs.map(([x,y,rx,ry])=>e(x,y,rx,ry,'#fffaf0')).join('');
 const dream=`<g class="dream">${e(230,447,2.6,2.6,'#fffaf0','stroke="#c9bfa5"')}${e(240,433,4,4,'#fffaf0','stroke="#c9bfa5"')}${e(253,419,5.5,5.5,'#fffaf0','stroke="#c9bfa5"')}${cloud}`
  +`<g class="dream-frame f1">${line('M276 378H302','#7fae8a',3.5)}${line('M286 388H326','#8eb8bd',3.5)}${line('M286 398H312','#d9a65f',3.5)}${r(316,393,3,8,'#2b3437',1,'class="screen-cursor"')}</g>`
  +`<g class="dream-frame f2"><text x="300" y="398" text-anchor="middle" font-size="24" font-family="Consolas,monospace" font-weight="700" fill="#5d8175">&lt;/&gt;</text></g>`
  +`<g class="dream-frame f3">${e(276,388,4,4,'#6fb07a')}<text x="306" y="393" text-anchor="middle" font-size="14" font-family="Consolas,monospace" font-weight="700" fill="#4f7d5a">200 OK</text></g></g>`;
 const zzz=`<g class="zzz">${['z','z','Z'].map((t,i)=>`<text x="${214+i*8}" y="${452-i*9}" font-size="${8+i*3}" font-family="Georgia,serif" font-style="italic" fill="#f6efdc" stroke="#7d8f86" stroke-width=".6">${t}</text>`).join('')}</g>`;
 const head=`<g transform="translate(266 477) rotate(-90)">${e(0,-60,15.5,15,C.skin,o(L.skin))}${shape(FRONT_HAIR,C.hair,o(L.hair))}${line('M-8 -71.5Q0 -75.5 8 -71.5',C.hairLight,2.2)}${line('M-8 -56Q-5.5 -53.8 -3 -56M3 -56Q5.5 -53.8 8 -56',C.ink,1.2)}${blush(-9.5)}${blush(9.5)}${e(0,-50,1.5,1.1,C.ink,'opacity=".7"')}</g>`;
 const blanket=`<g class="breathe">${e(283,481,52,25,'#a6bdac','stroke="#86a291" stroke-width="1"')}${line('M250 470Q283 462 318 472',"#c6d0b1",2)}</g>${r(219,449,18,64,'#e3e7cf',7,'stroke="#b9c4a6" stroke-width="1"')}${e(236,466,3.2,3.4,C.skin,o(L.skin))}`;
 return head+blanket+zzz+dream;
}
window.RoomScene={character,setCool(value){cool=value;},render(position,phase,moving,facing,sitAmount=0,inChair=false,seatKind='desk',sleeping=false){
 if(sleeping){avatar.setAttribute('transform','');avatar.dataset.facing=facing;avatar.dataset.seated='true';avatar.dataset.sleeping='true';if(!avatar.querySelector('.dream'))avatar.innerHTML=sleeper();layer.insertBefore(avatar,items.find(item=>item.base>550.05)?.el||null);return;}
 avatar.dataset.sleeping='false';
 avatar.setAttribute('transform',`translate(${position.x} ${position.y}) scale(1.1)`);avatar.dataset.facing=facing;avatar.dataset.seated=String(sitAmount===1);avatar.dataset.sitProgress=sitAmount.toFixed(2);avatar.dataset.x=position.x.toFixed(2);avatar.dataset.y=position.y.toFixed(2);avatar.innerHTML=character(facing,phase,moving,sitAmount);
 // An actor behind a footprint is painted behind its full object; never sort by its head.
 const next=items.find(item=>item.base>(inChair?(seatKind==='bed'?550.05:370.05):position.y));layer.insertBefore(avatar,next?.el||null);
},destination(p){document.getElementById('destination').innerHTML=p?e(p.x,p.y,10,5,'none','stroke="#f7ebcd" stroke-width="2"')+e(p.x,p.y,2,2,'#f7ebcd'):'';}};
})();
