import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {webcrypto} from 'node:crypto';
import {ACTIONS,SCREENS,MODULES,moduleForScreen,deviceClass} from '../worker/analytics-contract.mjs';
function client(){let now=Date.now(),interval;const sent=[],listeners={},docListeners={},local=new Map(),tab=new Map(),storage=m=>({getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,v),removeItem:k=>m.delete(k)}),document={visibilityState:'visible',addEventListener:(n,f)=>docListeners[n]=f},window={addEventListener:(n,f)=>listeners[n]=f,dispatchEvent:()=>{}};class Clock extends Date{static now(){return now;}}const sandbox={ACTIONS,SCREENS,MODULES,moduleForScreen,deviceClass,PUBLIC_ENTITIES:{'luxor-nile-history':'卢克索'},Date:Clock,crypto:webcrypto,document,window,location:{pathname:'/',protocol:'https:',search:''},navigator:{},localStorage:storage(local),sessionStorage:storage(tab),innerWidth:1280,URLSearchParams,Blob,Event,setInterval:f=>interval=f,fetch:async(url,options)=>{sent.push({url,body:JSON.parse(options.body)});return{ok:true};},module:{exports:{}}};const text=readFileSync(new URL('../src/analytics.mjs',import.meta.url),'utf8').replace(/^import .*;\n/gm,'').replace(/export /g,'')+'\nmodule.exports={startAnalytics,setConsent,track,flush,setAnalyticsScreen,trackPerformance,setAnalyticsModule};';vm.runInNewContext(text,sandbox);return {...sandbox.module.exports,sent,local,tab,document,docListeners,listeners,advance:ms=>now+=ms,tick:()=>interval()};}
test('no consent creates no visitor identifier and sends no analytics',async()=>{const c=client();c.startAnalytics();c.track('search');c.advance(15000);c.tick();await c.flush();assert.equal(c.sent.length,0);assert.equal(c.local.size,0);});
test('allowlisted clicks exclude personal IDs; hidden and idle time do not accumulate',async()=>{const c=client();c.startAnalytics();c.setConsent('granted');await c.flush();c.track('save','personal-secret');c.advance(10000);c.tick();await c.flush();c.document.visibilityState='hidden';c.docListeners.visibilitychange();await c.flush();const before=c.sent.flatMap(x=>x.body.events).filter(x=>x.kind==='heartbeat').reduce((n,e)=>n+e.activeMs,0);c.advance(90000);c.tick();await c.flush();assert.equal(c.sent.flatMap(x=>x.body.events).filter(x=>x.kind==='heartbeat').reduce((n,e)=>n+e.activeMs,0),before);assert.ok(c.sent.every(x=>!JSON.stringify(x).includes('personal-secret')));});
test('old queued events keep their original session after inactivity; opting out clears identifiers',async()=>{const c=client();c.startAnalytics();c.setConsent('granted');await c.flush();c.track('search');c.advance(1801000);c.track('guide','luxor-nile-history');await c.flush();await c.flush();const search=c.sent.find(x=>x.body.events.some(e=>e.action==='search')),guide=c.sent.find(x=>x.body.events.some(e=>e.action==='guide'));assert.ok(search&&guide);assert.notEqual(search.body.session,guide.body.session);assert.ok(c.sent.every(x=>x.body.events.every(e=>!('sessionId' in e))));c.setConsent('denied');assert.equal([...c.local.keys()].filter(k=>k.includes('visitor')).length,0);const count=c.sent.length;c.track('search');await c.flush();assert.equal(c.sent.length,count);});
test('globe, destination card and knowledge time is exclusive across module switches',async()=>{
 const c=client();c.startAnalytics();c.setConsent('granted');await c.flush();
 c.setAnalyticsModule('globe');c.advance(5000);c.setAnalyticsModule('destination_card','luxor-nile-history');
 c.advance(7000);c.setAnalyticsModule('knowledge');c.advance(3000);c.tick();await c.flush();
 const events=c.sent.flatMap(x=>x.body.events),time={};for(const e of events.filter(e=>e.kind==='heartbeat'))time[e.module]=(time[e.module]||0)+e.activeMs;
 assert.deepEqual(time,{globe:5000,destination_card:7000,knowledge:3000});
 assert.equal(Object.values(time).reduce((a,b)=>a+b,0),15000);
 assert.equal(events.find(e=>e.module==='destination_card').entity,'luxor-nile-history');
 c.track('globe_zoom');await c.flush();assert.equal(c.sent.at(-1).body.events.at(-1).module,'globe');
});
test('idle expiry is not charged to a later interaction; private values never become module IDs',async()=>{
 const c=client();c.startAnalytics();c.setConsent('granted');await c.flush();c.setAnalyticsModule('globe');
 for(let i=0;i<5;i++){c.advance(15000);c.tick();await c.flush();}
 let time=c.sent.flatMap(x=>x.body.events).filter(e=>e.kind==='heartbeat').reduce((n,e)=>n+e.activeMs,0);assert.equal(time,60000);
 c.advance(90000);c.listeners.pointerdown({target:{closest:()=>null}});c.setAnalyticsModule('destination_card','private-secret');c.advance(5000);c.tick();await c.flush();
 time=c.sent.flatMap(x=>x.body.events).filter(e=>e.kind==='heartbeat').reduce((n,e)=>n+e.activeMs,0);assert.equal(time,65000);
 assert(!JSON.stringify(c.sent).includes('private-secret'));
 c.listeners.blur();c.advance(15000);c.tick();await c.flush();assert.equal(c.sent.flatMap(x=>x.body.events).filter(e=>e.kind==='heartbeat').reduce((n,e)=>n+e.activeMs,0),65000);
});
