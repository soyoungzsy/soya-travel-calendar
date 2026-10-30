import {destinations} from './data.mjs';
import {poiRecords} from './knowledge.mjs';
import guides from './guide-catalog.mjs';
import {foodProfiles,readingPacks} from './travel-enrichment.mjs';

const bodyLevels=new Set(['body','body-verified']);
export function canonicalSourceURL(value){
 try{const u=new URL(value);if(!['https:','http:'].includes(u.protocol)||u.username||u.password)return null;u.hash='';return u.href;}catch{return null;}
}
export function compileKnowledgeSnapshot({destinationRecords=destinations,points=poiRecords,guideRecords=guides,foods=foodProfiles,readings=readingPacks}={}){
 const references=new Map(),countryRows=new Map();
 function country(name){if(!countryRows.has(name))countryRows.set(name,{name,destinations:new Set(),points:new Set(),detailed:new Set(),foods:new Set(),readings:new Set()});return countryRows.get(name);}
 function addSource(source,context){
  const url=canonicalSourceURL(source.url||source.sourceURL);if(!url)return;
  let r=references.get(url);if(!r){r={url,title:source.title||'参考资料',authority:source.authority||source.sourceAuthority||new URL(url).hostname,uses:[],categories:new Set(),countries:new Set(),levels:new Set(),dates:new Set()};references.set(url,r);}
  const level=source.accessLevel||'not-rechecked';r.levels.add(level);r.categories.add(context.category);r.countries.add(context.country);if(source.accessedAt)r.dates.add(source.accessedAt);if(source.book)r.book=source.book;
  if(!r.uses.some(u=>u.id===context.id&&u.category===context.category))r.uses.push({...context,accessLevel:level,checkedAt:source.accessedAt||null,publishedAt:source.publishedAt||null,note:source.caution||source.note||''});
  const authority=source.authority||source.sourceAuthority;if(authority&&!['既有参考资料','资料来源'].includes(authority))r.authority=authority;
  if(r.title==='目的地参考来源'&&source.title)r.title=source.title;
 }
 for(const d of destinationRecords){
  country(d.country).destinations.add(d.country+'|'+d.name);
  const context={id:d.id,name:d.name,country:d.country,category:'season'};
  addSource({url:d.sourceURL||d.seasonSource,title:d.seasonSourceTitle||d.name+' · 季节参考',authority:d.seasonAuthority,accessLevel:d.seasonSourceAccess||'not-rechecked',accessedAt:d.seasonSourceCheckedAt},context);
  for(const s of d.profile?.sources||[])addSource(s,{...context,category:'background'});
  for(const s of guideRecords[d.id]?.sources||[]){if(['fx','central-bank-api'].includes(s.type))continue;addSource(s,{...context,category:s.type==='traveler'?'traveler':'travel'});}
 }
 for(const p of points){
  const contentRegion=p.regionCode==='HK'?'中国·香港':p.country;const row=country(contentRegion);row.points.add(p.baseId||p.id);if(p.recordKind==='curated-poi')row.detailed.add(p.baseId||p.id);
  for(const s of p.sources||[])addSource(s,{id:p.baseId||p.id,name:p.name,country:contentRegion,category:p.category==='nature'?'nature':'culture'});
 }
 for(const p of foods)for(const f of p.foods){country(p.country).foods.add(f.id);for(const s of f.sources||[])addSource(s,{id:f.id,name:f.name,country:p.country,category:'food'});}
 for(const p of readings)for(const r of p.items){country(p.country).readings.add(r.id);addSource({url:r.sourceURL,title:r.title,sourceAuthority:r.sourceAuthority,accessLevel:r.accessLevel,accessedAt:r.accessedAt,book:r.type==='book'?{creator:r.creator,edition:r.edition,publishedAt:r.publishedAt,ISBN:r.ISBN}:null},{id:r.id,name:r.title,country:p.country,category:r.type==='book'?'book':'reading'});}
 const sourceList=[...references.values()].map(r=>({...r,categories:[...r.categories],countries:[...r.countries],levels:[...r.levels],dates:[...r.dates].sort(),hasBodyCheck:[...r.levels].some(l=>bodyLevels.has(l)),hasUnreviewedUses:r.uses.some(u=>!bodyLevels.has(u.accessLevel)&&u.accessLevel!=='catalogue-verified')})).sort((a,b)=>a.title.localeCompare(b.title,'zh-CN'));
 const countries=[...countryRows.values()].map(r=>({name:r.name,destinations:r.destinations.size,points:r.points.size,detailed:r.detailed.size,foods:r.foods.size,readings:r.readings.size})).sort((a,b)=>a.name.localeCompare(b.name,'zh-CN'));
 const readingItems=readings.flatMap(p=>p.items),dates=sourceList.flatMap(r=>r.dates).filter(d=>/^\d{4}-\d{2}-\d{2}$/.test(d));
 return {countries,sources:sourceList,counts:{countries:countries.length,destinations:new Set(destinationRecords.map(d=>d.country+'|'+d.name)).size,destinationCards:destinationRecords.length,points:new Set(points.map(p=>p.baseId||p.id)).size,detailed:new Set(points.filter(p=>p.recordKind==='curated-poi').map(p=>p.baseId||p.id)).size,foods:new Set(foods.flatMap(p=>p.foods.map(f=>f.id))).size,foodRegions:foods.length,readings:readingItems.length,articlesRead:readingItems.filter(r=>r.readStatus==='official-article-read').length,booksCatalogued:readingItems.filter(r=>r.type==='book'&&r.readStatus==='catalogue-only').length,references:sourceList.length,bodyCheckedReferences:sourceList.filter(r=>r.hasBodyCheck).length},latestCheckedAt:dates.sort().at(-1)||null};
}
export const knowledgeSnapshot=compileKnowledgeSnapshot();
export const referenceCategory={background:'目的地背景',season:'季节与自然窗口',travel:'旅行实用资料',traveler:'历史旅行者参考',nature:'自然景点',culture:'人文与历史',food:'地方风味',reading:'行前短文',book:'图书书目'};
export function referenceStatus(r){return r.hasBodyCheck?(r.hasUnreviewedUses?'部分用途已核正文':'已核正文'):r.levels.includes('catalogue-verified')?'已核书目／简介':r.levels.includes('search-excerpt')?'仅核搜索摘要':'待逐页复核';}
