import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {feature} from 'topojson-client';
import {countries,allPOICards,heritageItems,installHeritageIndex,forCountry,searchCountries,cityPOIs,matchesPOISeason,resolveKnowledgeItem,activeEvents,getPOIPhoto,loadHeritageIndex} from '../src/knowledge.mjs';
import {decodedBorderArcs,geographicLabels} from '../src/cartography.mjs';
test('all 258 mapped units have unique searchable names, valid anchors and clickable label records, including microstates',()=>{
 assert.equal(countries.length,258);assert.equal(new Set(countries.map(c=>c.id)).size,258);
 for(const c of countries){assert.ok(c.nameZh&&c.nameEn);assert.ok(c.coord.length===2&&c.coord.every(Number.isFinite));assert.ok(Math.abs(c.coord[0])<=180&&Math.abs(c.coord[1])<=90);assert.ok(geographicLabels.some(l=>l.countryId===c.id));assert.ok(searchCountries(c.nameEn).some(x=>x.id===c.id));}
 for(const code of ['VA','MC','SM','NR','TV','KI','AD','SG'])assert.ok(countries.some(c=>c.iso2===code),code);
 const topology=JSON.parse(fs.readFileSync(new URL('../src/world.json',import.meta.url)));assert.equal(feature(topology,topology.objects.countries).features.length,258);assert.ok(decodedBorderArcs().length>4000);
});
test('unresolved republication terms leave the batch index disabled without fetching or distributing a snapshot',async()=>{
 assert.equal(fs.existsSync(new URL('../public/data/heritage-index.json',import.meta.url)),false);
 assert.equal(await loadHeritageIndex(),0);assert.equal(heritageItems.length,0);
 assert.throws(()=>installHeritageIndex({metadata:{provider:'UNESCO DataHub',license:'CC BY-SA 4.0'},items:[]}),/权限尚未确认/);
 assert.equal(resolveKnowledgeItem('wh:1334'),null);
});
test('perennial cultural experiences remain visible in winter and summer, independently from the city scenery season',()=>{
 for(const [a,b]of [['2027-01-01','2027-01-05'],['2027-07-01','2027-07-05']]){
  assert.ok(matchesPOISeason(resolveKnowledgeItem('poi:luxor-temple'),a,b));assert.ok(cityPOIs('luang-prabang-river',a,b).some(p=>p.id==='poi:wat-xieng-thong'));
  assert.ok(cityPOIs('hangzhou-west-lake',a,b).some(p=>p.id==='poi:hangzhou-china-tea-museum'));
 }
});
test('a single landscape has distinct spring and autumn cards and never recommends autumn flowers in spring',()=>{
 const spring=cityPOIs('hangzhou-west-lake','2027-03-20','2027-03-24'),autumn=cityPOIs('hangzhou-west-lake','2026-10-18','2026-10-21');
 assert.ok(spring.some(p=>p.id==='poi:hangzhou-sudi-causeway@spring'));assert.ok(!spring.some(p=>p.id.endsWith('@autumn')));assert.ok(!spring.some(p=>p.id.includes('osmanthus')));
 assert.ok(autumn.some(p=>p.id==='poi:hangzhou-sudi-causeway@autumn'));assert.ok(autumn.some(p=>p.id==='poi:hangzhou-botanical-osmanthus'));assert.ok(!autumn.some(p=>p.id.endsWith('@spring')));
 assert.notEqual(resolveKnowledgeItem('poi:hangzhou-sudi-causeway@spring').whyGo,resolveKnowledgeItem('poi:hangzhou-sudi-causeway@autumn').whyGo);
});
test('cross-year seasonal windows and fixed exhibition dates remain separate from perennial museum content',()=>{
 const falls=resolveKnowledgeItem('poi:kuang-si-falls');assert.ok(matchesPOISeason(falls,'2026-12-29','2027-01-03'));assert.ok(!matchesPOISeason(falls,'2027-08-01','2027-08-04'));
 const museum=resolveKnowledgeItem('poi:hangzhou-china-tea-museum');assert.equal(activeEvents(museum,'2026-11-29','2026-11-30').length,1);assert.equal(activeEvents(museum,'2026-12-01','2026-12-04').length,0);assert.ok(matchesPOISeason(museum,'2026-12-01','2026-12-04'));assert.ok(!museum.lookFor.some(s=>s.includes('2026')));
});
test('heritage inscription years never become construction dates or invented Chinese dynasties',()=>{
 const unverified={seasonality:{mode:'unknown'},inscribedYear:'1984'};assert.equal(matchesPOISeason(unverified,'2027-01-01','2027-01-05'),false);assert.equal(unverified.chronology,undefined);
 const luxor=resolveKnowledgeItem('poi:luxor-temple');assert.ok(luxor.chronology.every(p=>p.start<0&&p.end<0));assert.match(luxor.chinaParallel,/商代/);assert.ok(luxor.sources.every(s=>s.url.startsWith('https://')));
});
test('detailed culture records have evidence, concrete observation and accurate photo captions rather than generic image substitution',()=>{
 const rich=allPOICards.filter(p=>p.recordKind==='curated-poi'&&p.category==='culture');assert.ok(rich.length>=12);for(const p of rich){assert.ok(p.originalUse&&p.historySignificance&&p.sources.length>0);assert.ok(p.lookFor.length>=2);}
 const waterfall=getPOIPhoto(resolveKnowledgeItem('poi:kuang-si-falls'));assert.match(waterfall.caption,/叠瀑|下游/);assert.ok(fs.existsSync(new URL('../public'+waterfall.src,import.meta.url)));
 assert.equal(getPOIPhoto(resolveKnowledgeItem('poi:hangzhou-botanical-osmanthus')),null,'unconfirmed species photo must not represent a specific local garden');
 assert.equal(getPOIPhoto(resolveKnowledgeItem('poi:hangzhou-sudi-causeway@spring')),null,'lake hero is not a Sudi photo');
 for(const id of ['poi:forbidden-city','poi:valley-of-kings','poi:temple-of-heaven','poi:wat-xieng-thong']){const photo=getPOIPhoto(resolveKnowledgeItem(id));assert.ok(photo.subjectConfirmed);assert.ok(fs.existsSync(new URL('../public'+photo.src,import.meta.url)));}
});
