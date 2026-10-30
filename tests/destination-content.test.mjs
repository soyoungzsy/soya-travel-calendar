import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {destinations} from '../src/data.mjs';
import {cityPOIs,resolveKnowledgeItem,variantsFor} from '../src/knowledge.mjs';
import {auditDestinationCoverage} from '../src/destination-coverage.mjs';

test('coverage distinguishes absent, short and season-only text from recorded background',()=>{
 const places=[{id:'empty',name:'A',country:'X'},{id:'season',name:'B',country:'X',description:'夏天适合看海',whyNow:'夏天适合看海'},{id:'profile',name:'B',country:'X',profile:{intro:'可以从街区、博物馆与具体人物的经历认识这座城市；空间和生活的关系，值得在出发前先了解，再去现场观察。',stories:[{title:'社区的历史',text:'有来源的背景内容'}]}}];
 const r=auditDestinationCoverage({places,points:[]});assert.equal(r.counts.destinations,2);assert.equal(r.counts.missingOverview,1);assert.equal(r.counts.reusesSeasonLead,1);assert.equal(r.counts.needsBackgroundReview,2);assert(!r.rows[2].needsOverviewReview);
});
test('Cape Town has a place definition, sourced stories and five distinct experiences with preserved saved IDs',()=>{
 const d=destinations.find(d=>d.id==='cape-town-summer');assert.match(d.profile.intro,/南非/);assert.match(d.profile.placeType,/城市/);assert.equal(d.profile.stories.length,3);assert(d.profile.sources.every(s=>s.accessLevel==='body-verified'&&s.accessedAt==='2026-10-30'&&s.url.startsWith('https://')));
 const p=cityPOIs(d.id,'2027-01-01','2027-01-07',{allSeasons:true});assert.equal(p.length,5);assert.equal(new Set(p.map(p=>p.id)).size,5);assert.match(resolveKnowledgeItem('poi:reference:cape-town-summer:1').peopleEvents,/18年/);assert(p.every(p=>p.whyGo.length>30&&p.experience.length>30));assert.equal(p.find(p=>p.id==='poi:reference:cape-town-summer:1').seasonality.mode,'year_round');
});
test('inline place details are not suppressed by the old global hide rule',()=>{
 const css=readFileSync(new URL('../src/usability.css',import.meta.url),'utf8');for(const rule of css.match(/[^{}]+\{[^{}]*\}/g)||[]){const [selector,declarations]=rule.split('{');if(selector.includes('.poi-inline')&&(selector.includes('.poi-heading')||selector.includes('.lead-copy')))assert(!/display\s*:\s*none/.test(declarations),'Inline title or introduction must remain visible');}
 assert.match(variantsFor({id:'nature',category:'nature',seasonality:{mode:'year_round'}})[0].seasonLabel,/自然/);
});
test('every distributed destination retains an overview and named, readable experience text',()=>{
 const r=auditDestinationCoverage();assert.equal(r.counts.destinationCards,79);assert.equal(r.counts.destinations,75);assert.equal(r.counts.missingOverview,0);assert.equal(r.counts.withoutPoints,0);assert.equal(r.counts.missingPointText,0);
});
