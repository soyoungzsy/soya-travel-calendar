import mediaCatalog from '../src/media-catalog.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {unprojectLocation,centerForAnchor,projectLocation,tooltipPosition,avoidLabelCollisions} from '../src/globe-math.mjs';
import {geographicLabels,decodedBorderArcs} from '../src/cartography.mjs';
import {cnyToLocal} from '../src/live-data.mjs';
import {destinations} from '../src/data.mjs';
import {estimate,makeItinerary,getCandidates} from '../src/engine.mjs';
import {tripMinimum} from '../src/collections.mjs';
import {createDampedTicks} from '../src/globe-sound.mjs';
import worker from '../worker/index.js';
import {mapCityRepresentatives} from '../src/map-selection.mjs';

test('cursor anchored zoom preserves the geographic point across views and zoom directions',()=>{
 for(const center of [[105,28],[0,0],[179,45],[-100,-35]])for(const [x,y]of [[400,400],[490,330],[310,450]])for(const [from,to]of [[1,1.8],[1.5,1]]){
  const anchor=unprojectLocation(x,y,center,800,from);assert.ok(anchor);const next=centerForAnchor(anchor,x,y,800,to,center),p=projectLocation(anchor,next,800,to);assert.ok(Math.hypot(p.x-x,p.y-y)<1e-6);assert.ok(p.visible);
 }
 assert.equal(unprojectLocation(0,0,[105,28],800,1),null);
});
test('hover preview follows the pointer while staying within all four edges',()=>{
 const a=tooltipPosition(200,200,274,110,600),b=tooltipPosition(240,220,274,110,600);assert.notDeepEqual(a,b);
 for(const [x,y]of [[0,0],[600,0],[0,600],[600,600]]){const p=tooltipPosition(x,y,274,110,600);assert.ok(p.left>=8&&p.top>=8);assert.ok(p.left+274<=592&&p.top+110<=592);}
});
test('label placement retains priority and removes collisions instead of overlapping country names',()=>{
 const shown=avoidLabelCollisions([{id:'country',x:200,y:200,width:60,height:20,priority:900},{id:'city',x:205,y:202,width:40,height:20,priority:300},{id:'other',x:320,y:200,width:40,height:20,priority:300}],500);assert.ok(shown.has('country'));assert.ok(!shown.has('city'));assert.ok(shown.has('other'));
 assert.ok(geographicLabels.some(l=>l.nameZh==='中国'&&l.type==='country'));assert.equal(geographicLabels.filter(l=>l.type==='continent').length,7);assert.ok(decodedBorderArcs().every(a=>a.every(([x,y])=>Number.isFinite(x)&&Number.isFinite(y))));
});
test('Jiuzhaigou separates one or two park days, counts overnight stays, and has no five-day gate',()=>{
 const d=destinations.find(d=>d.id==='jiuzhaigou-lakes');assert.equal(d.minDays,3);assert.equal(tripMinimum([d]),3);assert.equal(estimate(d,3).nights,2);assert.equal(estimate(d,4).nights,3);
 const short=makeItinerary(d,'2027-10-24','2027-10-26','balanced','杭州'),slow=makeItinerary(d,'2027-10-24','2027-10-27','balanced','杭州');assert.equal(short.days.length,3);assert.equal(short.days.filter(d=>d.kind==='体验').length,1);assert.equal(slow.days.filter(d=>d.kind==='体验').length,2);assert.ok(short.days.some(d=>d.title.includes('一日精华')));assert.ok(slow.days.some(d=>d.title.includes('则查洼')));assert.ok(!short.stages.some(s=>/松潘|黄龙/.test(s.name)));assert.ok(getCandidates({start:'2027-10-24',end:'2027-10-26',budget:20000,scope:'domestic'}).some(d=>d.id==='jiuzhaigou-lakes'));
});
test('CNY-first currency conversion uses reciprocal rates and never fabricates a missing rate',()=>{
 assert.ok(Math.abs(cnyToLocal(100,.68)-147.058823529)<1e-6);assert.equal(cnyToLocal(100,.05),2000);assert.equal(cnyToLocal(100,0),null);assert.equal(cnyToLocal(100,undefined),null);assert.equal(cnyToLocal(-1,.68),null);
});
test('every destination has an audited licensed photo or an explicit removal record',()=>{
 const media=mediaCatalog;assert.equal(Object.keys(media.photos).length+Object.keys(media.photoExceptions).length,destinations.length);for(const d of destinations){const p=media.photos[d.id];if(!p){assert.ok(media.photoExceptions[d.id]?.reason,d.id);continue;}assert.ok(p.sourcePage&&p.licenseURL&&p.author,d.id);assert.ok(fs.existsSync(new URL('../public'+p.src,import.meta.url)));assert.ok(fs.existsSync(new URL('../public'+p.thumbnail,import.meta.url)));}
});
test('rotation audio stays silent and does not create an audio context before user activation',async()=>{
 const original=globalThis.AudioContext;let constructed=0;globalThis.AudioContext=class{constructor(){constructed++;this.state='running';}async resume(){}async close(){}};
 try{const ticks=createDampedTicks();ticks.move(20,.2);assert.equal(constructed,0);assert.equal(await ticks.enable(true),true);assert.equal(constructed,1);await ticks.enable(false);ticks.move(20,.2);ticks.close();}finally{if(original===undefined)delete globalThis.AudioContext;else globalThis.AudioContext=original;}
});
test('price-query status distinguishes developer activation from unverified provider access and leaks no key',async()=>{
 const request=new Request('https://example.test/api/travel-search/status');let r=await worker.fetch(request,{}),s=await r.json();assert.equal(s.status,'requires_developer_activation');assert.equal(s.liveInventoryConnected,false);
 r=await worker.fetch(request,{FLYAI_API_KEY:'fixture-not-a-real-key'});const raw=await r.text();assert.equal(JSON.parse(raw).status,'provider_verification_required');assert.ok(!raw.includes('fixture-not-a-real-key'));
});

test('a city with seasonal guide variants shows its matching or next upcoming season on the globe',()=>{
 const kyoto=destinations.filter(d=>d.name==='京都');assert.equal(mapCityRepresentatives(kyoto,{date:'2026-10-24'})[0].id,'kyoto-autumn');assert.equal(mapCityRepresentatives(kyoto,{date:'2027-03-24'})[0].id,'kyoto-spring');assert.equal(mapCityRepresentatives(kyoto,{date:'2026-10-24',selectedId:'kyoto-spring'})[0].id,'kyoto-spring');assert.equal(mapCityRepresentatives(kyoto,{date:'2026-10-24'}).length,1);
});

test('faster rotation produces more and stronger damped ticks within a bounded cadence',async()=>{
 const original=globalThis.AudioContext,contexts=[];
 globalThis.AudioContext=class{constructor(){this.state='running';this.currentTime=0;this.sampleRate=8000;this.destination={};this.starts=0;this.gains=[];contexts.push(this);}async resume(){}async close(){}createBuffer(c,n){return{getChannelData:()=>new Float32Array(n)};}createBufferSource(){return{connect(){},disconnect(){},start:()=>this.starts++};}createBiquadFilter(){return{frequency:{value:0},Q:{value:0},connect(){},disconnect(){}};}createGain(){const gain={gain:{value:0},connect(){},disconnect(){}};this.gains.push(gain);return gain;}};
 try{for(const step of [.3,3]){const player=createDampedTicks();await player.enable(true);const context=contexts.at(-1);for(let i=0;i<60;i++){context.currentTime+=1/60;player.move(step,step/(1000/60));}player.close();}const[slow,fast]=contexts;assert.ok(fast.starts>slow.starts*2);assert.ok(fast.starts<=22);assert.ok(fast.gains[0].gain.value>slow.gains[0].gain.value);}finally{if(original===undefined)delete globalThis.AudioContext;else globalThis.AudioContext=original;}
});
