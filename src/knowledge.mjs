import countries from './country-labels.json' with {type:'json'};
import indexMetadata from './knowledge-index-meta.json' with {type:'json'};
import detailed from './poi-catalog.json' with {type:'json'};
import pointPhotos from './poi-media.json' with {type:'json'};
import guides from './travel-guides.json' with {type:'json'};
import media from './media.json' with {type:'json'};
import {destinations} from './data.mjs';
import {DAY,parseDate,iso} from './engine.mjs';

export {countries};
export const heritageMetadata=indexMetadata;
const countryByCode=new Map(countries.filter(c=>c.iso2).map(c=>[c.iso2,c]));
export const categoryName={nature:'自然风光',culture:'人文风光',mixed:'自然与人文'};
export function countryName(code){return countryByCode.get(code)?.nameZh||code;}
function sourceFor(d){return d.sourceURL||d.seasonSource;}
function monthsFor(windows){const months=new Set();for(const [a,b]of windows||[]){let m=+a.slice(0,2),last=+b.slice(0,2);for(let i=0;i<12;i++){months.add(m);if(m===last)break;m=m%12+1;}}return[...months].sort((a,b)=>a-b);}
function nearName(a,b){return a===b||a.length>=3&&b.includes(a)||b.length>=3&&a.includes(b);}
const reference=[];
for(const d of destinations){
 const highlights=guides[d.id]?.highlights||d.highlights||[];
 for(const [i,h]of highlights.entries()){
  if(detailed.some(p=>p.parentId===d.id&&nearName(p.name.split(' · ')[0],h.name)))continue;
  const culture=h.kind==='culture',nature=h.kind==='nature';
  reference.push({id:`poi:reference:${d.id}:${i}`,parentId:d.id,country:d.country,name:h.name,category:culture?'culture':nature?'nature':'mixed',whyGo:h.experience,experience:h.experience,durationEstimate:h.timing||'游览时长待进一步核验',recordKind:'reference-poi',verification:'既有攻略摘记，尚未逐点复核',seasonality:{mode:culture?'year_round':'seasonal',months:monthsFor(d.windows),windows:culture?null:d.windows},momentPhoto:media.moments?.[d.id]?.[i]?[d.id,i]:null,sources:sourceFor(d)?[{title:'目的地参考来源',url:sourceFor(d),authority:'既有参考资料',accessLevel:'not-rechecked'}]:[]});
 }
}
export const poiRecords=[...detailed,...reference];
export function variantsFor(p){
 if(!p.variants?.length)return[{...p,baseId:p.id,seasonLabel:p.seasonality?.mode==='year_round'?'全年文化体验':p.seasonality?.mode==='conditional'?'择日体验 · 条件待核':p.seasonality?.months?.length?p.seasonality.months.map(m=>m+'月').join('、')+' · 时节参考':'时节待核'}];
 return p.variants.map(v=>({...p,...v,id:p.id+'@'+v.key,baseId:p.id,seasonality:{mode:'seasonal',months:v.months,windows:v.windows},variants:undefined}));
}
export const allPOICards=poiRecords.flatMap(variantsFor);
export const heritageItems=[];
const itemById=new Map(allPOICards.map(p=>[p.id,p]));
let indexPromise=null;
export function installHeritageIndex(data){
 if(!heritageMetadata.enabled||heritageMetadata.rightsStatus!=='cleared')throw new Error('批量索引再发布权限尚未确认');
 if(data?.metadata?.provider!=='UNESCO DataHub'||data.metadata.license!=='CC BY-SA 4.0'||!Array.isArray(data.items)||data.items.length<1000)throw new Error('官方地点索引格式或授权标记不符');
 const seen=new Set();
 const items=data.items.map(p=>{
  if(!/^wh:\d+$/.test(p.id)||seen.has(p.id)||typeof p.name!=='string'||p.name.length>600||!['nature','culture','mixed'].includes(p.category)||!Array.isArray(p.countryCodes)||p.countryCodes.some(c=>!/^[A-Z]{2}$/.test(c)))throw new Error('官方地点索引字段无效');
  seen.add(p.id);
  const coord=Array.isArray(p.coord)&&p.coord.length===2&&p.coord.every(Number.isFinite)&&Math.abs(p.coord[0])<=180&&Math.abs(p.coord[1])<=90?p.coord:null;
  return{id:p.id,name:p.name,nameEn:p.nameEn||p.name,category:p.category,countryCodes:p.countryCodes,country:p.countryCodes.map(countryName).join(' / ')||'国家关联待核',coord,inscribedYear:String(p.inscribedYear||''),sourceURL:'https://whc.unesco.org/en/list/'+p.id.slice(3)+'/',recordKind:'heritage-index',subtitle:'官方遗产索引 · 游览细节待补',season:'旅行时节待核',seasonality:{mode:'unknown'}};
 });
 for(const p of heritageItems)itemById.delete(p.id);
 heritageItems.splice(0,heritageItems.length,...items);
 for(const p of items)itemById.set(p.id,p);
 return items.length;
}
export function loadHeritageIndex(){
 if(!heritageMetadata.enabled||heritageMetadata.rightsStatus!=='cleared')return Promise.resolve(0);
 if(!indexPromise)indexPromise=(globalThis.__SHANHE_HERITAGE__?Promise.resolve(globalThis.__SHANHE_HERITAGE__):fetch('/data/heritage-index.json').then(r=>{if(!r.ok)throw new Error('官方地点索引暂时无法读取');return r.json();})).then(installHeritageIndex).catch(e=>{indexPromise=null;throw e;});
 return indexPromise;
}
export function resolveKnowledgeItem(id){return itemById.get(id)||null;}
export function dateRangeDays(start,end){const a=parseDate(start),b=parseDate(end);if(!Number.isFinite(a)||!Number.isFinite(b)||b<a||b-a>366*DAY)return[];return Array.from({length:Math.round((b-a)/DAY)+1},(_,i)=>iso(a+i*DAY));}
export function matchesPOISeason(p,start,end){
 const days=dateRangeDays(start,end);if(!days.length)return false;
 const s=p.seasonality||{mode:'unknown'};
 if(s.mode==='year_round'||s.mode==='conditional')return true;
 if(s.mode==='event')return !!s.start&&!!s.end&&start<=s.end&&end>=s.start;
 if(s.mode==='unknown')return false;
 if(s.windows?.length)return days.some(day=>s.windows.some(([a,b])=>{const md=day.slice(5);return a<=b?md>=a&&md<=b:md>=a||md<=b;}));
 return days.some(day=>s.months?.includes(+day.slice(5,7)));
}
export function cityPOIs(parentId,start,end,{allSeasons=false}={}){return allPOICards.filter(p=>p.parentId===parentId&&(allSeasons||matchesPOISeason(p,start,end))).sort((a,b)=>(a.recordKind==='reference-poi')-(b.recordKind==='reference-poi'));}
export function activeEvents(p,start,end){return(p.events||[]).filter(e=>start<=e.end&&end>=e.start);}
export function forCountry(country,start,end){
 if(!country)return{cities:[],points:[],heritage:[]};
 const cities=destinations.filter(d=>d.country===country.nameZh);
 const points=allPOICards.filter(p=>p.country===country.nameZh&&matchesPOISeason(p,start,end));
 const sites=heritageItems.filter(p=>country.iso2&&p.countryCodes.includes(country.iso2));
 return{cities,points,heritage:sites};
}
export function searchCountries(query=''){
 const q=query.trim().toLocaleLowerCase();
 return countries.filter(c=>!q||`${c.nameZh} ${c.nameEn} ${c.iso2||''}`.toLocaleLowerCase().includes(q)).sort((a,b)=>a.nameZh.localeCompare(b.nameZh,'zh-CN'));
}
export function getPOIPhoto(p){
 if(p.photoKey&&pointPhotos[p.photoKey])return pointPhotos[p.photoKey];
 if(p.photoDestination&&media.photos[p.photoDestination])return media.photos[p.photoDestination];
 if(p.momentPhoto)return media.moments?.[p.momentPhoto[0]]?.[p.momentPhoto[1]]||null;
 return null;
}
export function countryMapSites(country,start,end){return forCountry(country,start,end).heritage.filter(p=>p.coord&&p.coord.every(Number.isFinite)).slice(0,80).map(p=>({...p,name:p.name.length>13?p.name.slice(0,12)+'…':p.name,fullName:p.name,subtitle:categoryName[p.category]+' · 官方遗产索引',personal:false}));}
export const knowledgeStats={countries:countries.length,heritage:heritageMetadata.records,heritageCountries:heritageMetadata.countryCodes,detailedPOIs:detailed.length,pointCards:allPOICards.length};
