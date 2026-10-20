import test from 'node:test';
import assert from 'node:assert/strict';
import {knowledgeSnapshot,compileKnowledgeSnapshot,canonicalSourceURL,referenceStatus} from '../src/knowledge-audit.mjs';
import {destinations} from '../src/data.mjs';
import {poiRecords} from '../src/knowledge.mjs';
import {foodProfiles,readingPacks,foodFor,readingFor} from '../src/travel-enrichment.mjs';

test('library statistics count places and seasonal variants separately, with no private inputs',()=>{
 const base={country:'示例国家',name:'示例城市',seasonSource:'https://example.test/season'};
 const result=compileKnowledgeSnapshot({destinationRecords:[{...base,id:'spring'},{...base,id:'autumn'}],points:[{id:'p@spring',baseId:'p',country:base.country,recordKind:'curated-poi',sources:[]},{id:'p@autumn',baseId:'p',country:base.country,recordKind:'curated-poi',sources:[]}],guideRecords:{},foods:[],readings:[]});
 assert.equal(result.counts.countries,1);assert.equal(result.counts.destinations,1);assert.equal(result.counts.destinationCards,2);assert.equal(result.counts.points,1);assert.equal(result.counts.detailed,1);assert.equal(result.counts.references,1);
 assert.ok(!JSON.stringify(result).includes('passport'));
});
test('a source with a checked use and an unchecked use never upgrades every claim to verified',()=>{
 const result=compileKnowledgeSnapshot({destinationRecords:[{id:'a',name:'A',country:'Test',seasonSource:'https://example.test/doc#section'}],points:[{id:'p',name:'P',country:'Test',sources:[{url:'https://example.test/doc',title:'Official document',authority:'Example institution',accessLevel:'body-verified',accessedAt:'2026-10-18'}]}],guideRecords:{},foods:[],readings:[]});
 assert.equal(result.sources.length,1);assert.equal(result.sources[0].uses.length,2);assert.equal(referenceStatus(result.sources[0]),'部分用途已核正文');assert.equal(result.counts.bodyCheckedReferences,1);
 assert.equal(canonicalSourceURL('javascript:alert(1)'),null);assert.equal(canonicalSourceURL('https://user:secret@example.test/'),null);
});
test('food recommendations have precise destination mappings, valid evidence and separate editorial suggestions',()=>{
 assert.equal(foodProfiles.length,15);assert.equal(knowledgeSnapshot.counts.foods,31);
 const ids=new Set();for(const p of foodProfiles){assert.ok(p.destinationIds.length);for(const id of p.destinationIds)assert.ok(destinations.some(d=>d.id===id)||poiRecords.some(p=>p.parentId===id),id);for(const f of p.foods){assert.ok(!ids.has(f.id));ids.add(f.id);assert.ok(f.description&&f.experienceTip);assert.ok(f.sources.some(s=>s.accessLevel==='body-verified'));for(const s of f.sources){assert.ok(canonicalSourceURL(s.url));assert.ok(s.authority&&s.title&&s.accessedAt);}}}
 assert.notEqual(foodFor(destinations.find(d=>d.name==='成都')).regionKey,foodFor(destinations.find(d=>d.name==='九寨沟')).regionKey);
 for(const d of destinations.filter(d=>d.name==='京都'))assert.equal(foodFor(d).regionKey,'kyoto');
});
test('reading metadata distinguishes articles read from books whose catalogue alone was checked',()=>{
 const entries=readingPacks.flatMap(r=>r.items);assert.equal(entries.length,12);assert.equal(knowledgeSnapshot.counts.articlesRead,7);assert.equal(knowledgeSnapshot.counts.booksCatalogued,3);
 assert.equal(new Set(entries.map(r=>r.id)).size,entries.length);
 for(const r of entries){assert.ok(canonicalSourceURL(r.sourceURL));assert.ok(r.whyBeforeGo&&r.focusQuestions.length>=2);assert.ok(r.sourceAuthority&&r.accessedAt);if(r.type==='book'){assert.equal(r.readStatus,'catalogue-only');assert.equal(r.accessLevel,'catalogue-verified');assert.match(r.ISBN,/^\d{13}$/);}}
 for(const d of destinations.filter(d=>d.name==='京都'))assert.equal(readingFor(d).regionKey,'kyoto');
});
test('the public colophon is computed from the distributed content, not the map or an undistributed index',()=>{
 const c=knowledgeSnapshot.counts;
 assert.equal(c.countries,35);assert.equal(c.destinations,75);assert.equal(c.destinationCards,79);assert.equal(c.points,186);assert.equal(c.detailed,36);
 assert.equal(c.countries,knowledgeSnapshot.countries.length);assert.equal(c.references,knowledgeSnapshot.sources.length);
 assert.equal(knowledgeSnapshot.countries.reduce((n,r)=>n+r.points,0),c.points);
 for(const r of knowledgeSnapshot.sources){assert.ok(r.uses.length);assert.ok(r.countries.length);assert.ok(canonicalSourceURL(r.url));}
 assert.equal(knowledgeSnapshot.latestCheckedAt,'2026-10-20');
});

test('Quanzhou points retain saved IDs and Hong Kong regional content stays distinct from mainland',()=>{
 const kaiyuan=poiRecords.filter(p=>p.id==='poi:reference:quanzhou-heritage:0');assert.equal(kaiyuan.length,1);assert.equal(kaiyuan[0].recordKind,'curated-poi');assert.ok(kaiyuan[0].lookFor.length>=2);
 const hk=poiRecords.filter(p=>p.regionCode==='HK');assert.equal(hk.length,5);assert.ok(hk.every(p=>p.country==='中国'&&p.city==='香港'&&p.domestic===false));
 const programme=readingPacks.flatMap(p=>p.items).filter(r=>r.type==='documentary');assert.equal(programme.length,2);assert.ok(programme.every(r=>r.readStatus==='official-synopsis-read'));
});
