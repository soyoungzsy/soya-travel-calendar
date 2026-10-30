import test from 'node:test';
import assert from 'node:assert/strict';
import {weekendExperiences,weekendCandidates,nextWeekend,weekendOrigins} from '../src/weekends.mjs';
import {encyclopedia} from '../src/encyclopedia.mjs';
import {resolveKnowledgeItem} from '../src/knowledge.mjs';
test('all weekend records have official evidence and share IDs with the encyclopedia',()=>{
 assert.equal(weekendExperiences.length,32);const ids=new Set();
 for(const p of weekendExperiences){assert(!ids.has(p.id));ids.add(p.id);assert.equal(p.country,'中国');assert(p.sources.some(s=>s.accessLevel==='body-verified'));assert.equal(resolveKnowledgeItem(p.id).name,p.name);assert(encyclopedia.countries.some(c=>c.cities.some(city=>city.points.some(point=>point.id===p.id))));assert.equal(p.weekend.doorToDoorHours,null);}
});
test('origin and one-day/two-day requirements do not turn remote islands into same-day trips',()=>{
 const one=weekendCandidates({origin:'杭州',start:'2026-10-31',days:1}),two=weekendCandidates({origin:'杭州',start:'2026-10-31',days:2});
 assert(one.some(p=>p.id==='poi:weekend:liangzhu-museum'));assert(!one.some(p=>p.weekend.type==='island'));assert(two.some(p=>p.id==='poi:weekend:zhujiajian'));
 assert.equal(weekendCandidates({origin:'未收录出发地',start:'2026-10-31',days:2}).length,0);assert.equal(weekendCandidates({origin:'杭州',start:'invalid',days:2}).length,0);assert.equal(weekendCandidates({origin:'杭州',start:'2026-10-31',days:3}).length,0);
 assert(one.every(p=>p.weekendPlan.nights===0));assert(two.every(p=>p.weekendPlan.nights===1));assert(two.every(p=>p.weekendPlan.doorToDoorHours===null));
});
test('specific museum closing days and the dated long-term exhibition override generic year-round assumptions',()=>{
 const monday=weekendCandidates({origin:'杭州',start:'2026-11-02',days:1}),tuesday=weekendCandidates({origin:'杭州',start:'2026-11-03',days:1});
 assert(!monday.some(p=>p.id==='poi:weekend:liangzhu-museum'));assert(monday.some(p=>p.id==='poi:weekend:tea-shuangfeng'));assert(!tuesday.some(p=>p.id==='poi:weekend:tea-shuangfeng'));assert(tuesday.some(p=>p.id==='poi:weekend:liangzhu-museum'));
 assert(weekendCandidates({origin:'杭州',start:'2028-03-01',days:1}).some(p=>p.id==='poi:weekend:silk-roads'));
 assert(!weekendCandidates({origin:'杭州',start:'2028-03-02',days:1}).some(p=>p.id==='poi:weekend:silk-roads'));
 assert.match(resolveKnowledgeItem('poi:weekend:silk-roads').seasonLabel,/2028-03-01/);
});
test('local experiences rank first and conditional transport can be excluded without fabricating ferry requirements',()=>{
 const all=weekendCandidates({origin:'上海',start:'2026-10-31',days:2});assert(all[0].weekendPlan.local);
 const simple=weekendCandidates({origin:'上海',start:'2026-10-31',days:2,includeConditional:false});assert(simple.every(p=>!p.weekend.conditionalTransport));assert(all.find(p=>p.id==='poi:weekend:chongming').placeKind==='estuary_island');assert(all.find(p=>p.id==='poi:weekend:zhujiajian').weekend.requiresFerry===false);
 assert.equal(nextWeekend('2026-10-29'),'2026-10-31');assert.equal(nextWeekend('2026-10-31'),'2026-10-31');
});

test('new departure cities, city islands and city-specific museum closures remain distinct',()=>{
 assert(weekendOrigins.includes('北京')&&weekendOrigins.includes('成都')&&weekendOrigins.includes('深圳')&&weekendOrigins.includes('宁波'));
 const island=weekendCandidates({origin:'青岛',start:'2026-10-31',days:1,type:'island'});assert(island.some(p=>p.id==='poi:weekend:xiaomaidao'));assert(island.every(p=>p.weekend.requiresFerry===false));
 const monday=weekendCandidates({origin:'北京',start:'2026-11-02',days:1}),tuesday=weekendCandidates({origin:'北京',start:'2026-11-03',days:1});assert(monday.some(p=>p.id==='poi:weekend:capital-museum'));assert(!tuesday.some(p=>p.id==='poi:weekend:capital-museum'));
 const chengdu=weekendCandidates({origin:'成都',start:'2026-11-02',days:1});assert(weekendCandidates({origin:'成都',start:'2026-10-31',days:1}).some(p=>p.id==='poi:weekend:chengdu-city-museum'));assert(!chengdu.some(p=>p.id==='poi:weekend:chengdu-city-museum'));
 assert(weekendCandidates({origin:'宁波',start:'2026-10-31',days:1,type:'nature'}).some(p=>p.name.includes('东钱湖')));
});
