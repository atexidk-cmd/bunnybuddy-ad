/* BunnyBuddy Android ad – one master async timeline driving the real index.html */
const Q=new URLSearchParams(location.search),REC=Q.has('record'),WIDE=Q.has('wide');
document.body.classList.toggle('record',REC);document.body.classList.toggle('wide',WIDE);
const $=s=>document.querySelector(s),stage=$('#stage'),cam=$('#cam'),phone=$('#phone'),screen=$('#screen'),frame=$('#app'),touch=$('#touch'),morph=$('#morph');
const W=WIDE?1920:1080,H=WIDE?1080:1920,REDUCED=matchMedia('(prefers-reduced-motion:reduce)').matches,SLOW=REDUCED?1.5:1;
const T={total:46000}; // approx. length for the progress bar
let paused=false,runId=0,t0=0,elapsed=0;
function fit(){const k=REC?Math.min(innerWidth/W,innerHeight/H):Math.min(innerWidth/W,innerHeight/H);stage.style.transform=`translate(${-W/2*k}px,${-H/2*k}px) scale(${k})`}
addEventListener('resize',fit);fit();
/* ---------- clock: pausable waits ---------- */
const wait=ms=>new Promise(r=>{let left=ms*SLOW,last=performance.now();(function f(n){if(runId!==cur)return r();if(!paused)left-=n-last;last=n;if(!paused)elapsed+=0;left<=0?r():requestAnimationFrame(f)})(last)});
let cur=0;
/* ---------- seed (must happen before iframe loads) ---------- */
function seed(){try{['bunnyPlannerProfile_v1','bunnyPlanner:v1','bunnyCare_v1','bunnyPlanner:partner'].forEach(k=>localStorage.removeItem(k));
 localStorage.setItem('bunnyPlanner:theme','bunnygreen');
 localStorage.setItem('bunnyPlannerProfile_v1',JSON.stringify({onboardingComplete:false,themeMode:'light'}))}catch(e){}}
/* ---------- app access ---------- */
const doc=()=>frame.contentDocument,win=()=>frame.contentWindow;
const find=s=>{try{return doc().querySelector(s)}catch(e){return null}};
const vis=e=>e&&e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden';
async function waitFor(s,ms=6000){const end=performance.now()+ms;while(performance.now()<end){const e=find(s);if(vis(e))return e;await wait(80)}return null}
function accent(){const r=doc()&&doc().documentElement.style;if(!r)return;const a=r.getPropertyValue('--accent'),d=r.getPropertyValue('--accent-dark');if(a){stage.style.setProperty('--acc',a);stage.style.setProperty('--acc2',a);stage.style.setProperty('--accd',d||a)}}
setInterval(()=>{try{accent()}catch(e){}},250);
/* ---------- camera / captions ---------- */
function camTo(x=0,y=0,z=1,ms=1400){cam.style.transitionDuration=ms*SLOW+'ms';cam.style.transform=`translate(${x}px,${y}px) scale(${z})`}
let capSide=0,capText='';
function caption(t){if(t===capText)return;capText=t;const a=$('#capA'),b=$('#capB'),n=capSide?b:a,o=capSide?a:b;capSide^=1;o.classList.remove('on');if(t){n.textContent=t;n.classList.add('on')}}
/* ---------- touch indicator ---------- */
function centerOf(el){const r=el.getBoundingClientRect(),f=frame.getBoundingClientRect(),k=f.width/412,s=stage.getBoundingClientRect(),sk=s.width/W;return[(f.left+r.left*k+r.width*k/2-s.left)/sk,(f.top+r.top*k+r.height*k/2-s.top)/sk]}
let tp=[W/2,H*.8];
async function tap(el,{click=true}={}){if(!el)return false;const[x,y]=centerOf(el),[sx,sy]=tp,mx=(sx+x)/2+(WIDE?60:120),my=(sy+y)/2-90;
 touch.style.opacity=1;const d=950*SLOW;
 await touch.animate([{transform:`translate(${sx}px,${sy}px) scale(1)`},{transform:`translate(${mx}px,${my}px) scale(1)`,offset:.5},{transform:`translate(${x}px,${y}px) scale(1)`}],{duration:d,easing:'cubic-bezier(.22,1,.36,1)',fill:'forwards'}).finished;
 tp=[x,y];await touch.animate([{transform:`translate(${x}px,${y}px) scale(1)`},{transform:`translate(${x}px,${y}px) scale(.7)`}],{duration:140,fill:'forwards'}).finished;
 if(click)try{el.click()}catch(e){}
 await touch.animate([{transform:`translate(${x}px,${y}px) scale(.7)`,opacity:1},{transform:`translate(${x}px,${y}px) scale(1.5)`,opacity:.1}],{duration:380,easing:'ease-out',fill:'forwards'}).finished;
 touch.getAnimations().forEach(a=>a.cancel());touch.style.transform=`translate(${x}px,${y}px)`;touch.style.opacity=.0;return true}
async function tapSel(s,o,ms=3000){const e=await waitFor(s,ms);if(!e){console.warn('[ad] not found:',s);return false}return tap(e,o)}
const navBtns=()=>[...(doc().querySelectorAll('#nav button'))];
async function nav(i){const b=navBtns()[i];if(b)await tap(b);else console.warn('[ad] nav',i)}
/* ---------- morphs ---------- */
function rel(el){const r=el.getBoundingClientRect(),s=screen.getBoundingClientRect(),k=s.width/412;return{x:(r.left-s.left)/k,y:(r.top-s.top)/k,w:r.width/k}}
async function iconToApp(){const i=rel($('#appIcon')),s=96;morph.style.cssText=`opacity:1;width:${i.w}px;height:${i.w}px;transform:translate(${i.x}px,${i.y}px)`;
 const sc=915/i.w,sx=412/i.w;
 const a=morph.animate([{transform:`translate(${i.x}px,${i.y}px) scale(1)`,borderRadius:'24%'},{transform:`translate(0px,0px) scale(${sx},${sc})`,borderRadius:'0%'}],{duration:900*SLOW,easing:'cubic-bezier(.22,1,.36,1)',fill:'forwards'});
 await wait(520);frame.classList.add('on');$('#launcher').style.opacity=0;await a.finished;
 await morph.animate([{opacity:1},{opacity:0}],{duration:450,fill:'forwards'}).finished;morph.style.opacity=0}
async function appToIcon(){const s=412,c=(s-96)/2;morph.style.cssText=`opacity:0;width:96px;height:96px;transform:translate(0,0)`;
 const a=morph.animate([{opacity:0,transform:`translate(0,0) scale(${412/96},${915/96})`,borderRadius:'0%'},{opacity:1,transform:`translate(0,0) scale(${412/96},${915/96})`,borderRadius:'0%',offset:.25},{opacity:1,transform:`translate(${c}px,${(915-96)/2}px) scale(1)`,borderRadius:'24%'}],{duration:1200*SLOW,easing:'cubic-bezier(.65,0,.35,1)',fill:'forwards'});
 await wait(250);frame.classList.remove('on');await a.finished}
/* ---------- the master timeline ---------- */
async function play(){const id=++cur;runId=id;t0=performance.now();caption('');seed();
 cam.style.opacity=1;$('#finale').classList.remove('on');phone.classList.remove('in');$('#launcher').style.opacity=1;frame.classList.remove('on');morph.style.opacity=0;touch.style.opacity=0;tp=[W/2,H*.8];camTo(0,0,1,10);
 frame.src='index.html?ad='+Date.now();
 await new Promise(r=>frame.addEventListener('load',r,{once:true}));
 await waitFor('[data-action="onb-next"]',20000);
 await wait(500);if(runId!==id)return;
 /* 1 Arrival */
 phone.classList.add('in');await wait(1900);camTo(0,0,1.04,3000);
 await tap($('#appIcon'),{click:false});caption('Meet BunnyBuddy');await iconToApp();
 await wait(2400);camTo(0,-10,1.06,2000);
 await tapSel('[data-action="onb-next"]');await wait(900);
 /* 2 Make it yours */
 caption('Make it yours');
 await tapSel('[data-action="onb-buddy"]');await wait(900);
 {const n=await waitFor('#onbName',3000);if(n){await tap(n,{click:false});n.value='Alex'}await wait(500)}
 await tapSel('[data-action="onb-name"]');await wait(900);
 for(const id of ['pink','purple','blue','bunnygreen']){await tapSel(`[data-action="onb-theme"][data-id="${id}"]`,{},1500);await wait(750)}
 await tapSel('[data-action="go-step"][data-s="goals"]');await wait(900);
 for(let i=0;i<9&&find('[data-action^="goals-"],[data-action="onb-skip-goals"]');i++){
  const fin=find('[data-action="goals-finish"]');if(vis(fin)){await tap(fin);break}
  const nx=[...doc().querySelectorAll('[data-action="goals-day-next"],[data-action="goals-cats-next"]')].find(e=>vis(e)&&!e.disabled);
  const pk=[...doc().querySelectorAll('[data-action^="goals-"]')].filter(e=>vis(e)&&!/next|custom|finish/.test(e.dataset.action))[i%2];
  if(pk&&(!nx||i%2===0))await tap(pk);await wait(500);if(nx&&vis(nx))await tap(nx);await wait(700)}
 await tapSel('[data-action="onb-skip-goals"]',{},600);await wait(900);
 await tapSel('[data-action="onb-avatar"]',{},1500);await wait(500);
 await tapSel('[data-action="go-step"][data-s="ready"]',{},1500);await wait(900);
 if(find('[data-action="go-step"][data-s="account"]'))await tapSel('[data-action="go-step"][data-s="account"]');await wait(700);
 await tapSel('[data-action="onb-finish"]',{},2500);await wait(1200);
 /* 3 Home */
 await waitFor('#nav button',10000);await wait(1000);
 caption('Your day, one glance');camTo(0,0,1.04,1800);await wait(1200);
 await wait(1800);
 /* 4 Planner */
 caption('Plan your day');await nav(1);await wait(1400);
 camTo(0,-60,1.12,1500);await tapSel('[data-action="tt-full"]',{},2500);await wait(1900);
 await tapSel('[data-action="tt-cell"]',{},1500);{const n=await waitFor('#ttn',2000);if(n){await tap(n,{click:false});n.value='Study';n.dispatchEvent(new Event('input',{bubbles:true}))}}await wait(600);await tapSel('[data-a="save"]',{},1500);await wait(1200);
 await tapSel('[data-action="tt-close"]',{},1500);camTo(0,10,1.1,1500);await wait(700);
 await tapSel('[data-action="toggle-routine"]',{},2000);await wait(1300);camTo(0,0,1.04,1500);
 /* 5 Care */
 caption('Care that sticks');await nav(2);await wait(1500);
 camTo(0,40,1.12,1500);await tapSel('[data-action="toggle-sc"],[data-action="toggle-routine"],[data-action="add-water"],.cup',{},2000);await wait(1600);
 /* 7 Progress (nav 3) */
 caption("See how far you've come");camTo(0,0,1.04,1500);await nav(3);await wait(3000);
 /* 8 Partner */
 caption('Better together');await nav(navBtns().length-1);await wait(1500);
 await tapSel('[data-action="p-cheer"]',{},2500);await wait(1600);
 /* 9 Finale */
 caption('');camTo(0,0,1,1400);await nav(0);await wait(1400);
 await appToIcon();caption('');
 phone.style.transition='transform 1.4s cubic-bezier(.5,0,.75,0)';camTo(WIDE?-520:0,WIDE?0:-300,.8,1600);
 cam.style.transition+=',opacity 1s ease';cam.style.opacity=0;await wait(700);phone.style.transition='';morph.style.opacity=0;$('#finale').classList.add('on');
 await wait(5500);
 if(runId===id&&!Q.has('noloop'))play()}
/* ---------- controls ---------- */
$('#pp').onclick=()=>{paused=!paused;$('#pp').textContent=paused?'▶':'❚❚';document.getAnimations().forEach(a=>paused?a.pause():a.play())};
$('#rs').onclick=()=>{paused=false;play()};
$('#seek').oninput=()=>{play()};
setInterval(()=>{if(!paused){elapsed=performance.now()-t0;$('#seek').value=Math.min(1000,elapsed/T.total*1000)}},200);
play();
