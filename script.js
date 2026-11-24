(()=>{
"use strict";
/* Make it hers: change these words */
const CONFIG={name:'my beloved one',messages:['You make every day softer.','I\u2019m yours, always.','Thank you for being you.','Wherever you are is home.'],finale:'Forever yours.'};
document.getElementById('title').textContent='For '+CONFIG.name;
let msgI=0,noteT=0;
function say(t,big){const n=document.getElementById('note');n.textContent=t;n.classList.toggle('big',!!big);n.classList.add('show');clearTimeout(noteT);noteT=setTimeout(()=>n.classList.remove('show'),big?5200:3800)}
const $=id=>document.getElementById(id);
const cv=$('c'),ctx=cv.getContext('2d'),bpmEl=$('bpm'),meter=$('meter'),sndBtn=$('snd'),sl=$('sl'),hint=$('hint');
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const TAU=Math.PI*2,rnd=(a,b)=>a+Math.random()*(b-a),clamp=(v,a,b)=>v<a?a:v>b?b:v,env=(p,c,w)=>Math.exp(-Math.pow((p-c)/w,2));
let W=0,H=0,D=1,cx=0,cy=0,S=0;

/* Sprites: deep sapphire -> azure -> cyan -> ice -> blush -> rose -> magenta -> white-hot */
const RAMP=[[22,74,255],[40,140,255],[58,216,255],[212,243,255],[255,217,238],[255,122,176],[255,79,154],[255,255,255]];
const SPR=RAMP.map(c=>{const s=document.createElement('canvas');s.width=s.height=64;const g=s.getContext('2d'),r=g.createRadialGradient(32,32,0,32,32,32),f=a=>`rgba(${c[0]},${c[1]},${c[2]},${a})`;
r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.12,f(.95));r.addColorStop(.4,f(.26));r.addColorStop(1,f(0));g.fillStyle=r;g.fillRect(0,0,64,64);return s});

const HRT=(()=>{const s=document.createElement('canvas');s.width=s.height=64;const g=s.getContext('2d');g.translate(32,34);g.beginPath();
for(let i=0;i<=64;i++){const t=i/64*TAU,x=16*Math.pow(Math.sin(t),3)*1.3,y=-(13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t))*1.3;i?g.lineTo(x,y):g.moveTo(x,y)}
g.closePath();g.shadowColor='#ff7ab0';g.shadowBlur=8;g.fillStyle='#ffc2dc';g.fill();return s})();
/* A true 3D heart: implicit surface (x²+9/4y²+z²-1)³ - x²z³ - 9/80y²z³ = 0, sampled as shell + volume */
const hf=(x,y,z)=>{const a=x*x+2.25*y*y+z*z-1;return a*a*a-x*x*z*z*z-.1125*y*y*z*z*z};
const MAXN=innerWidth<700?1900:3200;
const hx=new Float32Array(MAXN),hy=new Float32Array(MAXN),hz=new Float32Array(MAXN),
dx=new Float32Array(MAXN),dy=new Float32Array(MAXN),dz=new Float32Array(MAXN),
vx=new Float32Array(MAXN),vy=new Float32Array(MAXN),vz=new Float32Array(MAXN),
sz=new Float32Array(MAXN),ph=new Float32Array(MAXN),al=new Float32Array(MAXN),col=new Uint8Array(MAXN);
let active=0;
(function build(){let i=0,g=0;
while(i<MAXN&&g++<900000){const x=rnd(-1.25,1.25),y=rnd(-.75,.75),z=rnd(-1.3,1.3);
if(hf(x,y,z)>0)continue;const shell=(i%10)<6;
if(shell){if(hf(x*.94,y*.94,z*.94)<=0)continue}else if(hf(x*.8,y*.8,z*.8)>0)continue;
hx[i]=x;hy[i]=z-.05;hz[i]=y*1.15;ph[i]=rnd(0,TAU);
if(shell){sz[i]=rnd(.7,1.5);al[i]=rnd(.55,1);col[i]=Math.random()<.3?3:2}
else{sz[i]=rnd(.5,1.2);al[i]=rnd(.22,.65);col[i]=Math.random()<.5?0:1}
i++}
active=i})();
const NMAX=active;
/* Hologram cage: closed contour lines (marching squares) of the same heart surface: horizontal layers plus vertical slices */
function contour(g,u0,u1,v0,v1,nu,nv){const du=(u1-u0)/nu,dv=(v1-v0)/nv,val=new Float32Array((nu+1)*(nv+1)),out=[];
for(let j=0;j<=nv;j++)for(let i=0;i<=nu;i++)val[j*(nu+1)+i]=Math.cbrt(g(u0+i*du,v0+j*dv));
for(let j=0;j<nv;j++)for(let i=0;i<nu;i++){const a=val[j*(nu+1)+i],b=val[j*(nu+1)+i+1],c=val[(j+1)*(nu+1)+i+1],d=val[(j+1)*(nu+1)+i],x0=u0+i*du,x1=x0+du,y0=v0+j*dv,y1=y0+dv,p=[];
const E=(s,t,ua,va,ub,vb)=>{if((s<0)!==(t<0)){const r=s/(s-t);p.push(ua+(ub-ua)*r,va+(vb-va)*r)}};
E(a,b,x0,y0,x1,y0);E(b,c,x1,y0,x1,y1);E(c,d,x1,y1,x0,y1);E(d,a,x0,y1,x0,y0);
if(p.length>=4)out.push(p[0],p[1],p[2],p[3]);if(p.length===8)out.push(p[4],p[5],p[6],p[7])}
return out}
let zLo=9,zHi=-9;for(let z=-1.5;z<=1.5;z+=.005){let hit=false;for(let x=-1.3;x<=1.3&&!hit;x+=.05)for(let y=-.75;y<=.75;y+=.05)if(hf(x,y,z)<=0){hit=true;break}if(hit){zLo=Math.min(zLo,z);zHi=Math.max(zHi,z)}}
const CAGE=(()=>{const o=[],N=22;
for(let k=0;k<N;k++){const z=zLo+(zHi-zLo)*(k+.5)/N,c=contour((x,y)=>hf(x,y,z),-1.3,1.3,-.75,.75,64,34);
for(let n=0;n<c.length;n+=4)o.push(c[n],z-.05,c[n+1]*1.15,c[n+2],z-.05,c[n+3]*1.15)}
for(const y of[-.5,-.27,0,.27,.5]){const c=contour((x,z)=>hf(x,y,z),-1.3,1.3,zLo-.05,zHi+.05,64,60);
for(let n=0;n<c.length;n+=4)o.push(c[n],c[n+1]-.05,y*1.15,c[n+2],c[n+3]-.05,y*1.15)}
return Float32Array.from(o)})();
/* Orbiting halo of light */
const HALO=Array.from({length:150},(_,i)=>({a:i/150*TAU+rnd(-.03,.03),r:rnd(.97,1.03),p:rnd(0,TAU),s:rnd(.6,1.3)}));
let shoot=null,shootT=rnd(3,6),idleT=1.5;

/* Ambient dust, embers, shockwaves, floor ripples */
const dust=Array.from({length:80},()=>({x:Math.random(),y:Math.random(),z:rnd(.25,1),p:rnd(0,TAU)}));
const embers=[],waves=[],ripples=[];

/* Audio: a layered, room-tinted heartbeat, a warm pad and a music-box melody. Created only after sound is switched on. */
let ac=null,master=null,wet=null,pad=null,chG=null,chO=null,noiseBuf=null,snd=false;
const PENTA=[440,494,554,659,740,880,988,1109,1319];
function wake(){
if(!ac){const A=window.AudioContext||window.webkitAudioContext;if(!A)return false;ac=new A();
master=ac.createGain();master.gain.value=.9;const comp=ac.createDynamicsCompressor();master.connect(comp);comp.connect(ac.destination);
wet=ac.createGain();wet.gain.value=.3;const dl=ac.createDelay(.5),fb=ac.createGain(),lp=ac.createBiquadFilter();dl.delayTime.value=.11;fb.gain.value=.38;lp.type='lowpass';lp.frequency.value=1500;
wet.connect(dl);dl.connect(lp);lp.connect(fb);fb.connect(dl);lp.connect(master);
noiseBuf=ac.createBuffer(1,Math.floor(ac.sampleRate*.5),ac.sampleRate);const nd=noiseBuf.getChannelData(0);for(let i=0;i<nd.length;i++)nd[i]=Math.random()*2-1;
pad=ac.createGain();pad.gain.value=0;const pf=ac.createBiquadFilter();pf.type='lowpass';pf.frequency.value=800;pad.connect(pf);pf.connect(master);pf.connect(wet);
[110,164.81,220,277.18].forEach((f,i)=>[-3,3].forEach(d=>{const o=ac.createOscillator(),g=ac.createGain();o.type='sine';o.frequency.value=f;o.detune.value=d*1.5;g.gain.value=.25/(1+i*.3);o.connect(g);g.connect(pad);o.start()}));
chG=ac.createGain();chG.gain.value=0;chO=ac.createOscillator();chO.type='sine';chO.frequency.value=180;chO.connect(chG);chG.connect(master);chG.connect(wet);chO.start()}
if(ac.state==='suspended')ac.resume();return true}
function tone(type,f0,f1,t,dur,gain,send){const o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.setValueAtTime(f0,t);if(f1!==f0)o.frequency.exponentialRampToValueAtTime(f1,t+dur);
g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(gain,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);g.connect(master);if(send)g.connect(wet);o.start(t);o.stop(t+dur+.03)}
/* chest-like thud: low-passed noise for the muscle, a falling sine for the body, a faint triangle so phone speakers can hear it */
function thud(t,gain,fc,f0,f1,dur){const s=ac.createBufferSource(),lp=ac.createBiquadFilter(),g=ac.createGain();s.buffer=noiseBuf;lp.type='lowpass';lp.frequency.value=fc;lp.Q.value=.9;
g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(gain,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+dur);s.connect(lp);lp.connect(g);g.connect(master);g.connect(wet);s.start(t);s.stop(t+dur+.02);
tone('sine',f0,f1,t,dur*1.2,gain*.7);tone('triangle',f0*2.2,f1*1.8,t,dur*.6,gain*.1)}
function beatSound(lub,c){if(!snd||!ac)return;const t=ac.currentTime,v=(1+c*.45)*(1+rnd(-.06,.06)),p=1+rnd(-.04,.04);
if(lub)thud(t,.55*v,170,64*p,38,.2);else thud(t,.34*v,230,76*p,46,.15)}
function chime(c){if(!snd||!ac)return;const t=ac.currentTime,n=3+Math.round(c*4),b=Math.floor(rnd(0,2));
thud(t,.7,120,70,34,.35);
for(let i=0;i<n;i++){const f=PENTA[Math.min(8,b+i)],u=t+.08+i*.11;tone('sine',f,f,u,1.7,.09,true);tone('sine',f*2.76,f*2.76,u,.7,.03,true);tone('sine',f*5.4,f*5.4,u,.25,.012,true)}
if(c>.85){tone('sine',110,110,t,2.8,.12,true);tone('sine',165,165,t,2.8,.08,true)}}
sndBtn.addEventListener('click',()=>{snd=!snd;if(snd&&!wake())snd=false;sndBtn.setAttribute('aria-pressed',snd);sl.textContent=snd?'Sound on':'Sound off';
if(ac){pad.gain.setTargetAtTime(snd?.09:0,ac.currentTime,snd?1.5:.4);if(!snd)chG.gain.setTargetAtTime(0,ac.currentTime,.1)}if(snd)beatSound(true,0)});

/* Interaction state */
const ptr={id:null,x:-9999,y:-9999,lx:0,ly:0,lt:0,down:false};
let holding=false,kb=false,drag=0,yaw=0,vyaw=0,pitOff=0,charge=0,flash=0,kick=0,bph=0,bpm=62,beat=0,tm=0,fired=false;

/* Backing store is always at least 1080 px on its short side (1920x1080 on a 16:9 screen) */
function resize(){D=clamp(Math.max(1080/Math.min(innerWidth,innerHeight),Math.min(window.devicePixelRatio||1,2)),1,3);W=innerWidth;H=innerHeight;cv.width=Math.round(W*D);cv.height=Math.round(H*D);ctx.setTransform(D,0,0,D,0,0);
S=Math.min(W*.36,H*.27,300);cx=W/2;cy=H*.43}
addEventListener('resize',resize);resize();

function fire(c){
const str=.45+c*1.4;waves.push({r:0,s:str});ripples.push({t:0,a:.5+c*.4});
kick=.6+c*.8;flash=Math.max(flash,.35+c*.65);
const n=RM?12:Math.round(30+c*150);
for(let i=0;i<n&&embers.length<520;i++){const a=rnd(0,TAU),v=rnd(.25,1)*S*(1.1+c*1.5);embers.push({x:cx+Math.cos(a)*S*.3*Math.random(),y:cy+Math.sin(a)*S*.3*Math.random(),vx:Math.cos(a)*v,vy:Math.sin(a)*v-S*.2,l:1,d:rnd(.7,1.8),r:rnd(1.6,4.2)*(S/220+.6),c:Math.random()<.55?3:(Math.random()<.5?2:5),h:Math.random()<.4})}
chime(c);say(c>.85?CONFIG.finale:CONFIG.messages[msgI++%CONFIG.messages.length],c>.85);if(!fired){fired=true;hint.classList.add('gone')}}

/* Pointer: hold = charge, release = shockwave, drag = turn, hover (mouse) = gently parts the particles */
cv.addEventListener('pointerdown',e=>{if(ptr.id!==null)return;e.preventDefault();try{cv.setPointerCapture(e.pointerId)}catch(_){}
ptr.id=e.pointerId;ptr.x=ptr.lx=e.clientX;ptr.y=ptr.ly=e.clientY;ptr.lt=e.timeStamp;ptr.down=true;drag=0;
holding=Math.hypot(e.clientX-cx,e.clientY-cy)<S*1.5;cv.focus({preventScroll:true})});
cv.addEventListener('pointermove',e=>{
if(e.pointerType==='mouse'||ptr.id===e.pointerId){ptr.x=e.clientX;ptr.y=e.clientY}
if(ptr.down&&ptr.id===e.pointerId){const mx=e.clientX-ptr.lx,my=e.clientY-ptr.ly,t=Math.max((e.timeStamp-ptr.lt)/1000,.008);
ptr.lx=e.clientX;ptr.ly=e.clientY;ptr.lt=e.timeStamp;drag+=Math.abs(mx)+Math.abs(my);
if(drag>14){holding=false;yaw+=mx*.009;vyaw+=(clamp(mx*.009/t,-9,9)-vyaw)*.5;pitOff=clamp(pitOff+my*.006,-.65,.65)}}});
function up(e,ok){if(e.pointerId!==ptr.id)return;ptr.id=null;ptr.down=false;if(e.pointerType!=='mouse')ptr.x=ptr.y=-9999;
if(holding&&ok)fire(charge);holding=false}
cv.addEventListener('pointerup',e=>up(e,true));cv.addEventListener('pointercancel',e=>up(e,false));
cv.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse'&&!ptr.down)ptr.x=ptr.y=-9999});
cv.addEventListener('contextmenu',e=>e.preventDefault());
cv.addEventListener('keydown',e=>{
if((e.code==='Space'||e.code==='Enter')&&!e.repeat){e.preventDefault();holding=true;kb=true;drag=0}
else if(e.code==='ArrowLeft'){e.preventDefault();vyaw-=1.2}else if(e.code==='ArrowRight'){e.preventDefault();vyaw+=1.2}
else if(e.code==='ArrowUp'){e.preventDefault();pitOff=clamp(pitOff-.15,-.65,.65)}else if(e.code==='ArrowDown'){e.preventDefault();pitOff=clamp(pitOff+.15,-.65,.65)}});
cv.addEventListener('keyup',e=>{if((e.code==='Space'||e.code==='Enter')&&kb){kb=false;if(holding)fire(charge);holding=false}});

/* Frame */
const FOV=3.4,K=16,C=5.5;
let last=performance.now(),fpsA=.016,hudT=0,lastBpm=0;
function frame(now){
requestAnimationFrame(frame);
const dt=Math.min((now-last)/1000,.05);last=now;if(dt<=0)return;tm+=dt;
fpsA+=(dt-fpsA)*.04;if(fpsA>.026&&active>900){active=Math.max(900,(active*.9)|0);fpsA=.018}
else if(fpsA<.0185&&active<NMAX&&(tm%4)<dt){active=Math.min(NMAX,active+60)}

charge=holding?Math.min(1,charge+dt/1.5):Math.max(0,charge-dt*2.2);
flash*=Math.exp(-dt*2.6);kick*=Math.exp(-dt*6);
const heat=Math.max(charge,flash);
if(ac&&snd){chG.gain.setTargetAtTime(charge*.04,ac.currentTime,.06);chO.frequency.setTargetAtTime(170+charge*430,ac.currentTime,.08)}
bpm+=((62+charge*80)-bpm)*Math.min(1,dt*3);
const pp=bph;bph+=dt*bpm/60;if(bph>=1)bph-=1;
if(bph<pp){beatSound(true,charge);if(ripples.length<8)ripples.push({t:0,a:.2})}else if(pp<.2&&bph>=.2)beatSound(false,charge);
beat=Math.max(env(bph>.6?bph-1:bph,0,.05),.65*env(bph,.2,.05))*(RM?.4:1);

if(ptr.down&&drag>14){/* dragging: yaw is driven by the pointer */}
else{yaw+=vyaw*dt;vyaw+=((RM?.05:.24)-vyaw)*Math.min(1,dt*.9);pitOff*=Math.exp(-dt*.45)}
const pit=(RM?0:.1*Math.sin(tm*.5))+pitOff;
const cs=Math.cos(yaw),sn=Math.sin(yaw),cp=Math.cos(pit),sp=Math.sin(pit);
const k=1+beat*.035+kick*.09-charge*.05;
const px=ptr.x,py=ptr.y,pOn=px>-999,pa=ptr.down?26:12,pR=S*.55,pR2=pR*pR;
const wl=waves.length,wd=S*.3;

ctx.clearRect(0,0,W,H);ctx.globalCompositeOperation='lighter';
const hi=(n)=>Math.min(7,n);

/* dust: slow drift with yaw parallax */
for(const d of dust){d.y-=dt*.012*d.z;if(d.y<0)d.y+=1;let x=((d.x*W+yaw*38*d.z)%W+W)%W;
ctx.globalAlpha=(.15+.35*d.z)*(.6+.4*Math.sin(tm*1.3+d.p));const s=2+d.z*3;ctx.drawImage(SPR[d.z>.7?2:1],x-s/2,d.y*H-s/2,s,s)}

if(!RM){shootT-=dt;if(shootT<=0&&!shoot){shootT=rnd(6,11);shoot={x:rnd(W*.4,W*1.05),y:rnd(-20,H*.2),vx:-W*.9,vy:H*.45,l:1}}
if(shoot){shoot.x+=shoot.vx*dt;shoot.y+=shoot.vy*dt;shoot.l-=dt*1.3;if(shoot.l<=0)shoot=null;else{const tx=shoot.x-shoot.vx*.14,ty=shoot.y-shoot.vy*.14,g=ctx.createLinearGradient(shoot.x,shoot.y,tx,ty);
g.addColorStop(0,`rgba(235,248,255,${shoot.l})`);g.addColorStop(1,'rgba(120,190,255,0)');ctx.globalAlpha=1;ctx.strokeStyle=g;ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(shoot.x,shoot.y);ctx.lineTo(tx,ty);ctx.stroke()}}}
/* floor: rings, glow, a sweeping highlight tied to the heart's rotation */
const fy=cy+S*1.38,rn=(rx,a,lw)=>{ctx.beginPath();ctx.ellipse(cx,fy,rx,rx*.17,0,0,TAU);ctx.strokeStyle=`rgba(70,160,255,${a})`;ctx.lineWidth=lw;ctx.stroke()};
ctx.globalAlpha=clamp(.24+beat*.12+heat*.22,0,.6);ctx.drawImage(SPR[hi(1+Math.round(heat*4))],cx-S*1.7,fy-S*.36,S*3.4,S*.72);
ctx.globalAlpha=1;rn(S*.55,.34+beat*.12,1.2);rn(S*.8,.22,1);rn(S*1.05,.12,1);
const a0=yaw*1.2;ctx.beginPath();ctx.ellipse(cx,fy,S*.8,S*.8*.17,0,a0,a0+1.1);ctx.strokeStyle='rgba(205,236,255,.75)';ctx.lineWidth=1.6;ctx.stroke();
ctx.beginPath();ctx.ellipse(cx,fy,S*.55,S*.55*.17,0,a0+3.14,a0+3.7);ctx.strokeStyle='rgba(150,215,255,.6)';ctx.stroke();
for(let i=ripples.length-1;i>=0;i--){const r=ripples[i];r.t+=dt*.9;if(r.t>=1){ripples.splice(i,1);continue}
const rx=S*(.5+r.t*1.7);ctx.beginPath();ctx.ellipse(cx,fy,rx,rx*.17,0,0,TAU);ctx.strokeStyle=`rgba(120,200,255,${r.a*(1-r.t)*(1-r.t)})`;ctx.lineWidth=1.3;ctx.stroke()}

/* core glow */
ctx.globalAlpha=clamp(.2+beat*.1+heat*.3,0,.7);const gs=S*(2.1+beat*.1+heat*.5);ctx.drawImage(SPR[hi(1+Math.round(heat*4))],cx-gs,cy-gs,gs*2,gs*2);

idleT-=dt;if(idleT<=0&&!RM){idleT=rnd(1.6,3.2);if(embers.length<520)embers.push({x:cx+rnd(-.6,.6)*S,y:cy-S*.1,vx:rnd(-12,12),vy:-S*rnd(.35,.6),l:1,d:rnd(3.2,4.6),r:rnd(1.4,2.4)*(S/220+.6),c:Math.random()<.5?5:3,h:Math.random()<.5,k:.5})}
/* hologram cage */
ctx.globalAlpha=1;ctx.lineWidth=.8;
{const pf=new Path2D(),pb=new Path2D();
for(let n=0;n<CAGE.length;n+=6){
const ax=CAGE[n],ay=CAGE[n+1],az=CAGE[n+2],bx=CAGE[n+3],by=CAGE[n+4],bz=CAGE[n+5];
const a1=ax*cs+az*sn,a2=-ax*sn+az*cs,b1=bx*cs+bz*sn,b2=-bx*sn+bz*cs;
const ya=ay*cp-a2*sp,za=ay*sp+a2*cp,yb=by*cp-b2*sp,zb=by*sp+b2*cp;
const pa2=FOV/(FOV-za*k),pb2=FOV/(FOV-zb*k);
const P=za+zb>0?pf:pb;
P.moveTo(cx+a1*k*S*pa2,cy-ya*k*S*pa2);P.lineTo(cx+b1*k*S*pb2,cy-yb*k*S*pb2)}
ctx.strokeStyle=`rgba(${(150+heat*105)|0},${(215-heat*90)|0},255,${.3+heat*.2+beat*.1})`;ctx.stroke(pf);
ctx.strokeStyle='rgba(70,150,255,.1)';ctx.stroke(pb)}
/* shockwaves advance */
for(let i=wl-1;i>=0;i--){const w=waves[i];w.r+=S*3.2*dt;if(w.r>S*2.4){waves.splice(i,1)}}

/* particles (additive, so no depth sort is needed) */
const unit=S*.017;
for(let i=0;i<active;i++){
const x=hx[i],y=hy[i],z=hz[i];
const x1=x*cs+z*sn,z1=-x*sn+z*cs,y2=y*cp-z1*sp,z2=y*sp+z1*cp;
const flt=RM?0:Math.sin(tm*1.1+ph[i])*.008;
const X=x1*k+dx[i],Y=y2*k+dy[i]+flt,Z=z2*k+dz[i];
const pers=FOV/(FOV-Z),sx=cx+X*S*pers,sy=cy-Y*S*pers;
let ax=0,ay=0,az=0;
if(pOn){const ex=sx-px,ey=sy-py,d2=ex*ex+ey*ey;if(d2<pR2&&d2>.5){const d=Math.sqrt(d2),f=(1-d/pR)**2*pa;ax+=ex/d*f;ay-=ey/d*f;az+=f*.35}}
for(let j=0;j<waves.length;j++){const w=waves[j],rx=sx-cx,ry=sy-cy,rd=Math.hypot(rx,ry)||1,df=Math.abs(rd-w.r);
if(df<wd){const f=(1-df/wd)**2*w.s*220*(1-w.r/(S*2.4));ax+=rx/rd*f;ay-=ry/rd*f;az+=(Math.random()-.5)*f*.5}}
if(charge>0){ax+=(Math.random()-.5)*charge*14;ay+=(Math.random()-.5)*charge*14}
vx[i]+=(ax-K*dx[i])*dt;vy[i]+=(ay-K*dy[i])*dt;vz[i]+=(az-K*dz[i])*dt;
const dm=Math.max(0,1-C*dt);vx[i]*=dm;vy[i]*=dm;vz[i]*=dm;dx[i]+=vx[i]*dt;dy[i]+=vy[i]*dt;dz[i]+=vz[i]*dt;

const depth=clamp((Z+1)/2,0,1),a=al[i]*(.35+.65*depth)*(.72+.28*Math.sin(tm*2.4+ph[i]))*(1+heat*.35);
if(a<.03)continue;
const dia=sz[i]*pers*unit*(1+heat*.3+beat*.12);
ctx.globalAlpha=a>1?1:a;
const sp0=SPR[hi(col[i]+((heat*4+.5)|0))];
ctx.drawImage(sp0,sx-dia,sy-dia,dia*2,dia*2)}

/* shockwave rings */
for(const w of waves){ctx.globalAlpha=1;ctx.beginPath();ctx.arc(cx,cy,w.r,0,TAU);ctx.strokeStyle=`rgba(160,215,255,${.3*(1-w.r/(S*2.4))})`;ctx.lineWidth=1.2;ctx.stroke()}

/* embers */
for(let i=embers.length-1;i>=0;i--){const e=embers[i];e.l-=dt/e.d;if(e.l<=0){embers.splice(i,1);continue}
const kk=1-(e.k||1.6)*dt;e.x+=e.vx*dt;e.y+=e.vy*dt;e.vx*=kk;e.vy=e.vy*kk-S*.08*dt;
ctx.globalAlpha=Math.min(1,e.l*1.4);const r=e.r*(.4+e.l*.8)*(e.h?2.8:2);ctx.drawImage(e.h?HRT:SPR[e.c],e.x-r,e.y-r,r*2,r*2)}

{const R=S*(1.5+heat*.15),an=tm*(.22+charge*.6),ct=Math.cos(-.3),st=Math.sin(-.3);
for(const h of HALO){const ang=h.a+an,ex=Math.cos(ang)*R*h.r,ey=Math.sin(ang)*R*h.r*.26,fr=Math.sin(ang)>0,x=cx+ex*ct-ey*st,y=cy+ex*st+ey*ct,
r=(1.6+h.s*2)*(fr?1.25:.85)*(S/200+.5);ctx.globalAlpha=(.25+.55*(fr?1:.35))*(.6+.4*Math.sin(tm*3+h.p));ctx.drawImage(SPR[fr?3:2],x-r,y-r,r*2,r*2)}}
ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';

/* HUD */
hudT+=dt;if(hudT>.1){hudT=0;const b=Math.round(bpm);if(b!==lastBpm){lastBpm=b;bpmEl.textContent=b}meter.style.transform=`scaleX(${charge.toFixed(3)})`}
}
requestAnimationFrame(t=>{last=t;frame(t)});
})();
