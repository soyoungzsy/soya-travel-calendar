import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {projectLocation,wheelZoom,unprojectLocation,centerForAnchor,tooltipPosition,avoidLabelCollisions,consumeMapGesture} from '../src/globe-math.mjs';
import {destinations,curatedDestinations} from '../src/data.mjs';
import {estimate,makeItinerary,addDays} from '../src/engine.mjs';
const guides=JSON.parse(fs.readFileSync(new URL('../src/travel-guides.json',import.meta.url)));
const media=JSON.parse(fs.readFileSync(new URL('../src/media.json',import.meta.url)));
test('destination pin stays at globe center from equator, Kyoto, poles and antimeridian',()=>{for(const coord of [[0,0],[135.77,35.01],[-179,80],[179,-70]]){const p=projectLocation(coord,coord,800,1.6);assert.ok(p.visible);assert.ok(Math.abs(p.x-400)<1e-8);assert.ok(Math.abs(p.y-400)<1e-8);}assert.equal(projectLocation([180,0],[0,0],800).visible,false);});
test('trackpad wheel and pinch zoom share bounds and invert naturally',()=>{assert.ok(wheelZoom(1,-60)>1);assert.ok(wheelZoom(1,60)<1);assert.ok(wheelZoom(1,-60,true)>wheelZoom(1,-60));assert.ok(wheelZoom(1,-100000)<1.15,'one large wheel event must not jump to the zoom bound');let z=1;for(let i=0;i<100;i++)z=wheelZoom(z,-100000);assert.equal(z,2.35);for(let i=0;i<100;i++)z=wheelZoom(z,100000);assert.equal(z,.72);assert.ok(Math.abs(wheelZoom(wheelZoom(1,50),-50)-1)<1e-10);});
test('all 13 destinations have practical guides and same-origin full-sized photography',()=>{for(const d of curatedDestinations){const g=guides[d.id],p=media.photos[d.id];assert.ok(g?.highlights.length>=3,d.id);assert.ok(g.beforeYouGo.length>=3);assert.ok(g.packing.length>=3);assert.ok(g.dayIdeas.length>=3);assert.ok(g.money.rateCNY>0);assert.equal(g.money.currency,g.stay.currency);assert.ok(g.sources.length);assert.ok(p.src.startsWith('/photos/'));assert.ok(fs.existsSync(new URL('../public'+p.src,import.meta.url)));assert.ok(p.licenseURL);assert.ok(p.sourcePage);assert.doesNotMatch(JSON.stringify(g),/用户已有|用户目前|用户只有|用户尚未|目前仅日/);}});
test('room-per-night cost uses the same two-person sharing basis as the guide',()=>{const d=destinations.find(d=>d.id==='kyoto-autumn'),g=guides[d.id],cost=estimate(d,10);assert.equal(cost.hotelPerPersonNight,Math.round((g.stay.roomLocal[0]+g.stay.roomLocal[1])/2*g.money.rateCNY/2));assert.equal(cost.total,cost.flight+cost.stay+cost.food+cost.local+cost.activities);});
test('Antarctic draft keeps a complete example cruise with travel and port buffers',()=>{const d=destinations.find(d=>d.id==='antarctica'),start='2027-01-01',plan=makeItinerary(d,start,addDays(start,19),'balanced','杭州');assert.equal(plan.days.length,20);assert.equal(plan.days.filter(x=>x.kind==='航次').length,11);assert.ok(plan.days.slice(0,5).some(x=>x.place==='乌斯怀亚'));assert.ok(plan.days.every(x=>x.morning&&x.afternoon&&x.evening));assert.match(plan.days.at(-1).title,/杭州/);});
test('Kyoto regional plan does not make a west-side visit a same-day east-side sprint',()=>{const d=destinations.find(d=>d.id==='kyoto-autumn'),plan=makeItinerary(d,'2027-11-12','2027-11-22','balanced','杭州');assert.ok(plan.stages.some(x=>x.name.includes('岚山')));assert.ok(plan.stages.some(x=>x.name==='宇治'));for(const day of plan.days.filter(x=>x.title.includes('岚山')))assert.doesNotMatch(day.morning+day.afternoon,/清水寺/);});

test('rectangular map projection and pointer anchoring use actual width and height',()=>{
 const viewport={width:1100,height:560},center=[105,28],point=[114,22];
 const c=projectLocation(center,center,viewport);assert.ok(Math.abs(c.x-550)<1e-8);assert.ok(Math.abs(c.y-280)<1e-8);
 const p=projectLocation(point,center,viewport,1.2),coord=unprojectLocation(p.x,p.y,center,viewport,1.2);assert.ok(Math.abs(coord[0]-point[0])<1e-8);assert.ok(Math.abs(coord[1]-point[1])<1e-8);
 const next=centerForAnchor(point,p.x,p.y,viewport,1.8,center),after=projectLocation(point,next,viewport,1.8);assert.ok(Math.abs(after.x-p.x)<1e-7);assert.ok(Math.abs(after.y-p.y)<1e-7);
 const tip=tooltipPosition(1090,550,240,160,viewport);assert.ok(tip.left+240<=1092);assert.ok(tip.top+160<=552);
 assert.equal(avoidLabelCollisions([{id:'outside',x:500,y:590,width:60,height:20,priority:1}],viewport).size,0);
});
test('map gestures are consumed even outside the sphere and at both zoom limits',()=>{
 for(const z of [.72,2.35])for(const delta of [-500,500])for(const ctrlKey of [true,false]){let prevented=false,stopped=false;consumeMapGesture({ctrlKey,deltaY:delta,preventDefault(){prevented=true},stopPropagation(){stopped=true}});assert.ok(prevented&&stopped);assert.ok(wheelZoom(z,delta,ctrlKey)>=.72);}
});
