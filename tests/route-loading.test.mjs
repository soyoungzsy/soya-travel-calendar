import test from 'node:test';
import assert from 'node:assert/strict';
import {createRouteLoader} from '../src/route-loading.mjs';

function pending(){let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});return{promise,resolve,reject};}
function clock(){let callback;return{setTimer(fn){callback=fn;return 1;},clearTimer(){callback=null;},expire(){const fn=callback;callback=null;fn?.();}};}
const settle=()=>new Promise(resolve=>setImmediate(resolve));

test('a slow chunk shows recovery controls but still recovers when its original request resolves',async()=>{
 const request=pending(),time=clock(),loader=createRouteLoader({encyclopedia:()=>request.promise},time);
 loader.load('encyclopedia');await settle();assert.equal(loader.snapshot().status,'loading');time.expire();assert.equal(loader.snapshot().status,'slow');
 const Page=()=>null;request.resolve(Page);await settle();assert.equal(loader.snapshot().status,'ready');assert.equal(loader.snapshot().Component,Page);loader.dispose();
});

test('a rejected loader stays failed without automatically repeating its request',async()=>{
 let attempts=0;const loader=createRouteLoader({home:async()=>{attempts++;throw new Error('chunk unavailable');}});
 loader.load('home');await settle();assert.equal(loader.snapshot().status,'error');assert.equal(attempts,1);
 await settle();assert.equal(attempts,1);assert.equal(loader.snapshot().status,'error');loader.dispose();
});

test('switching routes ignores stale chunks and a retry replaces only the pending attempt',async()=>{
 const old=pending(),next=pending(),latest=pending();let calls=0;const loader=createRouteLoader({home:()=>old.promise,encyclopedia:()=>++calls===1?next.promise:latest.promise});
 loader.load('home');await settle();loader.load('encyclopedia');await settle();loader.retry();await settle();
 old.resolve(()=>null);next.reject(new Error('stale'));await settle();assert.equal(loader.snapshot().status,'loading');assert.equal(loader.snapshot().route,'encyclopedia');
 const Page=()=>null;latest.resolve(Page);await settle();assert.equal(loader.snapshot().Component,Page);loader.dispose();
});

test('query navigation cannot reuse a ready page from a different query',async()=>{
 const Page=()=>null,loader=createRouteLoader({home:async()=>Page});loader.load('home','/');await settle();
 assert.equal(loader.snapshot().key,'/');loader.load('home','/?wishlist=1');assert.equal(loader.snapshot().Component,null);
 await settle();assert.equal(loader.snapshot().key,'/?wishlist=1');loader.retry();await settle();assert.equal(loader.snapshot().key,'/?wishlist=1');loader.dispose();
});
