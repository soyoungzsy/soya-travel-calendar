import {ACTIONS,SCREENS,MODULES,moduleForScreen,deviceClass} from '../worker/analytics-contract.mjs';
import {PUBLIC_ENTITIES} from '../worker/analytics-entities.mjs';
const CHOICE='shanhe-analytics-choice-v1',VISITOR='shanhe-analytics-visitor-v1',SESSION='shanhe-analytics-session-v1';
let enabled=false,started=false,queue=[],sending=false,screen='home',entity='',visitor='',session='',seq=0,lastInput=Date.now(),lastTick=Date.now(),sessionActivity=0,consent='unknown',timer=null,visible=document.visibilityState==='visible',focused=document.hasFocus?.()!==false;
const pendingPerf=new Map();
let activeModule='other',moduleEntity='';
const isReport=()=>location.pathname==='/insights';
export const readConsent=()=>{if(location.protocol==='file:'||navigator.globalPrivacyControl===true)return'denied';try{return localStorage.getItem(CHOICE)||'unknown';}catch{return'denied';}};
function event(kind,extra={}){if(!enabled||isReport())return;ensureSession();queue.push({sessionId:session,id:crypto.randomUUID(),seq:seq++,at:Date.now(),kind,screen,entity:moduleEntity||entity,module:activeModule,...extra});if(queue.length>200)queue=queue.slice(-200);if(queue.length>=20)void flush();}
function ensureSession(){const now=Date.now();if(session&&now-sessionActivity<=1800000){sessionActivity=now;return;}session=crypto.randomUUID();seq=0;sessionActivity=now;try{sessionStorage.setItem(SESSION,JSON.stringify({id:session,last:now}));}catch{}}
function restoreIdentifiers(){const now=Date.now();try{let v=JSON.parse(localStorage.getItem(VISITOR)||'null');if(!v||now-v.created>90*86400000)v={id:crypto.randomUUID(),created:now};visitor=v.id;localStorage.setItem(VISITOR,JSON.stringify(v));const s=JSON.parse(sessionStorage.getItem(SESSION)||'null');if(s&&now-s.last<1800000){session=s.id;sessionActivity=s.last;}}catch{visitor=crypto.randomUUID();}ensureSession();}
export async function flush({leaving=false}={}){
 if(!enabled||sending||!queue.length)return;const batchSession=queue[0].sessionId,events=queue.filter(e=>e.sessionId===batchSession).slice(0,25).map(({sessionId,...event})=>event),body=JSON.stringify({v:1,visitor,session:batchSession,traffic:new URLSearchParams(location.search).get('analytics_test')==='1'?'test':'live',device:deviceClass(innerWidth),events});
 if(leaving&&navigator.sendBeacon){if(navigator.sendBeacon('/api/analytics/collect',new Blob([body],{type:'application/json'})))queue.splice(0,events.length);return;}
 sending=true;try{const r=await fetch('/api/analytics/collect',{method:'POST',headers:{'content-type':'application/json'},body,keepalive:true});if(r.ok)queue.splice(0,events.length);else if(r.status===400||r.status===403)queue.splice(0,events.length);}catch{}finally{sending=false;}
}
export function setAnalyticsScreen(next,id=''){
 const publicId=Object.hasOwn(PUBLIC_ENTITIES,id)?id:'';if(!Object.hasOwn(SCREENS,next))next='home';if(screen===next&&entity===publicId)return;tick();screen=next;entity=publicId;activeModule=moduleForScreen(next);moduleEntity='';event('view');
}
export function setAnalyticsModule(next,id=''){if(!Object.hasOwn(MODULES,next)||next==='unattributed')next='other';const publicId=Object.hasOwn(PUBLIC_ENTITIES,id)?id:'';if(activeModule===next&&moduleEntity===publicId)return;tick();activeModule=next;moduleEntity=publicId;}
function locateModule(target){const node=target?.closest?.('[data-analytics-module]');if(!node)return;if(target.closest?.('[data-analytics-private]')){setAnalyticsModule('profile');return;}setAnalyticsModule(node.dataset.analyticsModule,node.dataset.analyticsEntity||'');}
export function track(action,id=''){if(!Object.hasOwn(ACTIONS,action))return;event('click',{action,entity:Object.hasOwn(PUBLIC_ENTITIES,id)?id:'',...action.startsWith('globe_')?{module:'globe'}:{}});}
export function trackPerformance(action,value){if(!['globe_ready','page_ready'].includes(action))return;const record={action,value:Math.max(0,Math.min(120000,Math.round(value)))};if(!enabled){if(consent!=='denied')pendingPerf.set(action,record);return;}event('performance',record);}
function tick(){const now=Date.now(),delta=Math.min(15000,Math.max(0,Math.min(now,lastInput+60000)-lastTick));lastTick=now;if(enabled&&visible&&focused&&delta>0){event('heartbeat',{activeMs:delta});try{sessionStorage.setItem(SESSION,JSON.stringify({id:session,last:sessionActivity}));}catch{}}}
export function setConsent(value){
 tick();consent=value==='granted'?'granted':'denied';enabled=consent==='granted';try{localStorage.setItem(CHOICE,consent);}catch{}
 if(enabled&&!isReport()){restoreIdentifiers();lastInput=lastTick=Date.now();event('page');if(screen!=='home')event('view');for(const record of pendingPerf.values())event('performance',record);pendingPerf.clear();void flush();}else{queue=[];pendingPerf.clear();try{localStorage.removeItem(VISITOR);sessionStorage.removeItem(SESSION);}catch{}visitor=session='';}
 window.dispatchEvent(new Event('analytics-consent-change'));
}
export function openAnalyticsPrivacy(){window.dispatchEvent(new Event('analytics-privacy-open'));}
export function excludeThisBrowser(){setConsent('denied');}
export function startAnalytics(){
 if(started||isReport()||location.protocol==='file:')return;started=true;consent=readConsent();
 if(navigator.globalPrivacyControl===true)consent='denied';
 if(consent==='granted'){enabled=true;restoreIdentifiers();event('page');}
 for(const name of ['pointerdown','keydown','wheel','scroll','touchstart'])window.addEventListener(name,e=>{tick();locateModule(e.target);lastInput=Date.now();},{passive:true,capture:true});
 document.addEventListener('pointerover',e=>locateModule(e.target),{passive:true});
 document.addEventListener('focusin',e=>locateModule(e.target),{passive:true});
 document.addEventListener('visibilitychange',()=>{tick();visible=document.visibilityState==='visible';if(!visible)void flush({leaving:true});else{lastTick=Date.now();lastInput=Date.now();}});
 window.addEventListener('pagehide',()=>{tick();void flush({leaving:true});});
 window.addEventListener('blur',()=>{tick();focused=false;void flush();});
 window.addEventListener('focus',()=>{focused=true;lastTick=lastInput=Date.now();});
 window.addEventListener('error',()=>event('error',{action:'page_error'}));
 window.addEventListener('load',()=>trackPerformance('page_ready',performance.now()));
 // Only explicit semantic tags are read. Never collect button text, URLs or input values.
 document.addEventListener('click',e=>{locateModule(e.target);const target=e.target.closest?.('[data-track]');if(target&&!target.closest('[data-analytics-private]'))track(target.dataset.track,target.dataset.trackEntity||'');else if(e.target.closest?.('a[target="_blank"]')&&!e.target.closest('[data-analytics-private]'))track('reference');},true);
 timer=setInterval(()=>{tick();void flush();},15000);void flush();
}
