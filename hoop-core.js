(function(root){
  'use strict';
  // Side view. Rim is two solid points, the backboard a solid segment; the ball only scores by falling between them.
  const court={width:640,height:400,floor:370,gravity:980,radius:12,rimPoint:3,rimFront:538,rimBack:594,board:{x:600,above:72,below:14},hoopY:170,threePoint:300,dt:1/240};
  const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
  const finite=(...values)=>values.every(Number.isFinite);
  function launch(spot,angle,power){
    if(!finite(spot?.x,angle,power))throw new TypeError('A shot needs a finite spot, angle and power');
    const radians=clamp(angle,15,85)*Math.PI/180,speed=clamp(power,250,1000);
    return {x:spot.x,y:court.floor-75,vx:Math.cos(radians)*speed,vy:-Math.sin(radians)*speed,time:0,bounces:0,touched:false,made:false,done:false};
  }
  // Pushes the ball out of a solid point and reflects the normal part of its velocity.
  function bounce(b,px,py,reach,restitution){
    const dx=b.x-px,dy=b.y-py,d=Math.hypot(dx,dy);
    if(d>=reach||d===0)return false;
    const nx=dx/d,ny=dy/d,vn=b.vx*nx+b.vy*ny;
    b.x=px+nx*reach;b.y=py+ny*reach;
    if(vn<0){b.vx-=(1+restitution)*vn*nx;b.vy-=(1+restitution)*vn*ny;b.vx*=.92;}
    return true;
  }
  function step(ball,dt,hoopY=court.hoopY){
    if(!finite(dt,hoopY)||dt<=0||dt>1/60)throw new RangeError('Physics step must be between 0 and 1/60 seconds');
    if(ball.done)return ball;
    const b={...ball,vy:ball.vy+court.gravity*dt,time:ball.time+dt};
    b.x+=b.vx*dt;b.y+=b.vy*dt;
    const reach=court.radius+court.rimPoint;
    for(const x of [court.rimFront,court.rimBack])if(bounce(b,x,hoopY,reach,.5))b.touched=true;
    const by=clamp(b.y,hoopY-court.board.above,hoopY+court.board.below);
    if(bounce(b,court.board.x,by,court.radius+2,.6))b.touched=true;
    if(!b.made&&ball.y<hoopY&&b.y>=hoopY&&b.vy>0&&b.x>court.rimFront&&b.x<court.rimBack)b.made=true;
    if(b.y+court.radius>court.floor){b.y=court.floor-court.radius;if(b.vy>0){b.vy*=-.55;b.vx*=.8;b.bounces++;}}
    b.done=b.bounces>=2||b.made&&b.bounces>=1||b.time>6||b.x<-court.radius||b.x>court.width+court.radius;
    return b;
  }
  // Slingshot: drag away from the hoop, release to shoot opposite the drag.
  function drag(dx,dy){
    if(!finite(dx,dy))throw new TypeError('Drag must use finite coordinates');
    return {angle:clamp(Math.atan2(-dy,dx)*180/Math.PI,15,85),power:clamp(Math.hypot(dx,dy)*5.5,250,1000)};
  }
  const points=spot=>spot.x<court.threePoint?3:2;
  // Hoop starts moving once you score 10; it speeds up and travels further as the score climbs.
  const hoopY=(time,score)=>score<10?court.hoopY:court.hoopY+Math.sin(time*(1+Math.min(score-10,30)*.05))*Math.min(14+(score-10)*2,55);
  const api={court,launch,step,drag,points,hoopY};if(typeof module!=='undefined')module.exports=api;else root.HoopCore=api;
})(typeof window==='undefined'?globalThis:window);
